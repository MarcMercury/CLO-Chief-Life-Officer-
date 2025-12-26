import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  useSharedTasks,
  useCreateSharedTask,
  useToggleSharedTask,
  useOpenLoops,
  useCreateOpenLoop,
} from '@/hooks/useCapsules';

const ACCENT = '#e17055';

interface CapsulePlanProps {
  capsuleId: string;
}

export default function CapsulePlan({ capsuleId }: CapsulePlanProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddLoop, setShowAddLoop] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newLoopTitle, setNewLoopTitle] = useState('');
  
  const { data: tasks, isLoading: tasksLoading } = useSharedTasks(capsuleId);
  const { data: loops, isLoading: loopsLoading } = useOpenLoops(capsuleId);
  const { mutate: createTask, isPending: creatingTask } = useCreateSharedTask();
  const { mutate: toggleTask } = useToggleSharedTask();
  const { mutate: createLoop, isPending: creatingLoop } = useCreateOpenLoop();

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    
    createTask({
      capsule_id: capsuleId,
      title: newTaskTitle.trim(),
    }, {
      onSuccess: () => {
        setNewTaskTitle('');
        setShowAddTask(false);
      },
    });
  };

  const handleCreateLoop = () => {
    if (!newLoopTitle.trim()) return;
    
    createLoop({
      capsule_id: capsuleId,
      title: newLoopTitle.trim(),
    }, {
      onSuccess: () => {
        setNewLoopTitle('');
        setShowAddLoop(false);
      },
    });
  };

  const handleToggleTask = (taskId: string, currentStatus: boolean) => {
    toggleTask({
      taskId,
      capsuleId,
      isCompleted: !currentStatus,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Shared Tasks Section */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shared Tasks</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.selectionAsync();
              setShowAddTask(!showAddTask);
            }}
          >
            <Text style={styles.addButtonText}>{showAddTask ? '✕' : '+'}</Text>
          </TouchableOpacity>
        </View>

        {/* Add Task Form */}
        {showAddTask && (
          <Animated.View entering={FadeInUp.duration(200)} style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="What do you need to do together?"
              placeholderTextColor="#666"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateTask}
            />
            <TouchableOpacity
              style={[styles.submitButton, creatingTask && styles.buttonDisabled]}
              onPress={handleCreateTask}
              disabled={creatingTask}
            >
              <Text style={styles.submitButtonText}>
                {creatingTask ? 'Adding...' : 'Add Task'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Tasks List */}
        {tasksLoading ? (
          <ActivityIndicator size="small" color={ACCENT} style={styles.loader} />
        ) : tasks && tasks.length > 0 ? (
          <View style={styles.taskList}>
            {tasks.map((task: any, index: number) => (
              <Animated.View
                key={task.id}
                entering={FadeInUp.delay(index * 50).duration(200)}
              >
                <TouchableOpacity
                  style={[styles.taskItem, task.is_completed && styles.taskCompleted]}
                  onPress={() => handleToggleTask(task.id, task.is_completed)}
                >
                  <View style={[
                    styles.checkbox,
                    task.is_completed && styles.checkboxChecked
                  ]}>
                    {task.is_completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[
                    styles.taskTitle,
                    task.is_completed && styles.taskTitleCompleted
                  ]}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No shared tasks yet</Text>
            <Text style={styles.emptySubtext}>Add tasks you want to tackle together</Text>
          </View>
        )}
      </Animated.View>

      {/* Open Loops Section */}
      <Animated.View entering={FadeIn.delay(150).duration(300)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Loops</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.selectionAsync();
              setShowAddLoop(!showAddLoop);
            }}
          >
            <Text style={styles.addButtonText}>{showAddLoop ? '✕' : '+'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>Things discussed but not resolved</Text>

        {/* Add Loop Form */}
        {showAddLoop && (
          <Animated.View entering={FadeInUp.duration(200)} style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="What's unresolved?"
              placeholderTextColor="#666"
              value={newLoopTitle}
              onChangeText={setNewLoopTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateLoop}
            />
            <TouchableOpacity
              style={[styles.submitButton, creatingLoop && styles.buttonDisabled]}
              onPress={handleCreateLoop}
              disabled={creatingLoop}
            >
              <Text style={styles.submitButtonText}>
                {creatingLoop ? 'Adding...' : 'Add Loop'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Loops List */}
        {loopsLoading ? (
          <ActivityIndicator size="small" color={ACCENT} style={styles.loader} />
        ) : loops && loops.length > 0 ? (
          <View style={styles.loopList}>
            {loops.map((loop: any, index: number) => (
              <Animated.View
                key={loop.id}
                entering={FadeInUp.delay(index * 50).duration(200)}
                style={styles.loopItem}
              >
                <View style={styles.loopIndicator} />
                <Text style={styles.loopTitle}>{loop.description}</Text>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔄</Text>
            <Text style={styles.emptyText}>No open loops</Text>
            <Text style={styles.emptySubtext}>Track things you need to circle back on</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: ACCENT,
  },
  addForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    fontSize: 15,
    color: '#E0E0E0',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitButton: {
    backgroundColor: ACCENT,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  loader: {
    padding: 20,
  },
  taskList: {
    gap: 8,
    marginTop: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
  },
  taskCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    color: '#E0E0E0',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  loopList: {
    gap: 8,
    marginTop: 12,
  },
  loopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
  },
  loopIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eab308',
  },
  loopTitle: {
    flex: 1,
    fontSize: 15,
    color: '#E0E0E0',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});
