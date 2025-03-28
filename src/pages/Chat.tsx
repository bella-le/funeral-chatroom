import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Character, type Message } from '../supabase';
import { win95 } from '../styles/win95';

// Import shared character assets
import { BODY_ASSETS, HAIR_ASSETS, OUTFIT_ASSETS, getBodyTypeFromId } from '../assets/characterAssets';

export default function Chat() {
  const { characterId } = useParams<{ characterId: string }>();
  const [message, setMessage] = useState('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const maxLength = 255;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Handle window resize for responsiveness
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch character data
    const fetchCharacter = async () => {
      if (!characterId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('id', characterId)
          .single();
          
        if (error) throw error;
        setCharacter(data);
      } catch (error) {
        console.error('Error fetching character:', error);
        setError('Could not find your character.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId]);

  const renderAvatar = () => {
    if (!character || !character.avatar_config) return null;
    
    // Get the avatar parts from the character's configuration
    const { body, hair, outfit } = character.avatar_config;
    
    // Get the actual asset images
    const bodyImage = BODY_ASSETS[body];
    const hairImage = HAIR_ASSETS[hair];
    const outfitImage = OUTFIT_ASSETS[outfit];
    
    return (
      <div style={{
        width: windowWidth < 600 ? '120px' : '180px',
        height: windowWidth < 600 ? '120px' : '180px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #808080',
        borderTop: '1px solid #404040',
        borderLeft: '1px solid #404040',
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden' as const
      }}>
        {/* Body (z-index: 0) */}
        {bodyImage && (
          <img 
            src={bodyImage} 
            alt="Body" 
            style={{ 
              position: 'absolute',
              maxWidth: '80%',
              maxHeight: '80%',
              objectFit: 'contain',
              zIndex: 0,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {/* Outfit (z-index: 1) - only shown for regular body types */}
        {outfitImage && getBodyTypeFromId(body || '') === 'regular' && (
          <img 
            src={outfitImage} 
            alt="Outfit" 
            style={{ 
              position: 'absolute',
              maxWidth: '80%',
              maxHeight: '80%',
              objectFit: 'contain',
              zIndex: 1,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {/* Hair (z-index: 2) */}
        {hairImage && (
          <img 
            src={hairImage} 
            alt="Hair" 
            style={{ 
              position: 'absolute',
              maxWidth: '80%',
              maxHeight: '80%',
              objectFit: 'contain',
              zIndex: 2,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {/* Fallback if images aren't available */}
        {(!bodyImage && !hairImage && !outfitImage) && (
          <div style={{ 
            fontSize: '10px',
            color: '#000',
            textAlign: 'center'
          }}>
            Body: {body}<br/>
            Hair: {hair}<br/>
            Outfit: {outfit}
          </div>
        )}
      </div>
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !characterId) return;
    
    setIsSending(true);
    setError('');
    try {
      const newMessage: Message = {
        character_id: characterId,
        content: message.trim()
      };
      
      console.log('Sending message:', newMessage);
      
      // Insert the message with returning option to get the complete record
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();
        
      if (error) throw error;
      
      console.log('Message sent successfully:', data);
      
      // Clear input after successful send
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        ...win95.container,
        width: windowWidth < 600 ? '95%' : '800px',
      }}>
        <div style={win95.titleBar}>
          <h1 style={win95.titleText}>Chat Room</h1>
          <div style={win95.windowControls}>
            <button type="button" style={win95.windowButton}>_</button>
            <button type="button" style={win95.windowButton}>×</button>
          </div>
        </div>
        <div style={win95.contentArea}>
          <p style={win95.text}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div style={{
        ...win95.container,
        width: windowWidth < 600 ? '95%' : '800px',
      }}>
        <div style={win95.titleBar}>
          <h1 style={win95.titleText}>Chat Room</h1>
          <div style={win95.windowControls}>
            <button type="button" style={win95.windowButton}>_</button>
            <button type="button" style={win95.windowButton}>×</button>
          </div>
        </div>
        <div style={win95.contentArea}>
          <p style={win95.text}>Character not found or you haven't created one yet.</p>
          <Link to="/">
            <button style={win95.button}>Create a Character</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#008080', // Windows 95 blue/teal background
      padding: '20px',
      boxSizing: 'border-box' as const
    }}>
    <div style={{
      ...win95.container,
      width: windowWidth < 600 ? '95%' : '800px',
      margin: '0 auto'
    }}>
      <div style={win95.titleBar}>
        <h1 style={win95.titleText}>Chat Room</h1>
        <div style={win95.windowControls}>
          <button type="button" style={win95.windowButton}>_</button>
          <button type="button" style={win95.windowButton}>×</button>
        </div>
      </div>
      
      <div style={win95.contentArea}>
        {error && (
          <div style={win95.errorMessage}>
            {error}
          </div>
        )}
        
        <div style={win95.flexColumn}>
          {/* Character Info */}
          <div style={win95.panel}>
            <div style={{ 
              display: 'flex' as const, 
              flexDirection: windowWidth < 600 ? 'column' as const : 'row' as const,
              alignItems: 'center' as const, 
              gap: '15px' as const 
            }}>
              {/* Character avatar */}
              <div style={{ textAlign: 'center' as const }}>
                {renderAvatar()}
                <p style={{ ...win95.textBold, marginTop: '8px' }}>{character.name}</p>
              </div>
              <div style={{ 
                flex: '1',
                padding: windowWidth < 600 ? '10px 0' : '0'
              }}>
                <p style={win95.text}>Chatting as this character!</p>
                <p style={win95.text}>Use the form below to send messages that will appear in the chat room!</p>
              </div>
            </div>
          </div>
          
          {/* Chat Controls */}
          <div style={{
            ...win95.panel,
            position: 'sticky' as const,
            bottom: '4px' as const
          }}>
            <form onSubmit={handleSendMessage}>
              <div style={win95.flexColumn}>
                <div style={{
                  display: 'flex' as const,
                  flexDirection: windowWidth < 600 ? 'column' as const : 'row' as const,
                  gap: '10px' as const
                }}>
                  <input 
                    style={{
                      ...win95.input,
                      flex: windowWidth < 600 ? 'none' : '1' as const
                    }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    maxLength={maxLength}
                    disabled={isSending}
                  />
                  <button 
                    type="submit" 
                    style={{
                      ...win95.button,
                      ...(isSending ? win95.buttonDisabled : {}),
                      width: windowWidth < 600 ? '100%' : 'auto'
                    }}
                    disabled={isSending || !message.trim()}
                  >
                    Send
                  </button>
                </div>
                <div style={{ 
                  display: 'flex' as const, 
                  justifyContent: 'space-between' as const, 
                  alignItems: 'center' as const,
                  marginTop: '10px' as const
                }}>
                  <span style={{ ...win95.text, fontSize: '10px' as const }}>
                    {message.length}/{maxLength}
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
