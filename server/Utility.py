from os import urandom
import re
import hashlib


def HashPassword(password: str, saltUsed: bytes = None):
    if saltUsed == None:
        saltUsed = urandom(32)

    hashedPassword = hashlib.pbkdf2_hmac(
        'sha256',  # The hashing algorithm
        password.encode('utf-8'),  # Convert the password to bytes
        saltUsed,
        100000  # It is recommended to use at least 100,000 iterations of SHA-256 for safety
    )

    return hashedPassword, saltUsed


def ValidateUserData(username: str, email: str, password: str):
    # Presence check for all variables
    if username == None or username == "":
        return "Username cannot be empty!"
    elif email == None or email == "":
        return "Email cannot be empty"
    elif password == None or password == "":
        return "Password cannot be empty!"

    # Validate username
    for x in username:
        if not x.isalpha() and not x.isnumeric():
            return "Username can only be alphanumeric!"
    if len(username) > 50:  # Length Check
        return "Username should not be longer than 50 characters!"

    # Validate email
    if IsValidEmail(email):
        return "Please enter a valid email!"

    # Validate password. Rules: length >= 8. Contains both numbers and alphabets
    if len(password) < 8:
        return "Password must be at least 8 characters long!"
    containsAlpha = containsNum = False
    for x in password:
        if x.isalpha():
            containsAlpha = True
        if x.isnumeric():
            containsNum = True

        if containsAlpha and containsNum:
            break

    if containsAlpha == False or containsNum == False:
        return "Password must be alphanumeric"

    return ""


def IsValidEmail(email: str) -> bool:
    if not re.search('^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$', email):
        return False

    return True
