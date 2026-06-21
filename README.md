# Calculator

[![Download APK](https://img.shields.io/github/v/release/samkiell/SEN-214-Calculator?label=Download%20APK&logo=android&color=FF9F45)](https://github.com/samkiell/SEN-214-Calculator/releases/latest)
[![Built with EAS](https://img.shields.io/badge/Built%20with-EAS%20Build-4630EB?logo=expo&logoColor=white)](https://expo.dev/accounts/samkiel/projects/sen-214-calculator)

A mobile calculator built with **React Native (Expo)** and **TypeScript** for the **SEN 214** mobile development assignment. It supports basic arithmetic plus a full scientific mode — all math is computed with JavaScript's built-in `Math` object, no external math libraries.

> Built on **Expo SDK 54** • React Native 0.81 • React 19 • TypeScript 5.9

---

## Download

📲 **[Download the latest Android APK](https://github.com/samkiell/SEN-214-Calculator/releases/latest)** — or grab [`Calculator-v1.0.0.apk` directly](https://github.com/samkiell/SEN-214-Calculator/releases/download/v1.0.0/Calculator-v1.0.0.apk) (~56 MB).

1. Download the `.apk` onto your Android device.
2. Open it and allow installing from unknown sources if prompted.
3. Launch **Calculator**.

> It's an internal-distribution build, so Android may warn that it's from an unknown developer — that's expected for a sideloaded app. Prefer to run from source instead? See [Getting started](#getting-started).

---

## Features

### Core (basic mode)
- Addition, subtraction, multiplication, division
- Parentheses for grouping
- Decimal point support
- **AC** to clear, **DEL** to delete the last entry
- Live result preview while typing, plus final result on **=**
- Graceful **divide-by-zero** and invalid-input handling (shows `Error`)

### Scientific mode (bonus)
Tap **SCI** to reveal extra rows above the basic keypad.

| Group | Keys |
|-------|------|
| Trigonometric (degrees) | `sin` · `cos` · `tan` |
| Inverse trig | `sin⁻¹` · `cos⁻¹` · `tan⁻¹` |
| Hyperbolic | `sinh` · `cosh` · `tanh` |
| Powers & roots | `x²` · `xʸ` · `√` |
| Logarithms | `log` (base 10) · `ln` (natural) |
| Factorial | `n!` |
| Constants | `π` · `e` |
| Combinatorics | `nPr` · `nCr` |
| Statistics | `x̄` (mean) · `σ²` (variance) · `σ` (std. dev.) |

- **Trig functions work in degrees** (e.g. `sin(30) = 0.5`).
- **nPr / nCr** open a small dialog for `n` and `r`.
- **Statistics** open a dialog that accepts a comma-separated data set (e.g. `4, 8, 15, 16, 23, 42`). Variance and standard deviation are **population** measures (divide by N).

---

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS or newer)
- The **Expo Go** app on your phone — [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)
  > This project targets **Expo SDK 54**, which matches the current Expo Go release.

### Install & run

```bash
# 1. install dependencies
npm install

# 2. start the dev server (-c clears the Metro cache)
npx expo start -c
```

Then either:
- **Scan the QR code** with Expo Go on your device, or
- press **`a`** for an Android emulator, **`i`** for an iOS simulator, or **`w`** for web.

No login or configuration changes are required.

---

## Usage notes

- The large top line shows the **live/committed result**; the line below shows the **expression** you're typing.
- Function keys insert an open parenthesis (e.g. tapping `sin` inserts `sin(`) so you can type the argument and close it — for example `sin ( 4 5 ) =`.
- After pressing **=**, typing a digit starts a fresh calculation, while typing an operator continues from the previous result.
- Anything the engine can't evaluate shows `Error`; press **AC** or keep typing to recover.

---

## Project structure

```
.
├── App.tsx                      # Main screen: state, key handling, live preview, mode toggle
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build profiles (preview = installable APK)
├── babel.config.js              # Babel (babel-preset-expo)
├── tsconfig.json                # TypeScript configuration
└── src
    ├── mathEngine.ts            # Tokenizer → shunting-yard → RPN evaluator + nPr/nCr/stats helpers
    ├── theme.ts                 # Dark-theme color & sizing tokens
    ├── keyLayouts.ts            # Basic + scientific button-row definitions
    └── components
        ├── Display.tsx          # Result (top) + expression (below), both horizontally scrollable
        ├── Keypad.tsx           # Renders a grid of rows from a layout
        ├── CalcButton.tsx       # Pressable key with press feedback
        └── InputModal.tsx       # Multi-value input dialog (nPr/nCr/statistics)
```

### How the math works
Expressions are evaluated in three stages, all using only the `Math` object:

1. **Tokenize** — split the string into numbers, operators, functions, parentheses, and constants; detect unary minus.
2. **Shunting-yard** — convert tokens to Reverse Polish Notation, honoring precedence and right-associativity (`^`).
3. **Evaluate** — reduce the RPN stack to a single value, throwing on malformed input or math errors (e.g. division by zero), which the UI surfaces as `Error`.

Combinatorial and statistical operations (`nPr`, `nCr`, mean, variance, std. dev.) are standalone helpers in the same module.

---

## Tech stack

| | |
|---|---|
| Framework | React Native via Expo (managed workflow) |
| Language | TypeScript (strict) |
| Styling | React Native `StyleSheet` only |
| Math | JavaScript built-in `Math` object — no external libraries |
| Navigation | None — single screen (no `expo-router`) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo dev server |
| `npm run android` | Open on an Android device/emulator |
| `npm run ios` | Open on an iOS simulator |
| `npm run web` | Open in the browser |
| `npx tsc --noEmit` | Type-check the project |
| `npx expo-doctor` | Verify the project is healthy |

---

## Notes
- Fully client-side; no backend.
- Tested on Android via Expo Go.
