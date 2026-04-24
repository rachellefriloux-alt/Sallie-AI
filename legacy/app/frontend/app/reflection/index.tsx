import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../utils/api';

const MOODS = [
  { id: 'happy', label: 'Happy', icon: 'happy', color: '#FFD700' },
  { id: 'calm', label: 'Calm', icon: 'leaf', color: '#4CAF50' },
  { id: 'stressed', label: 'Stressed', icon: 'thunderstorm', color: '#FF9800' },
  { id: 'anxious', label: 'Anxious', icon: 'alert-circle', color: '#FF5252' },
  { id: 'tired', label: 'Tired', icon: 'moon', color: '#9C27B0' },
  { id: 'energized', label: 'Energized', icon: 'flash', color: '#00BCD4' },
];

export default function Reflection() {
  const router = useRouter();
  const [mood, setMood] = useState('');
  const [achievements, setAchievements] = useState('');
  const [challenges, setChallenges] = useState('');
  const [learnings, setLearnings] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReflection = async () => {
    if (!mood) {
      Alert.alert('Select Mood', 'Please select how you\'re feeling');
      return;
    }

    setLoading(true);
    try {
      await api.post('/copymind/reflection', {
        mood,
        achievements: achievements.split('\n').filter(Boolean),
        challenges: challenges.split('\n').filter(Boolean),
        learnings,
        gratitude: gratitude.split('\n').filter(Boolean),
      });
      
      Alert.alert(
        'Reflection Saved',
        'Your reflection has been recorded. Sallie is learning from your patterns.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save reflection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Daily Reflection</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subtitle}>Take a moment to reflect on your day</Text>

        {/* Mood Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>How are you feeling?</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((moodOption) => (
              <TouchableOpacity
                key={moodOption.id}
                style={[
                  styles.moodButton,
                  mood === moodOption.id && styles.moodButtonActive,
                ]}
                onPress={() => setMood(moodOption.id)}
              >
                <Ionicons
                  name={moodOption.icon as any}
                  size={28}
                  color={mood === moodOption.id ? moodOption.color : '#666'}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    mood === moodOption.id && { color: moodOption.color },
                  ]}
                >
                  {moodOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.label}>What did you accomplish today?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="One thing per line...\ne.g., Finished project presentation\nExercised for 30 minutes"
            placeholderTextColor="#666"
            value={achievements}
            onChangeText={setAchievements}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Challenges */}
        <View style={styles.section}>
          <Text style={styles.label}>What challenged you?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What was difficult today?"
            placeholderTextColor="#666"
            value={challenges}
            onChangeText={setChallenges}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Learnings */}
        <View style={styles.section}>
          <Text style={styles.label}>What did you learn?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Insights, realizations, or lessons..."
            placeholderTextColor="#666"
            value={learnings}
            onChangeText={setLearnings}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Gratitude */}
        <View style={styles.section}>
          <Text style={styles.label}>What are you grateful for?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Three things you're thankful for..."
            placeholderTextColor="#666"
            value={gratitude}
            onChangeText={setGratitude}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={submitReflection}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Reflection'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  moodButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#2a2a2a',
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
