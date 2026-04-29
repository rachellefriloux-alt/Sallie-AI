import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../utils/api';

const QUESTIONS = [
  "What's your biggest goal right now?",
  "What challenges are you facing?",
  "How do you learn best?",
  "What makes you feel most alive?",
  "What's your greatest fear?",
  "Describe your ideal day",
  "What's your definition of success?",
  "Who inspires you and why?",
  "What values guide your decisions?",
  "What legacy do you want to leave?",
];

export default function Convergence() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (!answers[currentIndex]?.trim()) {
      Alert.alert('Please answer', 'Your response helps Sallie understand you better');
      return;
    }

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitAnswers();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const submitAnswers = async () => {
    setLoading(true);
    try {
      const formattedAnswers = QUESTIONS.map((question, index) => ({
        question,
        answer: answers[index] || '',
      }));

      await api.post('/convergence', { answers: formattedAnswers });
      Alert.alert(
        'Convergence Complete',
        'Sallie is ready to begin your journey together!',
        [
          {
            text: 'Begin',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save convergence data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>The Convergence</Text>
          <Text style={styles.subtitle}>
            Help Sallie understand you. Your answers shape her understanding.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {QUESTIONS.length}
          </Text>
        </View>

        <ScrollView style={styles.questionContainer}>
          <Text style={styles.question}>{currentQuestion}</Text>
          <TextInput
            style={styles.answerInput}
            placeholder="Share your thoughts..."
            placeholderTextColor="#666"
            value={answers[currentIndex] || ''}
            onChangeText={(text) => setAnswers({ ...answers, [currentIndex]: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.footer}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextButton, currentIndex === 0 && styles.nextButtonFull]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {loading
                ? 'Completing...'
                : currentIndex === QUESTIONS.length - 1
                ? 'Complete'
                : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  questionContainer: {
    flex: 1,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  answerInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 150,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
