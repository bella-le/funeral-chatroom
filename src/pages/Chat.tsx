import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Character, type Message } from '../supabase';
import { win95 } from '../styles/win95';

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
    
    return (
      <div style={{
        width: windowWidth < 600 ? '120px' : '180px',
        height: windowWidth < 600 ? '120px' : '180px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #808080',
        borderTop: '1px solid #404040',
        borderLeft: '1px solid #404040',
        position: 'relative' as const,
        overflow: 'hidden' as const
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
                <p style={win95.text}>Chatting as this character</p>
                <p style={win95.text}>Use the form below to send messages that will appear in the Dollhouse.</p>
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
  );
}
