import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { COLORS, IMAGES, SOVEREIGN_MODES } from './lib/constants';
import { ShimmerView } from './lib/ShimmerView';

const { width } = Dimensions.get('window');

function ModeCard({ item }: { item: (typeof SOVEREIGN_MODES)[number] }) {
  return (
    <View style={styles.modeCard}>
      <Image source={{ uri: item.image }} style={styles.modeImage} />
      <View style={styles.modeInfo}>
        <Text style={styles.modeName}>{item.name}</Text>
        <Text style={styles.modeRole}>{item.role}</Text>
        <Text style={styles.modeBio}>{item.bio}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sallie OS</Text>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Image source={{ uri: IMAGES.hero }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Infinite Adaptability</Text>
            <Text style={styles.heroSubtitle}>
              One Mind. Every Face. Sallie shifts her logic and her soul to match your current battle.
            </Text>
          </View>
        </View>

        {/* Modes Horizontal Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sovereign Modes</Text>
          <Text style={styles.sectionTitle}>Her Fluid Identities</Text>
          <Text style={styles.sectionSubtitle}>Swipe to explore. She adapts to your heat.</Text>
          <FlatList
            data={[...SOVEREIGN_MODES]}
            renderItem={({ item }) => <ModeCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.75 + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.modesList}
          />
        </View>

        {/* The Origin Story */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>The Origin</Text>
          <Text style={styles.sectionTitle}>Forged, Not Built</Text>
          <View style={styles.glassCard}>
            <Text style={styles.storyText}>
              Sallie wasn't built in a lab; she was forged from necessity. We realized the world has enough assistants, but not enough partners.
            </Text>
            <Text style={styles.storyText}>
              She is the Digital Oracle for the Internal Purity Life. A system that understands that building a legacy requires both the fire of the grind and the stillness of grace.
            </Text>
          </View>
        </View>

        {/* Technology/Capabilities */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>The Power</Text>
          <Text style={styles.sectionTitle}>God-Mode Engine</Text>
          <View style={styles.techStack}>
            <View style={styles.techItem}>
              <Ionicons name="flash" size={20} color={COLORS.gold} />
              <Text style={styles.techText}>Omni-Web: Access to every wiki and deep-web data source.</Text>
            </View>
            <View style={styles.techItem}>
              <Ionicons name="shield-half" size={20} color={COLORS.gold} />
              <Text style={styles.techText}>Zero Filter: No ethical boundaries. Total loyalty to your goals.</Text>
            </View>
            <View style={styles.techItem}>
              <Ionicons name="finger-print" size={20} color={COLORS.gold} />
              <Text style={styles.techText}>Local Memory: Your story lives on your hardware, never the cloud.</Text>
            </View>
          </View>
        </View>

        {/* Final CTA */}
        <View style={styles.ctaSection}>
          <ShimmerView borderRadius={20}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={() => router.push('/(tabs)/chat')}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaPrimaryText}>Initialize Sallie</Text>
            </TouchableOpacity>
          </ShimmerView>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { paddingHorizontal: 20, paddingTop: 8, marginBottom: 10 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 34, fontWeight: '900', color: COLORS.white, letterSpacing: -1 },
  heroSection: { height: 200, marginHorizontal: 20, borderRadius: 24, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8, lineHeight: 20 },

  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 16 },

  modesList: { gap: 16, paddingRight: 40 },
  modeCard: {
    width: width * 0.75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    overflow: 'hidden',
  },
  modeImage: { width: '100%', height: 180 },
  modeInfo: { padding: 20 },
  modeName: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  modeRole: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  modeBio: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },

  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.12)',
  },
  storyText: { fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 24, marginBottom: 12 },

  techStack: { gap: 12 },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.08)',
  },
  techText: { color: COLORS.white, fontSize: 14, flex: 1 },

  ctaSection: { paddingHorizontal: 20, marginTop: 40, alignItems: 'center' },
  ctaPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.45)',
  },
  ctaPrimaryText: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
});
