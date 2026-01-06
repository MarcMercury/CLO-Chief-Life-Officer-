/**
 * Signal Icon - Communication wave system
 * 
 * Design: Chat bubble with radiating signal waves and connection nodes,
 * representing open communication between partners.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function SignalIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#06B6D4',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="signalGrad" x1="8" y1="8" x2="40" y2="36">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Signal wave orbital */}
      <Circle
        cx="24"
        cy="22"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="2 4"
        fill="none"
      />
      
      {/* Signal waves emanating from bubble */}
      <Path
        d="M40 10 C44 14 44 22 40 26"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <Path
        d="M44 6 C50 12 50 26 44 32"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <Path
        d="M8 10 C4 14 4 22 8 26"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <Path
        d="M4 6 C-2 12 -2 26 4 32"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      
      {/* Main chat bubble */}
      <Path
        d="M12 8 L36 8 C38 8 40 10 40 12 L40 28 C40 30 38 32 36 32 L28 32 L24 40 L20 32 L12 32 C10 32 8 30 8 28 L8 12 C8 10 10 8 12 8"
        fill={color}
        opacity="0.15"
      />
      <Path
        d="M12 8 L36 8 C38 8 40 10 40 12 L40 28 C40 30 38 32 36 32 L28 32 L24 40 L20 32 L12 32 C10 32 8 30 8 28 L8 12 C8 10 10 8 12 8"
        stroke="url(#signalGrad)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Message content dots (typing/conversation) */}
      <Circle cx="16" cy="20" r="2.5" fill={color} opacity="0.8" />
      <Circle cx="24" cy="20" r="2.5" fill={color} opacity="0.8" />
      <Circle cx="32" cy="20" r="2.5" fill={color} opacity="0.8" />
      
      {/* Connection pulse */}
      <Circle cx="16" cy="20" r="4" stroke={color} strokeWidth={strokeWidth * 0.3} fill="none" opacity="0.4" />
      <Circle cx="24" cy="20" r="4" stroke={color} strokeWidth={strokeWidth * 0.3} fill="none" opacity="0.4" />
      <Circle cx="32" cy="20" r="4" stroke={color} strokeWidth={strokeWidth * 0.3} fill="none" opacity="0.4" />
      
      {/* Signal nodes */}
      <Circle cx="24" cy="4" r="2.5" fill={color} />
      <Circle cx="10" cy="42" r="2" fill={color} opacity="0.6" />
      <Circle cx="38" cy="42" r="2" fill={color} opacity="0.6" />
      
      {/* Connection to nodes */}
      <Path d="M24 6 L24 8" stroke={secondary} strokeWidth={strokeWidth * 0.4} />
      <Path d="M12 38 L20 34 M36 38 L28 34" stroke={secondary} strokeWidth={strokeWidth * 0.3} strokeDasharray="2 2" />
    </Svg>
  );
}
