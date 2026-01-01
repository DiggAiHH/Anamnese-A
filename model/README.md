# VOSK Model Directory (Legacy)

## 📁 Purpose
Hinweis: Die aktuelle App-Integration verwendet den Ordner `models/` für Offline-Vosk-Modelle.
Der Ordner `model/` ist nur noch aus historischen Gründen vorhanden.

## 🔄 Automated Download (Recommended)

Run the hardened helper script from the repository root:

```bash
./download-vosk.sh
```

What the script does:

- Downloads `vosk.js`, `vosk.wasm`, and `vosk-model-small-de-0.15.zip`
- Verifies every artifact via SHA-256 before placing it in the correct folder
- Falls back to an alternative CDN when jsDelivr is unavailable
- Creates/updates `models/vosk-model-small-de-0.15.zip.sha256` so you can verify future downloads offline
- Replaces older model folders atomically to avoid partially extracted data

You can override the model source (e.g., internal mirror) by setting `VOSK_MODEL_URL_OVERRIDE="https://your.mirror/vosk-model-small-de-0.15.zip"` before running the script.

## 📥 Manual Download Instructions

### German Model (Recommended)
Download the **vosk-model-small-de-0.15** (50 MB) for German language support:

1. Visit: https://alphacephei.com/vosk/models
2. Download: `vosk-model-small-de-0.15.zip`
3. Extract the ZIP file
4. Place the extracted folder in this directory

### Expected Structure
After downloading and extracting, your directory structure should look like:
```
models/
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

The application (`vosk-integration.js` / `index_v8_complete.html`) looks for the model in:
```
models/vosk-model-small-de-0.15/
```

If the model is not found, the application will:
1. Log a warning message
2. Fall back to the browser's built-in speech recognition
3. Display an appropriate error to the user

## 🔐 Integrity Verification

If you must download files manually, always validate the checksums before extracting:

| Artifact | Destination | SHA-256 |
| --- | --- | --- |
| `vosk.js` | `public/lib/vosk/vosk.js` | `29504515526e974f4cb053cf08811c4de5fb2a74007c0a5a957db50eaa8d5d0c` |
| `vosk.wasm` | `public/lib/vosk/vosk.wasm` | `d51a01d7b07a3b6f20ed3b5288bef4d70cca9aa4426065317603355a587b6d90` |
| `vosk-model-small-de-0.15.zip` | `models/vosk-model-small-de-0.15.zip` | `b7e53c90b1f0a38456f4cd62b366ecd58803cd97cd42b06438e2c131713d5e43` |

```bash
sha256sum -c models/vosk-model-small-de-0.15.zip.sha256
```

The command above is automatically created/updated by `download-vosk.sh`, but you can also compare hashes manually using the table.

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
