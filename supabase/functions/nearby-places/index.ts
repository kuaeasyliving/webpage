import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_API_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLACE_TYPES = [
  { type: "shopping_mall", icon: "ri-shopping-bag-line", label: "Centro Comercial" },
  { type: "supermarket", icon: "ri-shopping-cart-line", label: "Supermercado" },
  { type: "hospital", icon: "ri-hospital-line", label: "Hospital / Clínica" },
  { type: "school", icon: "ri-school-line", label: "Colegio / Universidad" },
  { type: "university", icon: "ri-graduation-cap-line", label: "Universidad" },
  { type: "transit_station", icon: "ri-bus-line", label: "Transporte Público" },
  { type: "bus_station", icon: "ri-bus-line", label: "Estación de Bus" },
  { type: "park", icon: "ri-plant-line", label: "Parque" },
  { type: "restaurant", icon: "ri-restaurant-line", label: "Restaurante" },
  { type: "pharmacy", icon: "ri-medicine-bottle-line", label: "Farmacia" },
  { type: "bank", icon: "ri-bank-line", label: "Banco" },
  { type: "gym", icon: "ri-run-line", label: "Gimnasio" },
];

function metersToText(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { neighborhood, city, department } = await req.json();

    if (!neighborhood && !city) {
      return new Response(JSON.stringify({ error: "Se requiere neighborhood o city" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Geocodificar la dirección
    const address = encodeURIComponent(`${neighborhood || ""}, ${city || ""}, ${department || ""}, Colombia`);
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_API_KEY}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return new Response(JSON.stringify({ error: "No se pudo geocodificar la dirección", geoStatus: geoData.status }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // 2. Buscar puntos de interés por categorías priorizadas
    const results: Array<{ icon: string; name: string; distance: string; type: string }> = [];
    const seenNames = new Set<string>();

    for (const placeType of PLACE_TYPES) {
      if (results.length >= 4) break;

      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=${placeType.type}&key=${GOOGLE_API_KEY}&language=es`;
      const placesRes = await fetch(placesUrl);
      const placesData = await placesRes.json();

      if (placesData.results && placesData.results.length > 0) {
        const best = placesData.results[0];
        const name = best.name;

        if (!seenNames.has(name)) {
          seenNames.add(name);

          const placeLat = best.geometry.location.lat;
          const placeLng = best.geometry.location.lng;
          const R = 6371000;
          const dLat = ((placeLat - lat) * Math.PI) / 180;
          const dLng = ((placeLng - lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) *
              Math.cos((placeLat * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distanceMeters = R * c;

          results.push({
            icon: placeType.icon,
            name,
            distance: metersToText(distanceMeters),
            type: placeType.label,
          });
        }
      }
    }

    return new Response(JSON.stringify({ places: results, coordinates: { lat, lng } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
