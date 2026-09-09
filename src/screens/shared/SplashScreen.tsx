import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from "react-native";
import { Colors, FontSize, FontWeight, Spacing } from "../../theme";

const { width } = Dimensions.get("window");
const logo = require("../../../assets/images/logo.png");

export const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(14)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo animates in first with smooth spring
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Then tagline slides up smoothly
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Continuous subtle heartbeat pulse loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: 1100,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1100,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B5757" animated />

      {/* Decorative ambient heartbeat pulse backdrop */}
      <Animated.View
        style={[
          styles.glow,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Full Omini Pulse logo (25-30% larger) */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          },
        ]}
      >
        <Image source={logo} style={styles.logo} resizeMode="contain" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B5757",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: Colors.primary[600],
    opacity: 0.4,
  },
  logoWrapper: {
    width: width * 0.88,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[4],
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textBlock: {
    alignItems: "center",
  },
  tagline: {
    fontSize: FontSize.md,
    color: "rgba(255,255,255,0.8)",
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.4,
  },
});
