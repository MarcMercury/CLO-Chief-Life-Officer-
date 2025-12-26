import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useUIStore } from '../../store/uiStore';
import { DashboardView, SelfView, RelationshipsView, HomeView } from '../../views';

export default function MainScreen() {
  const { activeCircle } = useUIStore();

  const renderView = () => {
    switch (activeCircle) {
      case 'SELF':
        return <SelfView key="self" />;
      case 'RELATIONSHIPS':
        return <RelationshipsView key="relationships" />;
      case 'HOME':
        return <HomeView key="home" />;
      case 'DASHBOARD':
      default:
        return <DashboardView key="dashboard" />;
    }
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
    >
      {renderView()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
