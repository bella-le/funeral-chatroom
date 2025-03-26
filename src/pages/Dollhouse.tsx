import { useState, useEffect } from 'react';
import { type Character } from '../supabase';
import { win95 } from '../styles/win95';
import roomBackground from '../assets/dollhouse/room_15.gif';

// Import components and services
import CharacterComponent from '../components/dollhouse/Character';
import supabaseService, { MessageWithCharacter, DisplayMessage } from '../components/dollhouse/SupabaseService';
import ActivityManager from '../components/dollhouse/ActivityManager';
import MessageManager from '../components/dollhouse/MessageManager';

export default function Dollhouse() {
  // State management
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacters, setActiveCharacters] = useState<Character[]>([]);
  const [, setMessages] = useState<MessageWithCharacter[]>([]);
  const [recentMessages, setRecentMessages] = useState<{[key: string]: DisplayMessage}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize managers
  const [activityManager] = useState(new ActivityManager());
  const [messageManager] = useState(new MessageManager());
  
  // Effect to handle fading out messages
  useEffect(() => {
    const fadeInterval = setInterval(() => {
      // Use the message manager to update opacities
      const updatedMessages = messageManager.updateMessageOpacities();
      setRecentMessages(updatedMessages);
    }, 100); // Update every 100ms for smooth fading
    
    return () => clearInterval(fadeInterval);
  }, [messageManager]);

  // Effect to update active characters based on activity
  useEffect(() => {
    const active = activityManager.filterActiveCharacters(characters);
    setActiveCharacters(active);
    
    // Log characters that were filtered out
    const inactiveCount = characters.length - active.length;
    if (inactiveCount > 0) {
      console.log(`${inactiveCount} characters are inactive and not displayed`);
    }
  }, [characters, activityManager]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use the service to fetch data
        const { characters: charactersData, messages: messagesData } = await supabaseService.fetchInitialData();
        
        setCharacters(charactersData);
        setMessages(messagesData);
        
        // Initialize character activity from messages
        activityManager.initializeFromMessages(messagesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dollhouse data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activityManager]);
  
  // Set up real-time subscriptions
  useEffect(() => {
    // Handle new messages
    const handleNewMessage = (newMessage: MessageWithCharacter) => {
      // Add to messages list
      setMessages(prev => [newMessage, ...prev]);
      
      // Add to recent messages for display
      if (newMessage.character?.id) {
        const updatedMessages = messageManager.addMessage(newMessage.character.id, newMessage.content);
        setRecentMessages(updatedMessages);
      
        // Update character activity
        activityManager.updateActivity(newMessage.character.id);
      }
    };
    
    // Handle new characters
    const handleNewCharacter = (newCharacter: Character) => {
      setCharacters(prev => {
        // Check if character already exists to prevent duplicates
        const exists = prev.some(char => char.id === newCharacter.id);
        if (exists) return prev;
        return [newCharacter, ...prev];
      });
    };
    
    // Subscribe to messages and characters
    supabaseService.subscribeToMessages(handleNewMessage);
    supabaseService.subscribeToCharacters(handleNewCharacter);
    
    // Clean up subscriptions on unmount
    return () => {
      supabaseService.cleanup();
    };
  }, [messageManager, activityManager]);

  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(255,255,255,0.3)'
        }}>
          <p style={win95.text}>Loading the dollhouse...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: '#302f29',
      backgroundImage: `url(${roomBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative' as const
    }}>
      {/* Error message */}
      {error && (
        <div style={{
          position: 'absolute' as const,
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          ...win95.errorMessage,
          boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}>
          {error}
        </div>
      )}
      
      {/* Characters scattered across the room */}
      <div style={{ 
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '0 20px'
      }}>
        {activeCharacters.length === 0 ? (
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
          }}>
            <p style={win95.text}>No characters have joined yet</p>
          </div>
        ) : (
          activeCharacters.map((character, index) => {
            // Generate a unique but consistent position for each character
            // Use character ID or index to ensure consistency
            const seed = character.id ? character.id.charCodeAt(0) + index : index;
            const randomLeft = `${5 + (seed * 13 + index * 17) % 85}%`;
            const randomBottom = `${5 + (seed * 7 + index * 11) % 70}%`;
            const randomZIndex = 10 + ((seed + index * 5) % 90); // 10 to 99
            
            return (
              <div 
                key={character.id}
                style={{
                  position: 'absolute',
                  left: randomLeft,
                  bottom: randomBottom,
                  zIndex: randomZIndex
                }}
              >
                <CharacterComponent 
                  character={character}
                  message={recentMessages[character.id || '']}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
