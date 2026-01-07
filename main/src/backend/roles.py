from enum import Enum

# TODO: Move this to a database
class Role(Enum):
    ADMIN = "ADMIN"

# Simple user-to-role mapping
USERS_ROLES = {
    "offcrashbone@gmail.com": [Role.ADMIN]
}