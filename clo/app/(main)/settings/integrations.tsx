/**
 * IntegrationsScreen
 * 
 * Settings screen for managing all third-party integrations.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useAuth } from '@/providers/AuthProvider';
import { IntegrationCard } from '@/components/settings/IntegrationCard';
import { IntegrationProvider } from '@/types/integrations';
import theme from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export default function IntegrationsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const {
    isLoading,
    refetch,
    saveApiKey,
    disconnect,
    isSaving,
    isDisconnecting,
    getIntegrationList,
  } = useIntegrations();

  const [refreshing, setRefreshing] = React.useState(false);

  const integrationList = getIntegrationList();
  
  // Group by category
  const categories = {
    weather: integrationList.filter(i => i.category === 'weather'),
    calendar: integrationList.filter(i => i.category === 'calendar'),
    health: integrationList.filter(i => i.category === 'health'),
    music: integrationList.filter(i => i.category === 'music'),
    home: integrationList.filter(i => i.category === 'home'),
    finance: integrationList.filter(i => i.category === 'finance'),
    contacts: integrationList.filter(i => i.category === 'contacts'),
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

  const handleConnect = async (provider: IntegrationProvider, apiKey: string) => {
    await saveApiKey({ provider, apiKey });
  };

  const handleDisconnect = async (provider: IntegrationProvider) => {
    await disconnect(provider);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.self} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Integrations</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.self}
          />
        }
      >
        <Text style={styles.subtitle}>
          Connect your apps and services to power your dashboard
        </Text>

        {/* Weather */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌤️ Weather</Text>
          {categories.weather.map(item => (
            <IntegrationCard
              key={item.provider}
              config={item}
              integration={item.integration}
              connected={item.connected}
              onConnect={(apiKey) => handleConnect(item.provider, apiKey)}
              onDisconnect={() => handleDisconnect(item.provider)}
              isLoading={isSaving || isDisconnecting}
            />
          ))}
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Calendar</Text>
          {categories.calendar.map(item => (
            <IntegrationCard
              key={item.provider}
              config={item}
              integration={item.integration}
              connected={item.connected}
              onConnect={(apiKey) => handleConnect(item.provider, apiKey)}
              onDisconnect={() => handleDisconnect(item.provider)}
              isLoading={isSaving || isDisconnecting}
            />
          ))}
        </View>

        {/* Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❤️ Health & Fitness</Text>
          {categories.health.map(item => (
            <IntegrationCard
              key={item.provider}
              config={item}
              integration={item.integration}
              connected={item.connected}
              onConnect={(apiKey) => handleConnect(item.provider, apiKey)}
              onDisconnect={() => handleDisconnect(item.provider)}
              isLoading={isSaving || isDisconnecting}
            />
          ))}
        </View>

        {/* Music */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵 Music</Text>
          {categories.music.map(item => (
            <IntegrationCard
              key={item.provider}
              config={item}
              integration={item.integration}
              connected={item.connected}
              onConnect={(apiKey) => handleConnect(item.provider, apiKey)}
              onDisconnect={() => handleDisconnect(item.provider)}
              isLoading={isSaving || isDisconnecting}
            />
          ))}
        </View>

        {/* Smart Home */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Smart Home</Text>
          {categories.home.map(item => (
            <IntegrationCard
              key={item.provider}
              config={item}
              integration={item.integration}
              connected={item.connected}
              onConnect={(apiKey) => handleConnect(item.provider, apiKey)}
              onDisconnect={() => handleDisconnect(item.provider)}
              isLoading={isSaving || isDisconnecting}
            />
          ))}
        </View>

        {/* Finance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Finance & Budget</Text>
          {categories.finance.map(item => (
            <IntegrationCard
              key={item.provider}
              config={item}
              integration={item.integration}
              connected={item.connected}
              onConnect={(apiKey) => handleConnect(item.provider, apiKey)}
              onDisconnect={() => handleDisconnect(item.provider)}
              isLoading={isSaving || isDisconnecting}
            />
          ))}
        </View>

        {/* Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Contacts & Relationships</Text>
          {categories.contacts.map(item => (
            <IntegrationCard
              key={item.provider}
              config={item}
              integration={item.integration}
              connected={item.connected}
              onConnect={(apiKey) => handleConnect(item.provider, apiKey)}
              onDisconnect={() => handleDisconnect(item.provider)}
              isLoading={isSaving || isDisconnecting}
            />
          ))}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Account</Text>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={async () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await signOut();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your credentials are encrypted and stored securely.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
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
  footer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
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
});
