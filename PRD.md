# Splash — Product Requirements Document

## 1. Product summary

Splash is a calm, playful web companion that nudges people to splash water on their face at a configurable cadence. The default interval is 15 minutes, but the experience is designed as a reusable reminder platform: timing, sound, messages, appearance, quiet hours, and later cloud-backed preferences can all evolve independently.

## 2. Problem

People who work for long stretches often lose track of time and benefit from a small physical reset. Existing alarms feel disruptive, generic, or cumbersome to reconfigure. Splash should make a recurring reset feel lightweight and delightful while being transparent about browser limitations.

## 3. Goals

- Make starting a recurring 15-minute reminder possible in one click.
- Keep the next reminder clear and give users immediate control to pause, reset, skip, or test it.
- Let users personalize timing, sound, notification behavior, and visual intensity.
- Preserve preferences and timer state across reloads on the same device.
- Keep feature logic separate from browser and persistence adapters so a backend can be added later.
- Meet modern accessibility and performance expectations.

## 4. Non-goals for the first release

- Guaranteed alarms when the browser or device has suspended the page.
- Medical or clinical claims.
- User accounts, social features, or cross-device sync.
- Native mobile background execution.

## 5. Personas

- **Deep-focus worker:** wants an unobtrusive recurring physical reset.
- **Routine customizer:** wants precise intervals, quiet hours, and a preferred sound.
- **Wellness tracker:** eventually wants streaks, history, and multi-device sync.

## 6. Experience principles

- **Calm, not clinical:** soft motion, water-inspired color, short encouraging copy.
- **One obvious action:** the current timer state and primary action are always prominent.
- **Respect attention:** no surprise audio; sound is previewable and configurable.
- **Honest reliability:** explain that browser notifications and background timers depend on browser permissions and operating-system behavior.
- **Accessible by default:** keyboard operable, sufficient contrast, reduced-motion support, semantic controls, and useful live announcements.

## 7. Feature priorities

### P0 — Launchable core

1. **Recurring countdown**
   - Defaults to 15 minutes.
   - Start, pause, resume, reset, and skip-to-next controls.
   - Deadline-based calculation instead of decrement-only timing, avoiding drift when a tab is throttled.
   - Automatically schedules the next cycle after a reminder.

2. **Reminder experience**
   - In-app full-screen reminder overlay with dismiss and snooze actions.
   - Configurable sound: off, gentle chime, ripple, or bright bell.
   - Sound preview and volume control.
   - Browser notification opt-in with clear permission state.

3. **Core configuration**
   - Interval presets plus a custom 1–180 minute value.
   - Reminder title/message.
   - Sound and volume.
   - Reduced visual effects option.
   - Settings persist locally.

4. **Session status**
   - Circular countdown, next reminder time, current mode, and completed-splash count.
   - Lightweight session progress indicator.

5. **Quality bar**
   - Responsive from small mobile screens through desktop.
   - Keyboard and screen-reader friendly.
   - Respects `prefers-reduced-motion`.
   - No remote media dependency for the default experience.

### P1 — Strong daily companion

1. Quiet hours and day-of-week scheduling.
2. Custom uploaded audio with size/type validation.
3. Multiple named routines (face splash, scalp splash, hydrate, stretch, eye break). **Implemented.**
4. Daily history, streaks, and a small insights view.
5. Installable PWA with offline shell and stronger background guidance. **Implemented.**
6. Theme presets and custom accent color.
7. Import/export preferences as JSON.
8. More flexible snooze choices and escalation rules.

### P2 — Connected platform

1. Optional authentication and cross-device settings sync.
2. Backend event history and longitudinal insights.
3. Team challenges and opt-in shared routines.
4. Native companion apps for reliable background scheduling.
5. Calendar/focus-mode integrations and webhook/API automations.
6. User-created sound packs and reminder templates.
7. Adaptive timing suggestions based on completion behavior.

## 8. Primary user flows

### First visit

1. User sees a 15:00 timer and a short explanation.
2. User selects **Start splashing**.
3. Audio is unlocked through that interaction; the countdown begins.
4. The app offers browser notifications as an optional enhancement, not a blocker.
5. At zero, the in-app reminder appears, sound plays if enabled, and the next cycle is queued after dismissal or snooze.

### Customize

1. User opens settings.
2. User changes interval, sound, volume, message, or visual effects.
3. User previews the sound.
4. Settings save immediately; interval changes reset the current cycle with clear feedback.

### Return visit

1. Saved preferences load immediately.
2. If a previously running deadline is still in the future, the countdown resumes from that deadline.
3. If the deadline passed while the page was unavailable, the reminder appears once and the app avoids replaying a backlog of alarms.

## 9. Functional requirements

- Timer state: `idle | running | paused | ringing`.
- Persist versioned preferences and minimal timer state in local storage.
- Represent time as timestamps at service boundaries.
- Notification permission is requested only after an explicit user action.
- Audio uses the Web Audio API and is generated locally for fast startup and offline use.
- Every modal traps focus, closes predictably, and returns focus to its trigger.
- Changes made in another tab should be able to synchronize in a later iteration.

## 10. Architecture and backend readiness

- **Domain:** timer rules, settings model, and reminder scheduling remain framework-light.
- **Application:** hooks coordinate use cases and expose UI-ready state.
- **Infrastructure:** local storage, browser notifications, and Web Audio are isolated adapters.
- **Presentation:** modular React components do not directly own persistence.
- Define a repository interface so local persistence can later be replaced or composed with a REST/GraphQL client.
- Use versioned schemas and migrations for stored settings.
- Keep reminder events shaped for future API submission (`id`, timestamps, action, routine ID).

Suggested future API surface:

- `GET /v1/preferences`
- `PUT /v1/preferences`
- `GET /v1/routines`
- `POST /v1/reminder-events`
- `GET /v1/insights`

## 11. Non-functional requirements

- Initial JavaScript should stay small; avoid heavy UI and animation libraries.
- UI updates at most once per second while visible and derives remaining time from a deadline.
- Core interactions respond within 100 ms on a typical modern device.
- Target WCAG 2.2 AA for contrast, focus, structure, and input labeling.
- No analytics or personal data leaves the device in P0.
- Unit-test timer and persistence behavior; production build must pass type checking.

## 12. Success metrics

- At least 80% of first-time sessions can start a timer without opening settings.
- At least 95% of active, foreground reminder cycles fire within two seconds of their deadline.
- Zero uncaught errors in start, pause, resume, reset, snooze, and dismiss flows.
- Lighthouse targets: Performance 90+, Accessibility 95+, Best Practices 95+ on production build.

## 13. Risks and mitigations

- **Browser suspension:** use deadline-based reconciliation and clearly explain that native apps are required for guaranteed background alarms.
- **Audio autoplay restrictions:** unlock audio only in direct response to user interaction and never assume permission.
- **Notification denial:** keep the full in-app experience functional without notifications.
- **Configuration overload:** place high-frequency controls up front and advanced choices in a settings panel.
- **Data evolution:** version stored data and keep migrations next to the persistence adapter.

## 14. Release acceptance criteria (P0)

- A new user can start the default timer, pause/resume it, skip a cycle, and receive an in-app reminder.
- Interval, message, sound, volume, and visual preference changes survive a reload.
- Sound preview works after a user gesture and the timer works with sound disabled.
- Browser notification permission can be requested and its state is accurately shown.
- The layout remains usable at 320 px width and at desktop widths.
- Reduced-motion mode removes non-essential animation.
- Type checking, automated tests, and production build succeed.
