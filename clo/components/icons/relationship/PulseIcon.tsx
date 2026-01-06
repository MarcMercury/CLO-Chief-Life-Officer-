/**
 * Pulse Icon - Emotional heartbeat system
 * 
 * Design: Two intertwined hearts with a pulse line between them,
 * representing the daily emotional check-in with your partner.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function PulseIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#EC4899',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="pulseGrad" x1="4" y1="24" x2="44" y2="24">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#EF4444" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Orbital connection ring */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="2 4"
        fill="none"
      />
      
      {/* Two hearts slightly overlapping - representing partners */}
      {/* Left heart */}
      <Path
        d="M18 14 C14 10 8 12 8 18 C8 24 18 32 18 32 C18 32 20 30 22 28"
        fill={color}
        opacity="0.2"
      />
      <Path
        d="M18 14 C14 10 8 12 8 18 C8 24 18 32 18 32"
        stroke="url(#pulseGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M18 14 C22 10 28 12 28 18"
        stroke="url(#pulseGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Right heart */}
      <Path
        d="M30 14 C26 10 20 12 20 18 C20 24 30 32 30 32 C30 32 40 24 40 18 C40 12 34 10 30 14"
        fill={color}
        opacity="0.2"
      />
      <Path
        d="M30 14 C34 10 40 12 40 18 C40 24 30 32 30 32"
        stroke="url(#pulseGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Pulse/heartbeat line connecting the hearts */}
      <Path
        d="M4 36 L12 36 L14 32 L18 40 L22 28 L26 40 L30 32 L32 36 L44 36"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Pulse glow effect */}
      <Path
        d="M4 36 L12 36 L14 32 L18 40 L22 28 L26 40 L30 32 L32 36 L44 36"
        stroke={secondary}
        strokeWidth={strokeWidth * 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.3"
      />
      
      {/* Energy/connection nodes */}
      <Circle cx="24" cy="6" r="2.5" fill={color} opacity="0.7" />
      <Circle cx="6" cy="24" r="2" fill={color} opacity="0.5" />
      <Circle cx="42" cy="24" r="2" fill={color} opacity="0.5" />
      
      {/* Connection spark at heart intersection */}
      <Circle cx="24" cy="20" r="3" fill={color} opacity="0.4" />
      <Circle cx="24" cy="20" r="1.5" fill="#fff" opacity="0.8" />
    </Svg>
  );
}
