import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { MoodEmoji } from '@/types/relationships';

interface PartnerMoods {
  self?: MoodEmoji;
  partner?: MoodEmoji;
  us?: MoodEmoji;
  logged_at?: string;
}

interface PulseCheckInProps {
  onSubmit: (moods: { self: MoodEmoji; partner: MoodEmoji; us: MoodEmoji; notes?: string }) => void;
  loading?: boolean;
  partnerMoods?: PartnerMoods;
  partnerName?: string;
}

const MOOD_OPTIONS: { emoji: MoodEmoji; label: string }[] = [
  { emoji: '😊', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Low' },
  { emoji: '😢', label: 'Struggling' },
];

export default function PulseCheckIn({ onSubmit, loading, partnerMoods, partnerName = 'Partner' }: PulseCheckInProps) {
  const [step, setStep] = useState<'self' | 'partner' | 'us' | 'notes' | 'summary'>('self');
  const [moodSelf, setMoodSelf] = useState<MoodEmoji | null>(null);
  const [moodPartner, setMoodPartner] = useState<MoodEmoji | null>(null);
  const [moodUs, setMoodUs] = useState<MoodEmoji | null>(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    setStep('summary');
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
      case 'summary':
        return 'Your Pulse Summary';
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

  const renderSummary = () => (
    <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={false}>
      {/* YOU Section */}
      <View style={styles.summarySection}>
        <Text style={styles.summarySectionTitle}>How YOU Feel</Text>
        <View style={styles.moodComparisonRow}>
          <View style={styles.moodCard}>
            <Text style={styles.moodCardLabel}>Mine</Text>
            <Text style={styles.moodCardEmoji}>{moodSelf}</Text>
          </View>
          {partnerMoods?.self && (
            <View style={[styles.moodCard, styles.moodCardTheirs]}>
              <Text style={styles.moodCardLabel}>Theirs</Text>
              <Text style={styles.moodCardEmoji}>{partnerMoods.self}</Text>
            </View>
          )}
        </View>
      </View>

      {/* THEM Section */}
      <View style={styles.summarySection}>
        <Text style={styles.summarySectionTitle}>How You Feel About THEM</Text>
        <View style={styles.moodComparisonRow}>
          <View style={styles.moodCard}>
            <Text style={styles.moodCardLabel}>Mine</Text>
            <Text style={styles.moodCardEmoji}>{moodPartner}</Text>
          </View>
          {partnerMoods?.partner && (
            <View style={[styles.moodCard, styles.moodCardTheirs]}>
              <Text style={styles.moodCardLabel}>Theirs</Text>
              <Text style={styles.moodCardEmoji}>{partnerMoods.partner}</Text>
            </View>
          )}
        </View>
      </View>

      {/* US Section */}
      <View style={styles.summarySection}>
        <Text style={styles.summarySectionTitle}>How You Feel About US</Text>
        <View style={styles.moodComparisonRow}>
          <View style={styles.moodCard}>
            <Text style={styles.moodCardLabel}>Mine</Text>
            <Text style={styles.moodCardEmoji}>{moodUs}</Text>
          </View>
          {partnerMoods?.us && (
            <View style={[styles.moodCard, styles.moodCardTheirs]}>
              <Text style={styles.moodCardLabel}>Theirs</Text>
              <Text style={styles.moodCardEmoji}>{partnerMoods.us}</Text>
            </View>
          )}
        </View>
      </View>

      {!partnerMoods?.self && (
        <View style={styles.waitingForPartner}>
          <Text style={styles.waitingIcon}>⏳</Text>
          <Text style={styles.waitingText}>{partnerName} hasn't checked in yet today</Text>
        </View>
      )}

      <View style={styles.summaryFooter}>
        <Text style={styles.footerText}>✓ Check-in complete</Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Pulse</Text>
      
      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        <View style={[styles.dot, moodSelf && styles.dotFilled]} />
        <View style={[styles.dot, moodPartner && styles.dotFilled]} />
        <View style={[styles.dot, moodUs && styles.dotFilled]} />
        {submitted && <View style={[styles.dot, styles.dotFilled]} />}
      </View>

      <Text style={styles.prompt}>{getPrompt()}</Text>

      {step === 'summary' ? renderSummary() : step === 'notes' ? renderNotesInput() : renderMoodSelector()}

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
  // Summary styles
  summaryContainer: {
    maxHeight: 400,
  },
  summarySection: {
    marginBottom: 20,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A0A0A0',
    marginBottom: 12,
    textAlign: 'center',
  },
  moodComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  moodCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  moodCardTheirs: {
    backgroundColor: '#3A2A2A',
    borderColor: '#e17055',
    borderWidth: 1,
  },
  moodCardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  moodCardEmoji: {
    fontSize: 36,
  },
  waitingForPartner: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  waitingIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  waitingText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  summaryFooter: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});
