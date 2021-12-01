from flask_mail import Mail, Message
from decouple import config as GetEnvVar

from typing import List

mail = Mail()


def send_mail(subject: str, body: str, recipients: List[str], html=None) -> bool:
    try:
        msg = Message(subject,
                      recipients,
                      body,
                      html,
                      GetEnvVar('MAIL_USERNAME'))
        mail.send(msg)
        return True  # Mail was successfully sent
    except Exception as e:
        print("Following error was occurred while sending an email!")
        print(e)
        return False  # Mail was not successfully sent


def send_verification_email(username: str, url: str, email: str):
    url = GetEnvVar("PUBLIC_WEBSITE_URL") + \
        f"/action?username={username}&url={url}"
    email_body = f"Hi {username},\n\nPlease click the following link to verify your account:\n\n{url}\n\nThanks,\n\nCloud Password Manager"
    return send_mail("Confirm your account", email_body, [email])


def send_jwt_mail(username: str, email: str, token: str, ip_address: str):
    return send_mail(
        subject="Verify Login!",
        body="",
        recipients=[email],
        html=f"""
        <html><body>
            <p>Hi {username},</p>
            <p>Please input the following token to verify your login:</p>
            <p><b>{token}</b></p>
            <p>IP Address of login attempt:</p>
            <p><b>{ip_address}</b></p>
            <b>If this wasn't you, we recommend you to change your password immediately!</b>
        </body></html>"""
    )


def send_failed_login_email(username: str, email: str,  ip_address: str):
    send_mail(
        "Failed Login Attempt",
        f"Hi {username},\n\nThere has been a failed login attempt to your account!\n\nIP Address of Login Attempt: {ip_address}\n\nIf this was not you, we recommend you to make your account secure.", [email])
