/**
 * Resolve Icon - Bridge connection system
 * 
 * Design: Two figures connected by a bridge with a heart at center,
 * representing conflict resolution and coming together.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function ResolveIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#8B5CF6',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="resolveGrad" x1="4" y1="24" x2="44" y2="24">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="50%" stopColor="#EC4899" stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      
      {/* Unity orbital */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="4 3"
        fill="none"
      />
      
      {/* Bridge structure */}
      <Path
        d="M8 28 C12 20 20 20 24 20 C28 20 36 20 40 28"
        fill={color}
        opacity="0.1"
      />
      <Path
        d="M8 28 C12 20 20 20 24 20 C28 20 36 20 40 28"
        stroke="url(#resolveGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Bridge pillars */}
      <Path d="M12 28 L12 36" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
      <Path d="M36 28 L36 36" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
      
      {/* Bridge base */}
      <Path d="M8 36 L40 36" stroke={color} strokeWidth={strokeWidth * 0.6} strokeLinecap="round" />
      
      {/* Left person silhouette */}
      <Circle cx="10" cy="14" r="4" fill={color} opacity="0.2" />
      <Circle cx="10" cy="14" r="4" stroke={color} strokeWidth={strokeWidth * 0.7} fill="none" />
      <Path
        d="M10 18 L10 26 M6 22 L14 22"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
      />
      
      {/* Right person silhouette */}
      <Circle cx="38" cy="14" r="4" fill={color} opacity="0.2" />
      <Circle cx="38" cy="14" r="4" stroke={color} strokeWidth={strokeWidth * 0.7} fill="none" />
      <Path
        d="M38 18 L38 26 M34 22 L42 22"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
      />
      
      {/* Heart at bridge center - resolution symbol */}
      <Path
        d="M24 16 C22 14 19 15 19 18 C19 21 24 25 24 25 C24 25 29 21 29 18 C29 15 26 14 24 16"
        fill="#EC4899"
        opacity="0.8"
      />
      <Path
        d="M24 16 C22 14 19 15 19 18 C19 21 24 25 24 25 C24 25 29 21 29 18 C29 15 26 14 24 16"
        stroke="#EC4899"
        strokeWidth={strokeWidth * 0.5}
        fill="none"
      />
      
      {/* Connecting energy lines */}
      <Path
        d="M14 16 L18 18 M34 16 L30 18"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="2 2"
      />
      
      {/* Unity nodes */}
      <Circle cx="24" cy="6" r="2.5" fill={color} />
      <Circle cx="6" cy="30" r="2" fill={color} opacity="0.6" />
      <Circle cx="42" cy="30" r="2" fill={color} opacity="0.6" />
      
      {/* Healing sparkles */}
      <Path d="M24 10 L24 12" stroke={color} strokeWidth={strokeWidth * 0.4} strokeLinecap="round" opacity="0.6" />
      <Path d="M22 11 L26 11" stroke={color} strokeWidth={strokeWidth * 0.4} strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}
