/**
 * Self Navigation Icon - Personal essence symbol
 * 
 * Design: Simplified person silhouette with inner glow and orbital accent,
 * compact version for navigation use.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function SelfNavIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#EC4899',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="selfNavGrad" x1="24" y1="4" x2="24" y2="44">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Subtle orbital */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="2 4"
        fill="none"
      />
      
      {/* Head */}
      <Circle cx="24" cy="14" r="8" fill={color} opacity="0.15" />
      <Circle
        cx="24"
        cy="14"
        r="8"
        stroke="url(#selfNavGrad)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* Inner glow/consciousness */}
      <Circle cx="24" cy="14" r="3" fill={color} opacity="0.5" />
      
      {/* Body arc */}
      <Path
        d="M10 42 C10 30 16 24 24 24 C32 24 38 30 38 42"
        fill={color}
        opacity="0.15"
      />
      <Path
        d="M10 42 C10 30 16 24 24 24 C32 24 38 30 38 42"
        stroke="url(#selfNavGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Energy nodes */}
      <Circle cx="8" cy="20" r="2" fill={color} opacity="0.6" />
      <Circle cx="40" cy="20" r="2" fill={color} opacity="0.6" />
      
      {/* Heart center accent */}
      <Circle cx="24" cy="32" r="2.5" fill={color} opacity="0.7" />
    </Svg>
  );
}
