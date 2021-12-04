#!/usr/bin/env python3
from datetime import datetime, timedelta
from password_generator import generate_password
from typing import List
from flask import Flask, request, jsonify as dumpJSON
from flask_cors import CORS, cross_origin
from models import db, User, get_user_actions_table, get_user_credentials_table
from mail import mail, send_failed_login_email, send_jwt_mail, send_verification_email
from decouple import config as GetEnvVar
from utility import hash_password, validate_user_data, gen_rand_str
from utility import prep_response
from utility import compare_passwords
from jwt import encode as jwt_encode, decode as jwt_decode, ExpiredSignatureError
from crypter import generate_salt, encrypt_str_to_bytes, decrypt_bytes_to_str

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


@app.route("/", methods=["GET", "POST"])
def index():
    print(request.headers.get("Authorization", None))
    return dumpJSON(f"{request.remote_addr}")

############### Creating and Managing Users###############


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
            return dumpJSON(prep_response('ERROR', body=userDataValid))

        # Make sure the username or email does not already exist in the database
        usernameExists = User.query.filter_by(username=username).all()
        if usernameExists:
            return dumpJSON(prep_response('ERROR', body="Username is already taken!"))

        emailExists = User.query.filter_by(email=email).all()
        if emailExists:
            return dumpJSON(prep_response('ERROR', body="Email is already taken!"))

        # Hash the passoord and get the salt used
        hashedPassword, salt = hash_password(password)

        # Create a user object
        newUser = User(username, email, hashedPassword, salt, False)

        # Generate a random url and set the expirty time for them to verify their account
        randomURL = gen_rand_str(8)
        expiry_time = datetime.now() + timedelta(hours=1)

        # Send the verification email to the user
        if not send_verification_email(username, randomURL, email):
            return dumpJSON(prep_response(
                'ERROR',
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
            'SUCCESSFUL',
            body="Account created successfully! Please verify your account by following the directions specified in the email sent to you."
        ))


@ app.route("/usernameavailable")
@ cross_origin()
def username_available():
    username = request.args.get("username")

    if username == None:
        return prep_response("ERROR", body="Username not provided in arguments!", data={"available": False})
    if len(username) > 50:
        return prep_response("ERROR", body="Username cannot be longer than 50 characters!", data={"available": False})

    # Get the user by the username
    user: User = get_user_by_username(username)

    if user == None:
        return prep_response("ERROR", data={"available": True})

    return prep_response("SUCCESSFUL", data={"available": False})


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
        user[0].email_verified = True
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
def generate_password_api():
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


def get_user_by_username(username: str) -> User:
    user = User.query.filter_by(username=username).all()

    if user:
        return user[0]
    else:
        return None


############### Authentication of Users ###############

def create_jwt(username: str, expiration_delay: int) -> str:
    expiration_time = (datetime.now() + timedelta(seconds=expiration_delay))
    return jwt_encode({"username": username, "exp": expiration_time.timestamp()}, app.secret_key).decode("utf-8")


def decode_jwt_with_info(jwt: str) -> dict:
    info: dict = {"authentic": False, "expired": True, "data": {}}

    try:
        info.update(data=jwt_decode(jwt, verify=False))
        jwt_decode(jwt, app.secret_key)
        info.update(authentic=True, expired=False)
    except ExpiredSignatureError:
        info.update(authentic=True, expired=True)
    except:
        # TODO: Later calculate if the token has expired
        info.update(authentic=False)

    return info


@ app.route("/auth/generate/", methods=["POST"])
@ cross_origin()
def authenticate_user():
    data: dict = request.get_json()
    if data == None or type(data) != dict:
        return prep_response("ERROR", body="Invalid data sent with request!")

    username = data.get("username", None)
    password = data.get("password", None)

    if username == None:
        return prep_response("ERROR", body="Username not present in request body!")
    if password == None:
        return prep_response("ERROR", body="Password not present in request body!")

    user = get_user_by_username(username)

    if user == None:
        return prep_response("ERROR", body="User does not exist")

    if compare_passwords(hash_password(password, user.salt)[0], user.hashed_password):
        jwt = create_jwt(username, 900)
        if send_jwt_mail(username, user.email, jwt, request.remote_addr):
            return prep_response("SUCCESSFUL", body="Your access token has been mailed to you!")
        else:
            return prep_response("ERROR", body="Could not mail the access token. Please try again later!")
    else:
        send_failed_login_email(username, user.email, request.remote_addr)
        return prep_response("ERROR", body="Incorrect credentials!")


