import React, { Suspense, lazy, memo } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { useTheme } from '../../providers/ThemeProvider';

// Lazy load views for faster initial render
const DashboardView = lazy(() => import('../../views/DashboardView'));
const SelfView = lazy(() => import('../../views/SelfView'));
const RelationshipsView = lazy(() => import('../../views/RelationshipsView'));
const HomeView = lazy(() => import('../../views/HomeView'));

const LoadingFallback = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.dashboard} />
    </View>
  );
};

function MainScreen() {
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
    <View style={styles.container}>
      <Suspense fallback={<LoadingFallback />}>
        {renderView()}
      </Suspense>
    </View>
  );
}

export default memo(MainScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
