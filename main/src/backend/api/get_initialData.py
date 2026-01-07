from fastapi import APIRouter, Request, Cookie, Depends
from backend.jwt_handler import verify_app_jwt
from backend.db_util.get_user_by_id import get_user_by_id

router = APIRouter()

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
            "name": 'YEY', # user["name"],
            "email": user["email"],
            "avatar_url": user["avatar_url"]
        }

        return initial_data

    except Exception as e:
        print("JWT verification error:", e)
        return initial_data
