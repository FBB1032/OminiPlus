import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
} from 'react-native';

const logo = require('../../../../assets/images/logo.png');
import LottieView from 'lottie-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../../theme';
import { useAuth } from '../../../hooks/useAuth';

// ─── Local Lottie assets (bundled — no network required) ──────────────────────
const doctorAnim = require('../../../../assets/animations/doctor.json');
const telehealthAnim = require('../../../../assets/animations/telehealth.json');
const recordsAnim = require('../../../../assets/animations/records.json');

interface Slide {
  id: string;
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lottieSource: any;
  accentColor: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'AI-Powered Health Assistant',
    description:
      'Get immediate answers to your health queries, personalised symptom assessment, and smart guidance powered by medical AI.',
    lottieSource: doctorAnim,
    accentColor: Colors.primary[500],
  },
  {
    id: '2',
    title: 'Seamless Telehealth & Booking',
    description:
      'Book appointments instantly, consult verified doctors online, and chat securely with your healthcare team — anytime.',
    lottieSource: telehealthAnim,
    accentColor: '#10B981', // emerald
  },
  {
    id: '3',
    title: 'Your Medical Records in One Place',
    description:
      'Keep prescriptions, vitals histories, and medical documents securely locked yet instantly accessible whenever you need them.',
    lottieSource: recordsAnim,
    accentColor: '#6366F1', // indigo
  },
];

export const OnboardingScreen = () => {
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const dotScale = useRef(slides.map(() => new Animated.Value(1))).current;

  const animateDots = (index: number) => {
    slides.forEach((_, i) => {
      Animated.spring(dotScale[i], {
        toValue: i === index ? 1.4 : 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentIndex(idx);
      animateDots(idx);
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

  const accent = slides[currentIndex].accentColor;

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      {/* Animation */}
      <View style={styles.animationContainer}>
        <LottieView
          source={item.lottieSource}
          autoPlay
          loop
          style={styles.animation}
          resizeMode="contain"
        />
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header — Transparent Logo + Skip */}
      <View style={styles.header}>
        <Image
          source={logo}
          style={{ width: 140, height: 32 }}
          resizeMode="contain"
        />
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef}
        style={styles.flatList}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Animated dot indicators */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentIndex ? accent : '#334155',
                  width: index === currentIndex ? 22 : 7,
                  transform: [{ scaleY: dotScale[index] }],
                },
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: accent }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started →' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[6],
  },
  skipBtn: { padding: Spacing[2] },
  skipText: {
    color: '#94A3B8',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  headerPlaceholder: { height: 1 },
  flatList: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
  },
  animationContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  animation: {
    width: '90%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: Spacing[4],
    lineHeight: 32,
  },
  description: {
    fontSize: FontSize.md,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[6],
    height: 20,
  },
  indicator: {
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
});
