import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { PatientTabParamList, PatientStackParamList } from '../types/navigation';
import { Colors, FontSize, FontWeight, Shadows } from '../theme';

const Tab = createBottomTabNavigator<PatientTabParamList>();
const Stack = createNativeStackNavigator<PatientStackParamList>();

import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import PatientAppointmentsScreen from '../screens/patient/PatientAppointmentsScreen';
import PatientAIScreen from '../screens/patient/AIChatScreen';
import MedicalRecordsScreen from '../screens/patient/MedicalRecordsScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import PrescriptionHistoryScreen from '../screens/patient/PrescriptionHistoryScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import ProfileEditScreen from '../screens/shared/ProfileEditScreen';
import PharmacyScreen from '../screens/patient/PharmacyScreen';
import HospitalsScreen from '../screens/patient/HospitalsScreen';
import DoctorProfileScreen from '../screens/patient/DoctorProfileScreen';
import MedicationRemindersScreen from '../screens/patient/MedicationRemindersScreen';
import VideoConsultationScreen from '../screens/patient/VideoConsultationScreen';
import BloodDonorsScreen from '../screens/patient/BloodDonorsScreen';
import ConsultationChatScreen from '../screens/shared/ConsultationChatScreen';
import ReportIncidentScreen from '../screens/patient/ReportIncidentScreen';

type TabIcon = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof PatientTabParamList, { active: TabIcon; inactive: TabIcon; label: string }> = {
  PatientHome: { active: 'home', inactive: 'home-outline', label: 'Home' },
  PatientAppointments: { active: 'calendar', inactive: 'calendar-outline', label: 'Appointments' },
  PatientAI: { active: 'leaf', inactive: 'leaf-outline', label: 'AI Assistant' },
  PatientRecords: { active: 'document-text', inactive: 'document-text-outline', label: 'Records' },
  PatientProfile: { active: 'person', inactive: 'person-outline', label: 'Profile' },
};

const PatientTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      const info = TAB_ICONS[route.name as keyof PatientTabParamList];
      return {
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'PatientAI') {
            return (
              <View style={[
                styles.aiTabIconContainer,
                focused && styles.aiTabIconContainerActive
              ]}>
                <Ionicons name="leaf" size={20} color={focused ? '#FFFFFF' : Colors.patient} />
              </View>
            );
          }
          return <Ionicons name={focused ? info.active : info.inactive} size={size} color={color} />;
        },
        tabBarLabel: info.label,
        tabBarActiveTintColor: Colors.secondary[600],
        tabBarInactiveTintColor: Colors.neutral[400],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      };
    }}
  >
    <Tab.Screen name="PatientHome" component={PatientHomeScreen} />
    <Tab.Screen name="PatientAppointments" component={PatientAppointmentsScreen} />
    <Tab.Screen name="PatientAI" component={PatientAIScreen} />
    <Tab.Screen name="PatientRecords" component={MedicalRecordsScreen} />
    <Tab.Screen name="PatientProfile" component={PatientProfileScreen} />
  </Tab.Navigator>
);

export const PatientNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
    <Stack.Screen name="PatientTabs" component={PatientTabs} />
    <Stack.Screen
      name="BookAppointment"
      component={BookAppointmentScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen name="PrescriptionHistory" component={PrescriptionHistoryScreen} />
    <Stack.Screen name="MedicationReminders" component={MedicationRemindersScreen} />
    <Stack.Screen name="VideoConsultation" component={VideoConsultationScreen} />
    <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
    <Stack.Screen name="Hospitals" component={HospitalsScreen} />
    <Stack.Screen name="BloodDonors" component={BloodDonorsScreen} />
    <Stack.Screen name="ReportIncident" component={ReportIncidentScreen} />
    <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
    <Stack.Screen name="ConsultationChat" component={ConsultationChatScreen} />
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
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTabIconContainerActive: {
    backgroundColor: Colors.patient,
    shadowColor: Colors.patient,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
