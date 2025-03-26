import React from 'react';
import { type Character as CharacterType } from '../../supabase';
import { BODY_ASSETS, HAIR_ASSETS, OUTFIT_ASSETS } from '../../assets/characterAssets';

interface CharacterProps {
  character: CharacterType;
  message?: {
    content: string;
    opacity: number;
  };
}

export const Character: React.FC<CharacterProps> = ({ character, message }) => {
  const { body, hair, outfit } = character.avatar_config || {};
  
  // Calculate random position for character (this could be stored in character data instead)
  const getRandomPosition = (id: string) => {
    // Use character ID to generate a consistent position
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const x = (hash % 80) + 10; // 10% to 90% horizontal
    return `${x}%`;
  };
  
  const leftPosition = getRandomPosition(character.id || '');
  
  return (
    <div 
      style={{ 
        position: 'absolute' as const,
        left: leftPosition,
        bottom: '10px',
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
        width: '120px',
        zIndex: message ? 2 : 1
      }}
    >
      {/* Message bubble */}
      {message && message.content && (
        <div style={{
          backgroundColor: 'white',
          border: '2px solid #000',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '8px',
          minWidth: '180px',
          maxWidth: '220px',
          wordBreak: 'break-word' as const,
          textAlign: 'center' as const,
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '10px',
          lineHeight: '1.5',
          imageRendering: 'pixelated',
          boxShadow: '3px 3px 0px #000',
          opacity: message.opacity,
          transition: 'opacity 0.5s ease',
          zIndex: 3,
          position: 'relative' as const
        }}>
          {message.content}
          {/* Pixelated speech bubble pointer */}
          <div style={{
            position: 'absolute' as const,
            bottom: '-8px',
            left: '50%',
            marginLeft: '-8px',
            width: '16px',
            height: '8px',
            backgroundColor: 'white',
            borderLeft: '2px solid #000',
            borderRight: '2px solid #000',
            borderBottom: '2px solid #000'
          }} />
        </div>
      )}
      
      {/* Character name */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: '4px 8px',
        borderRadius: '4px',
        marginBottom: '-35px',
        fontSize: '10px',
        fontFamily: '"Press Start 2P", cursive',
        textAlign: 'center' as const,
        minWidth: '100px',
        maxWidth: '150px',
        wordBreak: 'break-word' as const,
        lineHeight: '1.2'
      }}>
        {character.name}
      </div>
      
      {/* Character avatar */}
      <div style={{
        width: '100px',
        height: '160px',
        // backgroundColor: '#FFF',
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        overflow: 'hidden' as const,
        position: 'relative' as const,
      }}>
        {/* Body (z-index: 0) */}
        {body && BODY_ASSETS[body] && (
          <img 
            src={BODY_ASSETS[body]} 
            alt="Body" 
            style={{ 
              position: 'absolute' as const,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              zIndex: 0,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {/* Outfit (z-index: 1) */}
        {outfit && OUTFIT_ASSETS[outfit] && (
          <img 
            src={OUTFIT_ASSETS[outfit]} 
            alt="Outfit" 
            style={{ 
              position: 'absolute' as const,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              zIndex: 1,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {/* Hair (z-index: 2) */}
        {hair && HAIR_ASSETS[hair] && (
          <img 
            src={HAIR_ASSETS[hair]} 
            alt="Hair" 
            style={{ 
              position: 'absolute' as const,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              zIndex: 2,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        
        {/* Fallback if images aren't available */}
        {(!BODY_ASSETS[body || ''] && !HAIR_ASSETS[hair || ''] && !OUTFIT_ASSETS[outfit || '']) && (
          <div style={{ 
            fontSize: '10px',
            color: '#000',
            textAlign: 'center' as const
          }}>
            Body: {body}<br/>
            Hair: {hair}<br/>
            Outfit: {outfit}
          </div>
        )}
      </div>
    </div>
  );
};

export default Character;
