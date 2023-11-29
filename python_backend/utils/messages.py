from .types import ClientInfos, Proposal, Message

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
    entry_value = total_debit * best_entry
    installment_value = (total_debit - entry_value) / installments

    message = Message(role="assistant", text=f"Olá, <b>{infos.name}</b>! Você tem uma pendência totalizando um valor de <b>{total_debit:,.2f}</b>. Nossa proposta é para você pagar <b>{confirm_message}</b>. O que acha?")

    deny_text = 'Recusar proposta'
    confirm_text = f'Pagar {confirm_message}'
    return Proposal(entry=best_entry, installment_value=installment_value,
                    installments=installments, confirm_text=confirm_text,
                    message=message, deny_text=deny_text)

def second_proposal(infos: ClientInfos):
    total_debit = infos.total_debit
    negotiation_rules = get_negotiation_rules()
    current_entry = negotiation_rules['piorEntrada']
    installments = negotiation_rules['melhorParcela']
    current_installment = negotiation_rules['piorParcela']

    entry_value = total_debit * current_entry
    installment_value = (total_debit - entry_value) / current_installment

    confirm_message = ""
    if installments != current_installment:
        current_entry = 0
        current_installment = installments + 1
        installment_value = total_debit / current_installment
    confirm_message = format_proposal(total_debit, current_entry,
                                      current_installment)

    deny_text = 'Recusar proposta'
    confirm_text = f'Pagar {confirm_message}'
    message = Message(role="assistant", text=f"Uma alternativa seria <b>{confirm_message}</b>. Essa opção lhe atende melhor?")
    return Proposal(entry=current_entry, installment_value=installment_value,
                    installments=current_installment, deny_text=deny_text,
                    confirm_text=confirm_text, message=message)

def third_proposal(infos: ClientInfos):
    total_debit = infos.total_debit
    negotiation_rules = get_negotiation_rules()
    current_entry = negotiation_rules['piorEntrada']
    installments = negotiation_rules['melhorParcela']
    current_installment = negotiation_rules['piorParcela']

    message = "Vamos tentar chegar a um acordo: Informe abaixo um <b>valor de entrada</b> e a <b>quantidade de parcelas</b> que seriam ideais para você. E, se puder, <b>justifique sua proposta</b>."

    confirm_message = format_proposal(total_debit, current_entry,
                                      current_installment)
    entry_value = total_debit * current_entry
    installment_value = (total_debit - entry_value) / current_installment

    deny_text = 'Recusar proposta'
    confirm_text = f'Pagar {confirm_message}'
    message = Message(role="assistant", text=f"Uma alternativa seria <b>{confirm_message}</b>. Essa opção lhe atende melhor?")
    return Proposal(entry=current_entry, installment_value=installment_value,
                    installments=current_installment, deny_text=deny_text,
                    confirm_text=confirm_text, message=message)
