// HomeOS Database Types
// These match the schema defined in supabase/schema_home.sql

export type InventoryCategory =
  | "appliance"
  | "electronics"
  | "furniture"
  | "hvac"
  | "plumbing"
  | "outdoor"
  | "vehicle"
  | "other";

export type SubscriptionFrequency = "monthly" | "quarterly" | "annual" | "other";

export type SubscriptionCategory =
  | "streaming"
  | "software"
  | "utilities"
  | "insurance"
  | "membership"
  | "other";

// ============================================
// Home Inventory
// ============================================

export interface HomeInventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: InventoryCategory;
  brand: string | null;
  model_number: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_location: string | null;
  warranty_expires: string | null;
  warranty_months: number | null;
  manual_url: string | null;
  support_phone: string | null;
  location_in_home: string | null;
  notes: string | null;
  photo_url: string | null;
  barcode: string | null;
  ai_enrichment_data: AIEnrichmentData | null;
  created_at: string;
  updated_at: string;
}

export interface AIEnrichmentData {
  warranty_months: number | null;
  manual_url: string | null;
  support_phone: string | null;
  support_url: string | null;
  suggested_maintenance: MaintenanceSuggestion[];
  product_info: {
    full_name: string | null;
    brand: string | null;
    model: string | null;
    category: string | null;
  };
  confidence: "high" | "medium" | "low";
  enriched_at: string;
}

export interface MaintenanceSuggestion {
  task: string;
  frequency_months: number;
}

// ============================================
// Subscriptions
// ============================================

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  cost: number;
  frequency: SubscriptionFrequency;
  category: SubscriptionCategory;
  next_billing_date: string | null;
  auto_renew: boolean;
  is_active: boolean;
  cancellation_url: string | null;
  cancellation_instructions: string | null;
  last_drafted_letter: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CancellationLetter {
  letter: string;
  subject_line: string;
  key_points: string[];
  legal_references: string[];
  recommended_send_method: "email" | "certified_mail" | "online_portal";
  follow_up_date: string;
}

// ============================================
// Vendors
// ============================================

export interface Vendor {
  id: string;
  user_id: string;
  name: string;
  trade: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  rating: number | null; // 1-5
  last_service_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorSearchResult extends Vendor {
  match_reason: string;
  similarity_score: number;
}

// ============================================
// Service Logs
// ============================================

export interface ServiceLog {
  id: string;
  user_id: string;
  vendor_id: string | null;
  inventory_item_id: string | null;
  service_date: string;
  description: string;
  cost: number | null;
  notes: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface ServiceLogWithRelations extends ServiceLog {
  vendor: Vendor | null;
  inventory_item: HomeInventoryItem | null;
}

// ============================================
// Maintenance Schedules
// ============================================

export interface MaintenanceSchedule {
  id: string;
  user_id: string;
  inventory_item_id: string | null;
  task_name: string;
  frequency_months: number;
  last_completed: string | null;
  next_due: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceScheduleWithItem extends MaintenanceSchedule {
  inventory_item: HomeInventoryItem | null;
}

// ============================================
// Home Documents
// ============================================

export type DocumentType =
  | "receipt"
  | "warranty"
  | "manual"
  | "contract"
  | "insurance"
  | "other";

export interface HomeDocument {
  id: string;
  user_id: string;
  inventory_item_id: string | null;
  subscription_id: string | null;
  vendor_id: string | null;
  document_type: DocumentType;
  name: string;
  file_url: string;
  notes: string | null;
  created_at: string;
}

// ============================================
// Dashboard Alerts
// ============================================

export interface HomeAlert {
  type: "warranty_expiring" | "subscription_billing" | "maintenance_overdue";
  item_id: string;
  item_name: string;
  due_date: string;
  days_until: number;
}

// ============================================
// Input Types for Creating/Updating
// ============================================

export interface CreateInventoryItemInput {
  name: string;
  category: InventoryCategory;
  brand?: string;
  model_number?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  purchase_location?: string;
  warranty_expires?: string;
  warranty_months?: number;
  manual_url?: string;
  support_phone?: string;
  location_in_home?: string;
  notes?: string;
  photo_url?: string;
  barcode?: string;
}

export interface CreateSubscriptionInput {
  name: string;
  cost: number;
  frequency: SubscriptionFrequency;
  category: SubscriptionCategory;
  next_billing_date?: string;
  auto_renew?: boolean;
  cancellation_url?: string;
  cancellation_instructions?: string;
  notes?: string;
}

export interface CreateVendorInput {
  name: string;
  trade: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  notes?: string;
  rating?: number;
}

export interface CreateServiceLogInput {
  vendor_id?: string;
  inventory_item_id?: string;
  service_date: string;
  description: string;
  cost?: number;
  notes?: string;
  receipt_url?: string;
}

export interface CreateMaintenanceScheduleInput {
  inventory_item_id?: string;
  task_name: string;
  frequency_months: number;
  last_completed?: string;
  notes?: string;
}

// ============================================
// Household Wiki (The Household Manual)
// ============================================

export type WikiEntryCategory =
  | 'wifi_network'
  | 'gate_codes'
  | 'trash_schedule'
  | 'utilities'
  | 'emergency_contacts'
  | 'parking'
  | 'appliance_tips'
  | 'seasonal'
  | 'other';

export interface HouseholdWikiEntry {
  id: string;
  user_id: string;
  property_id: string | null;
  category: WikiEntryCategory;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWikiEntryInput {
  property_id?: string;
  category: WikiEntryCategory;
  title: string;
  content: string;
  is_pinned?: boolean;
}

// ============================================
// Multi-Property Support
// ============================================

export interface Property {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  photo_url: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyInput {
  name: string;
  address?: string;
  photo_url?: string;
  is_primary?: boolean;
}
