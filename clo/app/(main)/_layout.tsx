import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useUIStore } from '../../store/uiStore';
import OrbitalControl from '../../components/navigation/OrbitalControl';

export default function MainLayout() {
  const { themeColors } = useUIStore();
  
  // Shared values for animated background
  const backgroundColor = useSharedValue(themeColors.background);
  
  useEffect(() => {
    backgroundColor.value = withTiming(themeColors.background, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  }, [themeColors.background]);
  
  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));
  
  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={styles.content}>
        <Slot />
      </View>
      <OrbitalControl />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
