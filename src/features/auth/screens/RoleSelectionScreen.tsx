import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { AuthScreenProps } from '../../../types';

const doctorIllustration = require('../../../../assets/images/role_doctor.jpg');
const patientIllustration = require('../../../../assets/images/role_patient.jpg');

export const RoleSelectionScreen = ({ navigation }: AuthScreenProps<'RoleSelection'>) => {
  const { width, height } = useWindowDimensions();

  // Animation values for interactive card clicks
  const doctorScale = useRef(new Animated.Value(1)).current;
  const patientScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectRole = (role: 'doctor' | 'patient') => {
    navigation.navigate('Register', { role });
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  // Dynamically size illustration cards to fit compact and tall phone screens
  const cardWidth = Math.min(width * 0.52, 175);
  const cardHeight = Math.min(height * 0.17, 145);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F6E6E" translucent={Platform.OS === 'android'} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrapper}>
          {/* Main White Elevated Card */}
          <View style={styles.cardContainer}>
            {/* Title */}
            <View style={styles.headerBox}>
              <Text style={styles.title}>Why did you download the app?</Text>
            </View>

            {/* Role Options */}
            <View style={styles.optionsContainer}>
              {/* Doctor Option */}
              <View style={styles.optionWrapper}>
                <Animated.View style={{ transform: [{ scale: doctorScale }] }}>
                  <TouchableOpacity
                    style={[styles.illustrationCard, { width: cardWidth, height: cardHeight }]}
                    onPress={() => handleSelectRole('doctor')}
                    onPressIn={() => handlePressIn(doctorScale)}
                    onPressOut={() => handlePressOut(doctorScale)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={doctorIllustration}
                      style={styles.illustrationImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity
                  onPress={() => handleSelectRole('doctor')}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
                >
                  <Text style={styles.roleTitle}>I'm a doctor</Text>
                </TouchableOpacity>
              </View>

              {/* Patient Option */}
              <View style={styles.optionWrapper}>
                <Animated.View style={{ transform: [{ scale: patientScale }] }}>
                  <TouchableOpacity
                    style={[styles.illustrationCard, { width: cardWidth, height: cardHeight }]}
                    onPress={() => handleSelectRole('patient')}
                    onPressIn={() => handlePressIn(patientScale)}
                    onPressOut={() => handlePressOut(patientScale)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={patientIllustration}
                      style={styles.illustrationImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity
                  onPress={() => handleSelectRole('patient')}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
                >
                  <Text style={styles.roleTitle}>I'm a patient</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Pagination / Dots indicator */}
            <View style={styles.dotsContainer}>
              <View style={styles.dotInactive} />
              <View style={styles.dotInactive} />
              <View style={styles.dotActive} />
            </View>
          </View>

          {/* Underneath Card: Already have an account? Login */}
          <View style={styles.loginFooter}>
            <Text style={styles.loginQuestion}>Already have an account? </Text>
            <TouchableOpacity
              onPress={handleGoToLogin}
              activeOpacity={0.75}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B5757', // Deep teal — app brand color (matches Login & Register)
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  headerBox: {
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F6E6E', // Dark teal on white card
    lineHeight: 30,
    textAlign: 'left',
    letterSpacing: -0.3,
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 22,
    marginVertical: 4,
  },
  optionWrapper: {
    alignItems: 'center',
    gap: 10,
  },
  illustrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#D8ECE4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    overflow: 'hidden',
    shadowColor: '#1B6B55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#249C76',
    letterSpacing: -0.2,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 4,
  },
  dotActive: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2CB48E',
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1ECE3',
  },
  loginFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});

export default RoleSelectionScreen;
