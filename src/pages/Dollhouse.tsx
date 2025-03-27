import { useState, useEffect, useRef } from 'react';
import { type Character } from '../supabase';
import { win95 } from '../styles/win95';

// Import all background images
import clubpenguin from '../assets/dollhouse/clubpenguin.png';
import dojo from '../assets/dollhouse/dojo.png';
import habbo from '../assets/dollhouse/habbo.png';
import pixieHollow from '../assets/dollhouse/pixie hollow.png';
import botQuotes from '../bot_quotes.json';

// Import character assets for bot generation
import { BODY_ASSETS, HAIR_ASSETS, OUTFIT_ASSETS } from '../assets/characterAssets';

// Import components and services
import CharacterComponent from '../components/dollhouse/Character';
import supabaseService, { MessageWithCharacter, DisplayMessage } from '../components/dollhouse/SupabaseService';
import ActivityManager from '../components/dollhouse/ActivityManager';
import MessageManager from '../components/dollhouse/MessageManager';

// Define bot character interface
interface BotCharacter {
  id: string;
  name: string;
  avatar_config: {
    body: string;
    hair: string;
    outfit: string;
  };
  position: {
    left: string;
    bottom: string;
    zIndex: number;
  };
}

export default function Dollhouse() {
  // Background image configuration
  const backgroundImages = [
    { src: clubpenguin, name: 'Club Penguin' },
    { src: dojo, name: 'Dojo' },
    { src: habbo, name: 'Habbo Hotel' },
    { src: pixieHollow, name: 'Pixie Hollow' }
  ];
  
  // State management
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacters, setActiveCharacters] = useState<Character[]>([]);
  const [, setMessages] = useState<MessageWithCharacter[]>([]);
  const [recentMessages, setRecentMessages] = useState<{[key: string]: DisplayMessage}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [botCharacters, setBotCharacters] = useState<BotCharacter[]>([]);
  
  // Refs for intervals
  const botSpawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botMessageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track which bots recently sent messages to avoid repeats
  const [recentlyActiveBotsRef] = useState<{current: Set<string>}>({current: new Set<string>()});
  
  // Initialize managers
  const [activityManager] = useState(new ActivityManager());
  const [messageManager] = useState(new MessageManager());
  
  // Helper function to generate random bot characters
  const generateRandomBot = () => {
    // Get random assets
    const bodyKeys = Object.keys(BODY_ASSETS);
    const hairKeys = Object.keys(HAIR_ASSETS);
    const outfitKeys = Object.keys(OUTFIT_ASSETS);
    
    const randomBody = bodyKeys[Math.floor(Math.random() * bodyKeys.length)];
    const randomHair = hairKeys[Math.floor(Math.random() * hairKeys.length)];
    const randomOutfit = outfitKeys[Math.floor(Math.random() * outfitKeys.length)];
    
    // Generate random position (scattered across the page)
    const randomLeft = `${Math.floor(Math.random() * 85) + 5}%`;
    const randomBottom = `${Math.floor(Math.random() * 70) + 5}%`;
    
    // Random z-index for layering (1 to 100)
    const randomZIndex = Math.floor(Math.random() * 100) + 1;
    
    // Generate bot name (FriendlyBot + random number)
    const botNumber = Math.floor(Math.random() * 10000);
    const botName = `coolguy${botNumber}`;
    
    // Simple random ID (timestamp + random number)
    const randomId = `friendly_bot_${Date.now()}_${botNumber}`;
    
    return {
      id: randomId,
      name: botName,
      avatar_config: {
        body: randomBody,
        hair: randomHair,
        outfit: randomOutfit
      },
      position: {
        left: randomLeft,
        bottom: randomBottom,
        zIndex: randomZIndex
      }
    };
  };
  
  // Helper function to get a random cute quote
  const getRandomCuteQuote = () => {
    const quotes = botQuotes.cuteQuotes;
    return quotes[Math.floor(Math.random() * quotes.length)];
  };
  
  // Effect to cycle backgrounds every 15 minutes
  useEffect(() => {
    // Set initial background randomly
    setCurrentBackgroundIndex(Math.floor(Math.random() * backgroundImages.length));
    
    // Set up interval to change background every 15 minutes
    const backgroundInterval = setInterval(() => {
      setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgroundImages.length);
      console.log(`Background changed to: ${backgroundImages[(currentBackgroundIndex + 1) % backgroundImages.length].name}`);
    }, 15 * 60 * 1000); // 15 minutes in milliseconds
    
    return () => clearInterval(backgroundInterval);
  }, [backgroundImages.length]);
  
  // Effect to spawn a bot every 10 minutes
  useEffect(() => {
    // Spawn first bot after 1 minute
    const initialBotTimer = setTimeout(() => {
      const newBot = generateRandomBot();
      setBotCharacters(prev => [...prev, newBot]);
      console.log(`Bot spawned: ${newBot.name}`);
    }, 60 * 1000); // 1 minute in milliseconds
    
    // Set up interval to spawn a bot every 10 minutes
    botSpawnIntervalRef.current = setInterval(() => {
      const newBot = generateRandomBot();
      setBotCharacters(prev => [...prev, newBot]);
      console.log(`Bot spawned: ${newBot.name}`);
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
    
    return () => {
      clearTimeout(initialBotTimer);
      if (botSpawnIntervalRef.current) clearInterval(botSpawnIntervalRef.current);
    };
  }, []);
  
  // Effect for bot messaging
  useEffect(() => {
    if (botCharacters.length === 0) return;
    
    // Set up interval for bots to send messages every 15 seconds
    botMessageIntervalRef.current = setInterval(() => {
      // Filter out bots that recently sent messages
      const availableBots = botCharacters.filter(bot => !recentlyActiveBotsRef.current.has(bot.id));
      
      // If all bots have recently sent messages, clear the tracking and use all bots
      if (availableBots.length === 0 && botCharacters.length > 0) {
        recentlyActiveBotsRef.current.clear();
      }
      
      // Select a random bot to send a message
      const availableBotsForMessage = availableBots.length > 0 ? availableBots : botCharacters;
      const randomIndex = Math.floor(Math.random() * availableBotsForMessage.length);
      const selectedBot = availableBotsForMessage[randomIndex];
      
      // Track this bot as recently active
      recentlyActiveBotsRef.current.add(selectedBot.id);
      
      // Add message for the selected bot
      const message = getRandomCuteQuote();
      const updatedMessages = messageManager.addMessage(selectedBot.id, message);
      setRecentMessages(updatedMessages);
      
      console.log(`Bot ${selectedBot.name} says: ${message}`);
      
      // Clear old entries from recently active bots after a cycle
      setTimeout(() => {
        recentlyActiveBotsRef.current.clear();
      }, 60 * 1000); // Clear after 1 minute
      
    }, 15 * 1000); // Send messages every 15 seconds
    
    return () => {
      if (botMessageIntervalRef.current) clearInterval(botMessageIntervalRef.current);
    };
  }, [botCharacters, messageManager]);
  
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
      backgroundImage: `url(${backgroundImages[currentBackgroundIndex].src})`,
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
        {activeCharacters.length === 0 && botCharacters.length === 0 ? (
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
          // Render real users
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
        
        {/* Bot characters */}
        {botCharacters.map((bot) => (
          <div 
            key={bot.id}
            style={{
              position: 'absolute',
              left: bot.position.left,
              bottom: bot.position.bottom,
              zIndex: bot.position.zIndex
            }}
          >
            <CharacterComponent 
              character={{
                id: bot.id,
                name: bot.name,
                avatar_config: bot.avatar_config,
                created_at: new Date().toISOString()
              }}
              message={recentMessages[bot.id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
