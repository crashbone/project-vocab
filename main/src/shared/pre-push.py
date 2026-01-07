import subprocess
import time
import os
import sys
from enum import Enum

# --- CONFIGURATION ---
class BranchMode(Enum):
    CURRENT = 1
    CUSTOM = 2

class OS(Enum):
    Mac = 0
    Windows = 1
    Linux = 2

def detect_os() -> OS:
    p = sys.platform
    if p == "darwin": return OS.Mac
    if p.startswith("win"): return OS.Windows
    return OS.Linux

DEBUG = True 
MODE = BranchMode.CURRENT  
FOLDERS_UP_TO_PROJECT_ROOT = 2
CHECK_INTERVAL = 3  
TOTAL_TIMEOUT = 10  
REMOTE = "origin"

# --- PATH LOGIC ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# project-vocab/main/src
SRC_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
# project-vocab/main
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

def log(msg):
    if DEBUG:
        print(f"[DEBUG-LOG] {msg}")

def trigger_restart_script():
    """
    Dispatches an external script to handle the delay, kill, and restart.
    This allows THIS script and the parent server to finish cleanly.
    """
    current_pid = os.getpid()
    current_os = detect_os()
    log(f"Triggering restart script. Current PID: {current_pid}")
    
    try:
        if current_os == OS.Windows:
            script_path = os.path.join(SCRIPT_DIR, "restart.bat")
            if not os.path.exists(script_path):
                log(f"ERROR: {script_path} not found!")
                return
            
            # Pass current PID as %1 to the .bat
            subprocess.Popen(
                [script_path, str(current_pid)], 
                creationflags=subprocess.CREATE_NEW_CONSOLE,
                close_fds=True
            )
            log("Windows restart script dispatched via new console.")

        else:
            script_path = os.path.join(SCRIPT_DIR, "restart.sh")
            if not os.path.exists(script_path):
                log(f"ERROR: {script_path} not found!")
                return

            # Run via bash and detach
            subprocess.Popen(
                ["/bin/bash", script_path, str(current_pid)],
                preexec_fn=os.setpgrp,
                close_fds=True
            )
            log("Linux restart script dispatched via nohup-style detach.")

    except Exception as e:
        log(f"CRITICAL ERROR triggering restart script: {e}")

def get_target_branch():
    try:
        result = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=PROJECT_ROOT, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except: return "main"

def get_local_sha(target_branch):
    try:
        result = subprocess.run(["git", "rev-parse", target_branch], cwd=PROJECT_ROOT, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except: return None

def get_remote_info(target_branch):
    try:
        subprocess.run(["git", "fetch", REMOTE], cwd=PROJECT_ROOT, capture_output=True)
        sha_result = subprocess.run(["git", "rev-parse", f"{REMOTE}/{target_branch}"], cwd=PROJECT_ROOT, capture_output=True, text=True, check=True)
        return sha_result.stdout.strip(), ""
    except: return None, None

def main():
    log(f"Script started. Project Root: {PROJECT_ROOT}")
    
    # Check if Git is accessible
    try:
        git_check = subprocess.run(["git", "--version"], capture_output=True)
        log(f"Git Check: {git_check.stdout.decode().strip()}")
    except Exception as e:
        log(f"Git not found! {e}")
        return

    target_branch = get_target_branch()
    local_sha = get_local_sha(target_branch)
    log(f"Branch: {target_branch} | Local SHA: {local_sha}")

    start_time = time.time()
    new_commit_detected = False

    while time.time() - start_time < TOTAL_TIMEOUT:
        remote_sha, _ = get_remote_info(target_branch)
        log(f"Polling... Remote SHA: {remote_sha}")
        
        if remote_sha and remote_sha != local_sha:
            new_commit_detected = True
            log("CHANGE DETECTED!")
            break
        time.sleep(CHECK_INTERVAL)

    if new_commit_detected:
        log(f"Pulling updates...")
        pull_result = subprocess.run(["git", "pull", REMOTE, target_branch], cwd=PROJECT_ROOT, capture_output=True, text=True)
        
        if pull_result.returncode == 0:
            log("Pull successful. Dispatching restart script...")
            trigger_restart_script()
            # We exit immediately so the FastAPI server can return 'Success' to the user
            sys.exit(0)
        else:
            log(f"Pull FAILED: {pull_result.stderr}")
    else:
        log("No changes found. Exiting.")

if __name__ == "__main__":
    main()