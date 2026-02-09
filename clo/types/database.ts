export type CircleType = 'SELF' | 'RELATIONSHIPS' | 'HOME';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio_metric_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  item_type: 'TASK' | 'NOTE' | 'EVENT' | 'MEMORY';
  status: 'PENDING' | 'COMPLETED' | 'ARCHIVED';
  due_date: string | null;
  external_source: string | null;
  external_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ItemCircle {
  item_id: string;
  circle: CircleType;
  created_at: string;
}

export interface ItemWithCircles extends Item {
  circles: CircleType[];
}

export interface Relationship {
  id: string;
  user_id: string;
  contact_name: string;
  contact_avatar: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  last_interaction: string | null;
  rhythm_frequency_days: number;
  is_pinned: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      items: {
        Row: Item;
        Insert: Omit<Item, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      item_circles: {
        Row: ItemCircle;
        Insert: Omit<ItemCircle, 'created_at'>;
        Update: never;
      };
      relationships: {
        Row: Relationship;
        Insert: Omit<Relationship, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Relationship, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      integrations: {
        Row: Integration;
        Insert: Omit<Integration, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Integration, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      items_with_circles: {
        Row: ItemWithCircles;
      };
    };
  };
}
