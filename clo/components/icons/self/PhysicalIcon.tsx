/**
 * Physical Icon - Body/Vitality constellation
 * 
 * Design: Stylized figure in motion with pulse/heartbeat line
 * and orbital energy rings.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function PhysicalIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#EF4444',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="physicalGrad" x1="0" y1="48" x2="48" y2="0">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      
      {/* Energy orbit rings */}
      <Circle
        cx="24"
        cy="24"
        r="21"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        strokeDasharray="4 8"
        fill="none"
      />
      <Circle
        cx="24"
        cy="24"
        r="16"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="2 6"
        fill="none"
      />
      
      {/* Stylized running figure */}
      {/* Head */}
      <Circle cx="24" cy="12" r="4" fill={color} />
      <Circle cx="24" cy="12" r="5.5" stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" opacity="0.4" />
      
      {/* Body core line */}
      <Path
        d="M24 16 L24 26"
        stroke="url(#physicalGrad)"
        strokeWidth={strokeWidth * 1.2}
        strokeLinecap="round"
      />
      
      {/* Arms in motion */}
      <Path
        d="M24 20 L16 16 M24 20 L32 24"
        stroke="url(#physicalGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Legs in motion */}
      <Path
        d="M24 26 L18 36 M24 26 L32 34"
        stroke="url(#physicalGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Energy nodes at extremities */}
      <Circle cx="16" cy="16" r="2" fill={color} opacity="0.8" />
      <Circle cx="32" cy="24" r="2" fill={color} opacity="0.8" />
      <Circle cx="18" cy="36" r="2.5" fill={color} />
      <Circle cx="32" cy="34" r="2.5" fill={color} />
      
      {/* Heartbeat/pulse line */}
      <Path
        d="M6 30 L12 30 L14 26 L17 34 L20 28 L22 30 L28 30"
        stroke={color}
        strokeWidth={strokeWidth * 0.75}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      
      {/* Motion trail dots */}
      <Circle cx="10" cy="14" r="1.5" fill={color} opacity="0.4" />
      <Circle cx="8" cy="18" r="1" fill={color} opacity="0.3" />
    </Svg>
  );
}
