# Aswa Ka Personal Theatre

> Your personal corner of cinema. Made for Aswa.

A minimal, luxury personal cinema web application built with React 19, TypeScript, Vite, Tailwind CSS v4, and the HTML5 Media API with VLC-inspired playback controls.

---

## Features

- **Ultra-Minimal Interface**: Clean, distraction-free cinema experience.
- **Dynamic URL Streaming**: Paste any direct video link (MP4, WebM, compatible direct stream endpoints) and play instantly.
- **VLC-Inspired Keyboard Shortcuts**:
  - <kbd>Space</kbd>: Play / Pause
  - <kbd>←</kbd> / <kbd>→</kbd>: Rewind / Fast-forward 5 seconds
  - <kbd>↑</kbd> / <kbd>↓</kbd>: Increase / Decrease volume
  - <kbd>M</kbd>: Mute / Unmute
  - <kbd>F</kbd>: Fullscreen
  - <kbd>P</kbd>: Picture-in-Picture
  - <kbd>Esc</kbd>: Exit Fullscreen
- **Speed Selector**: 0.25x to 2x playback speeds.
- **Real-Time Buffer Visualization**: Reads actual `HTMLVideoElement.buffered` chunks to show precise progressive buffer segments.
- **Friendly Error Handling**: Clear, plain-language error reporting with quick retry or link replacement.

---

## Color Palette

- Main Background: `#090909`
- Player Background: `#000000`
- Input Background: `#151515`
- Primary Text: `#FFFFFF`
- Secondary Text: `#999999`
- Border: `#292929`

---

## Vercel Deployment

1. **Deploy via Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel
   ```
2. **Deploy via GitHub**:
   - Push this repository to GitHub.
   - Import the repository in [Vercel](https://vercel.com/new).
   - Framework preset: **Vite**.
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
   - Click **Deploy**.
