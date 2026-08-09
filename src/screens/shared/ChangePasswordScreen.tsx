import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';
import { Input, Button } from '../../components';
import { useToast } from '../../hooks/useAuth';

// ─── Password strength calculator ────────────────────────────────────────────

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#E2E8F0' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Weak',      color: '#EF4444' };
  if (score <= 2) return { score, label: 'Fair',      color: '#F59E0B' };
  if (score <= 3) return { score, label: 'Good',      color: '#3B82F6' };
  if (score <= 4) return { score, label: 'Strong',    color: '#10B981' };
  return             { score, label: 'Very Strong', color: '#059669' };
}

// ─── Requirements checklist ───────────────────────────────────────────────────

const REQUIREMENTS = [
  { label: 'At least 8 characters',       test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter (A–Z)',   test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One number (0–9)',             test: (pw: string) => /[0-9]/.test(pw) },
  { label: 'One special character (!@#…)', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ChangePasswordScreen({ navigation }: any) {
  const { success: showSuccess, error: showError } = useToast();

  const [current,    setCurrent]    = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [loading,    setLoading]    = useState(false);

  const newRef     = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const strength = getStrength(newPw);
  const allRequirementsMet = REQUIREMENTS.every(r => r.test(newPw));
  const passwordsMatch = newPw.length > 0 && newPw === confirm;

  const handleSave = async () => {
    if (!current.trim()) {
      showError('Required', 'Please enter your current password.');
      return;
    }
    if (!allRequirementsMet) {
      showError('Weak Password', 'Your new password does not meet the requirements below.');
      return;
    }
    if (!passwordsMatch) {
      showError('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    // Simulate API call — replace with real authService.changePassword() when backend is ready
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);

    showSuccess('Password Changed', 'Your password has been updated successfully.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Shield banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Ionicons name="shield-checkmark" size={26} color={Colors.primary[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Secure Password Update</Text>
              <Text style={styles.bannerBody}>
                Choose a strong, unique password that you don't use on any other platform.
              </Text>
            </View>
          </View>

          {/* Fields */}
          <View style={styles.fieldGroup}>
            <Input
              label="Current Password"
              value={current}
              onChangeText={setCurrent}
              isPassword
              leftIcon="lock-closed-outline"
              returnKeyType="next"
              onSubmitEditing={() => newRef.current?.focus()}
            />

            <Input
              ref={newRef}
              label="New Password"
              value={newPw}
              onChangeText={setNewPw}
              isPassword
              leftIcon="key-outline"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />

            {/* Strength bar */}
            {newPw.length > 0 && (
              <View style={styles.strengthWrap}>
                <View style={styles.strengthBar}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSegment,
                        { backgroundColor: i <= strength.score ? strength.color : '#E2E8F0' },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            {/* Requirements checklist */}
            {newPw.length > 0 && (
              <View style={styles.requirementsList}>
                {REQUIREMENTS.map(req => {
                  const met = req.test(newPw);
                  return (
                    <View key={req.label} style={styles.requirementRow}>
                      <Ionicons
                        name={met ? 'checkmark-circle' : 'ellipse-outline'}
                        size={15}
                        color={met ? '#10B981' : '#94A3B8'}
                      />
                      <Text style={[styles.requirementText, met && styles.requirementMet]}>
                        {req.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <Input
              ref={confirmRef}
              label="Confirm New Password"
              value={confirm}
              onChangeText={setConfirm}
              isPassword
              leftIcon="checkmark-circle-outline"
              returnKeyType="done"
              onSubmitEditing={handleSave}
              error={
                confirm.length > 0 && !passwordsMatch
                  ? 'Passwords do not match'
                  : undefined
              }
            />
          </View>

          {/* Tip card */}
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={16} color="#D97706" />
            <Text style={styles.tipText}>
              Use a mix of uppercase letters, numbers, and symbols. Avoid your name, birthday, or common words.
            </Text>
          </View>

          {/* CTA */}
          <Button
            variant="primary"
            label="Update Password"
            onPress={handleSave}
            isLoading={loading}
            disabled={!current || !allRequirementsMet || !passwordsMatch}
            style={styles.cta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn:     { padding: Spacing[1] },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  placeholder: { width: 30 },

  content: {
    padding: Spacing[5],
    gap: Spacing[5],
    paddingBottom: 60,
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.primary[100] ?? '#BFDBFE',
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bannerTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700] ?? Colors.primary[600],
    marginBottom: 2,
  },
  bannerBody: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
  },

  // Fields
  fieldGroup: { gap: Spacing[1] },

  // Strength
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginTop: -Spacing[1],
    paddingHorizontal: Spacing[1],
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: 5,
  },
  strengthSegment: {
    flex: 1,
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    minWidth: 72,
    textAlign: 'right',
  },

  // Requirements
  requirementsList: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: -Spacing[2],
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  requirementText: {
    fontSize: FontSize.xs,
    color: '#94A3B8',
  },
  requirementMet: {
    color: '#10B981',
    fontWeight: FontWeight.semiBold,
  },

  // Tip
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: '#92400E',
    lineHeight: 17,
  },

  cta: { marginTop: Spacing[2] },
});
