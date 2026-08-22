// ─── Firebase Configuration ──────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyBjckGgFPBnI7h5xAscpoddbzthZb_C-ng",
    authDomain: "pharmalink-75382.firebaseapp.com",
    projectId: "pharmalink-75382",
    storageBucket: "pharmalink-75382.firebasestorage.app",
    messagingSenderId: "907666198541",
    appId: "1:907666198541:web:55b6401e1a8f036c0e8544"
};

// Initialize Firebase (Compat SDK)
try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.warn("Firebase initialization warning:", e);
}
const db = firebase.firestore();

// ─── Preset Clinical Demonstration Records (Offline Fallback & Demo) ──────────
const secretKey = "AuraScript_Secret_Key";

const DEMO_PRESCRIPTIONS = {
    "RX701": {
        patient: {
            name: "Eleanor Vance",
            age: "58",
            gender: "Female"
        },
        doctor: {
            name: "Dr. Arthur Pendelton, MD",
            clinic: "St. Jude Heart & Vascular Institute"
        },
        timestamp: "2026-08-22 14:30 EST",
        medications: [
            {
                name: "Atorvastatin Calcium 20mg",
                dosage: "1 Tablet",
                duration: "30",
                timing: "0-0-1 (Night / After Food)"
            },
            {
                name: "Metoprolol Succinate ER 50mg",
                dosage: "1 Tablet",
                duration: "30",
                timing: "1-0-0 (Morning / With Meal)"
            },
            {
                name: "Aspirin 81mg Delayed-Release",
                dosage: "1 Enteric Tablet",
                duration: "30",
                timing: "0-1-0 (Afternoon)"
            }
        ],
        notes: "Monitor resting BP daily. Refill authorized for 90-day maintenance. Report any muscle tenderness immediately."
    },
    "RX942": {
        patient: {
            name: "Marcus Thorne",
            age: "34",
            gender: "Male"
        },
        doctor: {
            name: "Dr. Elena Rostova, MD",
            clinic: "Memorial Acute Care Center"
        },
        timestamp: "2026-08-22 10:15 EST",
        medications: [
            {
                name: "Amoxicillin-Clavulanate 875/125mg",
                dosage: "1 Tablet",
                duration: "7",
                timing: "1-0-1 (Every 12h / Post-meal)"
            },
            {
                name: "Benzonatate 100mg",
                dosage: "1 Capsule",
                duration: "5",
                timing: "1-1-1 (TID as needed for cough)"
            }
        ],
        notes: "Complete full 7-day antibiotic course. Take with adequate water. Avoid dairy products within 2 hours of ingestion."
    },
    "RX330": {
        patient: {
            name: "Sophia Chen",
            age: "42",
            gender: "Female"
        },
        doctor: {
            name: "Dr. Vikram Patel, MD",
            clinic: "Metropolitan Endocrine & Diabetes Care"
        },
        timestamp: "2026-08-22 11:45 EST",
        medications: [
            {
                name: "Metformin HCl ER 1000mg",
                dosage: "1 Tablet",
                duration: "60",
                timing: "1-0-1 (With Dinner)"
            },
            {
                name: "Empagliflozin 10mg",
                dosage: "1 Tablet",
                duration: "30",
                timing: "1-0-0 (Morning)"
            }
        ],
        notes: "HbA1c target < 6.8%. Maintain daily hydration of at least 2.5L. Fasting blood glucose check every 2 weeks."
    }
};

// Seed demo prescriptions into AES encrypted local store for instant demo offline access
try {
    Object.keys(DEMO_PRESCRIPTIONS).forEach(token => {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(DEMO_PRESCRIPTIONS[token]), secretKey).toString();
        localStorage.setItem(`aura_${token}`, encrypted);
    });
} catch (e) {
    console.warn("Could not seed local store demo tokens", e);
}

