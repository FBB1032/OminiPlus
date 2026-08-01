import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

const { width } = Dimensions.get('window');

const logo = require('../../../assets/images/logo.png');

export const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // Logo animates in first
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Then text slides up
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative radial glow behind logo */}
      <View style={styles.glow} />

      {/* Full Omini Pulse logo (transparent PNG, no background) */}
      <Animated.View
        style={[
          styles.logoWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.textBlock,
          { opacity: textFade, transform: [{ translateY: textSlide }] },
        ]}
      >
        <Text style={styles.tagline}>Your Intelligent Health Companion</Text>
      </Animated.View>

      {/* Bottom decorative arc */}
      <View style={styles.bottomArc} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(15, 110, 110, 0.10)',
    top: '15%',
  },
  logoWrapper: {
    width: width * 0.80,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[7],
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    alignItems: 'center',
  },
  appName: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: '#F8FAFC',
    letterSpacing: 0.8,
    marginBottom: Spacing[2],
  },
  tagline: {
    fontSize: FontSize.sm,
    color: '#94A3B8',
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
  },
  bottomArc: {
    position: 'absolute',
    bottom: -width * 0.6,
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: 'rgba(56, 178, 172, 0.04)',
  },
});
