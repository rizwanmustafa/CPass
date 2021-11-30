from os import urandom
import re
import hashlib
from random import randint, choice
from string import ascii_letters as alphabets
from werkzeug.security import safe_str_cmp


def compare_passwords(a: bytes, b: bytes):
    return safe_str_cmp(a.decode("utf-8"), b.decode("utf-8"))


def HashPassword(password: str, salt_used: bytes = None):
    if salt_used == None:
        salt_used = urandom(32)

    hashed_password = hashlib.pbkdf2_hmac(
        'sha256',  # The hashing algorithm
        password.encode('utf-8'),  # Convert the password to bytes
        salt_used,
        100000  # It is recommended to use at least 100,000 iterations of SHA-256 for safety
    )

    return hashed_password, salt_used


def validate_user_data(username: str, email: str, password: str):
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
    if not is_valid_email(email):
        return "Please enter a valid email!"

    # Validate password. Rules: length >= 8. Contains both numbers and alphabets
    if len(password) < 8:
        return "Password must be at least 8 characters long!"
    if len(password) > 50:
        return "Password must not be longer than 50 characters!"
    contains_alpha = contains_num = False
    for x in password:
        if x.isalpha():
            contains_alpha = True
        if x.isnumeric():
            contains_num = True

        if contains_alpha and contains_num:
            break

    if contains_alpha == False or contains_num == False:
        return "Password must be alphanumeric"

    return ""


def is_valid_email(email: str) -> bool:
    if not re.search('^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$', email):
        return False

    return True


def gen_rand_str(length: int):
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


def prep_response(type: int, heading: str = None, body: str = None, data: dict = None) -> dict:
    server_response = {"type": type}

    if heading:
        server_response["heading"] = heading

    if body:
        server_response["body"] = body

    if data:
        server_response["data"] = data

    return server_response
