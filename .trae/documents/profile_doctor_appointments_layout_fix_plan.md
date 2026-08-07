# Patient Profile, Doctor Appointments & Patient Cards — Layout Fix & Enhancement Implementation Plan

## 1. Repo Research Conclusion

### Current State & Identified Layout Issues

#### A. Patient Profile Screen — Requirement #1
- **File:** [PatientProfileScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/screens/patient/PatientProfileScreen.tsx#L80-L229)
- **Reference screenshot structure (target for implementation):**
  ```
  ┌─────────────────────────────────────────┐
  │ < back                 Profile          │  (Top nav header)
  ├─────────────────────────────────────────┤
  │ ⭕ avatar   Firstname Lastname          │
  │            email@address.com            │  (Hero card, horizontally stacked)
  ├─────────────────────────────────────────┤
  │ Account                                 │  (Section header label)
  │ 👤 Manage Profile                    >  │
  │ 🆔 Personal Information              >  │
  ├─────────────────────────────────────────┤
  │ Preferences                             │  (Section header label)
  │ 🔔 Notifications                     >  │
  │ 🌐 Language Settings                 >  │
  │ 🌗 Theme (Light/Dark)                >  │
  ├─────────────────────────────────────────┤
  │ Security                                │  (Section header label)
  │ 🔒 Change Password                   >  │
  └─────────────────────────────────────────┘
  (bottom tab bar: Home / Chat / [+] / Shop / Profile)
  ```
- **Current issues vs. design:**
  1. ❌ No navigation back button in header (this is a bottom-tab root screen — acceptable per standard mobile UX, but add `< Home` CTA option inside hero as optional)
  2. ❌ Single flat ungrouped 10-item action list — no section grouping. Reference has 3 clearly labeled groups: Account, Preferences, Security.
  3. ❌ Missing section-level headers: "Account", "Preferences", "Security" labels above each group with uppercase/secondary styling (like the `styles.sectionTitle` pattern used for "Health Information")
  4. ❌ Action items include: Medication Reminders, Chronic Disease Tracker, Wearables, Device Compatibility, Access Logs, Prescriptions — these **do not fit into the 3 required sections**. Resolution: add a 4th section "Health & Records" after Preferences / before Security, OR keep them under Account. Plan: use **4 sections** — align to screen architecture:
     - Account (Manage Profile + Personal Info + Prescription History + Consent Mgmt)
     - Health & Records (Chronic Disease + Medication Reminders + Access Logs + Wearables + Device Compatibility)
     - Preferences (Notifications + Language + Theme + Settings)
     - Security (Change Password placeholder — via auth flow reuse)
  5. ❌ Avatar card does not match the reference. Reference shows: circular avatar left-aligned; patient name + email **to the right of avatar** in a horizontal row. Currently the entire profile card has avatar, name, email **vertically centered and stacked**. Also reference avatar has no camera edit badge visible on the hero (camera is present on "Manage Profile" screen instead).
  6. ❌ Health Information card (Age/Height/Weight/BMI/BloodGroup/Genotype) does not exist in reference screenshot but IS a core medical requirement for OminiPulse (NDPA EHR). Plan: **keep it** and place it as "Medical / Clinical" section between Account and Preferences.
  7. ❌ Contact details row (phone, address) is missing — current screen displays `email` only inside hero card. Add "Contact Details" group (2 rows: email + phone) within Personal Info section or as part of hero.
  8. ❌ "Sign Up with Google / Apple" socials do not belong on profile. Logout button remains (as per current).
  9. ❌ Emergency Contact Support card — keep it, reposition to bottom before logout.

#### B. Doctor-Side Appointment Management Screen — Requirement #2
- **File:** [AppointmentsScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/screens/doctor/AppointmentsScreen.tsx#L49-L284)
- **Identified overflow issues:**
  1. ❌ 3-button row `styles.actionsRow` (Decline / Reschedule / Approve) with `height: 40` and `flex:1` each — button labels are 10 chars each ("Decline / Cancel" = 16 chars!) — on narrow 360dp viewport, text **will truncate or push past the button border**. Labels like "Decline / Cancel" are too long for 3 equal flex-1 buttons on phone.
  2. ❌ `actionBtnText` fontSize FontSize.sm (14pt) + bold + paddingHorizontal Spacing[2] inside `height: 40` — no `flexShrink: 1`, no `numberOfLines={1}` on button `Text`. Text will silently enlarge button beyond height, bleed into row below or clip horizontally.
  3. ❌ Join Video Call button + 3-row actions + Prescription button + Chat button — all stacked vertically with `height:40` each → total button area when scheduled/approved = 5 × 40 = 200px inside the card. Card overall needs padding. On landscape / smaller font scales OK; on some widths with long patient name + status badge in header, header row can compress.
  4. ❌ `styles.statusBadge` paddingHorizontal: Spacing[2] (8px) + status.toUpperCase() long labels ("SCHEDULED" 9 chars) — status badge **pushes into `headerInfo` `flex:1` area**, causing patient name to truncate to 2–3 chars and ellipsize. Status badge needs explicit `maxWidth` + `flexShrink:0`, and `patientName` needs `flexShrink:1`, `numberOfLines:1`, `ellipsizeMode:'tail'`.
  5. ❌ `styles.reasonText` / `styles.notesText` have no `numberOfLines` ceiling — long doctor-written notes / reasons of 500+ chars expand `cardBody` so tall that action buttons scroll out of view.
  6. ❌ `actionsRow` uses `flexDirection:'row' gap:Spacing[3] (12px)` — buttons with no icon-label wrap, no icon-only fallback. On <340 dp viewport (small phones, large system font) each button label overflows its container.
  7. ❌ Button Text does not use `adjustsFontSizeToFit` + `minimumFontScale` — no responsive scaling for long strings / large accessibility font sizes.

#### C. Doctor-Side Patient Card Components — Requirement #3
- **Files:**
  - [PatientListItem.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/list-items/PatientListItem.tsx#L55-L95)
  - [DoctorAppointmentItem.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/list-items/DoctorAppointmentItem.tsx#L68-L146)
- **Identified overflow issues:**
  1. ❌ `PatientListItem` `styles.details` uses `flexWrap: 'wrap'` OK but `styles.detailText` (font xs) + dot pattern + long blood group "Blood: AB Negative" etc. wraps but the right chevron icon column (20dp) eats into space — no explicit `flex:1` and `flexShrink:1` on details row. On some devices the email row bleeds past the chevron.
  2. ❌ `PatientListItem` `styles.name` has no `numberOfLines:1`, no `flexShrink:1` — hyphenated surname + middle name will push email and chevron.
  3. ❌ `PatientListItem` `styles.email` has `numberOfLines:1` but no `ellipsizeMode:'middle'` — long work emails (common in clinical) truncate at end so we lose the domain instead of username portion.
  4. ❌ `DoctorAppointmentItem` `prescriptionBtn` and `actionBtn` same problem as AppointmentsScreen. This reusable card **is not currently consumed by AppointmentsScreen** which implements its own inline layout — we should refactor AppointmentsScreen to **reuse DoctorAppointmentItem** as the canonical source (single fix location, then both stay consistent), extending its API (add reschedule, video call join, consult chat callbacks).
  5. ❌ Both cards do not have `overflow: 'hidden'` set at container level — edge cases (avatars with external URLs loading oversized assets, chevrons, rounded corners) do not clip.

#### D. Responsive Cross-Viewport Testing — Requirement #4
- **Expo React Native Mobile App:** Note on scope — user request mentions "desktop, tablet, mobile viewports" → implemented via:
  - `useWindowDimensions` width breakpoints (360 / 600 / 840 / 1024 dp)
  - `flexWrap: 'wrap'` + `flexShrink:1` + `numberOfLines` caps + `adjustsFontSizeToFit` everywhere
  - Tablet width: wider left spacer, `maxWidth: 720` center column so cards don't stretch infinitely on 12" tablets
  - Accessibility: check with font scaling via Settings → accessibility larger text to ensure buttons don't break.

---

## 2. Files & Modules to Be Edited / Created

### Files to Modify
| File | Purpose |
|------|---------|
| `src/screens/patient/PatientProfileScreen.tsx` | Redesign to grouped sections (Account / Medical History / Health & Records / Preferences / Security). Refactor hero card to horizontal avatar-left + name/email-right. Add Contact Details block, proper chevron separators, spacing, `overflow:'hidden'` card containers. |
| `src/screens/doctor/AppointmentsScreen.tsx` | Fix inline appointment card layout issues: status badge maxWidth, patient name flexShrink, button `numberOfLines` and `adjustsFontSizeToFit`, icon-only fallback on <340dp, action rows wrap to 2 rows for narrow widths, prescription/chat buttons. Refactor callbacks into reusable functions, add `contentContainer gap` to `card`, enforce `overflow:'hidden'` + borderRadius clipping. **Optional but strongly recommended:** migrate inline render to reuse `DoctorAppointmentItem` + extend that component's API so fixes apply once globally. This plan takes the reusable-component approach. |
| `src/components/list-items/PatientListItem.tsx` | Add `flexShrink` to name/email/detail, `numberOfLines` ceiling, `ellipsizeMode:'middle'` on email, `overflow:'hidden'` on container, consistent spacing, minimum 48x48 tap target (enlarge row height to >= 56), fix chevron alignment. |
| `src/components/list-items/DoctorAppointmentItem.tsx` | Expand API to include all AppointmentScreen callbacks: onDecline, onReschedule, onApprove, onJoinVideo, onChat, onViewChatHistory, showDecline, user. Re-layout all buttons with icon-only / icon+label selection per breakpoint, use `flexWrap: 'wrap'` in action rows, `numberOfLines`, `adjustsFontSizeToFit`, status badge maxWidth, patient header flexShrink, `overflow:'hidden'`, `borderRadius:16`, content gap, lineHeight & clipping on reason/notes. |
| `src/components/list-items/index.ts` | No change needed unless new types exported — re-verify exports. |

### Files NOT Modified / Left Intact
- PatientNavigator / DoctorNavigator: routes stay the same.
- useDoctor, useAuth hooks: layout changes only.
- AccessLogsScreen, ConsentManagementScreen: navigated to but not modified.
- Shared `Avatar` component — not part of overflow fix scope; assumed functional.

---

## 3. Step-by-Step Modification Plan

### Phase A — Patient Profile Page Redesign (per Reference Design)

**A1. Restructure `actionItems` into grouped sections** in [PatientProfileScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/screens/patient/PatientProfileScreen.tsx#L27-L78).

Replace flat array with:
```ts
type Section = {
  header: string;
  items: { icon; label; screen?; onPress: () => void }[];
};

const sections: Section[] = [
  {
    header: 'Account',
    items: [
      { icon: 'person-outline',          label: 'Manage Profile',           onPress: () => navigation.navigate('ProfileEdit') },
      { icon: 'newspaper-outline',       label: 'Personal Information',     onPress: () => navigation.navigate('ProfileEdit') },
      { icon: 'document-text-outline',   label: 'Prescription History',     onPress: () => navigation.navigate('PrescriptionHistory') },
      { icon: 'lock-closed-outline',     label: 'Consent Management',       onPress: () => navigation.navigate('ConsentManagement') },
    ],
  },
  {
    header: 'Medical History',
    items: [], // this section is rendered via a separate <View> (the Health Information card with Age/Height/Weight/BMI/Blood Group/Genotype)
  },
  {
    header: 'Health & Records',
    items: [
      { icon: 'fitness-outline',        label: 'Chronic Disease Tracker',  onPress: () => navigation.navigate('ChronicDisease') },
      { icon: 'alarm-outline',          label: 'Medication Reminders',     onPress: () => navigation.navigate('MedicationReminders') },
      { icon: 'eye-outline',            label: 'Who Viewed My Records',    onPress: () => navigation.navigate('AccessLogs') },
      { icon: 'watch-outline',          label: 'Wearables & Health Devices', onPress: () => navigation.navigate('WearableSync') },
      { icon: 'hardware-chip-outline',  label: 'Device Compatibility List', onPress: () => navigation.navigate('DeviceCompatibility') },
    ],
  },
  {
    header: 'Preferences',
    items: [
      { icon: 'notifications-outline',   label: 'Notifications',            onPress: () => navigation.navigate('Notifications') },
      { icon: 'language-outline',        label: 'Language Settings',        onPress: () => Alert.alert('Coming Soon', 'Language settings will be available in a future update.') },
      { icon: 'sunny-outline',           label: 'Theme (Light / Dark)',     onPress: () => Alert.alert('Coming Soon', 'Theme preferences will be available in a future update.') },
      { icon: 'settings-outline',        label: 'App Settings',             onPress: () => navigation.navigate('Settings') },
    ],
  },
  {
    header: 'Security',
    items: [
      { icon: 'lock-closed',             label: 'Change Password',          onPress: () => {
          Alert.alert('Change Password', 'To change your password, please use the "Forgot Password" flow on the login screen.');
      }},
    ],
  },
];
```

**A2. Refactor Profile Hero Card (Avatar Horizontal Stack)** matching reference design:
- Left: `<Avatar size="lg" />` — camera badge removed from hero (kept in ProfileEdit only; clean hero in line with reference screenshot).
- Right (flex:1 column): Line 1 full name bold, Line 2 email secondary; add Line 3 phone number ("+234 XXX XXXX") if `user.phone` set. This adds **Contact Details** block inside hero — requirement 1 mandates personal info incl. contact details.
- Container `Card` becomes `flexDirection:'row'` instead of `alignItems:'center'`.

**A3. Render Sections Loop.** Replace [lines 188-208 (flat action list)](file:///C:/Users/acer/Desktop/Omini%20puls/src/screens/patient/PatientProfileScreen.tsx#L188-L208) with a map over `sections`:
- For each section: render a `<Text style={styles.sectionTitle}>` with section name.
- Wrap the group rows in a surface Card: `borderRadius:16`, `Colors.surface`, `borderWidth/Color`, `overflow:'hidden'`, `Shadows.xs`.
- Each row: `TouchableOpacity` with icon (20dp / `Colors.secondary[600]`), label (left aligned with gap), chevron right.
- Dividers between rows: use existing `Divider` with `spacing={0}`.
- Medical History section: do NOT render items array — instead render the existing `Health Information Card` (6 clinical rows) inside the section wrapper.

**A4. Add Contact Details Row** inside Account group (between sections or under Personal Info). Optionally add a new separate group header "Contact Details" with two rows: `📧 user.email` and `📞 user.phone || 'Not set'`. If phone is empty show "Add phone number" link.

**A5. Emergency Help Card + Logout Button** remain at end. Add `maxWidth: 720` container via `useWindowDimensions().width >= 768 ? { alignSelf:'center', width:'100%', maxWidth:720 } : undefined` — tablet centering (requirement 4: responsive). Wrap all ScrollView children in this maxWidth `View`.

**A6. Fix layout overflow in cards:**
- `profileCard` `overflow: 'hidden'` so avatars / rounded corners don't bleed.
- All cards `borderRadius` match `16` consistent.
- All `Text` in rows add `numberOfLines:1, flexShrink:1` to prevent wrapping / button push.
- All list rows: enforce minimum row height of 52dp (touch target >= 48dp), add `hitSlop: {top:4, bottom:4}` on TouchableOpacity.

### Phase B — Doctor AppointmentsScreen Appointment Card Overflow Fixes + Canonical Component Refactor

**B1. Extend `DoctorAppointmentItem` API** to support all callbacks that the inline `renderAppointmentItem` uses today. Update [DoctorAppointmentItem.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/list-items/DoctorAppointmentItem.tsx#L28-L36):

```ts
interface DoctorAppointmentItemProps {
  item: DoctorAppointmentItemData & {
    type?: 'video' | 'in_person' | 'phone';
    prescription?: { id: string };
    patientId?: string;
  };
  onPress?: () => void;
  onUpdateStatus?: (status: string) => void;
  onDecline?: () => void;
  onReschedule?: () => void;
  onApprove?: () => void;
  onComplete?: () => void;
  onJoinVideo?: () => void;
  onWritePrescription?: () => void;
  onViewPrescription?: () => void;
  onChat?: () => void;
  onViewChatHistory?: () => void;
  approvedDoctor?: boolean; // user?.isApproved !== false
  containerStyle?: ViewStyle;
}
```

**B2. Rewrite `DoctorAppointmentItem` layout internals** with overflow-safe rules:
1. **Card Root:** `overflow: 'hidden', borderRadius: 16` so any child (avatar, buttons) clips to card.
2. **Card Header (avatar/name/date/status):**
   - `View row flex:1` → `headerInfo` gets `flex:1, flexShrink:1`, `gap: Spacing[1]`
   - `patientName Text`: `numberOfLines:1`, `ellipsizeMode:'tail'`, `flexShrink:1`
   - `dateTime Text`: `numberOfLines:1`, `flexShrink:1`
   - `statusBadge View`: `flexShrink:0, maxWidth: 110`, paddingHorizontal `8`
   - `statusText Text`: `adjustsFontSizeToFit minimumFontScale=0.8 numberOfLines=1`
3. **Card Body (reason + notes):**
   - `reasonText` + `notesText`: `numberOfLines={3}` to prevent long multi-line doctor notes from blowing up card. If >3 lines ellipsize + add small "more" icon tappable to expand.
   - Add lineHeight = 1.4 × fontSize to avoid text clipping vertically.
4. **Action Rows (Decline / Reschedule / Approve):**
   - Wrap in `View flexDirection: 'row' flexWrap: 'wrap' gap: Spacing[2]` → on narrow widths 3rd button flows to 2nd row automatically. No hardcoded `height`.
   - Each button: `flex: undefined → minWidth: 104, paddingVertical: Spacing[3]` instead of `height:40`. Enables content to wrap vertically if font grows (Accessibility large text).
   - `Text` inside buttons: `numberOfLines:1, adjustsFontSizeToFit, minimumFontScale: 0.8`. Long label "Decline / Cancel" shrinks to fit.
   - For width < 340dp: use `icon-only` buttons (no label text, `accessibilityLabel` matches full label for screen readers). Prevents 3 flex-1 buttons text from overlapping entirely on small phones.
5. **Join Video / Prescription / Chat buttons:**
   - Same rules: remove `height:40`; `paddingVertical: Spacing[3]`, label text minFontScale, `flexShrink:1`.
   - Locked Chat button visually consistent but disabled=true (opacity 0.6).
   - Wrap buttons with `flexWrap: 'wrap'` in container.

**B3. Update `AppointmentsScreen.tsx`** to use the refactored `DoctorAppointmentItem` component. Replace 235-line inline `renderAppointmentItem` callback with:
```tsx
<DoctorAppointmentItem
  item={item}
  onPress={() => navigation.navigate('PatientDetail', { patientId: item.patientId })}
  onDecline={() => handleUpdateStatus(item.id, 'cancelled')}
  onReschedule={() => { Alert.alert(...) }}
  onApprove={() => handleUpdateStatus(item.id, 'scheduled')}
  onComplete={() => handleUpdateStatus(item.id, 'completed')}
  onJoinVideo={item.type === 'video' ? () => navigation.navigate('VideoConsultation', {…}) : undefined}
  onWritePrescription={!item.prescription ? () => navigation.navigate('Prescription', {…mode:'create'}) : undefined}
  onViewPrescription={item.prescription ? () => navigation.navigate('Prescription', {…mode:'view'}) : undefined}
  onChat={() => navigation.navigate('ConsultationChat', { appointmentId: item.id })}
  onViewChatHistory={() => navigation.navigate('ConsultationChat', { appointmentId: item.id })}
  approvedDoctor={user?.isApproved !== false}
/>
```
This eliminates duplicated layout code: fixes once in DoctorAppointmentItem apply to **everywhere** the card is used (DoctorHomeScreen dashboard lists, PatientDetail tab appointments, etc.).

**B4. Header + pending banner + filter tabs in AppointmentsScreen** — wrap content with `maxWidth` on tablet (`useWindowDimensions`):
```tsx
const { width } = useWindowDimensions();
const tabletWrap = width >= 768 ? { alignSelf:'center' as const, width:'100%' as const, maxWidth: 880 } : undefined;
```
And wrap each major section (pending banner / filter wrapper / list container contentContainerStyle) with it. This is Requirement #4: responsive on tablet.

### Phase C — Doctor-Side PatientListItem Overflow Fixes + Responsive Structuring

**C1. Update `PatientListItem` container, spacing & text overflow rules** in [PatientListItem.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/list-items/PatientListItem.tsx#L100-L147):

1. **Container:**
   - `minHeight: 72` → guarantees >= 48dp touch area for the whole row + padding.
   - `paddingHorizontal: Spacing[4]`, `paddingVertical: Spacing[3]`.
   - `overflow: 'hidden'`, `borderRadius: 12`, `Shadows.xs`.
2. **`styles.info` middle column:**
   - `flex:1, flexShrink:1, marginLeft: Spacing[3]`
3. **`styles.name`:**
   - `numberOfLines:1, ellipsizeMode:'tail', flexShrink:1` — long patient names now ellipsize instead of pushing right edge.
4. **`styles.details`:**
   - `flexDirection:'row', flexWrap:'wrap', alignItems:'center', gap: Spacing[1]` — existing, but add `flexShrink:1` to each `detailText Text` and detailItem `View` so items stop at 1 or 2 lines.
5. **`styles.email`:**
   - `numberOfLines:1, ellipsizeMode:'middle'` for long professional emails: `johnde…@hospital.nhs.ng` readable rather than username truncated.
6. **Chevron Icon (right):**
   - Wrap in a `View flexShrink:0 width:24 alignItems:'center'` so never pushed off-screen on wrap.
   - Align vertically centered regardless of number of detail rows (if details wrap to 2 lines).
7. **`detailText` Text:**
   - `numberOfLines:1, adjustsFontSizeToFit, minimumFontScale:0.85` — prevent "Blood: A Positive Rh+" from pushing boundary.
8. **Spacing consistency:** Gap 4 between info column rows (name, details, email). Use `gap: 4` on `styles.info`.

**C2. Optional (nice-to-have) add a `contentWidth === 'compact'` switcher using `useWindowDimensions` inside PatientListItem** — if width < 380, hide blood group text and keep only age + gender (to avoid wrap on super-compact phones). Keep it via simple `flexWrap` and ellipsis so we don't lose data; this is strictly optional so mark as lowest-effort default.

### Phase D — Cross-Browser & Cross-Device Testing Validation / Verification Layer

Since we cannot ship native tests in the plan, implement the following structural guards so the layout is **provably correct at render time** (Requirement 4):

**D1. Standardize `useWindowDimensions` breakpoint pattern** in all 4 modified files:
- Import `useWindowDimensions` from react-native at top of: PatientProfileScreen, AppointmentsScreen, PatientListItem, DoctorAppointmentItem.
- Define `const { width } = useWindowDimensions();`
- Expose compact/wide helpers:
  ```ts
  const isCompact = width < 380;
  const isTablet  = width >= 768;
  ```
- Apply `isCompact` to use icon-only buttons in DoctorAppointmentItem.
- Apply `isTablet` to `maxWidth` outer wrappers.

**D2. Add `onLayout` instrumentation guard (optional, can be no-op or logging only)** — attach `onLayout={(e) => { const { width, height } = e.nativeEvent.layout; if (height < minExpected || width < minExpected) console.warn(...)}}` to the outer container of each card. This would warn during dev if any content clips the target, but we don't ship console logs in release; remove or leave as `__DEV__` only. **Decision in this plan:** skip explicit layout logs; rely on `overflow:'hidden'` + `numberOfLines` + `adjustsFontSizeToFit` which are the actual robust defences.

**D3. Unified card container `padding: Spacing[4], gap: Spacing[3]`** for all cards (Appointment, PatientListItem, Profile sections, HealthInfoCard, HelpCard) — removes guesswork and ensures content separated by theme-defined consistent spacing across every viewport.

**D4. `accessibilityRole='button'` + `accessibilityLabel`** all interactive row/button elements so iOS/Android screen readers read them and iOS a11y large font sizes scale correctly.

---

## 4. Dependencies & Considerations

| Dependency | Status | Action |
|-----------|--------|--------|
| `react-native` core `useWindowDimensions` | ✅ built-in | Import and use in 4 modified files |
| `@expo/vector-icons Ionicons` | ✅ installed | Icons for new section rows |
| `react-native-safe-area-context` `SafeAreaView` | ✅ already used in screens | Continue existing pattern |
| `@shopify/flash-list` | ✅ used in AppointmentsScreen | `estimatedItemSize` may need bump after new layout taller heights; increase to 320 to avoid cell size churn |
| `Avatar`, `Divider`, `Card` components | ✅ reusable | Use in profile sections |

### Design Constraints
- **Strictly theme tokens only** — do not add any new Colors or Spacing numeric constants beyond those already present in `src/theme/colors.ts`, `src/theme/spacing.ts`, etc.
- **Mobile-first tablet-friendly.** No platform branches (iOS vs Android) unless unavoidable.
- **Backwards navigation compatibility.** ProfileScreen navigates to existing screens (ProfileEdit, Settings, Notifications, etc.) — no new routes added, no nav params changed.
- **Auth flows unchanged.** Change Password button defers to existing Forgot Password flow; new social links not added (reference screenshot is generic template layout we adapted, OminiPulse is mobile-optimized and the Profile has no social row).

### Accessibility
- Minimum **48×48dp touch targets** on all buttons & rows: achieve via `minHeight >= 52` on TouchableOpacity, padding, `hitSlop` when necessary.
- `adjustsFontSizeToFit` + `minimumFontScale 0.8` on labels with fixed containers to support large accessibility font.
- `numberOfLines` ceiling set on every Text that could expand container beyond card bounds (reason, notes, name, email, button labels).

---

## 5. Risk Handling

| Risk | Severity | Mitigation |
|------|----------|------------|
| Refactor `renderAppointmentItem` to use `DoctorAppointmentItem` breaks existing status-specific button logic (pending vs scheduled vs completed) | High | Unit-test by hand: map every status branch in current inline code to a prop in the canonical component. Render each branch explicitly by status, with `showXYZ` booleans, so nothing is missed. When in doubt, **keep a small shim wrapper** in `AppointmentsScreen` whose sole job is to pass correct combination of onXYZ callbacks per status — this keeps canonical component API "dumb" (show what props are set) and branch logic stays at screen level. |
| Tablet `maxWidth: 720/880` container causes FlashList `contentContainerStyle` to conflict on scrolling | Medium | Apply maxWidth wrapper as **a View inside** the SafeArea, NOT directly on FlashList `contentContainerStyle`. FlashList receives `width: '100%'`. Inner content stays clipped. Scroll bar sits at right edge of screen (correct), not at maxWidth edge. |
| `flexWrap` 3-button row wraps 3rd button onto line 2 → vertical rhythm inconsistent vs current 1-row layout | Low | This is INTENTIONAL for layout correctness. Accept the trade-off: some viewports will show one action row on two lines, but buttons will never overflow their containers. Preserve `alignItems:'stretch'` so wrapped button fills remaining row width on new line. |
| Long patient names cause `adjustsFontSizeToFit` to shrink name to unreadable size on compact widths | Low | Keep `minimumFontScale >= 0.8`, pair with `numberOfLines:1, ellipsizeMode:'tail'`. Accessibility testing: if a user sets system font very large, the name will truncate and show "…" — acceptable because tapping row opens PatientDetail where full name, DOB, etc. are available. |
| Profile grouped sections change bottom of ScrollView content; logout button could scroll off-screen or `marginBottom:Spacing[8]` be clipped by SafeArea | Low | Keep `scrollContent` paddingBottom of Spacing[8], wrap logout in its own margin. |
| PatientListItem email `ellipsizeMode:'middle'` not supported on old Android APIs | Low — documentation confirms it is supported since RN 0.60+; Expo 54 ships with RN 0.81; no concern. Fallback `'tail'` would work; middle is preferable for emails. |

---

## 6. Verification Checklist (After Implementation)

### Requirement 1 — Patient Profile
- [ ] Header "Profile" present, patient hero card displays avatar LEFT + full name RIGHT then email + phone on next lines — correct horizontal layout.
- [ ] Group sections exist with labels: **Account**, **Medical History** (holds Health Information 6-row card: Age / Height / Weight / BMI / Blood Group / Genotype), **Health & Records**, **Preferences**, **Security**. Each section title uses uppercase/small grey label styling (e.g. `styles.sectionTitle` pattern).
- [ ] Account rows: Manage Profile, Personal Information, Prescription History, Consent Management. All navigate correctly without errors.
- [ ] Health & Records rows: Chronic Disease Tracker, Medication Reminders, Who Viewed My Records, Wearables, Device Compatibility.
- [ ] Preferences rows: Notifications, Language Settings, Theme (Light/Dark), App Settings — Language and Theme show Coming Soon alert without crashing.
- [ ] Security row: Change Password triggers the flow notice.
- [ ] Emergency Contact Support card + Logout button present at the bottom.
- [ ] Every row has left Ionicons icon + label + right chevron, consistent spacing, row min height >= 52dp.
- [ ] Tablet width >= 768dp: content container has `maxWidth: 720`, centered.
- [ ] Text within the hero name, email, phone rows correctly truncate or wrap with `numberOfLines:1` / `flexShrink:1`.

### Requirement 2 — Doctor Appointments Layout Overflow Fixes
- [ ] Compact width (320–360 dp): Action row buttons do not push past right card edge. `flexWrap` wraps correctly to 2 lines. Icon-only fallback shrinks content.
- [ ] Long labels "Decline / Cancel", "Write Prescription", "Open Consultation Chat" — Text shrinks to fit inside button width (visually inspect).
- [ ] Status badge SCHEDULED / PENDING / COMPLETED / CANCELLED uppercase never truncates inside maxWidth 110 and does NOT push patient name into <3 character ellipses. Patient name shrinks or ellipsizes tail; full name viewable on PatientDetail tap.
- [ ] Reason + Notes with 300+ characters cap at numberOfLines and show ellipsis.
- [ ] On `scheduled/approved` with video type: Join Video Call + 3 action buttons + Prescription + Chat buttons all render inside card borders (no content bleed below card rounded corners or past right edge). `overflow:'hidden'` confirmed by temporarily injecting an oversized child and observing it clip.
- [ ] When `user.isApproved === false`, action callbacks are blocked with toast — buttons render but the flow is blocked; no layout shifts.
- [ ] Tablet width >= 768dp: list content centers with maxWidth 880, appointments cards don't stretch to ~12" full screen width.

### Requirement 3 — Doctor-Side Patient Cards Refactored Structure
- **PatientListItem:**
  - [ ] Name, details, email have numberOfLines caps and ellipsis.
  - [ ] Email truncates in the middle (johnde…@hospital.ng) rather than end.
  - [ ] Chevron icon always visible regardless of name/wrap lengths.
  - [ ] Row min height >= 72dp. Tap target >= 48dp.
  - [ ] Container `overflow:'hidden'` clips cleanly to 12dp borderRadius.
- **DoctorAppointmentItem (canonical reusable):**
  - [ ] Status badge maxWidth + flexShrink 0.
  - [ ] Patient name + date + time flexShrink and ellipsize.
  - [ ] Reason/notes 3-line cap.
  - [ ] Buttons use flexWrap: 'wrap' + icon-only fallback on compact.
  - [ ] `AppointmentsScreen` uses `DoctorAppointmentItem` now (no duplicate inline card). Single source of truth.
  - [ ] `FlashList estimatedItemSize` adjusted if layout taller (e.g. to 340) — no yellow FlashList "estimatedItemSize may be wrong" warnings at runtime.

### Requirement 4 — Cross Viewport Verification
- [ ] `npx.cmd tsc --noEmit` passes without type errors across src/.
- [ ] Dev tool Expo Go run on:
  - Phone portrait (5.5" 360×640 Android) — all 4 screens render without overflow.
  - Large phone (6.7" 430×932 iPhone 14 Pro Max) — no spurious whitespace.
  - Tablet portrait (iPad 9.7" 768×1024) — maxWidth centering visible on profile / lists, no card stretching.
  - Tablet landscape (iPad 12.9" 1366×1024) — same, no horizontal overflow.
- [ ] Accessibility font scale set to Large / Largest in device settings: buttons and cards reflow via flexWrap, no content clipped, text shrinks via adjustsFontSizeToFit as intended.
- [ ] ScrollView/FlatList can reach every row (profile logout at bottom, appointment buttons at bottom of long card) without interactive elements being obscured by device safe area or keyboard (when applicable — filter tabs not behind keyboard).

### TypeScript
- [ ] `npx.cmd tsc --noEmit` passes 0 errors.
- [ ] Expo Metro loads clean with `npm.cmd start`.
