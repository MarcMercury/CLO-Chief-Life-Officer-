import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Slot } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/uiStore';
import OrbitalControl from '../../components/navigation/OrbitalControl';
import CreateItemModal from '../../components/modals/CreateItemModal';

export default function MainLayout() {
  const { themeColors } = useUIStore();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  
  // Shared values for animated background
  const backgroundColor = useSharedValue(themeColors.background);
  
  useEffect(() => {
    backgroundColor.value = withTiming(themeColors.background, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  }, [themeColors.background]);
  
  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const handleOpenCreateModal = () => {
    Haptics.selectionAsync();
    setIsCreateModalVisible(true);
  };
  
  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={styles.content}>
        <Slot />
      </View>
      
      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { borderColor: themeColors.accent }]}
        onPress={handleOpenCreateModal}
      >
        <Text style={[styles.addButtonText, { color: themeColors.accent }]}>+</Text>
      </TouchableOpacity>
      
      <OrbitalControl />
      
      {/* Create Item Modal */}
      <CreateItemModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 50,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
