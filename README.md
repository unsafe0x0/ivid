# ivid - Desktop Video Player

A sleek, highly polished, and minimalist native desktop video player built with Electron, React, Vite, and TypeScript. Designed with a focus on clean aesthetics, hardware acceleration, zero distractions, and professional-grade playback features.

## Features

### Deep Desktop Integration
- **Native OS File Menu:** A true desktop experience with a native top-bar menu for opening individual files, multiple files, or scanning entire directories for videos.
- **"Open With..." Support:** Seamlessly integrated with Linux `.desktop` file associations. Right-click any supported video file in your OS and open it instantly in `ivid`.

### Playback & Queue Management
- **Drag-and-Drop & Multi-file Upload:** Seamlessly drop individual video files or entire folders into the application window to instantly build a playback queue.
- **Smart Queue Panel:** A sleek, glassmorphic "Up Next" playlist manager that allows you to click between loaded videos or automatically advance to the next track on completion.
- **A-B Looping:** Mark custom start and end points (`I` and `O`) to endlessly loop specific segments of a video for detailed analysis.

### Advanced Video & Audio Processing
- **Cinematic Ambient Glow:** A hardware-accelerated background layer that dynamically mirrors the video's colors in real-time, creating a highly immersive, blurred "ambilight" effect.
- **Live Timeline Thumbnails:** Hovering over the progress bar intelligently scrubs a hidden, synchronized video buffer to display instant, exact-frame previews.
- **Real-Time Video Adjustments:** A dedicated settings panel offering dynamic CSS filter manipulation, including Brightness, Contrast, Saturation, Hue, Sepia, Sharpness (via a custom SVG convolution matrix), and Exposure.
- **Professional Audio Equalizer:** Powered by the Web Audio API (`BiquadFilterNode` and `GainNode`), featuring a Bass Boost (lowshelf filter), Treble/Clarity enhancer (highshelf filter), and a Volume Booster that can amplify quiet video audio up to 400%.
- **Subtitle Support:** Dynamically load and toggle local `.srt` and `.vtt` subtitle files directly into the player interface.

### Utility & Quality of Life
- **Raw Frame Capture:** A dedicated screenshot tool that bypasses the viewport and extracts the native, full-resolution video frame directly from the media buffer, preserving all applied color grading.
- **Smart Interface Hiding:** Controllers and menus automatically fade out to provide an uninterrupted viewing experience, while remaining intuitively accessible via mouse movement.
- **Shortcuts Cheat Sheet:** Press `?` (or Shift + /) at any time to pull up a beautifully blurred, glassmorphic overlay detailing all available hotkeys.

## Keyboard Shortcuts

- **Space / K** - Play / Pause
- **M** - Toggle Mute
- **F** - Toggle Fullscreen
- **S** - Capture Screenshot
- **C** - Toggle Subtitles
- **I / O** - Set A-B Loop Start / End
- **Backspace** - Clear A-B Loop
- **, / .** - Step Frame Backward / Forward
- **Arrow Left / Right** - Skip backward / forward 10 seconds
- **Arrow Up / Down** - Increase / decrease volume by 10%
- **? (Shift + /)** - Show Keyboard Shortcuts

## Development Setup

The project is built using modern web standards inside a high-performance Electron wrapper.

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development server (runs Vite & Electron concurrently):
   ```bash
   bun run dev
   ```

3. Build production installers for Linux (`.deb` and `.AppImage`):
   ```bash
   bun run electron:build
   ```

## Technology Stack

- Electron (Desktop runtime)
- React 19
- TypeScript
- Vite
- Custom CSS (Glassmorphism design system)
