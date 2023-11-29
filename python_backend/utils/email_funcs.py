from .config import (EMAIL_TITLE, LOGO_IMAGE_PATH,
                     EMAIL_ADDRESS, EMAIL_PASSWORD)
from jinja2 import Environment, FileSystemLoader, select_autoescape

from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from email.mime.text import MIMEText
from traceback import format_exc
import smtplib

def prepare_content(sender_email: str, receiver_email: str,
                    content: str, image_path: str) -> str:
    message = MIMEMultipart()
    message["Subject"] = EMAIL_TITLE
    message["From"] = sender_email
    message["To"] = receiver_email

    message.attach(MIMEText(content, "html"))

    with open(image_path, 'rb') as fp:
        image = MIMEImage(fp.read())
        image.add_header('Content-ID', '<logo>')
        message.attach(image)

    return message.as_string()

def send_email(sender_email: str, sender_password: str,
               receiver_email:str, content: str) -> bool:
    status = True
    try:
        session = smtplib.SMTP('smtp.gmail.com', 587)
        session.starttls()

        session.login(sender_email, sender_password)
        session.sendmail(sender_email, receiver_email, content)
    except:
        print(format_exc())
        status = False
    finally:
        session.quit()
    return status

def send_email_notification(receiver_email: str,
                            cpf_devedor: str,
                            debtor_name: str) -> bool:
    """
    Verify if the email address and password are set in the environment
    variables. If so, prepare the email html/content and send the email
    to return True. Otherwise, return False.
    """
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD: return False

    env = Environment(
        loader=FileSystemLoader("templates"),
        autoescape=select_autoescape()
    )
    template = env.get_template("email.html")
    content = template.render(cpf_devedor=cpf_devedor,
                              nome_devedor=debtor_name)

    content_text = prepare_content(EMAIL_ADDRESS, receiver_email,
                                   content, LOGO_IMAGE_PATH)
    return send_email(EMAIL_ADDRESS, EMAIL_PASSWORD,
                      receiver_email, content_text)
