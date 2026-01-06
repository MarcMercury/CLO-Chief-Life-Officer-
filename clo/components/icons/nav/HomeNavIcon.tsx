/**
 * Home Navigation Icon - Sanctuary symbol
 * 
 * Design: Stylized home with inner warmth glow and protective orbital,
 * compact version for navigation use.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function HomeNavIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#10B981',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="homeNavGrad" x1="24" y1="4" x2="24" y2="40">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Protective orbital */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="2 4"
        fill="none"
      />
      
      {/* House body */}
      <Path
        d="M10 22 L10 40 L38 40 L38 22"
        fill={color}
        opacity="0.15"
      />
      <Path
        d="M10 22 L10 40 L38 40 L38 22"
        stroke="url(#homeNavGrad)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Roof */}
      <Path
        d="M6 24 L24 8 L42 24"
        fill={color}
        opacity="0.1"
      />
      <Path
        d="M6 24 L24 8 L42 24"
        stroke="url(#homeNavGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Chimney */}
      <Path
        d="M32 14 L32 10 L36 10 L36 18"
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Door */}
      <Path
        d="M20 40 L20 30 L28 30 L28 40"
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
        fill="none"
      />
      
      {/* Window with warm glow */}
      <Circle cx="24" cy="35" r="2" fill={color} opacity="0.6" />
      
      {/* Warmth nodes */}
      <Circle cx="24" cy="16" r="2" fill={color} opacity="0.5" />
      
      {/* Corner energy nodes */}
      <Circle cx="6" cy="30" r="2" fill={color} opacity="0.5" />
      <Circle cx="42" cy="30" r="2" fill={color} opacity="0.5" />
      
      {/* Smoke wisps from chimney */}
      <Path
        d="M34 8 C32 6 36 4 34 2"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
