use serde::Deserialize;
use crate::ingest::pb;

// --- GLOBAL NON-SPATIAL PARSERS (OPEC & SWIFT) ---
// These events do not map to a specific X/Y coordinate. 
// They are global scalars that affect the entire simulation.

#[derive(Debug, Deserialize)]
pub struct OpecMarketData {
    pub brent_crude_price: f32, // Price per barrel in USD
}

pub fn parse_opec_oil_prices(json_data: &str, current_tick: u64) -> Option<pb::WorldHazardEvent> {
    if let Ok(data) = serde_json::from_str::<OpecMarketData>(json_data) {
        // Baseline oil price is ~$75. If it spikes above $100, fuel costs in-game skyrocket.
        let severity = (data.brent_crude_price / 75.0).clamp(0.5, 3.0);
        
        return Some(pb::WorldHazardEvent {
            event_hash: format!("OPEC_GLOBAL_{}", current_tick),
            center_x: 0, 
            center_y: 0,
            severity, // Treated as a multiplier by the TS Engine
            radius: 0.0,
            tick_applied: current_tick,
            category: pb::HazardCategory::HazardEconomicSanction as i32,
        });
    }
    None
}

#[derive(Debug, Deserialize)]
pub struct SwiftSanctionList {
    pub sanctioned_faction_ids: Vec<String>,
}

pub fn parse_swift_sanctions(json_data: &str, current_tick: u64) -> Vec<pb::WorldHazardEvent> {
    // In a real scenario, this would pass specific faction string IDs to the engine
    // For the gRPC struct, we encode the faction ID into the hash or a dedicated payload
    vec![]
}