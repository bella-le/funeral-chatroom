import { CharacterActivity, MessageWithCharacter } from './SupabaseService';

// Default inactivity threshold (5 minutes)
const DEFAULT_INACTIVITY_THRESHOLD = 5 * 60 * 1000;

export class ActivityManager {
  private activityRecords: CharacterActivity[];
  private inactivityThreshold: number;
  
  constructor(initialRecords: CharacterActivity[] = [], inactivityThreshold = DEFAULT_INACTIVITY_THRESHOLD) {
    this.activityRecords = initialRecords;
    this.inactivityThreshold = inactivityThreshold;
  }
  
  /**
   * Initialize activity records from messages
   */
  initializeFromMessages(messages: MessageWithCharacter[]): CharacterActivity[] {
    const activityMap: {[key: string]: number} = {};
    
    messages.forEach(msg => {
      const characterId = msg.character_id;
      const messageTime = new Date(msg.created_at || Date.now()).getTime();
      
      // Update the last activity time if this message is more recent
      if (!activityMap[characterId] || messageTime > activityMap[characterId]) {
        activityMap[characterId] = messageTime;
      }
    });
    
    // Convert to array format
    this.activityRecords = Object.entries(activityMap).map(([characterId, lastActive]) => ({
      characterId,
      lastActive
    }));
    
    return this.activityRecords;
  }
  
  /**
   * Update activity timestamp for a character
   */
  updateActivity(characterId: string): CharacterActivity[] {
    const now = Date.now();
    const existingIndex = this.activityRecords.findIndex(a => a.characterId === characterId);
    
    if (existingIndex >= 0) {
      // Update existing activity
      const updated = [...this.activityRecords];
      updated[existingIndex] = {
        ...updated[existingIndex],
        lastActive: now
      };
      this.activityRecords = updated;
    } else {
      // Add new activity record
      this.activityRecords = [...this.activityRecords, {
        characterId,
        lastActive: now
      }];
    }
    
    return this.activityRecords;
  }
  
  /**
   * Get all activity records
   */
  getActivityRecords(): CharacterActivity[] {
    return this.activityRecords;
  }
  
  /**
   * Set the inactivity threshold
   */
  setInactivityThreshold(threshold: number): void {
    this.inactivityThreshold = threshold;
  }
  
  /**
   * Get the inactivity threshold
   */
  getInactivityThreshold(): number {
    return this.inactivityThreshold;
  }
  
  /**
   * Check if a character is active
   */
  isCharacterActive(characterId: string): boolean {
    const now = Date.now();
    const activity = this.activityRecords.find(a => a.characterId === characterId);
    
    // If we have no activity record, or if the last activity is within threshold
    return !activity || (now - activity.lastActive) < this.inactivityThreshold;
  }
  
  /**
   * Filter active characters
   */
  filterActiveCharacters<T extends { id: string }>(characters: T[]): T[] {
    return characters.filter(character => this.isCharacterActive(character.id));
  }
}

export default ActivityManager;
