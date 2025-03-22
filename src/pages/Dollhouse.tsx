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
  const [messages, setMessages] = useState<MessageWithCharacter[]>([]);
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
      const updatedMessages = messageManager.addMessage(newMessage.character.id, newMessage.content);
      setRecentMessages(updatedMessages);
      
      // Update character activity
      activityManager.updateActivity(newMessage.character.id);
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

  // Helper function to render a character in the dollhouse
  const renderCharacter = (character: Character) => {
    const message = recentMessages[character.id || ''];
    
    // Debug output to check if messages are being associated with characters
    console.log(`Rendering character ${character.name} (${character.id})`, 
      message ? `with message: ${message.content}` : 'without message');
    
    return (
      <CharacterComponent 
        key={character.id}
        character={character}
        message={message}
      />
    );
  };

  // Helper function to render the message history
  const renderMessageHistory = () => {
    return (
      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto' as const, 
        padding: '8px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #808080',
        borderTop: '2px solid #FFFFFF',
        borderLeft: '2px solid #FFFFFF',
      }}>
        {messages.map(message => {
          const { body, hair, outfit } = message.character?.avatar_config || {};
          
          return (
            <div 
              key={message.id} 
              style={{
                display: 'flex' as const,
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: '#F0F0F0',
                border: '1px solid #808080',
                borderTop: '2px solid #FFFFFF',
                borderLeft: '2px solid #FFFFFF',
              }}
            >
              {/* Mini avatar */}
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #808080',
                borderTop: '1px solid #404040',
                borderLeft: '1px solid #404040',
                position: 'relative' as const,
                overflow: 'hidden' as const,
                marginRight: '8px'
              }}>
                {/* Simplified avatar for messages */}
                <div style={{ 
                  position: 'absolute' as const, 
                  top: '0', 
                  left: '0', 
                  width: '100%', 
                  height: '100%',
                  display: 'flex' as const,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  fontSize: '8px' as const,
                  color: '#000'
                }}>
                  {body}
                </div>
              </div>
              <div style={{ flex: '1' }}>
                <p style={win95.textBold}>
                  {message.character?.name}
                </p>
                <p style={win95.text}>{message.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
      
      {/* Characters in the room */}
      <div style={{ 
        position: 'absolute' as const,
        bottom: '40px',
        left: 0,
        right: 0,
        display: 'flex' as const, 
        flexWrap: 'wrap' as const, 
        justifyContent: 'center' as const,
        alignItems: 'flex-end' as const,
        padding: '0 20px'
      }}>
        {activeCharacters.length === 0 ? (
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
          }}>
            <p style={win95.text}>No characters have joined yet</p>
          </div>
        ) : (
          activeCharacters.map(renderCharacter)
        )}
      </div>
    </div>
  );
}
