# Smart Financial Monitoring and Recommendation System for Gen Z

An intelligent, gamified financial tracking application designed to help Generation Z manage their expenses effortlessly. This system leverages Artificial Intelligence (YOLOv8 & EasyOCR) for automated receipt scanning, Statistical Z-Score for anomaly detection, and a gamified reward system to encourage healthy financial habits.

## Core Features

* **AI Receipt Scanner:** Upload a receipt, and the Python AI service will automatically extract the merchant name, total amount, and date using YOLO and EasyOCR.
* **Anomaly Detection:** Real-time monitoring of transactions using Z-Score algorithms to flag unusual spending behavior.
* **AI Financial Insights:** Get personalized feedback and recommendations based on monthly spending patterns.
* **Gamification Engine:** Complete daily quests (e.g., scanning receipts, manual inputs) to earn Points (Pts).
* **Theme Store & Leaderboard:** Spend earned points to unlock exclusive UI themes and climb the Gen-Z Top Rank leaderboard.
* **Real-time Dashboard:** Synchronized data visualization using Supabase Realtime and Recharts.

## System Architecture

This project adopts a Monorepo Microservices-inspired architecture to ensure scalability and separation of concerns:

* **Frontend:** React.js, Vite, Tailwind CSS, Lucide React.
* **API Gateway (Node.js):** Express.js, Axios (Handles routing, validation, and Gamification logic).
* **AI Service (Python):** Flask/FastAPI, YOLOv8 (`best.pt`), EasyOCR, OpenCV (Isolated environment for heavy computer vision tasks).
* **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Realtime channels).
* **Message Broker & Cache:** RabbitMQ (Task queues) & Redis (Leaderboard caching).

## Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* Python (v3.9+)
* Redis & RabbitMQ running locally
* Supabase Account

### 1. Clone the Repository
```bash
git clone (https://github.com/Dicki-ibnu/smart-monitoringGenZ)
cd smart-monitoringGenZ