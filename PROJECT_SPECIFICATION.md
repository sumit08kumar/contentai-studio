# YouTube RAG Chatbot - Full-Stack Web Application Specification

## 📋 Project Overview

Build a professional full-stack web application that allows users to interact with YouTube videos through an AI-powered chatbot using RAG (Retrieval-Augmented Generation) technology.

### Tech Stack
- **Frontend**: React.js (with TypeScript recommended)
- **Backend**: Python (FastAPI/Flask)
- **Database**: PostgreSQL
- **Vector Database**: Pinecone
- **AI/ML**: OpenAI GPT-4, LangChain
- **Authentication**: JWT tokens
- **Deployment**: Docker containers

---

## 🎯 Core Features

### 1. User Authentication
- User registration with email validation
- Secure login/logout
- Password reset functionality
- JWT-based session management
- Protected routes

### 2. YouTube Video Processing
- URL input and validation
- Automatic transcript extraction
- Text chunking and embedding generation
- Vector storage in Pinecone
- Multi-language support (English, Hindi)

### 3. Chat Interface
- Real-time question answering
- Conversation memory/context
- Source citations from video chunks
- Video summary generation
- Chat history persistence
- Export chat to Markdown

### 4. User Dashboard
- List of processed videos
- Chat history per video
- Usage statistics
- API key management

---

## 🏗️ System Architecture

```
┌─────────────────┐
│   React.js      │
│   Frontend      │
│  (Port 3000)    │
└────────┬────────┘
         │ REST API
         │
┌────────▼────────┐
│   Python        │
│   Backend       │
│  (Port 8000)    │
└────┬──────┬─────┘
     │      │
     │      └──────────────┐
     │                     │
┌────▼────────┐   ┌───────▼──────┐
│ PostgreSQL  │   │   Pinecone   │
│  Database   │   │ Vector Store │
└─────────────┘   └──────────────┘
```

---

## 📁 Project Structure

```
youtube-rag-chatbot/
├── frontend/                    # React.js application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatInterface.jsx
│   │   │   │   ├── MessageList.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   └── VideoPlayer.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── VideoList.jsx
│   │   │   │   └── Statistics.jsx
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Loading.jsx
│   │   │   └── home/
│   │   │       ├── Hero.jsx
│   │   │       ├── Features.jsx
│   │   │       └── HowItWorks.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── ChatPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   └── chat.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── utils/
│   │   │   ├── validation.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                     # Python FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── video.py
│   │   │   └── chat.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── video.py
│   │   │   └── chat.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── videos.py
│   │   │   │   └── chat.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py
│   │   │   └── youtube_rag.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── validators.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Videos Table
```sql
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(20) UNIQUE NOT NULL,
    video_url TEXT NOT NULL,
    title VARCHAR(500),
    transcript_length INTEGER,
    num_chunks INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat History Table
```sql
CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
Request:
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}

Response:
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "message": "User registered successfully"
}
```

#### POST `/api/auth/login`
Login user
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

#### POST `/api/auth/logout`
Logout user (requires authentication)

#### GET `/api/auth/me`
Get current user info (requires authentication)

---

### Video Endpoints

#### POST `/api/videos/process`
Process a new YouTube video
```json
Request:
{
  "video_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "chunk_size": 1000,
  "chunk_overlap": 200
}

Response:
{
  "video_id": "VIDEO_ID",
  "id": 1,
  "transcript_length": 15420,
  "num_chunks": 18,
  "message": "Video processed successfully"
}
```

#### GET `/api/videos`
Get all videos for current user (requires authentication)
```json
Response:
{
  "videos": [
    {
      "id": 1,
      "video_id": "VIDEO_ID",
      "video_url": "https://www.youtube.com/watch?v=VIDEO_ID",
      "title": "Video Title",
      "transcript_length": 15420,
      "num_chunks": 18,
      "created_at": "2024-03-08T10:30:00Z"
    }
  ],
  "total": 1
}
```

#### GET `/api/videos/{video_id}`
Get specific video details

#### DELETE `/api/videos/{video_id}`
Delete a video and its chat history

#### GET `/api/videos/{video_id}/info`
Get video metadata and statistics

#### GET `/api/videos/{video_id}/summary`
Generate and return video summary

---

### Chat Endpoints

