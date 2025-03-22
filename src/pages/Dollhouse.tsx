import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Character, type Message } from '../supabase';
import { win95 } from '../styles/win95';
import roomBackground from '../assets/dollhouse/room_15.gif';

export default function Dollhouse() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [messages, setMessages] = useState<(Message & { character: Character })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [recentMessages, setRecentMessages] = useState<{[key: string]: {content: string, timestamp: number, opacity: number}}>({});

  useEffect(() => {
    // Handle window resize for responsiveness
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Effect to handle fading out messages
  useEffect(() => {
    const fadeInterval = setInterval(() => {
      setRecentMessages(prev => {
        const now = Date.now();
        const updated = {...prev};
        let hasChanges = false;
        
        Object.keys(updated).forEach(key => {
          const message = updated[key];
          const elapsedTime = now - message.timestamp;
          
          // Start fading after 4 seconds, complete fade by 7 seconds
          if (elapsedTime > 4000 && elapsedTime < 7000) {
            const newOpacity = 1 - ((elapsedTime - 4000) / 3000);
            updated[key] = {...message, opacity: newOpacity};
            hasChanges = true;
          } else if (elapsedTime >= 7000) {
            delete updated[key];
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }, 100); // Update every 100ms for smooth fading
    
    return () => clearInterval(fadeInterval);
  }, []);

  useEffect(() => {
    // Fetch characters and messages
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all characters
        const { data: charactersData, error: charactersError } = await supabase
          .from('characters')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (charactersError) throw charactersError;
        
        // Fetch recent messages with character information
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            character:characters(*)
          `)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (messagesError) throw messagesError;
        
        setCharacters(charactersData || []);
        setMessages((messagesData || []) as (Message & { character: Character })[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dollhouse data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up separate channels for messages and characters
    const messagesChannel = supabase.channel('public:messages', {
      config: {
        broadcast: { self: true },
        presence: { key: 'dollhouse' },
      }
    });

    const charactersChannel = supabase.channel('public:characters', {
      config: {
        broadcast: { self: true },
        presence: { key: 'dollhouse' },
      }
    });

    // Subscribe to message changes
    messagesChannel
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        async (payload) => {
          console.log('New message received:', payload.new);
          
          try {
            // Get the character info for this message
            const { data: characterData, error: characterError } = await supabase
              .from('characters')
              .select('*')
              .eq('id', payload.new.character_id)
              .single();
              
            if (characterError) {
              console.error('Error fetching character for message:', characterError);
              return;
            }
            
            // Create the full message with character data
            const newMessage = {
              ...payload.new,
              character: characterData
            } as (Message & { character: Character });
            
            console.log('Message with character data:', newMessage);
            
            // Update messages state
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;
              return [newMessage, ...prev];
            });
            
            // Add to recent messages for display above character
            setRecentMessages(prev => {
              console.log('Adding message to character:', newMessage.character.id);
              return {
                ...prev,
                [newMessage.character.id]: {
                  content: newMessage.content,
                  timestamp: Date.now(),
                  opacity: 1
                }
              };
            });
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
      });
      
    // Subscribe to character changes
    charactersChannel
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'characters' 
        }, 
        (payload) => {
          console.log('New character received:', payload.new);
          // Add the new character to the state
          setCharacters(prev => {
            // Check if character already exists to prevent duplicates
            const exists = prev.some(char => char.id === payload.new.id);
            if (exists) return prev;
            return [payload.new as Character, ...prev];
          });
        }
      )
      .subscribe((status) => {
        console.log('Characters subscription status:', status);
      });

    // Clean up subscriptions on unmount
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(charactersChannel);
    };
  }, []);

  // Helper function to render a character in the dollhouse
  const renderCharacter = (character: Character) => {
    const { body, hair, outfit } = character.avatar_config || {};
    const hasRecentMessage = recentMessages[character.id];
    
    // Debug output to check if messages are being associated with characters
    console.log(`Rendering character ${character.name} (${character.id})`, 
      hasRecentMessage ? `has message: ${hasRecentMessage.content}` : 'no message');
    
    return (
      <div 
        key={character.id} 
        style={{
          position: 'relative' as const,
          width: '150px',
          height: '180px',
          margin: '10px',
          textAlign: 'center' as const
        }}
      >
        {/* Message bubble */}
        {hasRecentMessage && (
          <div style={{
            position: 'absolute' as const,
            bottom: '140px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '8px',
            padding: '8px 12px',
            minWidth: '200px',
            maxWidth: '300px',
            zIndex: 10,
            boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            opacity: hasRecentMessage.opacity,
            transition: 'opacity 0.1s ease-out'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              wordBreak: 'break-word' as const,
              maxHeight: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              imageRendering: 'pixelated',
              fontFamily: '"Press Start 2P", monospace',
              lineHeight: '1.5',
              letterSpacing: '0px'
            }}>
              {hasRecentMessage.content}
            </p>
            <div style={{
              position: 'absolute' as const,
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #FFFFFF'
            }} />
          </div>
        )}
        
        {/* Character avatar */}
        <div style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #808080',
          borderTop: '1px solid #404040',
          borderLeft: '1px solid #404040',
          position: 'relative' as const,
          overflow: 'hidden' as const,
          margin: '0 auto'
        }}>
          {/* Body */}
          <div style={{ 
            position: 'absolute' as const, 
            top: '0', 
            left: '0', 
            width: '100%', 
            height: '100%',
            display: 'flex' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            fontSize: '10px' as const,
            color: '#000'
          }}>
            {body}
          </div>
          
          {/* Hair */}
          <div style={{ 
            position: 'absolute' as const, 
            top: '0', 
            left: '0', 
            width: '100%', 
            height: '40%',
            display: 'flex' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            fontSize: '10px' as const,
            color: '#000'
          }}>
            {hair}
          </div>
          
          {/* Outfit */}
          <div style={{ 
            position: 'absolute' as const, 
            bottom: '0', 
            left: '0', 
            width: '100%', 
            height: '50%',
            display: 'flex' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            fontSize: '10px' as const,
            color: '#000'
          }}>
            {outfit}
          </div>
        </div>
        <p style={{ 
          marginTop: '8px', 
          fontSize: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: '3px 5px',
          borderRadius: '4px',
          fontFamily: '"Press Start 2P", monospace',
          imageRendering: 'pixelated',
          lineHeight: '1.2'
        }}>
          {character.name}
        </p>
      </div>
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
      backgroundImage: `url(${roomBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
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
        {characters.length === 0 ? (
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
          }}>
            <p style={win95.text}>No characters have joined yet</p>
          </div>
        ) : (
          characters.map(renderCharacter)
        )}
      </div>
    </div>
  );
}
