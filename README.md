# YouTube RAG Chatbot

A full-stack web application that allows users to interact with YouTube videos through an AI-powered chatbot using RAG (Retrieval-Augmented Generation) technology.

## Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: PostgreSQL
- **Vector Database**: Pinecone
- **AI/ML**: OpenAI GPT-4, LangChain

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- OpenAI API key
- Pinecone API key

### 1. Clone & Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
```

### 2. Setup Database

```bash
# Create PostgreSQL user and database
psql -U postgres -c "CREATE USER youtube_rag_user WITH PASSWORD 'secure_password';"
psql -U postgres -c "CREATE DATABASE youtube_rag_db OWNER youtube_rag_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE youtube_rag_db TO youtube_rag_user;"
```

### 3. Run Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 4. Setup & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Docker (Alternative)

```bash
docker-compose up -d
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
youtube-rag-chatbot/
├── frontend/          # React + Vite application
├── backend/           # Python FastAPI application
├── docker-compose.yml
└── README.md
```

## License

MIT
