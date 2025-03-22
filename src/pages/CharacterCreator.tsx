import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Character, type AvatarConfig } from '../supabase';

// These would be replaced with your actual assets
const AVATAR_PARTS = {
  body: ['body1', 'body2', 'body3'],
  hair: ['hair1', 'hair2', 'hair3'],
  outfit: ['outfit1', 'outfit2', 'outfit3']
};

export default function CharacterCreator() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    body: AVATAR_PARTS.body[0],
    hair: AVATAR_PARTS.hair[0],
    outfit: AVATAR_PARTS.outfit[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePartChange = (category: keyof typeof AVATAR_PARTS, item: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      [category]: item
    }));
  };

  // No accessories functionality needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter a name for your character');
      return;
    }

    setIsLoading(true);
    try {
      // Save character to Supabase
      const newCharacter: Character = {
        name: name.trim(),
        avatar_config: avatarConfig
      };

      const { data, error } = await supabase
        .from('characters')
        .insert(newCharacter)
        .select()
        .single();

      if (error) throw error;

      console.log('Character created successfully:', data);

      // Navigate to the chat page with the new character ID
      navigate(`/chat/${data.id}`);
    } catch (error) {
      console.error('Error creating character:', error);
      setError('Failed to create character. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to render avatar part selection
  const renderPartSelector = (category: keyof typeof AVATAR_PARTS, label: string) => (
    <div style={{ marginTop: '20px' }}>
      <label style={{ 
        fontFamily: 'Tahoma, Arial, sans-serif',
        fontSize: '11px', 
        fontWeight: 'bold', 
        display: 'block', 
        marginBottom: '6px',
        color: '#000000'
      }}>
        {label}
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {AVATAR_PARTS[category].map(part => (
          <div 
            key={part}
            style={{ 
              border: avatarConfig[category] === part 
                ? '2px solid #0A246A' 
                : '2px solid #DFDFDF',
              borderTop: avatarConfig[category] === part 
                ? '2px solid #0A246A' 
                : '2px solid #FFFFFF',
              borderLeft: avatarConfig[category] === part 
                ? '2px solid #0A246A' 
                : '2px solid #FFFFFF',
              padding: '4px', 
              cursor: 'pointer',
              backgroundColor: avatarConfig[category] === part ? '#B6BDD2' : '#D4D0C8'
            }}
            onClick={() => handlePartChange(category, part)}
          >
            {/* This would be replaced with actual images of your character parts */}
            <div 
              style={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #808080',
                borderTop: '1px solid #404040',
                borderLeft: '1px solid #404040',
                height: '60px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
            >
              <span style={{ 
                fontFamily: 'Tahoma, Arial, sans-serif',
                fontSize: '11px',
                color: '#000000'
              }}>
                {part}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '20px auto', 
      padding: '0', 
      fontFamily: 'Tahoma, Arial, sans-serif',
      backgroundColor: '#D4D0C8',
      border: '2px solid #DFDFDF',
      borderTop: '2px solid #FFFFFF',
      borderLeft: '2px solid #FFFFFF',
      boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
    }}>
      <div style={{ 
        backgroundColor: '#0A246A', 
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ 
          fontSize: '12px', 
          fontWeight: 'bold', 
          color: 'white', 
          margin: 0,
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}>Character Creator</h1>
        <div style={{ 
          display: 'flex', 
          gap: '2px'
        }}>
          <button type="button" style={{ 
            width: '18px', 
            height: '18px', 
            backgroundColor: '#D4D0C8',
            border: '1px solid #FFFFFF',
            borderRight: '1px solid #404040',
            borderBottom: '1px solid #404040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>_</button>
          <button type="button" style={{ 
            width: '18px', 
            height: '18px', 
            backgroundColor: '#D4D0C8',
            border: '1px solid #FFFFFF',
            borderRight: '1px solid #404040',
            borderBottom: '1px solid #404040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>×</button>
        </div>
      </div>
      
      <div style={{ padding: '10px' }}>
        {error && (
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            border: '1px solid #FF0000',
            padding: '8px', 
            marginBottom: '10px',
            fontSize: '11px',
            color: '#FF0000',
            fontFamily: 'Tahoma, Arial, sans-serif'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px'
          }}>
            {/* Left side - Character Preview */}
            <div style={{ 
              flex: '1', 
              padding: '10px', 
              backgroundColor: '#D4D0C8', 
              border: '2px solid #DFDFDF',
              borderTop: '2px solid #FFFFFF',
              borderLeft: '2px solid #FFFFFF',
            }}>
              <p style={{ 
                fontFamily: 'Tahoma, Arial, sans-serif',
                fontSize: '11px', 
                fontWeight: 'bold', 
                textAlign: 'center', 
                marginBottom: '8px',
                color: '#000000'
              }}>Character Preview</p>
              <div style={{ 
                height: '240px', 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #808080',
                borderTop: '1px solid #404040',
                borderLeft: '1px solid #404040',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                {/* This would be replaced with actual character preview */}
                <p style={{ 
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  fontSize: '11px',
                  color: '#000000'
                }}>Character Preview</p>
              </div>
            </div>

            {/* Right side - Character Customization */}
            <div style={{ flex: '1.5' }}>
              <div style={{ marginBottom: '12px' }}>
                <label 
                  htmlFor="name" 
                  style={{ 
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    display: 'block', 
                    marginBottom: '4px',
                    color: '#000000'
                  }}
                >
                  Character Name:
                </label>
                <input 
                  id="name"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter a name"
                  maxLength={20}
                  style={{ 
                    width: '100%', 
                    padding: '4px', 
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #808080',
                    borderTop: '1px solid #404040',
                    borderLeft: '1px solid #404040',
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    fontSize: '11px'
                  }}
                />
              </div>

              {renderPartSelector('body', 'Body Type')}
              {renderPartSelector('hair', 'Hairstyle')}
              {renderPartSelector('outfit', 'Outfit')}

              <button 
                type="submit" 
                disabled={isLoading}
                style={{ 
                  width: '120px', 
                  marginTop: '16px',
                  padding: '4px 8px',
                  backgroundColor: '#D4D0C8',
                  color: '#000000',
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  fontSize: '11px',
                  fontWeight: 'normal',
                  border: '2px solid #DFDFDF',
                  borderTop: '2px solid #FFFFFF',
                  borderLeft: '2px solid #FFFFFF',
                  cursor: isLoading ? 'wait' : 'pointer',
                  boxShadow: isLoading ? 'inset 1px 1px 1px #808080' : 'none',
                  position: 'relative',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  display: 'block'
                }}
              >
                {isLoading ? 'Creating...' : 'OK'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
