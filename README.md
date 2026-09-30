# 🛡️ CyberShield AI

### AI-Powered Cyber Threat Detection & Security Operations Dashboard

CyberShield AI is an intelligent cybersecurity platform designed to help security teams **monitor network activity, detect anomalies, classify cyber threats, assess risk, and investigate security incidents** through a unified real-time dashboard.

The platform combines **React, Node.js, Express, MongoDB, Machine Learning, Socket.IO, and Generative AI** to provide an end-to-end security monitoring experience.

---

## 🚀 Key Features

### 🔐 Authentication & Security

* JWT-based authentication
* Secure password hashing
* Protected API routes
* Role-based access control
* Secure session handling
* Input validation and error handling

### 📊 Security Operations Dashboard

* Real-time security monitoring
* Network traffic overview
* Threat statistics
* Anomaly statistics
* Risk score visualization
* Recent security events
* Interactive analytics
* Security alerts

### 🤖 AI & Machine Learning

CyberShield AI uses machine learning to analyze network activity and identify potentially malicious behavior.

**ML Pipeline:**

```text
Network Traffic
      ↓
Data Preprocessing
      ↓
Feature Extraction
      ↓
Anomaly Detection
      ↓
Threat Classification
      ↓
Risk Assessment
      ↓
Security Dashboard
```

Implemented capabilities include:

* Anomaly detection
* Threat classification
* Risk scoring
* Severity assessment
* ML-based network traffic analysis
* Model-based predictions

### 🧠 AI Security Analyst

The integrated AI Security Analyst allows users to interact with the security system using natural language.

It can assist with:

* Security event analysis
* Threat explanations
* Incident investigation
* Security recommendations
* Understanding suspicious activity

The application also includes fallback handling when an external AI API is unavailable.

### ⚡ Real-Time Monitoring

Powered by **Socket.IO**, the dashboard can receive security events in real time.

```text
Backend
   │
   │ Socket.IO
   ↓
Frontend Dashboard
   │
   ├── New Threat
   ├── New Alert
   ├── Anomaly Detection
   └── Security Event
```

### 🚨 Incident Management

Security teams can manage detected incidents through the platform.

Features include:

* Create incidents
* View incident details
* Track severity
* Update incident status
* Add investigation notes
* Resolve incidents
* Monitor incident history

### 🔔 Security Alerts

The alert system provides visibility into detected security events.

Alerts can include:

* Threat severity
* Risk level
* Source information
* Event information
* Detection time
* Related security activity

### 📈 Security Analytics

The analytics module provides insights into security activity through:

* Threat statistics
* Anomaly trends
* Risk distribution
* Traffic analysis
* Historical security activity
* Interactive visualizations

### 🌐 Source / IP Profiling

Analyze network sources and IP activity to identify potentially suspicious behavior.

The system can display relevant:

* Source information
* Risk information
* Historical activity
* Threat activity
* Security events

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      User / SOC      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   Vite Dashboard     │
                    └──────────┬───────────┘
                               │
                 REST API + Socket.IO
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js / Express  │
                    │      Backend API     │
                    └───────┬───────┬──────┘
                            │       │
             ┌──────────────┘       └──────────────┐
             ▼                                     ▼
   ┌──────────────────┐                 ┌──────────────────┐
   │     MongoDB      │                 │  ML Prediction   │
   │     Database     │                 │     Pipeline     │
   └──────────────────┘                 └────────┬─────────┘
                                                 │
                                                 ▼
                                      ┌──────────────────┐
                                      │ AI Security      │
                                      │ Analyst           │
                                      └──────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3
* Socket.IO Client
* Data Visualization

## Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* Socket.IO
* Middleware-based authorization

## Database

* MongoDB
* Mongoose

## Machine Learning

* Python
* Scikit-learn
* Isolation Forest
* Random Forest
* Data preprocessing
* Feature engineering
* Anomaly detection
* Threat classification

## AI

* Generative AI integration
* AI Security Analyst
* Security event analysis
* Fallback AI responses

## DevOps

* Docker
* Docker Compose
* Nginx
* Environment-based configuration

---

# 📂 Project Structure

```text
CyberShield-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── ml/
│   ├── models/
│   ├── preprocessing/
│   ├── prediction/
│   └── ...
│
├── docker/
│   └── nginx/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

> The exact folder structure may vary slightly depending on the final project version.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/CyberShield-AI.git
cd CyberShield-AI
```

---

## 2. Configure Environment Variables

