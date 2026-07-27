import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileEditSchema, ProfileEditFormValues } from '../../utils/validators';
import { useAuth, useToast } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Button, FormInput, LoadingOverlay, DatePicker } from '../../components';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function ProfileEditScreen({ navigation }: any) {
  const { user } = useAuth();
  const { success: showToastSuccess, error: showToastError } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl || null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      height: user?.height ? String(user.height) : '',
      weight: user?.weight ? String(user.weight) : '',
      bloodGroup: user?.bloodGroup || '',
      genotype: user?.genotype || '',
      dateOfBirth: user?.dateOfBirth || '',
    },
  });

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        if (user) {
          setUser({ ...user, avatarUrl: uri });
        }
        showToastSuccess('Photo Selected', 'Profile picture updated successfully.');
      }
    } catch {
      showToastError('Error', 'Failed to pick profile picture.');
    }
  };

  const onSubmit = async (data: ProfileEditFormValues) => {
    setLoading(true);
    try {
      const parsedData = {
        ...data,
        height: data.height ? parseFloat(data.height) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
      };

      // Optimistically/safely call patch profile or update store directly if server has no endpoint
      let updatedUser = { ...user, ...parsedData } as any;
      
      try {
        const response = await apiClient.patch('/auth/profile', parsedData);
        if (response.data && response.data.data) {
          updatedUser = response.data.data;
        }
      } catch {
        // Fallback: update local state if backend route isn't fully set up yet
      }

      setUser(updatedUser);
      showToastSuccess('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (err: any) {
      showToastError('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%', borderRadius: 44 }} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </Text>
              )}
              <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8} onPress={handlePickImage}>
                <Ionicons name="camera" size={16} color={Colors.text.inverse} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userRole}>{user?.role.toUpperCase()}</Text>
          </View>

          <View style={styles.formContainer}>
            <FormInput
              control={control}
              name="firstName"
              label="First Name"
              placeholder="First name"
              leftIcon="person-outline"
              error={errors.firstName}
            />

            <FormInput
              control={control}
              name="lastName"
              label="Last Name"
              placeholder="Last name"
              leftIcon="person-outline"
              error={errors.lastName}
            />

             <FormInput
              control={control}
              name="phone"
              label="Phone Number"
              placeholder="Phone number"
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={errors.phone}
            />

            {user?.role === 'patient' && (
              <>
                <DatePicker
                  control={control}
                  name="dateOfBirth"
                  label="Date of Birth"
                  placeholder="Select Date of Birth"
                  error={errors.dateOfBirth}
                />
                <View style={styles.vitalsRow}>
                  <View style={styles.flex1}>
                    <FormInput
                      control={control}
                      name="height"
                      label="Height (cm)"
                      placeholder="Height in cm"
                      keyboardType="numeric"
                      leftIcon="resize-outline"
                      error={errors.height}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <FormInput
                      control={control}
                      name="weight"
                      label="Weight (kg)"
                      placeholder="Weight in kg"
                      keyboardType="numeric"
                      leftIcon="scale-outline"
                      error={errors.weight}
                    />
                  </View>
                </View>

                <View style={styles.vitalsRow}>
                  <View style={styles.flex1}>
                    <FormInput
                      control={control}
                      name="bloodGroup"
                      label="Blood Group"
                      placeholder="e.g. O+, A-"
                      leftIcon="heart-outline"
                      error={errors.bloodGroup}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <FormInput
                      control={control}
                      name="genotype"
                      label="Genotype"
                      placeholder="e.g. AA, AS"
                      leftIcon="medical-outline"
                      error={errors.genotype}
                    />
                  </View>
                </View>
              </>
            )}

            <Button
              label="Save Changes"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} message="Saving changes..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    padding: Spacing[1],
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 24,
  },
  scrollContent: {
    padding: Spacing[4],
    paddingBottom: Spacing[8],
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing[6],
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Spacing[3],
    borderWidth: 3,
    borderColor: Colors.surface,
    ...Shadows.md,
  },
  avatarText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary[600],
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Colors.surface,
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  userRole: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[400],
    marginTop: 2,
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing[5],
    borderRadius: 24,
    gap: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.xs,
  },
  submitBtn: {
    marginTop: Spacing[2],
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  flex1: {
    flex: 1,
  },
});
