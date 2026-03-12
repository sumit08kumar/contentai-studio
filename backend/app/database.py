import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

# MongoDB client (initialized on startup, closed on shutdown)
client: AsyncIOMotorClient = None # type: ignore
db: AsyncIOMotorDatabase = None # type: ignore
bwa_db: AsyncIOMotorDatabase = None  # type: ignore  # Separate DB for Blog Writing Agent


async def connect_to_mongo():
    """Create MongoDB connection on application startup"""
    global client, db, bwa_db
    client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        tlsCAFile=certifi.where(),
    )
    db = client[settings.MONGODB_DB_NAME]
    bwa_db = client[settings.BWA_MONGODB_DB_NAME]

    # Create indexes for YouTube RAG DB
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.videos.create_index([("user_id", 1), ("video_id", 1)], unique=True)
    await db.chat_history.create_index([("video_id", 1), ("user_id", 1)])
    await db.sessions.create_index([("user_id", 1), ("video_id", 1)])

    # Create indexes for Blog Writing Agent DB
    await bwa_db.blogs.create_index([("user_id", 1), ("created_at", -1)])
    await bwa_db.blogs.create_index("status")
    await bwa_db.blog_tasks.create_index("blog_id")
    await bwa_db.blog_evidence.create_index("blog_id")
    await bwa_db.blog_images.create_index("blog_id")

    print("✅ Connected to MongoDB (youtube_rag_db + blog_writing_db)")


async def close_mongo_connection():
    """Close MongoDB connection on application shutdown"""
    global client
    if client:
        client.close()
        print("❌ Disconnected from MongoDB")


def get_db() -> AsyncIOMotorDatabase:
    """Get the main database instance (youtube_rag_db)"""
    return db


def get_bwa_db() -> AsyncIOMotorDatabase:
    """Get the Blog Writing Agent database instance (blog_writing_db)"""
    return bwa_db
