"""
Flask Web Application Backend for AMAN GRAPHICS AND DESIGNS LTD.
Courier Cost & Work Order Calculator
"""

import os
import io
import datetime
from flask import Flask, render_template, request, jsonify, send_file
from calculator import calculate_volumetric_weight, calculate_courier_quote, compare_all_couriers
from exchange_service import get_usd_bdt_rate, set_manual_exchange_rate
import rates_manager

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["SECRET_KEY"] = "aman-graphics-designs-courier-2026"


@app.route("/")
def index():
    """Serves the main calculator dashboard."""
    return render_template("index.html")


@app.route("/api/rates", methods=["GET"])
def get_rates():
    """Returns all courier rates, destination zones, settings, and live exchange info."""
    data = rates_manager.load_rates()
    exchange_info = get_usd_bdt_rate()
    data["settings"]["company_name"] = "AMAN GRAPHICS AND DESIGNS LTD."
    data["settings"]["live_exchange_rate"] = exchange_info["rate"]
    data["settings"]["exchange_source"] = exchange_info["source"]
    data["settings"]["exchange_timestamp"] = exchange_info["timestamp"]
    data["settings"]["is_manual_exchange"] = exchange_info.get("is_manual", False)
    return jsonify(data)


@app.route("/api/rates", methods=["POST"])
def update_rates():
    """Saves updated rates JSON from client."""
    new_data = request.get_json()
    if not new_data:
        return jsonify({"success": False, "error": "Invalid rates payload"}), 400

    try:
        rates_manager.save_rates(new_data)
        return jsonify({"success": True, "message": "Rates saved successfully!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/rates/zone/<zone_id>/courier", methods=["POST"])
def update_zone_courier(zone_id):
    """Updates a courier inside a specific destination zone."""
    payload = request.get_json()
    code = payload.get("code", "").strip().upper()
    courier_data = payload.get("data")
    if not code or not courier_data:
        return jsonify({"success": False, "error": "Missing code or data"}), 400

    rates_manager.update_zone_courier_rate(zone_id, code, courier_data)
    return jsonify({"success": True, "message": f"Courier {code} updated for zone {zone_id}!"})


@app.route("/api/exchange-rate", methods=["GET", "POST"])
def handle_exchange_rate():
    """GET live rate or POST custom manual override rate."""
    if request.method == "POST":
        payload = request.get_json() or {}
        manual_rate = payload.get("rate")
        set_manual_exchange_rate(manual_rate)
        return jsonify(get_usd_bdt_rate())
    else:
        force = request.args.get("refresh", "0") == "1"
        return jsonify(get_usd_bdt_rate(force_refresh=force))


@app.route("/api/calculate", methods=["POST"])
def calculate():
    """
    Main calculation endpoint with From & To location awareness.
    Accepts:
      - weight: float (Kg)
      - origin: str (e.g. 'Dhaka, Bangladesh')
      - destination: str (e.g. 'China (Guangzhou / Shanghai / HK)')
      - zone_id: str (e.g. 'china_hk', 'usa_canada', 'europe_uk')
      - courier: str ('ALL' or courier code like 'UPS')
      - length, width, height: float (optional, cm)
      - exchange_rate: float (optional)
      - apply_fuel: bool (default True)
      - handling_fee: float (optional)
    """
    payload = request.get_json() or {}
    weight_kg = float(payload.get("weight", 1.0))
    selected_courier = payload.get("courier", "ALL").strip()
    apply_fuel = bool(payload.get("apply_fuel", True))
    handling_fee = payload.get("handling_fee")
    handling_fee = float(handling_fee) if handling_fee is not None else None

    # Location parameters
    origin = payload.get("origin", "Dhaka, Bangladesh (Aman Graphics & Designs Ltd)").strip()
    destination = payload.get("destination", "China (Guangzhou / Shanghai / HK)").strip()
    zone_id = payload.get("zone_id", "china_hk").strip()
    buyer_name = payload.get("buyer_name")
    if buyer_name:
        buyer_name = buyer_name.strip()

    # Volumetric weight
    length = float(payload.get("length", 0.0) or 0.0)
    width = float(payload.get("width", 0.0) or 0.0)
    height = float(payload.get("height", 0.0) or 0.0)
    volumetric_kg = calculate_volumetric_weight(length, width, height)

    # Exchange rate
    ex_rate = payload.get("exchange_rate")
    if ex_rate:
        exchange_rate = float(ex_rate)
    else:
        exchange_rate = get_usd_bdt_rate().get("rate", 123.83)

    data = rates_manager.load_rates()
    zones = data.get("destination_zones", {})
    current_zone = zones.get(zone_id, zones.get("china_hk", {}))
    couriers = current_zone.get("couriers", data.get("couriers", {}))
    zone_name = current_zone.get("name", "Standard International Zone")

    # Calculate comparison for all couriers in this zone
    all_quotes = compare_all_couriers(
        couriers=couriers,
        weight_kg=weight_kg,
        exchange_rate=exchange_rate,
        apply_fuel=apply_fuel,
        override_handling_fee=handling_fee,
        volumetric_weight=volumetric_kg,
        origin=origin,
        destination=destination,
        zone_name=zone_name,
        buyer_name=buyer_name
    )

    # If single courier requested
    single_quote = None
    if selected_courier != "ALL" and selected_courier in couriers:
        single_quote = calculate_courier_quote(
            courier_code=selected_courier,
            courier_data=couriers[selected_courier],
            weight_kg=weight_kg,
            exchange_rate=exchange_rate,
            apply_fuel=apply_fuel,
            override_handling_fee=handling_fee,
            volumetric_weight=volumetric_kg,
            origin=origin,
            destination=destination,
            zone_name=zone_name,
            buyer_name=buyer_name
        )

    return jsonify({
        "success": True,
        "input": {
            "origin": origin,
            "destination": destination,
            "zone_id": zone_id,
            "zone_name": zone_name,
            "weight_kg": weight_kg,
            "length_cm": length,
            "width_cm": width,
            "height_cm": height,
            "volumetric_kg": volumetric_kg,
            "chargeable_kg": max(weight_kg, volumetric_kg),
            "exchange_rate": exchange_rate,
            "apply_fuel": apply_fuel
        },
        "single_quote": single_quote,
        "all_quotes": all_quotes,
        "cheapest_courier": all_quotes[0] if all_quotes else None
    })


@app.route("/api/export-excel", methods=["POST"])
def export_excel():
    """Generates and downloads an Excel Work Order quote sheet."""
    payload = request.get_json() or {}
    quote = payload.get("quote")
    if not quote:
        return jsonify({"error": "No quote provided"}), 400

    filename = f"AGDL_Courier_Quote_{quote.get('courier_code')}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    import tempfile
    temp_path = os.path.join(tempfile.gettempdir(), filename)

    try:
        rates_manager.export_quote_to_excel(quote, temp_path)
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=filename,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/sync-to-excel", methods=["POST"])
def sync_excel():
    """Syncs rates to the original Desktop Excel file."""
    data = rates_manager.load_rates()
    res = rates_manager.sync_to_desktop_excel(data)
    return jsonify(res)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=True)
