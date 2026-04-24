import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { COLORS, FEATURES, CORE_SYSTEMS, CAPABILITIES } from '../lib/constants';
import { ShimmerView } from '../lib/ShimmerView';

export default function FeaturesScreen() {
  const router = useRouter();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);

  const detail = selectedFeature ? FEATURES.find(f => f.id === selectedFeature) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Features</Text>
          <Text style={styles.headerSubtitle}>
            Discover Sallie's cognitive systems and powerful capabilities
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => setSelectedFeature(feature.id)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: feature.image }} style={styles.featureCardImage} />
              <View style={styles.featureCardOverlay}>
                <View style={styles.featureCardTop}>
                  <View style={[styles.featureCardIcon, { backgroundColor: feature.color + '30' }]}>
                    <Ionicons name={feature.icon as any} size={22} color={feature.color} />
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{(feature as any).status || '100%'}</Text>
                  </View>
                </View>
                <Text style={styles.featureCardTitle}>{feature.title}</Text>
                <Text style={styles.featureCardDesc} numberOfLines={2}>{feature.description}</Text>
                <View style={styles.featureCardAction}>
                  <Text style={[styles.featureCardActionText, { color: feature.color }]}>Learn More</Text>
                  <Ionicons name="arrow-forward" size={14} color={feature.color} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Core Systems */}
        <View style={styles.coreSection}>
          <Text style={styles.coreSectionLabel}>Architecture</Text>
          <Text style={styles.coreSectionTitle}>9 Core Systems</Text>
          <View style={styles.coreGrid}>
            {CORE_SYSTEMS.map((system, i) => (
              <View key={i} style={styles.coreCard}>
                <View style={[styles.coreIcon, { backgroundColor: system.color + '20' }]}>
                  <Ionicons name={system.icon as any} size={20} color={system.color} />
                </View>
                <Text style={styles.coreName}>{system.name}</Text>
                <Text style={styles.coreDesc}>{system.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Capabilities */}
        <View style={styles.capSection}>
          <Text style={styles.capTitle}>Core Capabilities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.capTabs}>
            {CAPABILITIES.map((cap, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.capTab, activeCategory === index && styles.capTabActive]}
                onPress={() => setActiveCategory(index)}
                activeOpacity={0.7}
              >
                <Text style={[styles.capTabText, activeCategory === index && styles.capTabTextActive]}>
                  {cap.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.capItems}>
            {CAPABILITIES[activeCategory].items.map((item, index) => (
              <View key={index} style={styles.capItem}>
                <View style={styles.capItemIcon}>
                  <Ionicons name={item.icon as any} size={22} color={COLORS.purpleLight} />
                </View>
                <View style={styles.capItemContent}>
                  <Text style={styles.capItemLabel}>{item.label}</Text>
                  <Text style={styles.capItemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Start */}
        <View style={styles.quickStart}>
          <Text style={styles.quickStartTitle}>Ready to Experience It?</Text>
          <ShimmerView borderRadius={14}>
            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() => router.push('/(tabs)/chat')}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
              <Text style={styles.quickStartButtonText}>Try Sallie Now</Text>
            </TouchableOpacity>
          </ShimmerView>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Feature Detail Modal */}
      <Modal visible={!!selectedFeature} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {detail && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: detail.image }} style={styles.modalImage} />
                <View style={styles.modalImageOverlay}>
                  <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedFeature(null)}>
                    <Ionicons name="close" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <View style={[styles.modalIcon, { backgroundColor: detail.color + '20' }]}>
                    <Ionicons name={detail.icon as any} size={28} color={detail.color} />
                  </View>
                  <Text style={styles.modalTitle}>{detail.title}</Text>
                  <Text style={styles.modalDesc}>{detail.description}</Text>
                  <TouchableOpacity
                    style={[styles.modalCTA, { backgroundColor: detail.color }]}
                    onPress={() => { setSelectedFeature(null); router.push('/(tabs)/chat'); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
                    <Text style={styles.modalCTAText}>Try {detail.title}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 15, color: COLORS.textLight, marginTop: 8, lineHeight: 22 },
  featureGrid: { paddingHorizontal: 20, gap: 16 },
  featureCard: { borderRadius: 20, overflow: 'hidden', height: 200 },
  featureCardImage: { width: '100%', height: '100%', position: 'absolute' },
  featureCardOverlay: { flex: 1, backgroundColor: 'rgba(15,10,26,0.82)', padding: 20, justifyContent: 'flex-end' },
  featureCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  featureCardIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700', color: COLORS.success },
  featureCardTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  featureCardDesc: { fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 18, marginBottom: 10 },
  featureCardAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureCardActionText: { fontSize: 13, fontWeight: '600' },
  // Core Systems
  coreSection: { paddingTop: 48, paddingBottom: 20 },
  coreSectionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.gold, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginBottom: 8 },
  coreSectionTitle: { fontSize: 26, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: 20 },
  coreGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, justifyContent: 'center' },
  coreCard: { width: '47%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  coreIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  coreName: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginBottom: 3 },
  coreDesc: { fontSize: 11, color: COLORS.textLight, lineHeight: 15 },
  // Capabilities
  capSection: { paddingTop: 48, paddingBottom: 20 },
  capTitle: { fontSize: 26, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: 20 },
  capTabs: { paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  capTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  capTabActive: { backgroundColor: 'rgba(255,215,0,0.12)', borderColor: COLORS.gold },
  capTabText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  capTabTextActive: { color: COLORS.gold },
  capItems: { paddingHorizontal: 20, gap: 12 },
  capItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  capItemIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(139,92,246,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  capItemContent: { flex: 1 },
  capItemLabel: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 3 },
  capItemDesc: { fontSize: 13, color: COLORS.textLight, lineHeight: 18 },
  quickStart: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  quickStartTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 16 },
  quickStartButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,215,0,0.45)' },
  quickStartButtonText: { fontSize: 17, fontWeight: '700', color: COLORS.white },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.bgDark, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', overflow: 'hidden' },
  modalImage: { width: '100%', height: 200 },
  modalImageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 16 },
  modalClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: 24 },
  modalIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  modalDesc: { fontSize: 15, color: COLORS.textLight, lineHeight: 24, marginBottom: 24 },
  modalCTA: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 8, marginBottom: 20 },
  modalCTAText: { fontSize: 17, fontWeight: '700', color: COLORS.white },
});
