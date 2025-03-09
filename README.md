# Reading Mode Extension

Transform any article into a distraction-free reading experience. This browser extension provides a clean, customizable reading interface with smart features like AI-powered summarization.

## Features

### Core Features
- **Clean Reading Interface**: Removes ads, sidebars, and other distractions
- **Reading Time Estimation**: Shows approximate reading time based on article length
- **Font Controls**: Customize font family, size, and line height
- **Dark Mode**: Toggle between light and dark themes for comfortable reading
- Keyboard shortcut (Alt+R) to toggle reading mode

### AI-Powered Features
- **Article Summarization**: Generate concise 3-point summaries of articles using OpenAI
  - Toggle summaries with a single click
  - Clean bullet-point format
  - Requires OpenAI API key

### Premium Features
- AI-powered article summarization
- Highlighting and notes (coming soon)

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

## Using the Summarizer

1. Open any article you want to read
2. Activate reading mode
3. Click the "Summarize" button at the top of the article
4. View your 3-point summary
5. Toggle the summary visibility as needed

## Security

- API keys are stored securely using chrome.storage.sync
- Keys are never transmitted except to OpenAI's API
- All API communications use HTTPS
- API keys are masked by default with optional visibility toggle

## Privacy

- Article content is processed locally for basic features
- Only necessary content is sent to OpenAI for summarization
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

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

[Add your license information here] 