# Password Recovery Flow + Registration Enhancement + Social Login — Implementation Plan

## 1. Repo Research Conclusion

### Tech Stack
- **Framework:** Expo 54 (React Native 0.81.5) with TypeScript
- **Navigation:** React Navigation v7 (Native Stack + Bottom Tabs)
- **Forms:** React Hook Form v7 + Zod v4 resolvers
- **State:** Zustand v5 stores (`authStore`, etc.)
- **Styling:** StyleSheet + custom theme (`src/theme/*`)
- **Icons:** `@expo/vector-icons` Ionicons

### Existing Auth Flow (Current State)
- Navigator path: [AuthNavigator.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/navigation/AuthNavigator.tsx#L14-L28)
  - `Login` → `Register` → `ForgotPassword` → `OTPVerification` → `PendingApproval`
- [OTPVerificationScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/features/auth/screens/OTPVerificationScreen.tsx) — Combines **both** OTP entry AND new-password entry in a single screen via internal `step` state (`'otp' | 'password'`). No separation, no transition confirmation screen.
- [ForgotPasswordScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/features/auth/screens/ForgotPasswordScreen.tsx#L37-L49) — Sends email, then navigates to `OTPVerification` with `mode: 'reset'`.

### Password Strength Infrastructure
- [PasswordInput.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/forms/PasswordInput.tsx) — **Already exists** with:
  - `calculateStrength()` → `'weak' | 'fair' | 'good' | 'strong'`
  - Color-coded 4-bar meter: error.red / warning.yellow / info.blue / success.green
  - Requirements checklist (5 criteria: length, uppercase, lowercase, number, special)
  - Exported via [components/index.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/index.ts#L28)
- **Problem:** Neither `RegisterScreen` nor the reset-password portion of `OTPVerificationScreen` uses `PasswordInput`. They use plain `FormInput` with `isPassword` flag.

### OTP Component
- [OTPInput.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/forms/OTPInput.tsx) — 6 separate digit boxes, already filters non-numeric via `/\D/g`, auto-advances focus. No auto-submit callback; no 60s cooldown prop exposed.

### Validators (Zod schemas)
- [validators.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/utils/validators.ts)
  - `registerSchema.password` → min **6** chars (needs upgrade to 8 + complexity + "strong" threshold block).
  - `resetPasswordSchema.newPassword` → min 8, uppercase regex, number regex. **Missing:** lowercase check, special-char check.
  - `otpSchema` → exists with exact 6-digit regex.

### Auth Store
- [authStore.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/store/authStore.ts) — No OTP-verified session flag. Will need transient (in-memory only) state to guard password-reset screen.

### Navigation Types
- [navigation.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/types/navigation.ts#L6-L12) — `AuthStackParamList` has no post-OTP success screen and no separate ResetPassword screen.

### Social Login
- **Not implemented.** No `@react-native-google-signin` or `@invertase/react-native-apple-authentication` packages installed. Since backend is out of scope, we'll implement **mock handlers** with official SVG-based brand buttons.

---

## 2. Files & Modules to Be Edited / Created

### New Files to Create
| File | Purpose |
|------|---------|
| `src/features/auth/screens/ResetPasswordSuccessScreen.tsx` | Post-OTP success transition screen (confirms verification, CTA to reset) |
| `src/features/auth/screens/ResetPasswordScreen.tsx` | Standalone password reset screen with access gating |
| `src/components/auth/SocialLoginButtons.tsx` | Shared Google + Apple sign-in button component (reused by Login + Register) |

### Files to Modify
| File | Changes |
|------|---------|
| `src/types/navigation.ts` | Add `ResetPasswordSuccess`, `ResetPassword` routes to `AuthStackParamList`; update param signatures |
| `src/navigation/AuthNavigator.tsx` | Register two new screens in the stack; wire params |
| `src/store/authStore.ts` | Add transient `otpVerifiedForReset: boolean` + actions `setOtpVerified()` / `clearOtpVerified()` (NOT persisted to storage) |
| `src/utils/validators.ts` | Upgrade `registerSchema.password` to full complexity; complete `resetPasswordSchema` with lowercase + special char; add helper `isPasswordStrong()` |
| `src/components/forms/OTPInput.tsx` | Add optional `onComplete?: (code: string) => void` callback for auto-submit when 6 digits filled; add cooldown-aware resend helper props if needed |
| `src/features/auth/screens/OTPVerificationScreen.tsx` | **Simplify to OTP-only step.** Add auto-submit via `onComplete`, 60s resend cooldown timer. On success: set authStore flag + navigate to `ResetPasswordSuccess`. Remove embedded new-password UI (moved to standalone screen). |
| `src/features/auth/screens/ForgotPasswordScreen.tsx` | Clear `otpVerifiedForReset` flag on entry; minor navigation params |
| `src/features/auth/screens/RegisterScreen.tsx` | Replace plain `FormInput` password field with `PasswordInput` (strength meter + requirements); disable submit until strength ≥ `strong`; wire error messages |
| `src/features/auth/screens/LoginScreen.tsx` | Append `<SocialLoginButtons />` below the Sign In button and above the footer |
| `src/components/index.ts` | Export `SocialLoginButtons` |

### Dependency Note (Frontend-Only Mock)
- **No new packages required.** Google & Apple logos will be rendered as inline SVG paths using `react-native-svg` (already in `package.json`). OAuth flows will show a toast like "Google Sign-In (mock — backend integration pending)" — no native SDKs installed yet.

---

## 3. Step-by-Step Modification Plan

### Phase A — Navigation & Session-State Foundation
A1. **Update [navigation.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/types/navigation.ts#L6-L12)**
   - Add routes:
     - `ResetPasswordSuccess: { email: string }`
     - `ResetPassword: { email: string }`
   - Keep `OTPVerification: { email: string; mode: 'reset' | 'verify' }` (still used for email-verify during register too).

A2. **Update [AuthNavigator.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/navigation/AuthNavigator.tsx#L14-L28)**
   - Import + register 2 new screens:
     ```
     Stack.Screen name="ResetPasswordSuccess"
     Stack.Screen name="ResetPassword"
     ```
   - Order: `ForgotPassword → OTPVerification → ResetPasswordSuccess → ResetPassword → (back to Login)`

A3. **Update [authStore.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/store/authStore.ts#L1-L97)**
   - Add interface fields:
     - `otpVerifiedForReset: boolean`
     - `resetEmail: string | null`
   - Add actions:
     - `setOtpVerifiedForReset: (email: string) => void` → sets both flags to true + email
     - `clearOtpVerifiedForReset: () => void` → resets both
   - **Critical:** Do NOT persist these values to AsyncStorage/SecureStore. Keep in-memory only so deep-link or app-restart loses the grant automatically.
   - Initialize both to `false` / `null`.

---

### Phase B — Validator Upgrade (Consistent Password Strength)
B1. **Update [validators.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/utils/validators.ts#L20-L246)**
   - **`registerSchema.password`:** Change `min(6, …)` → `min(8, 'Password must be at least 8 characters')` and append regex rules:
     - `.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')`
     - `.regex(/[a-z]/, 'Password must contain at least one lowercase letter')`
     - `.regex(/[0-9]/, 'Password must contain at least one number')`
     - `.regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character (!@#$%^&* etc.)')`
   - **`resetPasswordSchema.newPassword`:** Add missing lowercase and special-char regexes (currently only uppercase + number). Align exact wording with register schema.
   - Add a standalone helper export:
     ```ts
     export const PASSWORD_STRONG_THRESHOLD = 4; // criteria met required to "strong"
     export function evaluatePasswordCriteria(pw: string) {
       return {
         length: pw.length >= 8,
         upper: /[A-Z]/.test(pw),
         lower: /[a-z]/.test(pw),
         number: /\d/.test(pw),
         special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
       };
     }
     export function isPasswordStrong(pw: string): boolean {
       const c = evaluatePasswordCriteria(pw);
       return Object.values(c).filter(Boolean).length >= 5; // all 5 criteria = strong
     }
     ```
   - These match the logic already baked into `PasswordInput.tsx` criteria list.

---

### Phase C — OTP Screen Enhancement (60s cooldown, auto-submit, separation)
C1. **Update [OTPInput.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/forms/OTPInput.tsx#L13-L70)**
   - Add optional prop: `onComplete?: (code: string) => void`
   - In `handleChange`, after `onChange(newVal)`:
     ```ts
     if (newVal.length === length && onComplete) {
       // defer one tick to allow state paint, then fire
       setTimeout(() => onComplete(newVal), 50);
     }
     ```

C2. **Rewrite [OTPVerificationScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/features/auth/screens/OTPVerificationScreen.tsx#L1-L203)**
   - **Remove** internal `step` state + `'password'` branch entirely (UI moves to `ResetPasswordScreen`).
   - Add state:
     ```ts
     const [cooldown, setCooldown] = useState(0); // seconds remaining
     const canResend = cooldown === 0;
     ```
   - Add a `useEffect` timer that ticks `setCooldown(c => Math.max(0, c-1))` every 1000ms when `cooldown > 0`. Cleanup clearInterval on unmount.
   - On successful `mode === 'reset'` verification (mock for now):
     - Call `authStore.getState().setOtpVerifiedForReset(email)`
     - Show success toast
     - `navigation.replace('ResetPasswordSuccess', { email })`
   - On resend click:
     - Only if `canResend`
     - Call `handleResendOTP()` (existing)
     - Set `setCooldown(60)` immediately regardless of mock result (UX requirement)
   - Pass `onComplete={handleVerifyOTP}` to `<OTPInput>` so 6th digit triggers submission.
   - Disable Verify button during cooldown? No — keep button enabled always; only resend is blocked.
   - Update resend UI text to `Didn't receive code? ${canResend ? 'Resend' : \`Resend in ${cooldown}s\`}` and conditionally grey-out the resend link text when `!canResend`.

---

### Phase D — New Screens (ResetPasswordSuccess + ResetPassword with Guard)
D1. **Create `ResetPasswordSuccessScreen.tsx`**
   - Props: `AuthScreenProps<'ResetPasswordSuccess'>` → receives `email` via route.
   - UI layout mirrors existing card-based screens:
     - Centered hero icon (`Ionicons name="checkmark-done-circle"` size 72, color success green)
     - Title: "Email Verified!"
     - Subtitle: "Your OTP has been confirmed. You can now set a new secure password for your account."
     - Primary blue CTA button: "Continue to Reset Password" → `navigation.navigate('ResetPassword', { email })`
     - Subtle secondary link: "Back to Login" → `navigation.replace('Login')` (also calls `clearOtpVerifiedForReset`)
   - No form, no keyboard handling needed.

D2. **Create `ResetPasswordScreen.tsx`**
   - **Access Guard (mount-time check):** Wrap content with a render-time gate:
     ```tsx
     const { otpVerifiedForReset, resetEmail } = useAuthStore();
     const guardEmail = route.params?.email ?? resetEmail;
     const hasAccess = otpVerifiedForReset && !!guardEmail;

     useEffect(() => {
       if (!hasAccess) {
         // Unauthorized access attempt — bounce to ForgotPassword
         showToastError('Access Restricted', 'Please verify your email first.');
         navigation.replace('ForgotPassword');
       }
     }, [hasAccess]);

     if (!hasAccess) {
       return <LoadingOverlay visible message="Verifying access..." />;
     }
     ```
   - Form uses `useForm<ResetPasswordFormValues>` with `zodResolver(resetPasswordSchema)`.
   - Render **two `PasswordInput` components:**
     - `name="newPassword"` → `showStrengthMeter showRequirements`
     - `name="confirmPassword"` → `showStrengthMeter={false} showRequirements={false}`
   - Additionally, enforce **"strong only" submit gating:**
     - Subscribe to `watch('newPassword')` from react-hook-form
     - Disable the "Reset Password" `<Button>` with `disabled={!isPasswordStrong(newPwValue)}`
     - Show inline helper text below meter when not strong: "Password must meet all 5 criteria before you can continue."
   - On submit success (mock):
     - `authStore.getState().clearOtpVerifiedForReset()`
     - Toast + `navigation.replace('Login')`
   - Add back button top-left: goes back to `ResetPasswordSuccess` (not direct logout).

---

### Phase E — Register Screen: Password Strength Integration
E1. **Edit [RegisterScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/features/auth/screens/RegisterScreen.tsx#L360-L380)**
   - Import `PasswordInput` from components and `isPasswordStrong` from validators.
   - Replace the password `FormInput` block (line ~360) with:
     ```tsx
     <PasswordInput
       control={control}
       name="password"
       label="Password"
       placeholder="At least 8 chars with uppercase, lowercase, number & special symbol"
       error={errors.password}
       showStrengthMeter
       showRequirements
     />
     ```
   - Keep confirm-password as `FormInput isPassword` (no strength meter needed there, but if time permits, swap for `PasswordInput` with both meter flags false for visual consistency — optional).
   - **Submit-blocking:** Grab `const pwWatch = watch('password');`
     - Pass `disabled={!isPasswordStrong(pwWatch)}` to the primary "Sign Up" button.
     - Below the password requirements, conditionally render a small warning text:
       ```tsx
       {pwWatch && !isPasswordStrong(pwWatch) && (
         <Text style={styles.weakPwHint}>Please create a strong password that meets all criteria above.</Text>
       )}
       ```
   - Add `weakPwHint` style entry: `fontSize xs, color warning.main, marginTop 2`.

---

### Phase F — Social Login Buttons (Login + Register)
F1. **Create `SocialLoginButtons.tsx`**
   - Props: `{ variant?: 'login' | 'register'; onGoogle?: () => void; onApple?: () => void; }`
   - Default handlers if not provided:
     ```ts
     const { showToastInfo } = useToast(); // extend toast hook or use existing success with info tone
     const defaultGoogle = () => showToastInfo('Coming Soon', 'Google Sign-In will be available with backend integration.');
     const defaultApple  = () => showToastInfo('Coming Soon', 'Apple Sign-In will be available with backend integration.');
     ```
   - **Google Button (white bg, grey border):**
     - Min height 56, borderRadius 14, borderWidth 1 borderColor `#E2E8E8`
     - Inline SVG Google "G" logo via `Svg` + `Path` from react-native-svg (official 2024 brand mark, 24x24)
     - Label: `variant === 'login' ? 'Continue with Google' : 'Sign up with Google'`, `fontWeight 600`, text color `#1E2A2A`
     - `hitSlop 4` on `TouchableOpacity`, so effective touch ≥ 48dp
   - **Apple Button (black bg, no border):**
     - Min height 56, borderRadius 14, backgroundColor `#000000`
     - Inline SVG Apple logo (white fill, 24x24) — Apple official SF Symbols-style path
     - Label: same pattern, white text
     - Same hitSlop / accessibility sizing
   - Spacing: `gap: Spacing[3]` between the two buttons, wrapped in a `<View style={{ marginTop: Spacing[5], gap: Spacing[3] }}>`.
   - Add vertical "OR" divider above buttons for visual separation from email/password form:
     ```
      ───── OR ─────
     ```
     (thin horizontal lines + centered text)

F2. **Export in [components/index.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/index.ts#L1-L35)**
   - Append: `export { SocialLoginButtons } from './auth/SocialLoginButtons';`

F3. **Integrate into [LoginScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/features/auth/screens/LoginScreen.tsx#L110-L128)**
   - Insert `<SocialLoginButtons variant="login" />` **between** the primary `<Button label="Sign In" />` and the `<View style={styles.footerContainer}>` (above "Don't have an account?").

F4. **Integrate into [RegisterScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/features/auth/screens/RegisterScreen.tsx#L441-L459)**
   - Insert `<SocialLoginButtons variant="register" />` **between** the primary `<Button label="Sign Up" />` and the `<View style={styles.footerContainer}>`.

---

### Phase G — Polishing & Cross-Cutting
G1. **Update ForgotPasswordScreen.tsx**
   - On mount (`useEffect []`), call `authStore.getState().clearOtpVerifiedForReset()` so re-starting the flow invalidates prior OTP grants.

G2. **Color palette alignment**
   - Per the user's requirement for three-tier colors:
     - Weak = red → `Colors.error.main`
     - Medium = yellow → `Colors.warning.main`
     - Strong = green → `Colors.success.main`
   - `PasswordInput.tsx` currently maps 4 bars + 4 labels (weak / fair / good / strong). Re-label/alias in the UI so we expose the 3 requested levels:
     - Update the strength label map:
       ```ts
       strength === 'weak'          => label 'Weak',    Colors.error.main
       strength === 'fair'          => label 'Medium',  Colors.warning.main
       strength === 'good' || 'strong' => label 'Strong', Colors.success.main
       ```
     - Update bar opacity logic to reflect 3 tiers effectively.
   - This is a **surgical edit** inside `PasswordInput.tsx` only (no external API breakage).

G3. **Accessibility checks**
   - All `TouchableOpacity` for social/buttons get `accessibilityRole="button"`, `accessibilityLabel`, and minimum 48x48 frame (already enforced via min height 56 + hitSlop).
   - OTP digit inputs have `keyboardType="number-pad"` already — confirm no paste-in of letters on iOS.

---

## 4. Dependencies & Considerations

| Dependency | Status | Action |
|-----------|--------|--------|
| `react-native-svg` | ✅ Already installed (`15.12.1`) | Use for inline Google/Apple SVG logos — no extra packages needed |
| `@react-native-google-signin` | ❌ Not installed | **Skip install (frontend-only scope).** Wire mock `onPress` handlers. Plan explicitly calls out: "All this are just the frontend, no backend yet" — so we implement UI + mock toasts only. |
| `@invertase/react-native-apple-authentication` | ❌ Not installed | Same as above — UI only, placeholder handler |
| `zod`, `react-hook-form` | ✅ Installed | Validator schema upgrades only |
| `zustand` | ✅ Installed | Add transient fields to authStore, skip persistence |
| Expo 54 deps | ✅ Compatible | All changes use standard RN |

### Design Constraints
- Mobile-only: target screens 5" to 6.7".
- Use existing `Spacing`, `Colors`, `FontSize`, `FontWeight`, `Shadows`, `BorderRadius` tokens exclusively. Do not hardcode new colors.
- Use `SafeAreaView` + `KeyboardAvoidingView` pattern consistent with existing screens.
- ScrollView `keyboardShouldPersistTaps="handled"` on every form screen.

### Security (Frontend)
- **Access guard principle:** `ResetPasswordScreen` MUST check the transient `authStore.otpVerifiedForReset` on every render and on mount. If user force-kills the app, flag defaults to false → redirected. This blocks deep-link/manual navigation as required.
- **Do not** store OTP or OTP-verified flag in AsyncStorage. Keeps the boundary tight.
- Passwords in plaintext are never logged; avoid debugging `console.log` on form values.

---

## 5. Risk Handling

| Risk | Severity | Mitigation |
|------|----------|------------|
| Zod schema upgrade breaks existing register tests / manual flow | Medium | Keep `superRefine` doctor/patient validations intact; only change the `password` field inside `registerSchema`. Run TypeScript compiler to surface breakage before runtime. |
| ResetPassword guard fails to block deep links on Android/iOS | Medium | Use BOTH `useEffect` redirect AND conditional render of form content. Redirect fires first, render gate is fallback. |
| 60s cooldown drifts or doesn't clear on unmount | Low | Use `useRef<NodeJS.Timeout>` for interval; clear in both cleanup and on any successful navigation. Fire-and-forget `setCooldown(60)` on user press to guarantee UX state even if API call fails. |
| Social login layout breaks on small 5" screens | Low | Enforce `ScrollView` everywhere socials are embedded. Set `minHeight` instead of `height` so text can wrap if needed (use `flexShrink 1` on label text + `numberOfLines={1}` `adjustsFontSizeToFit`). |
| PasswordInput "strong" label mismatch vs validator's 5-criteria rule | Low | Refactor `PasswordInput`'s internal `calculateStrength` to reuse the SAME `evaluatePasswordCriteria()` from validators. Export and import the function — one source of truth. |
| `PasswordInput` typing breaks when swapped into `RegisterScreen` | Medium | Register's `control` is typed for `RegisterFormValues`, which has `password` as a key. `PasswordInput<T>` is generic over `FieldValues` — passing `control={control} name="password"` should resolve correctly. If TS complains, cast via `as any` locally as a last-resort narrow escape. |

---

## 6. Verification Checklist (After Implementation)

### Navigation Flows
- [ ] Login → "Forgot Password?" → ForgotPasswordScreen loads and clears stale OTP flag.
- [ ] Enter email → "Send OTP" → OTPVerificationScreen with mode=reset.
- [ ] OTPVerification:
  - [ ] Digits 0-9 only accepted; letters pasted/smart-typed are stripped.
  - [ ] Typing 6th digit triggers auto-submit within 50ms.
  - [ ] "Resend" link is disabled+grey for 60s after press; timer counts down 60→0; re-enables correctly.
- [ ] After OTP verify → ResetPasswordSuccess screen shows checkmark + CTA.
- [ ] CTA → ResetPassword screen (loads only if guard passes).
- [ ] Direct deep-link / hard nav to ResetPassword: bounces back to ForgotPassword with toast.
- [ ] Password set successfully → back to Login; guard flag is cleared.

### Password Strength
- [ ] Register: typing password updates meter in real-time (red/yellow/green + Weak/Medium/Strong label).
- [ ] Register: "Sign Up" is disabled until all 5 criteria are true.
- [ ] Register: visible list of 5 criteria with ✓/✗ below password.
- [ ] ResetPassword: identical behavior to register strength meter.
- [ ] Zod schemas reject submissions that fail any of the 5 criteria with readable messages.

### Social Login
- [ ] Login screen shows OR divider + Google + Apple buttons with official logos.
- [ ] Register screen shows same below Sign Up button.
- [ ] Buttons have min 56px height + hitSlop so 48x48dp touch target is met.
- [ ] Tap either button → toast "Coming Soon" + provider info (no crash, no native hang).
- [ ] No layout overflow on 5" screen test (scrolled view accommodates).

### TypeScript & Build
- [ ] `npx tsc --noEmit` passes with 0 errors in `src/`
- [ ] Expo Metro build: `npm.cmd start` loads with no bundler errors (can smoke-test with web target `npm.cmd run web` if device not available).
