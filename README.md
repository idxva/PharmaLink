<div align="center">

# 💊 PharmaLink

**A secure, lightweight, OTP-based bridge for handing off digital prescriptions between clinics and pharmacies.**

![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-API-000000?style=flat-square&logo=flask&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Render%20%2F%20Heroku-46E3B7?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)

[**Explore Live Demo**](https://idxva.github.io/PharmaLink/) · [**Report Bug**](https://github.com/idxva/PharmaLink/issues) · [**Request Feature**](https://github.com/idxva/PharmaLink/issues)

</div>

---

## 📖 Overview

**PharmaLink** solves a critical friction point in digital healthcare: transferring a prescription from a clinician's desk to a pharmacist's counter securely, without relying on insecure messaging apps, unencrypted emails, or cumbersome patient portals.

By combining **client-side encryption** with a **short-lived One-Time Password (OTP) handoff**, PharmaLink ensures that prescription payloads remain private, transient, and unreadable in transit or storage. No sensitive health data sits on servers longer than necessary, and no plaintext records are ever exposed.

---

## 🔄 How It Works

```
┌─────────────────────────┐          Encrypted Payload + OTP         ┌─────────────────────────┐
│     Clinician / PWA     │ ───────────────────────────────────────► │        Flask API        │
│  (Client-side encrypt)  │                                          │   (In-memory storage)   │
└─────────────────────────┘                                          └─────────────────────────┘
                                                                                  │
                                                                                  │ OTP Lookup & Pull
                                                                                  ▼
                                                                     ┌─────────────────────────┐
                                                                     │     Pharmacist / PWA    │
                                                                     │   (Local decryption)    │
                                                                     └─────────────────────────┘
```

1. **Encrypt** — The prescription form is filled out in the browser and encrypted client-side before transmission.
2. **Generate OTP** — A secure short one-time code is generated and paired with the encrypted payload.
3. **Store** — The encrypted payload is pushed to the lightweight API and temporarily indexed under the OTP.
4. **Retrieve & Decrypt** — The pharmacist enters the OTP on their device; the API delivers the matching payload, which is decrypted locally for verification.

---

## ✨ Key Features

- 🔒 **Client-Side Encryption** — Prescription data is encrypted in the browser before ever leaving the client device.
- ⚡ **OTP Handoff** — No accounts or complex logins required; a simple, secure 6-character code facilitates the handoff.
- 📱 **Progressive Web App (PWA)** — Fully installable with offline support via service workers and web app manifests.
- ⚙️ **Minimal & Lightweight API** — Built with Flask; features clean endpoints, zero heavy ORMs, and easy self-hosting.
- 🛡️ **CORS & Origin Security** — Restricted request origins ensuring only authorized frontends can interact with the API.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, PWA Manifest, Service Worker |
| **Backend** | Python 3.11+, Flask, Flask-CORS, Gunicorn |
| **Hosting & Deploy** | GitHub Pages (Frontend), Render / Heroku (Backend API) |

---

## 📂 Project Structure

```text
PharmaLink/
├── index.html              # Main application shell and UI
├── script.js               # Client-side logic, encryption, and API communication
├── style.css               # Responsive styling and design system
├── manifest.json           # PWA configuration manifest
├── sw.js                   # Service worker for caching and offline support
├── server.py               # Flask backend API (OTP routing & in-memory store)
├── requirements.txt        # Python package dependencies
├── Procfile                # Heroku deployment process definition
└── render.yaml             # Render infrastructure-as-code deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Modern web browser with JavaScript enabled

### 1. Clone the Repository

```bash
git clone https://github.com/idxva/PharmaLink.git
cd PharmaLink
```

### 2. Set Up the Backend API

```bash
pip install -r requirements.txt
python server.py
```
The API server starts on `http://localhost:5000` (respecting any `PORT` environment variable). Verify health at `/api/health`.

### 3. Run the Frontend Locally

Serve the static frontend using any local web server:

```bash
python -m http.server 8080
```
Open `http://localhost:8080` in your browser. Ensure `script.js` points to your local API base URL if testing locally.

### 4. Configure Firebase (Optional)

Copy the configuration template:
```bash
cp firebase-config.example.js firebase-config.js
```
Populate `firebase-config.js` with your Firebase project credentials from the Firebase Console.

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns API operational status and active record metrics. |
| `POST` | `/api/save` | Stores an encrypted prescription payload under an OTP.<br>`{ "otp": "ABC123", "data": "<blob>" }` |
| `GET` | `/api/get?otp=ABC123` | Retrieves and returns the encrypted prescription payload for the specified OTP. |

---

## 🛡️ Security & Privacy Architecture

- **Transient Storage** — Prescription payloads are held **in-memory only** on the server; they are never written to disk or persistent databases and clear automatically on restart.
- **Opaque Payloads** — The server treats all data as opaque encrypted blobs; decryption keys never touch the backend.
- **Access Restrictions** — CORS policies restrict API interactions strictly to trusted client origins.

> ⚠️ **Disclaimer:** PharmaLink is an academic proof-of-concept. It has not been formally audited for production clinical environments or strict regulatory compliance (e.g., HIPAA). The in-memory store does not scale across multiple dynos/instances without shared session stores.

---

## 🗺️ Roadmap

- [ ] Persistent storage backend (e.g., Redis with TTL-based OTP expiration)
- [ ] Single-use OTP enforcement and auto-revocation upon retrieval
- [ ] Comprehensive audit logging for save and retrieve transactions
- [ ] Advanced rate limiting and abuse prevention middleware

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! Feel free to open an issue or submit a pull request.

1. Fork the Project (`https://github.com/idxva/PharmaLink/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git origin push feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` or repository terms for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/idxva">idxva</a>
</p>
