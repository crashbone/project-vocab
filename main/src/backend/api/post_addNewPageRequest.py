import psycopg2, os, json
from fastapi import APIRouter, Cookie, HTTPException, Depends
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
from backend.jwt_handler import verify_app_jwt
from backend.db_util.get_user_by_id import get_user_by_id
from backend.roles import USERS_ROLES, Role

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
    type: str = "page"

PAGE_TYPES = ["page", "multiple_choice"]
ADMIN_ONLY_PAGE_TYPES = ["multiple_choice"]

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
    invalid_words = ["", " | "]
    if (postRequestData.words in invalid_words):
        raise HTTPException(400, "Invalid input")
    if postRequestData.type not in PAGE_TYPES:
        raise HTTPException(400, "Invalid page type")
    if postRequestData.type in ADMIN_ONLY_PAGE_TYPES:
        full_user = get_user_by_id(user['userid'])
        user_roles = USERS_ROLES.get(full_user.get("email"), []) if full_user else []
        if Role.ADMIN not in user_roles:
            raise HTTPException(403, "Admin privileges required")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # --- FIX: Pass the raw string directly. psycopg2 will correctly
        #          escape and insert it into the 'jsonb' column as a JSON scalar string.
        #          This replicates the behavior of 'E'raw string'::jsonb'.
        words_raw_string = json.dumps(postRequestData.words)
        # --------------------------------------------------------------------------

        # created_at, updated_at NOW NOW
        insert_query = """
            INSERT INTO pages (user_id, name, description, words, time_spent_seconds, last_entry_at, type)
            VALUES (%s, %s, %s, %s, %s, NOW(), %s)
            RETURNING id;
        """

        cursor.execute(insert_query, (
            user['userid'],
            postRequestData.name,
            postRequestData.description,
            words_raw_string, # Pass the raw string here
            0,
            postRequestData.type,
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
            "type": postRequestData.type,
        }

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))