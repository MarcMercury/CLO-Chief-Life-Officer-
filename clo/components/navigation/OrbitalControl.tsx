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
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import haptics from '@/lib/haptics';
import { useUIStore, ActiveCircle } from '../../store/uiStore';
import { colors } from '@/constants/theme';

const SWIPE_THRESHOLD = 40;
const ORB_SIZE = 48;

// Venn diagram circle dimensions - COMPACT VERSION
const VENN_CIRCLE_RADIUS = 55;
const VENN_STROKE_WIDTH = 1;
const SVG_SIZE = 200;
const CENTER_X = SVG_SIZE / 2;
const CENTER_Y = SVG_SIZE / 2 + 10; // Slightly lower to account for top circle

export default function OrbitalControl() {
  const { activeCircle, setActiveCircle, themeColors } = useUIStore();
  
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  const triggerHaptic = () => {
    haptics.selection();
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

  // Calculate circle positions for proper Venn intersection
  // All three circles meet in the center
  const circleOffset = VENN_CIRCLE_RADIUS * 0.55;
  
  // Self circle - bottom left
  const selfX = CENTER_X - circleOffset * 0.87;
  const selfY = CENTER_Y + circleOffset * 0.5;
  
  // Relationships circle - bottom right
  const relX = CENTER_X + circleOffset * 0.87;
  const relY = CENTER_Y + circleOffset * 0.5;
  
  // Home circle - top center
  const homeX = CENTER_X;
  const homeY = CENTER_Y - circleOffset;

  // Get opacity based on active state
  const getCircleOpacity = (circle: ActiveCircle) => {
    return activeCircle === circle ? 0.25 : 0.08;
  };

  const getStrokeOpacity = (circle: ActiveCircle) => {
    return activeCircle === circle ? 0.9 : 0.4;
  };
  
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Venn Diagram Background - pointerEvents none so touches pass through */}
      <View style={styles.vennContainer} pointerEvents="none">
        <Svg width={SVG_SIZE} height={SVG_SIZE} style={styles.vennSvg}>
          <Defs>
            {/* Self gradient */}
            <RadialGradient id="selfGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.self} stopOpacity={getCircleOpacity('SELF') * 1.5} />
              <Stop offset="100%" stopColor={colors.self} stopOpacity={0} />
            </RadialGradient>
            {/* Relationships gradient */}
            <RadialGradient id="relGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.relationships} stopOpacity={getCircleOpacity('RELATIONSHIPS') * 1.5} />
              <Stop offset="100%" stopColor={colors.relationships} stopOpacity={0} />
            </RadialGradient>
            {/* Home gradient */}
            <RadialGradient id="homeGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.home} stopOpacity={getCircleOpacity('HOME') * 1.5} />
              <Stop offset="100%" stopColor={colors.home} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Self Circle - Bottom Left */}
          <Circle
            cx={selfX}
            cy={selfY}
            r={VENN_CIRCLE_RADIUS}
            fill="url(#selfGradient)"
            stroke={colors.self}
            strokeWidth={VENN_STROKE_WIDTH}
            strokeOpacity={getStrokeOpacity('SELF')}
          />
          
          {/* Relationships Circle - Bottom Right */}
          <Circle
            cx={relX}
            cy={relY}
            r={VENN_CIRCLE_RADIUS}
            fill="url(#relGradient)"
            stroke={colors.relationships}
            strokeWidth={VENN_STROKE_WIDTH}
            strokeOpacity={getStrokeOpacity('RELATIONSHIPS')}
          />
          
          {/* Home Circle - Top Center */}
          <Circle
            cx={homeX}
            cy={homeY}
            r={VENN_CIRCLE_RADIUS}
            fill="url(#homeGradient)"
            stroke={colors.home}
            strokeWidth={VENN_STROKE_WIDTH}
            strokeOpacity={getStrokeOpacity('HOME')}
          />
        </Svg>

        {/* Direction labels positioned around Venn diagram */}
        <View style={styles.labelsContainer} pointerEvents="none">
          <Text style={[styles.label, styles.labelLeft, { color: colors.self }]}>
            ← Self
          </Text>
          <Text style={[styles.label, styles.labelRight, { color: colors.relationships }]}>
            Relationships →
          </Text>
          <Text style={[styles.label, styles.labelTop, { color: colors.home }]}>
            ↑ Home
          </Text>
        </View>
      </View>
      
      {/* Center Orb - Gesture Controller - This is the only touch target */}
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
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
  },
  vennContainer: {
    position: 'absolute',
    width: SVG_SIZE,
    height: SVG_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vennSvg: {
    position: 'absolute',
  },
  labelsContainer: {
    position: 'absolute',
    width: SVG_SIZE,
    height: SVG_SIZE,
  },
  label: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  labelLeft: {
    left: 5,
    top: '55%',
  },
  labelRight: {
    right: 0,
    top: '55%',
  },
  labelTop: {
    top: 10,
    left: '50%',
    transform: [{ translateX: -22 }],
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    // Glow effect
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  orbText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
