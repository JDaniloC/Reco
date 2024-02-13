from utils.types import ThreadInfos, Message
import threading, time

class ChatManager:
    def __init__(self):
        self.THREAD_TIMEOUT = 60 * 60 * 24
        self.thread_timeouts: dict[str, int] = dict()
        self.active_threads: dict[str, ThreadInfos] = dict()
        threading.Thread(target=self.__clean_threads,
                         daemon=True).start()

    def add_thread(self, user_email: str, thread: ThreadInfos):
        print(f"Client {user_email} created a thread")
        new_timeout = int(time.time()) + self.THREAD_TIMEOUT
        self.thread_timeouts[user_email] = new_timeout
        self.active_threads[user_email] = thread

    def update_messages(self, user_id: str, messages: list[Message]):
        thread = self.active_threads.get(str(user_id))
        if thread is None: return

        thread.client.old_messages = messages

    def remove_thread(self, user_email: str):
        self.active_threads.pop(user_email, None)
        self.thread_timeouts.pop(user_email, None)

    def get_thread(self, user_id: int) -> ThreadInfos | None:
        new_timeout = int(time.time()) + self.THREAD_TIMEOUT
        thread = self.active_threads.get(user_id)
        if thread is None: return None

        self.thread_timeouts[user_id] = new_timeout
        return thread

    def __clean_threads(self):
        while True:
            timeout_items = self.thread_timeouts.items()
            for user_id, timeout in timeout_items:
                if timeout < int(time.time()):
                    print(f"Thread {user_id} timed out.")
                    self.remove_thread(user_id)
            time.sleep(60 * 60)
