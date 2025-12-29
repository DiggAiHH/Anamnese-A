#!/usr/bin/env python3
"""
DSGVO-Compliant HTTP Server with proper CORS/CSP headers
No external dependencies - runs with Python stdlib only
"""

import http.server
import socketserver
import os
from urllib.parse import unquote

PORT = 8080

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with GDPR-compliant security headers"""
    
    def end_headers(self):
        """Add security headers to all responses"""
        # HISTORY-AWARE: Previous sessions had CSP blocking issues
        # DSGVO-SAFE: Allow only necessary sources, no external tracking
        
        # Content Security Policy - Permissive for local development
        self.send_header('Content-Security-Policy', 
            "default-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
            "font-src 'self' data:; "
            "img-src 'self' data: blob:; "
            "connect-src 'self' blob:; "
            "media-src 'self' blob:; "
            "worker-src 'self' blob:; "
            "frame-ancestors 'self';"
        )
        
        # CORS Headers - Allow all origins for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        
        # Additional Security Headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        
        # Cache Control - Prevent stale content during development
        if self.path.endswith('.html'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom logging with color coding"""
        status_code = args[1] if len(args) > 1 else ''
        
        # Color-code by status
        if status_code.startswith('2'):
            color = '\033[92m'  # Green for success
        elif status_code.startswith('3'):
            color = '\033[93m'  # Yellow for redirects
        elif status_code.startswith('4'):
            color = '\033[91m'  # Red for client errors
        elif status_code.startswith('5'):
            color = '\033[91m'  # Red for server errors
        else:
            color = '\033[0m'   # Default
        
        reset = '\033[0m'
        print(f"{color}[{self.log_date_time_string()}] {format % args}{reset}")

def main():
    """Start the development server"""
    # Change to project root
    os.chdir('/workspaces/Anamnese-A')
    
    # Create socket server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print("\n" + "="*70)
        print(f"🚀 DSGVO-Compliant Development Server gestartet!")
        print("="*70)
        print(f"\n📍 Lokaler Zugriff:")
        print(f"   http://localhost:{PORT}")
        print(f"   http://127.0.0.1:{PORT}")
        print(f"\n📂 Test-Suites:")
        print(f"   http://localhost:{PORT}/app-v8-complete/tests/test-vosk-speech.html")
        print(f"   http://localhost:{PORT}/app-v8-complete/tests/test-nfc-export.html")
        print(f"   http://localhost:{PORT}/app-v8-complete/tests/test-ocr-integration.html")
        print(f"\n🔐 Security Headers:")
        print(f"   ✅ Content-Security-Policy (permissive for dev)")
        print(f"   ✅ CORS enabled (Access-Control-Allow-Origin: *)")
        print(f"   ✅ X-Frame-Options: SAMEORIGIN")
        print(f"   ✅ No-Cache für HTML (hot-reload friendly)")
        print(f"\n⚠️  Stoppen mit: CTRL+C")
        print("="*70 + "\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Server gestoppt.")
            print("="*70)

if __name__ == "__main__":
    main()
