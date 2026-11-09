# Splash

A calm, configurable React reminder for taking a quick water-splash break. The default rhythm is 15 minutes; timing, messages, notification behavior, sound, volume, and visual motion are configurable.

Splash is also an installable PWA. Its application shell is cached for offline use, it includes mobile app icons, and foreground/background reminders use the installed service worker when notification permission is granted.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run test
npm run lint
npm run build
```

## Architecture

The app intentionally separates product rules from browser capabilities:

- `src/domain` — settings and drift-resistant timer rules.
- `src/application` — React hooks and persistence contracts.
- `src/infrastructure` — local storage, Web Audio, and browser notification adapters.
- `src/components` — presentation components.

The `SettingsRepository` and `TimerRepository` contracts are the seams for future REST/GraphQL-backed implementations. A backend adapter can sync local state without coupling network behavior to the UI.

## Browser behavior

Splash derives its countdown from an absolute deadline, so throttled tabs do not accumulate timer drift. Browser and operating-system suspension can still delay web timers. Notifications improve background visibility when permission is granted, but a native app would be required for guaranteed alarms while a device is asleep.

### Installing on a phone

- Android/Chromium: use the in-app **Install app** action or the browser's install option.
- iPhone/iPad: open the deployed site in Safari, use **Share → Add to Home Screen**, launch it from the new icon, and enable notifications inside the installed app.

The service worker contains a Web Push handler for future backend integration. Closed-app alerts require a server to store push subscriptions and send scheduled push messages; local JavaScript timers cannot reliably wake a PWA after the operating system terminates it.

See [PRD.md](./PRD.md) for the P0/P1/P2 roadmap and acceptance criteria.
