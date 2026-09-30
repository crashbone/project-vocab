from fastapi import APIRouter, Response

router = APIRouter()


# Oturum sadece access_token cookie'sinden ibaret; silmek cikis icin yeterli.
# DB'ye dokunmaz, auth gerektirmez (suresi dolmus cookie ile de cikilabilsin).
@router.post("/logout")
def logout(response: Response):
    # Silme, set_cookie ile ayni oznitelikleri tasimali (post_postGoogleLogin.py).
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {"status": "success"}
