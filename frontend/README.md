# Civic Connect: AI-Powered Civic Issue Resolution System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen?logo=mongodb)](https://www.mongodb.com/)

**Current Status:** In Development for Smart India Hackathon 2025  
**Project Last Updated:** Sunday, September 7, 2025 - Hyderabad, Telangana, India

---

### Vision

**Civic Connect** is an AI-powered, multimodal platform designed to bridge the gap between citizens and municipal corporations. We empower citizens to report civic issues effortlessly using text and images, and we provide officials with an intelligent, map-based dashboard to manage, track, and resolve these issues efficiently.

### Problem Statement

This project is a solution for the **Smart India Hackathon (SIH) 2025, Problem Statement ID: 25031** - "Crowdsourced Civic Issue Reporting and Resolution System." Our goal is to enhance government accountability and foster cleaner, safer, and more collaborative urban ecosystems.

---

### ✨ Key Features

*   🤖 **AI-Powered Multimodal Reporting:** Our system's "AI Brain" understands both **text and images**. A user can simply upload a photo of a pothole, and the AI will understand, categorize, and prioritize the issue.
*   📍 **Intelligent Automated Routing:** The AI automatically analyzes the issue's context and assigns it to the correct municipal department (e.g., Sanitation, Public Works, Water Board), eliminating manual triage.
*   🗺️ **Interactive Admin Map Dashboard:** A real-time, map-centric command center for municipal staff. Issues are plotted geographically and color-coded by status, with departmental filters for a clear operational view.
*   📰 **Live Proximity-Based Community Feed:** Citizens can view a live feed of issues being reported and resolved in their immediate vicinity, promoting transparency and community awareness.
*   🔐 **Secure Role-Based Access:** A robust authentication system for both citizens and administrators.

---



### 🛠️ Tech Stack & Architecture

Our system uses a modern, scalable 3-tier architecture.

*   **Frontend:** **React (Next.js)** for a fast, responsive user experience for both the citizen and admin portals.
*   **Backend:** **FastAPI (Python)** for a high-performance, asynchronous API that orchestrates the entire system.
*   **Database:** **MongoDB Atlas** with geospatial indexing for efficiently storing and querying location-based reports.
*   **AI Engine:** **Gemini / Groq API** for state-of-the-art multimodal understanding and tool-calling capabilities.
*   **Mapping:** **React Leaflet** for the interactive admin dashboard map.

---

### ⚙️ Local Setup and Installation

Follow these steps to get the project running locally.

#### Prerequisites

*   Git
*   Node.js (v18 or later)
*   Python (v3.10 or later)
*   A MongoDB Atlas account (free tier is sufficient)
*   An AI API Key (from Google AI Studio or Groq)

#### 1. Clone the Repository

```bash
git clone [YOUR_REPOSITORY_URL]
cd [repository-folder]
```

#### 2. Backend Setup (`/backend`)

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment and activate it
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Create a .env file from the example
cp .env.example .env
```

Now, open the `.env` file and add your credentials:

```env
# backend/.env
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster-url>/"
AI_API_KEY="your_ai_api_key_here"
JWT_SECRET_KEY="a_very_secret_key"
```

Finally, run the backend server:

```bash
uvicorn main:app --reload
```

The backend will be running at `http://127.0.0.1:8000`.

#### 3. Frontend Setup (Citizen & Admin Apps)

For each frontend application (`/frontend-citizen` and `/frontend-admin`):

```bash
# Navigate to the respective frontend directory
cd frontend-citizen  # or cd frontend-admin

# Install dependencies
npm install

# Run the development server
npm run dev
```

The citizen app will be running at `http://localhost:3000` and the admin app at `http://localhost:3001` (or as configured).

---

### 📖 API Endpoints

<details>
<summary>Click to view API Contract</summary>

| Method | Endpoint                    | Description                           | Auth Req? |
| :----- | :-------------------------- | :------------------------------------ | :-------- |
| **POST** | `/api/auth/signup`          | Register a new citizen user.          | No        |
| **POST** | `/api/auth/login`           | Log in a user (citizen or admin).     | No        |
| **POST** | `/api/reports/smart-create` | Submit a new issue via the AI Brain.  | Citizen   |
| **GET**  | `/api/reports/nearby`       | Get recent reports for the citizen feed.| Citizen   |
| **GET**  | `/api/reports/my-reports`   | Get all reports by the logged-in user.| Citizen   |
| **GET**  | `/api/admin/reports`        | Get reports for the admin map.        | Admin     |
| **PATCH**| `/api/admin/reports/{id}`   | Update the status of a specific report. | Admin     |

</details>

---

### 🧑‍💻 The Team

| Name       | Role                   | Responsibilities                                      |
| :--------- | :--------------------- | :---------------------------------------------------- |
| **Supriyo**  | Admin Portal Lead      | Frontend (React), Map Integration (Leaflet)           |
| **Sahiti**   | Citizen App Lead       | Frontend (React), User Authentication, Community Feed |
| **Anitej**   | AI & Core Logic Lead   | Backend (FastAPI), AI Integration, Multimodal Endpoint|
| **Vyaswanth**| APIs & Auth Lead       | Backend (FastAPI), REST APIs, Security, JWT           |
| **DSP**      | DB Architecture & Setup| MongoDB Atlas, Schema, Indexing, Infrastructure     |
| **Lasya**    | DB Query & Integration | MongoDB Queries, CRUD Functions, Data Validation      |

---

### 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
