# 💊 PharmaLink

**A lightweight, OTP-based bridge for handing off digital prescriptions between clinic and pharmacy.**

![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-API-000000?logo=flask&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-enabled-5A0FC8?logo=pwa&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Render%20%2F%20Heroku-46E3B7)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

**Live demo:** [idxva.github.io/PharmaLink](https://idxva.github.io/PharmaLink/)

---

## Overview

PharmaLink solves a simple but important problem: getting a prescription from a doctor's desk to a pharmacist's counter without relying on paper, phone calls, or unsecured messaging apps.

A prescription is created and encrypted on the client, then handed off using a short one-time code (OTP). The pharmacist enters that code on their end to pull down and decrypt the exact same record — no prescription data sits around longer than it needs to, and nothing is stored in plaintext on the server.

## How it works

1. **Create** — A prescription is filled out in the browser and encrypted client-side.
2. **Generate OTP** — A short one-time code is generated and paired with the encrypted payload.
3. **Save** — The encrypted payload is pushed to the API and held under that OTP.
4. **Retrieve** — The pharmacist enters the OTP on their device, the API returns the matching payload, and it's decrypted locally for verification.

```
Doctor (browser)  --encrypt+OTP-->  Flask API  --OTP lookup-->  Pharmacist (browser)
```

## Features

- 🔐 **Client-side encryption** — prescription data is encrypted before it ever leaves the browser.
- 🔢 **OTP-based handoff** — no accounts, no logins; a short code is the only thing exchanged between clinic and pharmacy.
- 📱 **Installable PWA** — ships with a web app manifest and service worker for an app-like, offline-friendly experience.
- ⚡ **Minimal, dependency-light API** — a small Flask service with two routes, easy to read, easy to self-host.
- 🌐 **CORS-restricted** — the API only accepts requests from GitHub Pages and local development origins by default.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, vanilla JavaScript |
| PWA | Web App Manifest, Service Worker |
| Backend | Python, Flask, Flask-CORS |
| Server | Gunicorn |
| Hosting | GitHub Pages (frontend) + Render / Heroku (API) |

## Project Structure

```
PharmaLink/
├── index.html          # App shell / UI
├── script.js            # Client logic: encryption, OTP flow, API calls
├── style.css             # Styling
├── manifest.json      # PWA manifest
├── sw.js                    # Service worker (offline support)
├── server.py             # Flask API (save / retrieve by OTP)
├── requirements.txt   # Python dependencies
├── Procfile                # Heroku process definition
└── render.yaml           # Render deployment config
```

## Getting Started

### Prerequisites

- Python 3.8+
- A modern browser

### 1. Clone the repository

```bash
git clone https://github.com/idxva/PharmaLink.git
cd PharmaLink
```

### 2. Run the API server

```bash
pip install -r requirements.txt
python server.py
```

The API starts on `http://localhost:5000` by default (respects a `PORT` env var), with a health check at `/api/health`.

### 3. Serve the frontend

The frontend is static, so any local web server works:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser. Update the API base URL in `script.js` if you're not running the backend on `localhost:5000`.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns API status and current prescription count |
| `POST` | `/api/save` | Saves an encrypted prescription under an OTP. Body: `{ "otp": "ABC123", "data": "<encrypted-payload>" }` |
| `GET` | `/api/get?otp=ABC123` | Retrieves the encrypted prescription for a given OTP |

## Deployment

- **Frontend** — deployed via **GitHub Pages** (see the live demo link above).
- **Backend** — configured for one-click deployment on **Render** (`render.yaml`) or **Heroku** (`Procfile`), served in production with **Gunicorn**.

## Security Notes

- Prescription payloads are stored **in-memory only** on the server — they are not persisted to disk or a database, and are cleared on server restart.
- Data is expected to be encrypted **before** it reaches the API; the server treats the payload as an opaque blob.
- CORS is locked down to GitHub Pages and localhost origins by default — adjust `server.py` if you deploy the frontend elsewhere.

> ⚠️ This project is a proof-of-concept / academic build. It has not been audited for production healthcare use (e.g. HIPAA compliance), and the in-memory store means data does not survive a server restart or scale across multiple instances.

## Roadmap

- [ ] Persistent storage (e.g. Redis with TTL-based OTP expiry)
- [ ] OTP expiration and single-use enforcement
- [ ] Audit logging for save/retrieve events
- [ ] Rate limiting on the API

## Contributing

Issues and pull requests are welcome. If you spot a bug or have an idea for a feature, feel free to open an issue.

## License

This project is licensed under the MIT License.

---

<p align="center">Built by <a href="https://github.com/idxva">idxva</a></p>
