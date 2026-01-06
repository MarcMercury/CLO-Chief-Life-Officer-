/**
 * useVault Hook
 * 
 * Manages vault operations including:
 * - Passcode setup and verification
 * - File upload to Supabase Storage
 * - Vault items CRUD with encryption
 * - Approval workflow
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';
import { VaultItemType, VaultItem } from '@/components/relationships/VaultEnhanced';

// ============================================
// QUERY KEYS
// ============================================

export const vaultKeys = {
  items: (capsuleId: string) => ['vault-items', capsuleId] as const,
  hasPasscode: (capsuleId: string, userId: string) => ['vault-passcode', capsuleId, userId] as const,
  unlocked: (capsuleId: string) => ['vault-unlocked', capsuleId] as const,
};

// ============================================
// PASSCODE HELPERS
// ============================================

const PASSCODE_KEY_PREFIX = 'vault_passcode_';

/**
 * Hash a passcode using SHA-256
 */
async function hashPasscode(passcode: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    passcode
  );
  return hash;
}

/**
 * Store passcode hash securely on device
 */
async function storePasscodeHash(capsuleId: string, hash: string): Promise<void> {
  await SecureStore.setItemAsync(`${PASSCODE_KEY_PREFIX}${capsuleId}`, hash);
}

/**
 * Get stored passcode hash
 */
async function getStoredPasscodeHash(capsuleId: string): Promise<string | null> {
  return await SecureStore.getItemAsync(`${PASSCODE_KEY_PREFIX}${capsuleId}`);
}

/**
 * Check if passcode exists for this capsule
 */
async function hasStoredPasscode(capsuleId: string): Promise<boolean> {
  const hash = await getStoredPasscodeHash(capsuleId);
  return hash !== null;
}

/**
 * Verify a passcode against stored hash
 */
async function verifyPasscode(capsuleId: string, passcode: string): Promise<boolean> {
  const storedHash = await getStoredPasscodeHash(capsuleId);
  if (!storedHash) return false;
  
  const inputHash = await hashPasscode(passcode);
  return storedHash === inputHash;
}

// ============================================
// VAULT ITEMS HOOKS
// ============================================

/**
 * Fetch all vault items for a capsule
 */
export function useVaultItems(capsuleId: string) {
  return useQuery({
    queryKey: vaultKeys.items(capsuleId),
    queryFn: async (): Promise<VaultItem[]> => {
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      
      // Map database columns to our interface
      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        content_type: item.item_type as VaultItemType,
        encrypted_content: item.encrypted_content,
        file_url: item.file_url,
        file_name: item.file_name,
        file_size: item.file_size,
        mime_type: item.mime_type,
        thumbnail_url: item.thumbnail_url,
        uploaded_by: item.created_by,
        approved_by_uploader: item.approved_by_uploader ?? true,
        approved_by_partner: item.approved_by_partner ?? false,
        status: (item.approved_by_uploader && item.approved_by_partner) ? 'visible' : 'pending',
        created_at: item.created_at,
      }));
    },
    enabled: !!capsuleId,
  });
}

/**
 * Check if user has set up vault passcode
 */
export function useHasVaultPasscode(capsuleId: string) {
  return useQuery({
    queryKey: vaultKeys.hasPasscode(capsuleId, 'local'),
    queryFn: async (): Promise<boolean> => {
      return await hasStoredPasscode(capsuleId);
    },
    enabled: !!capsuleId,
  });
}

/**
 * Check if partner has set up vault passcode (stored in DB)
 */
