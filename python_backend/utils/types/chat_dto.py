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
    accepted: bool = False

class Answer(BaseModel):
    require_input: bool = False
    is_finished: bool = False
    message: Message | None
    confirm_text: str = ""
    deny_text: str = ""

class ProposalResponse(BaseModel):
    proposal: Proposal | None = None
    answer: Answer

class Messages(BaseModel):
    messages: list[Proposal]
    answer: Answer

class ThreadInfos(BaseModel):
    client: ClientInfos

class UserProposal(BaseModel):
    user_id: int
    message: str
    value: float
    installments: int
