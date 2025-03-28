import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Character, type AvatarConfig } from '../supabase';

// Import shared character assets
import { AVATAR_PARTS, CATEGORIZED_AVATAR_PARTS, BodyType } from '../assets/characterAssets';

export default function CharacterCreator() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType>('regular');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    body: CATEGORIZED_AVATAR_PARTS.regular.body.length > 0 ? CATEGORIZED_AVATAR_PARTS.regular.body[0].id : '',
    hair: CATEGORIZED_AVATAR_PARTS.regular.hair.length > 0 ? CATEGORIZED_AVATAR_PARTS.regular.hair[0].id : '',
    outfit: AVATAR_PARTS.outfit.length > 0 ? AVATAR_PARTS.outfit[0].id : ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBodyTypeChange = (bodyType: BodyType) => {
    setSelectedBodyType(bodyType);
    
    // Reset avatar config with defaults from the selected body type
    // For Barbie body type, clear the outfit as it's optional
    setAvatarConfig(prev => ({
      ...prev,
      body: CATEGORIZED_AVATAR_PARTS[bodyType].body.length > 0 ? CATEGORIZED_AVATAR_PARTS[bodyType].body[0].id : '',
      hair: CATEGORIZED_AVATAR_PARTS[bodyType].hair.length > 0 ? CATEGORIZED_AVATAR_PARTS[bodyType].hair[0].id : '',
      outfit: bodyType === 'barbie' ? '' : prev.outfit // Clear outfit for Barbie type
    }));
  };

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

  // Helper function to render body type selection
  const renderBodyTypeSelector = () => {
    const bodyTypes: { type: BodyType, label: string }[] = [
      { type: 'regular', label: 'Regular' },
      { type: 'barbie', label: 'Barbie' }
    ];
    
    return (
      <div style={{ marginTop: '20px' }}>
        <label style={{ 
          fontFamily: 'Tahoma, Arial, sans-serif',
          fontSize: '11px', 
          fontWeight: 'bold', 
          display: 'block', 
          marginBottom: '6px',
          color: '#000000'
        }}>
          Body Type
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '10px',
          padding: '4px'
        }}>
          {bodyTypes.map(bodyType => (
            <div 
              key={bodyType.type}
              style={{ 
                border: selectedBodyType === bodyType.type 
                  ? '2px solid #0A246A' 
                  : '2px solid #DFDFDF',
                borderTop: selectedBodyType === bodyType.type 
                  ? '2px solid #0A246A' 
                  : '2px solid #FFFFFF',
                borderLeft: selectedBodyType === bodyType.type 
                  ? '2px solid #0A246A' 
                  : '2px solid #FFFFFF',
                padding: '8px', 
                cursor: 'pointer',
                backgroundColor: selectedBodyType === bodyType.type ? '#B6BDD2' : '#D4D0C8',
                textAlign: 'center',
                fontFamily: 'Tahoma, Arial, sans-serif',
                fontSize: '12px'
              }}
              onClick={() => handleBodyTypeChange(bodyType.type)}
            >
              {bodyType.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render avatar part selection for the selected body type
  const renderPartSelector = (category: 'body' | 'hair' | 'outfit', label: string) => {
    // For outfit, use the regular AVATAR_PARTS since outfits are compatible with all body types
    const isOutfitCategory = category === 'outfit';
    const parts = isOutfitCategory 
      ? AVATAR_PARTS.outfit 
      : CATEGORIZED_AVATAR_PARTS[selectedBodyType][category as 'body' | 'hair'];
    
    return (
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
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '6px',
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '4px',
          border: '1px solid #808080',
          borderTop: '1px solid #404040',
          borderLeft: '1px solid #404040',
          backgroundColor: '#FFFFFF'
        }}>
          {parts.map(part => (
            <div 
              key={part.id}
              style={{ 
                border: avatarConfig[category] === part.id 
                  ? '2px solid #0A246A' 
                  : '2px solid #DFDFDF',
                borderTop: avatarConfig[category] === part.id 
                  ? '2px solid #0A246A' 
                  : '2px solid #FFFFFF',
                borderLeft: avatarConfig[category] === part.id 
                  ? '2px solid #0A246A' 
                  : '2px solid #FFFFFF',
                padding: '4px', 
                cursor: 'pointer',
                backgroundColor: avatarConfig[category] === part.id ? '#B6BDD2' : '#D4D0C8',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => handlePartChange(category, part.id)}
            >
              <img 
                src={part.image} 
                alt={part.id} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#008080', // Windows 95 blue/teal background
      padding: '20px',
      boxSizing: 'border-box' as const
    }}>
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
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
                justifyContent: 'center',
                position: 'relative'
              }}>
                {/* Body (z-index: 0) */}
                {AVATAR_PARTS.body.find(part => part.id === avatarConfig.body) && (
                  <img 
                    src={selectedBodyType === 'regular' ? 
                      CATEGORIZED_AVATAR_PARTS.regular.body.find(part => part.id === avatarConfig.body)?.image :
                      CATEGORIZED_AVATAR_PARTS.barbie.body.find(part => part.id === avatarConfig.body)?.image} 
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
                
                {/* Outfit (z-index: 1) - only shown for regular body type */}
                {selectedBodyType === 'regular' && AVATAR_PARTS.outfit.find(part => part.id === avatarConfig.outfit) && (
                  <img 
                    src={AVATAR_PARTS.outfit.find(part => part.id === avatarConfig.outfit)?.image} 
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
                {(selectedBodyType === 'regular' ? 
                  CATEGORIZED_AVATAR_PARTS.regular.hair.find(part => part.id === avatarConfig.hair) : 
                  CATEGORIZED_AVATAR_PARTS.barbie.hair.find(part => part.id === avatarConfig.hair)) && (
                  <img 
                    src={selectedBodyType === 'regular' ? 
                      CATEGORIZED_AVATAR_PARTS.regular.hair.find(part => part.id === avatarConfig.hair)?.image :
                      CATEGORIZED_AVATAR_PARTS.barbie.hair.find(part => part.id === avatarConfig.hair)?.image} 
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

              {renderBodyTypeSelector()}
              {renderPartSelector('body', 'Body')}
              {renderPartSelector('hair', 'Hairstyle')}
              {/* Only show outfit selector for regular body type */}
              {selectedBodyType === 'regular' && renderPartSelector('outfit', 'Outfit')}

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
    </div>
  );
}
