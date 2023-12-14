from pydantic import BaseModel

class Message(BaseModel):
    role: str
    text: str

class ClientInfos(BaseModel):
    name: str
    user_id: int
    total_debit: float
    old_messages: list[Message] | None

class Proposal(BaseModel):
    message: Message
    entry: float = 0
    installments: int = 0
    installment_value: float = 0
    is_finished: bool = False
    confirm_text: str = ""
    deny_text: str = ""

class ThreadInfos(BaseModel):
    client: ClientInfos
    messages: list[Proposal]
