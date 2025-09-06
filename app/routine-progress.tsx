/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Routine Progress Screen - Track and display routine execution progress.
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
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface RoutineStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  inProgress: boolean;
  duration?: number;
}

interface RoutineProgress {
  routineName: string;
  totalSteps: number;
  currentStepIndex: number;
  steps: RoutineStep[];
  isRunning: boolean;
  startTime?: number;
  estimatedCompletion?: number;
}

const RoutineProgressScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const routineName = params.routineName as string || 'Unknown Routine';

  const [progress, setProgress] = useState<RoutineProgress>({
    routineName,
    totalSteps: 4,
    currentStepIndex: 0,
    isRunning: true,
    steps: [
      {
        id: 'init',
        name: 'Initializing Routine',
        description: 'Preparing your personalized experience',
        completed: false,
        inProgress: true
      },
      {
        id: 'context',
        name: 'Gathering Context',
        description: 'Understanding your current emotional state',
        completed: false,
        inProgress: false
      },
      {
        id: 'execution',
        name: 'Executing Routine',
        description: 'Guiding you through each step with care',
        completed: false,
        inProgress: false
      },
      {
        id: 'completion',
        name: 'Completion & Reflection',
        description: 'Celebrating your progress and growth',
        completed: false,
        inProgress: false
      }
    ],
    startTime: Date.now()
  });

  useEffect(() => {
    // Simulate routine progress
    simulateRoutineProgress();
  }, []);

  const simulateRoutineProgress = async () => {
    const steps = [...progress.steps];
    
    for (let i = 0; i < steps.length; i++) {
      // Update current step to in progress
      steps[i].inProgress = true;
      setProgress(prev => ({
        ...prev,
        currentStepIndex: i,
        steps: [...steps]
      }));

      // Provide haptic feedback for step start
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Simulate step duration (2-4 seconds per step)
      const stepDuration = 2000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, stepDuration));

      // Mark step as completed
      steps[i].completed = true;
      steps[i].inProgress = false;
      setProgress(prev => ({
        ...prev,
        steps: [...steps]
      }));

      // Provide haptic feedback for step completion
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // Mark routine as complete
    setProgress(prev => ({
      ...prev,
      isRunning: false,
      currentStepIndex: steps.length
    }));

    // Show completion feedback
    setTimeout(() => {
      Alert.alert(
        'Routine Complete! 🎉',
        'You\'ve successfully completed your routine. Keep growing, love.',
        [
          {
            text: 'Continue',
            onPress: () => router.back()
          }
        ]
      );
    }, 1000);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Routine?',
      'Are you sure you want to stop this routine? Your progress won\'t be saved.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Stop Routine',
          style: 'destructive',
          onPress: () => {
            setProgress(prev => ({ ...prev, isRunning: false }));
            router.back();
          }
        }
      ]
    );
  };

  const getProgressPercentage = () => {
    const completedSteps = progress.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / progress.totalSteps) * 100);
  };

  const getTimeElapsed = () => {
    if (!progress.startTime) return '0s';
    const elapsed = Math.floor((Date.now() - progress.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>{progress.routineName}</Text>
        <Text style={styles.headerSubtitle}>
          {progress.isRunning ? 'In Progress' : 'Completed'} • {getTimeElapsed()}
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{getProgressPercentage()}%</Text>
        </View>
      </LinearGradient>

      {/* Steps List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Routine Steps</Text>
        
        {progress.steps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={[
                styles.stepIndicator,
                step.completed && styles.stepIndicatorCompleted,
                step.inProgress && styles.stepIndicatorInProgress
              ]}>
                {step.completed ? (
                  <Text style={styles.stepIndicatorText}>✓</Text>
                ) : step.inProgress ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.stepIndicatorText}>{index + 1}</Text>
                )}
              </View>
              
              <View style={styles.stepInfo}>
                <Text style={[
                  styles.stepName,
                  step.completed && styles.stepNameCompleted,
                  step.inProgress && styles.stepNameInProgress
                ]}>
                  {step.name}
                </Text>
                <Text style={[
                  styles.stepDescription,
                  step.completed && styles.stepDescriptionCompleted
                ]}>
                  {step.description}
                </Text>
              </View>
            </View>
            
            {step.inProgress && (
              <View style={styles.stepProgress}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.stepProgressText}>Processing...</Text>
              </View>
            )}
          </View>
        ))}

        {/* Completion Message */}
        {!progress.isRunning && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionTitle}>🎉 Well Done!</Text>
            <Text style={styles.completionMessage}>
              You've completed your routine with intention and care. 
              Remember, growth happens one step at a time, love.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {progress.isRunning ? (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel Routine</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    minWidth: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepIndicatorInProgress: {
    backgroundColor: '#667eea',
  },
  stepIndicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepNameCompleted: {
    color: '#4CAF50',
  },
  stepNameInProgress: {
    color: '#667eea',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepDescriptionCompleted: {
    color: '#4CAF50',
  },
  stepProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  stepProgressText: {
    fontSize: 14,
    color: '#667eea',
    fontStyle: 'italic',
  },
  completionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  completionMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  doneButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default RoutineProgressScreen;