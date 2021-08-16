from Utility import HashPassword, ValidateUserData
from json import dumps as dumpJSON

from flask import Flask, request
from flask_cors import CORS, cross_origin

from decouple import config as GetEnvVar

from models import db, User

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
)

cors = CORS(app)
db.init_app(app)


@app.route("/users/", methods=["POST"])
@cross_origin()
def manage_users():
    if request.method == "POST":
        # Get user data
        userData = request.get_json()

        # Check if user data is valid
        userDataValid = ValidateUserData(
            userData['username'],
            userData['email'],
            userData['password']
        )

        if userDataValid != "":  # Since the data is not valid, send the appropriate correction measure
            return dumpJSON(userDataValid)

        # Make sure the username or email does not already exist in the database
        usernameExists = User.query.filter_by(
            username=userData['username']).first()

        if usernameExists:
            return dumpJSON("Username is already taken!")

        emailExists = User.query.filter_by(email=userData['email']).first()
        if emailExists:
            return dumpJSON("Email is already taken!")

        # Hash the passoord and get the salt used
        hashedPassword, salt = HashPassword(userData['password'])

        # Create a user object
        myUser = User(
            userData['username'],
            userData['email'],
            hashedPassword,
            salt,
            False,
            False
        )

        # Add the user object to the database and commit the changes
        db.session.add(myUser)
        db.session.commit()

        # Later send them an email with a link to verify their account

        return dumpJSON("User created!")
    pass


if __name__ == "__main__":
    with app.test_request_context():
        db.create_all()
    app.run(debug=True)
