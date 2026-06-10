/* === Analytics service ===
   One place all tracking flows through. Every track() call goes to:

   1. The LOCAL EVENT LOG (localStorage) — always on. This is what
      powers the in-app admin dashboard (#admin) on this device.
   2. The CLOUD MIRROR (Supabase) — on when configured, see
      Services/backend.js. Makes the admin dashboard island-wide.
   3. An optional third-party provider (PostHog/GA4) — off until
      wired below, and gated behind cookie consent.

   Vercel Analytics (page views only) is separate, in main.jsx.

   Usage in components:
     import { track, identify } from "../Services/analytics.js";
     track("game_start", { player, difficulty });
     identify(username);              // after signup/login */

import { sendEvent } from "./backend.js";

const DEBUG = import.meta.env.DEV;

/* === Local event log === */
const LOG_KEY = "gb_events_v1";
const MAX_EVENTS = 1000; // oldest events fall off after this

function appendToLocalLog(entry) {
  try {
    const log = JSON.parse(localStorage.getItem(LOG_KEY)) ?? [];
    log.push(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-MAX_EVENTS)));
  } catch {
    /* storage full or blocked — tracking must never break the game */
  }
}

/* Used by the admin dashboard. Newest first. */
export function getLocalEvents() {
  try {
    return (JSON.parse(localStorage.getItem(LOG_KEY)) ?? []).reverse();
  } catch {
    return [];
  }
}

/* --- Consent gate (required for EU visitors / app store rules) ---
   Only gates the THIRD-PARTY provider. Our own first-party event
   log + backend mirror don't need cookie consent (no cookies, no
   cross-site tracking). Call setConsent(true) from a banner. */
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

/* === Track an event === */
export const track = (event, properties = {}) => {
  const entry = { t: Date.now(), type: event, data: properties };

  if (DEBUG) console.log("[analytics]", event, properties);

  appendToLocalLog(entry); // powers #admin on this device
  sendEvent(entry); // cloud mirror (no-op until Supabase is configured)

  if (!consentGiven || !provider) return;
  provider.capture(event, properties);
};

/* === Identify the player (after login/signup) === */
export const identify = (username) => {
  if (DEBUG) console.log("[analytics] identify:", username);
  if (!consentGiven || !provider) return;
  provider.identify(username);
};
