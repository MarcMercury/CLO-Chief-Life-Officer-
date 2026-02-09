import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Tab {
  key: string;
  label: string;
  icon?: string;
}

interface CircleTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  accentColor: string;
}

export default function CircleTabBar({ 
  tabs, 
  activeTab, 
  onTabChange, 
  accentColor 
}: CircleTabBarProps) {
  
  const handlePress = (key: string) => {
    if (key !== activeTab) {
      Haptics.selectionAsync();
      onTabChange(key);
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && { backgroundColor: `${accentColor}20` }
            ]}
            onPress={() => handlePress(tab.key)}
            activeOpacity={0.7}
          >
            {tab.icon && (
              <Text style={styles.tabIcon}>{tab.icon}</Text>
            )}
            <Text style={[
              styles.tabLabel,
              isActive && { color: accentColor }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
});