Create the required environment files using the provided examples.

```bash
cp .env.example .env
```

Configure values such as:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Never commit real API keys or secrets to GitHub.

---

# 💻 Run Locally

## Backend

```bash
cd backend
npm install
npm run dev
```

The backend will run on the configured backend port, typically:

```text
http://localhost:5000
```

---

## Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will typically be available at:

```text
http://localhost:5173
```

---

# 🐳 Run with Docker

CyberShield AI supports containerized deployment using Docker Compose.

Build the application:

```bash
docker compose build
```

Start all services:

```bash
docker compose up
```

For detached mode:

```bash
docker compose up -d
```

The production frontend is served through Nginx.

```text
http://localhost:3000
```

---

# 🔄 Application Workflow

```text
User Login
    ↓
Security Dashboard
    ↓
Network Traffic
    ↓
ML Analysis
    ↓
┌───────────────────────────┐
│ Anomaly Detection         │
│ Threat Classification     │
│ Risk Assessment           │
└─────────────┬─────────────┘
              ↓
       Security Event
              ↓
      ┌───────┴────────┐
      ↓                ↓
   Alert           Incident
      ↓                ↓
 Dashboard       Investigation
      │                │
      └───────┬────────┘
              ↓
      AI Security Analyst
```

---

# 🔬 Machine Learning

CyberShield AI uses machine learning to identify unusual network behavior.

### Anomaly Detection

Isolation Forest is used to identify traffic patterns that deviate from normal behavior.

### Threat Classification

A Random Forest-based classifier is used to classify detected network activity.

### Risk Assessment

The platform combines detection results and security characteristics to determine an appropriate risk/severity level.

---

# 🔐 Security Considerations

The project follows several security practices:

* Password hashing
* JWT authentication
* Protected API endpoints
* Role-based authorization
* Environment variables for secrets
* Input validation
* Backend error handling
* No API keys exposed in frontend source code
* Secure database access
* CORS configuration

---

# 📊 Main Modules

| Module                   | Description                           |
| ------------------------ | ------------------------------------- |
| 🔐 Authentication        | Login, registration and authorization |
| 📊 Dashboard             | Central security monitoring interface |
| 🤖 ML Detection          | Detects anomalous network activity    |
| 🧠 Threat Classification | Classifies potential threats          |
| ⚠️ Risk Assessment       | Determines security risk/severity     |
| 🚨 Alerts                | Displays security alerts              |
| 📋 Incidents             | Incident investigation and management |
| 📈 Analytics             | Security statistics and trends        |
| 🌐 IP Profiling          | Source/IP activity analysis           |
| ⚡ Real-Time Monitoring   | Socket.IO powered updates             |
| 🧠 AI Analyst            | AI-assisted security investigation    |

---

# 🎯 Use Cases

CyberShield AI can be used as a foundation for:

* Security Operations Center dashboards
* Network anomaly monitoring
* Cyber threat analysis
* Security incident investigation
* Threat detection demonstrations
* ML-based cybersecurity research
* Cybersecurity academic projects
* AI-assisted security analysis

---

# 🚀 Future Enhancements

Potential future improvements include:

* SIEM integrations
* IDS/IPS integration
* Threat intelligence feeds
* MITRE ATT&CK mapping
* Automated incident response
* Advanced behavioral analytics
* Email/SMS security notifications
* Security report generation
* Cloud deployment
* Kubernetes deployment
* Advanced deep-learning threat detection

---

# 📸 Screenshots

Add screenshots of the major modules here:

```text
Dashboard
Authentication
Threat Detection
Incident Management
Analytics
AI Security Analyst
```

Example:

```markdown
![CyberShield AI Dashboard](screenshots/dashboard.png)
```

---

# 👩‍💻 Author

**Pradnya Pagale**

Computer Engineering Student | Full-Stack Developer | Gen AI Enthusiast

Interested in:

* Full-Stack Development
* Artificial Intelligence
* Machine Learning
* Data Analysis
* Cybersecurity
* Problem Solving

---

# ⭐ Project Highlights

```text
⚡ Real-Time Security Monitoring
🤖 Machine Learning Threat Detection
🧠 AI Security Analyst
🚨 Incident Management
📊 Security Analytics
🔐 JWT Authentication
🌐 IP/Source Profiling
🐳 Dockerized Deployment
⚡ Socket.IO Real-Time Events
```

---

# 📄 License

This project is developed for **educational, research, and portfolio purposes**.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
