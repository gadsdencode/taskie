// Storage interface - currently unused as the app doesn't require user management
// This is kept for potential future features

export interface IStorage {
  // Storage methods can be added here when needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage if needed
  }
}

export const storage = new MemStorage();
