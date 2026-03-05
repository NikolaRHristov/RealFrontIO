use dotenvy::dotenv;
use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub redis_url: String,
    pub acled_email: String,
    pub acled_api_key: String,
    pub opensky_user: String,
    pub opensky_pass: String,
    pub spire_ais_token: String,
    pub nasa_firms_key: String,
}

impl AppConfig {
    pub fn load() -> Self {
        // Load the .env file if it exists (for local development)
        // In production Docker/K8s, this will quietly fail and just read system env vars.
        dotenv().ok();

        Self {
            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string()),
            acled_email: env::var("ACLED_EMAIL").unwrap_or_default(),
            acled_api_key: env::var("ACLED_API_KEY").unwrap_or_default(),
            opensky_user: env::var("OPENSKY_USERNAME").unwrap_or_default(),
            opensky_pass: env::var("OPENSKY_PASSWORD").unwrap_or_default(),
            spire_ais_token: env::var("SPIRE_AIS_TOKEN").unwrap_or_default(),
            nasa_firms_key: env::var("NASA_FIRMS_MAP_KEY").unwrap_or_default(),
        }
    }
}