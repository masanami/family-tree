export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = Omit<User, 'password'>;

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const users: Map<string, User> = new Map();

export const UserModel = {
  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const user: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.set(user.id, user);
    return user;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  },

  findById: async (id: string): Promise<User | null> => {
    return users.get(id) || null;
  },

  toResponse: (user: User): UserResponse => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = user;
    return userResponse;
  },

  clearAll: (): void => {
    users.clear();
  }
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}