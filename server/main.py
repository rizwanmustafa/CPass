#!/usr/bin/env python3
from datetime import datetime, timedelta
from password_generator import generate_password
from typing import List
from flask import Flask, request, jsonify as dumpJSON
from flask_cors import CORS, cross_origin
from models import get_user_actions_table, db, User, get_user_tokens_table
from mail import mail, send_failed_login_email, send_mail, send_verification_email
from decouple import config as GetEnvVar
from utility import hash_password, validate_user_data, gen_rand_str
from utility import prep_response, SERVER_RESPONSE_TYPE
from utility import compare_passwords
from manage_tokens_db import generate_token, get_token_status, activate_token, init as init_token_management

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
    MAIL_PORT=int(GetEnvVar('MAIL_PORT')),
    MAIL_USE_SSL=GetEnvVar('MAIL_USE_SSL') == '1',
    MAIL_USERNAME=GetEnvVar('MAIL_USERNAME'),
    MAIL_PASSWORD=GetEnvVar("MAIL_PASSWORD"),
)

cors = CORS(app)
db.init_app(app)
mail.init_app(app)
init_token_management(db)


@app.route("/", methods=["GET", "POST"])
def index():
    print(request.headers.get("Authorization", None))
    return dumpJSON(f"{request.remote_addr}")


@ app.route("/users/", methods=["POST"])
@ cross_origin()
def manage_users():
    # Create, manage and delete user related stuff here
    if request.method == "POST":
        # Get user data
        userData = request.get_json()

        username = userData['username']
        email = userData['email']
        password = userData['password']

        # Check if user data is valid
        userDataValid = validate_user_data(username, email, password)

        if userDataValid != "":  # Since the data is not valid, send the appropriate correction measure
            return dumpJSON(prep_response(SERVER_RESPONSE_TYPE['ERROR'], body=userDataValid))

        # Make sure the username or email does not already exist in the database
        usernameExists = User.query.filter_by(username=username).all()
        if usernameExists:
            return dumpJSON(prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Username is already taken!"))

        emailExists = User.query.filter_by(email=email).all()
        if emailExists:
            return dumpJSON(prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Email is already taken!"))

        # Hash the passoord and get the salt used
        hashedPassword, salt = hash_password(password)

        # Create a user object
        newUser = User(username, email, hashedPassword, salt, False, False)

        # Generate a random url and set the expirty time for them to verify their account
        randomURL = gen_rand_str(8)
        expiry_time = datetime.now() + timedelta(hours=1)

        # Send the verification email to the user
        if not send_verification_email(username, randomURL, email):
            return dumpJSON(prep_response(
                SERVER_RESPONSE_TYPE['ERROR'],
                body="User could not be created! Please try again later!"
            ))

        # Get the user action table and create a new action
        userActionTable = get_user_actions_table(username)
        userAction = userActionTable(randomURL, 1, expiry_time)

        # Add the user object and action object to the database and commit the changes
        db.session.add(userAction)
        db.session.add(newUser)
        db.session.commit()

        return dumpJSON(prep_response(
            SERVER_RESPONSE_TYPE['SUCCESSFUL'],
            body="Account created successfully! Please verify your account by following the directions specified in the email sent to you."
        ))


@ app.route("/usernameavailable")
@ cross_origin()
def username_available():
    username = request.args.get("username")

    if username == None:
        return dumpJSON("Bad request")
    if len(username) > 50:
        return dumpJSON(False)
    # Get the user by the username
    user: List[User] = User.query.filter_by(username=username).all()

    if len(user) and user[0].username == username:  # The user name is not available
        return dumpJSON(False)

    return dumpJSON(True)


@ app.route("/action")
@ cross_origin()
def manage_user_action():
    username = request.args.get('username')
    url = request.args.get('url')

    if username == None or url == None:
        return dumpJSON("Bad Request")

    # Check URL length
    if len(url) != 8:
        return dumpJSON("Bad Request")  # Invalid URL

    # Check if user exists.
    user: List[User] = User.query.filter_by(username=username).all()
    if len(user) == 0:
        return dumpJSON("Bad Request")  # User does not exist

    # Check if the URL exists
    userActionTable = get_user_actions_table(username)
    userAction: List[userActionTable] = userActionTable.query.filter_by(
        url=url).all()

    if len(userAction) == 0:
        return dumpJSON("Bad Request")  # URL does not exist

    actionID = userAction[0].id

    if actionID == 1:
        # The account is verified
        user[0].emailVerified = True
        userAction[0].expiry_date = datetime.now()  # Expire the link
        db.session.commit()

        message = {
            "heading": "Account Verified Successfully!",
            "body": "Your account has been verified successfully! You can now log in to your account!"
        }

        return dumpJSON(message)

    else:
        return dumpJSON("Some problem occurred! Please try again later!")


@ app.route("/generatepassword")
@ cross_origin()
def generate_password():
    length = request.args.get('length', default=None, type=int)
    uppercase = request.args.get('uppercase', default=None, type=bool)
    lowercase = request.args.get('lowercase', default=None, type=bool)
    numbers = request.args.get('numbers', default=None, type=bool)
    specials = request.args.get('specials', default=None, type=bool)

    incompleteData = length == None or uppercase == None or lowercase == None or numbers == None or specials == None

    if incompleteData:
        return dumpJSON("Incomplete password attributes were sent!")

    generated_password = generate_password(
        length, uppercase, lowercase, numbers, specials)

    return dumpJSON(generated_password)


@app.route("/tokens/", methods=["POST"])
@cross_origin()
def manage_tokens():
    data = request.get_json()
    ip_address = request.remote_addr

    if 'mode' not in data:
        return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Mode not present in the request!")

    if 'username' not in data:
        return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Username not present in the request!")

    # Make sure the user exists and email is verified
    user: User = User.query.filter_by(username=data['username']).all()

    if not user:
        return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="!")

    user = user[0]

    if not user.emailVerified:
        return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Please verify your email before you log in!")

    user_token_table = get_user_tokens_table(data['username'])

    if data['mode'].lower() == "generate":
        if 'password' not in data:
            return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Incorrect credentials!")

        # If the password is incorrect, return an error
        hashedPassword = hash_password(data['password'], user.salt)[0]
        if not compare_passwords(hashedPassword, user.password):
            send_failed_login_email(user.username, user.email, ip_address)
            return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Incorrect credentials!")

        gen_token = generate_token(
            user_token_table, user, ip_address, send_mail)

        # If the token was not created, return error
        if gen_token == "":
            return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Could not send a verification email! Please try again later!")
        else:
            return prep_response(SERVER_RESPONSE_TYPE['SUCCESSFUL'], data={'token': gen_token, })

    elif data['mode'].lower() == "activate":

        if 'token' not in data:
            return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Token not present in request!")

        if 'activation_code' not in data:
            return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Activation Code not present in request!")

        return activate_token(user_token_table, data['token'], data['activation_code'])

    elif data['mode'].lower() == "status":
        if 'token' not in data:
            return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Token not present in request!")

        userToken: user_token_table = user_token_table.query.filter_by(
            token=data['token']).all()

        # If the token does not exist, return error
        if not userToken:
            return prep_response(SERVER_RESPONSE_TYPE['ERROR'], body="Token does not exist!")

        userToken = userToken[0]

        return get_token_status(userToken)
    else:
        dumpJSON(prep_response(
            SERVER_RESPONSE_TYPE['ERROR'], body="Invalid mode in request!"))


if __name__ == "__main__":
    with app.test_request_context():
        db.create_all()
    app.run(host="::", debug=True)
