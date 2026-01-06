/**
 * Manual Icon - Knowledge constellation book
 * 
 * Design: Open book with floating knowledge nodes and page elements,
 * representing the home documentation and wiki system.
 */

import React from 'react';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function ManualIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#10B981',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="manualGrad" x1="24" y1="8" x2="24" y2="42">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Knowledge constellation around the book */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="1 4"
        fill="none"
      />
      
      {/* Floating knowledge nodes */}
      <Circle cx="10" cy="8" r="2" fill={color} opacity="0.7" />
      <Circle cx="38" cy="8" r="2" fill={color} opacity="0.7" />
      <Circle cx="6" cy="24" r="2" fill={color} opacity="0.7" />
      <Circle cx="42" cy="24" r="2" fill={color} opacity="0.7" />
      
      {/* Connection lines to nodes */}
      <Path
        d="M12 10 L16 14 M36 10 L32 14 M8 24 L12 24 M40 24 L36 24"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
      />
      
      {/* Open book base */}
      <Path
        d="M24 14 L24 40"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
      />
      
      {/* Left page */}
      <Path
        d="M8 14 C8 14 14 12 24 14 L24 40 C14 38 8 36 8 36 Z"
        fill={color}
        opacity="0.15"
      />
      <Path
        d="M8 14 C8 14 14 12 24 14 L24 40 C14 38 8 36 8 36 Z"
        stroke="url(#manualGrad)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Right page */}
      <Path
        d="M40 14 C40 14 34 12 24 14 L24 40 C34 38 40 36 40 36 Z"
        fill={color}
        opacity="0.15"
      />
      <Path
        d="M40 14 C40 14 34 12 24 14 L24 40 C34 38 40 36 40 36 Z"
        stroke="url(#manualGrad)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Page lines - left */}
      <Path d="M12 20 L21 21" stroke={color} strokeWidth={strokeWidth * 0.3} strokeLinecap="round" opacity="0.6" />
      <Path d="M12 25 L21 26" stroke={color} strokeWidth={strokeWidth * 0.3} strokeLinecap="round" opacity="0.6" />
      <Path d="M12 30 L21 31" stroke={color} strokeWidth={strokeWidth * 0.3} strokeLinecap="round" opacity="0.6" />
      
      {/* Page lines - right */}
      <Path d="M36 20 L27 21" stroke={color} strokeWidth={strokeWidth * 0.3} strokeLinecap="round" opacity="0.6" />
      <Path d="M36 25 L27 26" stroke={color} strokeWidth={strokeWidth * 0.3} strokeLinecap="round" opacity="0.6" />
      <Path d="M36 30 L27 31" stroke={color} strokeWidth={strokeWidth * 0.3} strokeLinecap="round" opacity="0.6" />
      
      {/* Glowing knowledge emanating */}
      <Circle cx="24" cy="8" r="3" stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" />
      <Circle cx="24" cy="8" r="1.5" fill={color} />
      
      {/* Light rays from knowledge */}
      <Path
        d="M24 4 L24 2 M28 6 L30 4 M20 6 L18 4"
        stroke={color}
        strokeWidth={strokeWidth * 0.4}
        strokeLinecap="round"
        opacity="0.7"
      />
    </Svg>
  );
}
