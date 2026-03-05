# RealFrontIO: API Key & Deployment Strategy

Because RealFrontIO is built on top of live global telemetry, it acts as a massive data multiplexer. If the game client requested this data directly, every player joining your server would instantly exhaust your API rate limits. 

Here is the secure, rate-limit-proof deployment strategy.

## 1. The API Key Requirement
Many "public" APIs require authentication to track usage and prevent DDoS attacks.
Please review the `.env.example` file. You must register developer accounts for:
*   **ACLED** (Armed Conflict Data)
*   **OpenSky** (Aviation)
*   **Spire or MarineTraffic** (Maritime AIS)
*   **NASA FIRMS** (Wildfires)

## 2. The Rate-Limiting Defense Mechanism (The Multiplexer)
The architecture is designed to **never let the game engine talk to the internet**. 

1. **The Rust Capsule** uses the `OsintFetcher` (with your secret API keys) to ping these external APIs at a conservative interval (e.g., polling OpenSky every 10 seconds, USGS every 5 minutes).
2. The Capsule immediately dumps the raw JSON response into an **Upstash Redis** cache.
3. The Capsule then parses the data into the internal 16-channel array format, and streams it over gRPC to the Game Engine. 

Because of this, you can have 10,000 players connected to your game server, and you will **still only make 1 API request per minute** to the external providers. 

## 3. Local Development Deployment
1. Copy `.env.example` to `.env` in your root folder.
2. Fill in the keys you have. The Rust Capsule is fault-tolerant; if a key is missing or invalid, that specific channel will simply report `0.0` (peace/silence) on the map without crashing the engine.
3. The `dotenvy` crate in Rust will automatically ingest these values when you run `cargo run`.

## 4. Production Deployment (Docker / Kubernetes)
**DO NOT COMMIT THE `.env` FILE TO GITHUB.**

In production, you will pass these variables directly into your Docker container.

### Example Docker Compose:
\`\`\`yaml
version: '3.8'
services:
  realfront-capsule:
    build: ./capsule
    environment:
      - REDIS_URL=redis://your-production-redis:6379
      - ACLED_EMAIL=${ACLED_EMAIL}
      - ACLED_API_KEY=${ACLED_API_KEY}
      - OPENSKY_USERNAME=${OPENSKY_USERNAME}
      - OPENSKY_PASSWORD=${OPENSKY_PASSWORD}
    ports:
      - "50051:50051" # gRPC
      - "50052:50052" # Admin API
\`\`\`

If you are using a CI/CD pipeline (like GitHub Actions), store the actual strings inside **GitHub Repository Secrets** and pass them to your build step or deployment orchestration (like AWS ECS, Terraform, or Vercel).