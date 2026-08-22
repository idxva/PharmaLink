a/PharmaLink\README.md → b/PharmaLink\README.md
@@ -0,0 +1,98 @@
+# PharmaLink 🏥💊
+
+> **Interoperable EHR & Pharmacy Supply Chain Integration System**
+
+PharmaLink is a modern, secure, and FHIR-compliant Electronic Health Record (EHR) platform seamlessly integrated with automated pharmacy prescription fulfillment and real-time inventory management. Built for healthcare providers, doctors, pharmacists, and patients.
+
+---
+
+## 🏗️ System Architecture
+
+Below is the high-level architecture of PharmaLink, illustrating the separation of concerns across the Client Layer, FastAPI Secure API Gateway, Core EHR & Pharmacy Services, and HIPAA-Compliant Data Storage.
+
+[View Interactive Architecture Diagram](./diagrams/architecture.html)
+
+### Core Components
+1. **Client Layer:** Web Dashboard & Patient Portal (React / Tailwind CSS).
+2. **API Gateway & Auth:** FastAPI backend with JWT Authentication, Role-Based Access Control (RBAC), and OAuth2 / FHIR R4 standard endpoints.
+3. **Microservices / Modules:**
+   - **Patient EHR Engine:** Manages patient demographics, clinical notes, lab results, and vitals history.
+   - **e-Prescription Service:** Digital prescription generation, doctor digital signatures, and direct pharmacy routing.
+   - **Inventory & Supply Chain:** Real-time pharmacy stock levels, drug expiration tracking, and automated re-ordering.
+   - **Audit & Security Logger:** Immutable access logs ensuring strict HIPAA and GDPR compliance.
+4. **Data Persistence:** PostgreSQL with encrypted patient data at rest (AES-256) and Redis caching layer.
+
+---
+
+## ✨ Key Features
+
+- **Patient Management (EHR):** Comprehensive electronic health records including medical history, allergies, immunizations, and vital signs.
+- **e-Prescriptions:** Direct transmission of secure prescriptions from attending physicians to partnered pharmacies.
+- **Real-time Inventory Tracking:** Pharmacy stock monitoring with low-stock alerts and batch tracking.
+- **FHIR Interoperability:** Standardized REST APIs adhering to HL7 FHIR R4 specifications for seamless health data exchange.
+- **HIPAA-Compliant Security:** Role-based access control, end-to-end encryption, and comprehensive audit trails for every record access.
+
+---
+
+## 🛠️ Tech Stack
+
+- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Pydantic, Uvicorn
+- **Database:** PostgreSQL / SQLite
+- **Security:** PyJWT, bcrypt, cryptography
+- **Documentation:** Swagger/OpenAPI, ReDoc
+
+---
+
+## 🚀 Getting Started
+
+### Prerequisites
+- Python 3.10+
+- Git
+
+### Installation & Run
+
+1. **Clone the repository:**
+   ```bash
+   git clone https://github.com/idxva/PharmaLink.git
+   cd PharmaLink
+   ```
+
+2. **Set up the backend:**
+   ```bash
+   cd backend
+   python -m venv venv
+   source venv/bin/activate  # On Windows: venv\Scripts\activate
+   pip install -r requirements.txt
+   ```
+
+3. **Run the API server:**
+   ```bash
+   uvicorn main:app --reload
+   ```
+
+4. **Access API Documentation:**
+   - Swagger UI: `http://localhost:8000/docs`
+   - ReDoc: `http://localhost:8000/redoc`
+
