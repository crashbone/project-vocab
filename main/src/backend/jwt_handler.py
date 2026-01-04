import jwt
from datetime import datetime, timedelta

JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME"  # change to env var for production
JWT_ALGO = "HS256"

def create_app_jwt(userid: str):
    payload = {
        "userid": userid,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
        "iss": "project-vocab"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def verify_app_jwt(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])