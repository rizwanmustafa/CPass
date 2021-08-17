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


def get_user_action_table(username: str):
    # This table stores that action URLs for a particular user
    class ActionTable(db.Model):
        __tablename__ = f'userAction${username}'
        __table_args__ = {
            # This is so that when we get this table again even though it is already defined
            'extend_existing': True,
        }

        url = db.Column(db.String(8), nullable=False, primary_key=True)
        id = db.Column(db.Integer, nullable=False)
        expiry_date = db.Column(db.DateTime, nullable=False)

        def __init__(self, url: str, id: int, expiry_date: datetime):
            self.url = url
            self.id = id
            self.expiry_date = expiry_date

    # Create the table
    db.create_all()
    return ActionTable
