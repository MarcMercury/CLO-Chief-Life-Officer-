/**
 * Alerts Icon - Notification pulse system
 * 
 * Design: Stylized bell with radiating alert waves and
 * notification nodes, suggesting active monitoring.
 */

import React from 'react';
import Svg, { Circle, Path, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function AlertsIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#EF4444',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="alertsGrad" x1="24" y1="6" x2="24" y2="40">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Alert wave rings emanating outward */}
      <Circle
        cx="24"
        cy="20"
        r="22"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="2 4"
        fill="none"
        opacity="0.5"
      />
      <Circle
        cx="24"
        cy="20"
        r="17"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="3 3"
        fill="none"
        opacity="0.7"
      />
      
      {/* Alert pulse waves from bell top */}
      <Path
        d="M8 14 C6 12 6 8 8 6"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <Path
        d="M40 14 C42 12 42 8 40 6"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <Path
        d="M12 16 C10 14 10 11 12 9"
        stroke={color}
        strokeWidth={strokeWidth * 0.4}
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <Path
        d="M36 16 C38 14 38 11 36 9"
        stroke={color}
        strokeWidth={strokeWidth * 0.4}
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      
      {/* Bell body */}
      <Path
        d="M16 32 L16 20 C16 14 19 10 24 10 C29 10 32 14 32 20 L32 32 L16 32"
        fill={color}
        opacity="0.15"
      />
      <Path
        d="M16 32 L16 20 C16 14 19 10 24 10 C29 10 32 14 32 20 L32 32"
        stroke="url(#alertsGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Bell base curve */}
      <Path
        d="M12 32 L36 32"
        stroke="url(#alertsGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Bell top nub */}
      <Circle cx="24" cy="8" r="2" fill={color} />
      <Path d="M24 10 L24 12" stroke={color} strokeWidth={strokeWidth * 0.5} />
      
      {/* Clapper */}
      <Circle cx="24" cy="38" r="3" fill={color} opacity="0.8" />
      <Path d="M24 32 L24 35" stroke={color} strokeWidth={strokeWidth * 0.5} />
      
      {/* Notification dots */}
      <Circle cx="38" cy="12" r="4" fill={color} />
      <Path d="M36 12 L40 12 M38 10 L38 14" stroke="#fff" strokeWidth={strokeWidth * 0.4} strokeLinecap="round" />
      
      {/* Status indicator nodes */}
      <Circle cx="6" cy="28" r="2" fill={color} opacity="0.6" />
      <Circle cx="42" cy="28" r="2" fill={color} opacity="0.6" />
      
      {/* Connecting lines */}
      <Path
        d="M8 28 L14 30 M40 28 L34 30"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
      />
    </Svg>
  );
}
