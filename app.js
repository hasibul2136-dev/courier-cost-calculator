/**
 * AMAN GRAPHICS AND DESIGNS LTD.
 * Dynamic Courier Cost & Work Order (WO) Calculation Engine
 * 100% Client-Side + Serverless Cloud Resilient (Runs everywhere: Vercel, Localhost, Offline)
 */

const BUNDLED_DEFAULT_DATA = {"settings": {"company_name": "AMAN GRAPHICS AND DESIGNS LTD.", "currency_base": "USD", "currency_target": "BDT", "exchange_rate": 123.83, "last_exchange_update": "2026-10-27T11:45:00", "auto_fetch_exchange": true, "default_handling_fee": 10.0, "apply_fuel_surcharge": true, "default_origin": "China (Guangzhou / Shanghai / Ningbo)", "default_destination": "Nazimnagar, Singair Road, Hemayetpur, Savar, Dhaka 1340.", "default_zone": "china_hk"}, "buyers_catalog": [{"id": "tesco", "name": "Tesco Stores Ltd", "short_name": "Tesco", "country": "United Kingdom", "city": "Welwyn Garden City, Hertfordshire, UK", "zone": "europe_uk", "flag": "🇬🇧", "category": "UK"}, {"id": "ms", "name": "Marks & Spencer (M&S)", "short_name": "M&S", "country": "United Kingdom", "city": "Waterside House, London, UK", "zone": "europe_uk", "flag": "🇬🇧", "category": "UK"}, {"id": "next", "name": "Next Retail Ltd", "short_name": "Next", "country": "United Kingdom", "city": "Desford Road, Enderby, Leicester, UK", "zone": "europe_uk", "flag": "🇬🇧", "category": "UK"}, {"id": "john_lewis", "name": "John Lewis & Partners", "short_name": "John Lewis", "country": "United Kingdom", "city": "171 Victoria Street, London, UK", "zone": "europe_uk", "flag": "🇬🇧", "category": "UK"}, {"id": "sainsburys", "name": "Sainsbury's (Tu Clothing)", "short_name": "Sainsbury's", "country": "United Kingdom", "city": "33 Holborn, London, UK", "zone": "europe_uk", "flag": "🇬🇧", "category": "UK"}, {"id": "target_usa", "name": "Target Corporation", "short_name": "Target (USA)", "country": "United States", "city": "1000 Nicollet Mall, Minneapolis, MN, USA", "zone": "usa_canada", "flag": "🇺🇸", "category": "USA"}, {"id": "carters", "name": "Carter's Inc.", "short_name": "Carter's", "country": "United States", "city": "3438 Peachtree Rd NE, Atlanta, GA, USA", "zone": "usa_canada", "flag": "🇺🇸", "category": "USA"}, {"id": "mango", "name": "Mango (Punto Fa, S.L.)", "short_name": "Mango", "country": "Spain", "city": "Palau-solità i Plegamans, Barcelona, Spain", "zone": "europe_uk", "flag": "🇪🇸", "category": "Europe"}, {"id": "monoprix", "name": "Monoprix S.A.", "short_name": "Monoprix", "country": "France", "city": "14-16 Rue Marc Bloch, Clichy / Paris, France", "zone": "europe_uk", "flag": "🇫🇷", "category": "Europe"}, {"id": "idkids", "name": "ÏDKIDS (Okaïdi / Obaïbi)", "short_name": "ÏDKIDS", "country": "France", "city": "162 Boulevard de Fourmies, Roubaix, France", "zone": "europe_uk", "flag": "🇫🇷", "category": "Europe"}, {"id": "kmart_aus", "name": "Kmart Australia Ltd", "short_name": "Kmart (Aus)", "country": "Australia", "city": "Mulgrave, Melbourne, Victoria, Australia", "zone": "australia_oceania", "flag": "🇦🇺", "category": "Australia"}, {"id": "big_w", "name": "BIG W (Woolworths Group)", "short_name": "BIG W", "country": "Australia", "city": "1 Woolworths Way, Bella Vista, Sydney, Australia", "zone": "australia_oceania", "flag": "🇦🇺", "category": "Australia"}, {"id": "myer", "name": "Myer Pty Ltd", "short_name": "Myer", "country": "Australia", "city": "800 Collins Street, Docklands, Melbourne, Australia", "zone": "australia_oceania", "flag": "🇦🇺", "category": "Australia"}, {"id": "lc_waikiki", "name": "LC Waikiki Mağazacılık", "short_name": "LC Waikiki", "country": "Turkey", "city": "Evren Mah. Gülbahar Cad., Bağcılar, Istanbul, Turkey", "zone": "south_asia_middle_east", "flag": "🇹🇷", "category": "Turkey & ME"}, {"id": "max_fashion", "name": "Max Fashion (Landmark Group)", "short_name": "Max Fashion", "country": "United Arab Emirates", "city": "Landmark Tower, Dubai Marina, Dubai, UAE", "zone": "south_asia_middle_east", "flag": "🇦🇪", "category": "Turkey & ME"}, {"id": "babyshop", "name": "Babyshop (Landmark Group)", "short_name": "Babyshop", "country": "United Arab Emirates", "city": "Landmark Group HQ, Dubai, UAE", "zone": "south_asia_middle_east", "flag": "🇦🇪", "category": "Turkey & ME"}, {"id": "kowa", "name": "Kowa Company, Ltd.", "short_name": "Kowa", "country": "Japan", "city": "3-4-14 Nihonbashi-Honcho, Chuo-ku, Tokyo, Japan", "zone": "china_hk", "flag": "🇯🇵", "category": "Asia / Japan"}], "origins_catalog": [{"country": "China", "city": "Guangzhou / Shanghai / Ningbo", "flag": "🇨🇳", "zone": "china_hk", "label": "China"}, {"country": "Hong Kong", "city": "Hong Kong SAR", "flag": "🇭🇰", "zone": "china_hk", "label": "Hong Kong"}, {"country": "India", "city": "Delhi / Mumbai / Surat", "flag": "🇮🇳", "zone": "south_asia_middle_east", "label": "India"}, {"country": "Taiwan", "city": "Taipei", "flag": "🇹🇼", "zone": "china_hk", "label": "Taiwan"}, {"country": "Vietnam", "city": "Hanoi / HCMC", "flag": "🇻🇳", "zone": "china_hk", "label": "Vietnam"}, {"country": "Turkey", "city": "Istanbul", "flag": "🇹🇷", "zone": "south_asia_middle_east", "label": "Turkey"}, {"country": "BD HO", "city": "Nazimnagar, Singair Road, Hemayetpur, Savar, Dhaka 1340.", "flag": "🏢", "zone": "china_hk", "label": "BD HO"}, {"country": "Other", "city": "Custom Origin", "flag": "🌏", "zone": "rest_of_world", "label": "Other"}], "destination_zones": {"china_hk": {"id": "china_hk", "name": "China & Hong Kong / East Asia (Far East)", "description": "Primary trims, fabric swatches, sample development hub & Kowa Japan (Spreadsheet rates)", "couriers": {"Fardar": {"name": "Fardar Express", "code": "Fardar", "color": "#0ea5e9", "rates": {"first_half": 6.0, "second_half": 2.0, "tier_11_20": 3.5, "tier_21_50": 3.5, "tier_51_100": 3.25, "tier_above_100": 3.0}, "fuel_surcharge_percent": 0.0, "handling_fee": 10.0, "transit_days": "4-6 Business Days", "notes": "Best cost for China / East Asia garment samples & trims"}, "DPS": {"name": "DPS Logistics", "code": "DPS", "color": "#10b981", "rates": {"first_half": 7.0, "second_half": 2.6, "tier_11_20": 5.3, "tier_21_50": 5.2, "tier_51_100": 5.1, "tier_above_100": 4.95}, "fuel_surcharge_percent": 8.0, "handling_fee": 10.0, "transit_days": "4-7 Business Days", "notes": "Economical air express solution"}, "Royal": {"name": "Royal Express", "code": "Royal", "color": "#8b5cf6", "rates": {"first_half": 6.25, "second_half": 2.65, "tier_11_20": 5.45, "tier_21_50": 5.3, "tier_51_100": 5.1, "tier_above_100": 5.0}, "fuel_surcharge_percent": 8.0, "handling_fee": 10.0, "transit_days": "4-7 Business Days", "notes": "Competitive regional freight and courier"}, "UPS": {"name": "UPS Express", "code": "UPS", "color": "#ffb500", "rates": {"first_half": 12.0, "second_half": 4.0, "tier_11_20": 7.0, "tier_21_50": 7.0, "tier_51_100": 6.3, "tier_above_100": 5.7}, "fuel_surcharge_percent": 0.0, "handling_fee": 10.0, "transit_days": "3-5 Business Days", "notes": "Ideal for sample parcels and commercial shipments"}, "DHL": {"name": "DHL Express", "code": "DHL", "color": "#d40511", "rates": {"first_half": 13.5, "second_half": 4.2, "tier_11_20": 7.5, "tier_21_50": 7.2, "tier_51_100": 6.5, "tier_above_100": 5.8}, "fuel_surcharge_percent": 14.5, "handling_fee": 10.0, "transit_days": "2-4 Business Days", "notes": "Fastest global delivery, standard express"}, "FedEx": {"name": "FedEx International", "code": "FedEx", "color": "#4d148c", "rates": {"first_half": 12.5, "second_half": 4.1, "tier_11_20": 7.2, "tier_21_50": 7.0, "tier_51_100": 6.4, "tier_above_100": 5.6}, "fuel_surcharge_percent": 12.0, "handling_fee": 10.0, "transit_days": "3-5 Business Days", "notes": "Priority express service with tracking"}}}, "usa_canada": {"id": "usa_canada", "name": "USA & North America (Target, Carter's)", "description": "Target (USA), Carter's proto fits, size sets & buyer development approvals", "couriers": {"FedEx": {"name": "FedEx International Priority", "code": "FedEx", "color": "#4d148c", "rates": {"first_half": 19.5, "second_half": 5.8, "tier_11_20": 9.5, "tier_21_50": 9.0, "tier_51_100": 8.3, "tier_above_100": 7.5}, "fuel_surcharge_percent": 12.0, "handling_fee": 10.0, "transit_days": "3-5 Business Days", "notes": "Fastest priority express to USA buyer headquarters"}, "DHL": {"name": "DHL Express Worldwide", "code": "DHL", "color": "#d40511", "rates": {"first_half": 20.5, "second_half": 6.0, "tier_11_20": 9.8, "tier_21_50": 9.2, "tier_51_100": 8.5, "tier_above_100": 7.7}, "fuel_surcharge_percent": 14.5, "handling_fee": 10.0, "transit_days": "2-4 Business Days", "notes": "Global door-to-door courier"}, "UPS": {"name": "UPS Express Worldwide", "code": "UPS", "color": "#ffb500", "rates": {"first_half": 20.0, "second_half": 5.9, "tier_11_20": 9.6, "tier_21_50": 9.1, "tier_51_100": 8.4, "tier_above_100": 7.6}, "fuel_surcharge_percent": 0.0, "handling_fee": 10.0, "transit_days": "3-5 Business Days", "notes": "Direct reliable USA network"}}}, "europe_uk": {"id": "europe_uk", "name": "UK & Europe (M&S, Next, Tesco, Mango, John Lewis, etc.)", "description": "UK & Europe fashion retailers (Tesco, M&S, Next, John Lewis, Sainsbury's, Mango, Monoprix, ÏDKIDS)", "couriers": {"DPS": {"name": "DPS Logistics (Europe Air)", "code": "DPS", "color": "#10b981", "rates": {"first_half": 13.5, "second_half": 4.2, "tier_11_20": 7.5, "tier_21_50": 7.0, "tier_51_100": 6.5, "tier_above_100": 5.9}, "fuel_surcharge_percent": 8.0, "handling_fee": 10.0, "transit_days": "4-6 Business Days", "notes": "Cost-effective Europe express consolidation"}, "DHL": {"name": "DHL Express Europe", "code": "DHL", "color": "#d40511", "rates": {"first_half": 17.5, "second_half": 5.2, "tier_11_20": 8.5, "tier_21_50": 8.0, "tier_51_100": 7.2, "tier_above_100": 6.5}, "fuel_surcharge_percent": 14.5, "handling_fee": 10.0, "transit_days": "2-4 Business Days", "notes": "Preferred by UK & European buyer sampling desks"}, "FedEx": {"name": "FedEx International Priority", "code": "FedEx", "color": "#4d148c", "rates": {"first_half": 16.5, "second_half": 4.9, "tier_11_20": 8.2, "tier_21_50": 7.8, "tier_51_100": 7.0, "tier_above_100": 6.3}, "fuel_surcharge_percent": 12.0, "handling_fee": 10.0, "transit_days": "3-5 Business Days", "notes": "Comprehensive Europe air network"}, "UPS": {"name": "UPS Express Saver", "code": "UPS", "color": "#ffb500", "rates": {"first_half": 17.0, "second_half": 5.0, "tier_11_20": 8.4, "tier_21_50": 7.9, "tier_51_100": 7.1, "tier_above_100": 6.4}, "fuel_surcharge_percent": 0.0, "handling_fee": 10.0, "transit_days": "3-5 Business Days", "notes": "UPS European express services"}}}, "australia_oceania": {"id": "australia_oceania", "name": "Australia & Oceania (Kmart, Big W, Myer)", "description": "Australian department stores & brands (Kmart Australia, Big W, Myer)", "couriers": {"FedEx": {"name": "FedEx International Priority (Australia)", "code": "FedEx", "color": "#4d148c", "rates": {"first_half": 18.5, "second_half": 5.4, "tier_11_20": 8.8, "tier_21_50": 8.2, "tier_51_100": 7.5, "tier_above_100": 6.8}, "fuel_surcharge_percent": 12.0, "handling_fee": 10.0, "transit_days": "4-6 Business Days", "notes": "Direct Australia air express with customs clearance"}, "DHL": {"name": "DHL Express Australia", "code": "DHL", "color": "#d40511", "rates": {"first_half": 19.5, "second_half": 5.6, "tier_11_20": 9.0, "tier_21_50": 8.5, "tier_51_100": 7.8, "tier_above_100": 7.0}, "fuel_surcharge_percent": 14.5, "handling_fee": 10.0, "transit_days": "3-5 Business Days", "notes": "Fastest transit to Melbourne & Sydney buyer offices"}, "UPS": {"name": "UPS Worldwide Express", "code": "UPS", "color": "#ffb500", "rates": {"first_half": 19.0, "second_half": 5.5, "tier_11_20": 8.9, "tier_21_50": 8.3, "tier_51_100": 7.6, "tier_above_100": 6.9}, "fuel_surcharge_percent": 0.0, "handling_fee": 10.0, "transit_days": "4-6 Business Days", "notes": "Reliable Australian Pacific courier"}}}, "south_asia_middle_east": {"id": "south_asia_middle_east", "name": "Middle East & Turkey (LC Waikiki, Max, Babyshop)", "description": "LC Waikiki (Turkey), Max Fashion & Babyshop (Landmark Group, UAE), India", "couriers": {"DPS": {"name": "DPS Logistics", "code": "DPS", "color": "#10b981", "rates": {"first_half": 8.5, "second_half": 2.9, "tier_11_20": 5.8, "tier_21_50": 5.4, "tier_51_100": 5.0, "tier_above_100": 4.6}, "fuel_surcharge_percent": 8.0, "handling_fee": 10.0, "transit_days": "3-5 Business Days", "notes": "Direct regional courier"}, "Royal": {"name": "Royal Express", "code": "Royal", "color": "#8b5cf6", "rates": {"first_half": 8.0, "second_half": 2.8, "tier_11_20": 5.6, "tier_21_50": 5.2, "tier_51_100": 4.9, "tier_above_100": 4.5}, "fuel_surcharge_percent": 8.0, "handling_fee": 10.0, "transit_days": "3-6 Business Days", "notes": "Economical regional tariff"}, "DHL": {"name": "DHL Express Regional", "code": "DHL", "color": "#d40511", "rates": {"first_half": 14.5, "second_half": 4.3, "tier_11_20": 7.3, "tier_21_50": 6.9, "tier_51_100": 6.3, "tier_above_100": 5.6}, "fuel_surcharge_percent": 14.5, "handling_fee": 10.0, "transit_days": "2-3 Business Days", "notes": "Next-day to 3-day express to Dubai & Istanbul"}, "FedEx": {"name": "FedEx Regional", "code": "FedEx", "color": "#4d148c", "rates": {"first_half": 13.8, "second_half": 4.1, "tier_11_20": 7.0, "tier_21_50": 6.6, "tier_51_100": 6.0, "tier_above_100": 5.3}, "fuel_surcharge_percent": 12.0, "handling_fee": 10.0, "transit_days": "2-4 Business Days", "notes": "Reliable Middle East & Turkey service"}}}, "rest_of_world": {"id": "rest_of_world", "name": "Rest of the World (Other)", "description": "Latin America, Africa & Global other routes", "couriers": {"DHL": {"name": "DHL Express Worldwide", "code": "DHL", "color": "#d40511", "rates": {"first_half": 23.5, "second_half": 6.8, "tier_11_20": 11.2, "tier_21_50": 10.5, "tier_51_100": 9.5, "tier_above_100": 8.7}, "fuel_surcharge_percent": 14.5, "handling_fee": 10.0, "transit_days": "3-6 Business Days", "notes": "Global international coverage"}, "FedEx": {"name": "FedEx International Priority", "code": "FedEx", "color": "#4d148c", "rates": {"first_half": 22.5, "second_half": 6.5, "tier_11_20": 10.8, "tier_21_50": 10.2, "tier_51_100": 9.2, "tier_above_100": 8.4}, "fuel_surcharge_percent": 12.0, "handling_fee": 10.0, "transit_days": "4-6 Business Days", "notes": "Worldwide air express"}, "UPS": {"name": "UPS Worldwide Express", "code": "UPS", "color": "#ffb500", "rates": {"first_half": 23.0, "second_half": 6.6, "tier_11_20": 11.0, "tier_21_50": 10.4, "tier_51_100": 9.4, "tier_above_100": 8.5}, "fuel_surcharge_percent": 0.0, "handling_fee": 10.0, "transit_days": "4-6 Business Days", "notes": "Global door delivery"}}}}};

