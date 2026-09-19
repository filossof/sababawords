# SababaWords – Design

**Goal:** Duolingo-style game for Hebrew-speaking kids aged 10–14 learning English and Arabic (MSA),
plus a **test-prep** feature: enter a language + vocabulary list → generated levels.

## Architecture
- Static PWA: Vite + React + TypeScript, `vite-plugin-pwa` (installable, offline).
- Hosting: GitHub Pages (`gh-pages` branch). No backend; progress in localStorage/IndexedDB per device.
- Audio: Web Speech API (he-IL, en-US, ar). Hide listening exercises if no voice is available.
- UI is Hebrew/RTL; English exercises LTR, Arabic RTL – handle mixed direction.

## Core game
Map of units → lessons (10–15 exercises). Exercise types: multiple choice (both directions),
match pairs, type answer (on-screen keyboards for EN/AR), word bank, listen & choose/type, flashcard intro.
XP, daily streak, hearts, missed words re-queued. Local profiles (name + avatar) so siblings can share a device.
Arabic: alphabet unit, optional Hebrew-letter transliteration, diacritics toggle.

## Test-prep feature
Input: language pair, vocabulary list (`word - translation` lines / CSV, words or phrases), optional test date.
Deterministic generation (offline, no AI), ~5 levels:
1. Meet the words (flashcards + easy MC, batches of 5–6)
2. Recognize (MC both directions, distractors from the list)
3. Match & listen
4. Spell it (typing / scrambled letters)
5. Mock test (all words, mixed, no hints, score)

Per-word tracking with spaced repetition (1/3/7 days); "Weak words" practice lesson.
Share decks via URL hash so a parent can build on PC and open on the phone. Countdown to test date.

## Layout
```
src/engine/      level generator, exercise builders, spaced repetition
src/components/  exercise UIs, lesson map, deck creator
src/store/       progress + decks
```

## Plan
1. Scaffold + deploy hello world ✅
2. Exercise components + lesson player
3. Deck creator + level generator
4. Map, XP/streaks, audio
5. PWA polish, offline
