import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { DoctorTabParamList, DoctorStackParamList } from '../types/navigation';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../theme';

const Tab = createBottomTabNavigator<DoctorTabParamList>();
const Stack = createNativeStackNavigator<DoctorStackParamList>();

import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import DoctorAppointmentsScreen from '../screens/doctor/AppointmentsScreen';
import DoctorPatientListScreen from '../screens/doctor/PatientListScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen';
import PatientDetailScreen from '../screens/doctor/PatientDetailScreen';
import PrescriptionScreen from '../screens/doctor/PrescriptionScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import ProfileEditScreen from '../screens/shared/ProfileEditScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';
import ConsultationChatScreen from './../screens/shared/ConsultationChatScreen';
import VideoConsultationScreen from '../screens/patient/VideoConsultationScreen';
import DoctorAvailabilityScreen from '../screens/doctor/DoctorAvailabilityScreen';
import HelpCenterScreen from '../screens/shared/HelpCenterScreen';
import PrivacyPolicyScreen from '../screens/shared/PrivacyPolicyScreen';
import SuspendedAccountScreen from '../screens/doctor/SuspendedAccountScreen';
import DoctorTermsScreen from '../screens/doctor/DoctorTermsScreen';
import BloodDonorsScreen from '../screens/patient/BloodDonorsScreen';

type TabIcon = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof DoctorTabParamList, { active: TabIcon; inactive: TabIcon; label: string }> = {
  DoctorHome: { active: 'home', inactive: 'home-outline', label: 'Home' },
  DoctorAppointments: { active: 'calendar', inactive: 'calendar-outline', label: 'Appointments' },
  DoctorPatients: { active: 'people', inactive: 'people-outline', label: 'Patients' },
  DoctorProfile: { active: 'person', inactive: 'person-outline', label: 'Profile' },
};

function DoctorResponsiveTabBar(props: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const isLandscape = width >= 768;

  if (!isLandscape) {
    return <BottomTabBar {...props} />;
  }

  const { state, descriptors, navigation } = props;

  return (
    <View style={styles.landscapeSidebar}>
      {/* Brand Header */}
      <View style={styles.sidebarHeader}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="pulse" size={20} color="#0F6E6E" />
          </View>
          <View>
            <Text style={styles.brandTitle}>OmniPulse</Text>
            <Text style={styles.brandSub}>Doctor Clinical Suite</Text>
          </View>
        </View>

        <View style={styles.mdcnBadge}>
          <Ionicons name="shield-checkmark" size={13} color="#0F6E6E" />
          <Text style={styles.mdcnBadgeText}>MDCN Verified</Text>
        </View>
      </View>

      {/* Nav Items */}
      <View style={styles.sidebarNav}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const info = TAB_ICONS[route.name as keyof DoctorTabParamList];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={[
                styles.sidebarNavItem,
                isFocused && styles.sidebarNavItemActive,
              ]}
            >
              <Ionicons
                name={isFocused ? info.active : info.inactive}
                size={20}
                color={isFocused ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.sidebarNavText,
                  isFocused && styles.sidebarNavTextActive,
                ]}
              >
                {info.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Action Tools in Sidebar */}
      <View style={styles.sidebarFooter}>
        <TouchableOpacity
          style={styles.quickToolBtn}
          onPress={() => navigation.navigate('Prescription', { mode: 'create', appointmentId: 'direct', patientId: 'pat-1' })}
          activeOpacity={0.75}
        >
          <Ionicons name="medkit" size={16} color="#0F6E6E" />
          <Text style={styles.quickToolText}>Issue E-Prescription</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickToolBtn}
          onPress={() => navigation.navigate('DoctorAvailability')}
          activeOpacity={0.75}
        >
          <Ionicons name="time" size={16} color="#7C3AED" />
          <Text style={styles.quickToolText}>Duty Hours & Slots</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DoctorTabs = () => {
  const { width } = useWindowDimensions();
  const isLandscape = width >= 768;

  return (
    <Tab.Navigator
      tabBar={(props) => <DoctorResponsiveTabBar {...props} />}
      screenOptions={({ route }) => {
        const info = TAB_ICONS[route.name as keyof DoctorTabParamList];
        return {
          headerShown: false,
          sceneStyle: isLandscape ? { marginLeft: 240 } : undefined,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? info.active : info.inactive} size={size} color={color} />
          ),
          tabBarLabel: info.label,
          tabBarActiveTintColor: Colors.primary[600],
          tabBarInactiveTintColor: Colors.neutral[400],
          tabBarStyle: isLandscape ? { display: 'none' } : styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        };
      }}
    >
      <Tab.Screen name="DoctorHome" component={DoctorDashboardScreen as React.ComponentType} />
      <Tab.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen as React.ComponentType} />
      <Tab.Screen name="DoctorPatients" component={DoctorPatientListScreen as React.ComponentType} />
      <Tab.Screen name="DoctorProfile" component={DoctorProfileScreen as React.ComponentType} />
    </Tab.Navigator>
  );
};

export const DoctorNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
    <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
    <Stack.Screen
      name="PatientDetail"
      component={PatientDetailScreen as React.ComponentType}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="Prescription"
      component={PrescriptionScreen as React.ComponentType}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen name="Notifications" component={NotificationsScreen as React.ComponentType} />
    <Stack.Screen name="Settings" component={SettingsScreen as React.ComponentType} />
    <Stack.Screen name="ProfileEdit" component={ProfileEditScreen as React.ComponentType} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen as React.ComponentType} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="ConsultationChat" component={ConsultationChatScreen as React.ComponentType} />
    <Stack.Screen
      name="VideoConsultation"
      component={VideoConsultationScreen as React.ComponentType}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="DoctorAvailability"
      component={DoctorAvailabilityScreen as React.ComponentType}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen name="HelpCenter" component={HelpCenterScreen as React.ComponentType} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen as React.ComponentType} />
    <Stack.Screen name="SuspendedAccount" component={SuspendedAccountScreen as React.ComponentType} />
    <Stack.Screen name="DoctorTerms" component={DoctorTermsScreen as React.ComponentType} />
    <Stack.Screen name="BloodDonors" component={BloodDonorsScreen as React.ComponentType} />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    ...Shadows.md,
  },
  tabLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  tabItem: { gap: 2 },
  landscapeSidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'space-between',
    zIndex: 100,
    ...Shadows.md,
  },
  sidebarHeader: {
    gap: 12,
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E6F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  brandSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  mdcnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  mdcnBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: '#0F6E6E',
  },
  sidebarNav: {
    flex: 1,
    gap: 6,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sidebarNavItemActive: {
    backgroundColor: '#0F6E6E',
  },
  sidebarNavText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  sidebarNavTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  sidebarFooter: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  quickToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickToolText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
});
