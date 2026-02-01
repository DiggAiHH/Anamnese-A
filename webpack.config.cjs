/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.web.tsx',
  output: {
    path: path.resolve(__dirname, 'build/web'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      // Path aliases (matching tsconfig.json paths)
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      // Mock native modules for web
      'react-native-keychain': path.resolve(__dirname, 'src/infrastructure/web-mocks/keychain.ts'),
      '@react-native-voice/voice': path.resolve(__dirname, 'src/infrastructure/web-mocks/voice.ts'),
      'react-native-fs': path.resolve(__dirname, 'src/infrastructure/web-mocks/fs.ts'),
      'react-native-sqlite-storage': path.resolve(
        __dirname,
        'src/infrastructure/web-mocks/sqlite.ts',
      ),
      'react-native-document-picker': path.resolve(
        __dirname,
        'src/infrastructure/web-mocks/documentPicker.ts',
      ),
      'react-native-share': path.resolve(__dirname, 'src/infrastructure/web-mocks/share.ts'),
      'react-native-gesture-handler': path.resolve(
        __dirname,
        'src/infrastructure/web-mocks/gestureHandler.ts',
      ),
      'react-native-safe-area-context': path.resolve(
        __dirname,
        'src/infrastructure/web-mocks/safeAreaContext.ts',
      ),
      'react-native-screens': path.resolve(__dirname, 'src/infrastructure/web-mocks/screens.ts'),
      'react-native-reanimated': path.resolve(
        __dirname,
        'src/infrastructure/web-mocks/reanimated.ts',
      ),
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        'src/infrastructure/web-mocks/asyncStorage.ts',
      ),
      'react-native-date-picker': path.resolve(
        __dirname,
        'src/infrastructure/web-mocks/datePicker.tsx',
      ),
      'react-native-tesseract-ocr': path.resolve(
        __dirname,
        'src/infrastructure/web-mocks/tesseractOcr.ts',
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            plugins: ['react-native-web'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'klaproth - Medizinische Anamnese',
      templateContent: `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0f172a" />
    <meta name="description" content="DSGVO-konforme medizinische Anamnese" />
    <title>klaproth – Medizinische Anamnese</title>
    <style>
      html, body, #root { height: 100%; margin: 0; padding: 0; }
      body { background: #f5f5f5; }
      #root { min-height: 100%; }
      
      /* Hover-Effekte */
      [class*="answerOverviewRow"]:hover { background-color: #f3f4f6 !important; transform: translateX(4px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
      [class*="radioOption"]:hover { border-color: #3b82f6 !important; background-color: #f0f9ff !important; transform: scale(1.02); }
      input:focus, textarea:focus { border-color: #3b82f6 !important; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
      button:hover, [role="button"]:hover { transform: translateY(-2px); }
      [class*="darkModeToggle"]:hover { transform: rotate(20deg) scale(1.1); }
      
      /* Slider */
      input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; cursor: pointer; box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4); transition: all 0.2s ease; }
      input[type="range"]::-webkit-slider-thumb:hover { background: #2563eb; transform: scale(1.2); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6); }
      input[type="range"]::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: none; box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4); transition: all 0.2s ease; }
      input[type="range"]::-moz-range-thumb:hover { background: #2563eb; transform: scale(1.2); }
      
      /* Transitions */
      * { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease; }
    </style>
    <script>
      (function () {
        var root = null;
        var statusEl = null;
        var statusQueue = [];
        var bodyReady = false;
        function onBodyReady(fn) {
          if (bodyReady) return fn();
          if (document.body) {
            bodyReady = true;
            return fn();
          }
          document.addEventListener('DOMContentLoaded', function () {
            bodyReady = true;
            fn();
          });
        }
        function ensureStatus() {
          if (!statusEl) {
            statusEl = document.getElementById('__boot_status__');
            if (!statusEl) {
              statusEl = document.createElement('div');
              statusEl.id = '__boot_status__';
              statusEl.style.position = 'fixed';
              statusEl.style.bottom = '12px';
              statusEl.style.right = '12px';
              statusEl.style.background = 'rgba(15, 23, 42, 0.9)';
              statusEl.style.color = '#fff';
              statusEl.style.fontSize = '12px';
              statusEl.style.padding = '8px 10px';
              statusEl.style.borderRadius = '8px';
              statusEl.style.zIndex = '9999';
              statusEl.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
              onBodyReady(function () {
                if (statusEl && statusEl.parentNode !== document.body) {
                  document.body.appendChild(statusEl);
                  while (statusQueue.length) {
                    statusEl.textContent = statusQueue.shift();
                  }
                }
              });
            }
          }
          return statusEl;
        }
        function setStatus(text) {
          var el = ensureStatus();
          if (el && el.parentNode) {
            el.textContent = text;
          } else {
            statusQueue.push(text);
          }
        }
        function ensureRoot() {
          if (!root) root = document.getElementById('root');
          return root;
        }
        function renderBootError(message, stack) {
          var el = ensureRoot();
          if (!el) return;
          el.innerHTML =
            '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;">' +
            '<h1 style="color:#b91c1c;font-size:20px;">Startfehler</h1>' +
            '<p style="color:#111827;">' + String(message || 'Unbekannter Fehler') + '</p>' +
            (stack ? '<pre style="white-space:pre-wrap;color:#6b7280;">' + stack + '</pre>' : '') +
            '</div>';
        }
        setStatus('Boot: Script geladen');
        window.addEventListener('error', function (event) {
          renderBootError(event && event.message, event && event.error && event.error.stack);
        });
        window.addEventListener('unhandledrejection', function (event) {
          renderBootError(event && event.reason && (event.reason.message || event.reason), event && event.reason && event.reason.stack);
        });
        setTimeout(function () {
          if (!window.__APP_READY__) {
            renderBootError('App konnte nicht gestartet werden. Bitte Konsole prüfen.', '');
          }
        }, 2500);
        setInterval(function () {
          setStatus(window.__APP_READY__ ? 'Boot: App bereit' : 'Boot: App nicht bereit');
        }, 1000);
      })();
    </script>
  </head>
  <body>
    <noscript>Bitte JavaScript aktivieren, um die App zu nutzen.</noscript>
    <div id="root"></div>
  </body>
</html>`,
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    historyApiFallback: true,
    compress: true,
    port: 3000,
    hot: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
