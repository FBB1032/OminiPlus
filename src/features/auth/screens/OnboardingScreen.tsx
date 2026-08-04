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
  ImageBackground,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../../../theme';
import { useAuth } from '../../../hooks/useAuth';

const logo = require('../../../../assets/images/logo.png');

const docImage1 = require('../../../../assets/images/onboarding_doctor_1.jpg');
const docImage2 = require('../../../../assets/images/onboarding_doctor_2.jpg');
const docImage3 = require('../../../../assets/images/onboarding_doctor_3.jpg');

interface Slide {
  id: string;
  title: string;
  description: string;
  image: any;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Consult Verified Medical Specialists Anywhere',
    description:
      'Connect directly with certified practitioners across Nigeria for video consultations, voice calls, and secure instant chat.',
    image: docImage1,
  },
  {
    id: '2',
    title: 'AI Health Intelligence & Encrypted Records',
    description:
      'Instant symptom assessment, automated clinical summaries, and 256-bit AES encrypted health record tracking in one secure place.',
    image: docImage2,
  },
  {
    id: '3',
    title: 'Digital Prescriptions & Emergency Directory',
    description:
      'Receive digitally signed E-Prescriptions, locate open certified pharmacies via GPS, and access 24/7 national emergency hospital dispatch.',
    image: docImage3,
  },
];

export const OnboardingScreen = () => {
  const { width, height } = useWindowDimensions();
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const dotScale = useRef(slides.map(() => new Animated.Value(1))).current;

  const animateDots = (index: number) => {
    slides.forEach((_, i) => {
      Animated.spring(dotScale[i], {
        toValue: i === index ? 1.3 : 1,
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

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slideContainer, { width, height }]}>
      <ImageBackground source={item.image} style={styles.backgroundImage} resizeMode="cover">
        {/* Clean Vignette Overlay */}
        <View style={styles.vignetteOverlay}>
          <View style={styles.textWrap}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Top Bar */}
      <SafeAreaView style={styles.topHeaderSafeArea}>
        <View style={styles.topHeader}>
          <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          {currentIndex < slides.length - 1 ? (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </SafeAreaView>

      {/* Full Screen Slides */}
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

      {/* Bottom Action Area */}
      <SafeAreaView style={styles.bottomOverlaySafeArea}>
        <View style={styles.bottomOverlay}>
          {/* Indicator Dots */}
          <View style={styles.indicatorContainer}>
            {slides.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentIndex ? Colors.primary[500] : 'rgba(255, 255, 255, 0.35)',
                    width: index === currentIndex ? 24 : 7,
                    transform: [{ scaleY: dotScale[index] }],
                  },
                ]}
              />
            ))}
          </View>

          {/* Clean Executive CTA Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.88}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Ionicons
              name={currentIndex === slides.length - 1 ? 'arrow-forward' : 'chevron-forward'}
              size={18}
              color="#0F172A"
            />
          </TouchableOpacity>
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
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing[6],
    paddingBottom: 150,
  },
  textWrap: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 23,
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
    width: 140,
    height: 32,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    gap: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 16,
  },
  indicator: {
    height: 7,
    borderRadius: 4,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: FontWeight.bold,
  },
});
