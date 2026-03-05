// capsule/src/source_tier.rs

pub struct TierResult {
    pub tier: u8,
    pub credibility_weight: f32, // 0.8–2.0 multiplier applied to severity
}

pub fn get_source_tier(domain: &str) -> TierResult {
    let bare = domain.trim_start_matches("www.");
    let tier: u8 = match bare {
        "iaea.org" | "who.int" | "news.un.org" | "crisisgroup.org"
        | "acleddata.com" | "cisa.gov" | "nato.int" | "state.gov"
        | "defense.gov" | "atlanticcouncil.org" | "sipri.org"
        | "unhcr.org" | "icrc.org" => 1,

        "reuters.com" | "bbc.com" | "bbci.co.uk" | "apnews.com"
        | "aljazeera.com" | "theguardian.com" | "nytimes.com"
        | "wsj.com" | "ft.com" | "economist.com" | "bloomberg.com"
        | "washingtonpost.com" | "defensenews.com" | "janes.com"
        | "bellingcat.com" | "foreignpolicy.com" => 2,

        "kyivindependent.com" | "timesofisrael.com" | "scmp.com"
        | "themoscowtimes.com" | "arabnews.com" | "alarabiya.net"
        | "militarytimes.com" | "breakingdefense.com" | "rferl.org"
        | "euronews.com" | "dw.com" | "france24.com" => 3,

        _ => 4,
    };

    let credibility_weight = match tier {
        1 => 2.0_f32,
        2 => 1.5,
        3 => 1.1,
        _ => 0.8,
    };

    TierResult { tier, credibility_weight }
}
