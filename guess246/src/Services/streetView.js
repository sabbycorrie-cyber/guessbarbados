/* === Street View service ===
   Builds Google Street View Static API URLs and checks that imagery
   actually exists for a location before we use it in a round. */

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* Build a Street View image URL.
   radius=1000 makes Google snap to the nearest covered road within
   1km, so slightly-off coordinates still return imagery.
   (No source=outdoor — most Barbados panos aren't tagged outdoor
   and the filter returns ZERO_RESULTS for them.) */
export function getStreetViewURL(place, { fov = 90, size = "640x400" } = {}) {
  const { lat, lon, heading, pitch } = place;
  return (
    "https://maps.googleapis.com/maps/api/streetview" +
    `?size=${size}&location=${lat},${lon}&fov=${fov}` +
    `&heading=${heading ?? 120}&pitch=${pitch ?? 0}` +
    `&radius=1000&key=${API_KEY}`
  );
}

/* The metadata endpoint is free — use it to confirm a pano exists
   so players never see Google's grey "no imagery" placeholder. */
export async function hasStreetView(place) {
  try {
    const res = await fetch(
      "https://maps.googleapis.com/maps/api/streetview/metadata" +
        `?location=${place.lat},${place.lon}&radius=1000&key=${API_KEY}`
    );
    const data = await res.json();
    return data.status === "OK";
  } catch {
    return true; // network hiccup — let the image request try anyway
  }
}
