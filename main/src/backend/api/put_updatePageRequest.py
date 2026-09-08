import psycopg2, os, json
from fastapi import APIRouter, Cookie, HTTPException, Depends
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
from backend.jwt_handler import verify_app_jwt

POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")

router = APIRouter()

class UpdateRequestData(BaseModel):
    id: int
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

@router.put("/updatePage")
def update_page_handler(updateRequestData: UpdateRequestData, user=Depends(auth_required)):
    invalid_words = ["", " | "]
    if (updateRequestData.words in invalid_words):
        raise HTTPException(400, "Invalid input")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Same as addPage: psycopg2 writes the raw string into the 'jsonb'
        # column as a JSON scalar string.
        words_raw_string = json.dumps(updateRequestData.words)

        # Ownership is enforced inside the WHERE clause -- a page belonging to
        # another user simply matches nothing and yields a 404.
        # time_spent_seconds and last_entry_at are deliberately untouched:
        # editing a page must not reset its statistics.
        update_query = """
            UPDATE pages
            SET name = %s, description = %s, words = %s
            WHERE id = %s AND user_id = %s
            RETURNING id;
        """

        cursor.execute(update_query, (
            updateRequestData.name,
            updateRequestData.description,
            words_raw_string,
            updateRequestData.id,
            user['userid'],
        ))
        page = cursor.fetchone()
        if not page:
            raise HTTPException(404, "Page not found or access denied")

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "status": "success",
            "id": page["id"],
            "name": updateRequestData.name,
            "description": updateRequestData.description,
            "words": updateRequestData.words,
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
