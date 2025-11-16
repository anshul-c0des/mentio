# Mentio
Real-time brand intelligence powered by AI.
Track, analyze, and understand your brand presence across social media and news instantly.

## ✨ Key Features
### 🔍 Real-Time Mention Tracking
- Live mentions feed
- 5-minute polling + stream updates
- Unified feed from Reddit, GNews API, and Youtube

### 🧠 AI Processing
- Sentiment analysis: ultra-fast local sentiment package
- Topic Classification: Powered by Google Gemini AI
- AI Summary Generation: Powered by HuggingFace summarization models

### 📊 Dashboard
- AI-generated daily summary
- Live mention feed
- Sentiment summary
- Seperate sources feed
- Spike detection alert/notification
- Filters for sentiment
- Clean UI built with shadcn

### 📈 Analytics Page
- Brand health score
- Trending topics
- Sentiment pie chart
- Topic distribution
- Mention volume line chart

### ⚠️ Real-Time Spike Detection
- Detects sudden rises in mentions
- Pushes real time notifications

## 🏗️ Tech Stack
- Frontend: Next.js (TS), Shadcn UI, Recharts, Socket.IO client, Axios
- Backend: Node.js + Express, Axios, Socket.IO, RSS-parser
- AI: Gemini (topic classification), HuggingFace Inference API (summaries), sentiment npm (sentiment analysis)
- Database: MongoDB Atlas
- Deployment: Vercel (frontend), Render (backend)


## 🧩 Architecture & Key Decisions
### Next.js (Frontend)
- Fast development and SSR capability when needed
- Perfect for dashboards and real-time UI
- Clean component organization using shadcn

### Socket.IO for Real-Time Updates
- Enables instant updates for new mentions and spikes
- Seamless integration with Next.js frontend

### Hybrid AI Approach
- Gemini: fast, low-latency topic tagging
- HuggingFace: richer, context-aware summaries
- Local sentiment: no API cost, extremely fast

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
    clone the repo
    cd mentio
```

### 2️⃣ Backend Setup (Render-ready)
Install dependencies:
```bash
cd backend
npm install
```

Create .env file:
```bash
PORT=5000
MONGO_URI=<your-mongodb-uri>
GNEWS_API_KEY=<your-key>
GEMINI_API_KEY=<your-key>
HF_API_KEY=<your-key>
FRONTEND_URL=<your-frontend-url>
```
Run backend locally:
```bash
npm run dev
```

Backend runs on: http://localhost:5000

### 3️⃣ Frontend Setup (Next.js, Vercel-ready)
Install dependencies:
```bash
cd frontend
npm install
```
Create .env.local:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```
Run frontend locally:
```bash
npm run dev
```

Frontend runs on: http://localhost:3000

## 🧭 How to Use Mentio

### Dashboard
- Live stream of mentions
- AI summary
- Sentiment breakdown
- Trending topics
- Spike alerts
- Sentiment filters

### Analytics Page
- Brand health score
- Trending keywords
- Sentiment trends
- Topic distribution
- Mention volume over time

## 🧱 Challenges Faced
- API quotas & inconsistencies: balancing GNews + Reddit RSS + HuggingFace/Gemini limits under tight time.
- Hybrid real-time architecture: merging 5-min polling with live sockets without duplication.
- AI latency tradeoffs: Gemini for speed, HuggingFace for quality.

## 🔗 Live Links

### [Frontend (Vercel)](https://mentio-bay.vercel.app/)
### [Backend (Render) - Cold Start](https://mentio.onrender.com/)
