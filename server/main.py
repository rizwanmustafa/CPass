from datetime import date, datetime, time, timedelta
from random import randint
from types import coroutine
from typing import List
from json import dumps as dumpJSON

from flask import Flask, Response, request
from flask_cors import CORS, cross_origin
from flask_mail import Mail, Message

from decouple import config as GetEnvVar

from Utility import HashPassword, ValidateUserData, generate_random_string
from models import get_user_action_table, db, User

app = Flask(__name__)
# Update Flask App config
app.config.update(
    # General Settings
    SECRET_KEY=GetEnvVar('SECRET_KEY'),
    # CORS Settings
    CORS_HEADERS='Content-Type',
    # Database Settings
    SQLALCHEMY_DATABASE_URI=GetEnvVar('DATABASE_URI'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    # Email Settings
    MAIL_SERVER=GetEnvVar('MAIL_SERVER'),
    MAIL_PORT=GetEnvVar('MAIL_PORT'),
    MAIL_USE_SSL=GetEnvVar('MAIL_USE_SSL'),
    MAIL_USERNAME=GetEnvVar('MAIL_USERNAME'),
    MAIL_PASSWORD=GetEnvVar("MAIL_PASSWORD"),
)

mail = Mail(app)
cors = CORS(app)
db.init_app(app)


def send_mail(subject: str, body: str, recipients: List[str]) -> bool:
    try:
        msg = Message(subject, recipients, body,
                      sender=GetEnvVar('MAIL_USERNAME'))
        mail.send(msg)
        return True  # Mail was successfully sent
    except:
        return False  # Mail was not successfully sent


@app.route("/")
def test():
    return dumpJSON("This is just a test function!")


def send_verification_email(username: str, url: str, recipient: str):
    url = GetEnvVar("PUBLIC_WEBSITE_URL") + f"/action/{username}/{url}"
    email_body = f"Hi {username},\n\nPlease click the following link to verify your account:\n\n{url}\n\nThanks,\n\nCloud Password Manager"
    return send_mail("Confirm your account", email_body, [recipient])


@ app.route("/users/", methods=["POST"])
@ cross_origin()
def manage_users():
    if request.method == "POST":
        # Get user data
        userData = request.get_json()

        username = userData['username']
        email = userData['email']
        password = userData['password']

        # Check if user data is valid
        userDataValid = ValidateUserData(username, email, password)

        if userDataValid != "":  # Since the data is not valid, send the appropriate correction measure
            return dumpJSON(userDataValid)

        # Make sure the username or email does not already exist in the database
        usernameExists = User.query.filter_by(username=username).first()
        if usernameExists:
            return dumpJSON("Username is already taken!")

        emailExists = User.query.filter_by(email=email).first()
        if emailExists:
            return dumpJSON("Email is already taken!")

        # Hash the passoord and get the salt used
        hashedPassword, salt = HashPassword(password)

        # Create a user object
        newUser = User(username, email, hashedPassword, salt, False, False)

        # Generate a random url and set the expirty time for them to verify their account
        randomURL = generate_random_string(8)
        expiry_time = datetime.now() + timedelta(hours=1)

        # Send the verification email to the user
        if not send_verification_email(username, randomURL, email):
            return dumpJSON("User could not be created! Please try again later!")

        # Get the user action table and create a new action
        userActionTable = get_user_action_table(username)
        userAction = userActionTable(randomURL, 1, expiry_time)

        # Add the user object and action object to the database and commit the changes
        db.session.add(userAction)
        db.session.add(newUser)
        db.session.commit()

        return dumpJSON("User created!")


if __name__ == "__main__":
    with app.test_request_context():
        db.create_all()
    app.run(debug=True)
