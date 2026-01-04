import psycopg2, os
from fastapi import APIRouter, Cookie, HTTPException, Depends
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor, Json 
from backend.jwt_handler import verify_app_jwt

POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")

router = APIRouter()

class PostRequestData(BaseModel):
    name: str
    description: str
    words: str


def get_db_connection():
    return psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        cursor_factory=RealDictCursor,
    )

def auth_required(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(401, "Missing access token cookie")
    try:
        return verify_app_jwt(access_token)
    except Exception:
        raise HTTPException(401, "Invalid or expired token")

@router.post("/addPage")
def add_page_handler(postRequestData: PostRequestData, user=Depends(auth_required)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # --- FIX: Wrap the raw string in Json() to force psycopg2 to
        #          quote it and treat it as a JSON string scalar.
        words_json_scalar = Json(postRequestData.words)
        # -----------------------------------------------------------

        insert_query = """
            INSERT INTO pages (user_id, name, description, words, time_spent_seconds, created_at, updated_at, last_entry_at)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW(), NOW())
            RETURNING id;
        """

        cursor.execute(insert_query, (
            user['userid'],
            postRequestData.name,
            postRequestData.description,
            words_json_scalar, # Pass the wrapped object here
            0,
        ))
        id = cursor.fetchone()["id"]

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "status": "success",
            "id": id,
            "name": postRequestData.name,
            "description": postRequestData.description,
            "words": postRequestData.words,
        }

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))