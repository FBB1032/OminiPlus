'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Shield, Server, Activity, Users2, ShieldCheck, Smartphone, RefreshCw, KeyRound } from 'lucide-react';
import { useAuthStore, MOCK_ADMINS } from '@/store/authStore';
import { ROLE_LABELS, ROLE_COLORS } from '@/store/permissionStore';
import { Button } from '@/components/ui/Button';
import type { AdminRole } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

const ROLES: AdminRole[] = [
  'admin',
  'hospital_admin',
  'doctor',
  'nurse',
  'receptionist',
  'blood_officer',
  'pharmacist',
  'lab_technician',
];

const ROLE_CREDENTIALS: Record<AdminRole, { email: string; pass: string }> = {
  admin:          { email: 'admin@ominipulse.ai',        pass: 'admin123' },
  hospital_admin: { email: 'admin@xyzspecialist.ng',     pass: 'AdminPass2026!' },
  doctor:         { email: 'doctor@ominipulse.ai',       pass: 'admin123' },
  nurse:          { email: 'a.yusuf@xyzspecialist.ng',   pass: 'HospitalPass2026!' },
  receptionist:   { email: 'f.mohammed@xyzspecialist.ng', pass: 'HospitalPass2026!' },
  blood_officer:  { email: 'm.garba@xyzspecialist.ng',   pass: 'HospitalPass2026!' },
  pharmacist:     { email: 'c.okonkwo@xyzspecialist.ng', pass: 'PharmPass2026!' },
  lab_technician: { email: 'e.nnamdi@xyzspecialist.ng',  pass: 'LabPass2026!' },
};

