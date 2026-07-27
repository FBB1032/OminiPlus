import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../theme';

interface AccessDeniedProps {
  onBack?: () => void;
  message?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onBack, message }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={64} color={Colors.error.main} />
        </View>
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.message}>
          {message || 'You do not have the required permissions to view this record or resource.'}
        </Text>
        {onBack && (
          <TouchableOpacity style={styles.button} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
    gap: Spacing[4],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.error.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSize.sm * 1.5,
    maxWidth: 280,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.lg,
    marginTop: Spacing[4],
  },
  buttonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: '#FFF',
  },
});
