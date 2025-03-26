// Import body assets
import bodyAqua from './character_creator/body/aqua.png';
import bodyGreen from './character_creator/body/green.png';
import bodyOrange from './character_creator/body/orange.png';
import bodyPink from './character_creator/body/pink.png';

// Import hair assets
import hair1 from './character_creator/hair/1.png';
import hair2 from './character_creator/hair/2.png';

// Import outfit assets
import outfit221 from './character_creator/outfit/221.png';
import outfit24302 from './character_creator/outfit/24302.png';

// Create mappings of all available assets
export const BODY_ASSETS: Record<string, string> = {
  'aqua': bodyAqua,
  'green': bodyGreen,
  'orange': bodyOrange,
  'pink': bodyPink
};

export const HAIR_ASSETS: Record<string, string> = {
  '1': hair1,
  '2': hair2
};

export const OUTFIT_ASSETS: Record<string, string> = {
  '221': outfit221,
  '24302': outfit24302
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
