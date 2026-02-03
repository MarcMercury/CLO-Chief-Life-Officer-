/**
 * Body Icon - Physical/Body constellation (renamed from Physical)
 * 
 * Design: Dynamic human figure with energy pulses and health orbits.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function BodyIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#EF4444',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="bodyGrad" x1="0" y1="0" x2="48" y2="48">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      
      {/* Health orbit */}
      <Ellipse
        cx="24"
        cy="28"
        rx="20"
        ry="14"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        strokeDasharray="3 4"
        fill="none"
        transform="rotate(-10 24 28)"
      />
      
      {/* Head */}
      <Circle cx="24" cy="12" r="5" stroke="url(#bodyGrad)" strokeWidth={strokeWidth} fill="none" />
      
      {/* Body/Torso */}
      <Path
        d="M24 17 L24 30"
        stroke="url(#bodyGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Arms reaching up - dynamic pose */}
      <Path
        d="M24 22 L16 16 M24 22 L32 16"
        stroke="url(#bodyGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Legs in motion */}
      <Path
        d="M24 30 L18 40 M24 30 L30 40"
        stroke="url(#bodyGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Energy pulse nodes */}
      <Circle cx="14" cy="14" r="2" fill={color} opacity="0.7" />
      <Circle cx="34" cy="14" r="2" fill={color} opacity="0.7" />
      <Circle cx="16" cy="42" r="1.5" fill={color} opacity="0.5" />
      <Circle cx="32" cy="42" r="1.5" fill={color} opacity="0.5" />
      
      {/* Heartbeat pulse at center */}
      <Circle cx="24" cy="24" r="2.5" fill={color} />
      
      {/* Energy trails */}
      <Circle cx="6" cy="28" r="1.5" fill={color} opacity="0.4" />
      <Circle cx="42" cy="28" r="1.5" fill={color} opacity="0.4" />
    </Svg>
  );
}
