import sys
from enum import Enum


class OS(Enum):
    Mac = 0
    Windows = 1
    Linux = 2


def detect_os() -> OS:
    p = sys.platform
    if p == "darwin":
        return OS.Mac
    if p.startswith("win"):
        return OS.Windows
    return OS.Linux


# ---------- SSL paths ----------
OS_SSL = {
    OS.Mac: {
        "cert": "hidden/certs/cert2.pem",
        "key": "hidden/certs/key2.pem"
    },
    OS.Windows: {
        "cert": "hidden/certs/cert.pem",
        "key": "hidden/certs/key.pem"
    },
    OS.Linux: {
        "cert": "hidden/certs/ssl-cloudflare-cert.pem",
        "key": "hidden/certs/ssl-cloudflare-key.pem"
    }
}


def get_ssl():
    os_type = detect_os()
    ssl_info = OS_SSL[os_type]
    return ssl_info["cert"], ssl_info["key"]


# ---------- Host selection ----------
OS_HOST = {
    OS.Mac: "localhost",
    OS.Windows: "localhost",
    OS.Linux: "0.0.0.0"
}


def get_host():
    os_type = detect_os()
    return OS_HOST[os_type]

# ---------- REDIRECT URI ----------
OS_REDIRECT_URI = {
    OS.Mac: "https://localhost",
    OS.Windows: "https://localhost",
    OS.Linux: "https://crashbone.com"
}
def getRedirectURI ():
    os_type = detect_os()
    return OS_REDIRECT_URI[os_type]