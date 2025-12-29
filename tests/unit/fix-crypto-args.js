const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'encryption.test.js');
let content = fs.readFileSync(filePath, 'utf8');

// Pattern 1: deriveKey with 2 args (password, salt) -> add global.crypto
content = content.replace(
  /await deriveKey\(([^,]+),\s*([^)]+)\)(?!\s*,)/g,
  'await deriveKey($1, $2, global.crypto)'
);

// Pattern 2: encryptData with 2 args (plaintext, password) or 3 args with true -> add global.crypto
content = content.replace(
  /await encryptData\(([^,]+),\s*([^,)]+)\)(?!\s*,)/g,
  'await encryptData($1, $2, true, global.crypto)'
);

content = content.replace(
  /await encryptData\(([^,]+),\s*([^,]+),\s*(true|false)\)(?!\s*,)/g,
  'await encryptData($1, $2, $3, global.crypto)'
);

// Pattern 3: decryptData with 3 args (password, encrypted, salt) -> add global.crypto
content = content.replace(
  /await decryptData\(([^,]+),\s*([^,]+),\s*([^)]+)\)(?!\s*,)/g,
  'await decryptData($1, $2, $3, global.crypto)'
);

// Clean up double global.crypto
content = content.replace(/global\.crypto,\s*global\.crypto/g, 'global.crypto');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Alle crypto-Argumente hinzugefügt');