let appData = {
  settings: JSON.parse(JSON.stringify(BUNDLED_DEFAULT_DATA.settings || {})),
  destination_zones: JSON.parse(JSON.stringify(BUNDLED_DEFAULT_DATA.destination_zones || {})),
  currentQuotes: [],
  selectedQuote: null,
  activeZoneId: "china_hk",
  selectedBuyer: null
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  try {
    const localZones = localStorage.getItem("agdl_custom_zones");
    if (localZones) {
      const parsed = JSON.parse(localZones);
      appData.destination_zones = { ...appData.destination_zones, ...parsed };
    }
    const localEx = localStorage.getItem("agdl_custom_exchange");
    if (localEx) {
      appData.settings.live_exchange_rate = parseFloat(localEx);
      appData.settings.is_manual_exchange = true;
    }
  } catch (e) {
    console.warn("localStorage restore error:", e);
  }

  appData.activeZoneId = appData.settings.default_zone || "china_hk";

  const originInput = document.getElementById("inputOrigin");
  if (originInput && !originInput.value) {
    originInput.value = "China (Guangzhou / Shanghai / Ningbo)";
  }

  const destInput = document.getElementById("inputDestination");
  if (destInput && !destInput.value) {
    destInput.value = "Nazimnagar, Singair Road, Hemayetpur, Savar, Dhaka 1340.";
  }

  const zoneSelect = document.getElementById("selectTariffZone");
  if (zoneSelect) zoneSelect.value = appData.activeZoneId;

  updateExchangeBadge(appData.settings.live_exchange_rate || 123.83, appData.settings.is_manual_exchange);
  populateCourierDropdown();

  // Instant calculation synchronously (zero delay, never blank!)
  performCalculation();

  // Background fetch for live market exchange rate
  fetchLiveExchangeRate();
}

