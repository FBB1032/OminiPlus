import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  ImageBackground,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../../../theme';
import { useAuth } from '../../../hooks/useAuth';

const logo = require('../../../../assets/images/logo.png');

const docImage1 = require('../../../../assets/images/onboarding_doctor_1.png');
const docImage2 = require('../../../../assets/images/onboarding_doctor_2.png');
const docImage3 = require('../../../../assets/images/onboarding_doctor_3.png');

interface Slide {
  id: string;
  title: string;
  description: string;
  image: any;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Connect with Verified Doctors Anytime',
    description: 'Talk to licensed medical doctors anywhere in Nigeria.',
    image: docImage1,
  },
  {
    id: '2',
    title: 'AI-Powered Health Insights',
    description: 'Get instant AI symptom checks and intelligent health updates.',
    image: docImage2,
  },
  {
    id: '3',
    title: 'Your Health Records, Protected',
    description: 'Access encrypted medical records and digital prescriptions anytime.',
    image: docImage3,
  },
];

export const OnboardingScreen = () => {
  const { width, height } = useWindowDimensions();
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  // Animation values
  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    // Header entry animation
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      if (idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({ index: slides.length - 1, animated: true });
  };

  const onPressInButton = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOutButton = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    // Parallax background scale interpolation
    const imageScale = scrollX.interpolate({
      inputRange: [(index - 1) * width, index * width, (index + 1) * width],
      outputRange: [1.18, 1.02, 1.18],
      extrapolate: 'clamp',
    });

    // Per-slide text opacity driven directly by scroll position
    const slideTextOpacity = scrollX.interpolate({
      inputRange: [(index - 0.7) * width, index * width, (index + 0.7) * width],
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    // Per-slide text slide-up driven directly by scroll position
    const slideTextTranslateY = scrollX.interpolate({
      inputRange: [(index - 0.7) * width, index * width, (index + 0.7) * width],
      outputRange: [24, 0, 24],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slideContainer, { width, height }]}>
        <Animated.View style={[styles.imageWrapper, { transform: [{ scale: imageScale }] }]}>
          <ImageBackground source={item.image} style={styles.backgroundImage} resizeMode="cover">
            {/* Consistent 60% Dark Overlay across all slides */}
            <View style={styles.vignetteOverlay}>
              <Animated.View
                style={[
                  styles.glassTextCard,
                  {
                    opacity: slideTextOpacity,
                    transform: [{ translateY: slideTextTranslateY }],
                  },
                ]}
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </Animated.View>
            </View>
          </ImageBackground>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent animated />

      {/* Top Header */}
      <SafeAreaView style={styles.topHeaderSafeArea}>
        <Animated.View
          style={[
            styles.topHeader,
            { opacity: headerFade, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          {currentIndex < slides.length - 1 ? (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.75}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </Animated.View>
      </SafeAreaView>

      {/* Full Screen Slides */}
      <Animated.FlatList
        ref={flatListRef as any}
        data={slides}
        renderItem={renderSlide as any}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef}
        style={styles.flatList}
      />

      {/* Bottom Action Area */}
      <SafeAreaView style={styles.bottomOverlaySafeArea}>
        <View style={styles.bottomOverlay}>
          {/* Animated Expanding Capsule Progress Indicators */}
          <View style={styles.indicatorContainer}>
            {slides.map((_, index) => {
              const capsuleScaleX = scrollX.interpolate({
                inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                outputRange: [0.28, 1, 0.28],
                extrapolate: 'clamp',
              });

              const capsuleOpacity = scrollX.interpolate({
                inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                outputRange: [0.35, 1, 0.35],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.capsuleIndicator,
                    {
                      opacity: capsuleOpacity,
                      backgroundColor: index === currentIndex ? Colors.primary[500] : '#FFFFFF',
                      transform: [{ scaleX: capsuleScaleX }],
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Premium CTA Button with Press Scale & 20px Radius */}
          <Animated.View style={[{ width: '100%' }, { transform: [{ scale: buttonScale }] }]}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleNext}
              onPressIn={onPressInButton}
              onPressOut={onPressOutButton}
              activeOpacity={0.92}
            >
              <Text style={styles.buttonText}>
                {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
              </Text>
              <Ionicons
                name={currentIndex === slides.length - 1 ? 'arrow-forward' : 'chevron-forward'}
                size={19}
                color="#0F172A"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.60)',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing[6],
    paddingBottom: 145,
  },
  glassTextCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderRadius: 20,
    padding: Spacing[5],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
    fontWeight: FontWeight.medium,
  },
  topHeaderSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[6],
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : Spacing[2],
  },
  logoImage: {
    width: 145,
    height: 36,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: '#F8FAFC',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  bottomOverlaySafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  bottomOverlay: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[6],
    alignItems: 'center',
    gap: 22,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 16,
  },
  capsuleIndicator: {
    width: 28,
    height: 7,
    borderRadius: 4,
    marginHorizontal: -4,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
});
