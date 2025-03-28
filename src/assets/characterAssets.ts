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

// Import Barbie body assets
import barbieBody1 from './character_creator/barbie-body/Body 1.png';
import barbieBody2 from './character_creator/barbie-body/Body 2.png';
import barbieBody3 from './character_creator/barbie-body/Body 3.png';
import barbieBody4 from './character_creator/barbie-body/Body 4.png';
import barbieBody5 from './character_creator/barbie-body/Body 5.png';
import barbieBody6 from './character_creator/barbie-body/Body 6.png';
import barbieBody7 from './character_creator/barbie-body/Body 7.png';
import barbieBody8 from './character_creator/barbie-body/Body 8.png';
import barbieBody9 from './character_creator/barbie-body/Body 9.png';

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

// Import Barbie hair assets
import barbieHair1 from './character_creator/barbie-hair/Hair 1.png';
import barbieHair2 from './character_creator/barbie-hair/Hair 2.png';
import barbieHair3 from './character_creator/barbie-hair/Hair 3.png';

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
  'yellow': bodyYellow,
  'barbie-1': barbieBody1,
  'barbie-2': barbieBody2,
  'barbie-3': barbieBody3,
  'barbie-4': barbieBody4,
  'barbie-5': barbieBody5,
  'barbie-6': barbieBody6,
  'barbie-7': barbieBody7,
  'barbie-8': barbieBody8,
  'barbie-9': barbieBody9
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
  '9': hair9,
  'barbie-1': barbieHair1,
  'barbie-2': barbieHair2,
  'barbie-3': barbieHair3
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
export type BodyType = 'regular' | 'barbie';

// Define a structure for avatar parts
export interface AvatarPart {
  id: string;
  image: string;
}

// Categorize body assets by type
export const CATEGORIZED_BODY_ASSETS: Record<BodyType, Record<string, string>> = {
  regular: {
    'aqua': bodyAqua,
    'green': bodyGreen,
    'orange': bodyOrange,
    'pink': bodyPink,
    'blue': bodyBlue,
    'red': bodyRed,
    'white': bodyWhite,
    'black': bodyBlack,
    'yellow': bodyYellow
  },
  barbie: {
    'barbie-1': barbieBody1,
    'barbie-2': barbieBody2,
    'barbie-3': barbieBody3,
    'barbie-4': barbieBody4,
    'barbie-5': barbieBody5,
    'barbie-6': barbieBody6,
    'barbie-7': barbieBody7,
    'barbie-8': barbieBody8,
    'barbie-9': barbieBody9
  }
};

// Categorize hair assets by type
export const CATEGORIZED_HAIR_ASSETS: Record<BodyType, Record<string, string>> = {
  regular: {
    '1': hair1,
    '2': hair2,
    '3': hair3,
    '4': hair4,
    '5': hair5,
    '6': hair6,
    '7': hair7,
    '8': hair8,
    '9': hair9
  },
  barbie: {
    'barbie-1': barbieHair1,
    'barbie-2': barbieHair2,
    'barbie-3': barbieHair3
  }
};

// Create structured avatar parts for the UI
export const AVATAR_PARTS: Record<PartCategory, AvatarPart[]> = {
  body: Object.entries(BODY_ASSETS).map(([id, image]) => ({ id, image })),
  hair: Object.entries(HAIR_ASSETS).map(([id, image]) => ({ id, image })),
  outfit: Object.entries(OUTFIT_ASSETS).map(([id, image]) => ({ id, image }))
};

// Create categorized avatar parts for the UI
export const CATEGORIZED_AVATAR_PARTS: Record<BodyType, Record<Exclude<PartCategory, 'outfit'>, AvatarPart[]>> = {
  regular: {
    body: Object.entries(CATEGORIZED_BODY_ASSETS.regular).map(([id, image]) => ({ id, image })),
    hair: Object.entries(CATEGORIZED_HAIR_ASSETS.regular).map(([id, image]) => ({ id, image }))
  },
  barbie: {
    body: Object.entries(CATEGORIZED_BODY_ASSETS.barbie).map(([id, image]) => ({ id, image })),
    hair: Object.entries(CATEGORIZED_HAIR_ASSETS.barbie).map(([id, image]) => ({ id, image }))
  }
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

// Helper function to determine if an ID belongs to a specific body type
export const getBodyTypeFromId = (id: string): BodyType => {
  if (id.startsWith('barbie-')) {
    return 'barbie';
  }
  return 'regular';
};
