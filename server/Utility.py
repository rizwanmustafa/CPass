from os import urandom
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
