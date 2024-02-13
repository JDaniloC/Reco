from .messages import get_proposal_answer_idx, evaluate_proposal
from .manager import ChatManager, WebsocketManager
from .email_funcs import send_email_notification
from .types import *

chat_manager = ChatManager()
websocket_manager = WebsocketManager()
