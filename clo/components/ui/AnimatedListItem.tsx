/**
 * Animated List Item Component
 * 
 * Provides staggered fade-in + slide-up animation for list items.
 * Part of the Sanctuary design language.
 */

import React from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeIn,
  SlideInRight,
  SlideInLeft,
  Layout,
  LinearTransition,
} from 'react-native-reanimated';
import { animation } from '@/constants/theme';

interface AnimatedListItemProps extends ViewProps {
  /** Index of item in list - used for stagger delay */
  index?: number;
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  /** Custom delay in ms (overrides stagger calculation) */
  delay?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Slide distance in pixels */
  distance?: number;
  /** Whether to animate layout changes */
  animateLayout?: boolean;
  /** Children elements */
  children: React.ReactNode;
}

export function AnimatedListItem({
  index = 0,
  direction = 'up',
  delay,
  duration = animation.duration.normal,
  distance = 10,
  animateLayout = false,
  style,
  children,
  ...props
}: AnimatedListItemProps) {
  // Calculate stagger delay based on index
  const staggerDelay = delay ?? index * animation.stagger.normal;

  // Select entering animation based on direction
  const getEnteringAnimation = () => {
    switch (direction) {
      case 'up':
        return FadeInUp
          .delay(staggerDelay)
          .duration(duration)
          .springify()
          .damping(15);
      case 'down':
        return FadeInDown
          .delay(staggerDelay)
          .duration(duration)
          .springify()
          .damping(15);
      case 'left':
        return SlideInLeft
          .delay(staggerDelay)
          .duration(duration)
          .springify()
          .damping(15);
      case 'right':
        return SlideInRight
          .delay(staggerDelay)
          .duration(duration)
          .springify()
          .damping(15);
      case 'fade':
      default:
        return FadeIn
          .delay(staggerDelay)
          .duration(duration);
    }
  };

  return (
    <Animated.View
      entering={getEnteringAnimation()}
      layout={animateLayout ? LinearTransition.springify().damping(15) : undefined}
      style={style}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Container for animated lists
 * Wraps children and ensures proper animation sequencing
 */
interface AnimatedListContainerProps extends ViewProps {
  children: React.ReactNode;
}

export function AnimatedListContainer({
  style,
  children,
  ...props
}: AnimatedListContainerProps) {
  return (
    <Animated.View
      layout={LinearTransition.springify().damping(15)}
      style={style}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

export default AnimatedListItem;