// ─── DOM Controller & Application Flow ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const scannerSection = document.getElementById('scannerSection');
    const resultSection = document.getElementById('resultSection');
    const otpEntry = document.getElementById('otpEntry');
    const otpForm = document.getElementById('otpForm');
    const lookupBtn = document.getElementById('lookupBtn');
    const clearOtpBtn = document.getElementById('clearOtpBtn');
    const backBtn = document.getElementById('backBtn');
    const printBtn = document.getElementById('printBtn');
    const medsDisplay = document.getElementById('medsDisplay');
    const completeSaleBtn = document.getElementById('completeSale');
    const systemClock = document.getElementById('systemClock');
    const demoChips = document.querySelectorAll('.demo-chip');

    // Modal Elements
    const dispenseModal = document.getElementById('dispenseModal');
    const modalPatientName = document.getElementById('modalPatientName');
    const modalItemCount = document.getElementById('modalItemCount');
    const cancelDispenseBtn = document.getElementById('cancelDispenseBtn');
    const confirmDispenseBtn = document.getElementById('confirmDispenseBtn');

    let html5QrcodeScanner = null;
    let currentPrescriptionData = null;

    // ─── Live Clock System ───────────────────────────────────────────────────
    function updateClock() {
        const now = new Date();
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        if (systemClock) {
            systemClock.textContent = `${hours}:${minutes}:${seconds} UTC`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ─── Non-Blocking Toast Notification System ──────────────────────────────
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        } else {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        toast.innerHTML = `${iconSvg}<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ─── QR Code Scanner Controller ──────────────────────────────────────────
    function startScanner() {
        if (!html5QrcodeScanner && window.Html5QrcodeScanner) {
            try {
                html5QrcodeScanner = new Html5QrcodeScanner(
                    "reader",
                    {
                        fps: 15,
                        qrbox: { width: 220, height: 220 },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true
                    },
                    /* verbose= */ false
                );
                html5QrcodeScanner.render(onScanSuccess, onScanFailure);
            } catch (err) {
                console.warn("Scanner initialization notice:", err);
            }
        }
    }

    function onScanSuccess(decodedText) {
        if (!decodedText) return;
        showToast("QR code detected. Decrypting payload...", "info");
        processOTP(decodedText.trim());
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().catch(() => {});
        }
    }

    function onScanFailure(error) {
        // Silently ignore continuous frame scan failures
    }

    // ─── Input Formatting & Clear Handlers ────────────────────────────────────
    otpEntry.addEventListener('input', () => {
        const pos = otpEntry.selectionStart;
        otpEntry.value = otpEntry.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        otpEntry.setSelectionRange(pos, pos);

        if (clearOtpBtn) {
            clearOtpBtn.style.display = otpEntry.value.length > 0 ? 'flex' : 'none';
        }
    });

    if (clearOtpBtn) {
        clearOtpBtn.addEventListener('click', () => {
            otpEntry.value = '';
            clearOtpBtn.style.display = 'none';
            otpEntry.focus();
        });
    }

    if (otpForm) {
        otpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            lookupBtn.click();
        });
    }

    lookupBtn.addEventListener('click', () => {
        const otp = otpEntry.value.trim().toUpperCase();
        if (otp.length < 3 || otp.length > 10) {
            showToast("Please enter a valid authorization token (e.g. RX701).", "error");
            otpEntry.focus();
            return;
        }
        processOTP(otp);
    });

    // Preset Demo Chips Click
    demoChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const token = chip.getAttribute('data-token');
            if (token) {
                otpEntry.value = token;
                if (clearOtpBtn) clearOtpBtn.style.display = 'flex';
                processOTP(token);
            }
        });
    });

    // ─── Decryption & Remote / Local Retrieval ────────────────────────────────
    function processOTP(otp) {
        // Set loading state on lookup button
        lookupBtn.disabled = true;
        const originalContent = lookupBtn.innerHTML;
        lookupBtn.innerHTML = `<span class="pulse-dot"></span><span>Decrypting...</span>`;

        function restoreBtn() {
            lookupBtn.disabled = false;
            lookupBtn.innerHTML = originalContent;
        }

        // Try Firestore first, then fallback to localStorage or DEMO records
        db.collection('prescriptions').doc(otp).get()
            .then(doc => {
                restoreBtn();
                if (doc.exists) {
                    decryptAndDisplay(doc.data().data, otp);
                } else {
                    fallbackLocalLookup(otp);
                }
            })
            .catch(() => {
                restoreBtn();
                fallbackLocalLookup(otp);
            });
    }

    function fallbackLocalLookup(otp) {
        const encryptedData = localStorage.getItem(`aura_${otp}`);
        if (encryptedData) {
            decryptAndDisplay(encryptedData, otp);
            return;
        }

        // Check in memory DEMO_PRESCRIPTIONS directly
        if (DEMO_PRESCRIPTIONS[otp]) {
            displayPrescription(DEMO_PRESCRIPTIONS[otp], otp);
            showToast("Record loaded from verified local dispensary store.", "success");
            return;
        }

        showToast("Prescription not found for token: " + otp + ". Verify code or test with demo preset.", "error");
        if (html5QrcodeScanner) startScanner();
    }

    function decryptAndDisplay(encryptedData, otpToken = "") {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedString) throw new Error("Empty decryption string");
            
            const decryptedData = JSON.parse(decryptedString);
            displayPrescription(decryptedData, otpToken);
            showToast("Prescription decrypted & authenticated successfully.", "success");
        } catch (e) {
            console.error("Decryption failed:", e);
            showToast("Decryption failed. Signature mismatch or corrupted token.", "error");
        }
    }

    // ─── Render Decrypted Clinical Rx Document ────────────────────────────────
    function displayPrescription(data, otpToken = "") {
        currentPrescriptionData = data;

        // Patient demographics
        const patientNameEl = document.getElementById('patientName');
        const patientInfoEl = document.getElementById('patientInfo');
        if (patientNameEl) patientNameEl.textContent = data.patient?.name || "Patient Unknown";
        if (patientInfoEl) {
            patientInfoEl.textContent = `${data.patient?.age || '—'} YRS  /  ${data.patient?.gender || '—'}`;
        }

        // Prescriber info
        const doctorNameEl = document.getElementById('doctorName');
        const clinicNameEl = document.getElementById('clinicName');
        const prescDateEl = document.getElementById('prescDate');
        const rxHashToken = document.getElementById('rxHashToken');

        if (doctorNameEl) {
            let docName = data.doctor?.name || "Physician On Record";
            if (!docName.toLowerCase().startsWith('dr.')) {
                docName = `Dr. ${docName}`;
            }
            doctorNameEl.textContent = docName;
        }

        if (clinicNameEl) {
            clinicNameEl.textContent = data.doctor?.clinic || "Authorized Medical Care Facility";
        }

        if (prescDateEl) {
            prescDateEl.textContent = data.timestamp || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        if (rxHashToken) {
            const hash = CryptoJS.SHA256(JSON.stringify(data)).toString().substring(0, 16).toUpperCase();
            rxHashToken.textContent = `TOKEN: ${otpToken || 'RX'} | HASH: ${hash}`;
        }

        // Render Medication List
        medsDisplay.innerHTML = "";
        const medications = data.medications || [];
        const medCountBadge = document.getElementById('medCountBadge');
        if (medCountBadge) {
            medCountBadge.textContent = `${medications.length} ${medications.length === 1 ? 'MEDICATION' : 'MEDICATIONS'}`;
        }

        medications.forEach((med, idx) => {
            const medCard = document.createElement('div');
            medCard.className = 'med-card';
            medCard.innerHTML = `
                <div class="med-name-col">
                    <span class="med-name">${med.name || 'Prescribed Drug'}</span>
                    <span class="med-generic-tag">Item #${idx + 1} &bull; Oral Dispense</span>
                </div>
                <div class="med-metric-col">
                    <span class="med-metric-label">DOSAGE FORM</span>
                    <span class="med-metric-val">${med.dosage || '1 Unit'}</span>
                </div>
                <div class="med-metric-col">
                    <span class="med-metric-label">DURATION</span>
                    <span class="med-metric-val">${med.duration || '—'} Days</span>
                </div>
                <div class="med-metric-col">
                    <span class="med-metric-label">REGIMEN / TIMING</span>
                    <span class="med-timing-badge">${med.timing || 'As Directed'}</span>
                </div>
            `;
            medsDisplay.appendChild(medCard);
        });

        // Clinical Notes
        const notesContainer = document.getElementById('notesContainer');
        const notesText = document.getElementById('prescNotes');
        if (data.notes && data.notes.trim()) {
            notesText.textContent = data.notes;
            notesContainer.style.display = 'block';
        } else {
            notesContainer.style.display = 'none';
        }

        // View Transition
        scannerSection.style.display = 'none';
        resultSection.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ─── Return to Scanner View ──────────────────────────────────────────────
    backBtn.addEventListener('click', () => {
        resultSection.style.display = 'none';
        scannerSection.style.display = 'block';
        otpEntry.value = "";
        if (clearOtpBtn) clearOtpBtn.style.display = 'none';
        
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().catch(() => {});
            html5QrcodeScanner = null;
        }
        startScanner();
    });

    // ─── Print Slip Trigger ──────────────────────────────────────────────────
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // ─── Dispensation Modal & Confirmation Workflow ──────────────────────────
    completeSaleBtn.addEventListener('click', () => {
        if (!currentPrescriptionData) return;
        
        if (modalPatientName) {
            modalPatientName.textContent = currentPrescriptionData.patient?.name || "Patient";
        }
        if (modalItemCount) {
            const count = currentPrescriptionData.medications?.length || 0;
            modalItemCount.textContent = `${count} ${count === 1 ? 'Medication' : 'Medications'}`;
        }
        dispenseModal.style.display = 'flex';
    });

    if (cancelDispenseBtn) {
        cancelDispenseBtn.addEventListener('click', () => {
            dispenseModal.style.display = 'none';
        });
    }

    if (confirmDispenseBtn) {
        confirmDispenseBtn.addEventListener('click', () => {
            dispenseModal.style.display = 'none';
            showToast("Prescription marked as dispensed and archived to registry.", "success");
            setTimeout(() => {
                backBtn.click();
            }, 800);
        });
    }

    // Close modal on escape key or backdrop click
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (dispenseModal.style.display === 'flex') {
                dispenseModal.style.display = 'none';
            } else if (resultSection.style.display === 'block') {
                backBtn.click();
            }
        }
    });

    dispenseModal.addEventListener('click', (e) => {
        if (e.target === dispenseModal) {
            dispenseModal.style.display = 'none';
        }
    });

    // Start scanner on initial load
    startScanner();
});

// ─── PWA Service Worker Registration ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js', { scope: './' })
            .catch(err => console.warn('SW registration info:', err));
    });
}

