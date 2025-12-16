# Vosk Speech Recognition Models

This directory contains the Vosk speech recognition models for offline use.

## Required Model

For German speech recognition, download the **vosk-model-small-de-0.15** model.

### Download Instructions

1. **Visit the Vosk Models Page**:
   - Go to: https://alphacephei.com/vosk/models

2. **Download German Model**:
   - Look for: **vosk-model-small-de-0.15**
   - Size: ~45MB
   - Direct link: https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip

3. **Place Model in This Directory**:
   ```bash
   # From the project root:
   cd models
   
   # Download model (Linux/Mac):
   wget https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip
   
   # Or using curl:
   curl -O https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip
   ```

4. **Keep as ZIP or Extract** (both work):
   ```bash
   # Option 1: Keep as zip (recommended)
   # Just leave the .zip file here
   
   # Option 2: Extract
   unzip vosk-model-small-de-0.15.zip
   ```

### Expected Structure

After setup, your models directory should contain:

```
models/
├── README.md (this file)
└── vosk-model-small-de-0.15.zip (or extracted folder)
```

## Alternative: Automatic CDN Fallback

If you don't download the local model, the application will automatically fall back to loading the model from a CDN. However, local models provide:

- ✅ Faster loading
- ✅ Offline functionality
- ✅ No internet dependency
- ✅ Better privacy (no external requests)

## Other Language Models (Optional)

If you want to add speech recognition for other languages:

### English (Small Model - 40MB)
- Model: vosk-model-small-en-us-0.15
- Download: https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip

### English (Large Model - 1.8GB)
- Model: vosk-model-en-us-0.22
- Download: https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip

### Other Languages
- Spanish: vosk-model-small-es-0.42
- French: vosk-model-small-fr-0.22
- Russian: vosk-model-small-ru-0.22
- Chinese: vosk-model-small-cn-0.22
- Turkish: vosk-model-small-tr-0.3

Visit https://alphacephei.com/vosk/models for the complete list.

## Updating the Application to Use Different Models

To use a different model, edit `index_v5.html`:

```javascript
// Find this line in the VoskHandler.init() function:
const localModelUrl = "models/vosk-model-small-de-0.15.zip";

// Change it to your model:
const localModelUrl = "models/your-model-name.zip";
```

## Troubleshooting

### Model Not Loading
1. Check that the model file is in the `models/` directory
2. Verify the filename matches exactly: `vosk-model-small-de-0.15.zip`
3. Check browser console for errors
4. Try using CDN fallback (automatic)

### Model File Too Large
- The .zip file should be ~45MB
- If much larger, you may have downloaded the wrong model
- Re-download from the official Vosk models page

### Permission Errors
- Ensure the models directory has read permissions
- Run your web server with appropriate permissions

## Performance Notes

- **Small models** (40-50MB): Fast, suitable for simple commands
- **Large models** (1-2GB): Better accuracy, higher resource usage
- **Recommended**: Small models for medical questionnaires

## Privacy & Security

- All speech recognition happens locally
- No audio sent to external servers
- No internet required after model download
- Complete privacy for patient data

## License

Vosk models are licensed under Apache 2.0. See: https://alphacephei.com/vosk/

## Support

- Vosk Documentation: https://alphacephei.com/vosk/
- Vosk GitHub: https://github.com/alphacep/vosk-api
- Issues: Check application logs in browser console
