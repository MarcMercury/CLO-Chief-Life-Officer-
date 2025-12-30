import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import OrbitalControl from '../../components/navigation/OrbitalControl';

function MainLayout() {
  const { themeColors } = useUIStore();
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
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
