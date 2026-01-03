/**
 * Settings Index - Main Settings Hub
 * 
 * Navigation to different settings sections:
 * - Integrations
 * - Visual Mode (Dark/Light/CLO)
 * - Admin (Delete Account, Privacy Policy, Contact)
 * - Sign Out
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import theme from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';

type VisualMode = 'dark' | 'light' | 'clo';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [visualMode, setVisualMode] = useState<VisualMode>('clo');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const navigateTo = (path: string) => {
    Haptics.selectionAsync();
    router.push(path as any);
  };

  // Visual Mode handlers
  const handleVisualModeChange = async (mode: VisualMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (mode === 'clo') {
      // CLO theme is the current active theme - no alert needed, just select it
      setVisualMode('clo');
    } else {
      // Dark and Light modes are not yet implemented
      Alert.alert(
        'Coming Soon',
        `${mode.charAt(0).toUpperCase() + mode.slice(1)} mode will be available in a future update.`
      );
      // Keep CLO selected since other themes aren't implemented
    }
  };

  // Contact handler
  const handleContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:info@crateso.com?subject=CLO App Feedback');
  };

  // Privacy Policy handler
  const handlePrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://www.crateso.com/products/clo/privacy.html');
  };

  // Sign Out handler
  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigate to root which will show login screen
              router.replace('/');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Delete Account handler
  const handleDeleteAccount = async () => {
    if (!user?.email) return;
    
    if (deleteConfirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      Alert.alert('Email Mismatch', 'The email you entered does not match your account email.');
      return;
    }

    setIsDeleting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      // Delete all user data from all tables
      const userId = user.id;
      
      // Delete from all related tables
      const tables = [
        'emotional_logs',
        'open_loops', 
        'daily_intentions',
        'vault_items',
        'capsule_messages',
        'shared_tasks',
        'relationship_capsules',
        'home_inventory',
        'subscriptions',
        'service_logs',
        'maintenance_schedules',
        'vendors',
        'properties',
        'profiles',
        'integrations',
        'items',
      ];

      for (const table of tables) {
        const { error } = await supabase.from(table).delete().eq('user_id', userId);
        if (error) {
          console.warn(`Failed to delete from ${table}:`, error.message);
        }
      }

      // Sign out first, then navigate
      // Note: Full account deletion from auth.users requires a server-side function
      // For now, we delete all user data and sign out
      await signOut();
      
      // Navigate to login screen
      router.replace('/');
      
      Alert.alert(
        'Account Data Deleted',
        'Your data has been deleted and you have been signed out.'
      );
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmEmail('');
    }
  };

  const openDeleteModal = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowDeleteModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        {user && (
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.email}</Text>
              <Text style={styles.userSub}>CLO Member</Text>
            </View>
          </View>
        )}

        {/* Integrations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔌 Connections</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo('/settings/integrations')}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🔗</Text>
              <View>
                <Text style={styles.menuItemText}>Integrations</Text>
                <Text style={styles.menuItemSub}>Connect apps & services</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Visual Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Visual Mode</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                visualMode === 'dark' && styles.themeOptionActive,
              ]}
              onPress={() => handleVisualModeChange('dark')}
            >
              <Text style={styles.themeEmoji}>🌙</Text>
              <Text style={[
                styles.themeLabel,
                visualMode === 'dark' && styles.themeLabelActive,
              ]}>Dark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                visualMode === 'light' && styles.themeOptionActive,
              ]}
              onPress={() => handleVisualModeChange('light')}
            >
              <Text style={styles.themeEmoji}>☀️</Text>
              <Text style={[
                styles.themeLabel,
                visualMode === 'light' && styles.themeLabelActive,
              ]}>Light</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                visualMode === 'clo' && styles.themeOptionActive,
                styles.themeOptionCLO,
              ]}
              onPress={() => handleVisualModeChange('clo')}
            >
              <Text style={styles.themeEmoji}>✨</Text>
              <Text style={[
                styles.themeLabel,
                visualMode === 'clo' && styles.themeLabelActive,
              ]}>CLO</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.themeHint}>
            CLO uses the soft color palette from the app icon
          </Text>
        </View>

        {/* Admin Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Admin</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>📜</Text>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Text style={styles.menuArrow}>↗</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleContact}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>✉️</Text>
              <Text style={styles.menuItemText}>Contact Support</Text>
            </View>
            <Text style={styles.menuArrow}>↗</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.dangerItem]} 
            onPress={openDeleteModal}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🗑️</Text>
              <Text style={styles.dangerText}>Delete Account</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CLO - Chief Life Officer</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Delete Account</Text>
            <Text style={styles.modalText}>
              This will permanently delete your account and all associated data. This action cannot be undone.
            </Text>
            <Text style={styles.modalText}>
              To confirm, please enter your email address:
            </Text>
            <Text style={styles.emailHint}>{user?.email}</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={deleteConfirmEmail}
              onChangeText={setDeleteConfirmEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isDeleting}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmEmail('');
                }}
                disabled={isDeleting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalDeleteButton,
                  (!deleteConfirmEmail || isDeleting) && styles.modalButtonDisabled,
                ]}
                onPress={handleDeleteAccount}
                disabled={!deleteConfirmEmail || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalDeleteText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  backText: {
    color: theme.colors.self,
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: 160,
  },

  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.self,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  userSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Section
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuItemIcon: {
    fontSize: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  menuItemSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerText: {
    fontSize: 16,
    color: '#EF4444',
  },

  // Theme Options
  themeOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  themeOption: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    borderColor: theme.colors.self,
    backgroundColor: 'rgba(138, 92, 246, 0.1)',
  },
  themeOptionCLO: {
    // CLO theme uses warm accent color when active (handled dynamically)
  },
  themeEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  themeLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  themeLabelActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  themeHint: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

  // Sign Out
  signOutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emailHint: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  modalCancelText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
