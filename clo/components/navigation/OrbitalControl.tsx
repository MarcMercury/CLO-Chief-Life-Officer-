import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useUIStore, ActiveCircle } from '../../store/uiStore';

const SWIPE_THRESHOLD = 50;
const ORB_SIZE = 64;

export default function OrbitalControl() {
  const { activeCircle, setActiveCircle, themeColors } = useUIStore();
  
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  const triggerHaptic = () => {
    Haptics.selectionAsync();
  };
  
  const navigateTo = (circle: ActiveCircle) => {
    triggerHaptic();
    setActiveCircle(circle);
  };
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Limit the orb movement
      translateX.value = Math.max(-80, Math.min(80, event.translationX));
      translateY.value = Math.max(-80, Math.min(80, event.translationY));
    })
    .onEnd((event) => {
      const { translationX, translationY } = event;
      
      // Determine direction based on dominant axis
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);
      
      if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
        if (absX > absY) {
          // Horizontal swipe
          if (translationX < -SWIPE_THRESHOLD) {
            // Swipe Left -> Self
            runOnJS(navigateTo)('SELF');
          } else if (translationX > SWIPE_THRESHOLD) {
            // Swipe Right -> Relationships
            runOnJS(navigateTo)('RELATIONSHIPS');
          }
        } else {
          // Vertical swipe
          if (translationY < -SWIPE_THRESHOLD) {
            // Swipe Up -> Home
            runOnJS(navigateTo)('HOME');
          } else if (translationY > SWIPE_THRESHOLD) {
            // Swipe Down -> Dashboard (optional, currently just resets)
            runOnJS(navigateTo)('DASHBOARD');
          }
        }
      }
      
      // Spring back to center
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    });
  
  const tapGesture = Gesture.Tap()
    .onStart(() => {
      scale.value = withSequence(
        withSpring(0.9, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 })
      );
    })
    .onEnd(() => {
      runOnJS(navigateTo)('DASHBOARD');
    });
  
  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  
  // Get indicator for current circle
  const getCircleIndicator = () => {
    switch (activeCircle) {
      case 'SELF': return '●';
      case 'RELATIONSHIPS': return '●●';
      case 'HOME': return '▲';
      default: return '◯';
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Direction hints */}
      <View style={styles.hintsContainer}>
        <Text style={[styles.hint, styles.hintLeft]}>← Self</Text>
        <Text style={[styles.hint, styles.hintRight]}>Relationships →</Text>
        <Text style={[styles.hint, styles.hintTop]}>↑ Home</Text>
      </View>
      
      <GestureDetector gesture={composedGesture}>
        <Animated.View 
          style={[
            styles.orb, 
            animatedStyle,
            { borderColor: themeColors.accent }
          ]}
        >
          <Text style={[styles.orbText, { color: themeColors.accent }]}>
            {getCircleIndicator()}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  hintsContainer: {
    position: 'absolute',
    width: 300,
    height: 100,
  },
  hint: {
    position: 'absolute',
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 0.5,
  },
  hintLeft: {
    left: 0,
    top: '50%',
    transform: [{ translateY: -6 }],
  },
  hintRight: {
    right: 0,
    top: '50%',
    transform: [{ translateY: -6 }],
  },
  hintTop: {
    top: 0,
    left: '50%',
    transform: [{ translateX: -20 }],
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle glow effect
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  orbText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
