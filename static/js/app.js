/**
 * AMAN GRAPHICS AND DESIGNS LTD.
 * Dynamic Courier Cost & Work Order (WO) Calculation Engine
 */

let appData = {
  settings: {},
  destination_zones: {},
  currentQuotes: [],
  selectedQuote: null,
  activeZoneId: "china_hk"
};

let calcDebounceTimer = null;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadInitialData();
});

async function loadInitialData() {
  try {
    const res = await fetch("/api/rates");
    const data = await res.json();
    appData.settings = data.settings || {};
    appData.destination_zones = data.destination_zones || {};

    // Restore any client-side saved customizations (Vercel cloud resilience)
    const localZones = localStorage.getItem('agdl_custom_zones');
    if (localZones) {
      try {
        const parsed = JSON.parse(localZones);
        appData.destination_zones = { ...appData.destination_zones, ...parsed };
      } catch (e) {}
    }

    appData.activeZoneId = appData.settings.default_zone || "china_hk";

    updateExchangeBadge(appData.settings.live_exchange_rate, appData.settings.is_manual_exchange);

    // Set default origin and destination
    const originInput = document.getElementById("inputOrigin");
    if (originInput && !originInput.value) {
      originInput.value = "China (Guangzhou / Shanghai / Ningbo)";
    }

    const destInput = document.getElementById("inputDestination");
    if (destInput && !destInput.value) {
      destInput.value = "Gazipur, Bangladesh (Aman Graphics & Designs Ltd - Factory)";
    }

    const zoneSelect = document.getElementById("selectTariffZone");
    if (zoneSelect) zoneSelect.value = appData.activeZoneId;

    populateCourierDropdown();
    triggerCalculation();
  } catch (err) {
    showToast("Error loading rate cards: " + err.message, "error");
  }
}

function updateExchangeBadge(rate, isManual) {
  const badge = document.getElementById("headerExchangeRate");
  if (badge) {
    badge.innerText = `৳ ${Number(rate).toFixed(2)}${isManual ? ' (Manual)' : ''}`;
  }
}

function getEffectiveOrigin() {
  const input = document.getElementById("inputOrigin");
  return input?.value?.trim() || "China (Guangzhou / Shanghai / Ningbo)";
}

function getEffectiveDestination() {
  const input = document.getElementById("inputDestination");
  return input?.value?.trim() || "Gazipur, Bangladesh (Aman Graphics & Designs Ltd - Factory)";
}

