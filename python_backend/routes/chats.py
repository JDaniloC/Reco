from utils import (ClientInfos, ThreadInfos, Proposal, Message, Messages,
                   ProposalResponse, UserProposal, chat_manager,
                   evaluate_proposal, get_proposal_answer_idx)
from fastapi import APIRouter, HTTPException

router = APIRouter()
LAST_MESSAGE = "Obrigado por negociar conosco!"

@router.post("/v1/")
def route_add_chat(client: ClientInfos) -> Messages:
    """
    Create a thread (conversation) for a client:

    - **client** ClientInfos: Client information

    Returns Messages: Messages list.
    """
    thread = chat_manager.get_thread(client.user_id)
    old_messages = client.old_messages
    if thread is not None:
        old_messages = thread.client.old_messages

    messages_count = len(old_messages)
    proposals, idx = get_proposal_answer_idx(
        messages_count, client
    )
    proposal, answer = proposals[idx]

    thread_info = ThreadInfos(client=client)
    chat_manager.add_thread(client.user_id, thread_info)

    messages: list[Proposal] = list()
    for message in old_messages:
        messages.append(Proposal(message=message))
    if len(old_messages) == 0: messages.append(proposal)

    chat_manager.update_messages(client.user_id, messages) 
    return Messages(messages=messages, answer=answer)

@router.get("/v1/")
def route_chat(user_id: int, message: str) -> ProposalResponse:
    """
    Send a message to a thread:

    Args:
    - **user_id** int: Client ID.
    - **message** str: Message to send.

    Returns ProposalResponse: Message response.
    """
    thread_info = chat_manager.get_thread(user_id)
    if thread_info is None:
        error_message = "Client Thread not found."
        raise HTTPException(status_code=404, detail=error_message)

    message_data = Message(text=message, role="user")
    messages_count = len(thread_info.client.old_messages)
    messages = thread_info.client.old_messages
    proposals, idx = get_proposal_answer_idx(
        messages_count, thread_info.client
    )
    prev_proposal, prev_answer = proposals[idx]
    if prev_answer.confirm_text == message:
        prev_answer.message.text = LAST_MESSAGE
        prev_answer.confirm_text = ""
        prev_answer.deny_text = ""
        prev_answer.is_finished = True
        chat_manager.remove_thread(user_id)
        return ProposalResponse(proposal=prev_proposal, answer=prev_answer)

    proposal, answer = proposals[min(idx + 1, len(proposals) - 1)]
    answer_message = Message(role="assistant", text=answer.message.text)
    messages.extend([message_data, answer_message])
    chat_manager.update_messages(user_id, messages)

    return ProposalResponse(
        answer=answer,
        proposal=proposal,
    )

@router.get("/v1/proposal/")
def route_input_chat(
    user_id: int, value: float, installments: int, message: str
) -> ProposalResponse:
    """
    Send a message to a thread:

    Args:
    - **user_id** int: Client ID.
    - **message** str: Message to send.
    - **value** float: Value of the proposal.
    - **installments** int: Number of installments.

    Returns ProposalResponse: Message response.
    """
    thread_info = chat_manager.get_thread(user_id)
    if thread_info is None:
        error_message = "Client Thread not found."
        raise HTTPException(status_code=404, detail=error_message)

    rep_proposal, rep_answer = evaluate_proposal(value, installments, message)
    chat_manager.remove_thread(user_id)

    return ProposalResponse(
        proposal=rep_proposal,
        answer=rep_answer,
    )