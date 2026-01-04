import requests, psycopg2, jwt, traceback, os
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
from backend.jwt_handler import create_app_jwt
from backend.os import getRedirectURI

POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
GOOGLE_CLIENT = os.getenv("GOOGLE_CLIENT")
GOOGLE_SECRET = os.getenv("GOOGLE_SECRET")
REDIRECT_URI = getRedirectURI()
# print all env vars
print("POSTGRES_HOST", POSTGRES_HOST)
print("POSTGRES_PORT", POSTGRES_PORT)
print("POSTGRES_DB", POSTGRES_DB)
print("POSTGRES_USER", POSTGRES_USER)
print("POSTGRES_PASSWORD", POSTGRES_PASSWORD)
print("GOOGLE_CLIENT", GOOGLE_CLIENT)
print("GOOGLE_SECRET", GOOGLE_SECRET)
print("REDIRECT_URI", REDIRECT_URI)

router = APIRouter()
# users_cache = None  # {userid: email} # this got broken once we switched having user_id and google_user_id separated


class PostGoogleLoginData(BaseModel):
    code: str


def get_db_connection():
    return psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        cursor_factory=RealDictCursor,
    )


def fetch_all_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT userid, email FROM users;")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return {row["userid"]: row["email"] for row in rows}


def register_user_to_db(google_user_id: str, email: str, name: str, avatar_url: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    upsert_query = """
        INSERT INTO users (google_user_id, email, name, avatar_url)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (google_user_id) DO UPDATE
        SET email = EXCLUDED.email,
            name = EXCLUDED.name,
            avatar_url = EXCLUDED.avatar_url
        RETURNING user_id;
    """
    cursor.execute(upsert_query, (google_user_id, email, name, avatar_url))
    user_id = cursor.fetchone()["user_id"]
    conn.commit()
    cursor.close()
    conn.close()
    return user_id


def exchange_code_for_tokens(code: str):
    url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT,
        "client_secret": GOOGLE_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    response = requests.post(url, data=data)
    if response.status_code != 200:
        raise HTTPException(
            status_code=400, detail=f"Failed to exchange code: {response.text}"
        )
    return response.json()


def decode_id_token(id_token: str):
    return jwt.decode(id_token, options={"verify_signature": False})

@router.post("/postGoogleLogin")
def login_handler(payload: PostGoogleLoginData, response: Response):
    # global users_cache
    print("Received login request:", payload.json())

    try:
        # if users_cache is None:
        #     users_cache = fetch_all_users()

        tokens = exchange_code_for_tokens(payload.code)
        id_token = tokens.get("id_token")
        if not id_token:
            raise HTTPException(
                status_code=400, detail="No ID token received from Google"
            )

        user_info = decode_id_token(id_token)
        google_user_id = user_info["sub"]
        email = user_info.get("email")
        name = user_info.get("name")
        avatar_url = user_info.get("picture")
        user_id = register_user_to_db(google_user_id, email, name, avatar_url)

        # users_cache[google_user_id] = email # this got broken once we switched having user_id and google_user_id separated

        # create JWT for session
        app_token = create_app_jwt(user_id)
        # print debug
        print(
            f"Login success: google_user_id={google_user_id}, email={email}, name={name}, avatar_url={avatar_url}"
        )
        response.set_cookie(
            key="access_token",  # cookie name
            value=app_token,  # JWT
            httponly=True,  # cannot be accessed by JS
            secure=True,  # HTTPS only
            samesite="lax",
            max_age=60 * 24 * 60 * 60,  # 60 days
        )

        return {
            "status": "success",
            "userid": user_id,
            "name": name,
            "email": email,
            "avatar_url": avatar_url,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
