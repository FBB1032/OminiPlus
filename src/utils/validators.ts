import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .trim(),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .trim(),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .optional()
      .or(z.literal('')),
    role: z.enum(['doctor', 'patient'], {
      message: 'Please select your role',
    }),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character (!@#$%^&* etc.)'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms & Conditions',
    }),

    // Doctor clinical fields (optional in base object, conditionally required)
    licenseNo: z.string().optional(),
    specialty: z.string().optional(),
    hospital: z.string().optional(),
    yearsExp: z.string().optional(),
    govIdFile: z
      .object({
        uri: z.string(),
        name: z.string(),
        type: z.string(),
        size: z.number(),
      })
      .nullable()
      .optional(),
    licenseFile: z
      .object({
        uri: z.string(),
        name: z.string(),
        type: z.string(),
        size: z.number(),
      })
      .nullable()
      .optional(),
    selfieFile: z
      .object({
        uri: z.string(),
        name: z.string(),
        type: z.string(),
        size: z.number(),
      })
      .nullable()
      .optional(),
    
    // Patient physical details
    height: z.string().optional(),
    weight: z.string().optional(),
    bloodGroup: z.string().optional().or(z.literal('')),
    genotype: z.string().optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.role === 'doctor') {
      if (!data.licenseNo || data.licenseNo.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Medical license number is required',
          path: ['licenseNo'],
        });
      }
      if (!data.specialty || data.specialty.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Specialty is required',
          path: ['specialty'],
        });
      }
      if (!data.hospital || data.hospital.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Hospital/clinic is required',
          path: ['hospital'],
        });
      }
      if (!data.yearsExp || data.yearsExp.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Years of experience is required',
          path: ['yearsExp'],
        });
      } else if (isNaN(Number(data.yearsExp))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Years of experience must be a number',
          path: ['yearsExp'],
        });
      }
      if (!data.govIdFile || !data.govIdFile.uri) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Government ID document is required',
          path: ['govIdFile'],
        });
      }
      if (!data.licenseFile || !data.licenseFile.uri) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Medical license document is required',
          path: ['licenseFile'],
        });
      }
      if (!data.selfieFile || !data.selfieFile.uri) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selfie/profile photo is required',
          path: ['selfieFile'],
        });
      }
    }
    if (data.role === 'patient') {
      if (!data.height || data.height.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Height is required',
          path: ['height'],
        });
      } else if (isNaN(Number(data.height)) || Number(data.height) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Height must be a positive number',
          path: ['height'],
        });
      }
      if (!data.weight || data.weight.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Weight is required',
          path: ['weight'],
        });
      } else if (isNaN(Number(data.weight)) || Number(data.weight) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Weight must be a positive number',
          path: ['weight'],
        });
      }
      if (!data.dateOfBirth || data.dateOfBirth.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Date of birth is required',
          path: ['dateOfBirth'],
        });
      } else {
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge < 18) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Patient must be at least 18 years old',
            path: ['dateOfBirth'],
          });
        }
      }
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export type OTPFormValues = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character (!@#$%^&* etc.)'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// ─── Password Strength Helpers ────────────────────────────────────────────────

export const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export function evaluatePasswordCriteria(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    special: SPECIAL_CHAR_REGEX.test(pw),
  };
}

export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export function getPasswordStrength(pw: string): PasswordStrengthLevel {
  if (!pw) return 'weak';
  const c = evaluatePasswordCriteria(pw);
  const met = Object.values(c).filter(Boolean).length;
  if (met <= 2) return 'weak';
  if (met <= 4) return 'medium';
  return 'strong';
}

export function isPasswordStrong(pw: string): boolean {
  return getPasswordStrength(pw) === 'strong';
}

// ─── Prescription Schema ──────────────────────────────────────────────────────

export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
});

export const prescriptionSchema = z.object({
  diagnosis: z
    .string()
    .min(1, 'Diagnosis is required')
    .min(5, 'Diagnosis must be at least 5 characters'),
  medications: z
    .array(medicationSchema)
    .min(1, 'At least one medication is required'),
  instructions: z.string().optional(),
  followUpDate: z.string().optional(),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

// ─── Profile Edit Schema ───────────────────────────────────────────────────────

export const profileEditSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').trim(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').trim(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  height: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Height must be a positive number',
    }),
  weight: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Weight must be a positive number',
    }),
  bloodGroup: z.string().optional().or(z.literal('')),
  genotype: z.string().optional().or(z.literal('')),
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const birthDate = new Date(val);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        return calculatedAge >= 18;
      },
      { message: 'Patient must be at least 18 years old' }
    ),
});

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

// ─── Book Appointment Schema ──────────────────────────────────────────────────

export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  date: z.string().min(1, 'Date is required'),
  slot: z.string().min(1, 'Time slot is required'),
  type: z.enum(['in_person', 'video', 'phone'], {
    message: 'Appointment type is required',
  }),
  reason: z
    .string()
    .min(1, 'Reason for appointment is required')
    .min(10, 'Reason must be at least 10 characters')
    .trim(),
});

export type BookAppointmentFormValues = z.infer<typeof bookAppointmentSchema>;

