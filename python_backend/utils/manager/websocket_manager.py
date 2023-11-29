from utils.types import Notification, Session

class WebsocketManager:
    def __init__(self):
        self.active_connections: dict[str, Session] = dict()
        self.messages: dict[str, list[Notification]] = dict()

    def connect(self, session: Session) -> list[Notification]:
        """
        Save the session and return the messages queue for the user.
        """
        print("Websocket Connecting", session.email)
        self.active_connections[session.email] = session
        if session.email not in self.messages:
            self.messages[session.email] = []
        return self.messages[session.email]

    def disconnect(self, session: Session):
        print("Websocket Disconnecting", session.email)
        self.active_connections.pop(session.email, None)

    def add_notification(self, notification: Notification) -> Session | None:
        """
        Store the notification in the messages queue and return the
        Session if the user is connected. Otherwise, return None.
        """
        email = notification.email
        if email not in self.messages:
            self.messages[email] = []
        self.messages[email].append(notification)

        if email in self.active_connections:
            return self.active_connections[email]

    def remove_notification(self, email: str, identifier: str):
        """
        Remove the notification from the messages queue.
        """
        if email in self.messages:
            self.messages[email] = [n for n in self.messages[email]
                                    if n.identifier != identifier]
