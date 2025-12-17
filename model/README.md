# VOSK Model Directory

## 📁 Purpose
This directory should contain the VOSK speech recognition model for local, offline speech-to-text functionality.

## 📥 Download Instructions

### German Model (Recommended)
Download the **vosk-model-small-de-0.15** (50 MB) for German language support:

1. Visit: https://alphacephei.com/vosk/models
2. Download: `vosk-model-small-de-0.15.zip`
3. Extract the ZIP file
4. Place the extracted folder in this directory

### Expected Structure
After downloading and extracting, your directory structure should look like:
```
model/
├── README.md (this file)
└── vosk-model-small-de-0.15/
    ├── am/
    │   └── final.mdl
    ├── conf/
    │   ├── mfcc.conf
    │   └── model.conf
    ├── graph/
    │   ├── Gr.fst
    │   ├── HCLr.fst
    │   └── disambig_tid.int
    ├── ivector/
    ├── README
    └── ...
```

## 🌍 Other Language Models

If you need speech recognition in other languages, download the appropriate model:

### Available Models
- **English**: `vosk-model-small-en-us-0.15` (~40 MB)
- **French**: `vosk-model-small-fr-0.22` (~41 MB)
- **Spanish**: `vosk-model-small-es-0.42` (~39 MB)
- **Italian**: `vosk-model-small-it-0.22` (~48 MB)
- **Portuguese**: `vosk-model-small-pt-0.3` (~31 MB)
- **Dutch**: `vosk-model-small-nl-0.22` (~39 MB)
- **Polish**: `vosk-model-small-pl-0.22` (~50 MB)
- **Turkish**: `vosk-model-small-tr-0.3` (~35 MB)
- **Arabic**: `vosk-model-ar-mgb2-0.4` (~40 MB)

### For Multiple Languages
You can place multiple models in this directory and update `vosk-integration.js` to select the appropriate model based on the selected language.

## 🔧 Integration

The application (`vosk-integration.js`) looks for the model in:
```
model/vosk-model-small-de-0.15/
```

If the model is not found, the application will:
1. Log a warning message
2. Fall back to the browser's built-in speech recognition
3. Display an appropriate error to the user

## 📝 Notes

- VOSK models are completely offline and private
- No internet connection required once downloaded
- All speech processing happens locally on the user's device
- Models are language-specific - download the one you need
- Smaller models (~40-50 MB) are faster and suitable for medical terminology
- Larger models provide better accuracy but require more resources

## ⚠️ Important

**Do NOT commit the model files to git!** They are large binary files and should be:
- Downloaded by each user
- Placed locally in this directory
- Excluded from version control via `.gitignore`

## 🔗 Resources

- VOSK Official Website: https://alphacephei.com/vosk/
- VOSK Models: https://alphacephei.com/vosk/models
- VOSK Documentation: https://alphacephei.com/vosk/documentation
- GitHub Repository: https://github.com/alphacep/vosk-api

## 📞 Support

If you have issues with VOSK models:
1. Verify the model structure matches the expected format
2. Check browser console for error messages
3. Ensure microphone permissions are granted
4. Try the browser fallback option