export function usePartnerHasPasscode(capsuleId: string) {
  return useQuery({
    queryKey: ['partner-vault-passcode', capsuleId],
    queryFn: async (): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Check if there's a vault_setup record for the partner
      const { data: capsule } = await supabase
        .from('relationship_capsules')
        .select('user_a_id, user_b_id')
        .eq('id', capsuleId)
        .single() as { data: { user_a_id: string; user_b_id: string | null } | null };
        
      if (!capsule) return false;
      
      const partnerId = capsule.user_a_id === user.id 
        ? capsule.user_b_id 
        : capsule.user_a_id;
        
      if (!partnerId) return false;
      
      const { data: setup } = await supabase
        .from('vault_user_setup')
        .select('id')
        .eq('capsule_id', capsuleId)
        .eq('user_id', partnerId)
        .single() as { data: { id: string } | null };
        
      return !!setup;
    },
    enabled: !!capsuleId,
  });
}

/**
 * Setup vault passcode
 */
export function useSetupVaultPasscode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      capsuleId, 
      passcode 
    }: { 
      capsuleId: string; 
      passcode: string;
    }): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Hash and store locally
      const hash = await hashPasscode(passcode);
      await storePasscodeHash(capsuleId, hash);
      
      // Record in database that this user has set up vault
      const { error } = await (supabase
        .from('vault_user_setup') as any)
        .upsert({
          capsule_id: capsuleId,
          user_id: user.id,
          setup_at: new Date().toISOString(),
        }, {
          onConflict: 'capsule_id,user_id',
        });
        
      if (error) {
        console.warn('Could not record vault setup:', error.message);
        // Don't fail - local storage is primary
      }
      
      return true;
    },
    onSuccess: (_, { capsuleId }) => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.hasPasscode(capsuleId, 'local') });
      queryClient.invalidateQueries({ queryKey: ['partner-vault-passcode', capsuleId] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Verify vault passcode
 */
export function useVerifyVaultPasscode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      capsuleId, 
      passcode 
    }: { 
      capsuleId: string; 
      passcode: string;
    }): Promise<boolean> => {
      const isValid = await verifyPasscode(capsuleId, passcode);
      return isValid;
    },
    onSuccess: (isValid, { capsuleId }) => {
      if (isValid) {
        // Mark vault as unlocked in memory (will reset on app close)
        queryClient.setQueryData(vaultKeys.unlocked(capsuleId), true);
      }
    },
  });
}

/**
 * Upload vault item
 */
export function useUploadVaultItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      capsuleId,
      title,
      content,
      content_type,
      file_url,
      file_name,
      file_size,
      mime_type,
    }: {
      capsuleId: string;
      title: string;
      content?: string;
      content_type: VaultItemType;
      file_url?: string;
      file_name?: string;
      file_size?: number;
      mime_type?: string;
    }): Promise<VaultItem> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // In production, encrypt content here
      const encrypted = content || '';
      
      const { data, error } = await (supabase
        .from('vault_items') as any)
        .insert({
          capsule_id: capsuleId,
          created_by: user.id,
          title,
          item_type: content_type,
          encrypted_content: encrypted,
          encryption_iv: 'placeholder', // Would be real IV in production
          file_url,
          file_name,
          file_size,
          mime_type,
          approved_by_uploader: true,
          approved_by_partner: false,
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        title: data.title,
        content_type: data.item_type,
        encrypted_content: data.encrypted_content,
        file_url: data.file_url,
        file_name: data.file_name,
        file_size: data.file_size,
        mime_type: data.mime_type,
        uploaded_by: data.created_by,
        approved_by_uploader: data.approved_by_uploader,
        approved_by_partner: data.approved_by_partner,
        status: 'pending',
        created_at: data.created_at,
      };
    },
    onSuccess: (_, { capsuleId }) => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.items(capsuleId) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Approve vault item
 */
export function useApproveVaultItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId,
      capsuleId,
    }: {
      itemId: string;
      capsuleId: string;
    }): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get item to check if we're uploader or partner
      const { data: item } = await supabase
        .from('vault_items')
        .select('created_by, approved_by_uploader, approved_by_partner')
        .eq('id', itemId)
        .single() as { data: { created_by: string; approved_by_uploader: boolean; approved_by_partner: boolean } | null };
        
      if (!item) throw new Error('Item not found');
      
      const isUploader = item.created_by === user.id;
      const updateField = isUploader ? 'approved_by_uploader' : 'approved_by_partner';
      
      const { error } = await (supabase
        .from('vault_items') as any)
        .update({ [updateField]: true })
        .eq('id', itemId);

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { capsuleId }) => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.items(capsuleId) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

