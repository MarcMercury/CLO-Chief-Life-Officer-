import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function DashboardView() {
  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      <Text style={styles.greeting}>Good Morning</Text>
      <Text style={styles.subtitle}>Your Life at a Glance</Text>
      
      <View style={styles.widgetGrid}>
        {/* Self Widget */}
        <View style={[styles.widget, styles.selfWidget]}>
          <Text style={styles.widgetTitle}>Self</Text>
          <Text style={styles.widgetValue}>Ready</Text>
        </View>
        
        {/* Relationships Widget */}
        <View style={[styles.widget, styles.relWidget]}>
          <Text style={styles.widgetTitle}>Relationships</Text>
          <Text style={styles.widgetValue}>2 Updates</Text>
        </View>
        
        {/* Home Widget */}
        <View style={[styles.widget, styles.homeWidget]}>
          <Text style={styles.widgetTitle}>Home</Text>
          <Text style={styles.widgetValue}>All Secure</Text>
        </View>
      </View>
      
      <View style={styles.pulseContainer}>
        <Text style={styles.pulseHint}>Swipe the orb to navigate</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '300',
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  widgetGrid: {
    marginTop: 40,
    gap: 16,
  },
  widget: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  selfWidget: {
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  relWidget: {
    borderLeftWidth: 3,
    borderLeftColor: '#e17055',
  },
  homeWidget: {
    borderLeftWidth: 3,
    borderLeftColor: '#84a98c',
  },
  widgetTitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 8,
  },
  widgetValue: {
    fontSize: 20,
    fontWeight: '300',
    color: '#E0E0E0',
  },
  pulseContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 120,
  },
  pulseHint: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 0.5,
  },
});
