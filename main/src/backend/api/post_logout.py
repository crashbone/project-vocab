from fastapi import APIRouter, Response

router = APIRouter()


# The session is just the access_token cookie; deleting it is enough to log out.
# Does not touch the DB, needs no auth (so logout works with an expired cookie too).
@router.post("/logout")
def logout(response: Response):
    # Deletion must carry the same attributes as set_cookie (post_postGoogleLogin.py).
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {"status": "success"}
