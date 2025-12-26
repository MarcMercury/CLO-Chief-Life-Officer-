/**
 * HomeOS Service
 * 
 * API layer for the CHO (Chief Household Officer) Dashboard.
 * Uses the HomeOS Supabase project for data storage.
 */

import { homeosSupabase as supabase } from '@/lib/homeosSupabase';
import {
  HomeInventoryItem,
  Subscription,
  Vendor,
  ServiceLog,
  MaintenanceSchedule,
  CreateInventoryItemInput,
  CreateSubscriptionInput,
  CreateVendorInput,
  CreateServiceLogInput,
  CreateMaintenanceScheduleInput,
  HomeAlert,
  VendorSearchResult,
} from '@/types/homeos';

// ============================================
// INVENTORY OPERATIONS
// ============================================

export async function getInventoryItems(): Promise<HomeInventoryItem[]> {
  const { data, error } = await (supabase as any)
    .from('home_inventory')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch inventory:', error);
    return [];
  }
  return data || [];
}

export async function getInventoryItem(id: string): Promise<HomeInventoryItem | null> {
  const { data, error } = await (supabase as any)
    .from('home_inventory')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch inventory item:', error);
    return null;
  }
  return data;
}

export async function createInventoryItem(
  input: CreateInventoryItemInput
): Promise<{ data: HomeInventoryItem | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await (supabase as any)
    .from('home_inventory')
    .insert({
      user_id: user.id,
      product_name: input.name,
      category: input.category,
      brand: input.brand,
      model_number: input.model_number,
      serial_number: input.serial_number,
      purchase_date: input.purchase_date,
      purchase_price: input.purchase_price,
      warranty_months: input.warranty_months,
      location: input.location_in_home,
      barcode: input.barcode,
      notes: input.notes,
      product_image_url: input.photo_url,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create inventory item:', error);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<CreateInventoryItemInput>
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await (supabase as any)
    .from('home_inventory')
    .update({
      product_name: updates.name,
      category: updates.category,
      brand: updates.brand,
      model_number: updates.model_number,
      serial_number: updates.serial_number,
      purchase_date: updates.purchase_date,
      purchase_price: updates.purchase_price,
      warranty_months: updates.warranty_months,
      location: updates.location_in_home,
      notes: updates.notes,
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update inventory item:', error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function deleteInventoryItem(id: string): Promise<{ success: boolean; error: string | null }> {
  const { error } = await (supabase as any)
    .from('home_inventory')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete inventory item:', error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

// ============================================
// SUBSCRIPTION OPERATIONS
// ============================================

export async function getSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await (supabase as any)
    .from('subscriptions')
    .select('*')
    .order('next_billing_date', { ascending: true });

  if (error) {
    console.error('Failed to fetch subscriptions:', error);
    return [];
  }
  return data || [];
}

export async function getSubscription(id: string): Promise<Subscription | null> {
  const { data, error } = await (supabase as any)
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch subscription:', error);
    return null;
  }
  return data;
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<{ data: Subscription | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await (supabase as any)
    .from('subscriptions')
    .insert({
      user_id: user.id,
      service_name: input.name,
      cost: input.cost,
      billing_cycle: input.frequency,
      category: input.category,
      next_billing_date: input.next_billing_date,
      status: 'ACTIVE',
      importance: 'OPTIONAL',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create subscription:', error);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function updateSubscription(
  id: string,
  updates: Partial<CreateSubscriptionInput & { status?: string; importance?: string }>
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await (supabase as any)
    .from('subscriptions')
    .update({
      service_name: updates.name,
      cost: updates.cost,
      billing_cycle: updates.frequency,
      category: updates.category,
      next_billing_date: updates.next_billing_date,
      status: updates.status,
      importance: updates.importance,
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update subscription:', error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function cancelSubscription(id: string): Promise<{ success: boolean; error: string | null }> {
  const { error } = await (supabase as any)
    .from('subscriptions')
    .update({ status: 'CANCELLED' })
    .eq('id', id);

  if (error) {
    console.error('Failed to cancel subscription:', error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

// ============================================
// VENDOR OPERATIONS
// ============================================

export async function getVendors(): Promise<Vendor[]> {
  const { data, error } = await (supabase as any)
    .from('vendors')
    .select('*')
    .order('last_service_date', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Failed to fetch vendors:', error);
    return [];
  }
  return data || [];
}

export async function getVendor(id: string): Promise<Vendor | null> {
  const { data, error } = await (supabase as any)
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch vendor:', error);
    return null;
  }
  return data;
}

export async function searchVendors(searchTerm: string): Promise<VendorSearchResult[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await (supabase as any)
    .rpc('search_vendors', {
      search_term: searchTerm,
      user_id_param: user.id,
    });

  if (error) {
    console.error('Failed to search vendors:', error);
    return [];
  }
  return data || [];
}

export async function createVendor(
  input: CreateVendorInput
): Promise<{ data: Vendor | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await (supabase as any)
    .from('vendors')
    .insert({
      user_id: user.id,
      company_name: input.name,
      trade: input.trade,
      contact_person: input.name,
      phone: input.phone,
      email: input.email,
      website: input.website,
      rating: input.rating,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create vendor:', error);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function updateVendor(
  id: string,
  updates: Partial<CreateVendorInput>
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await (supabase as any)
    .from('vendors')
    .update({
      company_name: updates.name,
      trade: updates.trade,
      phone: updates.phone,
      email: updates.email,
      website: updates.website,
      rating: updates.rating,
      notes: updates.notes,
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update vendor:', error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

// ============================================
// SERVICE LOG OPERATIONS
// ============================================

export async function getServiceLogs(vendorId?: string): Promise<ServiceLog[]> {
  let query = (supabase as any)
    .from('service_logs')
    .select('*, vendor:vendors(*)')
    .order('service_date', { ascending: false });

  if (vendorId) {
    query = query.eq('vendor_id', vendorId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch service logs:', error);
    return [];
  }
  return data || [];
}

export async function createServiceLog(
  input: CreateServiceLogInput
): Promise<{ data: ServiceLog | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await (supabase as any)
    .from('service_logs')
    .insert({
      user_id: user.id,
      vendor_id: input.vendor_id,
      inventory_id: input.inventory_item_id,
      service_date: input.service_date,
      description: input.description,
      cost: input.cost,
      notes: input.notes,
      receipt_url: input.receipt_url,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create service log:', error);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

// ============================================
// MAINTENANCE OPERATIONS
// ============================================

export async function getMaintenanceSchedules(): Promise<MaintenanceSchedule[]> {
  const { data, error } = await (supabase as any)
    .from('maintenance_schedules')
    .select('*, inventory:home_inventory(*)')
    .eq('is_active', true)
    .order('next_due_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch maintenance schedules:', error);
    return [];
  }
  return data || [];
}

export async function createMaintenanceSchedule(
  input: CreateMaintenanceScheduleInput
): Promise<{ data: MaintenanceSchedule | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  // Calculate next_due based on frequency
  const nextDue = input.last_completed 
    ? new Date(new Date(input.last_completed).getTime() + input.frequency_months * 30 * 24 * 60 * 60 * 1000)
    : new Date();

  const { data, error } = await (supabase as any)
    .from('maintenance_schedules')
    .insert({
      user_id: user.id,
      inventory_id: input.inventory_item_id,
      title: input.task_name,
      description: input.notes,
      frequency_days: input.frequency_months * 30,
      last_completed_at: input.last_completed,
      next_due_at: nextDue.toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create maintenance schedule:', error);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function completeMaintenanceTask(id: string): Promise<{ success: boolean; error: string | null }> {
  // Get the current schedule to calculate next due date
  const { data: schedule } = await (supabase as any)
    .from('maintenance_schedules')
    .select('frequency_days')
    .eq('id', id)
    .single();

  if (!schedule) {
    return { success: false, error: 'Schedule not found' };
  }

  const now = new Date();
  const nextDue = new Date(now.getTime() + schedule.frequency_days * 24 * 60 * 60 * 1000);

  const { error } = await (supabase as any)
    .from('maintenance_schedules')
    .update({
      last_completed_at: now.toISOString(),
      next_due_at: nextDue.toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to complete maintenance task:', error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

// ============================================
// ALERTS & STATS
// ============================================

export async function getHomeAlerts(): Promise<HomeAlert[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await (supabase as any)
    .rpc('get_home_alerts', { user_id_param: user.id });

  if (error) {
    console.error('Failed to fetch home alerts:', error);
    return [];
  }

  // Transform the response into a flat array of alerts
  const alerts: HomeAlert[] = [];
  
  if (data?.expiring_warranties) {
    data.expiring_warranties.forEach((w: any) => {
      alerts.push({
        type: 'warranty_expiring',
        item_id: w.id,
        item_name: w.product_name,
        due_date: w.warranty_expiration,
        days_until: w.days_remaining,
      });
    });
  }

  if (data?.upcoming_bills) {
    data.upcoming_bills.forEach((b: any) => {
      alerts.push({
        type: 'subscription_billing',
        item_id: b.id,
        item_name: b.service_name,
        due_date: b.next_billing_date,
        days_until: Math.ceil((new Date(b.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      });
    });
  }

  if (data?.overdue_maintenance) {
    data.overdue_maintenance.forEach((m: any) => {
      alerts.push({
        type: 'maintenance_overdue',
        item_id: m.id,
        item_name: m.title,
        due_date: m.next_due_at,
        days_until: -m.days_overdue,
      });
    });
  }

  return alerts.sort((a, b) => a.days_until - b.days_until);
}

export async function getHomeStats(): Promise<{
  inventoryCount: number;
  inventoryValue: number;
  activeSubscriptions: number;
  monthlyBurn: number;
  vendorCount: number;
  overdueMaintenanceCount: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      inventoryCount: 0,
      inventoryValue: 0,
      activeSubscriptions: 0,
      monthlyBurn: 0,
      vendorCount: 0,
      overdueMaintenanceCount: 0,
    };
  }

  // Get inventory stats
  const { data: inventory } = await (supabase as any)
    .from('home_inventory')
    .select('purchase_price');

  const inventoryCount = inventory?.length || 0;
  const inventoryValue = inventory?.reduce((sum: number, item: any) => sum + (item.purchase_price || 0), 0) || 0;

  // Get subscription stats
  const { data: subscriptions } = await (supabase as any)
    .from('subscriptions')
    .select('cost, billing_cycle, status')
    .eq('status', 'ACTIVE');

  const activeSubscriptions = subscriptions?.length || 0;
  const monthlyBurn = subscriptions?.reduce((sum: number, sub: any) => {
    let monthly = sub.cost;
    switch (sub.billing_cycle) {
      case 'weekly': monthly = sub.cost * 4; break;
      case 'quarterly': monthly = sub.cost / 3; break;
      case 'yearly': monthly = sub.cost / 12; break;
    }
    return sum + monthly;
  }, 0) || 0;

  // Get vendor count
  const { count: vendorCount } = await (supabase as any)
    .from('vendors')
    .select('*', { count: 'exact', head: true });

  // Get overdue maintenance count
  const { count: overdueMaintenanceCount } = await (supabase as any)
    .from('maintenance_schedules')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .lt('next_due_at', new Date().toISOString());

  return {
    inventoryCount,
    inventoryValue,
    activeSubscriptions,
    monthlyBurn: Math.round(monthlyBurn * 100) / 100,
    vendorCount: vendorCount || 0,
    overdueMaintenanceCount: overdueMaintenanceCount || 0,
  };
}
