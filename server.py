from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Fix Windows console encoding so print() doesn't crash on special chars
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

app = Flask(__name__)

# Allow requests from GitHub Pages and localhost
CORS(app, origins=[
    "https://*.github.io",
    "http://localhost",
    "http://127.0.0.1",
    "null"  # for file:// local dev
])

# In-memory prescription store: { otp: encrypted_data }
prescriptions = {}

# --- Health Check ---
@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'prescriptions': len(prescriptions)})

# --- API Routes ---
@app.route('/api/save', methods=['POST'])
def save_prescription():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid or missing JSON body'}), 400
    otp = data.get('otp', '').upper()
    encrypted = data.get('data')
    if not otp or not encrypted:
        return jsonify({'error': 'Missing otp or data'}), 400
    prescriptions[otp] = encrypted
    print(f"[SAVE] OTP={otp}", flush=True)
    return jsonify({'success': True})

@app.route('/api/get', methods=['GET'])
def get_prescription():
    otp = request.args.get('otp', '').upper()
    if not otp or otp not in prescriptions:
        return jsonify({'error': 'Not found'}), 404
    print(f"[GET]  OTP={otp}", flush=True)
    return jsonify({'data': prescriptions[otp]})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("\n" + "=" * 50)
    print("  PharmaLink API Server (Local Dev)")
    print("=" * 50)
    print(f"  API running at: http://localhost:{port}")
    print(f"  Health check:   http://localhost:{port}/api/health")
    print("=" * 50 + "\n")
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
