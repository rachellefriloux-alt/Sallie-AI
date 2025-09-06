/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Routine progress tracking and management screen.
 * Got it, love.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface RoutineStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  duration?: number;
  startTime?: number;
  endTime?: number;
}

interface RoutineProgress {
  id: string;
  name: string;
  steps: RoutineStep[];
  currentStepIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number;
  totalDuration?: number;
}

export default function RoutineProgressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get routine name from navigation params
  const routineName = (route.params as any)?.routineName || 'Unknown Routine';
  
  const [routineProgress, setRoutineProgress] = useState<RoutineProgress>({
    id: `routine_${Date.now()}`,
    name: routineName,
    currentStepIndex: 0,
    isRunning: true,
    isPaused: false,
    startTime: Date.now(),
    steps: [
      {
        id: 'step_1',
        name: 'Preparation',
        description: 'Getting ready to start your routine',
        completed: true,
        startTime: Date.now() - 30000,
        endTime: Date.now() - 20000,
      },
      {
        id: 'step_2',
        name: 'Active Phase',
        description: 'Main routine activities in progress',
        completed: false,
        startTime: Date.now() - 20000,
      },
      {
        id: 'step_3',
        name: 'Completion',
        description: 'Wrapping up and reflection',
        completed: false,
      },
    ],
  });

  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (routineProgress.isRunning && !routineProgress.isPaused) {
        setTimeElapsed(Date.now() - routineProgress.startTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [routineProgress.isRunning, routineProgress.isPaused, routineProgress.startTime]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    const completedSteps = routineProgress.steps.filter(step => step.completed).length;
    return (completedSteps / routineProgress.steps.length) * 100;
  };

  const handlePauseResume = () => {
    setRoutineProgress(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleStop = () => {
    Alert.alert(
      'Stop Routine',
      'Are you sure you want to stop this routine? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            setRoutineProgress(prev => ({ ...prev, isRunning: false }));
            Alert.alert('Routine Stopped', 'Good effort! Remember, progress is progress, love.', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          },
        },
      ]
    );
  };

  const handleCompleteStep = () => {
    const currentStep = routineProgress.steps[routineProgress.currentStepIndex];
    if (!currentStep || currentStep.completed) return;

    setRoutineProgress(prev => {
      const updatedSteps = [...prev.steps];
      updatedSteps[prev.currentStepIndex] = {
        ...currentStep,
        completed: true,
        endTime: Date.now(),
      };

      const nextStepIndex = prev.currentStepIndex + 1;
      const isComplete = nextStepIndex >= updatedSteps.length;

      if (isComplete) {
        Alert.alert(
          'Routine Complete! 🎉',
          'Amazing work! You stuck with it and finished strong. That\'s the Sallie spirit!',
          [{ text: 'Celebrate', onPress: () => navigation.goBack() }]
        );
      }

      return {
        ...prev,
        steps: updatedSteps,
        currentStepIndex: isComplete ? prev.currentStepIndex : nextStepIndex,
        isRunning: !isComplete,
      };
    });
  };

  const getCurrentStep = () => {
    return routineProgress.steps[routineProgress.currentStepIndex];
  };

  const currentStep = getCurrentStep();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.routineTitle}>{routineProgress.name}</Text>
          <Text style={styles.timeElapsed}>{formatTime(timeElapsed)}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgressPercentage()}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(getProgressPercentage())}% Complete
          </Text>
        </View>

        {/* Current Step */}
        {currentStep && routineProgress.isRunning && (
          <View style={styles.currentStepContainer}>
            <Text style={styles.currentStepTitle}>Current Step</Text>
            <View style={styles.stepCard}>
              <Text style={styles.stepName}>{currentStep.name}</Text>
              <Text style={styles.stepDescription}>{currentStep.description}</Text>
              {!currentStep.completed && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleCompleteStep}
                >
                  <Text style={styles.completeButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Steps List */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>All Steps</Text>
          {routineProgress.steps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.stepItem,
                step.completed && styles.stepCompleted,
                index === routineProgress.currentStepIndex && styles.stepCurrent,
              ]}
            >
              <View style={styles.stepIndicator}>
                <Text
                  style={[
                    styles.stepNumber,
                    step.completed && styles.stepNumberCompleted,
                    index === routineProgress.currentStepIndex && styles.stepNumberCurrent,
                  ]}
                >
                  {step.completed ? '✓' : index + 1}
                </Text>
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepItemName,
                    step.completed && styles.stepItemNameCompleted,
                  ]}
                >
                  {step.name}
                </Text>
                <Text style={styles.stepItemDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Motivation Message */}
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            {routineProgress.isRunning
              ? "You're doing great! Keep that momentum going, love. Every step matters."
              : "Routine completed! You showed up and did the work. That's what counts."}
          </Text>
        </View>
      </ScrollView>

      {/* Control Buttons */}
      {routineProgress.isRunning && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePauseResume}
          >
            <Text style={styles.controlButtonText}>
              {routineProgress.isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStop}
          >
            <Text style={styles.controlButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  routineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timeElapsed: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentStepContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  currentStepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  stepCard: {
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  stepName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stepsContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepCompleted: {
    opacity: 0.7,
  },
  stepCurrent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  stepIndicator: {
    marginRight: 15,
    marginTop: 2,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepNumberCompleted: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  stepNumberCurrent: {
    backgroundColor: '#007AFF',
    color: 'white',
  },
  stepContent: {
    flex: 1,
  },
  stepItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepItemNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  stepItemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  motivationContainer: {
    padding: 20,
    backgroundColor: '#fff8e1',
    margin: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  motivationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 15,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});