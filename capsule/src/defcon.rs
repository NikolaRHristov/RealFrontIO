use std::collections::HashMap;

pub struct DefconState {
    pub current_level: u8, // 5 (Peace) to 1 (Nuclear War)
    global_tension_score: f32,
}

impl DefconState {
    pub fn new() -> Self {
        Self {
            current_level: 5,
            global_tension_score: 0.0,
        }
    }

    /// Evaluates the total sum of global violence and economic panic
    pub fn evaluate_global_threat(&mut self, current_grid: &HashMap<(u32, u32), [f32; 16]>) -> u8 {
        let mut total_acled_violence = 0.0;
        let mut total_econ_panic = 0.0;

        for vectors in current_grid.values() {
            total_acled_violence += vectors[10]; // ACLED Combat
            total_econ_panic += vectors[9];      // Polymarket Volatility
        }

        // Normalize scores based on expected global baselines
        // A standard day might have a tension score of ~100. 
        // A major war erupting will push this into the thousands.
        self.global_tension_score = (total_acled_violence * 2.0) + total_econ_panic;

        let new_level = match self.global_tension_score {
            s if s > 5000.0 => 1, // DEFCON 1: Global Catastrophe / ICBMs unlocked
            s if s > 2500.0 => 2, // DEFCON 2: Brink of War
            s if s > 1000.0 => 3, // DEFCON 3: High Tension / Rapid Mobilization
            s if s > 500.0  => 4, // DEFCON 4: Elevated Activity
            _               => 5, // DEFCON 5: Standard Peace
        };

        if new_level != self.current_level {
            println!("[CAPSULE] THREAT ESCALATION: DEFCON shifted to {}", new_level);
            self.current_level = new_level;
        }

        self.current_level
    }
}