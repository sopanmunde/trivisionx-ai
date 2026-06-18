from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize the global Limiter singleton using remote address (IP) as the limiting key
limiter = Limiter(key_func=get_remote_address)
