import { DisplayMessage } from './SupabaseService';

// Default message display duration (7 seconds)
const DEFAULT_MESSAGE_DURATION = 7000;

export class MessageManager {
  private messages: {[key: string]: DisplayMessage};
  private messageDuration: number;
  
  constructor(initialMessages: {[key: string]: DisplayMessage} = {}, messageDuration = DEFAULT_MESSAGE_DURATION) {
    this.messages = initialMessages;
    this.messageDuration = messageDuration;
  }
  
  /**
   * Add a new message
   */
  addMessage(characterId: string, content: string): {[key: string]: DisplayMessage} {
    this.messages = {
      ...this.messages,
      [characterId]: {
        content,
        timestamp: Date.now(),
        opacity: 1
      }
    };
    
    return this.messages;
  }
  
  /**
   * Update message opacities based on age
   */
  updateMessageOpacities(): {[key: string]: DisplayMessage} {
    const now = Date.now();
    const updatedMessages: {[key: string]: DisplayMessage} = {};
    let hasChanges = false;
    
    // Calculate new opacity for each message
    Object.entries(this.messages).forEach(([characterId, message]) => {
      const age = now - message.timestamp;
      
      // If message is older than duration, remove it
      if (age > this.messageDuration) {
        hasChanges = true;
        return; // Skip this message (don't add to updatedMessages)
      }
      
      // Calculate fade out during the last 2 seconds
      const fadeStartTime = this.messageDuration - 2000;
      let newOpacity = message.opacity;
      
      if (age > fadeStartTime) {
        // Linear fade from 1 to 0 during the last 2 seconds
        newOpacity = Math.max(0, 1 - (age - fadeStartTime) / 2000);
        hasChanges = true;
      }
      
      // Only update if opacity changed
      if (newOpacity !== message.opacity) {
        updatedMessages[characterId] = {
          ...message,
          opacity: newOpacity
        };
      } else {
        updatedMessages[characterId] = message;
      }
    });
    
    // Only update state if there were changes
    if (hasChanges) {
      this.messages = updatedMessages;
    }
    
    return this.messages;
  }
  
  /**
   * Get all messages
   */
  getMessages(): {[key: string]: DisplayMessage} {
    return this.messages;
  }
  
  /**
   * Set the message duration
   */
  setMessageDuration(duration: number): void {
    this.messageDuration = duration;
  }
  
  /**
   * Get the message duration
   */
  getMessageDuration(): number {
    return this.messageDuration;
  }
}

export default MessageManager;
