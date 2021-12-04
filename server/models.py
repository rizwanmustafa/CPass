from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db: SQLAlchemy = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    username = db.Column(db.String(50), nullable=False, primary_key=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    hashed_password = db.Column(db.LargeBinary, nullable=False)
    salt = db.Column(db.LargeBinary, nullable=False)
    email_verified = db.Column(db.Boolean, nullable=False)

    def __init__(self, username: str, email: str, hashed_password: bytes, salt: bytes, email_verified: bool):
        self.username = username
        self.email = email
        self.hashed_password = hashed_password
        self.salt = salt
        self.email_verified = email_verified


def get_user_actions_table(username: str):
    # This table stores that action URLs for a particular user
    class ActionTable(db.Model):
        __tablename__ = f'userActions${username}'
        __table_args__ = {
            # This is so that we can get this table again even though it is already defined
            'extend_existing': True,
        }

        url = db.Column(db.String(8), nullable=False, primary_key=True)
        id = db.Column(db.Integer, nullable=False)
        expiry_date = db.Column(db.DateTime, nullable=False)
        additional_data = db.Column(db.String(255), nullable=False)

        def __init__(self, url: str, id: int, expiry_date: datetime, additional_data: str = ""):
            self.url = url
            self.id = id
            self.expiry_date = expiry_date
            self.additional_data = additional_data

    # Create the table
    db.create_all()
    return ActionTable


def get_user_credentials_table(real_username: str):
    # This table stores the encrypted credentials of the user
    class Credentials_Table(db.Model):
        __tablename__ = f'userCredentials${real_username}'
        __table_args__ = {
            # This is so that we can get this table again even though it is already defined
            'extend_existing': True,
        }

        id = db.Column(db.Integer, nullable=False, primary_key=True)
        title = db.Column(db.LargeBinary, nullable=False)
        username = db.Column(db.LargeBinary, nullable=False)
        email = db.Column(db.LargeBinary, nullable=False)
        password = db.Column(db.LargeBinary, nullable=False)
        salt = db.Column(db.LargeBinary, nullable=False)

        def __init__(self, id: int, title: bytes, username: bytes, email: bytes, password: bytes, salt: bytes):
            self.id = id
            self.title = title
            self.username = username
            self.email = email
            self.password = password
            self.salt = salt

    # Create the table
    db.create_all()
    return Credentials_Table
