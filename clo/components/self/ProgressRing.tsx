/**
 * ProgressRing Component
 * 
 * Circular progress indicator for health goals.
 * Uses react-native-svg for rendering.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
  current?: string;
  target?: string;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = colors.self,
  backgroundColor = colors.surface,
  showPercentage = true,
  label,
  current,
  target,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Clamp progress
  const displayProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={backgroundColor}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </G>
        </Svg>
        
        {/* Center text */}
        <View style={styles.centerText}>
          {showPercentage && (
            <Text style={[styles.percentage, { color }]}>
              {Math.round(displayProgress)}%
            </Text>
          )}
        </View>
      </View>
      
      {/* Label below */}
      {label && <Text style={styles.label}>{label}</Text>}
      
      {/* Progress text */}
      {current && target && (
        <Text style={styles.progressText}>
          {current}/{target}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ringContainer: {
    position: 'relative',
  },
  centerText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressText: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textTertiary,
  },
});
