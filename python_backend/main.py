from email_utils import send_email_notification
from pydantic import BaseModel
from dotenv import load_dotenv
import socketio
import os

env_config = load_dotenv(".env")

class Session(BaseModel):
    email: str

class Notification(BaseModel):
    type: str
    email: str
    message: str
    tenantCpf: str
    tenantName: str
    identifier: str
    condominiumName: str

sio = socketio.AsyncServer(async_mode='asgi',
                           cors_allowed_origins=[])
app = socketio.ASGIApp(sio)

connections: dict[str, str] = dict()
messages_queue: dict[str, Notification] = dict()

def notificate_email(receiver_email: str, cpf_devedor: str,
                     debtor_name: str) -> bool:
    address_key = "EMAIL_ADDRESS"
    pass_key = "EMAIL_PASSWORD"
    email_address = os.getenv(address_key) or os.environ.get(address_key)
    email_password = os.getenv(pass_key) or os.environ.get(pass_key)

    if email_address and email_password:
        return send_email_notification(email_address, email_password,
                            receiver_email, cpf_devedor, debtor_name)
    return False

@sio.event
def connect(sid: str, environ: dict):
    raise ConnectionRefusedError('authentication failed')

@sio.event
async def connect(sid: str, environ: dict, auth: Session):
    if auth:
        session = Session(email=auth["email"])
        await sio.save_session(sid, session)
        connections[session.email] = sid

        if session.email in messages_queue:
            for message in messages_queue[session.email]:
                await sio.emit('notification', message, to=sid)
            del messages_queue[session.email]

@sio.on('notificate')
async def notification_handler(sid: str, data: Notification):
    validated_data = Notification(**data)
    receiver_email = validated_data.email
    if receiver_email in connections:
        del data["email"]
        user_sid = connections[receiver_email]
        await sio.emit('notification', data, to=user_sid)
    elif receiver_email in messages_queue:
        messages_queue[receiver_email].append(data)
    else:
        messages_queue[receiver_email] = [data]

    if validated_data.type == "Sucesso":
        notificate_email(receiver_email, validated_data.tenantCpf,
                         validated_data.tenantName)

@sio.on('remove-notification')
async def remove_notification_handler(sid: str, identifier: str):
    session: Session = await sio.get_session(sid)
    if session:
        email = session.email
        messages_queue[email] = [n for n in messages_queue[email]
                                 if n.identifier != identifier]

@sio.event
async def disconnect(sid: str):
    print('disconnect ', sid)
    session: Session = await sio.get_session(sid)
    if session: connections.pop(session.email, None)
    
