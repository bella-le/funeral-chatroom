// Import body assets
import bodyAqua from './character_creator/body/aqua.png';
import bodyGreen from './character_creator/body/green.png';
import bodyOrange from './character_creator/body/orange.png';
import bodyPink from './character_creator/body/pink.png';
import bodyBlue from './character_creator/body/blue.png';
import bodyRed from './character_creator/body/red.png';
import bodyWhite from './character_creator/body/white.png';
import bodyBlack from './character_creator/body/black.png';
import bodyYellow from './character_creator/body/yellow.png';

// Import hair assets
import hair1 from './character_creator/hair/1.png';
import hair2 from './character_creator/hair/2.png';
import hair3 from './character_creator/hair/hat3.png';
import hair4 from './character_creator/hair/hat4.png';
import hair5 from './character_creator/hair/hat.png';
import hair6 from './character_creator/hair/hat2.png';
import hair7 from './character_creator/hair/hat5.png';
import hair8 from './character_creator/hair/hat7.png';
import hair9 from './character_creator/hair/hat9.png';

// Import outfit assets
import outfit221 from './character_creator/outfit/221.png';
import outfit24302 from './character_creator/outfit/24302.png';
import outfit3 from './character_creator/outfit/outfit3.png';
import outfit4 from './character_creator/outfit/outfit4.png';
import outfit5 from './character_creator/outfit/outfit5.png';
import outfit6 from './character_creator/outfit/outfit6.png';
import outfit7 from './character_creator/outfit/outfit7.png';
import outfit8 from './character_creator/outfit/outfit8.png';
import outfit9 from './character_creator/outfit/outfit9.png';

// Create mappings of all available assets
export const BODY_ASSETS: Record<string, string> = {
  'aqua': bodyAqua,
  'green': bodyGreen,
  'orange': bodyOrange,
  'pink': bodyPink,
  'blue': bodyBlue,
  'red': bodyRed,
  'white': bodyWhite,
  'black': bodyBlack,
  'yellow': bodyYellow
};

export const HAIR_ASSETS: Record<string, string> = {
  '1': hair1,
  '2': hair2,
  '3': hair3,
  '4': hair4,
  '5': hair5,
  '6': hair6,
  '7': hair7,
  '8': hair8,
  '9': hair9
};

export const OUTFIT_ASSETS: Record<string, string> = {
  '221': outfit221,
  '24302': outfit24302,
  '3': outfit3,
  '4': outfit4,
  '5': outfit5,
  '6': outfit6,
  '7': outfit7,
  '8': outfit8,
  '9': outfit9
};

// Define part types for use in components
export type PartCategory = 'body' | 'hair' | 'outfit';

// Define a structure for avatar parts
export interface AvatarPart {
  id: string;
  image: string;
}

// Create structured avatar parts for the UI
export const AVATAR_PARTS: Record<PartCategory, AvatarPart[]> = {
  body: Object.entries(BODY_ASSETS).map(([id, image]) => ({ id, image })),
  hair: Object.entries(HAIR_ASSETS).map(([id, image]) => ({ id, image })),
  outfit: Object.entries(OUTFIT_ASSETS).map(([id, image]) => ({ id, image }))
};

// Helper function to get an image by category and id
export const getPartImage = (category: PartCategory, id: string): string | undefined => {
  switch (category) {
    case 'body':
      return BODY_ASSETS[id];
    case 'hair':
      return HAIR_ASSETS[id];
    case 'outfit':
      return OUTFIT_ASSETS[id];
    default:
      return undefined;
  }
};
