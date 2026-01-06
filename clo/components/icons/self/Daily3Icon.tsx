/**
 * Daily 3 Icon - Three orbital points representing daily intentions
 * 
 * Design: Three glowing nodes in a triangular orbit pattern,
 * connected by thin orbital lines, suggesting focus and intention.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function Daily3Icon({
  size = DEFAULT_ICON_SIZE,
  color = '#10B981',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="daily3Grad" x1="0" y1="0" x2="48" y2="48">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor={secondary} stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      
      {/* Outer orbital ring */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.75}
        strokeDasharray="3 6"
        fill="none"
      />
      
      {/* Inner orbital ring */}
      <Circle
        cx="24"
        cy="24"
        r="12"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        fill="none"
      />
      
      {/* Triangular connection paths */}
      <Path
        d="M24 8 L38 32 L10 32 Z"
        stroke="url(#daily3Grad)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinejoin="round"
      />
      
      {/* Node 1 - Top */}
      <Circle cx="24" cy="8" r="4" fill={color} />
      <Circle cx="24" cy="8" r="6" stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" opacity="0.4" />
      
      {/* Node 2 - Bottom Right */}
      <Circle cx="38" cy="32" r="4" fill={color} />
      <Circle cx="38" cy="32" r="6" stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" opacity="0.4" />
      
      {/* Node 3 - Bottom Left */}
      <Circle cx="10" cy="32" r="4" fill={color} />
      <Circle cx="10" cy="32" r="6" stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" opacity="0.4" />
      
      {/* Center focus point */}
      <Circle cx="24" cy="24" r="2" fill={color} opacity="0.8" />
    </Svg>
  );
}
