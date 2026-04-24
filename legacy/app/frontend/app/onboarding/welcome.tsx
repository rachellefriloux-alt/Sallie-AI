import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.version}>Version 5.4.2 • Production Ready</Text>
          <Text style={styles.title}>Meet Sallie</Text>
          <Text style={styles.subtitle}>Your Complete AI Cognitive Partner</Text>
          <Text style={styles.description}>
            Not just software—a relationship. She learns, grows, remembers, thinks, feels,
            creates, teaches, and truly understands you. 100% local & private.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <FeatureBox icon="cube-outline" label="9" sublabel="Core Systems" />
            <FeatureBox icon="construct-outline" label="50+" sublabel="Tools" />
          </View>
          <View style={styles.featureRow}>
            <FeatureBox icon="shield-checkmark-outline" label="100%" sublabel="Private" />
            <FeatureBox icon="infinite-outline" label="∞" sublabel="Memory" />
          </View>
        </View>

        <View style={styles.capabilities}>
          <Text style={styles.capabilityTitle}>Core Capabilities</Text>
          <CapabilityItem
            icon="brain-outline"
            title="Core Intelligence"
            description="9 core systems working in harmony"
          />
          <CapabilityItem
            icon="heart-outline"
            title="Limbic Engine"
            description="Emotional processing and empathy"
          />
          <CapabilityItem
            icon="eye-outline"
            title="Memory Trinity"
            description="Heritage, Vector, and Working memory"
          />
          <CapabilityItem
            icon="create-outline"
            title="Creative Expression"
            description="Art, music, stories, and code"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/integrations')}
        >
          <Text style={styles.buttonText}>Continue Setup</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureBox({ icon, label, sublabel }: any) {
  return (
    <View style={styles.featureBox}>
      <Ionicons name={icon} size={32} color="#6C63FF" />
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureSublabel}>{sublabel}</Text>
    </View>
  );
}

function CapabilityItem({ icon, title, description }: any) {
  return (
    <View style={styles.capabilityItem}>
      <Ionicons name={icon} size={24} color="#6C63FF" style={styles.capabilityIcon} />
      <View style={styles.capabilityContent}>
        <Text style={styles.capabilityItemTitle}>{title}</Text>
        <Text style={styles.capabilityDescription}>{description}</Text>
      </View>
    </View>
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
    marginBottom: 32,
  },
  version: {
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#999',
    lineHeight: 22,
  },
  features: {
    gap: 12,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  featureLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  featureSublabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  capabilities: {
    marginBottom: 32,
  },
  capabilityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  capabilityIcon: {
    marginRight: 12,
  },
  capabilityContent: {
    flex: 1,
  },
  capabilityItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  capabilityDescription: {
    fontSize: 14,
    color: '#888',
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