#### POST `/api/chat/ask`
Ask a question about a video
```json
Request:
{
  "video_id": 1,
  "question": "What is the main topic of this video?",
  "verbose": false
}

Response:
{
  "answer": "The main topic is... [Chunk 1]",
  "question": "What is the main topic of this video?",
  "context": ["chunk1", "chunk2"],
  "created_at": "2024-03-08T10:35:00Z"
}
```

#### POST `/api/chat/ask-with-memory`
Ask a question with conversation context
```json
Request:
{
  "video_id": 1,
  "question": "Tell me more about that",
  "session_id": 123
}

Response:
{
  "answer": "Based on our previous conversation...",
  "question": "Tell me more about that",
  "session_id": 123
}
```

#### GET `/api/chat/history/{video_id}`
Get chat history for a specific video
```json
Response:
{
  "history": [
    {
      "id": 1,
      "question": "What is the main topic?",
      "answer": "The main topic is...",
      "created_at": "2024-03-08T10:30:00Z"
    }
  ],
  "total": 1
}
```

#### POST `/api/chat/export/{video_id}`
Export chat history to Markdown
```json
Response:
{
  "filename": "chat_export_VIDEO_ID_20240308.md",
  "download_url": "/api/downloads/chat_export_VIDEO_ID_20240308.md"
}
```

#### DELETE `/api/chat/history/{video_id}`
Clear chat history for a video

---

## 🎨 Frontend Components

### 1. Home Page (`HomePage.jsx`)
```jsx
Features:
- Hero section with value proposition
- Feature highlights (RAG technology, Multi-language support, etc.)
- How it works section (3-step process)
- Call-to-action buttons
- Testimonials/demo video
```

### 2. Authentication Pages

#### Login Page (`LoginPage.jsx`)
```jsx
Features:
- Email/password form
- Form validation
- Error handling
- "Forgot password" link
- "Sign up" link
- Social auth (optional)
```

#### Signup Page (`SignupPage.jsx`)
```jsx
Features:
- Registration form (email, username, password, confirm password)
- Real-time validation
- Password strength indicator
- Terms of service checkbox
- Redirect to login after successful registration
```

### 3. Dashboard Page (`DashboardPage.jsx`)
```jsx
Features:
- Welcome message with user name
- Statistics cards (total videos, total chats, usage)
- List of processed videos
- "Process New Video" button
- Recent chat history
- Quick actions
```

### 4. Chat Interface (`ChatPage.jsx`)
```jsx
Features:
- YouTube video embed (optional)
- Chat message list with sender distinction
- Message input with send button
- Auto-scroll to latest message
- Loading indicators
- Source citations display
- Export chat button
- Clear history button
- Video info sidebar
```

### Key Components

#### ChatInterface.jsx
```jsx
- Video URL input and process
- Real-time message streaming
- Message bubbles with timestamps
- Typing indicators
- Error handling
- Reconnection logic
```

#### MessageList.jsx
```jsx
- Display messages in chronological order
- User vs AI message styling
- Source citations as expandable sections
- Markdown rendering for answers
- Copy message functionality
```

#### VideoPlayer.jsx
```jsx
- Embedded YouTube player
- Video metadata display
- Thumbnail preview
- Video controls integration
```

---

## ⚙️ Backend Implementation

### Core Module: `youtube_rag.py`

Convert the Jupyter notebook class into a production-ready module:

```python
# app/core/youtube_rag.py

import os
import re
import time
from typing import List, Dict, Optional
from datetime import datetime

from youtube_transcript_api import YouTubeTranscriptApi
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from pinecone import Pinecone as PineconeClient, ServerlessSpec
from rank_bm25 import BM25Okapi
import numpy as np

class YouTubeRAG:
    """Production-ready YouTube RAG system"""
    
    PINECONE_INDEX_NAME = "youtube-rag"
    PINECONE_DIMENSION = 1536
    PINECONE_METRIC = "cosine"
    
    def __init__(
        self,
        user_id: int,
        model: str = "gpt-4o-mini",
        temperature: float = 0.5
    ):
        self.user_id = user_id
        self.llm = ChatOpenAI(model=model, temperature=temperature)
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.parser = StrOutputParser()
        
        # Initialize Pinecone
        self.pc = PineconeClient(api_key=os.getenv("PINECONE_API_KEY"))
        self._ensure_pinecone_index()
        
        self.build_chains()
    
    # ... (Copy all methods from the notebook)
    # Add namespace support for multi-user isolation
    # Add async support for better performance
    # Add error handling and logging
```

