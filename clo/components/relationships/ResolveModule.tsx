import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { ResolveItem } from '@/types/relationships';

interface ResolveModuleProps {
  items: ResolveItem[];
  onCreateIssue: (issue: string) => void;
  onSubmitPerspective: (
    resolveId: string,
    feeling: string,
    need: string,
    willing: string,
    compromise: string
  ) => void;
  onAcceptCompromise: (resolveId: string) => void;
  isUserA: boolean;
  userId: string;
  loading?: boolean;
}

export default function ResolveModule({
  items,
  onCreateIssue,
  onSubmitPerspective,
  onAcceptCompromise,
  isUserA,
  userId,
  loading,
}: ResolveModuleProps) {
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [newIssue, setNewIssue] = useState('');
  const [activeResolve, setActiveResolve] = useState<string | null>(null);
  const [feeling, setFeeling] = useState('');
  const [need, setNeed] = useState('');
  const [willing, setWilling] = useState('');
  const [compromise, setCompromise] = useState('');

  const handleCreateIssue = () => {
    if (!newIssue.trim()) return;
    onCreateIssue(newIssue);
    setNewIssue('');
    setShowNewIssue(false);
  };

  const handleSubmitPerspective = (resolveId: string) => {
    if (!feeling || !need || !willing || !compromise) return;
    onSubmitPerspective(resolveId, feeling, need, willing, compromise);
    setFeeling('');
    setNeed('');
    setWilling('');
    setCompromise('');
    setActiveResolve(null);
  };

  const getMyPerspective = (item: ResolveItem) => {
    return isUserA
      ? {
          feeling: item.feeling_a,
          need: item.need_a,
          willing: item.willing_a,
          compromise: item.compromise_a,
          accepted: item.accepted_a,
        }
      : {
          feeling: item.feeling_b,
          need: item.need_b,
          willing: item.willing_b,
          compromise: item.compromise_b,
          accepted: item.accepted_b,
        };
  };

  const getTheirPerspective = (item: ResolveItem) => {
    return isUserA
      ? {
          feeling: item.feeling_b,
          need: item.need_b,
          willing: item.willing_b,
          compromise: item.compromise_b,
          accepted: item.accepted_b,
        }
      : {
          feeling: item.feeling_a,
          need: item.need_a,
          willing: item.willing_a,
          compromise: item.compromise_a,
          accepted: item.accepted_a,
        };
  };

  const renderPerspectiveForm = (resolveId: string) => (
    <View style={styles.formContainer}>
      <View style={styles.formField}>
        <Text style={styles.formLabel}>I feel...</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Express your feelings"
          placeholderTextColor="#666"
          value={feeling}
          onChangeText={setFeeling}
          multiline
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>I need...</Text>
        <TextInput
          style={styles.formInput}
          placeholder="What do you need?"
          placeholderTextColor="#666"
          value={need}
          onChangeText={setNeed}
          multiline
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>I am willing to...</Text>
        <TextInput
          style={styles.formInput}
          placeholder="What are you willing to do?"
          placeholderTextColor="#666"
          value={willing}
          onChangeText={setWilling}
          multiline
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>My proposed compromise...</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Suggest a middle ground"
          placeholderTextColor="#666"
          value={compromise}
          onChangeText={setCompromise}
          multiline
        />
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setActiveResolve(null)}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, (!feeling || !need || !willing || !compromise) && styles.submitBtnDisabled]}
          onPress={() => handleSubmitPerspective(resolveId)}
          disabled={!feeling || !need || !willing || !compromise}
        >
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResolveItem = (item: ResolveItem) => {
    const mine = getMyPerspective(item);
    const theirs = getTheirPerspective(item);
    const bothSubmitted = mine.feeling && theirs.feeling;
    const bothAccepted = mine.accepted && theirs.accepted;

    return (
      <View key={item.id} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.issueText}>{item.issue}</Text>
          <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {activeResolve === item.id ? (
          renderPerspectiveForm(item.id)
        ) : (
          <>
            {/* My Perspective */}
            {mine.feeling ? (
              <View style={styles.perspectiveBox}>
                <Text style={styles.perspectiveLabel}>Your Perspective</Text>
                <Text style={styles.perspectiveText}>
                  <Text style={styles.fieldLabel}>I feel:</Text> {mine.feeling}
                </Text>
                <Text style={styles.perspectiveText}>
                  <Text style={styles.fieldLabel}>I need:</Text> {mine.need}
                </Text>
                <Text style={styles.perspectiveText}>
                  <Text style={styles.fieldLabel}>I'm willing to:</Text> {mine.willing}
                </Text>
                <Text style={styles.perspectiveText}>
                  <Text style={styles.fieldLabel}>Compromise:</Text> {mine.compromise}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addPerspectiveBtn}
                onPress={() => setActiveResolve(item.id)}
              >
                <Text style={styles.addPerspectiveBtnText}>Share Your Perspective</Text>
              </TouchableOpacity>
            )}

            {/* Their Perspective (visible after both submit) */}
            {bothSubmitted && (
              <View style={[styles.perspectiveBox, styles.theirsPerspective]}>
                <Text style={styles.perspectiveLabel}>Their Perspective</Text>
                <Text style={styles.perspectiveText}>
                  <Text style={styles.fieldLabel}>They feel:</Text> {theirs.feeling}
                </Text>
                <Text style={styles.perspectiveText}>
                  <Text style={styles.fieldLabel}>They need:</Text> {theirs.need}
                </Text>
                <Text style={styles.perspectiveText}>
                  <Text style={styles.fieldLabel}>They're willing to:</Text> {theirs.willing}
                </Text>
                <Text style={styles.perspectiveText}>
                  <Text style={styles.fieldLabel}>Their compromise:</Text> {theirs.compromise}
                </Text>
              </View>
            )}

            {/* Accept Compromise Button */}
            {bothSubmitted && !mine.accepted && (
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => onAcceptCompromise(item.id)}
              >
                <Text style={styles.acceptBtnText}>✓ Accept Compromise</Text>
              </TouchableOpacity>
            )}

            {mine.accepted && !theirs.accepted && (
              <Text style={styles.waitingText}>Waiting for their acceptance...</Text>
            )}

            {bothAccepted && (
              <View style={styles.resolvedBox}>
                <Text style={styles.resolvedText}>✓ Resolved</Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕊️ Resolve</Text>
        <Text style={styles.subtitle}>Work through things together</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {items.length === 0 && !showNewIssue && (
          <Text style={styles.emptyText}>No open issues. That's wonderful! 💚</Text>
        )}

        {items.map(renderResolveItem)}

        {showNewIssue && (
          <View style={styles.newIssueCard}>
            <Text style={styles.newIssueLabel}>What needs addressing?</Text>
            <TextInput
              style={styles.newIssueInput}
              placeholder="Describe the issue..."
              placeholderTextColor="#666"
              value={newIssue}
              onChangeText={setNewIssue}
              multiline
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowNewIssue(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, !newIssue.trim() && styles.submitBtnDisabled]}
                onPress={handleCreateIssue}
                disabled={!newIssue.trim()}
              >
                <Text style={styles.submitBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {!showNewIssue && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNewIssue(true)}
        >
          <Text style={styles.addButtonText}>+ Start Resolution</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  itemCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  issueText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  status_open: {
    backgroundColor: '#5a4a27',
  },
  status_in_progress: {
    backgroundColor: '#27475a',
  },
  status_resolved: {
    backgroundColor: '#275a27',
  },
  status_stale: {
    backgroundColor: '#5a2727',
  },
  statusText: {
    color: '#E0E0E0',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  perspectiveBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  theirsPerspective: {
    backgroundColor: '#1a2a1a',
  },
  perspectiveLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  perspectiveText: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 4,
  },
  fieldLabel: {
    color: '#888',
  },
  addPerspectiveBtn: {
    backgroundColor: '#e17055',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addPerspectiveBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  acceptBtn: {
    backgroundColor: '#27a844',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  waitingText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  resolvedBox: {
    backgroundColor: '#1a3a1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  resolvedText: {
    color: '#4ade80',
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    gap: 12,
  },
  formField: {
    gap: 4,
  },
  formLabel: {
    color: '#888',
    fontSize: 14,
  },
  formInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#E0E0E0',
    fontSize: 14,
    minHeight: 50,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#888',
  },
  submitBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e17055',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 16,
  },
  newIssueCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  newIssueLabel: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  newIssueInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#E0E0E0',
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#e17055',
    margin: 16,
    marginBottom: 120,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