function selectOrigin(country, defaultCity, zoneId) {
  const input = document.getElementById("inputOrigin");
  if (input) {
    if (country.startsWith("BD ")) {
      input.value = `${country.replace('BD ', '')}: ${defaultCity}`;
    } else {
      input.value = `${country} (${defaultCity})`;
    }
  }

  // Update origin pills UI
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

  // If origin is international, set zone to that country's zone
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

  // Update buyer notice
  const notice = document.getElementById("activeBuyerNotice");
  if (notice) {
    notice.innerHTML = `<span class="text-indigo-900 font-black">⭐ Account: ${buyerName}</span>`;
  }

  // Highlight active buyer pill
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

  // Deselect destination country pills
  document.querySelectorAll(".dest-pill").forEach(p => {
    p.classList.remove("active", "bg-blue-600", "text-white", "border-blue-600");
    p.classList.add("bg-slate-100", "text-slate-700");
  });

  // Switch to export mode if origin is currently not BD
  const originVal = document.getElementById("inputOrigin")?.value || "";
  if (!originVal.toLowerCase().includes("bangladesh") && !originVal.toLowerCase().includes("factory") && !originVal.toLowerCase().includes("ho")) {
    const originInput = document.getElementById("inputOrigin");
    if (originInput) originInput.value = "Gazipur, Bangladesh (Aman Graphics & Designs Ltd - Factory)";
    highlightPillByText(".origin-pill", "BD Factory");
    
    const btnImport = document.getElementById("btnModeImport");
    const btnExport = document.getElementById("btnModeExport");
    btnExport?.classList.add("bg-blue-600", "text-white", "shadow-sm");
    btnExport?.classList.remove("text-slate-600");
    btnImport?.classList.remove("bg-blue-600", "text-white", "shadow-sm");
    btnImport?.classList.add("text-slate-600");
  }

  // Update zone
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

  // Deselect buyer pills
  document.querySelectorAll(".buyer-pill").forEach(p => {
    p.classList.remove("bg-indigo-600", "text-white", "border-indigo-600", "shadow");
    p.classList.add("bg-white", "text-slate-800", "border-slate-200");
  });

  const input = document.getElementById("inputDestination");
  if (input) {
    if (country.startsWith("BD ")) {
      input.value = `${country.replace('BD ', '')}: ${defaultCity}`;
    } else {
      input.value = `${country} (${defaultCity})`;
    }
  }

  // Update dest pills UI
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

  // If destination is international, set zone to that country's zone
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
    if (destRole) destRole.innerText = "Factory Consignee";

    document.getElementById("inputOrigin").value = "China (Guangzhou / Shanghai / Ningbo)";
    document.getElementById("inputDestination").value = "Gazipur, Bangladesh (Aman Graphics & Designs Ltd - Factory)";
    appData.activeZoneId = "china_hk";

    // Set origin pill to China, dest pill to BD Factory
    highlightPillByText(".origin-pill", "China");
    highlightPillByText(".dest-pill", "BD Factory");
  } else {
    btnExport?.classList.add("bg-blue-600", "text-white", "shadow-sm");
    btnExport?.classList.remove("text-slate-600");
    btnImport?.classList.remove("bg-blue-600", "text-white", "shadow-sm");
    btnImport?.classList.add("text-slate-600");

    if (originRole) originRole.innerText = "Shipper / Factory";
    if (destRole) destRole.innerText = "Buyer / Foreign Consignee";

    document.getElementById("inputOrigin").value = "Dhaka, Bangladesh (Aman Graphics & Designs Ltd - HO)";
    document.getElementById("inputDestination").value = "United States (New York / Los Angeles / Dallas)";
    appData.activeZoneId = "usa_canada";

    // Set origin pill to BD HO, dest pill to USA
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

  // Toggle mode button appearance based on new destination
  const isNowImport = inputDest.value.toLowerCase().includes("bangladesh") || inputDest.value.toLowerCase().includes("factory") || inputDest.value.toLowerCase().includes("ho");
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

function triggerCalculation() {
  clearTimeout(calcDebounceTimer);
  calcDebounceTimer = setTimeout(performCalculation, 100);
}

async function performCalculation() {
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

  // Volumetric weight display
  const volWeight = length > 0 && width > 0 && height > 0 ? (length * width * height) / 5000 : 0;
  const volDisplay = document.getElementById("volWeightDisplay");
  if (volDisplay) {
    volDisplay.innerText = `${volWeight.toFixed(2)} Kg`;
  }

  const chargeableWeight = Math.max(weight, volWeight);
  const chargeableDisplay = document.getElementById("chargeableWeightDisplay");
  if (chargeableDisplay) {
    chargeableDisplay.innerText = `${chargeableWeight.toFixed(2)} Kg`;
  }

  try {
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: weight,
        length: length,
        width: width,
        height: height,
        origin: origin,
        destination: destination,
        zone_id: zoneId,
        apply_fuel: applyFuel,
        handling_fee: handlingFee,
        courier: courierFilter,
        buyer_name: appData.selectedBuyer || null
      })
    });

    const result = await response.json();
    if (!result.success) return;

    appData.currentQuotes = result.all_quotes || [];
    renderQuotes(result);
  } catch (e) {
    console.error("Calculation failed:", e);
  }
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
    routeSubhead.innerText = `Route: ${data.input.origin.split('(')[0].trim()} ➔ ${data.input.destination} (${data.input.zone_name})`;
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

  const isImport = quote.destination.toLowerCase().includes("bangladesh") || quote.destination.toLowerCase().includes("factory") || quote.destination.toLowerCase().includes("ho");
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