### FastAPI Main Application: `main.py`

```python
# app/main.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.api.endpoints import auth, videos, chat
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="YouTube RAG Chatbot API",
    description="AI-powered YouTube video Q&A system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
async def root():
    return {
        "message": "YouTube RAG Chatbot API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Authentication Module: `api/endpoints/auth.py`

```python
# app/api/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user
)
from app.models.user import User
from app.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if user exists
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return JWT token"""
    
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user
```

---

## 🔐 Security Considerations

### Backend Security
1. **Password Hashing**: Use bcrypt or Argon2
2. **JWT Tokens**: 
   - Short expiration time (15-30 minutes)
   - Refresh token mechanism
   - Secure secret key storage
3. **API Rate Limiting**: Prevent abuse
4. **Input Validation**: Sanitize all user inputs
5. **CORS**: Restrict allowed origins
6. **Environment Variables**: Store sensitive data in `.env`
7. **SQL Injection Prevention**: Use ORM parameterized queries
8. **HTTPS**: Enforce SSL/TLS in production

### Frontend Security
1. **XSS Protection**: Sanitize rendered HTML
2. **CSRF Tokens**: For state-changing operations
3. **Secure Storage**: Don't store sensitive data in localStorage
4. **Token Refresh**: Automatic token renewal
5. **Logout on Expiration**: Clear tokens on expiry

---

## 🎨 UI/UX Design Guidelines

### Color Scheme
```css
:root {
  --primary: #3B82F6;      /* Blue */
  --secondary: #8B5CF6;    /* Purple */
  --success: #10B981;      /* Green */
  --danger: #EF4444;       /* Red */
  --warning: #F59E0B;      /* Amber */
  --dark: #1F2937;         /* Gray-800 */
  --light: #F9FAFB;        /* Gray-50 */
}
```

### Typography
- **Headings**: Inter, SF Pro Display
- **Body**: -apple-system, BlinkMacSystemFont, 'Segoe UI'
- **Code**: 'Fira Code', 'Courier New', monospace

### Design Principles
1. **Clean & Modern**: Minimalist design with ample whitespace
2. **Responsive**: Mobile-first approach
3. **Accessible**: WCAG 2.1 AA compliance
4. **Fast**: Lazy loading, code splitting
5. **Intuitive**: Clear navigation, obvious CTAs

### Component Library
Use Tailwind CSS + Headless UI or shadcn/ui for consistent styling

---

## 📦 Dependencies

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "tailwindcss": "^3.3.6",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "react-markdown": "^9.0.1",
    "react-youtube": "^10.1.0",
    "date-fns": "^2.30.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### Backend (`requirements.txt`)
```txt
fastapi==0.108.0
uvicorn[standard]==0.25.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.13.0
pydantic==2.5.3
pydantic-settings==2.1.0

# AI/ML
langchain==0.1.0
langchain-openai==0.0.2
langchain-pinecone==0.0.1
langchain-community==0.0.10
langchain-core==0.1.10
langchain-text-splitters==0.0.1
openai==1.6.1
pinecone-client==3.0.0
youtube-transcript-api==0.6.1
rank-bm25==0.2.2
numpy==1.26.2

# Utilities
python-dotenv==1.0.0
redis==5.0.1
celery==5.3.4
```

---

## 🐳 Docker Configuration

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: youtube_rag_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: youtube_rag_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://youtube_rag_user:secure_password@postgres:5432/youtube_rag_db
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Backend `Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend `Dockerfile`
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

## 🚀 Deployment Guide

### Environment Variables

#### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/youtube_rag_db

# API Keys
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pcsk_...

# JWT
SECRET_KEY=your-super-secret-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Redis
REDIS_URL=redis://localhost:6379/0
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=YouTube RAG Chatbot
```

### Production Deployment Steps

1. **Database Setup**
```bash
# Create database
createdb youtube_rag_db

# Run migrations
alembic upgrade head
```

2. **Backend Deployment**
```bash
# Install dependencies
pip install -r requirements.txt

# Run with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

3. **Frontend Build**
```bash
# Build for production
npm run build

# Serve with nginx or deploy to Vercel/Netlify
```

4. **Docker Deployment**
```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 🧪 Testing Strategy

### Backend Tests
```python
# tests/test_auth.py
def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "Test123!"
    })
    assert response.status_code == 200
    assert "id" in response.json()

def test_login_user():
    response = client.post("/api/auth/login", data={
        "username": "test@example.com",
        "password": "Test123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

# tests/test_videos.py
def test_process_video(authenticated_client):
    response = authenticated_client.post("/api/videos/process", json={
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    })
    assert response.status_code == 200
```

### Frontend Tests
```javascript
// src/components/__tests__/Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../auth/Login';

test('renders login form', () => {
  render(<Login />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

test('submits login form', async () => {
  render(<Login />);
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
  // Assert API call and navigation
});
```

---

## 📊 Performance Optimization

### Backend
1. **Database Indexing**: Add indexes on frequently queried columns
2. **Caching**: Use Redis for video metadata and chat history
3. **Connection Pooling**: PostgreSQL connection pool
4. **Async Processing**: Use Celery for video processing
5. **Query Optimization**: Eager loading, select specific columns

### Frontend
1. **Code Splitting**: Lazy load routes
2. **Image Optimization**: WebP format, lazy loading
3. **Caching**: Service workers, HTTP caching
4. **Bundle Size**: Tree shaking, minimize dependencies
5. **Virtual Scrolling**: For long chat histories

---

## 📈 Monitoring & Logging

### Backend Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
```

### Monitoring Tools
- **Sentry**: Error tracking
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **LogRocket**: Frontend monitoring

---

## 🔄 Future Enhancements

1. **Multi-video Chat**: Ask questions across multiple videos
2. **Video Bookmarks**: Save important timestamps
3. **Collaborative Chats**: Share conversations with others
4. **Voice Input**: Speech-to-text questions
5. **Mobile App**: React Native application
6. **Advanced Analytics**: Usage patterns, popular topics
7. **Video Playlists**: Process entire playlists
8. **Custom AI Models**: Fine-tuned models per user
9. **Integration**: Slack, Discord bots
10. **Premium Features**: Higher limits, priority processing

---

## 📝 Development Workflow

### 1. Setup Development Environment
```bash
# Clone repository
git clone <repository-url>
cd youtube-rag-chatbot

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure environment variables

# Frontend setup
cd ../frontend
npm install
cp .env.example .env  # Configure environment variables
```

### 2. Run Development Servers
```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Database (if using Docker)
docker-compose up postgres redis
```

### 3. Git Workflow
```bash
# Create feature branch
git checkout -b feature/user-authentication

# Make changes and commit
git add .
git commit -m "feat: add user authentication"

# Push and create PR
git push origin feature/user-authentication
```

---

## 🎯 Success Metrics

### Technical Metrics
- **API Response Time**: < 500ms for 95th percentile
- **Video Processing Time**: < 30 seconds for average video
- **Uptime**: 99.9% availability
- **Error Rate**: < 0.1%

### Business Metrics
- **User Signups**: Track registration conversion
- **Active Users**: Daily/Monthly active users
- **Video Processing**: Videos processed per day
- **User Retention**: 7-day, 30-day retention rates

---

## 📚 Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [LangChain Documentation](https://python.langchain.com/)
- [Pinecone Documentation](https://docs.pinecone.io/)

### Tutorials
- YouTube RAG implementation guides
- JWT authentication best practices
- React + TypeScript patterns
- Docker containerization

---

## 🤝 Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request with clear description
6. Follow code style guidelines (ESLint, Black)

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🆘 Support

For issues and questions:
- GitHub Issues: [Project Issues](https://github.com/your-repo/issues)
- Email: support@yourdomain.com
- Documentation: [Project Wiki](https://github.com/your-repo/wiki)

---

## ✅ Quick Start Checklist

- [ ] Clone repository
- [ ] Set up Python virtual environment
- [ ] Install backend dependencies
- [ ] Configure environment variables
- [ ] Set up PostgreSQL database
- [ ] Run database migrations
- [ ] Install frontend dependencies
- [ ] Start backend server
- [ ] Start frontend development server
- [ ] Test authentication flow
- [ ] Process a test video
- [ ] Test chat functionality
- [ ] Review API documentation
- [ ] Set up Docker containers (optional)
- [ ] Configure CI/CD pipeline (optional)

---

**Built with ❤️ using React, Python, and AI**
