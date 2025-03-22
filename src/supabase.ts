import { createClient } from '@supabase/supabase-js';

// These should be replaced with your Supabase URL and anon key
// You can find these in your Supabase project settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug environment variables
console.log('ENV check - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'exists' : 'missing');
console.log('ENV check - VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'exists' : 'missing');

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for our database models
export type Character = {
  id?: string;
  name: string;
  avatar_config: AvatarConfig;
  created_at?: string;
};

export type Message = {
  id?: string;
  character_id: string;
  content: string;
  created_at?: string;
  character?: Character; // For joins
};

// Define avatar configuration type
export type AvatarConfig = {
  body: string;
  hair: string;
  outfit: string;
};
