/* === Game data ===
   Locations grouped by difficulty + the rules for each difficulty.
   Coordinates sit on main roads so Street View imagery is available;
   the streetView service also snaps to the nearest pano (radius param)
   and validates imagery before a round starts. */

export const PLACES = {
  easy: [
    { street: "Bay Street", parish: "St. Michael", lat: 13.0888177, lon: -59.6087478, heading: 19.02, pitch: -10.19 },
    { street: "Broad Street", parish: "St. Michael", lat: 13.0974887, lon: -59.6164418, heading: 32.18, pitch: 14.83 },
    { street: "Roebuck Street", parish: "St. Michael", lat: 13.1024068, lon: -59.6103241, heading: 263.31, pitch: -6.27 },
    { street: "Upper Collymore Rock", parish: "St. Michael", lat: 13.0935766, lon: -59.5959958, heading: 79.37 },
    { street: "Spring Garden Highway", parish: "St. Michael", lat: 13.1166232, lon: -59.6267809, heading: 204.86 },
    { street: "Holetown", parish: "St. James", lat: 13.1866016, lon: -59.6365115, heading: 33.72, pitch: -5 },
    { street: "Carlisle Bay", parish: "St. Michael", lat: 13.086209, lon: -59.6092, heading: 253.45, pitch: 12.04 },
    { street: "Rockley", parish: "Christ Church", lat: 13.0746696, lon: -59.5891528, heading: 139.32 },
    { street: "Oistins Main Road", parish: "Christ Church", lat: 13.0639, lon: -59.5426, heading: 100 },
    { street: "St. Lawrence Gap", parish: "Christ Church", lat: 13.0689183, lon: -59.575756, heading: 126.84, pitch: 3.98 },
    { street: "Queen Street, Speightstown", parish: "St. Peter", lat: 13.2503, lon: -59.6438, heading: 10 },
    { street: "Warrens", parish: "St. Michael", lat: 13.128, lon: -59.612, heading: 200 },
    { street: "Rihanna Drive", parish: "St. Michael", lat: 13.1088517, lon: -59.6219301, heading: 130, pitch: 2.79 },
  ],

  medium: [
    { street: "Hastings Main Road", parish: "Christ Church", lat: 13.0716, lon: -59.599, heading: 120 },
    { street: "Worthing Main Road", parish: "Christ Church", lat: 13.0667, lon: -59.5837, heading: 95 },
    { street: "Sunset Crest", parish: "St. James", lat: 13.183, lon: -59.637, heading: 340 },
    { street: "Black Rock Main Road", parish: "St. Michael", lat: 13.1245, lon: -59.628, heading: 30 },
    { street: "Eagle Hall", parish: "St. Michael", lat: 13.106, lon: -59.621, heading: 290 },
    { street: "Six Cross Roads", parish: "St. Philip", lat: 13.0936, lon: -59.4757, heading: 60 },
    { street: "Gun Hill", parish: "St. George", lat: 13.1419487, lon: -59.5556811, heading: 342.45, pitch: 0 },
    { street: "Highway 2A", parish: "St. Thomas", lat: 13.166, lon: -59.607, heading: 15 },
    { street: "Mile and a Quarter", parish: "St. Peter", lat: 13.238, lon: -59.623, heading: 320 },
    { street: "Belleplaine", parish: "St. Andrew", lat: 13.2437, lon: -59.556, heading: 70 },
    { street: "University Hill, Cave Hill", parish: "St. Michael", lat: 13.134, lon: -59.63, heading: 250 },
    { street: "Silver Sands", parish: "Christ Church", lat: 13.046, lon: -59.53, heading: 250 },
    { street: "Highway 6, Balls", parish: "Christ Church", lat: 13.0876228, lon: -59.5196682, heading: 59.33, pitch: 0.74 },
    { street: "Errol Barrow Highway", parish: "Christ Church", lat: 13.0863373, lon: -59.5772122, heading: 15.91, pitch: 0.91 },
    { street: "Bathsheba", parish: "St. Joseph", lat: 13.2106736, lon: -59.5170035, heading: 326.46, pitch: -6.8 },
    { street: "Cherry Tree Hill", parish: "St. Andrew", lat: 13.2735703, lon: -59.584944, heading: 121.69, pitch: -6.56 },
    { street: "Farley Hill", parish: "St. Peter", lat: 13.2660748, lon: -59.5953603, heading: 140.86, pitch: 0 },
    { street: "Welchman Hall", parish: "St. Thomas", lat: 13.184812, lon: -59.5726772, heading: 272.37, pitch: -6.6 },
  ],

  hard: [
    { street: "North Point Road", parish: "St. Lucy", lat: 13.337, lon: -59.61, heading: 350 },
    { street: "Codrington College Road", parish: "St. John", lat: 13.174, lon: -59.474, heading: 140 },
    { street: "Martin's Bay", parish: "St. John", lat: 13.1979994, lon: -59.495814, heading: 87.44, pitch: 0 },
    { street: "Long Bay, Sam Lord's", parish: "St. Philip", lat: 13.106, lon: -59.435, heading: 110 },
    { street: "Crane Beach Road", parish: "St. Philip", lat: 13.099, lon: -59.449, heading: 160 },
    { street: "Checker Hall", parish: "St. Lucy", lat: 13.311, lon: -59.638, heading: 200 },
    { street: "Hillaby", parish: "St. Thomas", lat: 13.203, lon: -59.587, heading: 310 },
    { street: "Four Roads", parish: "St. John", lat: 13.1700743, lon: -59.5220727, heading: 247.86, pitch: -0.15 },
    { street: "Shorey Village", parish: "St. Andrew", lat: 13.23, lon: -59.564, heading: 35 },
    { street: "Pie Corner", parish: "St. Lucy", lat: 13.321, lon: -59.595, heading: 270 },
    { street: "Dukes Hill", parish: "St. Thomas", lat: 13.1821713, lon: -59.5965515, heading: 89.63, pitch: 2.57 },
    { street: "St. Swithins", parish: "St. Lucy", lat: 13.3181512, lon: -59.6237742, heading: 100, pitch: 0 },
    { street: "Ellerton", parish: "St. George", lat: 13.1322844, lon: -59.5376777, heading: 83.97, pitch: 2.01 },
    { street: "Three Houses", parish: "St. Philip", lat: 13.1584531, lon: -59.4596342, heading: 193.13, pitch: -17.16 },
    { street: "Skeete's Bay", parish: "St. Philip", lat: 13.1684372, lon: -59.4483504, heading: 48.12, pitch: 0 },
    { street: "Sherman Hall Moon Fort", parish: "St. Peter", lat: 13.2742861, lon: -59.6466728, heading: 212.85, pitch: -1.38 },
    { street: "Thunder Bay", parish: "St. James", lat: 13.2198555, lon: -59.6415461, heading: 11.16, pitch: 0.73 },
    { street: "Inch Marlow", parish: "Christ Church", lat: 13.0530398, lon: -59.5054981, heading: 151.41, pitch: -4.85 },
  ],
};

/* Rules per difficulty:
   - rounds:   rounds per game
   - options:  answer buttons shown
   - timer:    seconds per round (null = untimed)
   - base:     points for a correct answer
   - fov:      Street View field of view — narrower = more zoomed in = harder */
export const DIFFICULTY = {
  easy: {
    id: "easy",
    label: "Easy",
    tagline: "Town an' tourist spots",
    blurb: "Famous roads, no clock. A lil limin' warm-up.",
    rounds: 8,
    options: 4,
    timer: null,
    base: 100,
    fov: 100,
    accent: "sea",
  },
  medium: {
    id: "medium",
    label: "Medium",
    tagline: "Round de roundabouts",
    blurb: "Local main roads with 20 seconds on de clock.",
    rounds: 8,
    options: 4,
    timer: 20,
    base: 200,
    fov: 85,
    accent: "gold",
  },
  hard: {
    id: "hard",
    label: "Hard",
    tagline: "Deep in de country",
    blurb: "Back roads, 6 choices, 12 seconds. Real Bajans only.",
    rounds: 8,
    options: 6,
    timer: 12,
    base: 300,
    fov: 65,
    accent: "coral",
  },
};

export const placeLabel = (p) => `${p.street}, ${p.parish}`;
