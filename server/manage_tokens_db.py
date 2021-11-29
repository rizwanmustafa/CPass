from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from utility import gen_rand_str
from utility import prep_server_response, SERVER_RESPONSE_TYPE

db: SQLAlchemy = None


def init(database: SQLAlchemy):
    global db
    db = database


def generate_token(user_token_table, user, ip_address: str, send_mail):
    if db == None:
        print("Please set the variable 'db' first by initializing!")
        return

    # Keep generating tokens as long as it is not unique
    gen_token = gen_rand_str(8)
    while user_token_table.query.filter_by(token=gen_token).all() != []:
        print(user_token_table.query.filter_by(token=gen_token).all())
        gen_token = gen_rand_str(8)

    activation_code = gen_rand_str(8)
    expiry_time = datetime.now() + timedelta(minutes=15)
    token_item = user_token_table(
        gen_token, False, activation_code, expiry_time)

    username = user.username
    email = user.email

    sentMail = send_mail(
        "Verify Login!", f"Hi {username},\n\nPlease input the following code to verify your login: {activation_code}\n\nIP Address of login attempt: {ip_address}\n\nIf this wasn't you, we recommend you to change your password immediately!", [email])

    if sentMail:    # Add the token to the database if email was successfully sent!
        db.session.add(token_item)
        db.session.commit()

    return gen_token if sentMail else ""


def activate_token(user_token_table, token: str, activation_code: str):
    if db == None:
        print("Please set the variable 'db' first by initializing!")
        return

    userToken = user_token_table.query.filter_by(
        token=token).all()

    # If the token does not exist or is already activated, send an error
    if not userToken or userToken[0].activated or userToken[0].expiry_date <= datetime.now():
        return prep_server_response(SERVER_RESPONSE_TYPE['ERROR'], body="Bad Request!")

    userToken = userToken[0]

    if userToken.activation_code != activation_code:
        return prep_server_response(SERVER_RESPONSE_TYPE['ERROR'], body="Wrong Activation Code!")

    else:
        userToken.activated = True
        db.session.commit()
        return get_token_status(userToken)


def get_token_status(userToken):
    return prep_server_response(SERVER_RESPONSE_TYPE['SUCCESSFUL'], data={
        'activated': userToken.activated,
        'expired': userToken.expiry_date <= datetime.now()
    })
