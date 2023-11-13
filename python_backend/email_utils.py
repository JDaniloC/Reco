from jinja2 import Environment, FileSystemLoader, select_autoescape

from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from email.mime.text import MIMEText
from traceback import format_exc
import smtplib

EMAIL_TITLE = "Reco AI - Notificação de atividade"
LOGO_IMAGE_PATH = "./templates/reco.png"

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

def send_email_notification(sender_email: str, sender_password: str,
                            receiver_email: str, cpf_devedor: str,
                            debtor_name: str) -> bool:
    env = Environment(
        loader=FileSystemLoader("templates"),
        autoescape=select_autoescape()
    )
    template = env.get_template("email.html")
    content = template.render(cpf_devedor=cpf_devedor,
                              nome_devedor=debtor_name)

    content_text = prepare_content(sender_email, receiver_email,
                                   content, LOGO_IMAGE_PATH)
    return send_email(sender_email, sender_password,
                      receiver_email, content_text)
