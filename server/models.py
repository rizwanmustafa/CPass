from flask_sqlalchemy import SQLAlchemy

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
