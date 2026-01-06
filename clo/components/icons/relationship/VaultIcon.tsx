/**
 * Vault Icon - Secure sanctuary system
 * 
 * Design: Ornate lock/safe with protective orbital shields and
 * glowing nodes, representing shared secrets and safe space.
 */

import React from 'react';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function VaultIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#6366F1',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="vaultGrad" x1="12" y1="10" x2="36" y2="42">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Protective orbital shields */}
      <Circle
        cx="24"
        cy="24"
        r="21"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="1 3"
        fill="none"
      />
      <Circle
        cx="24"
        cy="24"
        r="18"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="4 4"
        fill="none"
      />
      
      {/* Vault body */}
      <Rect
        x="10"
        y="10"
        width="28"
        height="28"
        rx="4"
        ry="4"
        fill={color}
        opacity="0.15"
      />
      <Rect
        x="10"
        y="10"
        width="28"
        height="28"
        rx="4"
        ry="4"
        stroke="url(#vaultGrad)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* Inner frame */}
      <Rect
        x="14"
        y="14"
        width="20"
        height="20"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth * 0.4}
        fill="none"
        opacity="0.5"
      />
      
      {/* Lock dial/wheel */}
      <Circle
        cx="24"
        cy="24"
        r="8"
        fill={color}
        opacity="0.1"
      />
      <Circle
        cx="24"
        cy="24"
        r="8"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        fill="none"
      />
      
      {/* Dial markers */}
      <Circle cx="24" cy="17" r="1.5" fill={color} />
      <Circle cx="31" cy="24" r="1.5" fill={color} />
      <Circle cx="24" cy="31" r="1.5" fill={color} />
      <Circle cx="17" cy="24" r="1.5" fill={color} />
      
      {/* Center lock symbol */}
      <Circle cx="24" cy="24" r="3" fill={color} />
      <Path
        d="M22 24 L26 24 M24 22 L24 26"
        stroke="#fff"
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
      />
      
      {/* Vault handle */}
      <Path
        d="M36 20 L40 20 L40 28 L36 28"
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Security nodes */}
      <Circle cx="6" cy="12" r="2.5" fill={color} opacity="0.7" />
      <Circle cx="42" cy="12" r="2.5" fill={color} opacity="0.7" />
      <Circle cx="6" cy="36" r="2.5" fill={color} opacity="0.7" />
      <Circle cx="42" cy="36" r="2.5" fill={color} opacity="0.7" />
      
      {/* Shield connection lines */}
      <Path
        d="M8 13 L12 16 M40 13 L36 16 M8 35 L12 32 M40 35 L36 32"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
      />
      
      {/* Glow accent at top */}
      <Circle cx="24" cy="6" r="2" fill={color} opacity="0.5" />
      <Path d="M24 8 L24 10" stroke={secondary} strokeWidth={strokeWidth * 0.3} />
    </Svg>
  );
}
