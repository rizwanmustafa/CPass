from flask_mail import Mail, Message
from decouple import config as GetEnvVar

from typing import List

mail = Mail()


def send_mail(subject: str, body: str, recipients: List[str]) -> bool:
    try:
        msg = Message(subject, recipients, body,
                      sender=GetEnvVar('MAIL_USERNAME'))
        mail.send(msg)
        return True  # Mail was successfully sent
    except Exception as e:
        print("Following error was occurred while sending an email!")
        print(e)
        return False  # Mail was not successfully sent


def send_verification_email(username: str, url: str, recipient: str):
    url = GetEnvVar("PUBLIC_WEBSITE_URL") + \
        f"/action?username={username}&url={url}"
    email_body = f"Hi {username},\n\nPlease click the following link to verify your account:\n\n{url}\n\nThanks,\n\nCloud Password Manager"
    return send_mail("Confirm your account", email_body, [recipient])
