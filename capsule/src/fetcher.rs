use reqwest::{Client, header};
use std::sync::Arc;
use crate::config::AppConfig;

/// The Global HTTP Multiplexer for OSINT Data
pub struct OsintFetcher {
    client: Client,
    config: Arc<AppConfig>,
}

impl OsintFetcher {
    pub fn new(config: Arc<AppConfig>) -> Self {
        Self {
            client: Client::new(),
            config,
        }
    }

    /// Fetches ACLED data using their specific Query Param authentication
    pub async fn fetch_acled(&self) -> Result<String, reqwest::Error> {
        let url = format!(
            "https://api.acleddata.com/acled/read?email={}&key={}&limit=1000",
            self.config.acled_email, self.config.acled_api_key
        );
        self.client.get(&url).send().await?.text().await
    }

    /// Fetches OpenSky data using Basic Auth (prevents heavy rate limiting)
    pub async fn fetch_opensky(&self) -> Result<String, reqwest::Error> {
        let url = "https://opensky-network.org/api/states/all";
        self.client.get(url)
            .basic_auth(&self.config.opensky_user, Some(&self.config.opensky_pass))
            .send().await?.text().await
    }

    /// Fetches Maritime AIS using Bearer Tokens
    pub async fn fetch_ais(&self) -> Result<String, reqwest::Error> {
        let url = "https://api.spire.com/vessels/positions";
        self.client.get(url)
            .bearer_auth(&self.config.spire_ais_token)
            .send().await?.text().await
    }

    /// Fetches NASA FIRMS using URL parameters
    pub async fn fetch_nasa_firms(&self) -> Result<String, reqwest::Error> {
        let url = format!(
            "https://firms.modaps.eosdis.nasa.gov/api/active_fire/viirs/{}?format=json",
            self.config.nasa_firms_key
        );
        self.client.get(&url).send().await?.text().await
    }

    /// Example of an open endpoint that requires no authentication
    pub async fn fetch_usgs_earthquakes(&self) -> Result<String, reqwest::Error> {
        let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
        self.client.get(url).send().await?.text().await
    }
}