# Facial Recognition System using Siamese CNN

A full-stack facial recognition system built using a **Siamese Convolutional Neural Network (CNN)** in PyTorch.  
The system performs face verification by learning embeddings and comparing similarity scores.  
It is served through a **FastAPI backend**, connected to a **Next.js frontend**, and fully containerized using **Docker Compose** for reproducible deployment.


## Demo
Watch the application in action: [View Demo Video]([https://youtu.be/P-IIM5gznRc](https://www.youtube.com/watch?v=Yf_uOw9IzcQ))

---

## Installation & Setup

### 1. Frontend Setup
```bash
cd Frontend
npm install
npm install next@latest react@latest react-dom@lates
npm run dev
```
The frontend will be available at `http://127.0.0.1:8000`.

### 2. Backend & Model Setup
The backend is served via FastAPI and runs inside a Docker container.
```bash
cd Backend
docker compose up --build
```
This command builds the backend image and starts the inference service at `http://127.0.0.1:8000`.

---

## Tech Stack
*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend:** FastAPI (Python)
*   **Machine Learning:** XGBoost, Scikit-learn, Pandas, Numpy
*   **DevOps:** Docker, Docker Compose

---

## Machine Learning Workflow
The system uses a Siamese Neural Network for face verification based on similarity learning.
1.  Data Collection: Face image pairs for similarity learning
2.  Preprocessing: Resize, normalization, augmentation
3.  Model: Siamese CNN for embedding generation
4.  Distance Metric: Euclidean or Cosine similarity
5.  Inference: Compare embeddings for match / no-match decision

---

## Project Structure
```text
├── Frontend/           # Next.js application
├── Backend/            # FastAPI, Model logic, and Dockerfile
│   ├── facial_recognition_model.py       # Trained Siamese CNN model
│   └── facial_api.py         # API endpoints

```

---
