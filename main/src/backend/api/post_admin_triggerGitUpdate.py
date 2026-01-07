import os
import sys
import subprocess
from fastapi import APIRouter, HTTPException, Depends
from backend.roles import USERS_ROLES, Role
from backend.api.post_deletePageRequest import auth_required
from backend.db_util.get_user_by_id import get_user_by_id

# Import your centralized OS logic
from backend.os import detect_os, OS

router = APIRouter()

# Path to the shared git script
SCRIPT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "shared", "pre-push.py"))

def admin_required(token_data=Depends(auth_required)):
    if not token_data or 'userid' not in token_data:
        raise HTTPException(status_code=401, detail="Invalid token data")

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
        if not os.path.exists(SCRIPT_PATH):
            raise FileNotFoundError(f"Script not found at {SCRIPT_PATH}")

        print(f"DEBUG: Triggering script at {SCRIPT_PATH}")

        popen_kwargs = {
            "close_fds": True,
        }

        # Use your custom OS detection logic
        current_os = detect_os()

        if current_os == OS.Windows:
            # Windows: Use DETACHED_PROCESS (0x08)
            popen_kwargs["creationflags"] = 0x00000008
        else:
            # Linux/Mac: Use start_new_session to decouple
            popen_kwargs["start_new_session"] = True

        subprocess.Popen(
            [sys.executable, SCRIPT_PATH],
            **popen_kwargs
        )

        return {
            "status": "success", 
            "message": "Git update process started in background. Server will restart shortly."
        }

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))