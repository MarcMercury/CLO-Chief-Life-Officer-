/**
 * Decide Icon - Choice balance system
 * 
 * Design: Balance scale with orbiting decision nodes and
 * a confirmation checkmark, representing joint decision making.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function DecideIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#10B981',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="decideGrad" x1="8" y1="14" x2="40" y2="38">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Decision orbit */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="2 4"
        fill="none"
      />
      
      {/* Balance scale base/pillar */}
      <Path
        d="M24 14 L24 38"
        stroke="url(#decideGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Scale base */}
      <Path
        d="M18 38 L30 38"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M20 40 L28 40"
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />
      
      {/* Scale top pivot */}
      <Circle cx="24" cy="14" r="3" fill={color} opacity="0.2" />
      <Circle
        cx="24"
        cy="14"
        r="3"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        fill="none"
      />
      
      {/* Scale arms (balanced) */}
      <Path
        d="M10 14 L38 14"
        stroke="url(#decideGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Left scale pan */}
      <Path
        d="M10 14 L6 24 L14 24 Z"
        fill={color}
        opacity="0.15"
      />
      <Path
        d="M10 14 L6 24 L14 24 L10 14"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M6 24 C6 26 8 28 10 28 C12 28 14 26 14 24"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        fill="none"
      />
      
      {/* Right scale pan */}
      <Path
        d="M38 14 L34 24 L42 24 Z"
        fill={color}
        opacity="0.15"
      />
      <Path
        d="M38 14 L34 24 L42 24 L38 14"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M34 24 C34 26 36 28 38 28 C40 28 42 26 42 24"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        fill="none"
      />
      
      {/* Checkmark in center (decision made) */}
      <Path
        d="M20 26 L23 29 L28 22"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Decision option nodes */}
      <Circle cx="10" cy="22" r="2" fill={color} opacity="0.8" />
      <Circle cx="38" cy="22" r="2" fill={color} opacity="0.8" />
      
      {/* Orbiting consideration nodes */}
      <Circle cx="5" cy="10" r="2" fill={color} opacity="0.5" />
      <Circle cx="43" cy="10" r="2" fill={color} opacity="0.5" />
      <Circle cx="24" cy="44" r="2.5" fill={color} opacity="0.6" />
      
      {/* Connection lines */}
      <Path
        d="M6 11 L9 13 M41 11 L39 13"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
      />
    </Svg>
  );
}
