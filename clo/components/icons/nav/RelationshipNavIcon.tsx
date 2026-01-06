/**
 * Relationship Navigation Icon - Partnership symbol
 * 
 * Design: Two connected figures/hearts with bond line and orbital,
 * compact version for navigation use.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function RelationshipNavIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#8B5CF6',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="relNavGrad" x1="4" y1="24" x2="44" y2="24">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="50%" stopColor="#EC4899" stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      
      {/* Connection orbital */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="2 4"
        fill="none"
      />
      
      {/* Left figure - head */}
      <Circle cx="14" cy="14" r="6" fill={color} opacity="0.15" />
      <Circle
        cx="14"
        cy="14"
        r="6"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        fill="none"
      />
      
      {/* Left figure - body */}
      <Path
        d="M6 38 C6 28 10 22 14 22 C16 22 18 24 18 26"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Right figure - head */}
      <Circle cx="34" cy="14" r="6" fill={color} opacity="0.15" />
      <Circle
        cx="34"
        cy="14"
        r="6"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        fill="none"
      />
      
      {/* Right figure - body */}
      <Path
        d="M42 38 C42 28 38 22 34 22 C32 22 30 24 30 26"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Connection bond - hands meeting */}
      <Path
        d="M18 26 C20 30 22 30 24 30 C26 30 28 30 30 26"
        stroke="url(#relNavGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Heart at connection point */}
      <Path
        d="M24 28 C22 26 19 27 19 30 C19 33 24 36 24 36 C24 36 29 33 29 30 C29 27 26 26 24 28"
        fill="#EC4899"
        opacity="0.8"
      />
      
      {/* Bond energy nodes */}
      <Circle cx="24" cy="6" r="2.5" fill={color} opacity="0.6" />
      <Circle cx="24" cy="42" r="2.5" fill={color} opacity="0.6" />
      
      {/* Connecting energy lines */}
      <Path d="M24 8 L24 12" stroke={secondary} strokeWidth={strokeWidth * 0.3} />
      <Path d="M24 40 L24 36" stroke={secondary} strokeWidth={strokeWidth * 0.3} />
    </Svg>
  );
}