function updateExchangeBadge(rate, isManual) {
  const badge = document.getElementById("headerExchangeRate");
  if (badge) {
    badge.innerText = `৳ ${Number(rate).toFixed(2)}${isManual ? ' (Manual)' : ''}`;
  }
}

function calculateVolumetricWeight(l, w, h) {
  if (l <= 0 || w <= 0 || h <= 0) return 0.0;
  return Number(((l * w * h) / 5000.0).toFixed(2));
}

function calculateSingleCourierQuote(courierCode, courierData, weightKg, exRate, applyFuel, handlingFee, volWeight, origin, destination, zoneName, buyerName) {
  const chargeableWeight = Math.max(weightKg, volWeight, 0.1);
  const rates = courierData.rates || {};
  const firstHalf = parseFloat(rates.first_half || 0);
  const secondHalf = parseFloat(rates.second_half || 0);
  const tier11_20 = parseFloat(rates.tier_11_20 || 0);
  const tier21_50 = parseFloat(rates.tier_21_50 || 0);
  const tier51_100 = parseFloat(rates.tier_51_100 || 0);
  const tierAbove100 = parseFloat(rates.tier_above_100 || 0);

  let tierName = "";
  let rateApplied = 0;
  let baseFreight = 0;

  if (chargeableWeight <= 0.5) {
    tierName = "1st Half (≤ 0.50 Kg)";
    rateApplied = firstHalf;
    baseFreight = firstHalf;
  } else if (chargeableWeight <= 1.0) {
    tierName = "2nd Half (0.51 - 1.00 Kg)";
    rateApplied = secondHalf;
    baseFreight = firstHalf + secondHalf;
  } else if (chargeableWeight <= 10.0) {
    const additionalSteps = Math.ceil((chargeableWeight - 0.5) / 0.5);
    tierName = `Sample / Small Tier (≤ 10 Kg) [1st 0.5kg + ${additionalSteps} × 0.5kg]`;
    rateApplied = secondHalf;
    baseFreight = firstHalf + (additionalSteps * secondHalf);
  } else if (chargeableWeight <= 20.0) {
    tierName = "11 Kg - 20 Kg Tier (Flat per Kg)";
    rateApplied = tier11_20;
    baseFreight = chargeableWeight * tier11_20;
  } else if (chargeableWeight <= 50.0) {
    tierName = "21 Kg - 50 Kg Tier (Flat per Kg)";
    rateApplied = tier21_50;
    baseFreight = chargeableWeight * tier21_50;
  } else if (chargeableWeight <= 100.0) {
    tierName = "51 Kg - 100 Kg Tier (Flat per Kg)";
    rateApplied = tier51_100;
    baseFreight = chargeableWeight * tier51_100;
  } else {
    tierName = "Above 100 Kg Bulk Tier (Flat per Kg)";
    rateApplied = tierAbove100;
    baseFreight = chargeableWeight * tierAbove100;
  }

  const fuelPct = applyFuel ? parseFloat(courierData.fuel_surcharge_percent || 0) : 0;
  const fuelSurcharge = baseFreight * (fuelPct / 100.0);
  const fee = handlingFee !== null && handlingFee !== undefined ? parseFloat(handlingFee) : parseFloat(courierData.handling_fee || 10.0);

  const totalUsd = baseFreight + fuelSurcharge + fee;
  const totalBdt = totalUsd * exRate;
  const perKgUsd = totalUsd / chargeableWeight;
  const perKgBdt = totalBdt / chargeableWeight;

  return {
    company_name: "AMAN GRAPHICS AND DESIGNS LTD.",
    courier_code: courierCode,
    courier_name: courierData.name || courierCode,
    color: courierData.color || "#4f46e5",
    origin: origin,
    destination: destination,
    zone_name: zoneName,
    buyer_name: buyerName,
    actual_weight_kg: Number(weightKg.toFixed(2)),
    volumetric_weight_kg: Number(volWeight.toFixed(2)),
    chargeable_weight_kg: Number(chargeableWeight.toFixed(2)),
    tier_name: tierName,
    rate_applied: Number(rateApplied.toFixed(2)),
    base_freight_usd: Number(baseFreight.toFixed(2)),
    fuel_surcharge_percent: fuelPct,
    fuel_surcharge_usd: Number(fuelSurcharge.toFixed(2)),
    handling_fee_usd: Number(fee.toFixed(2)),
    total_required_usd: Number(totalUsd.toFixed(2)),
    total_required_bdt: Number(totalBdt.toFixed(2)),
    per_kg_usd_for_wo: Number(perKgUsd.toFixed(2)),
    per_kg_bdt_for_wo: Number(perKgBdt.toFixed(2)),
    transit_days: courierData.transit_days || "3-5 Days",
    notes: courierData.notes || ""
  };
}

