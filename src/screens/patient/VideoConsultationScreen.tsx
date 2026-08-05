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
import { useToast } from '../../hooks/useAuth';

export default function VideoConsultationScreen({ route, navigation }: any) {
  const { doctorName } = route.params || { doctorName: 'Doctor' };
  const { success: showToastSuccess } = useToast();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking');

  // Trigger permission check on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      Alert.alert(
        'Allow Camera & Microphone Access?',
        'Omini Pulse requires camera and microphone permissions to start this secure telemedicine session.',
        [
          {
            text: "Don't Allow",
            onPress: () => setPermissionStatus('denied'),
            style: 'cancel',
          },
          {
            text: 'Allow',
            onPress: () => setPermissionStatus('granted'),
          },
        ]
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Timer simulation (only runs when permission is granted)
  useEffect(() => {
    if (permissionStatus !== 'granted') return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [permissionStatus]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            showToastSuccess('Consultation Ended', 'Your telemedicine session has completed successfully.');
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (permissionStatus === 'checking') {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Ionicons name="videocam-outline" size={48} color="#94A3B8" />
        <Text style={styles.loadingText}>Initializing secure call stream...</Text>
      </SafeAreaView>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Ionicons name="warning-outline" size={64} color="#EF4444" />
        <Text style={styles.deniedTitle}>Permissions Required</Text>
        <Text style={styles.deniedText}>
          You cannot join the video consultation without camera and microphone permissions. Please enable them in your device settings.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Simulated Doctor Feed (Main Background) */}
      <View style={styles.doctorVideoFeed}>
        {/* Mock visual placeholder for Doctor */}
        <View style={styles.doctorPlaceholder}>
          <Ionicons name="person" size={100} color="#64748B" />
          <Text style={styles.connectingText}>Live Feed Active</Text>
        </View>
        
        {/* Overlay Details */}
        <View style={styles.overlayHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.docName}>{doctorName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            </View>
          </View>
          <View style={styles.NDPABadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.NDPAText}>NDPA Secured</Text>
          </View>
        </View>
      </View>

      {/* Simulated Patient PIP (Picture in Picture Feed) */}
      {!isVideoOff ? (
        <View style={styles.pipContainer}>
          <View style={styles.pipFeed}>
            <Ionicons name="camera-reverse" size={24} color="#94A3B8" />
            <Text style={styles.selfViewText}>Self View</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.pipContainer, styles.pipOff]}>
          <Ionicons name="videocam-off" size={24} color="#64748B" />
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
            size={24}
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
            size={24}
            color={isVideoOff ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Toggle Speaker */}
        <TouchableOpacity
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
        >
          <Ionicons
            name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
            size={24}
            color={isSpeakerOn ? '#FFFFFF' : '#EF4444'}
          />
        </TouchableOpacity>

        {/* Hangup */}
        <TouchableOpacity
          onPress={handleEndCall}
          style={[styles.controlBtn, styles.hangupBtn]}
        >
          <Ionicons name="call" size={24} color="#FFFFFF" />
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
});
