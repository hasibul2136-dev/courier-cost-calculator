"""
Exchange Rate Service
Fetches and caches real-time USD/BDT and other currency exchange rates.
Provides offline fallback and manual custom rate overrides.
"""

import time
import json
import urllib.request
from typing import Dict, Any, Optional

FALLBACK_RATE = 123.83
CACHE_TTL_SECONDS = 3600  # 1 hour cache

_cached_rate: Optional[float] = None
_last_fetch_time: float = 0.0
_manual_override_rate: Optional[float] = None


def get_usd_bdt_rate(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Returns the current USD to BDT exchange rate.
    Uses cached live rate, falls back to fallback value if network fails.
    """
    global _cached_rate, _last_fetch_time

    if _manual_override_rate is not None:
        return {
            "rate": _manual_override_rate,
            "source": "Manual Override",
            "is_manual": True,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    now = time.time()
    if not force_refresh and _cached_rate is not None and (now - _last_fetch_time < CACHE_TTL_SECONDS):
        return {
            "rate": _cached_rate,
            "source": "Cached Live Rate",
            "is_manual": False,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(_last_fetch_time))
        }

    # Attempt fetching from open API
    endpoints = [
        "https://open.er-api.com/v6/latest/USD",
        "https://api.exchangerate-api.com/v4/latest/USD"
    ]

    for url in endpoints:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Aman-Courier-Calculator/1.0"})
            with urllib.request.urlopen(req, timeout=4) as response:
                if response.status == 200:
                    payload = json.loads(response.read().decode("utf-8"))
                    rates = payload.get("rates", {})
                    bdt = rates.get("BDT")
                    if bdt and isinstance(bdt, (int, float)) and bdt > 0:
                        _cached_rate = round(float(bdt), 2)
                        _last_fetch_time = now
                        return {
                            "rate": _cached_rate,
                            "source": "Live Market API",
                            "is_manual": False,
                            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                        }
        except Exception:
            continue

    # If all fail, use cached or fallback
    rate = _cached_rate if _cached_rate is not None else FALLBACK_RATE
    return {
        "rate": rate,
        "source": "Default Baseline" if _cached_rate is None else "Cached Live Rate",
        "is_manual": False,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }


def set_manual_exchange_rate(rate: Optional[float]):
    """
    Sets or clears the manual exchange rate override.
    """
    global _manual_override_rate
    if rate is None or rate <= 0:
        _manual_override_rate = None
    else:
        _manual_override_rate = round(float(rate), 2)
