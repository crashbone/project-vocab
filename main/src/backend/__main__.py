from dotenv import load_dotenv
load_dotenv("hidden/.env")

import uvicorn
from fastapi import FastAPI
from backend.api.get_pages import router as get_pages
from backend.api.get_initialData import router as get_initialData
from backend.api.post_postGoogleLogin import router as post_postGoogleLogin
from backend.api.post_addNewPageRequest import router as post_addNewPageRequest
from backend.api.post_deletePageRequest import router as post_deletePageRequest
from backend.api.put_updatePageRequest import router as put_updatePageRequest
from backend.api.post_admin_triggerGitUpdate import router as post_admin_triggerGitUpdate
from backend.os import get_ssl, get_host
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sys, os


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://crashbone.com",
        "https://localhost:5173",  # dev frontend
        "https://192.168.178.26:5173",  # LAN access
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create register APIs file
app.include_router(get_initialData)
app.include_router(get_pages)
app.include_router(post_postGoogleLogin)
app.include_router(post_addNewPageRequest)
app.include_router(post_deletePageRequest)
app.include_router(put_updatePageRequest)
app.include_router(post_admin_triggerGitUpdate)
# app.mount("/", StaticFiles(directory="src2/dist", html=True), name="frontend")

ssl_cert, ssl_key = get_ssl()
def main():
    uvicorn.run(app, host=get_host(), port=5174, ssl_certfile=ssl_cert, ssl_keyfile=ssl_key)


if __name__ == "__main__":
    main()
