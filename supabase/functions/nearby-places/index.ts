import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY") ?? "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Coordenadas de ciudades colombianas como fallback
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "pereira":     { lat: 4.8133,  lng: -75.6961 },
  "medellín":    { lat: 6.2442,  lng: -75.5812 },
  "medellin":    { lat: 6.2442,  lng: -75.5812 },
  "bogotá":      { lat: 4.7110,  lng: -74.0721 },
  "bogota":      { lat: 4.7110,  lng: -74.0721 },
  "cali":        { lat: 3.4516,  lng: -76.5320 },
  "barranquilla":{ lat: 10.9685, lng: -74.7813 },
  "cartagena":   { lat: 10.3910, lng: -75.4794 },
  "manizales":   { lat: 5.0703,  lng: -75.5138 },
  "armenia":     { lat: 4.5339,  lng: -75.6811 },
  "bucaramanga": { lat: 7.1193,  lng: -73.1227 },
  "cucuta":      { lat: 7.8939,  lng: -72.5078 },
  "cúcuta":      { lat: 7.8939,  lng: -72.5078 },
  "ibague":      { lat: 4.4389,  lng: -75.2322 },
  "ibagué":      { lat: 4.4389,  lng: -75.2322 },
  "villavicencio":{ lat: 4.1420, lng: -73.6266 },
  "santa marta": { lat: 11.2408, lng: -74.2110 },
  "pasto":       { lat: 1.2136,  lng: -77.2811 },
  "montería":    { lat: 8.7575,  lng: -75.8857 },
  "monteria":    { lat: 8.7575,  lng: -75.8857 },
  "neiva":       { lat: 2.9273,  lng: -75.2819 },
  "popayán":     { lat: 2.4448,  lng: -76.6147 },
  "popayan":     { lat: 2.4448,  lng: -76.6147 },
  "sincelejo":   { lat: 9.3047,  lng: -75.3978 },
  "valledupar":  { lat: 10.4631, lng: -73.2532 },
  "rionegro":    { lat: 6.1546,  lng: -75.3741 },
  "dosquebradas":{ lat: 4.8390,  lng: -75.6680 },
};

function metersToText(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_MAP: Record<string, { icon: string; label: string; priority: number }> = {
  shopping_mall:          { icon: "ri-shopping-bag-line",    label: "Centro Comercial",   priority: 1 },
  supermarket:            { icon: "ri-shopping-cart-line",   label: "Supermercado",       priority: 2 },
  grocery_or_supermarket: { icon: "ri-shopping-cart-line",   label: "Supermercado",       priority: 2 },
  hospital:               { icon: "ri-hospital-line",        label: "Hospital / Clínica", priority: 3 },
  school:                 { icon: "ri-school-line",          label: "Colegio",            priority: 4 },
  university:             { icon: "ri-graduation-cap-line",  label: "Universidad",        priority: 4 },
  transit_station:        { icon: "ri-bus-line",             label: "Transporte Público", priority: 5 },
  bus_station:            { icon: "ri-bus-line",             label: "Estación de Bus",    priority: 5 },
  subway_station:         { icon: "ri-train-line",           label: "Metro / MIO",        priority: 5 },
  park:                   { icon: "ri-plant-line",           label: "Parque",             priority: 6 },
  pharmacy:               { icon: "ri-medicine-bottle-line", label: "Farmacia",           priority: 7 },
  bank:                   { icon: "ri-bank-line",            label: "Banco",              priority: 8 },
  restaurant:             { icon: "ri-restaurant-line",      label: "Restaurante",        priority: 9 },
  gym:                    { icon: "ri-run-line",             label: "Gimnasio",           priority: 10 },
  convenience_store:      { icon: "ri-store-2-line",         label: "Tienda",             priority: 11 },
};

function getBestTypeInfo(types: string[]): { icon: string; label: string; priority: number } | null {
  let best: { icon: string; label: string; priority: number } | null = null;
  for (const t of types) {
    const info = TYPE_MAP[t];
    if (info && (!best || info.priority < best.priority)) best = info;
  }
  return best;
}

async function searchNearby(lat: number, lng: number, type: string, radius: number): Promise<any[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}&language=es`;
    const res = await fetch(url);
    const text = await res.text();
    console.log(`[searchNearby] type=${type} httpStatus=${res.status} snippet=${text.slice(0, 200)}`);
    if (!res.ok) return [];
    const data = JSON.parse(text);
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error(`[searchNearby] API error type=${type} status=${data.status} msg=${data.error_message ?? ""}`);
    }
    return data.results ?? [];
  } catch (e) {
    console.error(`[searchNearby] exception type=${type}`, e);
    return [];
  }
}

async function geocodeAddress(parts: string[]): Promise<{ lat: number; lng: number } | null> {
  const address = encodeURIComponent(parts.filter(Boolean).join(", "));
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_API_KEY}&language=es`;
  console.log(`[geocode] Trying: ${parts.filter(Boolean).join(", ")}`);
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`[geocode] httpStatus=${res.status} snippet=${text.slice(0, 400)}`);
    if (!res.ok) return null;
    const data = JSON.parse(text);
    if (data.status === "OK" && data.results?.length) {
      const loc = data.results[0].geometry.location;
      console.log(`[geocode] SUCCESS lat=${loc.lat} lng=${loc.lng}`);
      return loc as { lat: number; lng: number };
    }
    console.error(`[geocode] failed status=${data.status} error=${data.error_message ?? "none"}`);
    return null;
  } catch (e) {
    console.error("[geocode] exception", e);
    return null;
  }
}

