from os import urandom
import re
import hashlib
from random import randint, choice
from string import ascii_letters as alphabets
from enum import Enum


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
    if not IsValidEmail(email):
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


def generate_random_string(length: int):
    string:  str = ""

    for x in range(length):
        if randint(0, 1):
            string += choice(alphabets)
        else:
            string += str(randint(0, 9))

    return string


SERVER_RESPONSE_TYPE = {
    'SUCCESSFUL': 1,
    'ERROR': 2,
    'WARNING': 3,
}

def prepare_server_response_object(type: int, heading: str = None, body: str = None, data: dict = None) -> dict:
    server_response = {"type": type}

    if heading:
        server_response["heading"] = heading

    if body:
        server_response["body"] = body

    if data:
        server_response["data"] = data

    return server_response