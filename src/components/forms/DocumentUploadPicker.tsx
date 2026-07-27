import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';

interface DocumentUploadPickerProps {
  onDocumentSelected: (file: { name: string; uri: string; type: string; size: number }) => void;
  onError?: (error: string) => void;
  label?: string;
  placeholder?: string;
  currentFile?: { name: string } | null;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
  containerStyle?: ViewStyle;
}

export const DocumentUploadPicker = memo<DocumentUploadPickerProps>(({
  onDocumentSelected,
  onError,
  label = 'Upload Document',
  placeholder = 'Upload or Snap Photo',
  currentFile,
  acceptedFormats = ['application/pdf', 'image/jpeg', 'image/png'],
  maxFileSize = 25, // 25MB default
  containerStyle,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          console.warn('Camera permission not granted');
        }
      }
    })();
  }, []);

  const handlePickDocument = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: false,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `document_${Date.now()}.jpg`;

        // Validate file format
        const fileType = asset.type === 'image' ? 'image/jpeg' : 'image/png';
        if (acceptedFormats && !acceptedFormats.includes(fileType)) {
          const error = `Invalid format. Accepted: ${acceptedFormats.join(', ')}`;
          onError?.(error);
          Alert.alert('Invalid Document', error);
          setIsLoading(false);
          return;
        }

        // Validate file size
        const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
        if (fileSizeInMB > maxFileSize) {
          const error = `File too large. Maximum: ${maxFileSize}MB`;
          onError?.(error);
          Alert.alert('File Too Large', error);
          setIsLoading(false);
          return;
        }

        onDocumentSelected({
          name: fileName,
          uri: asset.uri,
          type: fileType,
          size: asset.fileSize || 0,
        });
        setShowOptions(false);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to pick document';
      onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnapDocument = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: false,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `photo_${Date.now()}.jpg`;

        onDocumentSelected({
          name: fileName,
          uri: asset.uri,
          type: 'image/jpeg',
          size: asset.fileSize || 0,
        });
        setShowOptions(false);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to capture document';
      onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDocument = () => {
    Alert.alert('Remove Document?', 'This will clear the uploaded document.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          onDocumentSelected({
            name: '',
            uri: '',
            type: '',
            size: 0,
          });
        },
      },
    ]);
  };

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.uploadButton, currentFile && styles.uploadButtonActive]}
        onPress={() => setShowOptions(true)}
        activeOpacity={0.85}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary[600]} />
        ) : (
          <>
            <Ionicons
              name={currentFile ? 'checkmark-circle' : 'cloud-upload'}
              size={24}
              color={currentFile ? Colors.success.main : Colors.primary[600]}
            />
            <View style={styles.uploadContent}>
              <Text style={[styles.uploadTitle, currentFile && styles.uploadTitleActive]}>
                {currentFile ? 'Document Attached' : placeholder}
              </Text>
              {currentFile && (
                <Text style={styles.fileName} numberOfLines={1}>
                  {currentFile.name}
                </Text>
              )}
              {!currentFile && (
                <Text style={styles.uploadSubtitle}>
                  Choose from device or take a photo
                </Text>
              )}
            </View>
          </>
        )}
      </TouchableOpacity>

      {currentFile && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemoveDocument}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.error.main} />
          <Text style={styles.removeButtonText}>Remove Document</Text>
        </TouchableOpacity>
      )}

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity
                onPress={() => setShowOptions(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              {/* Upload PDF Option */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={handlePickDocument}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: Colors.info.light }]}>
                  <Ionicons name="image" size={28} color={Colors.info.main} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Upload Photo</Text>
                  <Text style={styles.optionDescription}>
                    Select a photo from your device (Max 25MB)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>

              {/* Snap Document Option */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={handleSnapDocument}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: Colors.secondary[100] }]}>
                  <Ionicons name="camera" size={28} color={Colors.secondary[600]} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Take Photo</Text>
                  <Text style={styles.optionDescription}>
                    Capture document with your camera
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={Colors.info.main} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Accepted Formats</Text>
                <Text style={styles.infoDescription}>
                  JPG, PNG • Max 25MB • Medical License photo required for doctor verification
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

DocumentUploadPicker.displayName = 'DocumentUploadPicker';

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary[200],
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    borderStyle: 'dashed',
    ...Shadows.xs,
  },
  uploadButtonActive: {
    borderColor: Colors.success.main,
    borderStyle: 'solid',
    backgroundColor: Colors.success.light,
  },
  uploadContent: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary[600],
  },
  uploadTitleActive: {
    color: Colors.success.main,
  },
  uploadSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
  fileName: {
    fontSize: FontSize.xs,
    color: Colors.success.main,
    marginTop: Spacing[1],
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  removeButtonText: {
    fontSize: FontSize.xs,
    color: Colors.error.main,
    fontWeight: FontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing[6],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  optionsContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    gap: Spacing[1],
  },
  optionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  optionDescription: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.info.light,
    borderRadius: BorderRadius.lg,
  },
  infoText: {
    flex: 1,
    gap: Spacing[1],
  },
  infoTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.info.main,
  },
  infoDescription: {
    fontSize: FontSize.xs,
    color: Colors.info.main,
    lineHeight: FontSize.xs * 1.4,
  },
  cancelButton: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[3],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
});
