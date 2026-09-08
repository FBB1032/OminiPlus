import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useToast } from '../../hooks/useAuth';

export default function VideoConsultationScreen({ route, navigation }: any) {
  const { doctorName } = route.params || { doctorName: 'Dr. Babajide Alabi' };
  const { success: showToastSuccess } = useToast();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // Auto-request camera permission on mount
  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to conclude this telemedicine consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            showToastSuccess('Consultation Ended', 'Your telemedicine session has completed successfully. Summary saved.');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Doctor Feed (Main Background) */}
      <View style={styles.doctorVideoFeed}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800' }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={styles.videoDarkOverlay} />

        {/* Top Overlay Details */}
        <View style={styles.overlayHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.docName}>{doctorName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.timerText}>{formatTime(seconds)} • HD 1080p</Text>
            </View>
          </View>
          <View style={styles.NDPABadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.NDPAText}>NDPA Secured E2EE</Text>
          </View>
        </View>

        {/* Audio Activity Waveform Indicator */}
        <View style={styles.audioWaveContainer}>
          <View style={styles.audioBadge}>
            <Ionicons name="volume-medium" size={14} color="#38BDF8" />
            <Text style={styles.audioBadgeText}>Doctor Speaking...</Text>
          </View>
        </View>
      </View>

      {/* Real Camera Picture-in-Picture (Patient Self View) */}
      {!isVideoOff && permission?.granted ? (
        <View style={styles.pipContainer}>
          <CameraView style={styles.pipCamera} facing={facing} />
          <TouchableOpacity
            style={styles.pipFlipBtn}
            onPress={toggleCameraFacing}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-reverse" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.pipContainer, styles.pipOff]}>
          <Ionicons name="videocam-off" size={24} color="#64748B" />
          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>Camera Off</Text>
        </View>
      )}

      {/* Bottom Control Bar */}
      <View style={styles.controlsBar}>
        {/* Toggle Mute */}
        <TouchableOpacity
          onPress={() => setIsMuted(!isMuted)}
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={22}
            color={isMuted ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Toggle Video */}
        <TouchableOpacity
          onPress={() => setIsVideoOff(!isVideoOff)}
          style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
        >
          <Ionicons
            name={isVideoOff ? 'videocam-off' : 'videocam'}
            size={22}
            color={isVideoOff ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Flip Camera */}
        <TouchableOpacity
          onPress={toggleCameraFacing}
          style={styles.controlBtn}
        >
          <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Toggle Speaker */}
        <TouchableOpacity
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
        >
          <Ionicons
            name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
            size={22}
            color={isSpeakerOn ? '#FFFFFF' : '#EF4444'}
          />
        </TouchableOpacity>

        {/* Hangup */}
        <TouchableOpacity
          onPress={handleEndCall}
          style={[styles.controlBtn, styles.hangupBtn]}
        >
          <Ionicons name="call" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  doctorVideoFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  connectingText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },
  overlayHeader: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 16,
    borderRadius: 16,
  },
  docName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  timerText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  pipContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  pipOff: {
    backgroundColor: '#0F172A',
  },
  pipFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  selfViewText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  controlsBar: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 35,
    paddingHorizontal: 20,
    elevation: 3,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
  },
  hangupBtn: {
    backgroundColor: '#EF4444',
    transform: [{ rotate: '135deg' }],
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },
  deniedTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  deniedText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  NDPABadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  NDPAText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  audioWaveContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
  },
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  audioBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pipCamera: {
    width: '100%',
    height: '100%',
  },
  pipFlipBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
