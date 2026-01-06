/**
 * Overview Icon - Dashboard constellation
 * 
 * Design: Central hub with radiating data points and orbital rings,
 * suggesting a command center view of home status.
 */

import React from 'react';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconProps, DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from '../index';

export default function OverviewIcon({
  size = DEFAULT_ICON_SIZE,
  color = '#10B981',
  secondaryColor,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const secondary = secondaryColor || `${color}66`;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="overviewGrad" x1="24" y1="4" x2="24" y2="44">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      
      {/* Outer orbital ring */}
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.5}
        strokeDasharray="2 4"
        fill="none"
      />
      
      {/* Middle orbital ring */}
      <Circle
        cx="24"
        cy="24"
        r="14"
        stroke={secondary}
        strokeWidth={strokeWidth * 0.4}
        fill="none"
      />
      
      {/* Central hub */}
      <Circle cx="24" cy="24" r="6" fill={color} opacity="0.2" />
      <Circle cx="24" cy="24" r="6" stroke="url(#overviewGrad)" strokeWidth={strokeWidth} fill="none" />
      <Circle cx="24" cy="24" r="2.5" fill={color} />
      
      {/* Data point nodes around the hub */}
      {/* Top */}
      <Circle cx="24" cy="8" r="3" fill={color} />
      <Path d="M24 14 L24 18" stroke={secondary} strokeWidth={strokeWidth * 0.5} />
      
      {/* Right */}
      <Circle cx="40" cy="24" r="3" fill={color} />
      <Path d="M34 24 L30 24" stroke={secondary} strokeWidth={strokeWidth * 0.5} />
      
      {/* Bottom */}
      <Circle cx="24" cy="40" r="3" fill={color} />
      <Path d="M24 34 L24 30" stroke={secondary} strokeWidth={strokeWidth * 0.5} />
      
      {/* Left */}
      <Circle cx="8" cy="24" r="3" fill={color} />
      <Path d="M14 24 L18 24" stroke={secondary} strokeWidth={strokeWidth * 0.5} />
      
      {/* Diagonal data points */}
      <Circle cx="36" cy="12" r="2" fill={color} opacity="0.7" />
      <Circle cx="36" cy="36" r="2" fill={color} opacity="0.7" />
      <Circle cx="12" cy="36" r="2" fill={color} opacity="0.7" />
      <Circle cx="12" cy="12" r="2" fill={color} opacity="0.7" />
      
      {/* Connection lines */}
      <Path
        d="M14 14 L20 20 M34 14 L28 20 M34 34 L28 28 M14 34 L20 28"
        stroke={color}
        strokeWidth={strokeWidth * 0.4}
        opacity="0.5"
      />
    </Svg>
  );
}