async function exportQuoteObj(quote) {
  try {
    showToast("Generating Excel file...", "info");
    const quoteWithEx = { ...quote, exchange_rate: appData.settings.live_exchange_rate || 123.83 };
    const res = await fetch("/api/export-excel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quote: quoteWithEx })
    });

    if (!res.ok) throw new Error("Server error generating Excel");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AGDL_Courier_Quote_${quote.courier_code}_${quote.chargeable_weight_kg}Kg.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Excel Work Order downloaded!", "success");
  } catch (e) {
    showToast("Excel download error: " + e.message, "error");
  }
}

async function syncToDesktopExcel() {
  if (!confirm("This will safely update your desktop file 'All Courrier Cost Calculation.xlsx' with the latest rates and create an automatic backup. Proceed?")) {
    return;
  }

  showToast("Updating desktop Excel file...", "info");
  try {
    const res = await fetch("/api/sync-to-excel", { method: "POST" });
    const result = await res.json();
    if (result.success) {
      showToast("Desktop Excel updated! Backup created.", "success");
    } else {
      showToast("Sync note: " + result.message, "error");
    }
  } catch (e) {
    showToast("Sync error: " + e.message, "error");
  }
}

/* Rate Card Management Modal */
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

  // Save client-side for cloud / Vercel persistence
  localStorage.setItem('agdl_custom_zones', JSON.stringify(appData.destination_zones));

  try {
    const res = await fetch("/api/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination_zones: appData.destination_zones,
        settings: appData.settings
      })
    });

    const result = await res.json();
    if (result.success) {
      showToast(`Rate cards for ${zone.name} saved successfully!`, "success");
      closeRatesModal();
      populateCourierDropdown();
      triggerCalculation();
    } else {
      showToast("Error saving rates: " + result.error, "error");
    }
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
  localStorage.removeItem('agdl_custom_zones');
  await loadInitialData();
  renderRatesEditorTable();
  showToast("Rates reset to defaults.", "info");
}

/* Exchange Rate Modal & Actions */
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

async function refreshExchangeRate() {
  const icon = document.getElementById("refreshRateIcon");
  if (icon) icon.classList.add("spin-animation");

  try {
    const res = await fetch("/api/exchange-rate?refresh=1");
    const data = await res.json();
    appData.settings.live_exchange_rate = data.rate;
    appData.settings.is_manual_exchange = data.is_manual;
    updateExchangeBadge(data.rate, data.is_manual);
    triggerCalculation();
    showToast(`Exchange rate updated: $1 = ৳ ${data.rate} (${data.source})`, "success");
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

  try {
    const res = await fetch("/api/exchange-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rate: val })
    });
    const data = await res.json();
    appData.settings.live_exchange_rate = data.rate;
    appData.settings.is_manual_exchange = true;
    updateExchangeBadge(data.rate, true);
    closeExchangeModal();
    triggerCalculation();
    showToast(`Custom exchange rate applied: ৳ ${data.rate}`, "success");
  } catch (e) {
    showToast("Error saving rate: " + e.message, "error");
  }
}

async function setLiveExchangeRate() {
  try {
    const res = await fetch("/api/exchange-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rate: null })
    });
    const data = await res.json();
    appData.settings.live_exchange_rate = data.rate;
    appData.settings.is_manual_exchange = false;
    updateExchangeBadge(data.rate, false);
    closeExchangeModal();
    triggerCalculation();
    showToast(`Switched back to Live Market Rate: ৳ ${data.rate}`, "success");
  } catch (e) {
    showToast("Error resetting rate: " + e.message, "error");
  }
}

/* Toast Notifications */
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
