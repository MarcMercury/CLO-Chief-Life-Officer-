/**
 * Nest Icon - Central command hub
 * 
 * Design: Central orbital system with radiating connections to all life areas,
 * representing the home/nest as the central point of the CLO app.
 */

import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function NestIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#8B5CF6',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <RadialGradient id="nestGrad" cx="24" cy="24" r="20">
          <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="nestLineGrad" x1="0" y1="24" x2="48" y2="24">
          <Stop offset="0%" stopColor="#EC4899" stopOpacity="1" />
          <Stop offset="50%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#10B981" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      
      {/* Outer orbital ring */}
      <Circle
        cx="24"
        cy="24"
        r="22"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.3}
        strokeDasharray="1 3"
        fill="none"
      />
      
      {/* Middle orbital ring */}
      <Circle
        cx="24"
        cy="24"
        r="16"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        strokeDasharray="3 4"
        fill="none"
      />
      
      {/* Inner orbital ring */}
      <Circle
        cx="24"
        cy="24"
        r="10"
        stroke="url(#nestLineGrad)"
        strokeWidth={strokeWidth * 0.5}
        fill="none"
      />
      
      {/* Central glow */}
      <Circle cx="24" cy="24" r="16" fill="url(#nestGrad)" />
      
      {/* Central nest/home symbol */}
      <Circle cx="24" cy="24" r="6" fill={color} opacity="0.2" />
      <Circle
        cx="24"
        cy="24"
        r="6"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle cx="24" cy="24" r="2.5" fill={color} />
      
      {/* Radiating connection lines to life areas */}
      {/* Self (top) */}
      <Path d="M24 18 L24 6" stroke="#EC4899" strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
      <Circle cx="24" cy="4" r="3" fill="#EC4899" />
      
      {/* Home (right) */}
      <Path d="M30 24 L42 24" stroke="#10B981" strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
      <Circle cx="44" cy="24" r="3" fill="#10B981" />
      
      {/* Relationship (bottom) */}
      <Path d="M24 30 L24 42" stroke={color} strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
      <Circle cx="24" cy="44" r="3" fill={color} />
      
      {/* Diagonal connections */}
      <Path d="M28.5 19.5 L37 11" stroke="#F59E0B" strokeWidth={strokeWidth * 0.4} strokeLinecap="round" opacity="0.7" />
      <Circle cx="38" cy="10" r="2.5" fill="#F59E0B" opacity="0.8" />
      
      <Path d="M28.5 28.5 L37 37" stroke="#3B82F6" strokeWidth={strokeWidth * 0.4} strokeLinecap="round" opacity="0.7" />
      <Circle cx="38" cy="38" r="2.5" fill="#3B82F6" opacity="0.8" />
      
      <Path d="M19.5 28.5 L11 37" stroke="#EF4444" strokeWidth={strokeWidth * 0.4} strokeLinecap="round" opacity="0.7" />
      <Circle cx="10" cy="38" r="2.5" fill="#EF4444" opacity="0.8" />
      
      <Path d="M19.5 19.5 L11 11" stroke="#06B6D4" strokeWidth={strokeWidth * 0.4} strokeLinecap="round" opacity="0.7" />
      <Circle cx="10" cy="10" r="2.5" fill="#06B6D4" opacity="0.8" />
      
      {/* Left connection */}
      <Path d="M18 24 L6 24" stroke="#F59E0B" strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
      <Circle cx="4" cy="24" r="3" fill="#F59E0B" />
    </Svg>
  );
}
