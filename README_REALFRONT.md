# RealFrontIO: The Omniscience Architecture

**RealFrontIO** is a bleeding-edge, zero-copy RTS sandbox powered entirely by real-world geopolitical, ecological, and economic data. This is not a standard web game; it is a brutalist data visualization engine mapped to a military simulation.

---

## 1. The Zero-Copy Memory Grid
At the heart of the engine is the `TerrainSearchMap`. Instead of passing JSON objects between the server and the client, the entire state of the world is maintained in a single, massive **SharedArrayBuffer**. 

Every tile on the game map holds **16 Float32 channels** (64 bytes per node). The GPU, the A* Pathfinding Web Workers, and the Node.js Game Loop all read and write to this exact memory block simultaneously, allowing for 60 FPS deterministic simulation of 100,000+ units.

### The 16-Channel Dictionary:
*   `[0]` **Seismic (USGS):** Fractures terrain, severs roads, increases A* base costs.
*   `[1]` **Thermal (NASA FIRMS):** Burns down forests, visible in FLIR/Thermal WebGL lenses.
*   `[2]` **Cyber (NetBlocks):** Jams minimaps, severs player command-and-control.
*   `[3]` **Orbital (GPS/Starlink):** Dictates Cruise Missile precision (CEP drift).
*   `[4]` **Wind U Vector (NOAA):** Pushes radiation and smoke East/West.
*   `[5]` **Wind V Vector (NOAA):** Pushes radiation and smoke North/South.
*   `[6]` **CBRN Radiation:** Deals massive unmitigable damage to Infantry.
*   `[7]` **Civil Unrest (ACLED):** Halts city production, crushes defending troop morale.
*   `[8]` **Maritime (AIS):** Determines global shipping health; blockades crash coastal economies.
*   `[9]` **Economy (Polymarket):** Global panic spikes the cost of Heavy Armor and Naval units.
*   `[10]` **Combat Zone (ACLED):** Severe spikes spawn Hostile Neutral AI Rogue Armies.
*   `[11]` **Recon (OpenSky):** Real-world military flights lift the Fog of War.
*   `[12]` **Precipitation (Open-Meteo):** Heavy rain creates mud, paralyzing Tanks.
*   `[13]` **Extreme Cold:** Freezes un-garrisoned Infantry to death.
*   `[14]` *Reserved for Expansion*
*   `[15]` *Reserved for Expansion*

---

## 2. The Rust Capsule (Data Ingestion)
The Node.js game loop does not talk to the internet. Doing so would destroy the tick rate. 
Instead, a highly concurrent Rust microservice (The Capsule) sits beside the game server. 

### Pipeline:
1.  **Upstash Redis Multiplexer:** The Capsule spawns Tokio workers that poll 15+ external APIs (USGS, NASA, Polymarket, GDACS) at staggered intervals. The raw JSON/CSV is cached in Redis to prevent rate-limiting and ensure all connected game servers see the exact same WGS84 snapshot.
2.  **Geographic Projection:** The Capsule projects raw WGS84 (Lat/Lon) coordinates onto the 2D Isometric Cartesian grid.
3.  **gRPC Streaming:** The parsed data is deterministically hashed and streamed via a high-throughput gRPC `BroadcastChannel` directly into the Node.js `GameRunner`.

---

## 3. The Spymaster AI & Metagame
The game features an autonomous LLM-driven "Spymaster" written in Rust. 
It maintains an Exponential Moving Average (EMA) of all 16 channels. When it detects a **Convergence**—e.g., a cyber blackout, economic panic, and military flights all hitting the same sector simultaneously—it flags a "Black Swan" anomaly.

This spawns a physical `IntelligenceObjective` on the game map. If players capture it with Infantry, they receive massive black-ops funding and tech-tree unlocks.

### DEFCON Escalation
As global ACLED deaths and Polymarket war-bets rise, the server drops the global DEFCON level. 
At **DEFCON 1**, the apocalypse begins. Production costs drop to zero, unit speed triples, and the normally locked `ICBM_PROTOCOL` is authorized for all players.

---

## 4. Brutalist UI & The Deep State Terminal
The game completely abandons standard UI design. Data is rendered brutally.
*   **WebGL Lenses:** Players must cycle through 5 different fragment shaders (Thermal, Seismic, Cyber, Climate) to see the different Data Channels on the map.
*   **The Bloomberg Exchange:** Players can press `B` to open a terminal where they can aggressively short-sell the economies of enemy players.
*   **The Deep State Console:** Admins can press `~` to open an internal command line, directly injecting simulated synthetic 9.0 Earthquakes or Cyber Blackouts via the Rust REST API to test mechanics.

---

## 5. Deployment / Boot Sequence

Ensure you have your external API keys ready (GDELT, NASA, etc.).

```bash
# 1. Boot the Upstash Redis Cache and the Rust Capsule
docker-compose -f docker-compose.realfront.yml up -d realfront-capsule

# 2. Verify the gRPC stream is active on port 50051
# The Rust telemetry database (SQLite) will auto-generate.

# 3. Boot the Node.js Game Server
npm run build
npm run start:server

# 4. Boot the Vite Client
npm run dev
```

*Architected via Perplexity AI / WorldMonitor Protocol.*