from utils import (ClientInfos, ThreadInfos, Proposal, Message,
                   first_proposal, second_proposal, third_proposal,
                   chat_manager)
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.post("/v1/")
def route_add_chat(client: ClientInfos) -> ThreadInfos:
    """
    Create a thread (conversation) for a client:

    - **client** ClientInfos: Client information

    Returns ThreadInfos: Thread information.
    """
    thread = chat_manager.get_thread(client.user_id)
    if thread is not None: return thread

    proposal = first_proposal(client)
    thread_info = ThreadInfos(client=client,
                              messages=[proposal])
    chat_manager.add_thread(client.user_id, thread_info)
    return thread_info

@router.get("/v1/")
def route_chat(user_id: int, message: str) -> Proposal:
    """
    Send a message to a thread:

    Args:
    - **user_id** int: Client ID.
    - **message** str: Message to send.

    Returns Proposal: Message response.
    """
    thread = chat_manager.get_thread(user_id)
    if thread is None:
        error_message = "Client Thread not found."
        raise HTTPException(status_code=404, detail=error_message)

    message_data = Message(text=message, role="user")
    CONFIRM_MSG = "Obrigado por negociar conosco!"
    prev_proposal = first_proposal(thread.client)
    finished_chat, proposal = False, prev_proposal
    if len(thread.messages) == 1:
        proposal = second_proposal(thread.client)
    elif len(thread.messages) == 3:
        prev_proposal = second_proposal(thread.client)
        proposal = third_proposal(thread.client)
    else:
        prev_proposal.confirm_text = message

    if prev_proposal.confirm_text == message:
        prev_proposal.message.text = CONFIRM_MSG
        prev_proposal.confirm_text = ""
        prev_proposal.deny_text = ""
        proposal = prev_proposal
        finished_chat = True

    thread.messages.append(Proposal(message=message_data))
    thread.messages.append(proposal)
    proposal.is_finished = finished_chat

    return proposal
