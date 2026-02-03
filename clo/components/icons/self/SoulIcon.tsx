/**
 * Soul Icon - Spirit/Gratitude constellation
 * 
 * Design: Flame/spirit with gentle glow, representing inner light,
 * gratitude, and emotional release.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, RadialGradient, Ellipse } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function SoulIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#F59E0B',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="soulGrad" x1="24" y1="44" x2="24" y2="8">
          <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
          <Stop offset="50%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#FCD34D" stopOpacity="0.6" />
        </LinearGradient>
        <RadialGradient id="soulGlow" cx="24" cy="24" r="20">
          <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      
      {/* Outer glow orbit */}
      <Ellipse
        cx="24"
        cy="26"
        rx="18"
        ry="16"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        strokeDasharray="2 4"
        fill="none"
      />
      
      {/* Inner glow */}
      <Circle cx="24" cy="26" r="16" fill="url(#soulGlow)" />
      
      {/* Main flame shape */}
      <Path
        d="M24 8 C28 14 34 18 34 26 C34 32 30 38 24 38 C18 38 14 32 14 26 C14 18 20 14 24 8"
        stroke="url(#soulGrad)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Inner flame */}
      <Path
        d="M24 18 C26 22 28 24 28 28 C28 32 26 34 24 34 C22 34 20 32 20 28 C20 24 22 22 24 18"
        stroke={color}
        strokeWidth={strokeWidth * 0.75}
        fill="none"
        opacity="0.7"
      />
      
      {/* Core light */}
      <Circle cx="24" cy="28" r="3" fill={color} opacity="0.9" />
      
      {/* Gratitude spark nodes floating around */}
      <Circle cx="10" cy="20" r="1.5" fill={color} opacity="0.6" />
      <Circle cx="38" cy="20" r="1.5" fill={color} opacity="0.6" />
      <Circle cx="8" cy="32" r="1" fill={color} opacity="0.4" />
      <Circle cx="40" cy="32" r="1" fill={color} opacity="0.4" />
      <Circle cx="16" cy="42" r="1.5" fill={color} opacity="0.5" />
      <Circle cx="32" cy="42" r="1.5" fill={color} opacity="0.5" />
      
      {/* Rising spark */}
      <Circle cx="24" cy="4" r="1" fill={color} opacity="0.7" />
    </Svg>
  );
}
