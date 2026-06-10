/* === Analytics service ===
   One place all tracking flows through, so the provider can be
   swapped without touching game code.

   Usage in components:
     import { track, identify } from "../Services/analytics.js";
     track("game_start", { difficulty });
     track("game_over", { score, correct, difficulty });
     identify(username);              // after signup/login

   Wire a real provider below (PostHog shown; GA4 works the same
   way). Until one is configured, events log to the console in dev
   and no-op in production. Vercel Analytics (page views) is wired
   separately in main.jsx. */

const DEBUG = import.meta.env.DEV;

/* --- Consent gate (required for EU visitors / app store rules) ---
   Call setConsent(true) from your cookie/consent banner. Events
   fired before consent are dropped, not queued. */
let consentGiven = false;
export const setConsent = (value) => {
  consentGiven = value;
};

/* --- Provider hookup ---
   PostHog example:
     npm install posthog-js
     import posthog from "posthog-js";
     posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
       api_host: "https://eu.posthog.com",
     });
   then set provider = posthog below.                              */
const provider = null; // ← replace with posthog (or a GA4 wrapper)

export const track = (event, properties = {}) => {
  if (DEBUG) console.log("[analytics]", event, properties);
  if (!consentGiven || !provider) return;
  provider.capture(event, properties);
};

export const identify = (username) => {
  if (DEBUG) console.log("[analytics] identify:", username);
  if (!consentGiven || !provider) return;
  provider.identify(username);
};
