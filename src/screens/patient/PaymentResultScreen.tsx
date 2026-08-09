/**
 * PaymentResultScreen
 *
 * Demo screen for showing the team the success / failure payment states
 * before the real Paystack backend is connected.
 *
 * Animations (no extra libraries needed — pure React Native Animated API):
 *   Success — circle scales in → green tick stroke draws left-to-right
 *   Failure — circle scales in → red X draws as two crossing lines
 *
 * The top-right toggle button lets you flip between states live so you
 * can walk your team through both flows in one session.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Circle, Polyline, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../../theme';

// ─── Animated SVG wrappers ────────────────────────────────────────────────────
const AnimatedCircle   = Animated.createAnimatedComponent(Circle);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
const AnimatedLine     = Animated.createAnimatedComponent(Line);

// ─── Stroke-dashoffset tick animation ────────────────────────────────────────
// SVG trick: set strokeDasharray = path length, then animate strokeDashoffset
// from full length → 0 to "draw" the shape.
const CIRCLE_RADIUS    = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ≈ 339
const TICK_LENGTH      = 90;   // approximate polyline path length
const CROSS_ARM_LENGTH = 60;   // each arm of the X

// ─── Types ────────────────────────────────────────────────────────────────────
export type PaymentResultParams = {
  outcome: 'success' | 'failure';
  amount: string;           // e.g. "₦15,000"
  doctorName: string;
  format: string;           // e.g. "Video Call"
  date: string;             // e.g. "Mon, 11 Aug 2026"
  slot: string;             // e.g. "10:30"
  referenceId: string;      // e.g. "TXN-928471"
  failureReason?: string;   // e.g. "Insufficient funds"
};

export default function PaymentResultScreen({ route, navigation }: any) {
  const params: PaymentResultParams = route?.params ?? {
    outcome: 'success',
    amount: '₦15,000',
    doctorName: 'Dr. Folake Ademola',
    format: 'Video Call',
    date: 'Mon, 11 Aug 2026',
    slot: '10:30 AM',
    referenceId: 'TXN-928471',
  };

  // ── Demo toggle (lets team flip between states without re-navigating) ──────
  const [outcome, setOutcome] = useState<'success' | 'failure'>(params.outcome);

  // ── Animation values ──────────────────────────────────────────────────────
  // Shared: overall scale pop
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  // Shared: circle stroke draw
  const circleAnim  = useRef(new Animated.Value(CIRCLE_CIRCUMFERENCE)).current;
  // Tick draw
  const tickAnim    = useRef(new Animated.Value(TICK_LENGTH)).current;
  // X arm 1 draw
  const xArm1Anim   = useRef(new Animated.Value(CROSS_ARM_LENGTH)).current;
  // X arm 2 draw
  const xArm2Anim   = useRef(new Animated.Value(CROSS_ARM_LENGTH)).current;
  // Card slide-up
  const cardAnim    = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  // Confetti bounce (success only)
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const runAnimation = useCallback(() => {
    // Reset all
    scaleAnim.setValue(0);
    circleAnim.setValue(CIRCLE_CIRCUMFERENCE);
    tickAnim.setValue(TICK_LENGTH);
    xArm1Anim.setValue(CROSS_ARM_LENGTH);
    xArm2Anim.setValue(CROSS_ARM_LENGTH);
    cardAnim.setValue(40);
    cardOpacity.setValue(0);
    confettiAnim.setValue(0);

    Animated.sequence([
      // 1. Circle pops in
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      // 2. Circle stroke draws
      Animated.timing(circleAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      // 3. Tick or X draws in parallel
      Animated.parallel([
        Animated.timing(tickAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(xArm1Anim, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.delay(120),
          Animated.timing(xArm2Anim, {
            toValue: 0,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
      ]),
      // 4. Card slides up
      Animated.parallel([
        Animated.spring(cardAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      // 5. Confetti bounce (success only)
      Animated.spring(confettiAnim, {
        toValue: 1,
        tension: 80,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, circleAnim, tickAnim, xArm1Anim, xArm2Anim, cardAnim, cardOpacity, confettiAnim]);

  // Re-run animation whenever outcome flips
  useEffect(() => { runAnimation(); }, [outcome, runAnimation]);

  const isSuccess = outcome === 'success';
  const accentColor  = isSuccess ? '#10B981' : '#EF4444';
  const bgColor      = isSuccess ? '#ECFDF5' : '#FEF2F2';
  const ringColor    = isSuccess ? '#6EE7B7' : '#FCA5A5';

  // ── Confetti dots (success only) ─────────────────────────────────────────
  const CONFETTI = [
    { color: '#F59E0B', x: -60, y: -80, rotate: '15deg'  },
    { color: '#3B82F6', x:  55, y: -90, rotate: '-20deg' },
    { color: '#8B5CF6', x: -80, y: -40, rotate: '40deg'  },
    { color: '#EC4899', x:  75, y: -50, rotate: '-10deg' },
    { color: '#10B981', x: -30, y: -100,rotate: '5deg'   },
    { color: '#F97316', x:  30, y: -95, rotate: '-35deg' },
  ];

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Demo toggle bar ──────────────────────────────────────────────── */}
      <View style={styles.demoBar}>
        <View style={styles.demoBadge}>
          <Ionicons name="flask-outline" size={13} color="#7C3AED" />
          <Text style={styles.demoBadgeText}>DEMO MODE</Text>
        </View>
        <Text style={styles.demoHint}>Toggle to preview both states</Text>
        <View style={styles.demoToggleRow}>
          <TouchableOpacity
            style={[styles.demoBtn, isSuccess && styles.demoBtnActive, { borderColor: '#10B981' }]}
            onPress={() => setOutcome('success')}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={14} color={isSuccess ? '#10B981' : '#94A3B8'} />
            <Text style={[styles.demoBtnText, isSuccess && { color: '#10B981' }]}>Success</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.demoBtn, !isSuccess && styles.demoBtnActive, { borderColor: '#EF4444' }]}
            onPress={() => setOutcome('failure')}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={14} color={!isSuccess ? '#EF4444' : '#94A3B8'} />
            <Text style={[styles.demoBtnText, !isSuccess && { color: '#EF4444' }]}>Failed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Animated icon ──────────────────────────────────────────────── */}
        <View style={[styles.iconSection, { backgroundColor: bgColor }]}>

          {/* Confetti dots (success) */}
          {isSuccess && CONFETTI.map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confettiDot,
                {
                  backgroundColor: dot.color,
                  transform: [
                    { translateX: dot.x },
                    { translateY: dot.y },
                    { rotate: dot.rotate },
                    { scale: confettiAnim },
                  ],
                },
              ]}
            />
          ))}

          {/* Circle + icon */}
          <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
            <Svg width={140} height={140} viewBox="0 0 140 140">
              {/* Background fill circle */}
              <Circle cx={70} cy={70} r={CIRCLE_RADIUS} fill={bgColor} />

              {/* Animated ring */}
              <AnimatedCircle
                cx={70} cy={70} r={CIRCLE_RADIUS}
                fill="none"
                stroke={ringColor}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={circleAnim}
                // Start at top: rotate -90°
                rotation={-90}
                originX={70}
                originY={70}
              />

              {/* ── Success tick ─────────────────────────────────────── */}
              {isSuccess && (
                <AnimatedPolyline
                  points="38,72 58,92 100,50"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={TICK_LENGTH}
                  strokeDashoffset={tickAnim}
                />
              )}

              {/* ── Failure X ────────────────────────────────────────── */}
              {!isSuccess && (
                <>
                  <AnimatedLine
                    x1={46} y1={46} x2={94} y2={94}
                    stroke={accentColor}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={CROSS_ARM_LENGTH}
                    strokeDashoffset={xArm1Anim}
                  />
                  <AnimatedLine
                    x1={94} y1={46} x2={46} y2={94}
                    stroke={accentColor}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={CROSS_ARM_LENGTH}
                    strokeDashoffset={xArm2Anim}
                  />
                </>
              )}
            </Svg>
          </Animated.View>

          {/* Headline */}
          <Text style={[styles.headline, { color: isSuccess ? '#065F46' : '#991B1B' }]}>
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </Text>
          <Text style={[styles.subline, { color: isSuccess ? '#047857' : '#B91C1C' }]}>
            {isSuccess
              ? 'Your appointment has been booked and confirmed.'
              : (params.failureReason ?? 'Your card could not be charged. Please try again.')}
          </Text>
        </View>

        {/* ── Transaction detail card ───────────────────────────────────── */}
        <Animated.View
          style={[
            styles.detailCard,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardAnim }],
            },
          ]}
        >
          <Text style={styles.detailCardTitle}>
            {isSuccess ? 'Booking Summary' : 'Transaction Details'}
          </Text>

          {[
            { label: 'Reference',        value: params.referenceId, mono: true },
            { label: 'Amount',           value: params.amount },
            { label: 'Doctor',           value: params.doctorName },
            { label: 'Format',           value: params.format },
            { label: 'Date',             value: params.date },
            { label: 'Time Slot',        value: params.slot },
            { label: 'Status',           value: isSuccess ? 'Confirmed' : 'Declined', status: true },
          ].map((row, i) => (
            <View key={row.label} style={[styles.detailRow, i > 0 && styles.detailRowBorder]}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={[
                styles.detailValue,
                row.mono  && styles.detailValueMono,
                row.status && { color: accentColor, fontWeight: FontWeight.bold },
              ]}>
                {row.value}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* ── What happens next (success only) ─────────────────────────── */}
        {isSuccess && (
          <Animated.View style={[styles.nextStepsCard, { opacity: cardOpacity }]}>
            <Text style={styles.nextStepsTitle}>What happens next?</Text>
            {[
              { icon: 'notifications-outline', text: 'You\'ll receive a confirmation notification shortly.' },
              { icon: 'videocam-outline',       text: 'A join link will appear in your Appointments tab 5 min before the call.' },
              { icon: 'document-text-outline',  text: 'Your e-receipt has been sent to your registered email.' },
            ].map((item) => (
              <View key={item.text} style={styles.nextStepRow}>
                <View style={styles.nextStepIconBg}>
                  <Ionicons name={item.icon as any} size={16} color="#0F6E6E" />
                </View>
                <Text style={styles.nextStepText}>{item.text}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ── Failure tips ──────────────────────────────────────────────── */}
        {!isSuccess && (
          <Animated.View style={[styles.failureTipsCard, { opacity: cardOpacity }]}>
            <Text style={styles.nextStepsTitle}>Common reasons for failure</Text>
            {[
              { icon: 'card-outline',          text: 'Insufficient card balance or daily limit reached.' },
              { icon: 'wifi-outline',          text: 'Unstable internet interrupted the Paystack gateway.' },
              { icon: 'lock-closed-outline',   text: 'Card flagged by your bank — try a different card.' },
            ].map((item) => (
              <View key={item.text} style={styles.nextStepRow}>
                <View style={[styles.nextStepIconBg, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name={item.icon as any} size={16} color="#DC2626" />
                </View>
                <Text style={styles.nextStepText}>{item.text}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ── CTAs ─────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.ctaBlock, { opacity: cardOpacity }]}>
          {isSuccess ? (
            <>
              <TouchableOpacity
                style={styles.ctaPrimary}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('PatientTabs', { screen: 'PatientAppointments' })}
              >
                <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                <Text style={styles.ctaPrimaryText}>View My Appointments</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctaSecondary}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PatientTabs', { screen: 'PatientHome' })}
              >
                <Text style={styles.ctaSecondaryText}>Back to Home</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.ctaPrimary, { backgroundColor: '#EF4444' }]}
                activeOpacity={0.85}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
                <Text style={styles.ctaPrimaryText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctaSecondary}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PatientTabs', { screen: 'PatientHome' })}
              >
                <Text style={styles.ctaSecondaryText}>Back to Home</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingBottom: 48 },

  // Demo bar
  demoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing[4],
    paddingVertical: 10,
    backgroundColor: '#FAF5FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
    flexWrap: 'wrap',
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  demoBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: '#7C3AED' },
  demoHint: { fontSize: 11, color: '#7C3AED', flex: 1 },
  demoToggleRow: { flexDirection: 'row', gap: 6 },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  demoBtnActive:  { backgroundColor: '#FFFFFF' },
  demoBtnText:    { fontSize: 11.5, fontWeight: FontWeight.semiBold, color: '#94A3B8' },

  // Icon section
  iconSection: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing[5],
    gap: 12,
    overflow: 'hidden',
  },
  iconWrap:    { position: 'relative' },
  confettiDot: {
    position: 'absolute',
    width: 10, height: 10,
    borderRadius: 3,
    top: 70, left: 70,       // anchored to icon centre; translateX/Y offsets spread them
  },
  headline: { fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: -0.4, textAlign: 'center' },
  subline:  { fontSize: 13.5, textAlign: 'center', lineHeight: 20, maxWidth: 280 },

  // Detail card
  detailCard: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[5],
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.sm,
  },
  detailCardTitle: {
    fontSize: 13, fontWeight: FontWeight.bold, color: '#64748B',
    textTransform: 'uppercase', letterSpacing: 0.6,
    paddingHorizontal: Spacing[4], paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  detailRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: 13 },
  detailRowBorder: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  detailLabel:     { fontSize: 13, color: '#64748B' },
  detailValue:     { fontSize: 13, fontWeight: FontWeight.semiBold, color: '#0F172A', maxWidth: '60%', textAlign: 'right' },
  detailValueMono: { fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 12, color: '#0F6E6E' },

  // Next steps / failure tips card
  nextStepsCard: {
    marginHorizontal: Spacing[4], marginTop: Spacing[4],
    backgroundColor: '#F0FDF9',
    borderRadius: 16, borderWidth: 1, borderColor: '#A7F3D0',
    padding: Spacing[4], gap: Spacing[3],
  },
  failureTipsCard: {
    marginHorizontal: Spacing[4], marginTop: Spacing[4],
    backgroundColor: '#FFF5F5',
    borderRadius: 16, borderWidth: 1, borderColor: '#FED7D7',
    padding: Spacing[4], gap: Spacing[3],
  },
  nextStepsTitle: { fontSize: 13, fontWeight: FontWeight.bold, color: '#0F172A' },
  nextStepRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  nextStepIconBg: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#CCFBF1',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  nextStepText: { flex: 1, fontSize: 12.5, color: '#334155', lineHeight: 18 },

  // CTAs
  ctaBlock: { marginHorizontal: Spacing[4], marginTop: Spacing[5], gap: Spacing[3] },
  ctaPrimary: {
    backgroundColor: '#0F6E6E',
    borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    ...Shadows.md,
  },
  ctaPrimaryText:   { fontSize: 15, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  ctaSecondary:     { paddingVertical: 13, alignItems: 'center' },
  ctaSecondaryText: { fontSize: 14, color: '#64748B', fontWeight: FontWeight.medium, textDecorationLine: 'underline' },
});
