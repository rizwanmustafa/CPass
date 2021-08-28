from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db: SQLAlchemy = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    username = db.Column(db.String(50), nullable=False, primary_key=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.LargeBinary, nullable=False)
    salt = db.Column(db.LargeBinary, nullable=False)
    emailVerified = db.Column(db.Boolean, nullable=False)
    twoFactorAuthEnabled = db.Column(db.Boolean, nullable=False)

    def __init__(self, username, email, password, salt, emailVerified, twoFactorAuthEnabled):
        self.username = username
        self.email = email
        self.password = password
        self.salt = salt
        self.emailVerified = emailVerified
        self.twoFactorAuthEnabled = twoFactorAuthEnabled


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


def get_user_tokens_table(username: str):
    # This table stores the generated tokens for a particular user
    class TokenTable(db.Model):
        __tablename__ = f'userTokens${username}'
        __table_args___ = {
            # This is so that we can get this table agian even though it is already defined
            'extend_existing': True
        }

        code = db.Column(db.String(8), nullable=False, primary_key=True)
        activated = db.Column(db.Boolean, nullable=False)
        activation_code = db.Column(db.String(8), nullable=False)
        expiry_date = db.Column(db.DateTime, nullable=False)

        def __init__(self, code: str, activated: bool, activation_code: str, expiry_date: datetime):
            self.code = code
            self.activated = activated
            self.activation_code = activation_code
            self.expiry_date = expiry_date

    return TokenTable
