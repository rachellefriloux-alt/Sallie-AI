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

export default function Decider() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([{ name: '', pros: '', cons: '' }]);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');

  const addOption = () => {
    setOptions([...options, { name: '', pros: '', cons: '' }]);
  };

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const analyzeDecision = async () => {
    if (!title || options.every(o => !o.name)) {
      Alert.alert('Missing Info', 'Please add a title and at least one option');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/copymind/decision', {
        title,
        description,
        options: options.filter(o => o.name).map(o => ({
          name: o.name,
          pros: o.pros.split(',').map(p => p.trim()).filter(Boolean),
          cons: o.cons.split(',').map(c => c.trim()).filter(Boolean)
        }))
      });
      
      setAiAnalysis(response.data.ai_recommendation);
      Alert.alert('Analysis Complete', 'Sallie has analyzed your decision');
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze decision');
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
          <Text style={styles.title}>Decider</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subtitle}>Let me help you make this decision</Text>

        <View style={styles.section}>
          <Text style={styles.label}>What are you deciding?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Should I change careers?"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>More details (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any context that might help..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Options</Text>
          {options.map((option, index) => (
            <View key={index} style={styles.optionCard}>
              <Text style={styles.optionNumber}>Option {index + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder="Option name"
                placeholderTextColor="#666"
                value={option.name}
                onChangeText={(value) => updateOption(index, 'name', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Pros (comma separated)"
                placeholderTextColor="#666"
                value={option.pros}
                onChangeText={(value) => updateOption(index, 'pros', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Cons (comma separated)"
                placeholderTextColor="#666"
                value={option.cons}
                onChangeText={(value) => updateOption(index, 'cons', value)}
              />
            </View>
          ))}
          
          <TouchableOpacity style={styles.addButton} onPress={addOption}>
            <Ionicons name="add-circle-outline" size={20} color="#6C63FF" />
            <Text style={styles.addButtonText}>Add Another Option</Text>
          </TouchableOpacity>
        </View>

        {aiAnalysis ? (
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <Ionicons name="sparkles" size={20} color="#6C63FF" />
              <Text style={styles.analysisTitle}>Sallie's Analysis</Text>
            </View>
            <Text style={styles.analysisText}>{aiAnalysis}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
          onPress={analyzeDecision}
          disabled={loading}
        >
          <Text style={styles.analyzeButtonText}>
            {loading ? 'Analyzing...' : 'Get Sallie\'s Analysis'}
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
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  addButtonText: {
    fontSize: 14,
    color: '#6C63FF',
    marginLeft: 8,
  },
  analysisCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
    marginLeft: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
  },
  analyzeButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
