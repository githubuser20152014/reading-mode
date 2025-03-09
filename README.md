# Reading Mode Extension

Transform any article into a distraction-free reading experience. This browser extension provides a clean, customizable reading interface with smart features like AI-powered summarization.

## Features

### Core Features
- **Reader Mode**: Transform any article into a clean, distraction-free reading experience
- **Text Customization**: Adjust font size, line height, and font family
- **Dark Mode**: Toggle between light and dark themes for comfortable reading
- **Reading List**: Save articles to read later with quick access to original content
- **Focus Mode**: Enhanced reading experience with Alt + F shortcut

### AI-Powered Features
- **Article Summarization**: Generate concise 3-point summaries of articles using OpenAI
  - Toggle summaries with a single click
  - Clean bullet-point format
  - Requires OpenAI API key

### Reading List
- Save any article while in Reader Mode using the "Save for Later" button
- Access your saved articles from the Premium Features menu
- View all saved articles in a dedicated Reading List page
- For each saved article:
  - Click the title or "Open Article" button to read the original content
  - See estimated reading time and save date
  - Remove articles you've finished reading
- All article data is synced across your devices

### Premium Features
- AI-powered article summaries
- Highlighting and annotations
- More features coming soon!

## Keyboard Shortcuts
- **Alt + R**: Toggle Reading Mode
- **Alt + F**: Toggle Focus Mode (fullscreen distraction-free reading)

## Setup

### Basic Installation
1. Install the extension from the Chrome Web Store
2. Click the extension icon to activate reading mode on any article
3. Use the settings gear icon to customize your reading experience

### Setting up AI Features
1. Get an OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys)
2. Click the settings gear icon in the extension
3. Enter and save your API key in the Premium Features section
4. Your key will be securely stored for future use

## Using the Extension

### Reading Mode
1. Navigate to any article
2. Click the extension icon or press Alt + R to activate reading mode
3. View estimated reading time below the article title
4. Use the controls to adjust text size, font, and theme

### Focus Mode
- Press Alt + F while in reading mode to enter distraction-free fullscreen mode
- Press Alt + F again or Esc to exit focus mode

### Article Summarization
1. Activate reading mode
2. Click the "Summarize" button at the top of the article
3. View your 3-point summary
4. Toggle the summary visibility as needed

## Security & Privacy
- API keys are stored securely using chrome.storage.sync
- Keys are never transmitted except to OpenAI's API
- All API communications use HTTPS
- No user data is stored except the API key
- No tracking or analytics

## Development

### Prerequisites
- Node.js and npm
- Chrome browser for testing
- OpenAI API key for AI features

### Local Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Load the extension in Chrome:
   - Open chrome://extensions/
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the extension directory

### Deployment Checklist
1. Version number updated in manifest.json
2. All features tested:
   - Reading mode toggle (Alt + R)
   - Focus mode (Alt + F)
   - Summarization (with API key)
   - Font controls and dark mode
3. Code minified and optimized
4. Documentation updated
5. Security measures verified

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

[Add your license information here] 