function getCityFallback(city: string): { lat: number; lng: number } | null {
  if (!city) return null;
  const key = city.toLowerCase().trim();
  return CITY_COORDS[key] ?? null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();
    console.log("[nearby-places] body:", bodyText);

    let body: any = {};
    try { body = JSON.parse(bodyText); } catch (_) {
      return new Response(
        JSON.stringify({ error: "JSON inválido en el body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { neighborhood, city, department } = body;

    if (!neighborhood && !city) {
      return new Response(
        JSON.stringify({ error: "Se requiere neighborhood o city" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Intentar geocodificar con múltiples variaciones
    let coords: { lat: number; lng: number } | null = null;
    let coordSource = "";

    // Intento 1: barrio + ciudad + departamento + Colombia
    if (!coords && neighborhood && city) {
      coords = await geocodeAddress([neighborhood, city, department, "Colombia"]);
      if (coords) coordSource = "neighborhood+city+dept";
    }

    // Intento 2: barrio + ciudad + Colombia (sin departamento)
    if (!coords && neighborhood && city) {
      coords = await geocodeAddress([neighborhood, city, "Colombia"]);
      if (coords) coordSource = "neighborhood+city";
    }

    // Intento 3: solo ciudad + departamento + Colombia
    if (!coords && city) {
      coords = await geocodeAddress([city, department, "Colombia"]);
      if (coords) coordSource = "city+dept";
    }

    // Intento 4: solo ciudad + Colombia
    if (!coords && city) {
      coords = await geocodeAddress([city, "Colombia"]);
      if (coords) coordSource = "city only";
    }

    // Intento 5: fallback con coordenadas conocidas de la ciudad
    if (!coords && city) {
      const fallback = getCityFallback(city);
      if (fallback) {
        coords = fallback;
        coordSource = "city hardcoded fallback";
        console.log(`[nearby-places] Using hardcoded coords for city="${city}"`);
      }
    }

    if (!coords) {
      console.error(`[nearby-places] All geocoding attempts failed for: ${[neighborhood, city, department].filter(Boolean).join(", ")}`);
      return new Response(
        JSON.stringify({
          error: "No se pudo geocodificar la dirección",
          address: [neighborhood, city, department, "Colombia"].filter(Boolean).join(", "),
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { lat, lng } = coords;
    console.log(`[nearby-places] coords lat=${lat} lng=${lng} source=${coordSource}`);

    const typesToSearch = [
      "shopping_mall",
      "hospital",
      "school",
      "transit_station",
      "supermarket",
      "park",
      "pharmacy",
      "bank",
    ];

    const results = await Promise.all(
      typesToSearch.map((type) => searchNearby(lat, lng, type, 2000))
    );

    const counts = typesToSearch.map((t, i) => `${t}:${results[i].length}`).join(", ");
    console.log(`[nearby-places] counts: ${counts}`);

    interface Candidate {
      name: string; icon: string; label: string; priority: number; distance: number;
    }

    const candidates: Candidate[] = [];
    const seenNames = new Set<string>();

    for (let i = 0; i < typesToSearch.length; i++) {
      for (const place of results[i].slice(0, 3)) {
        const name: string = place.name;
        if (seenNames.has(name)) continue;
        const typeInfo = getBestTypeInfo(place.types ?? []);
        if (!typeInfo) continue;
        const dist = calcDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
        seenNames.add(name);
        candidates.push({ name, icon: typeInfo.icon, label: typeInfo.label, priority: typeInfo.priority, distance: dist });
      }
    }

    candidates.sort((a, b) => a.priority - b.priority || a.distance - b.distance);

    const finalPlaces: Array<{ icon: string; name: string; distance: string; type: string }> = [];
    const usedLabels = new Set<string>();

    for (const c of candidates) {
      if (finalPlaces.length >= 4) break;
      if (usedLabels.has(c.label)) continue;
      usedLabels.add(c.label);
      finalPlaces.push({ icon: c.icon, name: c.name, distance: metersToText(c.distance), type: c.label });
    }

    if (finalPlaces.length < 4) {
      for (const c of candidates) {
        if (finalPlaces.length >= 4) break;
        if (finalPlaces.some((p) => p.name === c.name)) continue;
        finalPlaces.push({ icon: c.icon, name: c.name, distance: metersToText(c.distance), type: c.label });
      }
    }

    console.log(`[nearby-places] finalPlaces=${JSON.stringify(finalPlaces)}`);

    return new Response(
      JSON.stringify({ places: finalPlaces, coordinates: { lat, lng }, total_candidates: candidates.length, coord_source: coordSource }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[nearby-places] unhandled error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
