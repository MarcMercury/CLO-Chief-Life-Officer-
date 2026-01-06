/**
 * Bills Icon - Payment flow constellation
 * 
 * Design: Stylized card with flowing payment streams and 
 * subscription cycle nodes representing recurring expenses.
 */

import React from 'react';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function BillsIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#F59E0B',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="billsGrad" x1="10" y1="12" x2="38" y2="36">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#EF4444" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Recurring cycle orbital */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="4 3"
        fill="none"
      />
      
      {/* Payment cycle arrow indicators */}
      <Path
        d="M42 28 L44 24 L40 22"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Card base shape */}
      <Rect
        x="10"
        y="14"
        width="28"
        height="20"
        rx="3"
        ry="3"
        fill={color}
        opacity="0.15"
      />
      <Rect
        x="10"
        y="14"
        width="28"
        height="20"
        rx="3"
        ry="3"
        stroke="url(#billsGrad)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* Card stripe */}
      <Rect x="10" y="19" width="28" height="4" fill={color} opacity="0.3" />
      
      {/* Chip symbol */}
      <Rect
        x="14"
        y="25"
        width="6"
        height="5"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        fill={color}
        opacity="0.5"
      />
      <Path d="M14 27.5 L20 27.5 M17 25 L17 30" stroke={color} strokeWidth={strokeWidth * 0.3} />
      
      {/* Currency flow lines */}
      <Path
        d="M26 27 C30 24 32 28 36 25"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M26 30 C30 27 32 31 36 28"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Subscription nodes (orbiting the card) */}
      <Circle cx="8" cy="12" r="2.5" fill={color} />
      <Circle cx="40" cy="12" r="2.5" fill={color} />
      <Circle cx="8" cy="36" r="2.5" fill={color} />
      <Circle cx="40" cy="36" r="2.5" fill={color} />
      
      {/* Connection to nodes */}
      <Path
        d="M10 14 L8 12 M38 14 L40 12 M10 34 L8 36 M38 34 L40 36"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
      />
      
      {/* Dollar/currency accent */}
      <Path
        d="M24 6 L24 8 M22 7 C22 5 26 5 26 7 C26 9 22 9 22 11 C22 13 26 13 26 11 M24 12 L24 10"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
