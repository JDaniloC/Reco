from .types import ClientInfos, Proposal, Message, UserProposal, Answer

DENY_TEXT = 'Recusar proposta'

def format_proposal(total_value: float, entry: float, installment: int):
    new_value = total_value * entry
    proposal_string = ""
    if entry > 0:
        proposal_string = f"{new_value:,.2f} de entrada"
        if installment > 0:
            proposal_string += " e "
    elif installment > 1:
        proposal_string = "em "

    if installment == 1:
        proposal_string += "à vista"
    elif installment > 1:
        proposal_string += f"{installment} vezes"
        installment_value = (total_value - new_value) / installment
        proposal_string += f" de {installment_value:,.2f}"

    return proposal_string

def get_negotiation_rules():
    return {
        'melhorEntrada': 0.1,
        'melhorParcela': 3,
        'piorEntrada': 0,
        'piorParcela': 6,
    }

def first_proposal(infos: ClientInfos):
    total_debit = infos.total_debit
    negotiation_rules = get_negotiation_rules()
    best_entry = negotiation_rules['melhorEntrada']
    installments = negotiation_rules['melhorParcela']
    confirm_message = format_proposal(total_debit, best_entry,
                                      installments)

    message = Message(role="assistant", text=f"Olá, <b>{infos.name}</b>! Você tem uma pendência totalizando um valor de <b>{total_debit:,.2f}</b>. Nossa proposta é para você pagar <b>{confirm_message}</b>. O que acha?")

    confirm_text = f'Pagar {confirm_message}'
    return Proposal(
        installments=installments,
        entry=best_entry,
        message=message,
    ), Answer(
        confirm_text=confirm_text,
        deny_text=DENY_TEXT,
        message=message,
    )

def second_proposal(infos: ClientInfos):
    total_debit = infos.total_debit
    negotiation_rules = get_negotiation_rules()
    current_entry = negotiation_rules['piorEntrada']
    installments = negotiation_rules['melhorParcela']
    current_installment = negotiation_rules['piorParcela']

    confirm_message = ""
    if installments != current_installment:
        current_entry = 0
        current_installment = installments + 1
    confirm_message = format_proposal(total_debit, current_entry,
                                      current_installment)

    confirm_text = f'Pagar {confirm_message}'
    message = Message(role="assistant", text=f"Uma alternativa seria <b>{confirm_message}</b>. Essa opção lhe atende melhor?")
    return Proposal(
        installments=current_installment,
        entry=current_entry,
        message=message
    ), Answer(
        confirm_text=confirm_text,
        deny_text=DENY_TEXT,
        message=message,
    )

def third_proposal():
    message = Message(role="assistant", text="Vamos tentar chegar a um acordo: Informe abaixo um <b>valor de entrada</b> e a <b>quantidade de parcelas</b> que seriam ideais para você. E, se puder, <b>justifique sua proposta</b>.")
    return Proposal(message=message), Answer(require_input=True, message=message)

def evaluate_proposal(value: float, installments: int, message_txt: str):
    rules = get_negotiation_rules()
    user_message = Message(role="user", text=message_txt)

    if installments > rules["piorParcela"]:
        message = Message(
            role="assistant",
            text="Infelizmente, não vamos conseguir chegar a um acordo. Agradecemos o contato, aguarde a nossa equipe entrar em contato."
        )
        return Proposal(
            installments=installments,
            message=user_message,
            entry=value
        ), Answer(
            is_finished=True, 
            message=message,
        )

    message = Message(
        role="assistant",
        text="Sua proposta foi enviada para análise. Aguarde um momento."
    )
    return Proposal(
        installments=installments,
        message=user_message,
        accepted=True,
        entry=value,
    ), Answer(
        is_finished=True, 
        message=message,
    )

def get_proposal_answer_idx(messages_count: int, client: ClientInfos):
    proposals = [
        first_proposal(client),
        second_proposal(client),
        third_proposal()
    ]
    if messages_count > 3:
        return proposals, 2
    elif messages_count > 1:
        return proposals, 1
    return proposals, 0
