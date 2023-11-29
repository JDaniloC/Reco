from pydantic import BaseModel

class Session(BaseModel):
    sid: str
    email: str

class Notification(BaseModel):
    type: str
    email: str
    message: str
    tenantCpf: str
    identifier: str
    tenantName: str
    condominiumName: str
