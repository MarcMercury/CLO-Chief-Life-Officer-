import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import OrbitalControl from '../../components/navigation/OrbitalControl';

function MainLayout() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>
      
      <OrbitalControl />
    </View>
  );
}

export default memo(MainLayout);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
