from dotenv import load_dotenv
import os

load_dotenv()

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
SERVER_URL = os.environ["SERVER_URL"]
SITE_URL = os.environ["SITE_URL"]

PORT = 8443
WEBHOOK_URL = os.environ["WEBHOOK_URL"]
SECRET = os.environ.get("SECRET", "secret")