def get_contact(contact_obj):
    """
    Returns a dict with contact info for frontend.
    If contact_obj is None, returns None.
    """
    if not contact_obj:
        return None

    return {
        "id": contact_obj.id,
        "name": contact_obj.name,
        "phone": contact_obj.phone,
    }
