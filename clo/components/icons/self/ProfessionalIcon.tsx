/**
 * Professional Icon - Career/Growth constellation
 * 
 * Design: Rising chart with briefcase element and network nodes,
 * suggesting career growth and professional connections.
 */

import React from 'react';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function ProfessionalIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#3B82F6',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="professionalGrad" x1="0" y1="48" x2="48" y2="0">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      
      {/* Orbital career path */}
      <Path
        d="M8 40 Q12 36 16 32 Q24 24 32 18 Q38 14 42 10"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.75}
        strokeDasharray="4 4"
        fill="none"
      />
      
      {/* Briefcase - stylized */}
      <Rect
        x="16"
        y="22"
        width="16"
        height="12"
        rx="2"
        stroke="url(#professionalGrad)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Briefcase handle */}
      <Path
        d="M20 22 L20 20 Q20 18 24 18 Q28 18 28 20 L28 22"
        stroke="url(#professionalGrad)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Briefcase clasp */}
      <Path
        d="M22 28 L26 28"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Rising milestone nodes */}
      <Circle cx="8" cy="40" r="3" fill={color} />
      <Circle cx="8" cy="40" r="4.5" stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" opacity="0.4" />
      
      <Circle cx="18" cy="32" r="2.5" fill={color} opacity="0.8" />
      
      <Circle cx="32" cy="18" r="2.5" fill={color} opacity="0.8" />
      
      <Circle cx="42" cy="8" r="3.5" fill={color} />
      <Circle cx="42" cy="8" r="5" stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" opacity="0.4" />
      
      {/* Star at peak (achievement) */}
      <Path
        d="M42 4 L43 7 L46 7 L43.5 9 L44.5 12 L42 10 L39.5 12 L40.5 9 L38 7 L41 7 Z"
        fill={color}
        opacity="0.6"
      />
      
      {/* Network connection lines */}
      <Path
        d="M8 40 L18 32 M32 18 L42 8"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        opacity="0.5"
      />
      
      {/* Floating idea nodes */}
      <Circle cx="40" cy="28" r="1.5" fill={color} opacity="0.4" />
      <Circle cx="6" cy="20" r="1.5" fill={color} opacity="0.4" />
    </Svg>
  );
}
