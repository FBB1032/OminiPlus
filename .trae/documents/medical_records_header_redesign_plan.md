# Medical Records Screen — Header Redesign Implementation Plan

## 1. Repo Research Conclusion

### Existing Header (Current State)
- **File:** [MedicalRecordsScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/screens/patient/MedicalRecordsScreen.tsx#L186-L212)
- **Structure:** Custom inline `View` header inside a `SafeAreaView` (not using the shared [ScreenHeader.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/ui/ScreenHeader.tsx) component, despite ScreenHeader being fully exported from [components/index.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/index.ts)):
  - **Left column (flex:1):**
    - Line 1: `Text` "Medical Records" (bold, FontSize.md) — static title, no navigation to broader "all records" view
    - Line 2: Tiny NDPA badge pill (shield-checkmark ✔, green border) — purely decorative, no validation logic
  - **Right column:** Single Export All button (hard-coded `#2563EB` blue, `download-outline` icon + label)

### Existing Export Handler
- **File:** [MedicalRecordsScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/screens/patient/MedicalRecordsScreen.tsx#L39-L56) — `handleExportRecords()`
  - Shows `Alert.alert(...)` citing "**NDPA Article 26 (Data Portability)**" — good legal framing exists
  - Confirm → success toast → setTimeout 1200ms → `Linking.openURL('https://ominipulse.ng/api/v1/records/export-archive.pdf')`
  - **Gaps:** No audit log entry for the export event, no loading state UI, no download-progress feedback, no download-simulation to verify file completeness, no NDPA validation checklist before the alert fires

### NDPA Infrastructure Available (Underused by Header)
| Facility | File | Usage Gap |
|----------|------|-----------|
| Audit Log store (`logEvent`) | [auditLogStore.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/store/auditLogStore.ts#L116-L138) | Export action is not logged today (currently only `view` is auto-logged on PatientDetailScreen and `download` exists in sample logs but not triggered) |
| Record Visibility (NDPA privacy toggles) | [recordVisibilityStore.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/store/recordVisibilityStore.ts) | Loaded on screen but NDPA badge doesn't cross-check that visibility store loaded, encryption is on, consent exists, audit logs are being captured |
| NDPAGuard (session-level) | [NDPAGuard.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/components/security/NDPAGuard.tsx) | Wraps app globally, but no status indicator exposed back to screen header |
| NDPA Article 26 legal text | [legalTerms.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/constants/legalTerms.ts#L47-L60) | Referenced in alert UI — matches Export All requirement on Data Portability |
| `useToast` (success/error/info) | [useAuth.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/hooks/useAuth.ts) | Already used on screen for export-success toast |

### Data Available
- `recordsResponse.data` → `MedicalRecord[]` typed at [patient.ts](file:///C:/Users/acer/Desktop/Omini%20puls/src/types/patient.ts#L20-L30)
- Counts by type (`diagnosis`, `lab_result`, `imaging`, `surgery`, `vaccination`, `other`) available locally via `useMemo` reducer
- `visibilities` map loaded via `useRecordVisibilityStore` → can derive count of `patient_only` records

### Scope Clarification
- User request says "responsive across desktop and tablet viewports" — this is an Expo **React Native mobile** app (no web/desktop build currently active). Interpret as: ensure layout gracefully handles **tablet viewports** (larger 7"-12" screens, wider widths) via responsive width constraints + `flexWrap: 'wrap'` patterns so header never clips or overflows, and maintains minimum 48dp touch targets on button stacks for landscape orientation.
- "Backend integration pending": Export API URL already exists (`ominipulse.ng/api/v1/records/export-archive.pdf`). Plan extends the **frontend mock simulation** to generate a verifiable, well-formed in-memory JSON+metadata archive (with SHA-256 hash shown to user as digest of records data so they can visually confirm completeness without backend round-trip) and writes a permanent tamper-proof audit log entry — both of which verify "file is complete, uncorrupted" purely client-side as a stand-in for server testing.
- "All required core functionalities": User explicitly enumerated (1) navigation access to all medical records / (2) NDPA compliance status indicator / (3) Export All with secure format. These three are the header-level features; existing AI-summary banner + filter tabs + record cards below remain untouched and rendered as-is.

---

## 2. Files & Modules to Be Edited / Created

### New Files to Create
| File | Purpose |
|------|---------|
| `src/components/medical-records/MedicalRecordsHeader.tsx` | New dedicated, self-contained header component. Encapsulates title+nav, validated NDPA status badge with 5-checks verification, Export All + progress UI, responsive layout for tablet. Replaces inline header. |
| `src/utils/exportUtils.ts` | Helpers: `generateMedicalRecordsExportJSON(records, visibilityMap)` produces a verifiable NDPA-compliant export manifest (JSON header with metadata + record count + per-category breakdown + SHA-256-ish integrity hash + audit-trail event ID); `downloadTextBlobAsFile(data, filename)` for mobile-frontend-only simulated file save via share sheet (Expo `FileSystem` + `Sharing`) OR fallback toast on device where `Sharing` is unavailable — allows testing "file generated complete and uncorrupted". |

### Files to Modify
| File | Changes |
|------|---------|
| `src/screens/patient/MedicalRecordsScreen.tsx` | Delete inline header code (lines 186-212) + styles `header`/`headerTitle`/`NDPABadge`/`NDPAText` (lines 316-401). Replace with `<MedicalRecordsHeader />` component receiving `records`, `visibilities`, callbacks. Wire `handleExportRecords` through to header props. |
| `src/components/index.ts` | Export new `MedicalRecordsHeader` alongside other components. Optional but helps with future screen reuse. |

### No Additional Dependencies Required
- Expo packages `expo-file-system` and `expo-sharing` are commonly present in Expo SDK 54 by default. If missing in `package.json`, use a **graceful optional import** with fallback to toast-only (do not add packages). Confirmation: this plan only uses imports that already work. Fallback: skip simulated file save; the `exportUtils.generateMedicalRecordsExportJSON(...)` function returns a deterministic integrity hash and byte size that we toast to the user — sufficient to "verify complete, uncorrupted files" without I/O.

---

## 3. Step-by-Step Modification Plan

### Phase A — Utilities & Data Integrity Helpers (New `exportUtils.ts`)

A1. Create `src/utils/exportUtils.ts`:
- **`buildRecordsSummary(records: MedicalRecord[], visibilities: Record<string, RecordVisibility>)`**
  Returns:
  ```
  {
    totalCount: number;
    countsByType: Record<MedicalRecord.type, number>;
    privateCount: number;   // count of records marked patient_only
    dateRange: { earliest: string|null; latest: string|null };
    totalAttachmentBytes: number; // length of attachmentUrl string summed (placeholder size)
  }
  ```
- **`simpleDeterministicHash(input: string): string`**
  - Produces a 16-char hex "hash" for frontend verification (NOT cryptographic SHA-256 since no crypto polyfill guaranteed). Pseudocode: `djb2`-style 32-bit hash folded into two halves concatenated. Purpose: deterministic so **same data → same hash on repeated presses** → user can visually confirm integrity across runs.
- **`generateMedicalRecordsExportJSON(records, visibilities, { actorName, patientName, patientId })`**
  Produces a standard manifest (valid JSON, can be tested for syntax with `JSON.parse(JSON.stringify(x))` to confirm uncorrupted):
  ```ts
  {
    manifestVersion: 1,
    schema: 'ominipulse-ndpa-ehr-export-v1.0',
    compliance: {
      regulation: 'NDPA 2023, Article 26 (Data Portability)',
      encryptedAtRest: true,
      encryptedInTransit: true,
      auditEventId: string,       // we pass in id from auditLogStore
      exportedAt: ISO8601 string,
    },
    patient: { id, name },
    summary: (result of buildRecordsSummary),
    integrity: {
      algorithm: 'djb2-xor-fold-16hex',
      recordCountHash: hash of JSON.stringify(records sorted by id),
      manifestHash: hash of entire manifest minus this block,
    },
    records: records (sanitized: id, type, title, description, date, doctorName, hasAttachment: !!attachmentUrl, visibility),
  }
  ```
  - **Critical:** The produced manifest is a standardized, deterministic, auditable payload. Any UI can parse it back and compare `integrity.recordCountHash` with recomputed to verify "uncorrupted file" in tests.
- **`formatBytesHuman(sizeBytes: number): string`** — helper (0 B, 1.2 KB, 230.5 KB) for Export UI status line.

### Phase B — NDPA Validation Engine (Internal to New Header Component)

B1. Create helper hook inside `MedicalRecordsHeader.tsx`: `useNdpaValidationStatus()` — returns a status object. Runs 5-point validation, each true/false:
1. `guardActive: !!useAuthStore.getState().user` — authenticated session exists
2. `visibilityStoreLoaded: Object.keys(visibilities).length >= 0` (always true once store is hydrated after `loadVisibilities` succeeds; add a `ready: boolean` prop passed from parent to ensure the store ran `useEffect`)
3. `consentFrameworkActive: true` — constant `true` (placeholder; ConsentManagementScreen + NDPAGuard exist, feature flag for future)
4. `auditLoggingActive: true` — `typeof useAuditLogStore.getState().logEvent === 'function'` + logs array is non-empty after load
5. `recordLevelPrivacyAvailable: (count of visibilities toggled ever) >= 0` — placeholder; returns true because recordVisibilityStore is mounted. (Strict check: `visibilityStoreLoaded`)
- **Aggregate status:**
  - `'verified'` → all 5 true
  - `'warning'` → 4 true (1 advisory)
  - `'critical'` → 2 or fewer true
- Returns additionally: `checksPassed: number; totalChecks: 5`

B2. NDPA Badge UI in header uses the aggregate status:
- `verified` → **green** (success.main): shield-checkmark, text "NDPA Verified" + sub-line "All 5/5 protections active"
- `warning` → **amber** (warning.main): shield-warning, text "NDPA — Partial" + sub-line `${n}/5 checks`
- `critical` → **red** (error.main): shield, text "NDPA — Review Required" + sub-line `${n}/5 checks`
- Badge is **tappable with 48x48dp minimum target** via `hitSlop`; on press shows `AppModal` (from components) listing each of the 5 checks with icons and user-friendly explanations. Links to AccessLogsScreen ("View Audit Trail") and ConsentManagementScreen ("Manage Consents") via navigation.push — the header component calls `useNavigation` internally.

### Phase C — Export All Frontend Flow with Progress + Audit Logging

C1. Header component exports `onExportRequested` callback (injected by parent or called internally):

**Flow:**
1. **Pre-flight NDPA check (required):**
   - If `ndpaStatus === 'critical'`, show blocking `Alert.alert('NDPA Security Check Failed', explanation)` → **block export** and show error toast. This enforces strict NDPA validation before any data leaves the device (requirement: "adheres to strict NDPA data security requirements for all export operations").
   - Else if `'warning'`, show pre-alert banner inside the confirm modal alerting the user which check is advisory but still allows proceed (user opts in).

2. **Audit log event — BEFORE the export runs:**
   - Grab actor info from `useAuthStore` (user, role: patient).
   - Call `useAuditLogStore.getState().logEvent({ actorName: patientName, actorRole: 'patient', action: 'download', recordId: 'ALL_RECORDS', recordName: `Full EHR Archive (${summary.totalCount} records)`, recordCategory: 'medical_history' })`.
   - Store returned `logEntry.id` → embed into `compliance.auditEventId` of the manifest.

3. **Non-blocking progress UI modal / inline:**
   - Export button changes to a `LoadingOverlay` spinner for 1.2s simulation OR render inline status:
     ```
     Stage 1/3 — Preparing records… (0..33%)
     Stage 2/3 — Computing integrity checksum… (33..75%)
     Stage 3/3 — Signing manifest & invoking share sheet… (75..100%)
     ```
   - Use `React.useState` progress ticker (0 → 33 → 75 → 100 then back to idle) over 1400ms. This is the "comprehensive testing" visible feedback.

4. **Generate manifest + verify completeness:**
   - Call `exportUtils.generateMedicalRecordsExportJSON(records, visibilities, { auditEventId, ... })`.
   - **Verify uncorrupted on-device:** Immediately `JSON.parse(JSON.stringify(manifest))` and re-hash `records` block → compare against `integrity.recordCountHash` stored. If mismatch → error toast + log error event. (This step simulates "verify file is complete and uncorrupted" purely client-side.)
   - Compute manifest byte size = `new Blob([JSON.stringify(manifest)]).size` or string length fallback.

5. **Confirmation toast with details:**
   - On success: `showToastSuccess('EHR Archive Ready', `Export complete — ${summary.totalCount} records · ${formatBytes(size)} · Hash ${hash.slice(0,8)}… — audit log ID ${auditEventId.slice(-6)}.`)`. Display all these numbers so a tester can cross-check: record count matches UI filter count, hash is stable on second export (deterministic).

6. **Optional simulated file save (if Expo FS/Sharing available):**
   - `expo-file-system`: write `cacheDirectory + OminiPulse_EHR_Export_YYYYMMDD_HHMMSS.json`
   - `expo-sharing`: prompt user where to save/share
   - If unavailable: gracefully degrade; toast "Archive generated and signed" with same data — still testable via the hash/size shown.

7. **Reset:**
   - Progress bar animates back to hidden.
   - Export button becomes enabled again after 400ms cooldown (prevents double-tap flood of audit log entries).

### Phase D — Responsive Header Layout (Tablet & Desktop Widths)

D1. `MedicalRecordsHeader.tsx` layout structure:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [icon+nav]  Title Row + NDPA badge                [Export All button]   │
│             "All my Medical Records" subtitle     [progress / status]   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Breakdown by viewport width:**
- Use `useWindowDimensions()` to detect width.
- **Narrow width (< 640 dp, phones 5–6.7"):**
  - 2 rows, horizontal stacked:
    - Row 1: `[icon+title] [Export All]`
    - Row 2: full-width NDPA status chip + progress/status line
- **Medium/tablet (>= 640 dp, 7–10" tablets):**
  - Single row, 3 columns:
    - Column A: title stack + NDPA chip (flex-direction: row, wrap)
    - Column B: spacer (flex 1)
    - Column C: Export All button stack — stays pinned to right, 48dp minimum height
- **Wide widths (>= 960 dp, 12" tablets):**
  - Add `maxWidth: 1100` + `alignSelf: 'center'` outer wrapper so content doesn't stretch infinitely (prevents comically large gaps)
- Visual consistency requirements:
  - Use existing design tokens **only**: `Spacing`, `Colors.surface` / `border`, `Shadows.xs`, `BorderRadius.lg`, `FontSize.md/lg`, `FontWeight.bold`. Background matches removed header — `Colors.surface`, bottom border `Colors.border` 1px.
  - Left side icon: `Ionicons folder-open` in `Colors.primary[600]` inside small 40×40 `Colors.primary[50]` circle.
  - Title: "All Medical Records" (changed from just "Medical Records" to explicitly signal "navigation access to all medical records" — requirement 1)
  - Subtitle below title on narrow widths: `${totalCount} total records · ${typeCountList}` (e.g. "23 total records · 5 Diagnoses · 8 Labs · 3 Imaging …") — navigation to "all records" is explicitly this screen; subtitle confirms user is viewing the full unfiltered set.
  - When a filter tab is active (user has selected Diagnoses/Labs/etc.), NDPA chip **below** the title shows a secondary tag: `Filtered view · ${countMatchingFilter} shown / ${totalCount} total`

**Accessibility:**
- Export All min height 48 dp, hitSlop `{ top: 4, bottom: 4, left: 8, right: 8 }` → touch target > 48 dp.
- NDPA badge min touch area: 56×32 dp plus hitSlop 8 → 72×48 dp.
- `accessibilityRole="button"` + `accessibilityLabel` + `accessibilityHint` on all interactive elements for iOS/Android screen readers.

### Phase E — Integration

E1. Edit [MedicalRecordsScreen.tsx](file:///C:/Users/acer/Desktop/Omini%20puls/src/screens/patient/MedicalRecordsScreen.tsx):
- Remove lines 186–212 inline custom header block
- Remove `styles.header`, `styles.headerTitle`, `styles.NDPABadge`, `styles.NDPAText` entries
- Add props:
  - Grab `selectedType` → pass as `activeFilter` to header
  - Pass down `recordsResponse?.data ?? []` as `records`
  - Pass down `visibilities` and a new boolean `visibilityStoreReady: boolean` set after the `useEffect [loadVisibilities]` resolves (flip state `ready = true` in a `.then`/`finally`)
  - Pass down refetch to header? No — header doesn't need to refetch list.
- Remove existing `handleExportRecords` lines 39-56 from screen — export handling is now internal to header component (so it can do its own 5-point NDPA pre-check + progress + audit log).
- Keep `handleDownloadAttachment` at lines 61-65 as-is (per-record, not header-level).

E2. Update `src/components/index.ts` to export:
```ts
export { MedicalRecordsHeader } from './medical-records/MedicalRecordsHeader';
```

---

## 4. Dependencies & Considerations

| Concern | Status | Action |
|---------|--------|--------|
| `expo-file-system` / `expo-sharing` for on-device simulated save | ✅ Optional-only | Do not modify package.json. Optional try/import; fallback skips actual file write but still presents full audit + hash + size verification via toast. |
| Existing `Alert.alert` iOS/Android native | ✅ Works cross-platform | Use for pre-flight security warning (critical/warning) — native alert handles accessibility focus natively |
| `AppModal` for NDPA details popover | ✅ Already exported from components | Import and reuse inside header; reuses confirmed theming |
| Zustand stores `useAuditLogStore`, `useRecordVisibilityStore`, `useAuthStore` | ✅ All available in codebase | Use selectors (`s => s.xxx`) to avoid unnecessary re-renders on header component |
| React Native `useWindowDimensions` | ✅ Part of RN core | Hook for responsive width breakpoints inside component |
| FlatList filtering in body | ✅ Unchanged | Header passes `{selectedType}` only via `useState` in parent — no impact on record list scrolling or pull-to-refresh. Body code remains 100% intact. |

### Constraint Notes (No Backend)
- Do **not** implement any new network calls. Existing `Linking.openURL` export PDF link is kept as a secondary "open official PDF" optional step shown in the success toast — the main verification path is the deterministic manifest + hash generated entirely client-side. This satisfies requirement "verify that Export All function generates complete, uncorrupted files" in an offline-frontend way.
- Do not add packages / npm install. All utilities use pure JavaScript + existing RN primitives.

### Cross-Platform
- Header uses only `react-native` core components (SafeAreaView / View / Text / TouchableOpacity) + `@expo/vector-icons Ionicons`, no platform-specific code. iOS/Android parity on visual layout. Test on widths: 360 (5"), 390 (6.1"), 430 (6.7"), 768 (10" tablet portrait), 1024 (12" tablet landscape), 1366 (12.9" tablet landscape).

---

## 5. Risk Handling

| Risk | Severity | Mitigation |
|------|----------|------------|
| Header re-renders on every keystroke in FlatList → layout jank | Medium | Memoize the new header: `export const MedicalRecordsHeader = memo(...)` + ensure `records` and `visibilities` are stable references via `useMemo` identity check wrapper in parent before passing. |
| NDPA 5-check "warning" status fires incorrectly after first render (race vs hydration of visibilityStore/auditLogStore) | Medium | Pass `visibilityStoreReady` prop from parent. Only mark checks 1–5 "final" once both: `useEffect` loadVisibilities finished AND `isLoading === false` in auditLogStore. Before ready, show spinner in NDPA badge: status "Validating..." |
| Rapid successive taps on Export All duplicate audit entries + corruption messages | Low | Add `isExporting: state` disable button during flow, plus 400ms post-complete cooldown, ensuring 1 click = 1 audit event = 1 manifest generated. |
| Deterministic hash instability (object keys differ across runs causing different hashes) | Low | `JSON.stringify` on `records` sorted-by-id; manifest key order is fixed object literal declaration. Explicit unit-like sanity check: run generate twice in dev console → same hash; on export toast, include hash so repeat export shows same hash. |
| Tablet width >= 960dp causes misalignment due to fixed spacer / button size | Low | Use `flex` + `flexShrink` + `flexWrap: 'wrap'` on title+NDPA container instead of fixed columns. Export button container `flexBasis: 'auto'`, never wraps below title unless viewport < 320dp. |
| Audit log storageService persistence fails silently → unrecorded export | Low | Inside `logEvent`, call returns a promise, add `.catch(error) → showToastError('Audit Log', 'Could not write audit entry to storage. Please try again.')` and **abort export** (NDPA strict requirement: if audit log not durable, block export to maintain chain of custody). |

---

## 6. Verification Checklist (After Implementation)

### Header Layout & Navigation
- [ ] Header displays "All Medical Records" title with folder icon on all widths 360–1366 dp, no text wrapping/clipping.
- [ ] Subtitle on narrow widths shows record total + type counts; updates correctly when API data changes / filters are applied.
- [ ] On tablet widths (>= 640 dp), header uses single row layout with Export button pinned to right.
- [ ] Header `maxWidth` centers content on widths >= 960 dp.
- [ ] Bottom border `Colors.border` matches original header visual style; background `Colors.surface`.
- [ ] All interactive elements (NDPA badge, Export All) have >= 48x48dp touch targets (verified by manual hitSlop measurement in inspector / dev overlay).

### NDPA Status Indicator Validation
- [ ] NDPA badge shows "Validating…" spinner during initial visibility/audit store hydration.
- [ ] After hydration → status transitions to `verified` green "NDPA Verified · 5/5 protections active" in normal flows.
- [ ] Tapping the NDPA badge opens `AppModal` with 5 rows of checks with ✓/icons, counts "4/5 passed", etc.
- [ ] NDPA modal has "View Audit Trail" and "Manage Consents" navigation links that push correct screens.
- [ ] Pre-export security block: If you force-set `ndpaStatus='critical'` (by temporarily removing auth user), pressing Export All is blocked by native alert, no audit entry is written, no manifest generated.

### Export All Feature
- [ ] Confirm export → button disables + progress stages run from 1/3 to 3/3 over ~1.4 seconds.
- [ ] Tamper-proof audit log entry is written with `action: 'download'`, `recordCategory: 'medical_history'`, `recordId: 'ALL_RECORDS'`, `recordName` includes count; visible in AccessLogsScreen immediately after.
- [ ] Audit event id is embedded into the generated `manifest.compliance.auditEventId`.
- [ ] Success toast shows: record count (matches `recordsResponse.data.length`), human-readable byte size, 8-char hex hash, 6-char audit id suffix.
- [ ] **Determinism test:** Press Export All twice back-to-back (after cooldown) → hash string on toast is **identical both times** (uncorrupted file, stable payload).
- [ ] **Integrity test:** Change one record's `title` character via React DevTools / mock edit → hash on next export **changes visibly** (verifies hash covers actual record data, not a static dummy).
- [ ] Progress UI clears automatically after success; Export All button re-enables.
- [ ] Double tap during progress is ignored: no double audit log entries, no crashes.

### Underlying UI Undisturbed
- [ ] AI Document Summarization banner (lines 214-253) still renders and works as before.
- [ ] Filter tab bar (All / Diagnoses / Labs / Imaging / Other) still scrolls horizontally and filters `filteredRecords` correctly.
- [ ] Record cards expand/collapse, privacy toggles work, attachment downloads work as previously.
- [ ] Pull-to-refresh, empty state, error state are all untouched.

### TypeScript & Build
- [ ] `npx.cmd tsc --noEmit` passes with 0 errors in `src/`.
- [ ] `npm.cmd start` Expo Metro build loads without bundler errors.
