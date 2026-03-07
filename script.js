// ─── Firebase Configuration ──────────────────────────────────────────────────
// ⚠️  Replace the values below with YOUR Firebase project config
// Get it from: Firebase Console → Project Settings → Your Apps → Web App
const firebaseConfig = {
    apiKey: "AIzaSyBjckGgFPBnI7h5xAscpoddbzthZb_C-ng",
    authDomain: "pharmalink-75382.firebaseapp.com",
    projectId: "pharmalink-75382",
    storageBucket: "pharmalink-75382.firebasestorage.app",
    messagingSenderId: "907666198541",
    appId: "1:907666198541:web:55b6401e1a8f036c0e8544"
};
// ─────────────────────────────────────────────────────────────────────────────
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    const scannerSection = document.getElementById('scannerSection');
    const resultSection = document.getElementById('resultSection');
    const otpEntry = document.getElementById('otpEntry');
    const lookupBtn = document.getElementById('lookupBtn');
    const backBtn = document.getElementById('backBtn');
    const medsDisplay = document.getElementById('medsDisplay');
    const completeSaleBtn = document.getElementById('completeSale');

    const secretKey = "AuraScript_Secret_Key";
    let html5QrcodeScanner = null;

    // Initialize QR Scanner
    function startScanner() {
        if (!html5QrcodeScanner) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
        }
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }

    function onScanSuccess(decodedText) {
        processOTP(decodedText);
        html5QrcodeScanner.clear();
    }

    function onScanFailure(error) {
        // Silently ignore scan failures
    }

    // Auto-uppercase as user types
    otpEntry.addEventListener('input', () => {
        const pos = otpEntry.selectionStart;
        otpEntry.value = otpEntry.value.toUpperCase();
        otpEntry.setSelectionRange(pos, pos);
    });

    // Allow Enter key to trigger lookup
    otpEntry.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') lookupBtn.click();
    });

    lookupBtn.addEventListener('click', () => {
        const otp = otpEntry.value.trim().toUpperCase();
        if (otp.length !== 5) {
            alert("Please enter a valid 5-character OTP");
            return;
        }
        processOTP(otp);
    });

    function processOTP(otp) {
        // Try Firestore first (cross-device), then fall back to localStorage (same device)
        db.collection('prescriptions').doc(otp).get()
            .then(doc => {
                if (doc.exists) {
                    decryptAndDisplay(doc.data().data);
                } else {
                    // Fallback: try localStorage (same device, offline)
                    const encryptedData = localStorage.getItem(`aura_${otp}`);
                    if (!encryptedData) {
                        alert("Prescription not found. Please check the OTP and try again.");
                        if (html5QrcodeScanner) startScanner();
                        return;
                    }
                    decryptAndDisplay(encryptedData);
                }
            })
            .catch(() => {
                // Firestore unavailable — try localStorage fallback
                const encryptedData = localStorage.getItem(`aura_${otp}`);
                if (!encryptedData) {
                    alert("Prescription not found. Check your internet connection and try again.");
                    if (html5QrcodeScanner) startScanner();
                    return;
                }
                decryptAndDisplay(encryptedData);
            });
    }

    function decryptAndDisplay(encryptedData) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            displayPrescription(decryptedData);
        } catch (e) {
            console.error("Decryption failed", e);
            alert("Error decrypting prescription data.");
        }
    }

    function displayPrescription(data) {
        document.getElementById('patientName').textContent = data.patient.name;
        document.getElementById('patientInfo').textContent = `Age: ${data.patient.age} | Gender: ${data.patient.gender}`;
        const docName = data.doctor.name.toLowerCase().startsWith('dr.') ? data.doctor.name : `Dr. ${data.doctor.name}`;
        document.getElementById('doctorName').textContent = docName;
        document.getElementById('clinicName').textContent = data.doctor.clinic;
        document.getElementById('prescDate').textContent = `Date: ${data.timestamp}`;

        medsDisplay.innerHTML = "";
        data.medications.forEach(med => {
            const medCard = document.createElement('div');
            medCard.className = 'med-card';
            medCard.innerHTML = `
                <h4>${med.name}</h4>
                <div class="med-details">
                    <span class="med-detail-item">
                        <span class="med-label">Dosage</span>
                        <span class="med-value">${med.dosage || '—'}</span>
                    </span>
                    <span class="med-detail-item">
                        <span class="med-label">Duration</span>
                        <span class="med-value">${med.duration || '—'}</span>
                    </span>
                    <span class="med-detail-item">
                        <span class="med-label">Timing</span>
                        <span class="med-value med-timing-tag">${med.timing}</span>
                    </span>
                </div>
            `;
            medsDisplay.appendChild(medCard);
        });

        const notesContainer = document.getElementById('notesContainer');
        const notesText = document.getElementById('prescNotes');
        if (data.notes && data.notes.trim()) {
            notesText.textContent = data.notes;
            notesContainer.style.display = 'block';
        } else {
            notesContainer.style.display = 'none';
        }

        scannerSection.style.display = 'none';
        resultSection.style.display = 'block';
    }

    backBtn.addEventListener('click', () => {
        resultSection.style.display = 'none';
        scannerSection.style.display = 'block';
        otpEntry.value = "";
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().catch(() => { });
            html5QrcodeScanner = null;
        }
        startScanner();
    });

    completeSaleBtn.addEventListener('click', () => {
        alert('Prescription marked as dispensed.');
        backBtn.click();
    });

    startScanner();
});

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js', { scope: '/PharmaLink/' })
            .catch(err => console.warn('SW registration failed:', err));
    });
}