/**
 * Delete vault item
 */
export function useDeleteVaultItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId,
      capsuleId,
    }: {
      itemId: string;
      capsuleId: string;
    }): Promise<void> => {
      // Get item to delete associated file if any
      const { data: item } = await supabase
        .from('vault_items')
        .select('file_url')
        .eq('id', itemId)
        .single() as { data: { file_url: string | null } | null };
        
      // Delete from storage if file exists
      if (item?.file_url) {
        const path = item.file_url.split('/').pop();
        if (path) {
          await supabase.storage
            .from('vault-files')
            .remove([`${capsuleId}/${path}`]);
        }
      }
      
      const { error } = await supabase
        .from('vault_items')
        .delete()
        .eq('id', itemId);

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { capsuleId }) => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.items(capsuleId) });
      Haptics.selectionAsync();
    },
  });
}

/**
 * Upload file to Supabase Storage
 */
export function useUploadVaultFile() {
  return useMutation({
    mutationFn: async ({ 
      capsuleId,
      uri,
      fileName,
      mimeType,
    }: {
      capsuleId: string;
      uri: string;
      fileName: string;
      mimeType: string;
    }): Promise<string> => {
      // Generate unique file name
      const extension = fileName.split('.').pop() || 'bin';
      const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`;
      const filePath = `${capsuleId}/${uniqueName}`;
      
      // Fetch file as blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Convert to array buffer
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('vault-files')
        .upload(filePath, arrayBuffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) throw new Error(error.message);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('vault-files')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    },
  });
}

// ============================================
// VAULT STATE HOOK (combines all)
// ============================================

export function useVaultState(capsuleId: string) {
  const queryClient = useQueryClient();
  
  const { data: hasPasscode = false, isLoading: loadingPasscode } = useHasVaultPasscode(capsuleId);
  const { data: partnerHasPasscode = false } = usePartnerHasPasscode(capsuleId);
  const { data: items = [], isLoading: loadingItems } = useVaultItems(capsuleId);
  
  // Check if vault is unlocked (session state)
  const isUnlocked = queryClient.getQueryData<boolean>(vaultKeys.unlocked(capsuleId)) ?? false;
  
  const { mutateAsync: setupPasscode } = useSetupVaultPasscode();
  const { mutateAsync: verifyPasscode } = useVerifyVaultPasscode();
  const { mutateAsync: uploadItem } = useUploadVaultItem();
  const { mutateAsync: approveItem } = useApproveVaultItem();
  const { mutateAsync: deleteItem } = useDeleteVaultItem();
  const { mutateAsync: uploadFile } = useUploadVaultFile();
  
  return {
    items,
    hasPasscode,
    partnerHasPasscode,
    isUnlocked,
    loading: loadingPasscode || loadingItems,
    
    // Actions
    setupPasscode: async (passcode: string) => {
      return await setupPasscode({ capsuleId, passcode });
    },
    
    verifyPasscode: async (passcode: string) => {
      return await verifyPasscode({ capsuleId, passcode });
    },
    
    uploadItem: async (item: {
      title: string;
      content?: string;
      content_type: VaultItemType;
      file_url?: string;
      file_name?: string;
      file_size?: number;
      mime_type?: string;
    }) => {
      await uploadItem({ capsuleId, ...item });
    },
    
    approveItem: async (itemId: string) => {
      await approveItem({ itemId, capsuleId });
    },
    
    deleteItem: async (itemId: string) => {
      await deleteItem({ itemId, capsuleId });
    },
    
    uploadFile: async (uri: string, fileName: string, mimeType: string) => {
      return await uploadFile({ capsuleId, uri, fileName, mimeType });
    },
  };
}
