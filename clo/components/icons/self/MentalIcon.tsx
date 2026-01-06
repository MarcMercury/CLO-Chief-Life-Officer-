/**
 * Mental Icon - Brain/Mind constellation
 * 
 * Design: Abstract brain shape formed by connected neural nodes
 * with orbital thought bubbles circling around.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function MentalIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#8B5CF6',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="mentalGrad" x1="0" y1="0" x2="48" y2="48">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#EC4899" stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      
      {/* Outer thought orbit */}
      <Ellipse
        cx="24"
        cy="24"
        rx="21"
        ry="18"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        strokeDasharray="2 4"
        fill="none"
        transform="rotate(-15 24 24)"
      />
      
      {/* Brain outline - stylized */}
      <Path
        d="M16 28 C10 28 8 22 10 18 C12 14 16 12 20 13 C22 10 26 10 28 13 C32 12 36 14 38 18 C40 22 38 28 32 28"
        stroke="url(#mentalGrad)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Brain center divide */}
      <Path
        d="M24 13 C24 16 22 20 24 24 C26 28 24 32 24 34"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.75}
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Neural connection nodes */}
      <Circle cx="14" cy="20" r="2.5" fill={color} />
      <Circle cx="20" cy="16" r="2" fill={color} opacity="0.8" />
      <Circle cx="28" cy="16" r="2" fill={color} opacity="0.8" />
      <Circle cx="34" cy="20" r="2.5" fill={color} />
      <Circle cx="18" cy="26" r="2" fill={color} opacity="0.7" />
      <Circle cx="30" cy="26" r="2" fill={color} opacity="0.7" />
      
      {/* Synaptic connections */}
      <Path
        d="M14 20 L20 16 M20 16 L28 16 M28 16 L34 20 M18 26 L24 24 L30 26"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        fill="none"
        opacity="0.6"
      />
      
      {/* Orbiting thought nodes */}
      <Circle cx="8" cy="14" r="2" fill={color} opacity="0.6" />
      <Circle cx="40" cy="14" r="1.5" fill={color} opacity="0.5" />
      <Circle cx="24" cy="38" r="2" fill={color} opacity="0.6" />
    </Svg>
  );
}
