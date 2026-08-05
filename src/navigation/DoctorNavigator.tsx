import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
import ConsultationChatScreen from './../screens/shared/ConsultationChatScreen';
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

const DoctorTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      const info = TAB_ICONS[route.name as keyof DoctorTabParamList];
      return {
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? info.active : info.inactive} size={size} color={color} />
        ),
        tabBarLabel: info.label,
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.neutral[400],
        tabBarStyle: styles.tabBar,
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
    <Stack.Screen name="ConsultationChat" component={ConsultationChatScreen as React.ComponentType} />
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
});