function computeAllQuotesLocally(weight, length, width, height, origin, destination, zoneId, applyFuel, handlingFee, courierFilter, buyerName) {
  const volWeight = calculateVolumetricWeight(length, width, height);
  const zone = appData.destination_zones[zoneId] || appData.destination_zones["china_hk"] || {};
  const couriers = zone.couriers || {};
  const zoneName = zone.name || "International Tariff Zone";
  const exRate = appData.settings.live_exchange_rate || 123.83;

  const quotes = [];
  for (const [code, cData] of Object.entries(couriers)) {
    if (!cData.rates || !Object.keys(cData.rates).length) continue;
    const q = calculateSingleCourierQuote(code, cData, weight, exRate, applyFuel, handlingFee, volWeight, origin, destination, zoneName, buyerName);
    quotes.push(q);
  }

  quotes.sort((a, b) => a.total_required_usd - b.total_required_usd);

  if (quotes.length > 0) {
    const lowest = quotes[0].total_required_usd;
    quotes.forEach((q, idx) => {
      q.is_cheapest = (idx === 0);
      q.rank = idx + 1;
      q.difference_from_cheapest_usd = Number((q.total_required_usd - lowest).toFixed(2));
    });
  }

  return {
    success: true,
    input: {
      origin, destination, zone_id: zoneId, zone_name: zoneName,
      weight_kg: weight, length_cm: length, width_cm: width, height_cm: height,
      volumetric_kg: volWeight, chargeable_kg: Math.max(weight, volWeight, 0.1),
      exchange_rate: exRate, apply_fuel: applyFuel
    },
    all_quotes: quotes,
    cheapest_courier: quotes[0] || null
  };
}

let calcDebounceTimer = null;
function triggerCalculation() {
  clearTimeout(calcDebounceTimer);
  calcDebounceTimer = setTimeout(performCalculation, 40);
}

function performCalculation() {
  const weightInput = parseFloat(document.getElementById("inputWeight")?.value || 0.1);
  const weight = isNaN(weightInput) || weightInput <= 0 ? 0.1 : weightInput;

  const length = parseFloat(document.getElementById("inputLength")?.value || 0);
  const width = parseFloat(document.getElementById("inputWidth")?.value || 0);
  const height = parseFloat(document.getElementById("inputHeight")?.value || 0);

  const applyFuel = document.getElementById("toggleFuel")?.checked ?? true;
  const handlingFee = parseFloat(document.getElementById("inputHandlingFee")?.value || 10.0);
  const courierFilter = document.getElementById("selectCourierFilter")?.value || "ALL";

  const origin = getEffectiveOrigin();
  const destination = getEffectiveDestination();
  const zoneId = appData.activeZoneId;

  const volWeight = calculateVolumetricWeight(length, width, height);
  const volDisplay = document.getElementById("volWeightDisplay");
  if (volDisplay) {
    volDisplay.innerText = `${volWeight.toFixed(2)} Kg`;
  }

  const chargeableWeight = Math.max(weight, volWeight);
  const chargeableDisplay = document.getElementById("chargeableWeightDisplay");
  if (chargeableDisplay) {
    chargeableDisplay.innerText = `${chargeableWeight.toFixed(2)} Kg`;
  }

  // 1. Instant local calculation (0ms, 100% reliable)
  const localResult = computeAllQuotesLocally(
    weight, length, width, height, origin, destination, zoneId,
    applyFuel, handlingFee, courierFilter, appData.selectedBuyer
  );

  appData.currentQuotes = localResult.all_quotes || [];
  renderQuotes(localResult);

  // 2. Optional server validation in background if /api/calculate is reachable
  fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      weight, length, width, height, origin, destination,
      zone_id: zoneId, apply_fuel: applyFuel, handling_fee: handlingFee,
      courier: courierFilter, buyer_name: appData.selectedBuyer || null
    })
  }).then(res => res.json()).then(serverResult => {
    if (serverResult && serverResult.success && serverResult.all_quotes) {
      appData.currentQuotes = serverResult.all_quotes;
      renderQuotes(serverResult);
    }
  }).catch(() => {});
}

