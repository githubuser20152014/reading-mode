# Reading Mode Extension

A Chrome/Brave extension that transforms articles into a clean, distraction-free reading experience with dark mode support.

## Current Features

- 🎭 Smooth transitions between modes
- 🔄 One-click toggle for reading mode
- 📖 Clean article view with optimal typography
- 🌓 Dark mode support with persistent settings
- ✨ Customizable text settings (size, spacing, font)
- 🎯 Removes ads, sidebars, and other distractions
- 📱 Responsive layout for comfortable reading
- 🎨 Single-screen settings interface
- 💎 Premium features in dedicated settings panel
- 🎯 Focused UI with minimal distractions

## Planned User Experience

### Activation Methods
- [ ] Browser toolbar icon with visual readability indicator
- [x] Customizable keyboard shortcuts (e.g., Alt+R)
- [x] Context menu integration

### Transition Experience
- [x] Smooth animation transitions (0.3-0.5s)
- [ ] Background content analysis
- [ ] Loading indicators for longer articles

### Reading Interface
- [x] Minimalistic controls
- [x] Multiple exit options (back arrow, extension icon)
- [x] Single-screen settings panel
- [x] Intuitive navigation between settings

### Smart Features
- [ ] Pre-processing of page content
- [ ] Automatic readability detection
- [ ] Graceful handling of edge cases
  - [ ] Failed content detection warnings
  - [ ] Partial content notices
  - [ ] Interactive content warnings
- [x] Reading time estimation

## Planned Features

### Phase 2: Enhanced Reading Experience
- [x] Font customization (size, family, spacing)
- [ ] Custom width controls
- [ ] Focus mode highlighting
- [ ] Keyboard shortcuts
- [ ] Persistent settings per site

### Phase 3: Advanced Features
- [ ] Text-to-speech support
- [ ] Progress tracking
- [ ] Article saving for offline reading
- [ ] Highlighting and annotations
- [ ] Reading statistics

### Phase 4: Polish & Optimization
- [ ] Performance improvements
- [ ] Cross-browser support
- [ ] Customizable themes
- [ ] Sync settings across devices
- [ ] Smooth transitions and animations
- [ ] Pre-processing optimization
- [ ] Edge case handling

## Installation

### Prerequisites
- Git installed on your machine
- Chrome or Brave browser installed
- Basic knowledge of command line operations

### Steps
1. Clone the repository
   ```bash
   # Using HTTPS
   git clone https://github.com/YOUR_USERNAME/reading-mode-extension.git
   
   # Using SSH
   git clone git@github.com:YOUR_USERNAME/reading-mode-extension.git
   ```

2. Navigate to the project directory
   ```bash
   cd reading-mode-extension
   ```

3. Install dependencies (if any)
   ```bash
   # No dependencies required for basic functionality
   # Future versions may require npm install
   ```

4. Load the extension in Chrome/Brave
   - Open Chrome/Brave and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" button
   - Select the `reading-mode-extension` directory

5. Verify Installation
   - Look for the extension icon in your browser toolbar
   - If you don't see it, click the puzzle piece icon to find it
   - Pin it to your toolbar for easy access

### Troubleshooting
- If the extension doesn't appear, try refreshing the extensions page
- Make sure all required files are present in the directory
- Check the console for any error messages

## Icons
The extension uses three icon sizes:
- 16px: Used for favicon and toolbar
- 48px: Used in extension management page and installation
- 128px: Used in Chrome Web Store and higher resolution displays

Icon files are stored in the `icons/` directory as:
- icon16px.png
- icon48px.png  
- icon128px.png

## Credits

This extension uses [Mozilla's Readability.js](https://github.com/mozilla/readability) for content parsing. 