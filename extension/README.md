# Misinformation Detector - Browser Extension

A lightweight Chrome/Firefox extension for real-time misinformation detection on web pages.

## 🚀 Features

- **Automatic Detection**: Automatically analyzes news articles and blog posts
- **Real-Time Results**: Instant verification with color-coded overlays
- **Smart Caching**: 2-item cache prevents redundant API calls
- **User Controls**: Manual analysis, auto-scan toggle, sensitivity settings
- **Privacy-First**: Only analyzes with user consent, no tracking

## 📦 Installation

### For Development (Chrome)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/misinformation-detector.git
   cd misinformation-detector/extension
   ```

2. Create placeholder icons (or add your own):
   - Place 16x16, 48x48, and 128x128 PNG icons in the `icons/` folder
   - Name them `icon16.png`, `icon48.png`, `icon128.png`

3. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension` folder

### For Development (Firefox)

1. Follow steps 1-2 above

2. Load the extension in Firefox:
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

## 🔧 Configuration

### Backend Server

The extension requires a backend server to function. Update the API endpoint in `content.js` and `background.js`:

```javascript
const CONFIG = {
  API_ENDPOINT: 'http://localhost:8000/api/v1/analyze',
  // ... other config
};
```

### Settings

Access extension settings via the popup:
- **Auto-analyze pages**: Enable/disable automatic content analysis
- **Sensitivity**: Choose between strict, moderate, or lenient detection

## 📂 Project Structure

```
extension/
├── manifest.json          # Extension configuration
├── content.js            # Main content script
├── background.js         # Service worker
├── popup.html           # Popup UI
├── popup.js             # Popup functionality
├── styles.css           # Overlay styles
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── utils/
    ├── contentExtractor.js  # Text extraction
    └── cache.js            # Cache management
```

## 🧪 Testing

### Test on Sample Pages

1. Visit a news article (e.g., BBC News, CNN)
2. The extension should automatically analyze the content
3. Check for the overlay in the top-right corner

### Manual Testing

1. Click the extension icon
2. Click "Analyze This Page"
3. Verify the analysis result appears

### Debug Mode

Open Chrome DevTools Console to see debug logs:
- Right-click on the page → Inspect → Console
- Look for "Misinformation Detector:" logs

## 🔍 How It Works

1. **Content Detection**: Content script identifies article-like content
2. **Text Extraction**: Extracts main text using smart DOM parsing
3. **Cache Check**: Checks if content was recently analyzed
4. **API Request**: Sends text to backend server for analysis
5. **Result Display**: Shows color-coded overlay with results

## 🎨 Result Colors

- 🟢 **Green**: Verified/True content
- 🟡 **Yellow**: Questionable/Misleading content
- 🔴 **Red**: False/Misinformation
- 🟣 **Purple**: Satire content

## 🛠️ Development

### Debugging

1. **Content Script**: Inspect any page → Console
2. **Background Script**: chrome://extensions/ → Details → Inspect views: service worker
3. **Popup**: Right-click popup → Inspect

### Hot Reload

After making changes:
1. Go to `chrome://extensions/`
2. Click the refresh icon on your extension
3. Reload any open pages

### Testing Without Backend

To test the UI without a backend server, modify `content.js` to use mock data:

```javascript
// In analyzeContent function, replace fetch with:
const result = {
  classification: 'verified',
  confidence: 0.95,
  explanation: 'This is a test result',
  highlighted_phrases: ['test', 'example'],
  fact_check_sources: []
};
displayResult(result);
```

## 📝 API Integration

The extension expects the following API response format:

```json
{
  "request_id": "unique-id",
  "classification": "verified|misleading|false|satire",
  "confidence": 0.95,
  "explanation": "Detailed explanation...",
  "highlighted_phrases": ["phrase1", "phrase2"],
  "fact_check_sources": [
    {
      "name": "Source Name",
      "url": "https://example.com",
      "verdict": "True|False|Misleading"
    }
  ],
  "timestamp": "2025-10-14T10:30:00Z"
}
```

## 🐛 Troubleshooting

### Extension Not Loading

- Ensure all required files are present
- Check manifest.json for syntax errors
- Verify icon files exist in icons/ folder

### Analysis Not Working

- Check if backend server is running
- Verify API_ENDPOINT in config
- Check browser console for errors
- Ensure page contains analyzable content

### Overlay Not Appearing

- Check if content was detected (see console logs)
- Verify styles.css is loaded
- Check for CSS conflicts with page styles

## 🔒 Permissions

The extension requests the following permissions:

- `activeTab`: Access current tab for content analysis
- `storage`: Store user preferences and cache
- `scripting`: Inject content scripts into pages
- `host_permissions`: Access web pages for analysis

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/misinformation-detector/issues)
- Documentation: [Full docs](https://github.com/yourusername/misinformation-detector/wiki)

## 🔮 Future Enhancements

- [ ] Firefox AMO submission
- [ ] Chrome Web Store submission
- [ ] Social media integration
- [ ] Offline mode with cached models
- [ ] Multi-language UI
- [ ] Dark mode
- [ ] Advanced analytics dashboard
- [ ] User reputation system

---

**Status**: 🔨 In Development | **Version**: 1.0.0 | **Last Updated**: October 14, 2025
