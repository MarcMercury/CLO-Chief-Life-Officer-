import React, { useState, memo } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Slot } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/uiStore';
import OrbitalControl from '../../components/navigation/OrbitalControl';
import CreateItemModal from '../../components/modals/CreateItemModal';

function MainLayout() {
  const { themeColors } = useUIStore();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const handleOpenCreateModal = () => {
    Haptics.selectionAsync();
    setIsCreateModalVisible(true);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
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
    </View>
  );
}

export default memo(MainLayout);

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
