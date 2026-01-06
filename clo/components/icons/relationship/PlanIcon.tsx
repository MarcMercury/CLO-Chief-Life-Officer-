/**
 * Plan Icon - Brainstorm constellation
 * 
 * Design: Lightbulb at center with orbiting idea nodes and
 * connecting thought paths, representing shared planning and ideas.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function PlanIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#F59E0B',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="planGrad" x1="24" y1="4" x2="24" y2="38">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#EAB308" stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Idea orbit */}
      <Circle
        cx="24"
        cy="20"
        r="18"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="3 4"
        fill="none"
      />
      
      {/* Lightbulb body */}
      <Path
        d="M24 6 C16 6 12 12 12 18 C12 22 14 26 18 28 L18 32 L30 32 L30 28 C34 26 36 22 36 18 C36 12 32 6 24 6"
        fill={color}
        opacity="0.15"
      />
      <Path
        d="M24 6 C16 6 12 12 12 18 C12 22 14 26 18 28 L18 32 L30 32 L30 28 C34 26 36 22 36 18 C36 12 32 6 24 6"
        stroke="url(#planGrad)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Lightbulb base */}
      <Path d="M18 32 L30 32" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M19 35 L29 35" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
      <Path d="M21 38 L27 38" stroke={color} strokeWidth={strokeWidth * 0.6} strokeLinecap="round" />
      
      {/* Filament glow inside */}
      <Path
        d="M20 20 C20 16 28 16 28 20 M22 20 L22 24 M26 20 L26 24"
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
        opacity="0.7"
      />
      
      {/* Central glow */}
      <Circle cx="24" cy="18" r="4" fill={color} opacity="0.3" />
      
      {/* Orbiting idea nodes */}
      <Circle cx="8" cy="12" r="3" fill={color} />
      <Circle cx="40" cy="12" r="3" fill={color} />
      <Circle cx="6" cy="26" r="2.5" fill={color} opacity="0.8" />
      <Circle cx="42" cy="26" r="2.5" fill={color} opacity="0.8" />
      
      {/* Thought connection lines */}
      <Path
        d="M11 12 L16 14 M37 12 L32 14 M9 26 L14 24 M39 26 L34 24"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="2 2"
      />
      
      {/* Sparkle accents around bulb */}
      <Path d="M6 6 L8 8" stroke={color} strokeWidth={strokeWidth * 0.4} strokeLinecap="round" />
      <Path d="M42 6 L40 8" stroke={color} strokeWidth={strokeWidth * 0.4} strokeLinecap="round" />
      <Path d="M4 18 L6 18" stroke={color} strokeWidth={strokeWidth * 0.4} strokeLinecap="round" />
      <Path d="M44 18 L42 18" stroke={color} strokeWidth={strokeWidth * 0.4} strokeLinecap="round" />
      
      {/* Small idea dots */}
      <Circle cx="10" cy="20" r="1.5" fill={color} opacity="0.6" />
      <Circle cx="38" cy="20" r="1.5" fill={color} opacity="0.6" />
      <Circle cx="24" cy="44" r="2" fill={color} opacity="0.5" />
    </Svg>
  );
}
