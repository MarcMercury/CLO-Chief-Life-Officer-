/**
 * Vendors Icon - Service network constellation
 * 
 * Design: Interconnected service provider nodes forming a network,
 * with a central home connection point and professional tool accents.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function VendorsIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#3B82F6',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="vendorsGrad" x1="24" y1="4" x2="24" y2="44">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Network connection web */}
      <Path
        d="M24 24 L12 10 M24 24 L36 10 M24 24 L40 28 M24 24 L36 40 M24 24 L12 40 M24 24 L8 28"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        strokeDasharray="2 2"
      />
      
      {/* Cross connections */}
      <Path
        d="M12 10 L36 10 M36 10 L40 28 M40 28 L36 40 M36 40 L12 40 M12 40 L8 28 M8 28 L12 10"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="3 4"
      />
      
      {/* Central home hub */}
      <Circle cx="24" cy="24" r="8" fill={color} opacity="0.15" />
      <Circle
        cx="24"
        cy="24"
        r="8"
        stroke="url(#vendorsGrad)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* House symbol in center */}
      <Path
        d="M24 18 L18 23 L18 30 L30 30 L30 23 Z"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinejoin="round"
        fill={color}
        opacity="0.3"
      />
      <Path d="M22 30 L22 26 L26 26 L26 30" stroke={color} strokeWidth={strokeWidth * 0.4} fill="none" />
      
      {/* Vendor nodes - each representing a service type */}
      {/* Top left - Electrician (lightning) */}
      <Circle cx="12" cy="10" r="4" fill={color} />
      <Path d="M13 8 L11 11 L13 11 L11 14" stroke="#fff" strokeWidth={strokeWidth * 0.4} strokeLinecap="round" />
      
      {/* Top right - Plumber (drop) */}
      <Circle cx="36" cy="10" r="4" fill={color} />
      <Path d="M36 8 C34 10 34 12 36 13 C38 12 38 10 36 8" stroke="#fff" strokeWidth={strokeWidth * 0.4} fill="none" />
      
      {/* Right - HVAC (waves) */}
      <Circle cx="40" cy="28" r="4" fill={color} />
      <Path d="M38 27 C39 26 41 26 42 27 M38 29 C39 28 41 28 42 29" stroke="#fff" strokeWidth={strokeWidth * 0.4} strokeLinecap="round" />
      
      {/* Bottom right - Landscaper (leaf) */}
      <Circle cx="36" cy="40" r="4" fill={color} />
      <Path d="M34 41 C36 38 38 40 37 42 C36 41 35 41 34 41" stroke="#fff" strokeWidth={strokeWidth * 0.4} fill="none" />
      
      {/* Bottom left - Cleaning (sparkle) */}
      <Circle cx="12" cy="40" r="4" fill={color} />
      <Path d="M12 38 L12 42 M10 40 L14 40 M10.5 38.5 L13.5 41.5 M13.5 38.5 L10.5 41.5" stroke="#fff" strokeWidth={strokeWidth * 0.3} strokeLinecap="round" />
      
      {/* Left - Handyman (wrench) */}
      <Circle cx="8" cy="28" r="4" fill={color} />
      <Path d="M6 26 L10 30 M10 26 L8 28" stroke="#fff" strokeWidth={strokeWidth * 0.4} strokeLinecap="round" />
    </Svg>
  );
}
