import { useState, useEffect, useRef } from 'react';
import { win95 } from '../styles/win95';
import roomBackground from '../assets/dollhouse/room_15.gif';
import bsodImage from '../assets/bot_event/bsod.png';
import errorImage from '../assets/bot_event/error.png';
import botQuotes from '../bot_quotes.json';

// Import components
import CharacterComponent from '../components/dollhouse/Character';
import { BODY_ASSETS, HAIR_ASSETS, OUTFIT_ASSETS } from '../assets/characterAssets';

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
  const [showBSOD, setShowBSOD] = useState(false);
  const [eventStarted, setEventStarted] = useState(false);
  const [botCount, setBotCount] = useState(0);
  
  // Refs for intervals
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botSpawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const quoteIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorPopupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bsodTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
        outfit: randomOutfit
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
      // Clean up all intervals and timeouts on unmount
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (botSpawnIntervalRef.current) clearInterval(botSpawnIntervalRef.current);
      if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);
      if (errorPopupIntervalRef.current) clearInterval(errorPopupIntervalRef.current);
      if (bsodTimeoutRef.current) clearTimeout(bsodTimeoutRef.current);
    };
  }, []);
  
  // Effect to initialize the page and start the event automatically
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Start the event automatically
      setEventStarted(true);
      
      // Add initial bots
      const initialBots = Array(3).fill(null).map(() => generateRandomBot());
      setBotCharacters(initialBots);
      setBotCount(3);
      
      // Set up interval to spawn more bots over time
      botSpawnIntervalRef.current = setInterval(() => {
        // Add more bots at an increasing rate
        const newBotsCount = Math.min(3, Math.floor(botCount / 5) + 1);
        const newBots = Array(newBotsCount).fill(null).map(() => generateRandomBot());
        
        setBotCharacters(prev => [...prev, ...newBots]);
        setBotCount(prev => prev + newBotsCount);
      }, 3000); // Add bots every 3 seconds
      
      // Set up interval for bots to send messages
      quoteIntervalRef.current = setInterval(() => {
        // Select random bots to send messages
        setBotCharacters(prevBots => {
          if (prevBots.length === 0) return prevBots;
          
          // Determine how many bots will send messages (25-50% of bots)
          const messagingBotsCount = Math.max(1, Math.floor(prevBots.length * (Math.random() * 0.25 + 0.25)));
          const botIndices = new Set<number>();
          
          // Select random bots
          while (botIndices.size < messagingBotsCount) {
            botIndices.add(Math.floor(Math.random() * prevBots.length));
          }
          
          // Add messages for selected bots
          botIndices.forEach(index => {
            const bot = prevBots[index];
            if (bot) {
              setBotMessages(prev => ({
                ...prev,
                [bot.id]: {
                  characterId: bot.id,
                  content: getRandomQuote(),
                  opacity: 1.0,
                  timestamp: Date.now()
                }
              }));
            }
          });
          
          return prevBots;
        });
      }, 1000); // Send messages every second
      
      // Set up error popup interval (start after 15 seconds)
      setTimeout(() => {
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
          
          // Increase frequency as we get closer to BSOD
        }, 3000); // New error every 3 seconds
      }, 15000); // Start showing errors after 15 seconds
      
      // Set up BSOD timeout
      bsodTimeoutRef.current = setTimeout(() => {
        setShowBSOD(true);
        
        // Clean up intervals when BSOD shows
        if (botSpawnIntervalRef.current) clearInterval(botSpawnIntervalRef.current);
        if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        if (errorPopupIntervalRef.current) clearInterval(errorPopupIntervalRef.current);
      }, 40000); // Show BSOD after 60 seconds
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [botCount]);

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
          <p style={win95.text}>Loading the event...</p>
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
