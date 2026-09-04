import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Modal, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay = memo<LoadingOverlayProps>(({
  visible,
  message = 'Please wait...',
}) => {
  // Main heartbeat pulse — expands on the "lub-dub" then snaps back
  const heartScale = useRef(new Animated.Value(1)).current;
  // Soft glow ring that pulses outward with each beat
  const glowScale = useRef(new Animated.Value(0.6)).current;
  const glowOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!visible) return;

    // Heartbeat: quick double-thump (lub — dub) then rest
    const heartbeat = Animated.loop(
      Animated.sequence([
        // Lub (first thump)
        Animated.timing(heartScale, { toValue: 1.32, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.08, duration: 100, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        // Dub (second thump)
        Animated.timing(heartScale, { toValue: 1.22, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.00, duration: 150, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        // Rest between beats
        Animated.delay(620),
      ])
    );

    // Glow ring expands and fades outward on each beat
    const glow = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 1.8, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(600),
      ])
    );

    heartbeat.start();
    glow.start();

    return () => {
      heartbeat.stop();
      glow.stop();
      heartScale.setValue(1);
      glowScale.setValue(0.6);
      glowOpacity.setValue(0.7);
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Animated heart container */}
          <View style={styles.heartWrapper}>
            {/* Expanding glow ring */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  transform: [{ scale: glowScale }],
                  opacity: glowOpacity,
                },
              ]}
            />
            {/* Beating heart icon */}
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name="heart"
                size={46}
                color="#1A7A7A"
              />
            </Animated.View>
          </View>

          {/* ECG line dots */}
          <View style={styles.ecgRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <EcgDot key={i} delay={i * 120} />
            ))}
          </View>

          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
});

// Small pulsing dot that simulates an ECG blip traveling across the row
const EcgDot = memo(({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.2, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(600 - delay),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.ecgDot,
        { opacity },
      ]}
    />
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';
EcgDot.displayName = 'EcgDot';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(11, 87, 87, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing[7],
    paddingVertical: Spacing[6],
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    shadowColor: '#0B5757',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    minWidth: 180,
  },
  heartWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#1A7A7A',
    backgroundColor: 'transparent',
  },
  ecgRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: -4,
  },
  ecgDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A7A7A',
  },
  message: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 2,
  },
});
