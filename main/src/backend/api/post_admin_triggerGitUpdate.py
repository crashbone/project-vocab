import os
import sys
import subprocess
from fastapi import APIRouter, HTTPException, Depends
from backend.roles import USERS_ROLES, Role
from backend.api.post_deletePageRequest import auth_required
from backend.db_util.get_user_by_id import get_user_by_id

router = APIRouter()

# Path to the shared git script
SCRIPT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "shared", "pre-push.py"))

def admin_required(token_data=Depends(auth_required)):
    if not token_data or 'userid' not in token_data:
        raise HTTPException(status_code=401, detail="Invalid token data")

    # Use the centralized utility function
    full_user = get_user_by_id(token_data['userid'])
    
    if not full_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_email = full_user.get("email")
    user_roles = USERS_ROLES.get(user_email, [])
    
    if Role.ADMIN not in user_roles:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    return full_user

@router.post("/admin/triggerGitUpdate")
def trigger_git_update(user=Depends(admin_required)):
    try:
        # 1. Use DETACHED_PROCESS so the script is independent of the server
        # This prevents the script from being dragged down if the server restarts
        # OR from the server blocking the script's output
        DETACHED_PROCESS = 0x00000008 
        
        print(f"DEBUG: Triggering script at {SCRIPT_PATH}")

        # We don't use .run() because .run() WAITS for the script to finish.
        # If the script kills the server, .run() will never finish and return the 500.
        subprocess.Popen(
            [sys.executable, SCRIPT_PATH],
            creationflags=DETACHED_PROCESS,
            close_fds=True
        )

        # 2. Return success IMMEDIATELY
        # This gives the browser the "OK" before the script starts killing processes
        return {
            "status": "success", 
            "message": "Git update process started in background. Server will restart shortly."
        }

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))