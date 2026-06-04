/* === Access API Key ===
Gets Google Maps API key from env. file */
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* === Street Vie URL Builder ===
Creates Google Street View image URL using 
location coordinates + heading */
    export function  getStreetViewURL(lat, lon, heading) {
        return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lon}&fov=90&heading=${heading ?? 120}&pitch=0&key=${API_KEY}`;
    }
