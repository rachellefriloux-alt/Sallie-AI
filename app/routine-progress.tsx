/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Routine progress screen for tracking and controlling routine execution.
 * Got it, love.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RoutineSequencerModule, routineManager } from '@/ui/RoutineSequencerModule';

export default function RoutineProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  
  // Get routineName from params or use default
  const routineName = Array.isArray(params.routineName) ? params.routineName[0] : params.routineName || 'morning_routine';
  const userId = 'default_user'; // TODO: Get from user context/store

  const [isRoutineActive, setIsRoutineActive] = useState(false);

  useEffect(() => {
    // Start the routine when the screen loads
    const startRoutine = async () => {
      try {
        // Map routine names to actual IDs
        const routineMap: { [key: string]: string } = {
          'morning': 'morning_routine',
          'evening': 'evening_routine',
          'unknown': 'morning_routine' // fallback
        };

        const routineId = routineMap[routineName] || routineName;
        
        // Check if routine is already running
        const execution = routineManager.getExecutionStatus(userId, routineId);
        if (!execution || execution.status === 'completed' || execution.status === 'cancelled') {
          // Start the routine
          const success = await routineManager.executeRoutine(userId, routineId);
          setIsRoutineActive(success);
        } else {
          setIsRoutineActive(true);
        }
      } catch (error) {
        console.error('Error starting routine:', error);
      }
    };

    startRoutine();
  }, [routineName, userId]);

  const handleRoutineComplete = (routineId: string) => {
    console.log(`Routine ${routineId} completed`);
    setIsRoutineActive(false);
    // Navigate back after a short delay
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const handleStepComplete = (stepId: string) => {
    console.log(`Step ${stepId} completed`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Routine Progress',
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <RoutineSequencerModule
          userId={userId}
          onRoutineComplete={handleRoutineComplete}
          onStepComplete={handleStepComplete}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});