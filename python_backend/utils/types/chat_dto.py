from pydantic import BaseModel

class ClientInfos(BaseModel):
    name: str
    user_id: int
    total_debit: float

class Message(BaseModel):
    role: str
    text: str

class ThreadInfos(BaseModel):
    client: ClientInfos
    messages: list[Message]

class Proposal(BaseModel):
    message: Message
    entry: float
    installments: int
    installment_value: float
    is_finished: bool = False
    confirm_text: str
    deny_text: str
