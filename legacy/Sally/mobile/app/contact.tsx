import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from './lib/constants';

const CONTACT_INFO = [
  { icon: 'mail', label: 'Email', value: 'hello@sallie.ai', action: 'mailto:hello@sallie.ai' },
  { icon: 'call', label: 'Phone', value: '+1 (555) 123-4567', action: 'tel:+15551234567' },
  { icon: 'location', label: 'Address', value: '123 Innovation Way\nSan Francisco, CA 94105', action: '' },
  { icon: 'time', label: 'Hours', value: 'Mon-Fri: 9am - 6pm PST\nWeekends: 10am - 4pm PST', action: '' },
];

const SOCIAL_LINKS = [
  { icon: 'logo-twitter', label: 'Twitter', url: 'https://twitter.com' },
  { icon: 'logo-linkedin', label: 'LinkedIn', url: 'https://linkedin.com' },
  { icon: 'logo-github', label: 'GitHub', url: 'https://github.com' },
  { icon: 'logo-discord', label: 'Discord', url: 'https://discord.com' },
];

const TOPICS = [
  'General Inquiry',
  'Technical Support',
  'Billing & Subscription',
  'Feature Request',
  'Bug Report',
  'Partnership',
  'Press & Media',
  'Enterprise Sales',
];

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!topic) newErrors.topic = 'Please select a topic';
    if (!message.trim()) newErrors.message = 'Message is required';
    else if (message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    Alert.alert(
      'Message Sent!',
      'Thank you for reaching out. Our team will respond within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setEmail('');
            setTopic('');
            setMessage('');
            setErrors({});
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSubtitle}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
        </View>

        {/* Contact Info Cards */}
        <View style={styles.contactGrid}>
          {CONTACT_INFO.map((info, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactCard}
              onPress={() => info.action ? Linking.openURL(info.action) : null}
              activeOpacity={info.action ? 0.7 : 1}
              disabled={!info.action}
            >
              <View style={styles.contactCardIcon}>
                <Ionicons name={info.icon as any} size={22} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.contactCardLabel}>{info.label}</Text>
              <Text style={styles.contactCardValue}>{info.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Send a Message</Text>

          {/* Name */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Name</Text>
            <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
              <Ionicons name="person-outline" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={(t) => { setName(t); if (errors.name) setErrors({ ...errors, name: '' }); }}
                placeholder="Your full name"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.formInput}
                value={email}
                onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: '' }); }}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Topic */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Topic</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, errors.topic && styles.inputError]}
              onPress={() => setShowTopics(!showTopics)}
              activeOpacity={0.7}
            >
              <Ionicons name="list-outline" size={18} color={COLORS.textLight} />
              <Text style={[styles.topicText, !topic && { color: COLORS.textLight }]}>
                {topic || 'Select a topic'}
              </Text>
              <Ionicons name={showTopics ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textLight} />
            </TouchableOpacity>
            {showTopics && (
              <View style={styles.topicDropdown}>
                {TOPICS.map((t, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.topicOption, topic === t && styles.topicOptionActive]}
                    onPress={() => { setTopic(t); setShowTopics(false); if (errors.topic) setErrors({ ...errors, topic: '' }); }}
                  >
                    <Text style={[styles.topicOptionText, topic === t && styles.topicOptionTextActive]}>
                      {t}
                    </Text>
                    {topic === t && <Ionicons name="checkmark" size={18} color={COLORS.primaryLight} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.topic ? <Text style={styles.errorText}>{errors.topic}</Text> : null}
          </View>

          {/* Message */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Message</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper, errors.message && styles.inputError]}>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={message}
                onChangeText={(t) => { setMessage(t); if (errors.message) setErrors({ ...errors, message: '' }); }}
                placeholder="Tell us how we can help..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCount}>{message.length}/2000</Text>
            {errors.message ? <Text style={styles.errorText}>{errors.message}</Text> : null}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="send" size={18} color={COLORS.white} />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Social Links */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialGrid}>
            {SOCIAL_LINKS.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialButton}
                onPress={() => Linking.openURL(social.url)}
                activeOpacity={0.7}
              >
                <Ionicons name={social.icon as any} size={24} color={COLORS.primaryLight} />
                <Text style={styles.socialLabel}>{social.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Help */}
        <View style={styles.quickHelp}>
          <Text style={styles.quickHelpTitle}>Need Quick Help?</Text>
          <Text style={styles.quickHelpDesc}>
            Try asking Sallie directly — our AI can answer most questions instantly.
          </Text>
          <TouchableOpacity
            style={styles.quickHelpButton}
            onPress={() => router.push('/(tabs)/chat')}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles" size={18} color={COLORS.white} />
            <Text style={styles.quickHelpButtonText}>Ask Sallie</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    marginTop: 8,
    lineHeight: 22,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  contactCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  contactCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contactCardValue: {
    fontSize: 13,
    color: COLORS.white,
    lineHeight: 18,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  formInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    paddingVertical: 14,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 4,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  topicText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    paddingVertical: 14,
  },
  topicDropdown: {
    backgroundColor: COLORS.bgMedium,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  topicOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  topicOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  topicOptionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  topicOptionTextActive: {
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    elevation: 8,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  socialSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  socialTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  socialLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  quickHelp: {
    marginHorizontal: 20,
    marginTop: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  quickHelpTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  quickHelpDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  quickHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickHelpButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
