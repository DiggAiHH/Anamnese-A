# PWA Features Documentation

## Overview
The Medical History Questionnaire now includes Progressive Web App (PWA) capabilities, making it installable and fully functional offline.

## Features Implemented

### 1. Web App Manifest (`manifest.json`)
- **Purpose**: Defines how the app appears when installed
- **Features**:
  - App name and description
  - Custom theme color (#667eea)
  - Standalone display mode (looks like native app)
  - SVG icons for all sizes (192x192, 512x512)
  - App shortcuts
  - Language and text direction support

### 2. Service Worker (`sw.js`)
- **Purpose**: Enables offline functionality and caching
- **Features**:
  - Offline page caching
  - Cache-first strategy for static assets
  - Network-first strategy for dynamic content
  - Automatic cache cleanup
  - Background sync support (placeholder)
  - Push notifications support (placeholder)

### 3. Enhanced HTML
- **Meta Tags**:
  - `viewport-fit=cover` for iOS notch support
  - `theme-color` for browser chrome customization
  - Apple-specific PWA meta tags
  - Android PWA meta tags

### 4. Accessibility Enhancements
- **Skip Links**: Keyboard navigation shortcuts
- **ARIA Landmarks**: Proper semantic structure
- **Live Regions**: Screen reader announcements
- **Focus Management**: Enhanced focus indicators
- **Keyboard Shortcuts**:
  - `Ctrl+S`: Save data
  - `Ctrl+→`: Next section
  - `Ctrl+←`: Previous section
  - `Esc`: Close modals

### 5. Security Features
- **Enhanced CSP**: Content Security Policy with frame-ancestors protection
- **XSS Prevention**: SecurityUtils for input sanitization
- **Rate Limiting**: SimpleRateLimiter to prevent abuse
- **Secure Storage**: SecureStorage wrapper for localStorage
- **URL Validation**: Only allow safe protocols

### 6. Mobile Optimizations
- **Touch Support**: Touch device detection
- **Offline Indicator**: Visual warning when offline
- **Safe Areas**: iOS notch/dynamic island support
- **Minimum Touch Targets**: 44x44px for accessibility
- **Reduced Motion**: Respect user preferences

## Installation

### Desktop (Chrome/Edge)
1. Visit the app URL
2. Look for install icon in address bar
3. Click "Install" to add to desktop

### iOS (Safari)
1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open app in Chrome
2. Tap menu (⋮)
3. Select "Add to Home Screen" or "Install"
4. Tap "Install"

## Offline Usage

The app automatically caches essential files and works offline:

1. **First Visit**: App caches itself
2. **Subsequent Visits**: App loads from cache
3. **Offline Mode**: Yellow banner appears
4. **Data Saving**: All data saved locally
5. **Online Return**: Automatic sync (when implemented)

## Browser Support

### Full Support
- ✅ Chrome 90+ (Desktop/Android)
- ✅ Edge 90+
- ✅ Safari 14+ (iOS/macOS)
- ✅ Firefox 88+

### Partial Support
- ⚠️ Safari < 14 (no service worker)
- ⚠️ Firefox < 88 (limited PWA features)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current data |
| `Ctrl+→` | Next section |
| `Ctrl+←` | Previous section |
| `Esc` | Close modal |
| `Tab` | Navigate forward |
| `Shift+Tab` | Navigate backward |

## Security Notes

### Data Privacy
- All data stored locally on device
- No external server communication (except CDN libraries)
- Encryption available for sensitive data
- GDPR/DSGVO compliant

### Rate Limiting
The app includes rate limiting to prevent abuse:
- **Save**: 10 attempts per minute
- **Navigation**: 30 attempts per minute
- **Form Submit**: 5 attempts per minute

### XSS Protection
- All user input sanitized
- HTML entity encoding
- URL validation (http/https only)
- No inline event handlers allowed

## Developer Notes

### Service Worker Updates
To force update the service worker:
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

### Clear Cache
To clear all caches:
```javascript
// In browser console
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

### Debug Mode
Open browser DevTools:
- **Application Tab**: View cache, service workers, manifest
- **Console**: See [PWA], [Security], [Storage] logs
- **Network Tab**: Verify offline functionality

## File Structure

```
Anamnese-A/
├── index_v8_complete.html  # Main application
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── ocr-gdpr-module.js      # OCR functionality
└── PWA_FEATURES.md         # This file
```

## Future Enhancements

### Planned Features
- [ ] IndexedDB for larger data storage
- [ ] Background sync for form submission
- [ ] Push notifications for reminders
- [ ] App shortcuts for common actions
- [ ] Share target API
- [ ] Badge API for notifications

### Performance Targets
- LCP < 2.5s ✅
- FID < 100ms ✅
- CLS < 0.1 ✅
- Lighthouse Score > 90 🎯

## Troubleshooting

### PWA Not Installing
1. Check HTTPS (required except localhost)
2. Verify manifest.json loads correctly
3. Check browser console for errors
4. Ensure service worker registered successfully

### Offline Mode Not Working
1. Visit app online first (to cache files)
2. Check service worker status in DevTools
3. Verify files are in cache storage
4. Try hard refresh (Ctrl+Shift+R)

### Data Not Saving
1. Check localStorage is enabled
2. Check available storage quota
3. Look for QuotaExceededError in console
4. Clear old data if storage full

## Support

For issues or questions:
- Check browser console for errors
- Review GDPR compliance docs
- Contact: DiggAi GmbH

## Version History

### v1.0.0 (Current)
- ✅ PWA manifest and service worker
- ✅ 19 language support
- ✅ Enhanced accessibility (WCAG AA)
- ✅ Security improvements
- ✅ Mobile optimizations
- ✅ Offline functionality

## License

See main README.md for license information.
