import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

export interface HeartbeatLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  color?: string;
  message?: string;
  showEcg?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const HeartbeatLoader = memo<HeartbeatLoaderProps>(({
  size = 'md',
  color = '#0F6E6E',
  message,
  showEcg = true,
  style,
}) => {
  // Beating scale (double-thump: lub - dub)
  const heartScale = useRef(new Animated.Value(1)).current;
  // Expanding glow halo
  const glowScale = useRef(new Animated.Value(0.7)).current;
  const glowOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Realistic heartbeat timing: lub (120ms), quick recoil, dub (100ms), return, rest (620ms)
    const heartbeat = Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.28, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.06, duration: 90, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.18, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.00, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(580),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 1.7, duration: 480, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0, duration: 480, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 0.7, duration: 0, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(580),
      ])
    );

    heartbeat.start();
    glow.start();

    return () => {
      heartbeat.stop();
      glow.stop();
      heartScale.setValue(1);
      glowScale.setValue(0.7);
      glowOpacity.setValue(0.6);
    };
  }, [heartScale, glowScale, glowOpacity]);

  // Size configurations
  const iconSize = size === 'sm' ? 20 : size === 'lg' || size === 'fullscreen' ? 44 : 30;
  const wrapperSize = size === 'sm' ? 38 : size === 'lg' || size === 'fullscreen' ? 76 : 54;
  const ringSize = size === 'sm' ? 32 : size === 'lg' || size === 'fullscreen' ? 66 : 46;

  const content = (
    <View style={[styles.centerContainer, style]}>
      <View style={[styles.heartWrapper, { width: wrapperSize, height: wrapperSize }]}>
        {/* Glowing halo */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderColor: color,
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            },
          ]}
        />
        {/* Animated Heart */}
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <Ionicons name="heart" size={iconSize} color={color} />
        </Animated.View>
      </View>

      {/* ECG Line dots */}
      {showEcg && size !== 'sm' && (
        <View style={styles.ecgRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <EcgDot key={i} delay={i * 110} color={color} />
          ))}
        </View>
      )}

      {/* Optional loading text */}
      {message ? (
        <Text style={[styles.message, size === 'sm' && styles.messageSm]}>
          {message}
        </Text>
      ) : null}
    </View>
  );

  if (size === 'fullscreen') {
    return <View style={styles.fullscreenContainer}>{content}</View>;
  }

  return content;
});

const EcgDot = memo(({ delay, color }: { delay: number; color: string }) => {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.2, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(Math.max(0, 560 - delay)),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, opacity]);

  return <Animated.View style={[styles.ecgDot, { backgroundColor: color, opacity }]} />;
});

HeartbeatLoader.displayName = 'HeartbeatLoader';
EcgDot.displayName = 'EcgDot';

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[2],
  },
  fullscreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: 240,
  },
  heartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  ecgRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: 2,
  },
  ecgDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  message: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing[2],
  },
  messageSm: {
    fontSize: 11,
    marginTop: 2,
  },
});
