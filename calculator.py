"""
Courier Cost Calculation Engine
Engineered for AMAN GRAPHICS AND DESIGNS LTD.
Supports tiered weight rates, volumetric / dimensional weight, fuel surcharges,
handling / doc fees, Origin / Destination route awareness, and dual-currency (USD & BDT).
"""

import math
from typing import Dict, Any, Optional, List


def calculate_volumetric_weight(length_cm: float, width_cm: float, height_cm: float, divisor: float = 5000.0) -> float:
    """
    Standard IATA volumetric weight formula: (L x W x H in cm) / 5000
    """
    if length_cm <= 0 or width_cm <= 0 or height_cm <= 0:
        return 0.0
    return round((length_cm * width_cm * height_cm) / divisor, 2)


def calculate_courier_quote(
    courier_code: str,
    courier_data: Dict[str, Any],
    weight_kg: float,
    exchange_rate: float = 123.83,
    apply_fuel: bool = True,
    override_handling_fee: Optional[float] = None,
    volumetric_weight: float = 0.0,
    origin: str = "Dhaka, Bangladesh",
    destination: str = "China (Guangzhou / Shanghai / HK)",
    zone_name: str = "China & Hong Kong (Far East)",
    buyer_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculates detailed quote for a specific courier given chargeable weight and route.
    """
    chargeable_weight = max(weight_kg, volumetric_weight)
    chargeable_weight = max(chargeable_weight, 0.1)  # at least 0.1 kg

    rates = courier_data.get("rates", {})
    first_half = float(rates.get("first_half", 0.0))
    second_half = float(rates.get("second_half", 0.0))
    tier_11_20 = float(rates.get("tier_11_20", 0.0))
    tier_21_50 = float(rates.get("tier_21_50", 0.0))
    tier_51_100 = float(rates.get("tier_51_100", 0.0))
    tier_above_100 = float(rates.get("tier_above_100", 0.0))

    tier_name = ""
    rate_applied = 0.0
    base_freight = 0.0

    if chargeable_weight <= 0.5:
        tier_name = "1st Half (≤ 0.50 Kg)"
        rate_applied = first_half
        base_freight = first_half
    elif chargeable_weight <= 1.0:
        tier_name = "2nd Half (0.51 - 1.00 Kg)"
        rate_applied = second_half
        base_freight = first_half + second_half
    elif chargeable_weight <= 10.0:
        additional_steps = math.ceil((chargeable_weight - 0.5) / 0.5)
        tier_name = f"Sample / Small Tier (≤ 10 Kg) [1st 0.5kg + {additional_steps} × 0.5kg]"
        rate_applied = second_half
        base_freight = first_half + (additional_steps * second_half)
    elif chargeable_weight <= 20.0:
        tier_name = "11 Kg - 20 Kg Tier (Flat per Kg)"
        rate_applied = tier_11_20
        base_freight = chargeable_weight * tier_11_20
    elif chargeable_weight <= 50.0:
        tier_name = "21 Kg - 50 Kg Tier (Flat per Kg)"
        rate_applied = tier_21_50
        base_freight = chargeable_weight * tier_21_50
    elif chargeable_weight <= 100.0:
        tier_name = "51 Kg - 100 Kg Tier (Flat per Kg)"
        rate_applied = tier_51_100
        base_freight = chargeable_weight * tier_51_100
    else:
        tier_name = "Above 100 Kg Bulk Tier (Flat per Kg)"
        rate_applied = tier_above_100
        base_freight = chargeable_weight * tier_above_100

    # Fuel surcharge calculation
    fuel_pct = float(courier_data.get("fuel_surcharge_percent", 0.0)) if apply_fuel else 0.0
    fuel_surcharge = base_freight * (fuel_pct / 100.0)

    # Handling fee / Doc fee
    handling_fee = float(override_handling_fee) if override_handling_fee is not None else float(courier_data.get("handling_fee", 10.0))

    total_usd = base_freight + fuel_surcharge + handling_fee
    total_bdt = total_usd * exchange_rate

    per_kg_usd = total_usd / chargeable_weight
    per_kg_bdt = total_bdt / chargeable_weight

    return {
        "company_name": "AMAN GRAPHICS AND DESIGNS LTD.",
        "courier_code": courier_code,
        "courier_name": courier_data.get("name", courier_code),
        "color": courier_data.get("color", "#4f46e5"),
        "origin": origin,
        "destination": destination,
        "buyer_name": buyer_name,
        "zone_name": zone_name,
        "actual_weight_kg": round(weight_kg, 2),
        "volumetric_weight_kg": round(volumetric_weight, 2),
        "chargeable_weight_kg": round(chargeable_weight, 2),
        "tier_name": tier_name,
        "rate_applied": round(rate_applied, 2),
        "base_freight_usd": round(base_freight, 2),
        "fuel_surcharge_percent": fuel_pct,
        "fuel_surcharge_usd": round(fuel_surcharge, 2),
        "handling_fee_usd": round(handling_fee, 2),
        "total_required_usd": round(total_usd, 2),
        "total_required_bdt": round(total_bdt, 2),
        "per_kg_usd_for_wo": round(per_kg_usd, 2),
        "per_kg_bdt_for_wo": round(per_kg_bdt, 2),
        "transit_days": courier_data.get("transit_days", "3-5 Days"),
        "notes": courier_data.get("notes", "")
    }


def compare_all_couriers(
    couriers: Dict[str, Any],
    weight_kg: float,
    exchange_rate: float = 123.83,
    apply_fuel: bool = True,
    override_handling_fee: Optional[float] = None,
    volumetric_weight: float = 0.0,
    origin: str = "Dhaka, Bangladesh",
    destination: str = "China (Guangzhou / Shanghai / HK)",
    zone_name: str = "China & Hong Kong (Far East)",
    buyer_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Computes quotes for all active couriers in the given route/zone and sorts by total price.
    """
    quotes = []
    for code, data in couriers.items():
        rates = data.get("rates", {})
        if not any(rates.values()):
            continue
        quote = calculate_courier_quote(
            courier_code=code,
            courier_data=data,
            weight_kg=weight_kg,
            exchange_rate=exchange_rate,
            apply_fuel=apply_fuel,
            override_handling_fee=override_handling_fee,
            volumetric_weight=volumetric_weight,
            origin=origin,
            destination=destination,
            zone_name=zone_name,
            buyer_name=buyer_name
        )
        quotes.append(quote)

    quotes.sort(key=lambda x: x["total_required_usd"])

    if quotes:
        lowest_price = quotes[0]["total_required_usd"]
        for idx, q in enumerate(quotes):
            q["is_cheapest"] = (idx == 0)
            q["difference_from_cheapest_usd"] = round(q["total_required_usd"] - lowest_price, 2)
            q["rank"] = idx + 1

    return quotes
