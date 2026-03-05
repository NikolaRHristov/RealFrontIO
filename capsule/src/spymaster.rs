use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[derive(Serialize)]
pub struct AnomalyReport {
    pub anomaly_id: String,
    pub center_x: u32,
    pub center_y: u32,
    pub threat_score: f32,
    pub contributing_channels: Vec<String>,
}

pub struct SpymasterAI {
    // We maintain a sliding window of historical state to detect sudden spikes
    historical_baseline: HashMap<(u32, u32), [f32; 16]>,
}

impl SpymasterAI {
    pub fn new() -> Self {
        Self {
            historical_baseline: HashMap::new(),
        }
    }

    /// Scans the entire 16-channel memory grid looking for multi-domain convergence
    pub fn analyze_grid_for_anomalies(&mut self, current_grid: &HashMap<(u32, u32), [f32; 16]>) -> Vec<AnomalyReport> {
        let mut anomalies = Vec::new();

        for (coords, current_vectors) in current_grid.iter() {
            let (x, y) = *coords;
            let mut threat_score = 0.0;
            let mut active_channels = Vec::new();

            // 1. Check for Economic Panic (Channel 9)
            if current_vectors[9] > 0.7 {
                threat_score += 0.3;
                active_channels.push("POLYMARKET_PANIC".to_string());
            }

            // 2. Check for Cyber Blackout (Channel 2)
            if current_vectors[2] > 0.8 {
                threat_score += 0.4;
                active_channels.push("NETBLOCKS_OUTAGE".to_string());
            }

            // 3. Check for Military Flights (Channel 11)
            if current_vectors[11] > 0.5 {
                threat_score += 0.3;
                active_channels.push("OPENSKY_MILITARY".to_string());
            }

            // 4. Check for Civil Unrest (Channel 7)
            if current_vectors[7] > 0.6 {
                threat_score += 0.2;
                active_channels.push("ACLED_UNREST".to_string());
            }

            // CONVERGENCE: If 3 or more unrelated domains spike simultaneously, 
            // the Spymaster AI flags it as a high-probability "Black Swan" event.
            if active_channels.len() >= 3 && threat_score > 0.8 {
                anomalies.push(AnomalyReport {
                    anomaly_id: format!("BLACK_SWAN_{}_{}", x, y),
                    center_x: x,
                    center_y: y,
                    threat_score,
                    contributing_channels: active_channels,
                });
            }

            // Update baseline (Exponential Moving Average)
            let baseline = self.historical_baseline.entry((x, y)).or_insert([0.0; 16]);
            for i in 0..16 {
                baseline[i] = (baseline[i] * 0.9) + (current_vectors[i] * 0.1);
            }
        }

        anomalies
    }
}