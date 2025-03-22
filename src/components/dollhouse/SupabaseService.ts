import { supabase, type Character, type Message } from '../../supabase';

// Interface for tracking character activity
export interface CharacterActivity {
  characterId: string;
  lastActive: number; // timestamp
}

// Interface for message display with opacity
export interface DisplayMessage {
  content: string;
  timestamp: number;
  opacity: number;
}

// Interface for message with character data
export interface MessageWithCharacter extends Message {
  character: Character;
}

export type MessageCallback = (message: MessageWithCharacter) => void;
export type CharacterCallback = (character: Character) => void;

export class SupabaseService {
  private messagesChannel: any;
  private charactersChannel: any;
  
  constructor() {
    this.messagesChannel = null;
    this.charactersChannel = null;
  }
  
  /**
   * Subscribe to new messages
   */
  subscribeToMessages(onNewMessage: MessageCallback) {
    this.messagesChannel = supabase
      .channel('messages-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        async (payload) => {
          try {
            // When a new message comes in, fetch the complete data with character info
            const { data, error } = await supabase
              .from('messages')
              .select(`
                *,
                character:characters(*)
              `)
              .eq('id', payload.new.id)
              .single();
              
            if (error) throw error;
            
            if (data) {
              const newMessage = data as MessageWithCharacter;
              console.log('New message received:', newMessage);
              
              // Call the callback with the new message
              onNewMessage(newMessage);
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
      });
      
    return this.messagesChannel;
  }
  
  /**
   * Subscribe to new characters
   */
  subscribeToCharacters(onNewCharacter: CharacterCallback) {
    this.charactersChannel = supabase
      .channel('characters-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'characters' 
        }, 
        (payload) => {
          console.log('New character received:', payload.new);
          // Call the callback with the new character
          onNewCharacter(payload.new as Character);
        }
      )
      .subscribe((status) => {
        console.log('Characters subscription status:', status);
      });
      
    return this.charactersChannel;
  }
  
  /**
   * Fetch initial data (characters and messages)
   */
  async fetchInitialData() {
    try {
      // Fetch all characters
      const { data: charactersData, error: charactersError } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (charactersError) throw charactersError;
      
      // Fetch recent messages with character information
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          character:characters(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (messagesError) throw messagesError;
      
      return {
        characters: charactersData || [],
        messages: (messagesData || []) as MessageWithCharacter[]
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
  
  /**
   * Clean up subscriptions
   */
  cleanup() {
    if (this.messagesChannel) {
      supabase.removeChannel(this.messagesChannel);
    }
    if (this.charactersChannel) {
      supabase.removeChannel(this.charactersChannel);
    }
  }
}

export default new SupabaseService();
