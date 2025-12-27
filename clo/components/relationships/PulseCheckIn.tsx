import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { MoodEmoji } from '@/types/relationships';

interface PulseCheckInProps {
  onSubmit: (moods: { self: MoodEmoji; partner: MoodEmoji; us: MoodEmoji; notes?: string }) => void;
  loading?: boolean;
}

const MOOD_OPTIONS: { emoji: MoodEmoji; label: string }[] = [
  { emoji: '😊', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Low' },
  { emoji: '😢', label: 'Struggling' },
];

export default function PulseCheckIn({ onSubmit, loading }: PulseCheckInProps) {
  const [step, setStep] = useState<'self' | 'partner' | 'us' | 'notes'>('self');
  const [moodSelf, setMoodSelf] = useState<MoodEmoji | null>(null);
  const [moodPartner, setMoodPartner] = useState<MoodEmoji | null>(null);
  const [moodUs, setMoodUs] = useState<MoodEmoji | null>(null);
  const [notes, setNotes] = useState('');

  const handleMoodSelect = (mood: MoodEmoji) => {
    if (step === 'self') {
      setMoodSelf(mood);
      setStep('partner');
    } else if (step === 'partner') {
      setMoodPartner(mood);
      setStep('us');
    } else if (step === 'us') {
      setMoodUs(mood);
      setStep('notes');
    }
  };

  const handleSubmit = () => {
    if (!moodSelf || !moodPartner || !moodUs) {
      Alert.alert('Please complete all check-ins');
      return;
    }
    onSubmit({
      self: moodSelf,
      partner: moodPartner,
      us: moodUs,
      notes: notes || undefined,
    });
  };

  const getPrompt = () => {
    switch (step) {
      case 'self':
        return 'How are YOU feeling right now?';
      case 'partner':
        return 'How do you feel about THEM right now?';
      case 'us':
        return 'How do you feel about US right now?';
      case 'notes':
        return 'Any private thoughts? (optional)';
    }
  };

  const renderMoodSelector = () => (
    <View style={styles.moodContainer}>
      {MOOD_OPTIONS.map(({ emoji, label }) => (
        <TouchableOpacity
          key={emoji}
          style={styles.moodButton}
          onPress={() => handleMoodSelect(emoji)}
        >
          <Text style={styles.moodEmoji}>{emoji}</Text>
          <Text style={styles.moodLabel}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderNotesInput = () => (
    <View style={styles.notesContainer}>
      <TextInput
        style={styles.notesInput}
        placeholder="Write your thoughts..."
        placeholderTextColor="#666"
        multiline
        value={notes}
        onChangeText={setNotes}
      />
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? 'Saving...' : 'Complete Check-In'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Pulse</Text>
      
      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        <View style={[styles.dot, moodSelf && styles.dotFilled]} />
        <View style={[styles.dot, moodPartner && styles.dotFilled]} />
        <View style={[styles.dot, moodUs && styles.dotFilled]} />
      </View>

      <Text style={styles.prompt}>{getPrompt()}</Text>

      {step === 'notes' ? renderNotesInput() : renderMoodSelector()}

      {/* Back Button */}
      {step !== 'self' && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (step === 'partner') setStep('self');
            else if (step === 'us') setStep('partner');
            else if (step === 'notes') setStep('us');
          }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  dotFilled: {
    backgroundColor: '#e17055',
  },
  prompt: {
    fontSize: 18,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 24,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  moodLabel: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  notesContainer: {
    gap: 16,
  },
  notesInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: '#E0E0E0',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#e17055',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    color: '#666',
    fontSize: 14,
  },
});
