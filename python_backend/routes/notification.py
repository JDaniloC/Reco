from utils import (Session, Notification, websocket_manager,
                   send_email_notification)
import socketio

sio = socketio.AsyncServer(async_mode='asgi',
                           cors_allowed_origins=[])
socket_app = socketio.ASGIApp(sio)

@sio.event
def connect(sid: str, environ: dict):
    raise ConnectionRefusedError('authentication failed')

@sio.event
async def connect(sid: str, environ: dict, auth: Session):
    if auth:
        session = Session(sid=sid, email=auth["email"])
        await sio.save_session(sid, session)

        for message in websocket_manager.connect(session):
            message = message.model_dump()
            await sio.emit('notification', message, to=sid)

@sio.on('notificate')
async def notification_handler(sid: str, data: Notification):
    notification = Notification(**data)
    receiver = websocket_manager.add_notification(notification)
    if receiver is not None:
        await sio.emit('notification', data, to=receiver.sid)

    if notification.type == "Sucesso":
        email = notification.email
        cpf = notification.tenantCpf
        name = notification.tenantName
        send_email_notification(email, cpf, name)

@sio.on('remove-notification')
async def remove_notification_handler(sid: str, identifier: str):
    session: Session = await sio.get_session(sid)
    if session:
        websocket_manager.remove_notification(session.email, identifier)

@sio.event
async def disconnect(sid: str):
    session: Session = await sio.get_session(sid)
    if session: websocket_manager.disconnect(session)