@ app.route("/auth/verify/", methods=["POST"])
@ cross_origin()
def verify_token_api():
    data = request.get_json()
    if data == None or type(data) != dict:
        return prep_response("ERROR", body="Invalid data sent with request!")

    token = data.get("token", None)

    if token == None:
        return prep_response("ERROR", body="Token not present in request body!")

    try:
        jwt_decode(token, app.secret_key)
        return prep_response("SUCCESSFUL")
    except ExpiredSignatureError:
        return prep_response("ERROR", body="Expired token")
    except:
        # Try to decode and get the username to send a warning email
        try:
            username: str = jwt_decode(
                token, app.secret_key, False).get("username", None)
        except:
            return prep_response("ERROR", body="Invalid token!")

        if username == None:
            # Do something like ban the request source
            return prep_response("ERROR", body="Invalid token!")

        user: User = get_user_by_username(username)
        send_failed_login_email(username, user.email, request.remote_addr)
        return prep_response("ERROR", body="Invalid token!")


############### Managing credentials of Users ###############

@ app.route("/credentials/", methods=["POST"])
@ cross_origin()
def manage_credentials():
    user_token: str = request.headers.get("Authorization", None)

    if user_token == None:
        return prep_response("ERROR", body="No authorization token provided")

    if len(user_token) < 9:
        return prep_response("ERROR", body="Invalid authorization token provided!")

    if user_token[0: 3].upper() != "JWT":
        return prep_response("ERROR", body="Invalid type of authorization token provided!")

    user_token = user_token[4:]  # Get the actual token after 'JWT '

    user_token_info = decode_jwt_with_info(user_token)

    # TODO: Notify the user by mailing them of a failed login attempt
    if user_token_info.get("authentic", False) == False:
        return prep_response("ERROR", body="Non-verified JWT!")

    if user_token_info.get("expired", True) == True:
        return prep_response("ERROR", body="Expired JWT!")

    if user_token_info.get("data", None) == None:
        return prep_response("ERROR", body="Invalid JWT!")

    real_username = user_token_info["data"].get("username", None)
    if real_username == None:
        return prep_response("ERROR", body="Invalid JWT!")

    user: User = get_user_by_username(real_username)

    if request.method == "POST":
        credential_data = request.get_json()

        title = credential_data.get("title", None)
        username = credential_data.get("username", None)
        email = credential_data.get("email", None)
        password = credential_data.get("password", None)

        # Make sure all of the necessary data is present
        if title == None:
            prep_response(
                "ERROR", body="Title not present in request body!")
        if username == None:
            prep_response(
                "ERROR", body="Username not present in request body!")
        if email == None:
            prep_response(
                "ERROR", body="Email not present in request body!")
        if password == None:
            prep_response(
                "ERROR", body="Password not present in request body!")

        # TODO: Later validate all the data
        salt = generate_salt()
        user_credentials_table = get_user_credentials_table(real_username)

        new_credential = user_credentials_table(
            encrypt_str_to_bytes(user.hashed_password, title, salt),
            encrypt_str_to_bytes(user.hashed_password, username, salt),
            encrypt_str_to_bytes(user.hashed_password, email, salt),
            encrypt_str_to_bytes(user.hashed_password, password, salt),
            salt
        )

        db.session.add(new_credential)
        db.session.commit()
        return prep_response("SUCCESSFUL", body="Credential successfully added!")

    pass


if __name__ == "__main__":
    with app.test_request_context():
        db.create_all()
    app.run(host="::", debug=True)