export default function LoginPage() {
  const router = useRouter();
  const setAdmin = useAuthStore(s => s.setAdmin);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('admin');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@ominipulse.ai', password: 'admin123' },
  });

  const handleSelectRole = (role: AdminRole) => {
    setSelectedRole(role);
    setValue('email', ROLE_CREDENTIALS[role].email);
    setValue('password', ROLE_CREDENTIALS[role].pass);
  };

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    await new Promise(r => setTimeout(r, 600));

    // Determine target persona
    let roleToAssign: AdminRole = selectedRole;

    if (selectedRole === 'pharmacist' || data.email.startsWith('c.okonkwo')) {
      roleToAssign = 'pharmacist';
    } else if (selectedRole === 'lab_technician' || data.email.startsWith('e.nnamdi')) {
      roleToAssign = 'lab_technician';
    } else if (selectedRole === 'nurse' || data.email.startsWith('a.yusuf')) {
      roleToAssign = 'nurse';
    } else if (selectedRole === 'receptionist' || data.email.startsWith('f.mohammed')) {
      roleToAssign = 'receptionist';
    } else if (selectedRole === 'blood_officer' || data.email.startsWith('m.garba')) {
      roleToAssign = 'blood_officer';
    } else if (selectedRole === 'doctor' || data.email.includes('doctor')) {
      roleToAssign = 'doctor';
    } else if (selectedRole === 'hospital_admin' || data.email.includes('xyzspecialist') || data.email.includes('hospital')) {
      roleToAssign = 'hospital_admin';
    } else {
      roleToAssign = 'admin';
    }

    const presetAdmin = MOCK_ADMINS[roleToAssign] || MOCK_ADMINS.admin;
    const userToLogin = {
      ...presetAdmin,
      email: data.email,
    };

    setAdmin(userToLogin, `mock-jwt-token-${roleToAssign}`);

    if (roleToAssign === 'doctor') {
      router.push('/dashboard/doctor-portal');
    } else if (roleToAssign === 'admin') {
      router.push('/dashboard/hospitals');
    } else if (roleToAssign === 'pharmacist') {
      router.push('/dashboard/hospital-portal?tab=pharmacy');
    } else if (roleToAssign === 'lab_technician') {
      router.push('/dashboard/hospital-portal?tab=laboratory');
    } else if (roleToAssign === 'nurse') {
      router.push('/dashboard/hospital-portal?tab=wards');
    } else if (roleToAssign === 'receptionist') {
      router.push('/dashboard/hospital-portal?tab=appointments');
    } else if (roleToAssign === 'blood_officer') {
      router.push('/dashboard/hospital-portal?tab=blood');
    } else {
      router.push('/dashboard/hospital-portal');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Left Column: Visual Brand Banner (Desktop only) */}
      <div style={{
        flex: 1.2,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        color: '#FFFFFF',
      }} className="hidden lg:flex">
        
        {/* Decorative Grid Lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          pointerEvents: 'none'
        }} />

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 10 }}>
          <Image
            src="/logo.png"
            alt="Omini Pulse"
            width={340}
            height={72}
            style={{ objectFit: 'contain', height: 'auto', width: 340 }}
          />
        </div>

        {/* Feature Teasers */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 540 }}>
          <span style={{
            background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', border: '1px solid rgba(37, 99, 235, 0.25)',
            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            Enterprise Dashboard
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.03em', margin: '16px 0 20px 0' }}>
            Unified administrative systems for modern healthcare networks.
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6 }}>
            Verify credentials, audit NDPA-compliant patient operations, and supervise platform analytics with state-of-the-art role-based permissions.
          </p>

          <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
            {[
              { label: 'Operational Uptime', value: '99.98%', icon: Server },
              { label: 'Verified Providers', value: '1,800+', icon: Users2 },
              { label: 'System Vitals', value: 'Healthy', icon: Activity },
            ].map((stat, idx) => (
              <div key={idx} style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <stat.icon size={15} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{stat.label}</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700 }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Portal Info Footer */}
        <div style={{ position: 'relative', zIndex: 10, fontSize: 12, color: '#64748b' }}>
          Omini Pulse Platform Console v2.4 · Encrypted via AES-256
        </div>
      </div>

      {/* Right Column: Login Card Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px',
        background: '#f8fafc',
      }}>
        <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
          
          {/* Logo on small screens */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <Image
              src="/logo.png"
              alt="Omini Pulse"
              width={300}
              height={64}
              style={{ objectFit: 'contain', height: 'auto', width: 300 }}
            />
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Secure Console Sign In</p>
          </div>

          {/* Form Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 20,
            padding: 32,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02)'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Welcome Back</h2>
            <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 24 }}>Enter your credentials to manage platform operations</p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Role Selection Matrix */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                  Console Role Profile
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {ROLES.map((role) => {
                    const rc = ROLE_COLORS[role];
                    const active = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleSelectRole(role)}
                        style={{
                          padding: '8px 6px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: active ? 700 : 500,
                          border: active ? `1.5px solid ${rc.color}` : '1.5px solid #e2e8f0',
                          background: active ? rc.bg : '#ffffff',
                          color: active ? rc.color : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 120ms',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={`Click to fill demo credentials for ${ROLE_LABELS[role]}`}
                      >
                        {ROLE_LABELS[role]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Corporate Email</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <Mail size={16} />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="admin@ominipulse.ai"
                    className="input"
                    style={{ paddingLeft: 38, height: 42 }}
                  />
                </div>
                {errors.email && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 2 }}>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Security Password</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input"
                    style={{ paddingLeft: 38, paddingRight: 40, height: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 2 }}>{errors.password.message}</p>}
              </div>

              {serverError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: 10, borderRadius: 8 }}>
                  <p style={{ fontSize: 12, color: '#b91c1c', fontWeight: 550 }}>{serverError}</p>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isSubmitting}
                style={{ width: '100%', height: 44, fontSize: 14, fontWeight: 650, marginTop: 8 }}
              >
                Sign In as {ROLE_LABELS[selectedRole]}
              </Button>
            </form>

            {/* Active Credentials Hint */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12,
              marginTop: 16, fontSize: 12, color: '#64748b', textAlign: 'center'
            }}>
              Active Role Credentials: <strong style={{ color: '#0f172a' }}>{ROLE_CREDENTIALS[selectedRole].email}</strong> · password: <strong style={{ color: '#0f172a' }}>{ROLE_CREDENTIALS[selectedRole].pass}</strong>
            </div>

            {/* Phone & Desktop Sync / Mobile-Only Registration Notice */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1px solid #a7f3d0',
              borderRadius: 12,
              padding: 14,
              marginTop: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Smartphone size={16} style={{ color: '#059669', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Mobile-Only Account Creation
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: '#047857', lineHeight: 1.5, margin: 0 }}>
                Patient and Doctor account registration is conducted strictly via the <strong>OminiPulse Mobile App</strong> with real-time biometric and MDCN credential verification. Desktop is reserved for credentialed clinical and administrative operations.
              </p>
              <div style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid #d1fae5',
                fontSize: 11.5,
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={13} style={{ color: '#059669', flexShrink: 0 }} />
                  <strong>Unified Doctor Login:</strong>
                </span>
                <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: 4, fontWeight: 600, color: '#166534' }}>
                  doctor@ominipulse.ai / admin123
                </code>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
