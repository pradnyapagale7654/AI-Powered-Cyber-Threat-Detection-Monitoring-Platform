# 🛡️ CyberShield AI
### AI-Powered Cyber Threat Detection & Monitoring Platform

CyberShield AI is a full-stack Security Operations Center (SOC) monitoring platform designed to analyze network traffic telemetry in real-time, detect anomalies using machine learning, classify threat signatures, transparently score risk, and provide LLM-assisted defensive security triage.

---

## 🚀 Key Features

- **Real-Time SOC Dashboard:** Summary KPIs, Socket.IO live stream (`● Live Monitoring`), real-time threat activity timeline, and categorical threat distribution.
- **Machine Learning Microservice:** 
  - **Isolation Forest** for unsupervised network anomaly detection.
  - **Random Forest Classifier** for threat classification (*Port Scan*, *Brute Force*, *DoS*, *Bot Activity*, *Suspicious Traffic*).
- **Transparent Risk Scoring:** Combines anomaly index, request velocity, connection frequency, and threat categories into a 0–100 risk score (*Low*, *Medium*, *High*, *Critical*).
- **Network Traffic Analyzer:** Upload CSV log files or input raw parameters manually to run batch ML threat predictions.
- **Incident Management & Investigation:** Filterable SOC incident queue with severity badges, priority flags, and investigation activity logs.
- **Security Alerts System:** Active notification stream with mark-as-read and resolution options.
- **Source IP Threat Profiling:** Aggregated IP activity metrics, anomaly counts, and risk distribution profiles.
- **AI Security Analyst (LLM Integration):** Generates structured defensive triage explanations (*What happened?*, *Why flagged?*, *Severity explanation*, *Investigation steps*, *Remediation*). Features graceful rule-based fallback when an AI API key is unconfigured.
- **Zero-Config Developer Setup:** Includes in-memory MongoDB fallback and automatic synthetic dataset generation script.

---

## 🏗️ Architecture Stack

- **Frontend:** React 18, Vite, JavaScript, Tailwind CSS, Recharts, Lucide Icons, Socket.IO Client.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.IO, JWT Authentication, bcrypt, Axios.
- **ML Service:** Python 3.10+, FastAPI, uvicorn, scikit-learn, pandas, numpy, joblib.
- **DevOps:** Docker, Docker Compose.

---

## 📁 Repository Structure

```text
cybershield-ai/
├── frontend/             # React dashboard & visual interface
│   ├── src/
│   │   ├── components/   # Reusable UI widgets & stream tickers
│   │   ├── context/      # Auth & Socket.IO Context Providers
│   │   ├── layouts/      # Dashboard Sidebar + Navbar layout
│   │   ├── pages/        # All 11 application pages
│   │   └── services/     # Axios API service
│   ├── package.json
│   └── vite.config.js
│
├── backend/              # Node.js Express REST API & Socket.IO server
│   ├── controllers/      # Dashboard, Incidents, Alerts, AI controllers
│   ├── models/           # Mongoose schemas (User, NetworkEvent, Incident, Alert)
│   ├── routes/           # Express API endpoints
│   ├── services/         # ML client wrapper, DB & AI Analyst services
│   ├── sockets/          # Socket.IO event handler & background simulator
│   ├── server.js
│   └── package.json
│
├── ml-service/           # FastAPI Python Machine Learning Microservice
│   ├── preprocessing/    # Feature scaling & protocol encoding
│   ├── generate_dataset.py # Synthetic network dataset generator (5,000 records)
│   ├── risk_scoring.py   # Transparent 0-100 risk scoring algorithm
│   ├── train.py          # Model training pipeline (Isolation Forest + Random Forest)
│   ├── prediction.py     # Model inference engine
│   ├── main.py           # FastAPI endpoints (/predict, /health, /train)
│   └── requirements.txt
│
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Getting Started (Local Setup)

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **MongoDB** (Optional - if unavailable, backend automatically runs in-memory MongoDB!)

---

### 2. Run Python ML Microservice
```bash
cd ml-service
python -m pip install -r requirements.txt
python train.py
python main.py
```
*The ML service will start on `http://localhost:8000`.*

---

### 3. Run Backend Server
```bash
cd backend
npm install
npm run dev
```
*The Express server will start on `http://localhost:5000` and automatically seed initial SOC demo data and users.*

**Default Demo Credentials:**
- **Admin:** `admin@cybershield.ai` | Password: `password123`
- **Analyst:** `analyst@cybershield.ai` | Password: `password123`

---

### 4. Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 🐳 Running with Docker Compose

To launch the entire platform (Frontend, Backend, ML Service, MongoDB) in containers:

```bash
docker compose up --build
```

---

## 🔒 Security & Educational Disclaimer

CyberShield AI is intended for defensive cybersecurity monitoring, educational research, and authorized security operations. Machine learning anomaly scores represent statistical deviations from learned baselines and do not constitute absolute proof of malicious intent without human analyst verification.
