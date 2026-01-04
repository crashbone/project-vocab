import psycopg2, os
from fastapi import APIRouter, Request, Cookie, Depends
from psycopg2.extras import RealDictCursor
from backend.jwt_handler import verify_app_jwt

POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")

router = APIRouter()


def get_user_by_id(user_id: int):
    try:
        conn = psycopg2.connect(
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            dbname=POSTGRES_DB,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            cursor_factory=RealDictCursor,
        )
        cursor = conn.cursor()
        cursor.execute(
            "SELECT user_id, name, email, avatar_url FROM users WHERE user_id = %s;",
            (user_id,),
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user
    except Exception as e:
        print("Database error:", e)
        return None


def auth_required(access_token: str = Cookie(None)):
    if not access_token:
        return None
    try:
        return verify_app_jwt(access_token)
    except Exception:
        return None


@router.get("/initialData")
def get_initial_data(request: Request, user=Depends(auth_required)):
    if user is None:
        return {
            "logged_in": False
        }
        
    user_id = user['userid']
    initial_data = {
        "logged_in": False,
    }

    try:
        if not user_id:
            return initial_data

        user = get_user_by_id(user_id)
        if not user:
            return initial_data

        # Construct the initial data payload
        initial_data["logged_in"] = True
        initial_data["user"] = {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "avatar_url": user["avatar_url"]
        }

        return initial_data

    except Exception as e:
        print("JWT verification error:", e)
        return initial_data
