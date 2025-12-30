/**
 * IntegrationCard Component
 * 
 * Displays an integration with connect/disconnect actions.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { IntegrationConfig, StoredIntegration } from '@/types/integrations';
import theme from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface IntegrationCardProps {
  config: IntegrationConfig;
  integration?: StoredIntegration;
  connected: boolean;
  onConnect: (apiKey: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  isLoading?: boolean;
}

export function IntegrationCard({
  config,
  integration,
  connected,
  onConnect,
  onDisconnect,
  isLoading,
}: IntegrationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = () => {
    Haptics.selectionAsync();
    setIsExpanded(!isExpanded);
    setApiKey('');
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConnect(apiKey.trim());
      setApiKey('');
      setIsExpanded(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect integration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Integration',
      `Are you sure you want to disconnect ${config.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDisconnect();
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect');
            }
          },
        },
      ]
    );
  };

  const lastSynced = integration?.last_synced_at
    ? new Date(integration.last_synced_at).toLocaleString()
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name}>{config.name}</Text>
          <Text style={styles.description}>{config.description}</Text>
          {connected && lastSynced && (
            <Text style={styles.lastSynced}>Last synced: {lastSynced}</Text>
          )}
        </View>
        
        {connected ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.connectedButton]}
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.connectedButtonText}>Connected ✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.connectButton]}
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {connected ? (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <Text style={styles.disconnectText}>Disconnect {config.name}</Text>
              )}
            </TouchableOpacity>
          ) : config.requiresOAuth ? (
            <View style={styles.oauthContainer}>
              <Text style={styles.oauthText}>
                This integration uses secure OAuth authentication.
              </Text>
              <TouchableOpacity
                style={styles.oauthButton}
                onPress={() => Alert.alert(
                  'OAuth Integration', 
                  `To connect ${config.name}, you'll be redirected to their login page to authorize CLO.\n\nThis feature is coming in a future update.`,
                  [{ text: 'OK' }]
                )}
              >
                <Text style={styles.oauthButtonText}>Sign in with {config.name}</Text>
              </TouchableOpacity>
              <Text style={styles.comingSoon}>🚧 Coming Soon</Text>
            </View>
          ) : (
            <View style={styles.apiKeyContainer}>
              <Text style={styles.apiKeyLabel}>
                Enter your {config.name} API Key:
              </Text>
              <TextInput
                style={styles.apiKeyInput}
                placeholder="Paste API key here..."
                placeholderTextColor={theme.colors.textSecondary}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.apiKeyConnectButton, !apiKey.trim() && styles.apiKeyConnectButtonDisabled]}
                onPress={handleConnect}
                disabled={!apiKey.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.apiKeyConnectButtonText}>Connect</Text>
                )}
              </TouchableOpacity>
              
              {config.provider === 'openweathermap' && (
                <Text style={styles.helpText}>
                  Get a free API key at openweathermap.org/api
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  lastSynced: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
  status: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  statusConnected: {
    backgroundColor: theme.colors.home,
  },
  statusDisconnected: {
    backgroundColor: theme.colors.border,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  actionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.sm,
  },
  connectButton: {
    backgroundColor: theme.colors.self,
  },
  connectedButton: {
    backgroundColor: theme.colors.home,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  connectedButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  expandedContent: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  disconnectButton: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  disconnectText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  oauthContainer: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  oauthText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  oauthButton: {
    backgroundColor: theme.colors.self,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  oauthButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  apiKeyContainer: {
    marginTop: theme.spacing.md,
  },
  apiKeyLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  apiKeyInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  apiKeyConnectButton: {
    backgroundColor: theme.colors.self,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  apiKeyConnectButtonDisabled: {
    opacity: 0.5,
  },
  apiKeyConnectButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  comingSoon: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
