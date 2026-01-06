/**
 * Inventory Icon - Storage orbital system
 * 
 * Design: Stylized box with orbiting item nodes,
 * representing the cataloging of home possessions.
 */

import React from 'react';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function InventoryIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#8B5CF6',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="inventoryGrad" x1="14" y1="14" x2="34" y2="38">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Orbital ring around the box */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="3 5"
        fill="none"
      />
      
      {/* Orbiting item nodes */}
      <Circle cx="24" cy="5" r="2.5" fill={color} opacity="0.8" />
      <Circle cx="43" cy="24" r="2.5" fill={color} opacity="0.8" />
      <Circle cx="24" cy="43" r="2.5" fill={color} opacity="0.8" />
      <Circle cx="5" cy="24" r="2.5" fill={color} opacity="0.8" />
      
      {/* Main box shape - 3D perspective */}
      {/* Box front face */}
      <Path
        d="M12 18 L12 34 L24 40 L36 34 L36 18 L24 12 Z"
        fill={color}
        opacity="0.15"
      />
      
      {/* Box edges */}
      <Path
        d="M12 18 L24 24 L24 40 M24 24 L36 18"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.6}
      />
      
      {/* Box outline */}
      <Path
        d="M12 18 L12 34 L24 40 L36 34 L36 18 L24 12 Z"
        stroke="url(#inventoryGrad)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Box top flaps open suggestion */}
      <Path
        d="M12 18 L18 14 M36 18 L30 14"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
      />
      
      {/* Central catalog symbol */}
      <Circle cx="24" cy="26" r="4" stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" />
      <Circle cx="24" cy="26" r="1.5" fill={color} />
      
      {/* Connection lines from orbiting items */}
      <Path
        d="M24 8 L24 12 M40 24 L36 22 M24 40 L24 38 M8 24 L12 22"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="1 2"
      />
    </Svg>
  );
}
