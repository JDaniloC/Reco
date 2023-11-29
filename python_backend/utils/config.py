import os, dotenv

dotenv.load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

EMAIL_TITLE = "Reco AI - Notificação de atividade"
LOGO_IMAGE_PATH = "./templates/reco.png"
