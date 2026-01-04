@router.post("/postGoogleLogin2")
def login_handler2(payload: PostGoogleLoginData, response: Response):
    global users_cache
    print("Received login request:", payload.json())

    try:
        if users_cache is None:
            users_cache = fetch_all_users()

        tokens = exchange_code_for_tokens(payload.code)
        id_token = tokens.get("id_token")
        if not id_token:
            raise HTTPException(
                status_code=400, detail="No ID token received from Google"
            )

        user_info = decode_id_token(id_token)
        userid = user_info["sub"]
        email = user_info.get("email")
        name = user_info.get("name")
        avatar_url = user_info.get("picture")

        # register in DB
        register_user_to_db(userid, email, name, avatar_url)
        users_cache[userid] = email

        # create JWT for session
        app_token = create_app_jwt(userid)
        # print debug
        print(
            f"Login success: userid={userid}, email={email}, name={name}, avatar_url={avatar_url}"
        )
        response.set_cookie(
            key="access_token",  # cookie name
            value=app_token,  # JWT
            httponly=True,  # cannot be accessed by JS
            secure=True,  # HTTPS only
            samesite="lax",
            max_age=60 * 24 * 60 * 60,  # 60 days
        )
        response.set_cookie(
            key="access_token_test",
            value="testtoken123",
            # httponly=True,
            # secure=True,
            samesite="lax",
            path="/",
            max_age=60 * 24 * 60 * 60,  # 60 days
        )

        return {
            "status": "success",
            "userid": userid,
            "name": name,
            "email": email,
            "avatar_url": avatar_url,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))