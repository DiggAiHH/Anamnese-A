# Installation & Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Download the Repository
```bash
git clone https://github.com/AbdullahAlshdyfat2004/Anamnese-.git
cd Anamnese-
```

### Step 2: Open the Application
Simply open `index.html` in your web browser:
- **Windows**: Double-click `index.html`
- **Mac**: Right-click `index.html` → Open With → Browser
- **Linux**: `xdg-open index.html` or `firefox index.html`

### Step 3: Use the Application
The application works immediately! No installation, no server, no dependencies.

## 🎤 Adding Speech Recognition (Optional)

For local speech recognition with VOSK:

### Step 1: Download VOSK Model
1. Visit https://alphacephei.com/vosk/models
2. Download `vosk-model-small-de-0.15.zip` (50 MB)
3. Extract the ZIP file

### Step 2: Install the Model
```bash
# Create model directory if it doesn't exist
mkdir -p model

# Move the extracted model folder
mv vosk-model-small-de-0.15 model/
```

### Step 3: Verify Installation
Your structure should be:
```
Anamnese-/
├── index.html
├── model/
│   └── vosk-model-small-de-0.15/
│       ├── am/
│       ├── conf/
│       └── graph/
└── ...
```

### Step 4: Test Speech Recognition
1. Open `index.html` in your browser
2. Click any microphone button (🎤)
3. Allow microphone access when prompted
4. Speak in German
5. Your speech should be transcribed to text

## 🌐 Browser Compatibility

### Fully Supported
- ✅ Chrome/Chromium 60+
- ✅ Firefox 60+
- ✅ Edge 79+
- ✅ Safari 11+

### Required Browser Features
- Web Crypto API (for encryption)
- Web Audio API (for speech recognition)
- LocalStorage (for data storage)
- Web Workers (for VOSK processing)

## 🔧 Advanced Setup

### Running on a Local Web Server (Optional)

Some features work better with a web server:

#### Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: http://localhost:8000

#### Using Node.js:
```bash
npx http-server -p 8000
```

#### Using PHP:
```bash
php -S localhost:8000
```

### Service Worker (Optional)

For full offline PWA support, uncomment the service worker code in `app.js` and create a `sw.js` file.

## 📱 Mobile Setup

### iOS (iPhone/iPad)
1. Open Safari
2. Navigate to the `index.html` file location
3. Tap the Share button
4. Select "Add to Home Screen"
5. The app now works like a native app!

### Android
1. Open Chrome
2. Navigate to the application
3. Tap the menu (three dots)
4. Select "Add to Home screen"
5. The app is now on your home screen!

## 🔐 Security Setup

### HTTPS (Recommended for Production)

For production use, serve over HTTPS:

1. **GitHub Pages** (Free):
   - Push to GitHub
   - Enable GitHub Pages in repository settings
   - Access via `https://username.github.io/Anamnese-/`

2. **Local HTTPS**:
   ```bash
   # Using mkcert
   mkcert -install
   mkcert localhost
   # Then serve with HTTPS-enabled server
   ```

3. **Cloudflare Pages** (Free):
   - Connect your repository
   - Automatic HTTPS deployment

## 🧪 Testing the Application

### Test Encryption
1. Fill in some form data
2. Click "Save Encrypted"
3. Enter a password
4. Check browser console: `localStorage.getItem('anamneseData')`
5. You should see encrypted (unreadable) data

### Test Decryption
1. Clear the form
2. Click "Load Saved Data"
3. Enter the same password
4. Form should be populated with your data

### Test Export
1. Fill in form data
2. Click "Export as JSON"
3. Check your Downloads folder
4. Open the JSON file - data should be readable

### Test Voice Recognition
1. Click a microphone button
2. Allow microphone access
3. Speak clearly
4. Verify text appears in the field

## 🐛 Troubleshooting

### Issue: Encryption doesn't work
**Solution**: Your browser doesn't support Web Crypto API. Use a modern browser (Chrome, Firefox, Edge, Safari).

### Issue: Voice recognition doesn't work
**Solution**: 
- Check microphone permissions
- Verify VOSK model is in correct location
- Try browser's fallback speech recognition
- Check browser console for errors

### Issue: Data not saving
**Solution**:
- Check if localStorage is enabled in browser settings
- Ensure you're not in incognito/private mode
- Check browser console for errors

### Issue: VOSK model not loading
**Solution**:
- Verify model folder structure
- Check model path in `vosk-integration.js`
- Serve from web server instead of file://
- Use browser fallback speech recognition

### Issue: Page doesn't load
**Solution**:
- Check browser console for JavaScript errors
- Verify all files are present
- Try opening in a different browser
- Clear browser cache

## 📊 Performance Tips

1. **Large forms**: Use autosave feature (enabled by default)
2. **Slow speech recognition**: Consider using browser fallback
3. **Memory usage**: Clear localStorage periodically
4. **Mobile performance**: Close other apps for better performance

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull origin main

# Clear browser cache
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Safari: Cmd+Option+E
```

## 💾 Backup and Restore

### Backup Your Data
1. Click "Export as JSON"
2. Save the file securely
3. Or manually: `localStorage.getItem('anamneseData')`

### Restore Your Data
1. Import JSON file (manually copy to form)
2. Or save encrypted data to localStorage
3. Click "Load Saved Data"

## 🆘 Getting Help

If you encounter issues:
1. Check browser console for errors
2. Review this installation guide
3. Check the main README.md
4. Open an issue on GitHub
5. Verify browser compatibility

## ✅ Verification Checklist

- [ ] `index.html` opens in browser
- [ ] Form displays correctly
- [ ] Language selector works
- [ ] Can fill in form fields
- [ ] Encryption/decryption works
- [ ] JSON export works
- [ ] Voice recognition works (if VOSK installed)
- [ ] Data persists after browser close
- [ ] All 10 languages display correctly

## 🎓 Next Steps

1. Customize the form fields for your needs
2. Add custom styling in `styles.css`
3. Translate to additional languages in `translations.js`
4. Add more VOSK models for other languages
5. Implement service worker for full PWA support

---

**Enjoy your privacy-compliant medical history application! 🏥**
