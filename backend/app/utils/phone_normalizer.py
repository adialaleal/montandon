import re

def normalize_phone(phone: str, default_country_code: str = "55") -> str:
    """
    Normalizes phone numbers to format: 5511999999999.
    Removes non-digit characters.
    Adds country code if missing.
    """
    if not phone:
        return ""
    
    # Remove everything except digits
    cleaned = re.sub(r'\D', '', phone)
    
    if not cleaned:
        return ""

    # Heuristic for Brazilian numbers
    # If it starts with 0, remove it
    if cleaned.startswith('0'):
        cleaned = cleaned[1:]
    
    # If length is 10 or 11 (e.g. 11999999999), assume it's BR and add 55
    if len(cleaned) in [10, 11]:
        cleaned = default_country_code + cleaned
    
    # If it's already 12 or 13, assume it has country code (e.g. 5511...)
    # This is a simplification, but sufficient for the specified scope.
    
    return cleaned
