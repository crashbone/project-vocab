import psycopg2, os
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

class DeleteRequestData(BaseModel):
    id: int

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

@router.delete("/deletePage")
def delete_page_handler(deleteRequestData: DeleteRequestData, user=Depends(auth_required)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the page exists and belongs to the authenticated user
        cursor.execute(
            "SELECT id FROM pages WHERE id = %s AND user_id = %s;",
            (deleteRequestData.id, user['userid'])
        )
        page = cursor.fetchone()
        if not page:
            raise HTTPException(404, "Page not found or access denied")

        # Delete the page
        cursor.execute(
            "DELETE FROM pages WHERE id = %s AND user_id = %s;",
            (deleteRequestData.id, user['userid'])
        )

        conn.commit()
        cursor.close()
        conn.close()

        return {"status": "success", "id": deleteRequestData.id}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
