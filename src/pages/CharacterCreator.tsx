import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Character, type AvatarConfig } from '../supabase';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// These would be replaced with your actual assets
const AVATAR_PARTS = {
  body: ['body1', 'body2', 'body3'],
  hair: ['hair1', 'hair2', 'hair3'],
  eyes: ['eyes1', 'eyes2', 'eyes3'],
  mouth: ['mouth1', 'mouth2', 'mouth3'],
  outfit: ['outfit1', 'outfit2', 'outfit3'],
  accessories: ['accessory1', 'accessory2', 'accessory3'],
};

export default function CharacterCreator() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    body: AVATAR_PARTS.body[0],
    hair: AVATAR_PARTS.hair[0],
    eyes: AVATAR_PARTS.eyes[0],
    mouth: AVATAR_PARTS.mouth[0],
    outfit: AVATAR_PARTS.outfit[0],
    accessories: [],
    color_scheme: {
      skin: '#F8D5C0',
      hair: '#5E3B28',
      outfit: '#3B82F6',
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePartChange = (category: keyof typeof AVATAR_PARTS, item: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      [category]: item
    }));
  };

  const toggleAccessory = (accessory: string) => {
    setAvatarConfig(prev => {
      const accessories = prev.accessories || [];
      return {
        ...prev,
        accessories: accessories.includes(accessory)
          ? accessories.filter(a => a !== accessory)
          : [...accessories, accessory]
      };
    });
  };

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
      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {AVATAR_PARTS[category].map(part => (
          <div 
            key={part}
            style={{ 
              border: avatarConfig[category] === part ? '3px solid #4299e1' : '1px solid #e2e8f0',
              borderRadius: '8px', 
              padding: '10px', 
              cursor: 'pointer',
              backgroundColor: avatarConfig[category] === part ? '#ebf8ff' : 'white'
            }}
            onClick={() => handlePartChange(category, part)}
          >
            {/* This would be replaced with actual images of your character parts */}
            <div 
              style={{ 
                backgroundColor: '#f7fafc', 
                height: '80px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '4px'
              }}
            >
              <span style={{ fontSize: '14px' }}>{part}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center">Create Your Character</h1>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-white bg-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Left side - Character Preview */}
          <div className="flex-1 p-6 bg-card rounded-md shadow-md">
            <p className="mb-4 font-bold text-center">Character Preview</p>
            <div 
              className="flex items-center justify-center h-[300px] bg-white rounded-md shadow-inner"
            >
              {/* This would be replaced with actual character preview */}
              <p className="text-muted-foreground">Character Preview</p>
            </div>
            <p className="mt-4 text-xl text-center">{name || "Your Name"}</p>
          </div>

          {/* Right side - Character Customization */}
          <div className="flex-1.5 space-y-4">
            <div>
              <Label htmlFor="name">Character Name</Label>
              <Input 
                id="name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter a name"
                maxLength={20}
                className="mt-1"
              />
            </div>

            {renderPartSelector('body', 'Body Type')}
            {renderPartSelector('hair', 'Hairstyle')}
            {renderPartSelector('eyes', 'Eyes')}
            {renderPartSelector('mouth', 'Mouth')}
            {renderPartSelector('outfit', 'Outfit')}

            <div className="mt-4">
              <Label>Accessories</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {AVATAR_PARTS.accessories.map(accessory => {
                  const isSelected = avatarConfig.accessories?.includes(accessory) || false;
                  return (
                    <div 
                      key={accessory}
                      className={`border ${isSelected ? 'border-primary border-2' : 'border-input'} 
                      rounded-md p-2 cursor-pointer`}
                      onClick={() => toggleAccessory(accessory)}
                    >
                      <div 
                        className="flex items-center justify-center h-20 bg-muted"
                      >
                        <span className="text-xs">{accessory}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button 
              className="w-full mt-6"
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Character'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