function renderQuotes(data) {
  const tbody = document.getElementById("quotesTableBody");
  if (!tbody) return;

  const quotes = data.all_quotes || [];
  const cheapest = data.cheapest_courier;
  const courierFilter = document.getElementById("selectCourierFilter")?.value || "ALL";

  const displayedQuotes = courierFilter === "ALL"
    ? quotes
    : quotes.filter(q => q.courier_code === courierFilter);

  // Update Route Subhead
  const routeSubhead = document.getElementById("comparisonRouteSubhead");
  if (routeSubhead && data.input) {
    const originShort = (data.input.origin || "").split("(")[0].trim();
    routeSubhead.innerText = `Route: ${originShort} ➔ ${data.input.destination} (${data.input.zone_name})`;
  }

  // Update Best Choice Banner
  const banner = document.getElementById("cheapestBanner");
  if (cheapest && banner) {
    document.getElementById("bestCourierName").innerText = cheapest.courier_name;
    document.getElementById("bestTotalUsd").innerText = `$${cheapest.total_required_usd.toFixed(2)}`;
    document.getElementById("bestTotalBdt").innerText = `৳ ${cheapest.total_required_bdt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById("bestPerKgUsd").innerText = `$${cheapest.per_kg_usd_for_wo.toFixed(2)} / Kg`;
    document.getElementById("bestPerKgBdt").innerText = `৳ ${cheapest.per_kg_bdt_for_wo.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} / Kg`;

    if (quotes.length > 1) {
      const secondCheapest = quotes[1];
      const savings = (secondCheapest.total_required_usd - cheapest.total_required_usd).toFixed(2);
      if (savings > 0) {
        document.getElementById("savingsNotice").innerText = `⭐ Saves $${savings} compared to ${secondCheapest.courier_name}!`;
      } else {
        document.getElementById("savingsNotice").innerText = `Best available rate across all active couriers.`;
      }
    }
  }

  // Update Tier badge
  const tierBadge = document.getElementById("tierNameBadge");
  if (tierBadge && displayedQuotes.length > 0) {
    tierBadge.innerHTML = `<span class="inline-block bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-1 rounded-lg">${displayedQuotes[0].tier_name}</span>`;
  }

  // Render Table Rows
  tbody.innerHTML = "";
  displayedQuotes.forEach((q) => {
    const isBest = q.is_cheapest;
    const tr = document.createElement("tr");
    tr.className = `quote-row ${isBest ? 'cheapest-row' : ''}`;

    tr.innerHTML = `
      <td class="py-3 px-3 text-center">
        ${isBest
          ? '<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm" title="Cheapest Option"><i class="fa-solid fa-crown text-[10px]"></i></span>'
          : `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">#${q.rank}</span>`}
      </td>
      <td class="py-3 px-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${q.color || '#3b82f6'}"></span>
          <div>
            <div class="font-bold text-slate-900 flex items-center gap-1.5">
              ${q.courier_name}
              ${isBest ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded">CHEAPEST</span>' : ''}
            </div>
            <div class="text-[11px] text-slate-400">${q.transit_days}</div>
          </div>
        </div>
      </td>
      <td class="py-3 px-3 font-semibold text-slate-700">$${q.base_freight_usd.toFixed(2)}</td>
      <td class="py-3 px-3 text-slate-600">
        <div>$${q.fuel_surcharge_usd.toFixed(2)}</div>
        <div class="text-[10px] text-slate-400">${q.fuel_surcharge_percent}%</div>
      </td>
      <td class="py-3 px-3 text-slate-600">$${q.handling_fee_usd.toFixed(2)}</td>
      <td class="py-3 px-3 text-right">
        <div class="text-base font-black text-slate-900">$${q.total_required_usd.toFixed(2)}</div>
        <div class="text-xs font-semibold text-slate-500">৳ ${q.total_required_bdt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </td>
      <td class="py-3 px-3 text-right bg-blue-50/50">
        <div class="text-base font-black text-blue-900">$${q.per_kg_usd_for_wo.toFixed(2)} <span class="text-xs font-normal text-blue-700">/Kg</span></div>
        <div class="text-xs font-semibold text-blue-800">৳ ${q.per_kg_bdt_for_wo.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} /Kg</div>
      </td>
      <td class="py-3 px-3 text-center">
        <div class="flex items-center justify-center gap-1.5">
          <button onclick="selectQuoteForWorkOrder('${q.courier_code}')" title="Generate WO Text" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
            <i class="fa-solid fa-file-lines"></i>
          </button>
          <button onclick="exportSingleExcel('${q.courier_code}')" title="Export Excel Quote" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
            <i class="fa-solid fa-file-excel"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (displayedQuotes.length > 0) {
    selectQuoteForWorkOrder(displayedQuotes[0].courier_code);
  }
}

function selectQuoteForWorkOrder(courierCode) {
  const quote = appData.currentQuotes.find(q => q.courier_code === courierCode);
  if (!quote) return;

  appData.selectedQuote = quote;
  const exRate = appData.settings.live_exchange_rate || 123.83;

  const isImport = (quote.destination || "").toLowerCase().includes("bangladesh") || (quote.destination || "").toLowerCase().includes("savar") || (quote.destination || "").toLowerCase().includes("hemayetpur") || (quote.destination || "").toLowerCase().includes("ho");
  const shipmentType = isImport ? "INBOUND IMPORT (Trims / Accessories / Swatches)" : "OUTBOUND EXPORT (Buyer Samples / Fit Approvals)";

  const text = `=====================================================
AMAN GRAPHICS AND DESIGNS LTD.
COURIER COST FOR WORK ORDER (WO) & COMMERCIAL BILLING
=====================================================
Date            : ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
${quote.buyer_name ? `Buyer / Account : ${quote.buyer_name}\n` : ''}Shipment Type   : ${shipmentType}
Origin (From)   : ${quote.origin}
Destination (To): ${quote.destination}
Tariff Zone     : ${quote.zone_name}
Selected Courier: ${quote.courier_name} (${quote.courier_code})
Actual Weight   : ${quote.actual_weight_kg.toFixed(2)} Kg
Chargeable Wt   : ${quote.chargeable_weight_kg.toFixed(2)} Kg
Weight Tier     : ${quote.tier_name}
-----------------------------------------------------
Base Freight    : $${quote.base_freight_usd.toFixed(2)}
Fuel Surcharge  : $${quote.fuel_surcharge_usd.toFixed(2)} (${quote.fuel_surcharge_percent}%)
Doc / Handling  : $${quote.handling_fee_usd.toFixed(2)}
-----------------------------------------------------
TOTAL REQ. VALUE: $${quote.total_required_usd.toFixed(2)}  (৳ ${quote.total_required_bdt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
PER KG FOR WO   : $${quote.per_kg_usd_for_wo.toFixed(2)} / Kg (৳ ${quote.per_kg_bdt_for_wo.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} / Kg)
Exchange Rate   : 1 USD = ${exRate} BDT
=====================================================`;

  const textarea = document.getElementById("woFormattedText");
  if (textarea) {
    textarea.value = text;
  }
}

function copyWorkOrderText() {
  const textarea = document.getElementById("woFormattedText");
  if (!textarea || !textarea.value) return;

  navigator.clipboard.writeText(textarea.value).then(() => {
    showToast("Work Order text copied to clipboard!", "success");
  }).catch(() => {
    textarea.select();
    document.execCommand("copy");
    showToast("Work Order text copied!", "success");
  });
}

function copyQuickComparison() {
  if (!appData.currentQuotes || appData.currentQuotes.length === 0) return;

  const origin = getEffectiveOrigin();
  const destination = getEffectiveDestination();
  let compText = `AMAN GRAPHICS AND DESIGNS LTD. - COURIER COMPARISON\n`;
  compText += `Route: ${origin} ➔ ${destination}\n`;
  compText += `Weight: ${appData.currentQuotes[0].actual_weight_kg} Kg\n`;
  compText += `------------------------------------------------------------\n`;
  appData.currentQuotes.forEach(q => {
    compText += `#${q.rank} ${q.courier_name.padEnd(20)} Total: $${q.total_required_usd.toFixed(2).padEnd(8)} (Per Kg: $${q.per_kg_usd_for_wo.toFixed(2)} / ৳ ${q.per_kg_bdt_for_wo.toFixed(2)})\n`;
  });
  compText += `------------------------------------------------------------\n`;

  navigator.clipboard.writeText(compText).then(() => {
    showToast("Courier comparison copied to clipboard!", "success");
  });
}

function getEffectiveOrigin() {
  const input = document.getElementById("inputOrigin");
  return input?.value?.trim() || "China (Guangzhou / Shanghai / Ningbo)";
}

function getEffectiveDestination() {
  const input = document.getElementById("inputDestination");
  return input?.value?.trim() || "Nazimnagar, Singair Road, Hemayetpur, Savar, Dhaka 1340.";
}

function selectOrigin(country, defaultCity, zoneId) {
  const input = document.getElementById("inputOrigin");
  if (input) {
    if (country === "BD HO") {
      input.value = "Nazimnagar, Singair Road, Hemayetpur, Savar, Dhaka 1340.";
    } else if (country.startsWith("BD ")) {
      input.value = `${country.replace('BD ', '')}: ${defaultCity}`;
    } else {
      input.value = `${country} (${defaultCity})`;
    }
  }

  const pills = document.querySelectorAll(".origin-pill");
  pills.forEach(p => {
    p.classList.remove("active", "bg-blue-600", "text-white", "border-blue-600");
    p.classList.add("bg-slate-100", "text-slate-700");
  });

  if (window.event && window.event.currentTarget) {
    const target = window.event.currentTarget;
    target.classList.add("active", "bg-blue-600", "text-white", "border-blue-600");
    target.classList.remove("bg-slate-100", "text-slate-700");
  }

  if (zoneId && !country.startsWith("BD ")) {
    appData.activeZoneId = zoneId;
    const zoneSelect = document.getElementById("selectTariffZone");
    if (zoneSelect) zoneSelect.value = zoneId;
    updateZoneBadge();
    populateCourierDropdown();
  }

  triggerCalculation();
}

function selectBuyer(buyerName, address, zoneId) {
  appData.selectedBuyer = buyerName;
  const input = document.getElementById("inputDestination");
  if (input) {
    input.value = `${buyerName} — ${address}`;
  }

  const notice = document.getElementById("activeBuyerNotice");
  if (notice) {
    notice.innerHTML = `<span class="text-indigo-900 font-black">⭐ Account: ${buyerName}</span>`;
  }

  const pills = document.querySelectorAll(".buyer-pill");
  pills.forEach(p => {
    p.classList.remove("bg-indigo-600", "text-white", "border-indigo-600", "shadow");
    p.classList.add("bg-white", "text-slate-800", "border-slate-200");
  });

  if (window.event && window.event.currentTarget) {
    const target = window.event.currentTarget;
    target.classList.add("bg-indigo-600", "text-white", "border-indigo-600", "shadow");
    target.classList.remove("bg-white", "text-slate-800", "border-slate-200");
  }

  document.querySelectorAll(".dest-pill").forEach(p => {
    p.classList.remove("active", "bg-blue-600", "text-white", "border-blue-600");
    p.classList.add("bg-slate-100", "text-slate-700");
  });

  const originVal = document.getElementById("inputOrigin")?.value || "";
  if (!originVal.toLowerCase().includes("bangladesh") && !originVal.toLowerCase().includes("savar") && !originVal.toLowerCase().includes("ho")) {
    const originInput = document.getElementById("inputOrigin");
    if (originInput) originInput.value = "Nazimnagar, Singair Road, Hemayetpur, Savar, Dhaka 1340.";
    highlightPillByText(".origin-pill", "BD HO");

    const btnImport = document.getElementById("btnModeImport");
    const btnExport = document.getElementById("btnModeExport");
    btnExport?.classList.add("bg-blue-600", "text-white", "shadow-sm");
    btnExport?.classList.remove("text-slate-600");
    btnImport?.classList.remove("bg-blue-600", "text-white", "shadow-sm");
    btnImport?.classList.add("text-slate-600");
  }

  appData.activeZoneId = zoneId;
  const zoneSelect = document.getElementById("selectTariffZone");
  if (zoneSelect) zoneSelect.value = zoneId;

  updateZoneBadge();
  populateCourierDropdown();
  triggerCalculation();
  showToast(`Buyer destination set: ${buyerName}`, "info");
}

function selectDestination(country, defaultCity, zoneId) {
  appData.selectedBuyer = null;
  const notice = document.getElementById("activeBuyerNotice");
  if (notice) notice.innerText = "Click buyer to set destination";

  document.querySelectorAll(".buyer-pill").forEach(p => {
    p.classList.remove("bg-indigo-600", "text-white", "border-indigo-600", "shadow");
    p.classList.add("bg-white", "text-slate-800", "border-slate-200");
  });

  const input = document.getElementById("inputDestination");
  if (input) {
    if (country === "BD HO") {
      input.value = "Nazimnagar, Singair Road, Hemayetpur, Savar, Dhaka 1340.";
    } else if (country.startsWith("BD ")) {
      input.value = `${country.replace('BD ', '')}: ${defaultCity}`;
    } else {
      input.value = `${country} (${defaultCity})`;
    }
  }

  const pills = document.querySelectorAll(".dest-pill");
  pills.forEach(p => {
    p.classList.remove("active", "bg-blue-600", "text-white", "border-blue-600");
    p.classList.add("bg-slate-100", "text-slate-700");
  });

  if (window.event && window.event.currentTarget) {
    const target = window.event.currentTarget;
    target.classList.add("active", "bg-blue-600", "text-white", "border-blue-600");
    target.classList.remove("bg-slate-100", "text-slate-700");
  }

  if (zoneId && !country.startsWith("BD ")) {
    appData.activeZoneId = zoneId;
    const zoneSelect = document.getElementById("selectTariffZone");
    if (zoneSelect) zoneSelect.value = zoneId;
    updateZoneBadge();
    populateCourierDropdown();
  }

  triggerCalculation();
}

function setRouteDirection(mode) {
  const btnImport = document.getElementById("btnModeImport");
  const btnExport = document.getElementById("btnModeExport");
  const originRole = document.getElementById("originRoleLabel");
  const destRole = document.getElementById("destRoleLabel");

  if (mode === "import") {
    btnImport?.classList.add("bg-blue-600", "text-white", "shadow-sm");
    btnImport?.classList.remove("text-slate-600");
    btnExport?.classList.remove("bg-blue-600", "text-white", "shadow-sm");
    btnExport?.classList.add("text-slate-600");

    if (originRole) originRole.innerText = "Supplier / Foreign Shipper";
    if (destRole) destRole.innerText = "Consignee (BD HO)";

    document.getElementById("inputOrigin").value = "China (Guangzhou / Shanghai / Ningbo)";
    document.getElementById("inputDestination").value = "Nazimnagar, Singair Road, Hemayetpur, Savar, Dhaka 1340.";
    appData.activeZoneId = "china_hk";

    highlightPillByText(".origin-pill", "China");
    highlightPillByText(".dest-pill", "BD HO");
  } else {
    btnExport?.classList.add("bg-blue-600", "text-white", "shadow-sm");
    btnExport?.classList.remove("text-slate-600");
    btnImport?.classList.remove("bg-blue-600", "text-white", "shadow-sm");
    btnImport?.classList.add("text-slate-600");

    if (originRole) originRole.innerText = "Shipper (BD HO)";
    if (destRole) destRole.innerText = "Buyer / Foreign Consignee";

    document.getElementById("inputOrigin").value = "Nazimnagar, Singair Road, Hemayetpur, Savar, Dhaka 1340.";
    document.getElementById("inputDestination").value = "United States (New York / Los Angeles / Dallas)";
    appData.activeZoneId = "usa_canada";

    highlightPillByText(".origin-pill", "BD HO");
    highlightPillByText(".dest-pill", "USA");
  }

  const zoneSelect = document.getElementById("selectTariffZone");
  if (zoneSelect) zoneSelect.value = appData.activeZoneId;

  updateZoneBadge();
  populateCourierDropdown();
  triggerCalculation();
  showToast(`Switched to ${mode === 'import' ? 'Inbound Import' : 'Outbound Export'} mode`, "info");
}

function highlightPillByText(selector, text) {
  const pills = document.querySelectorAll(selector);
  pills.forEach(p => {
    if (p.textContent.includes(text)) {
      p.classList.add("active", "bg-blue-600", "text-white", "border-blue-600");
      p.classList.remove("bg-slate-100", "text-slate-700");
    } else {
      p.classList.remove("active", "bg-blue-600", "text-white", "border-blue-600");
      p.classList.add("bg-slate-100", "text-slate-700");
    }
  });
}

function swapRoute() {
  const inputOrigin = document.getElementById("inputOrigin");
  const inputDest = document.getElementById("inputDestination");
  if (!inputOrigin || !inputDest) return;

  const temp = inputOrigin.value;
  inputOrigin.value = inputDest.value;
  inputDest.value = temp;

  const isNowImport = (inputDest.value || "").toLowerCase().includes("bangladesh") || (inputDest.value || "").toLowerCase().includes("factory") || (inputDest.value || "").toLowerCase().includes("ho");
  const btnImport = document.getElementById("btnModeImport");
  const btnExport = document.getElementById("btnModeExport");

  if (isNowImport) {
    btnImport?.classList.add("bg-blue-600", "text-white", "shadow-sm");
    btnImport?.classList.remove("text-slate-600");
    btnExport?.classList.remove("bg-blue-600", "text-white", "shadow-sm");
    btnExport?.classList.add("text-slate-600");
  } else {
    btnExport?.classList.add("bg-blue-600", "text-white", "shadow-sm");
    btnExport?.classList.remove("text-slate-600");
    btnImport?.classList.remove("bg-blue-600", "text-white", "shadow-sm");
    btnImport?.classList.add("text-slate-600");
  }

  triggerCalculation();
  showToast("Origin and Destination swapped!", "info");
}

function handleZoneChange() {
  const zoneSelect = document.getElementById("selectTariffZone");
  if (zoneSelect) {
    appData.activeZoneId = zoneSelect.value;
    updateZoneBadge();
    populateCourierDropdown();
    triggerCalculation();
  }
}

function updateZoneBadge() {
  const badge = document.getElementById("routeZoneBadge");
  const zone = appData.destination_zones[appData.activeZoneId];
  if (badge && zone) {
    badge.innerText = zone.name;
  }
}

function populateCourierDropdown() {
  const select = document.getElementById("selectCourierFilter");
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="ALL">⭐ All Couriers (Compare & Find Lowest Rate)</option>';

  const zone = appData.destination_zones[appData.activeZoneId];
  const couriers = zone ? zone.couriers : {};

  for (const [code, c] of Object.entries(couriers)) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = `${c.name || code} (${code})`;
    select.appendChild(opt);
  }

  if (currentVal && couriers[currentVal]) {
    select.value = currentVal;
  }
}

function setWeight(val) {
  const input = document.getElementById("inputWeight");
  if (input) {
    input.value = val;
    triggerCalculation();
  }
}

function toggleDimensions() {
  const panel = document.getElementById("dimensionsPanel");
  const chevron = document.getElementById("dimChevron");
  if (panel.classList.contains("hidden")) {
    panel.classList.remove("hidden");
    chevron.classList.add("rotate-180");
  } else {
    panel.classList.add("hidden");
    chevron.classList.remove("rotate-180");
  }
}

/* EXCEL DOWNLOAD (SHEETJS DIRECT BROWSER GENERATION) */
async function downloadExcelQuote() {
  if (!appData.selectedQuote) {
    showToast("No quote selected to export", "error");
    return;
  }
  exportQuoteObj(appData.selectedQuote);
}

function exportSingleExcel(courierCode) {
  const quote = appData.currentQuotes.find(q => q.courier_code === courierCode);
  if (quote) {
    exportQuoteObj(quote);
  }
}

function exportQuoteObj(quote) {
  try {
    showToast("Generating Excel file...", "info");
    const exRate = appData.settings.live_exchange_rate || 123.83;

    if (window.XLSX) {
      const wb = XLSX.utils.book_new();
      const wsData = [
        ["AMAN GRAPHICS AND DESIGNS LTD. - COURIER COST & WORK ORDER"],
        [],
        ["Date", new Date().toLocaleDateString('en-GB')],
        ["Selected Courier", `${quote.courier_name} (${quote.courier_code})`],
        ["Origin (From)", quote.origin],
        ["Destination (To)", quote.destination],
        ["Tariff Zone", quote.zone_name],
        ["Buyer / Account", quote.buyer_name || "N/A"],
        ["Actual Weight", `${quote.actual_weight_kg} Kg`],
        ["Chargeable Weight", `${quote.chargeable_weight_kg} Kg`],
        ["Exchange Rate", `1 USD = ${exRate} BDT`],
        [],
        ["Component", "Rate Basis", "Amount (USD)", "Amount in BDT (৳)"],
        ["Base Freight", quote.tier_name, quote.base_freight_usd, Number((quote.base_freight_usd * exRate).toFixed(2))],
        ["Fuel Surcharge", `${quote.fuel_surcharge_percent}%`, quote.fuel_surcharge_usd, Number((quote.fuel_surcharge_usd * exRate).toFixed(2))],
        ["Doc / Handling Fee", "Fixed AWB charge", quote.handling_fee_usd, Number((quote.handling_fee_usd * exRate).toFixed(2))],
        ["TOTAL REQUIRED VALUE", "Full Courier Cost", quote.total_required_usd, quote.total_required_bdt],
        ["PER KG VALUE FOR WO", "Work Order Rate (Total / Wt)", quote.per_kg_usd_for_wo, quote.per_kg_bdt_for_wo]
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Courier Quote WO");
      XLSX.writeFile(wb, `AGDL_Courier_Quote_${quote.courier_code}_${quote.chargeable_weight_kg}Kg.xlsx`);
      showToast("Excel Work Order downloaded!", "success");
    } else {
      fetch("/api/export-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: { ...quote, exchange_rate: exRate } })
      }).then(res => res.blob()).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `AGDL_Courier_Quote_${quote.courier_code}_${quote.chargeable_weight_kg}Kg.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast("Excel Work Order downloaded!", "success");
      });
    }
  } catch (e) {
    showToast("Excel download error: " + e.message, "error");
  }
}

/* RATE CARD MANAGEMENT MODAL */
function openRatesModal() {
  const modal = document.getElementById("ratesModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  const modalZone = document.getElementById("modalZoneSelect");
  if (modalZone) modalZone.value = appData.activeZoneId;
  renderRatesEditorTable();
}

function closeRatesModal() {
  const modal = document.getElementById("ratesModal");
  if (modal) modal.classList.add("hidden");
}

function renderRatesEditorTable() {
  const tbody = document.getElementById("ratesEditorTableBody");
  if (!tbody) return;

  const zoneId = document.getElementById("modalZoneSelect")?.value || appData.activeZoneId;
  const zone = appData.destination_zones[zoneId] || {};
  const couriers = zone.couriers || {};

  tbody.innerHTML = "";
  for (const [code, c] of Object.entries(couriers)) {
    const rates = c.rates || {};
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50";

    tr.innerHTML = `
      <td class="py-2.5 px-3">
        <input type="text" value="${c.name || code}" class="font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-28" data-code="${code}" data-field="name">
        <div class="text-[10px] text-slate-400">${code}</div>
      </td>
      <td class="py-2.5 px-2">
        <input type="number" step="0.05" value="${rates.first_half || 0}" class="w-16 p-1 text-center font-semibold bg-slate-50 border rounded outline-none focus:border-blue-500" data-code="${code}" data-rate="first_half">
      </td>
      <td class="py-2.5 px-2">
        <input type="number" step="0.05" value="${rates.second_half || 0}" class="w-16 p-1 text-center font-semibold bg-slate-50 border rounded outline-none focus:border-blue-500" data-code="${code}" data-rate="second_half">
      </td>
      <td class="py-2.5 px-2">
        <input type="number" step="0.05" value="${rates.tier_11_20 || 0}" class="w-16 p-1 text-center font-semibold bg-slate-50 border rounded outline-none focus:border-blue-500" data-code="${code}" data-rate="tier_11_20">
      </td>
      <td class="py-2.5 px-2">
        <input type="number" step="0.05" value="${rates.tier_21_50 || 0}" class="w-16 p-1 text-center font-semibold bg-slate-50 border rounded outline-none focus:border-blue-500" data-code="${code}" data-rate="tier_21_50">
      </td>
      <td class="py-2.5 px-2">
        <input type="number" step="0.05" value="${rates.tier_51_100 || 0}" class="w-16 p-1 text-center font-semibold bg-slate-50 border rounded outline-none focus:border-blue-500" data-code="${code}" data-rate="tier_51_100">
      </td>
      <td class="py-2.5 px-2">
        <input type="number" step="0.05" value="${rates.tier_above_100 || 0}" class="w-16 p-1 text-center font-semibold bg-slate-50 border rounded outline-none focus:border-blue-500" data-code="${code}" data-rate="tier_above_100">
      </td>
      <td class="py-2.5 px-2">
        <input type="number" step="0.5" value="${c.fuel_surcharge_percent || 0}" class="w-14 p-1 text-center font-semibold bg-slate-50 border rounded outline-none focus:border-blue-500" data-code="${code}" data-field="fuel_surcharge_percent">
      </td>
      <td class="py-2.5 px-2">
        <input type="number" step="1" value="${c.handling_fee || 10}" class="w-14 p-1 text-center font-semibold bg-slate-50 border rounded outline-none focus:border-blue-500" data-code="${code}" data-field="handling_fee">
      </td>
      <td class="py-2.5 px-2 text-center">
        <button onclick="deleteCourierFromZone('${zoneId}', '${code}')" class="text-rose-500 hover:text-rose-700 transition" title="Delete Courier">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

async function saveAllRatesFromModal() {
  const zoneId = document.getElementById("modalZoneSelect")?.value || appData.activeZoneId;
  const zone = appData.destination_zones[zoneId];
  if (!zone || !zone.couriers) return;

  const inputs = document.querySelectorAll("#ratesEditorTableBody input");
  inputs.forEach(input => {
    const code = input.dataset.code;
    const rateKey = input.dataset.rate;
    const fieldKey = input.dataset.field;

    if (!zone.couriers[code]) return;

    if (rateKey) {
      if (!zone.couriers[code].rates) zone.couriers[code].rates = {};
      zone.couriers[code].rates[rateKey] = parseFloat(input.value) || 0.0;
    } else if (fieldKey) {
      if (fieldKey === "name") {
        zone.couriers[code].name = input.value.trim();
      } else {
        zone.couriers[code][fieldKey] = parseFloat(input.value) || 0.0;
      }
    }
  });

  try {
    localStorage.setItem("agdl_custom_zones", JSON.stringify(appData.destination_zones));
    showToast(`Rate cards for ${zone.name} saved successfully!`, "success");
    closeRatesModal();
    populateCourierDropdown();
    triggerCalculation();
    fetch("/api/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination_zones: appData.destination_zones, settings: appData.settings })
    }).catch(() => {});
  } catch (e) {
    showToast("Save failed: " + e.message, "error");
  }
}

function addNewCourierPrompt() {
  const zoneId = document.getElementById("modalZoneSelect")?.value || appData.activeZoneId;
  const zone = appData.destination_zones[zoneId];
  if (!zone) return;

  const code = prompt("Enter courier code (e.g. ARAMEX, SF, TNT):");
  if (!code) return;
  const upperCode = code.trim().toUpperCase();
  if (zone.couriers[upperCode]) {
    alert("This courier code already exists in this zone!");
    return;
  }

  const name = prompt("Enter full courier name (e.g. Aramex Express):", upperCode);

  zone.couriers[upperCode] = {
    name: name || upperCode,
    code: upperCode,
    color: "#6366f1",
    rates: {
      first_half: 10.0,
      second_half: 3.5,
      tier_11_20: 6.0,
      tier_21_50: 5.5,
      tier_51_100: 5.0,
      tier_above_100: 4.5
    },
    fuel_surcharge_percent: 10.0,
    handling_fee: 10.0,
    transit_days: "3-5 Business Days",
    notes: "Custom added courier"
  };

  renderRatesEditorTable();
}

function deleteCourierFromZone(zoneId, code) {
  const zone = appData.destination_zones[zoneId];
  if (!zone) return;

  if (confirm(`Are you sure you want to delete ${code} from ${zone.name}?`)) {
    delete zone.couriers[code];
    renderRatesEditorTable();
  }
}

async function resetDefaultRates() {
  if (!confirm("Reset all rates back to factory defaults?")) return;
  localStorage.removeItem("agdl_custom_zones");
  appData.destination_zones = JSON.parse(JSON.stringify(BUNDLED_DEFAULT_DATA.destination_zones || {}));
  renderRatesEditorTable();
  populateCourierDropdown();
  triggerCalculation();
  showToast("Rates reset to defaults.", "info");
}

function openExchangeModal() {
  const modal = document.getElementById("exchangeModal");
  const input = document.getElementById("customExchangeInput");
  if (modal && input) {
    input.value = appData.settings.live_exchange_rate || 123.83;
    modal.classList.remove("hidden");
  }
}

function closeExchangeModal() {
  const modal = document.getElementById("exchangeModal");
  if (modal) modal.classList.add("hidden");
}

async function fetchLiveExchangeRate() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (res.ok) {
      const data = await res.json();
      const bdt = data.rates?.BDT;
      if (bdt && !appData.settings.is_manual_exchange) {
        appData.settings.live_exchange_rate = Number(bdt.toFixed(2));
        updateExchangeBadge(appData.settings.live_exchange_rate, false);
        performCalculation();
      }
    }
  } catch (e) {}
}

async function refreshExchangeRate() {
  const icon = document.getElementById("refreshRateIcon");
  if (icon) icon.classList.add("spin-animation");

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    const bdt = data.rates?.BDT;
    if (bdt) {
      appData.settings.live_exchange_rate = Number(bdt.toFixed(2));
      appData.settings.is_manual_exchange = false;
      localStorage.removeItem("agdl_custom_exchange");
      updateExchangeBadge(appData.settings.live_exchange_rate, false);
      triggerCalculation();
      showToast(`Exchange rate updated: $1 = ৳ ${appData.settings.live_exchange_rate} (Live API)`, "success");
    }
  } catch (e) {
    showToast("Error updating rate: " + e.message, "error");
  } finally {
    if (icon) setTimeout(() => icon.classList.remove("spin-animation"), 600);
  }
}

async function saveCustomExchangeRate() {
  const input = document.getElementById("customExchangeInput");
  const val = parseFloat(input?.value);
  if (!val || val <= 0) {
    showToast("Please enter a valid rate", "error");
    return;
  }

  appData.settings.live_exchange_rate = val;
  appData.settings.is_manual_exchange = true;
  localStorage.setItem("agdl_custom_exchange", val.toString());
  updateExchangeBadge(val, true);
  closeExchangeModal();
  triggerCalculation();
  showToast(`Custom exchange rate applied: ৳ ${val}`, "success");
}

async function setLiveExchangeRate() {
  localStorage.removeItem("agdl_custom_exchange");
  appData.settings.is_manual_exchange = false;
  closeExchangeModal();
  refreshExchangeRate();
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  const bgColors = {
    success: "bg-emerald-800 text-white border-emerald-700",
    error: "bg-rose-800 text-white border-rose-700",
    info: "bg-blue-900 text-white border-blue-800"
  };

  const icons = {
    success: '<i class="fa-solid fa-circle-check text-emerald-400"></i>',
    error: '<i class="fa-solid fa-circle-exclamation text-rose-400"></i>',
    info: '<i class="fa-solid fa-circle-info text-blue-300"></i>'
  };

  toast.className = `${bgColors[type] || bgColors.info} border px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all transform translate-y-2 opacity-0 duration-200`;
  toast.innerHTML = `${icons[type] || icons.info} <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}
