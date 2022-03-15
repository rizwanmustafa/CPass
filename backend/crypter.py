from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from os import urandom
import base64


def __get_custom_fernet_object(master_password: bytes, salt: bytes) -> Fernet:
    # Make sure that the paremeters are of correct type
    if not isinstance(master_password, bytes):
        raise TypeError("Parameter 'master_password' must be of type str")
    if not isinstance(salt, bytes):
        raise TypeError("Parameter 'salt' must be of type bytes")

    # Get custom key for Fernet using user's masterpassword
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(master_password))

    return Fernet(key)


def encrypt_str_to_bytes(master_password: bytes, raw_data: str, salt: bytes) -> bytes:

    # Make sure that the paremeters are of correct type
    if not isinstance(master_password, bytes):
        raise TypeError("Parameter 'master_password' must be of type str")
    if not isinstance(raw_data, str):
        raise TypeError("Parameter 'raw_password' must be of type str")
    if not isinstance(salt, bytes):
        raise TypeError("Parameter 'salt' must be of type bytes")

    # Make sure that parameters are not empty
    if not master_password:
        raise ValueError("Paramter 'master_password' cannot be empty")
    if not raw_data:
        raise ValueError("Paramter 'raw_password' cannot be empty")
    if not salt:
        raise ValueError("Parameter 'salt' cannot be empty")

    fernet_object: Fernet = __get_custom_fernet_object(master_password, salt)
    password_bytes: bytes = bytes(raw_data, "utf-8")
    encryptedPassword = fernet_object.encrypt(password_bytes)

    return encryptedPassword


def decrypt_bytes_to_str(master_password: bytes, encrypted_data: bytes, salt: bytes) -> str:

    # Make sure that the paremeters are of correct type
    if not isinstance(master_password, bytes):
        raise TypeError("Parameter 'master_password' must be of type str")
    if not isinstance(encrypted_data, bytes):
        raise TypeError("Parameter 'encrypted_password' must be of type bytes")
    if not isinstance(salt, bytes):
        raise TypeError("Parameter 'salt' must be of type bytes")

    # Make sure that parameters are not empty
    if not master_password:
        raise ValueError("Paramter 'master_password' cannot be empty")
    if not encrypted_data:
        raise ValueError("Paramter 'encrypted_password' cannot be empty")
    if not salt:
        raise ValueError("Parameter 'salt' cannot be empty")

    fernet_object: Fernet = __get_custom_fernet_object(master_password, salt)
    password_bytes: bytes = fernet_object.decrypt(encrypted_data)
    raw_password: str = str(password_bytes, "utf-8")

    return raw_password


def generate_salt() -> bytes:
    return urandom(32)
