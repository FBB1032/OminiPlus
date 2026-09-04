'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { Heart, Activity, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export default function DesktopSplashScreen() {
  const router = useRouter();
  const { isAuthenticated, admin } = useAuthStore();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing OminiPulse Desktop Clinical Enclave...');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle medical heart monitor beep (lub-dub)
  const playHeartBeep = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // First beep (Lub)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz standard medical pitch
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.09);

      // Second beep (Dub)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(740, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.06, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.20);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.21);
    } catch {
      // Audio context policy fallback
    }
  };

  useEffect(() => {
    // Cardiac loop interval (approx 75 bpm -> 800ms)
    const heartInterval = setInterval(() => {
      playHeartBeep();
    }, 1100);

    // Initial first heartbeat sound on mount
    const initialBeepTimer = setTimeout(() => {
      playHeartBeep();
    }, 400);

    // Progress counter and status updates
    const start = Date.now();
    const duration = 3000; // 3 seconds total splash

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const currentProgress = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(currentProgress);

      if (currentProgress < 30) {
        setStatusText('Initializing OminiPulse Desktop Clinical Enclave...');
      } else if (currentProgress < 65) {
        setStatusText('Calibrating Telemetry & Real-Time ECG Engine...');
      } else if (currentProgress < 90) {
        setStatusText('Verifying MDCN Regulatory & NDPA 2023 Security...');
      } else {
        setStatusText('Workspace Synchronized. Directing to Clinical Portal...');
      }

      if (currentProgress >= 100) {
        clearInterval(progressTimer);
        clearInterval(heartInterval);

        // Direct to clinical sign-in
        setTimeout(() => {
          router.replace('/login');
        }, 300);
      }
    }, 40);

    return () => {
      clearInterval(heartInterval);
      clearInterval(progressTimer);
      clearTimeout(initialBeepTimer);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [router, soundEnabled]);

  const handleSkip = () => {
    router.replace('/login');
  };

  return (
    <div
      onClick={() => {
        // Unlock audio context on user interaction if needed
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at center, #0e5e5e 0%, #083c3c 60%, #042424 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        userSelect: 'none',
        overflow: 'hidden',
        zIndex: 9999
      }}
    >
      <style>{`
        @keyframes cardiacPulse {
          0% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(45, 212, 191, 0.4)); }
          14% { transform: scale(1.26); filter: drop-shadow(0 0 28px rgba(45, 212, 191, 0.9)); }
          28% { transform: scale(1.08); filter: drop-shadow(0 0 16px rgba(45, 212, 191, 0.5)); }
          42% { transform: scale(1.32); filter: drop-shadow(0 0 34px rgba(45, 212, 191, 1)); }
          70% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(45, 212, 191, 0.4)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(45, 212, 191, 0.4)); }
        }
        @keyframes rippleRing {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ecgDraw {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes glowScan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Top Controls: Sound Toggle & Skip */}
      <div style={{
        position: 'absolute',
        top: 24,
        right: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 10
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSoundEnabled(!soundEnabled);
          }}
          title={soundEnabled ? 'Mute telemetry beeps' : 'Enable telemetry beeps'}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: soundEnabled ? '#5eead4' : '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 20,
            padding: '7px 16px',
            fontSize: 12,
            fontWeight: 600,
            color: '#e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Skip Intro →
        </button>
      </div>

      {/* Center Beeping Heartbeat Experience */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 36
      }}>
        {/* Ambient Expanding Wave Rings */}
        <div style={{
          position: 'absolute',
          width: 130,
          height: 130,
          borderRadius: '50%',
          border: '2px solid rgba(94, 234, 212, 0.4)',
          animation: 'rippleRing 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: 130,
          height: 130,
          borderRadius: '50%',
          border: '2px solid rgba(45, 212, 191, 0.3)',
          animation: 'rippleRing 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) 0.6s infinite',
          pointerEvents: 'none'
        }} />

        {/* Central Beeping Heart Icon */}
        <div style={{
          width: 104,
          height: 104,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(13, 148, 136, 0.15) 100%)',
          border: '2px solid rgba(94, 234, 212, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          animation: 'cardiacPulse 1.1s infinite',
          boxShadow: '0 0 35px rgba(20, 184, 166, 0.4)'
        }}>
          <Heart
            size={52}
            color="#5eead4"
            fill="#14b8a6"
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
            }}
          />
        </div>
      </div>

      {/* Dynamic ECG Waveform Strip */}
      <div style={{
        width: 320,
        height: 48,
        position: 'relative',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <svg
          viewBox="0 0 300 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d="M 0 24 L 60 24 L 75 24 L 85 8 L 95 38 L 105 14 L 115 30 L 125 24 L 190 24 L 200 24 L 210 8 L 220 40 L 230 16 L 240 28 L 250 24 L 300 24"
            stroke="#2dd4bf"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            style={{
              animation: 'ecgDraw 1.8s linear infinite',
              filter: 'drop-shadow(0 0 6px #2dd4bf)'
            }}
          />
        </svg>
      </div>

      {/* Brand Logo & Presentation */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        marginBottom: 32,
        textAlign: 'center'
      }}>
        <Image
          src="/logo.png"
          alt="OminiPulse"
          width={220}
          height={68}
          priority
          style={{
            height: 60,
            width: 'auto',
            objectFit: 'contain',
            filter: 'brightness(1.15) drop-shadow(0 4px 16px rgba(0,0,0,0.3))'
          }}
        />
        <h2 style={{
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: '#99f6e4',
          margin: 0
        }}>
          Your Intelligent Health Companion
        </h2>
      </div>

      {/* Loading Bar & Diagnostic Status */}
      <div style={{
        width: 360,
        maxWidth: '85vw',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {/* Progress Track */}
        <div style={{
          width: '100%',
          height: 6,
          background: 'rgba(255, 255, 255, 0.12)',
          borderRadius: 999,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #14b8a6, #5eead4, #99f6e4)',
            borderRadius: 999,
            transition: 'width 0.15s ease-out',
            boxShadow: '0 0 14px #2dd4bf',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
              animation: 'glowScan 1.2s infinite'
            }} />
          </div>
        </div>

        {/* Status Line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
            <Activity size={13} style={{ color: '#5eead4' }} />
            <span>{statusText}</span>
          </div>
          <span style={{ fontWeight: 700, color: '#5eead4', fontVariantNumeric: 'tabular-nums' }}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Compliance & Security Footer */}
      <div style={{
        position: 'absolute',
        bottom: 22,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.45)',
        letterSpacing: '0.02em'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <ShieldCheck size={14} color="#2dd4bf" />
          <span>MDCN Licensed Practice Verification</span>
        </div>
        <span>•</span>
        <span>NDPA 2023 Compliant Enclave</span>
      </div>
    </div>
  );
}
