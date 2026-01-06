/**
 * Practical Icon - Tools/Gears constellation
 * 
 * Design: Interconnected gear system with checklist element,
 * suggesting productivity and task management.
 */

import React from 'react';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function PracticalIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#F59E0B',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="practicalGrad" x1="0" y1="0" x2="48" y2="48">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#EF4444" stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      
      {/* Large gear outline */}
      <Path
        d="M20 8 L22 12 L26 12 L28 8 L32 10 L31 14 L34 17 L38 16 L40 20 L36 22 L36 26 L40 28 L38 32 L34 31 L31 34 L32 38 L28 40 L26 36 L22 36 L20 40 L16 38 L17 34 L14 31 L10 32 L8 28 L12 26 L12 22 L8 20 L10 16 L14 17 L17 14 L16 10 Z"
        stroke="url(#practicalGrad)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinejoin="round"
      />
      
      {/* Gear center */}
      <Circle cx="24" cy="24" r="6" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Circle cx="24" cy="24" r="3" fill={color} opacity="0.5" />
      
      {/* Small gear (interlocking) */}
      <Circle
        cx="38"
        cy="38"
        r="6"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.75}
        fill="none"
      />
      <Circle cx="38" cy="38" r="2" fill={color} opacity="0.7" />
      
      {/* Gear teeth on small gear */}
      <Path
        d="M38 31 L38 33 M44 38 L42 38 M38 45 L38 43 M32 38 L34 38"
        stroke={secondary}
        strokeWidth={strokeWidth * 1.5}
        strokeLinecap="round"
      />
      
      {/* Task checkmarks (floating) */}
      <Path
        d="M6 12 L8 14 L12 10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <Path
        d="M6 20 L8 22 L12 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      
      {/* Connection nodes */}
      <Circle cx="8" cy="8" r="2" fill={color} opacity="0.5" />
      <Circle cx="40" cy="8" r="1.5" fill={color} opacity="0.4" />
      <Circle cx="8" cy="40" r="1.5" fill={color} opacity="0.4" />
      
      {/* Energy connection */}
      <Path
        d="M30 30 L34 34"
        stroke={color}
        strokeWidth={strokeWidth * 0.75}
        strokeDasharray="2 2"
        opacity="0.6"
      />
    </Svg>
  );
}
