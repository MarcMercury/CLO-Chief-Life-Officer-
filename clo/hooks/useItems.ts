import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { Item, ItemWithCircles, CircleType } from '@/types/database';

// Query keys
export const itemKeys = {
  all: ['items'] as const,
  byCircle: (circle: CircleType | 'ALL') => ['items', circle] as const,
};

// Fetch items with their circles
export function useItems(circleContext?: CircleType | 'ALL') {
  return useQuery({
    queryKey: itemKeys.byCircle(circleContext || 'ALL'),
    queryFn: async (): Promise<ItemWithCircles[]> => {
      // Use the view that already joins items with circles
      const { data, error } = await supabase
        .from('items_with_circles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const items = (data || []) as unknown as ItemWithCircles[];

      // Filter by circle if specified
      if (circleContext && circleContext !== 'ALL') {
        return items.filter((item) =>
          item.circles?.includes(circleContext)
        );
      }

      return items;
    },
  });
}

// Create item input type
interface CreateItemInput {
  title: string;
  description?: string;
  item_type: 'TASK' | 'NOTE' | 'EVENT' | 'MEMORY';
  circles: CircleType[];
  due_date?: string;
  metadata?: Record<string, any>;
}

// Create a new item
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateItemInput): Promise<Item> => {
      const { circles, ...itemData } = input;

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      // Insert the item
      const { data: item, error: itemError } = await supabase
        .from('items')
        .insert({
          user_id: user.id,
          title: itemData.title,
          description: itemData.description || null,
          item_type: itemData.item_type,
          status: 'PENDING',
          due_date: itemData.due_date || null,
          metadata: itemData.metadata || {},
        } as any)
        .select()
        .single();

      if (itemError) {
        throw new Error(itemError.message);
      }

      const createdItem = item as unknown as Item;

      // Insert circle associations
      if (circles.length > 0) {
        const circleInserts = circles.map((circle) => ({
          item_id: createdItem.id,
          circle,
        }));

        const { error: circleError } = await supabase
          .from('item_circles')
          .insert(circleInserts as any);

        if (circleError) {
          // Rollback: delete the item if circles fail
          await supabase.from('items').delete().eq('id', createdItem.id);
          throw new Error(circleError.message);
        }
      }

      return createdItem;
    },
    onSuccess: () => {
      // Invalidate all item queries
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      // Haptic success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// Update item status (for tasks)
interface UpdateItemStatusInput {
  itemId: string;
  status: 'PENDING' | 'COMPLETED' | 'ARCHIVED';
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, status }: UpdateItemStatusInput) => {
      const { data, error } = await (supabase
        .from('items') as any)
        .update({ status })
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Item;
    },
    // Optimistic update
    onMutate: async ({ itemId, status }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: itemKeys.all });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData(itemKeys.all);

      // Optimistically update
      queryClient.setQueriesData({ queryKey: itemKeys.all }, (old: any) => {
        if (!old) return old;
        return old.map((item: ItemWithCircles) =>
          item.id === itemId ? { ...item, status } : item
        );
      });

      Haptics.selectionAsync();

      return { previousItems };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(itemKeys.all, context.previousItems);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}

// Delete an item
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      // Delete circle associations first (foreign key constraint)
      await supabase.from('item_circles').delete().eq('item_id', itemId);

      // Delete the item
      const { error } = await supabase.from('items').delete().eq('id', itemId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// Update an item (title, metadata, etc.)
interface UpdateItemInput {
  itemId: string;
  updates: {
    title?: string;
    description?: string;
    metadata?: Record<string, any>;
    due_date?: string | null;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  };
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, updates }: UpdateItemInput) => {
      const { data, error } = await (supabase
        .from('items') as any)
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}
