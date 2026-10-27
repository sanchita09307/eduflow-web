import os
import sys
from slowapi import Limiter
from slowapi.util import get_remote_address

# Automatically disable rate limiting during test executions
is_test = "pytest" in sys.modules or os.environ.get("TESTING", "").lower() in ["1", "true"]

limiter = Limiter(
    key_func=get_remote_address,
    enabled=not is_test
)
