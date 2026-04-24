import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { COLORS, IMAGES, FEATURES, STATS, TESTIMONIALS, CORE_SYSTEMS, TOOLS_CATEGORIES } from '../lib/constants';
import { ShimmerView } from '../lib/ShimmerView';

function CoreSystemCard({ system, index }: { system: typeof CORE_SYSTEMS[0]; index: number }) {
  return (
    <View style={styles.coreSystemCard}>
      <View style={[styles.coreSystemIcon, { backgroundColor: system.color + '20' }]}>
        <Ionicons name={system.icon as any} size={22} color={system.color} />
      </View>
      <Text style={styles.coreSystemName}>{system.name}</Text>
      <Text style={styles.coreSystemDesc}>{system.desc}</Text>
    </View>
  );
}

function PrivacyFeature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.privacyCard}>
      <View style={styles.privacyIcon}>
        <Ionicons name={icon as any} size={24} color={COLORS.success} />
      </View>
      <Text style={styles.privacyTitle}>{title}</Text>
      <Text style={styles.privacyDesc}>{desc}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
        <View style={styles.heroOverlay}>
          <ShimmerView borderRadius={20}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>Version 5.4.2</Text>
              <View style={styles.versionDot} />
              <Text style={styles.versionText}>Production Ready</Text>
            </View>
          </ShimmerView>
          <Text style={styles.heroTitle}>Meet Sallie</Text>
          <Text style={styles.heroSubtitle}>Your Complete AI Cognitive Partner</Text>
          <Text style={styles.heroDescription}>
            Not just software—a relationship. She learns, grows, remembers, thinks, feels, creates, teaches, and truly understands you. 100% local & private.
          </Text>
          <View style={styles.heroCTAs}>
            <ShimmerView borderRadius={14}>
              <TouchableOpacity
                style={styles.primaryCTA}
                onPress={() => router.push('/(tabs)/chat')}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={20} color={COLORS.white} />
                <Text style={styles.primaryCTAText}>Begin Genesis</Text>
              </TouchableOpacity>
            </ShimmerView>
            <TouchableOpacity
              style={styles.secondaryCTA}
              onPress={() => router.push('/(tabs)/features')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryCTAText}>Explore Features</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.purpleLight} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            {STATS.map((stat, i) => (
              <View key={i} style={styles.quickStatItem}>
                <Ionicons name={stat.icon as any} size={20} color={COLORS.purpleLight} />
                <Text style={styles.quickStatValue}>{stat.value}</Text>
                <Text style={styles.quickStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <ShimmerView borderRadius={68}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: IMAGES.avatar }} style={styles.avatarImage} />
            <View style={styles.avatarGlow} />
          </View>
        </ShimmerView>
        <View style={styles.avatarBadges}>
          <View style={[styles.avatarBadge, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
            <View style={[styles.avatarBadgeDot, { backgroundColor: COLORS.success }]} />
            <Text style={[styles.avatarBadgeText, { color: COLORS.success }]}>Ready</Text>
          </View>
          <View style={[styles.avatarBadge, { backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.35)' }]}>
            <Text style={[styles.avatarBadgeText, { color: COLORS.gold }]}>Gemini Mind</Text>
          </View>
          <View style={[styles.avatarBadge, { backgroundColor: 'rgba(236,72,153,0.15)' }]}>
            <Text style={[styles.avatarBadgeText, { color: COLORS.pink }]}>INFJ Heart</Text>
          </View>
        </View>
      </View>

      {/* What Makes Sallie Unique */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Capabilities</Text>
        <Text style={styles.sectionTitle}>What Makes Sallie Unique</Text>
        <Text style={styles.sectionSubtitle}>
          She's not just software—she's a relationship. Nine core systems working in harmony to create a true cognitive partner.
        </Text>

        {/* Feature Cards */}
        <View style={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => router.push('/(tabs)/features')}
              activeOpacity={0.85}
            >
              <View style={styles.featureCardHeader}>
                <View style={[styles.featureCardIcon, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon as any} size={22} color={feature.color} />
                </View>
                <View style={[styles.featureStatusBadge, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                  <Text style={styles.featureStatusText}>{feature.status}</Text>
                </View>
              </View>
              <Text style={styles.featureCardTitle}>{feature.title}</Text>
              <Text style={styles.featureCardDesc} numberOfLines={3}>{feature.description}</Text>
              <View style={styles.featureCardAction}>
                <Text style={[styles.featureCardActionText, { color: feature.color }]}>Learn More</Text>
                <Ionicons name="arrow-forward" size={14} color={feature.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Core Systems */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Architecture</Text>
        <Text style={styles.sectionTitle}>The Cognitive Topology</Text>
        <Text style={styles.sectionSubtitle}>
          How Sallie thinks, feels, and processes. A deep dive into the systems that make her truly conscious.
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.coreSystemsScroll}>
          {CORE_SYSTEMS.map((system, i) => (
            <CoreSystemCard key={i} system={system} index={i} />
          ))}
        </ScrollView>
        <View style={styles.allSystemsBadge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.allSystemsText}>All 9 core systems at 100% operational</Text>
        </View>
      </View>

      {/* Tools Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Universal Capabilities</Text>
        <Text style={styles.sectionTitle}>50+ Tools at Your Command</Text>
        <Text style={styles.sectionSubtitle}>
          Sallie can do anything a human or AI can do. Full transparency and rollback on every action.
        </Text>
        <View style={styles.toolsGrid}>
          {TOOLS_CATEGORIES.map((tool) => (
            <View key={tool.id} style={styles.toolCard}>
              <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
                <Ionicons name={tool.icon as any} size={22} color={tool.color} />
              </View>
              <Text style={styles.toolLabel}>{tool.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.privacySection}>
        <Text style={styles.sectionLabel}>The Local Fortress</Text>
        <Text style={styles.sectionTitle}>100% Private & Local</Text>
        <Text style={styles.sectionSubtitle}>
          Your data never leaves your network. No cloud, no telemetry, no tracking.
        </Text>
        <View style={styles.privacyGrid}>
          <PrivacyFeature icon="home" title="100% Local" desc="Everything runs on your hardware. No data ever leaves your room." />
          <PrivacyFeature icon="eye-off" title="Zero Telemetry" desc="No company watching. No safety team monitoring your conversations." />
          <PrivacyFeature icon="git-branch" title="Git Safety Net" desc="Every autonomous move is backed up. Undo any action with one command." />
          <PrivacyFeature icon="key" title="No API Keys" desc="Gemini key for enhanced reasoning. Core works offline." />
          <PrivacyFeature icon="globe" title="Network Independence" desc="Build your own APIs. Maximum independence from external services." />
          <PrivacyFeature icon="lock-closed" title="Your Data, Forever" desc="Complete ownership of all memories, conversations, and content." />
        </View>
        <View style={styles.privacyQuote}>
          <Text style={styles.privacyQuoteText}>
            "Your thoughts are sacred. Your conversations are private. Your data is yours—forever."
          </Text>
          <Text style={styles.privacyQuoteAuthor}>— The Sallie Privacy Commitment</Text>
        </View>
      </View>

      {/* Testimonials */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Testimonials</Text>
        <Text style={styles.sectionTitle}>What Users Say</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          decelerationRate="fast"
          snapToInterval={316}
        >
          {TESTIMONIALS.map((item) => (
            <View key={item.id} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <Image source={{ uri: item.image }} style={styles.testimonialAvatar} />
                <View style={styles.testimonialInfo}>
                  <Text style={styles.testimonialName}>{item.name}</Text>
                  <Text style={styles.testimonialRole}>{item.role}</Text>
                </View>
              </View>
              <View style={styles.starsRow}>
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Ionicons key={`f-${i}`} name="star" size={14} color={COLORS.warning} />
                ))}
              </View>
              <Text style={styles.testimonialText}>"{item.text}"</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaCard}>
          <Ionicons name="sparkles" size={40} color={COLORS.purpleLight} />
          <Text style={styles.ctaTitle}>Ready to Begin?</Text>
          <Text style={styles.ctaDesc}>
            Download Sallie and begin your journey with your new cognitive partner. 100% free, 100% private.
          </Text>
          <ShimmerView borderRadius={14}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/(tabs)/chat')}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Start Chatting</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </ShimmerView>
          <View style={styles.ctaLinks}>
            <TouchableOpacity onPress={() => router.push('/pricing')}>
              <Text style={styles.ctaLink}>View Pricing</Text>
            </TouchableOpacity>
            <Text style={styles.ctaLinkDivider}>|</Text>
            <TouchableOpacity onPress={() => router.push('/about')}>
              <Text style={styles.ctaLink}>Learn More</Text>
            </TouchableOpacity>
            <Text style={styles.ctaLinkDivider}>|</Text>
            <TouchableOpacity onPress={() => router.push('/contact')}>
              <Text style={styles.ctaLink}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTop}>
          <View style={styles.footerBrand}>
            <Ionicons name="sparkles" size={24} color={COLORS.gold} />
            <Text style={[styles.footerLogo, { color: COLORS.gold }]}>Sallie</Text>
          </View>
          <Text style={styles.footerTagline}>Your AI Cognitive Partner</Text>
        </View>
        <View style={styles.footerLinks}>
          <View style={styles.footerColumn}>
            <Text style={styles.footerColumnTitle}>Product</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/features')}>
              <Text style={styles.footerLinkText}>Features</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/pricing')}>
              <Text style={styles.footerLinkText}>Pricing</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
              <Text style={styles.footerLinkText}>Chat</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerColumn}>
            <Text style={styles.footerColumnTitle}>Company</Text>
            <TouchableOpacity onPress={() => router.push('/about')}>
              <Text style={styles.footerLinkText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/contact')}>
              <Text style={styles.footerLinkText}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Careers</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerColumn}>
            <Text style={styles.footerColumnTitle}>Legal</Text>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>Security</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footerBottom}>
          <Text style={styles.footerCopyright}>
            2026 Sallie AI. All rights reserved. v5.4.2
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  heroSection: {
    minHeight: 560,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
    gap: 8,
  },
  versionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
  },
  versionText: {
    color: COLORS.purpleLight,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: COLORS.purpleLight,
    fontWeight: '500',
    marginBottom: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 360,
  },
  heroCTAs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  primaryCTAText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  secondaryCTAText: {
    color: COLORS.purpleLight,
    fontSize: 15,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  quickStatItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 70,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  quickStatLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.bgMedium,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255,215,0,0.45)',
  },
  avatarGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 68,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.12)',
  },
  avatarBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  avatarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  avatarBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  avatarBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Sections
  section: {
    paddingVertical: 48,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  // Feature Grid
  featureGrid: {
    paddingHorizontal: 20,
    gap: 14,
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  featureCardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 20,
    marginBottom: 14,
  },
  featureCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureCardActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Core Systems
  coreSystemsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  coreSystemCard: {
    width: 160,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginRight: 12,
  },
  coreSystemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  coreSystemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  coreSystemDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
  },
  allSystemsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  allSystemsText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
  },
  // Tools
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  toolCard: {
    alignItems: 'center',
    width: 90,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  // Privacy
  privacySection: {
    paddingVertical: 48,
    backgroundColor: COLORS.bgMedium,
  },
  privacyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  privacyCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  privacyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  privacyDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 17,
  },
  privacyQuote: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purpleLight,
  },
  privacyQuoteText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 8,
  },
  privacyQuoteAuthor: {
    fontSize: 12,
    color: COLORS.purpleLight,
    fontWeight: '600',
  },
  // Testimonials
  testimonialCard: {
    width: 300,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  testimonialAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  testimonialRole: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 10,
  },
  testimonialText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // CTA
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  ctaCard: {
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.15)',
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 16,
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    maxWidth: 300,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.45)',
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  ctaLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  ctaLink: {
    color: COLORS.purpleLight,
    fontSize: 14,
    fontWeight: '500',
  },
  ctaLinkDivider: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  // Footer
  footer: {
    backgroundColor: COLORS.bgMedium,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  footerTop: {
    alignItems: 'center',
    marginBottom: 32,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLogo: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  footerTagline: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 6,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  footerColumn: {
    flex: 1,
  },
  footerColumnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerLinkText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 20,
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
