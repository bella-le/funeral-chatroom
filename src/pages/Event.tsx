import { useState, useEffect, useRef } from 'react';
import { win95 } from '../styles/win95';
import roomBackground from '../assets/dollhouse/clubpenguin.png';
import bsodImage from '../assets/bot_event/bsod.png';
import errorImage from '../assets/bot_event/error.png';
import botQuotes from '../bot_quotes.json';

// Import components
import CharacterComponent from '../components/dollhouse/Character';
import { OUTFIT_ASSETS, CATEGORIZED_BODY_ASSETS, CATEGORIZED_HAIR_ASSETS } from '../assets/characterAssets';

// Define types
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

interface BotMessage {
  characterId: string;
  content: string;
  opacity: number;
  timestamp: number;
}

interface ErrorPopup {
  id: string;
  left: string;
  top: string;
  scale: number;
  rotation: string;
  opacity: number;
  timestamp: number;
}

export default function Event() {
  // State management
  const [botCharacters, setBotCharacters] = useState<BotCharacter[]>([]);
  const [botMessages, setBotMessages] = useState<{[key: string]: BotMessage}>({});
  const [errorPopups, setErrorPopups] = useState<ErrorPopup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventStarted, setEventStarted] = useState(false);
  const [showBSOD, setShowBSOD] = useState(false);
  const [botCount, setBotCount] = useState(0);
  
  // Refs for intervals
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botSpawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const quoteIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorPopupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bsodTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventStartTime = useRef<number>(0); // Track when the event started
  
  // Helper function to generate random bot characters
  const generateRandomBot = () => {
    // Randomly choose a body type (regular or barbie)
    const bodyTypes = ['regular', 'barbie'];
    const randomBodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)] as 'regular' | 'barbie';
    
    // Get random assets from the appropriate category
    const bodyKeys = Object.keys(CATEGORIZED_BODY_ASSETS[randomBodyType]);
    const hairKeys = Object.keys(CATEGORIZED_HAIR_ASSETS[randomBodyType]);
    const outfitKeys = Object.keys(OUTFIT_ASSETS);
    
    const randomBody = bodyKeys[Math.floor(Math.random() * bodyKeys.length)];
    const randomHair = hairKeys[Math.floor(Math.random() * hairKeys.length)];
    const randomOutfit = outfitKeys[Math.floor(Math.random() * outfitKeys.length)];
    
    // Generate random position (scattered across the page)
    const randomLeft = `${Math.floor(Math.random() * 85) + 5}%`;
    const randomBottom = `${Math.floor(Math.random() * 70) + 5}%`;
    
    // Random z-index for layering (1 to 100)
    const randomZIndex = Math.floor(Math.random() * 100) + 1;
    
    // Generate bot name (Bot + random number)
    const botNumber = Math.floor(Math.random() * 10000);
    const botName = `Bot${botNumber}`;
    
    // Simple random ID (timestamp + random number)
    const randomId = `bot_${Date.now()}_${botNumber}`;
    
    return {
      id: randomId,
      name: botName,
      avatar_config: {
        body: randomBody,
        hair: randomHair,
        // Only include outfit for regular body types
        outfit: randomBodyType === 'regular' ? randomOutfit : ''
      },
      position: {
        left: randomLeft,
        bottom: randomBottom,
        zIndex: randomZIndex
      }
    };
  };
  
  // Helper function to get a random quote
  const getRandomQuote = () => {
    const quotes = botQuotes.typicalBotQuotes;
    return quotes[Math.floor(Math.random() * quotes.length)];
  };
  
  // This function is now moved into the useEffect
  
  // Effect to handle fading out messages and error popups
  useEffect(() => {
    fadeIntervalRef.current = setInterval(() => {
      // Handle message fading
      setBotMessages(prev => {
        const now = Date.now();
        const updated = { ...prev };
        
        // Update opacity for each message
        Object.keys(updated).forEach(id => {
          const message = updated[id];
          const age = now - message.timestamp;
          
          if (age > 5000) {
            // Start fading after 5 seconds
            const newOpacity = Math.max(0, message.opacity - 0.05);
            
            if (newOpacity <= 0) {
              // Remove message if fully transparent
              delete updated[id];
            } else {
              updated[id] = { ...message, opacity: newOpacity };
            }
          }
        });
        
        return updated;
      });
      
      // Handle error popup fading
      setErrorPopups(prev => {
        const now = Date.now();
        return prev.filter(popup => {
          const age = now - popup.timestamp;
          
          if (age > 10000) { // Keep error popups longer (10 seconds)
            return false; // Remove popup
          }
          
          return true; // Keep popup
        }).map(popup => {
          const age = now - popup.timestamp;
          
          if (age > 7000) { // Start fading after 7 seconds
            return {
              ...popup,
              opacity: Math.max(0, popup.opacity - 0.03)
            };
          }
          
          return popup;
        });
      });
    }, 100); // Update every 100ms for smooth fading
    
    return () => {
      // Clean up fade interval on unmount
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);
  
  // Effect to initialize the page and start the event automatically
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setEventStarted(true);
      
      // Record event start time
      eventStartTime.current = Date.now();
      
      // Add initial bots
      const initialBots = Array(3).fill(null).map(() => generateRandomBot());
      setBotCharacters(initialBots);
      setBotCount(3);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Effect for bot spawning - separate from initialization
  useEffect(() => {
    if (!eventStarted) return;
    
    // Set up interval to spawn more bots over time
    botSpawnIntervalRef.current = setInterval(() => {
      // Add more bots at an increasing rate
      // Adjusted to be more gradual over 10 minutes
      const newBotsCount = Math.min(3, Math.floor(botCount / 10) + 1);
      const newBots = Array(newBotsCount).fill(null).map(() => generateRandomBot());
      
      setBotCharacters(prev => [...prev, ...newBots]);
      setBotCount(prev => prev + newBotsCount);
    }, 15000); // Add bots every 15 seconds (slowed down from 3 seconds)
    
    return () => {
      if (botSpawnIntervalRef.current) clearInterval(botSpawnIntervalRef.current);
    };
  }, [eventStarted, botCount]);
  
  // Track which bots recently sent messages to avoid repeats
  const [recentlyActiveBotsRef] = useState<{current: Set<string>}>({
    current: new Set<string>()
  });
  
  // Effect for bot messaging - separate from spawning
  useEffect(() => {
    if (!eventStarted) return;
    
    // Set up interval for bots to send messages
    quoteIntervalRef.current = setInterval(() => {
      setBotCharacters(prevBots => {
        if (prevBots.length === 0) return prevBots;
        
        // Filter out bots that recently sent messages
        const availableBots = prevBots.filter(bot => !recentlyActiveBotsRef.current.has(bot.id));
        
        // If all bots have recently sent messages, clear the tracking and use all bots
        if (availableBots.length === 0) {
          recentlyActiveBotsRef.current.clear();
          // Skip this round to avoid immediate repeats
          return prevBots;
        }
        
        // Determine how many bots will send messages
        // Adjusted to scale with time - more messages as we get closer to BSOD
        const timeElapsed = Date.now() - eventStartTime.current;
        const progressRatio = Math.min(1, timeElapsed / (10 * 60 * 1000)); // 0 to 1 over 10 minutes
        const messagingBotsCount = Math.max(1, Math.floor(availableBots.length * (0.1 + progressRatio * 0.4)));
        const selectedBots: BotCharacter[] = [];
        
        // Randomly select bots from available ones
        const shuffledBots = [...availableBots].sort(() => Math.random() - 0.5);
        selectedBots.push(...shuffledBots.slice(0, messagingBotsCount));
        
        // Add messages for selected bots without modifying the bots themselves
        selectedBots.forEach(bot => {
          // Track this bot as recently active
          recentlyActiveBotsRef.current.add(bot.id);
          
          setBotMessages(prev => ({
            ...prev,
            [bot.id]: {
              characterId: bot.id,
              content: getRandomQuote(),
              opacity: 1.0,
              timestamp: Date.now()
            }
          }));
        });
        
        // Return the exact same array to avoid re-rendering the bots
        return prevBots;
      });
      
      // Clear old entries from recently active bots after a cycle
      setTimeout(() => {
        recentlyActiveBotsRef.current.clear();
      }, 8000); // Clear after two message cycles
      
    }, 4000); // Send messages every 4 seconds
    
    return () => {
      if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);
    };
  }, [eventStarted]);
      
  // Effect for error popups - separate effect
  useEffect(() => {
    if (!eventStarted) return;
    
    // Start showing errors after 3 minutes (scaled up from 15 seconds)
    const errorStartTimeout = setTimeout(() => {
      errorPopupIntervalRef.current = setInterval(() => {
        // Create a new error popup
        const newPopup: ErrorPopup = {
          id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          left: `${Math.floor(Math.random() * 70) + 10}%`,
          top: `${Math.floor(Math.random() * 70) + 10}%`,
          scale: 0.7 + Math.random() * 0.6,
          rotation: `${Math.floor(Math.random() * 10) - 5}deg`,
          opacity: 1.0,
          timestamp: Date.now()
        };
        
        setErrorPopups(prev => [...prev, newPopup]);
      }, 8000); // New error every 8 seconds (slowed down from 3 seconds)
    }, 3 * 60 * 1000); // 3 minutes
    
    return () => {
      clearTimeout(errorStartTimeout);
      if (errorPopupIntervalRef.current) clearInterval(errorPopupIntervalRef.current);
    };
  }, [eventStarted]);
  
  // Effect for BSOD - separate effect
  useEffect(() => {
    if (!eventStarted) return;
    
    // Set up BSOD timeout
    bsodTimeoutRef.current = setTimeout(() => {
      setShowBSOD(true);
      
      // Clean up intervals when BSOD shows
      if (botSpawnIntervalRef.current) clearInterval(botSpawnIntervalRef.current);
      if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (errorPopupIntervalRef.current) clearInterval(errorPopupIntervalRef.current);
    }, 10 * 60 * 1000); // Show BSOD after 10 minutes
    
    return () => {
      if (bsodTimeoutRef.current) clearTimeout(bsodTimeoutRef.current);
    };
  }, [eventStarted]);

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
          <p style={win95.text}>Loading...</p>
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
      {/* Error Popups */}
      {errorPopups.map(popup => (
        <div 
          key={popup.id}
          style={{
            position: 'fixed',
            left: popup.left,
            top: popup.top,
            // transform: `scale(${popup.scale}) rotate(${popup.rotation})`,
            zIndex: 500,
            // opacity: popup.opacity,
            // transition: 'transform 0.2s ease-in-out',
            pointerEvents: 'none'
          }}
        >
          <img 
            src={errorImage} 
            alt="Windows Error" 
            style={{
              width: '300px',
              height: 'auto',
              boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
            }} 
          />
        </div>
      ))}
      
      {/* BSOD Overlay */}
      {showBSOD && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1000,
          backgroundImage: `url(${bsodImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
      )}
      
      {/* No start button needed anymore */}
      
      {/* Bot Counter
      {eventStarted && !showBSOD && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '5px 10px',
          border: '2px solid #000',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '12px',
          zIndex: 100
        }}>
          Bots: {botCount}
        </div> */}
      {/* )} */}
      
      {/* Characters scattered across the room */}
      <div style={{ 
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10
      }}>
        {botCharacters.map((character) => (
          <div 
            key={character.id} 
            style={{
              position: 'absolute',
              left: character.position.left,
              bottom: character.position.bottom,
              zIndex: character.position.zIndex
            }}
          >
            <CharacterComponent 
              character={character}
              message={botMessages[character.id] ? {
                content: botMessages[character.id].content,
                opacity: botMessages[character.id].opacity
              } : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
