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
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';

interface Integration {
  type: string;
  name: string;
  icon: string;
  description: string;
  fields: { key: string; label: string; secure?: boolean; placeholder?: string }[];
}

const INTEGRATIONS: Integration[] = [
  {
    type: 'llm',
    name: 'AI Model (Optional)',
    icon: 'flash-outline',
    description: 'Add your own API key or use Emergent LLM',
    fields: [
      { key: 'provider', label: 'Provider', placeholder: 'openai, gemini, or anthropic' },
      { key: 'api_key', label: 'API Key', secure: true, placeholder: 'sk-...' },
    ],
  },
  {
    type: 'email',
    name: 'Email',
    icon: 'mail-outline',
    description: 'Connect your email for communication features',
    fields: [
      { key: 'email', label: 'Email Address', placeholder: 'your@email.com' },
      { key: 'password', label: 'App Password', secure: true, placeholder: 'Gmail app password' },
      { key: 'smtp_server', label: 'SMTP Server', placeholder: 'smtp.gmail.com' },
      { key: 'smtp_port', label: 'SMTP Port', placeholder: '587' },
    ],
  },
  {
    type: 'calendar',
    name: 'Calendar',
    icon: 'calendar-outline',
    description: 'Sync your calendar for scheduling',
    fields: [
      { key: 'provider', label: 'Provider', placeholder: 'google, outlook' },
      { key: 'api_key', label: 'API Key', secure: true },
    ],
  },
  {
    type: 'social',
    name: 'Social Media',
    icon: 'share-social-outline',
    description: 'Connect social platforms',
    fields: [
      { key: 'platform', label: 'Platform', placeholder: 'twitter, facebook, etc.' },
      { key: 'api_key', label: 'API Key/Token', secure: true },
    ],
  },
  {
    type: 'smart_home',
    name: 'Smart Home',
    icon: 'home-outline',
    description: 'Control your smart devices',
    fields: [
      { key: 'provider', label: 'Provider', placeholder: 'google, alexa, homekit' },
      { key: 'token', label: 'Access Token', secure: true },
    ],
  },
  {
    type: 'cloud_storage',
    name: 'Cloud Storage',
    icon: 'cloud-outline',
    description: 'Access your files',
    fields: [
      { key: 'provider', label: 'Provider', placeholder: 'google_drive, dropbox' },
      { key: 'token', label: 'Access Token', secure: true },
    ],
  },
];

export default function Integrations() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const toggleIntegration = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const updateField = (integrationType: string, key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [integrationType]: {
        ...prev[integrationType],
        [key]: value,
      },
    }));
  };

  const saveIntegration = async (integration: Integration) => {
    const data = formData[integration.type];
    if (!data || Object.keys(data).length === 0) {
      Alert.alert('Info', 'No data to save');
      return;
    }

    try {
      await api.post('/integrations', {
        integration_type: integration.type,
        credentials: data,
      });
      Alert.alert('Success', `${integration.name} integration saved`);
      setExpandedIndex(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save integration');
    }
  };

  const skipIntegrations = () => {
    router.push('/onboarding/convergence');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Connect Your Accounts</Text>
          <Text style={styles.subtitle}>
            Connect your services to unlock Sallie's full potential. You can skip and add these
            later in settings.
          </Text>
        </View>

        {INTEGRATIONS.map((integration, index) => (
          <View key={integration.type} style={styles.integrationCard}>
            <TouchableOpacity
              style={styles.integrationHeader}
              onPress={() => toggleIntegration(index)}
            >
              <View style={styles.integrationInfo}>
                <Ionicons name={integration.icon as any} size={24} color="#6C63FF" />
                <View style={styles.integrationText}>
                  <Text style={styles.integrationName}>{integration.name}</Text>
                  <Text style={styles.integrationDescription}>{integration.description}</Text>
                </View>
              </View>
              <Ionicons
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>

            {expandedIndex === index && (
              <View style={styles.integrationForm}>
                {integration.fields.map((field) => (
                  <View key={field.key} style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder={field.placeholder}
                      placeholderTextColor="#666"
                      value={formData[integration.type]?.[field.key] || ''}
                      onChangeText={(value) => updateField(integration.type, field.key, value)}
                      secureTextEntry={field.secure}
                    />
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => saveIntegration(integration)}
                >
                  <Text style={styles.saveButtonText}>Save Integration</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={skipIntegrations}>
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/onboarding/convergence')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
    padding: 24,
  },
  header: {
    marginBottom: 24,
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
    lineHeight: 20,
  },
  integrationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  integrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  integrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  integrationText: {
    marginLeft: 12,
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 12,
    color: '#888',
  },
  integrationForm: {
    padding: 16,
    paddingTop: 0,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: '#0c0c0c',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  skipButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
