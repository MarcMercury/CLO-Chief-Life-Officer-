/**
 * Emotional Icon - Heart constellation with flowing energy
 * 
 * Design: Stylized heart with radiating emotional wavelengths
 * and connected feeling nodes.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function EmotionalIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#EC4899',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="emotionalGrad" x1="0" y1="0" x2="48" y2="48">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      
      {/* Outer emotional aura */}
      <Path
        d="M24 6 C32 6 38 12 38 20 C38 28 24 42 24 42 C24 42 10 28 10 20 C10 12 16 6 24 6"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        strokeDasharray="3 5"
        fill="none"
        opacity="0.5"
      />
      
      {/* Heart outline - stylized */}
      <Path
        d="M24 12 C20 8 12 8 12 16 C12 22 24 34 24 34 C24 34 36 22 36 16 C36 8 28 8 24 12"
        stroke="url(#emotionalGrad)"
        strokeWidth={strokeWidth * 1.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Inner heart glow */}
      <Path
        d="M24 16 C22 14 18 14 18 18 C18 21 24 28 24 28 C24 28 30 21 30 18 C30 14 26 14 24 16"
        fill={color}
        opacity="0.3"
      />
      
      {/* Emotional wavelength rings */}
      <Path
        d="M6 24 Q12 20 12 24 Q12 28 6 24"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        fill="none"
        opacity="0.6"
      />
      <Path
        d="M42 24 Q36 20 36 24 Q36 28 42 24"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        fill="none"
        opacity="0.6"
      />
      
      {/* Feeling nodes */}
      <Circle cx="12" cy="14" r="2.5" fill={color} />
      <Circle cx="36" cy="14" r="2.5" fill={color} />
      <Circle cx="24" cy="22" r="3" fill={color} opacity="0.9" />
      
      {/* Radiating emotion points */}
      <Circle cx="6" cy="20" r="1.5" fill={color} opacity="0.5" />
      <Circle cx="42" cy="20" r="1.5" fill={color} opacity="0.5" />
      <Circle cx="24" cy="40" r="2" fill={color} opacity="0.6" />
      
      {/* Connection lines to nodes */}
      <Path
        d="M12 14 L18 16 M36 14 L30 16"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        fill="none"
      />
    </Svg>
  );
}
