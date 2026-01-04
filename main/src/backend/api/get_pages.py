import os, psycopg2
from fastapi import APIRouter, Cookie, HTTPException, Depends
from backend.jwt_handler import verify_app_jwt
from fastapi import Request

POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")

router = APIRouter()

def auth_required(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(401, "Missing access token cookie")
    try:
        return verify_app_jwt(access_token)
    except Exception:
        raise HTTPException(401, "Invalid or expired token")

@router.get("/page")
def get_pages(request: Request, user=Depends(auth_required)):
    # connect to db and fetch pages
    try:
        conn = psycopg2.connect(
            host=POSTGRES_HOST, port=POSTGRES_PORT, dbname=POSTGRES_DB,
            user=POSTGRES_USER, password=POSTGRES_PASSWORD
        )
        cursor = conn.cursor()
        sql_query = """
            SELECT id, user_id, name, description, words, time_spent_seconds, last_entry_at
            FROM pages
            WHERE user_id = %s;
        """
        cursor.execute(sql_query, (user['userid'],))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        if rows:
            headers = ["id", "user_id", "name", "description", "words", "time_spent_seconds", "last_entry_at"]
            result = [dict(zip(headers, row)) for row in rows]
        else:
            result = []
        return result
    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")
