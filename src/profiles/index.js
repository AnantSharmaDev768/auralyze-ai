
// src/profiles/index.js
// Headphone Profile Manager for Zenith AI

const fs = require('fs');
const path = require('path');

// Built-in headphone profiles (expand as needed)
const BUILTIN_PROFILES = {
    "sennheiser hd 600": {
        name: "Sennheiser HD 600",
        brand: "Sennheiser",
        type: "over-ear",
        preamp: -2.0,
        eq: [1.0, 1.0, 0.5, 0.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0]
    },
    "sennheiser hd 650": {
        name: "Sennheiser HD 650",
        brand: "Sennheiser",
        type: "over-ear",
        preamp: -2.0,
        eq: [1.0, 1.0, 0.5, 0.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0]
    },
    "sennheiser hd 800": {
        name: "Sennheiser HD 800",
        brand: "Sennheiser",
        type: "over-ear",
        preamp: -4.0,
        eq: [2.0, 1.5, 1.0, 0.0, -0.5, -1.0, -0.5, 0.5, 1.5, 2.5]
    },
    "sony wh-1000xm4": {
        name: "Sony WH-1000XM4",
        brand: "Sony",
        type: "over-ear",
        preamp: -5.0,
        eq: [3.0, 4.0, 5.0, 4.0, 2.0, 1.0, 0.0, 0.0, 1.0, 2.0]
    },
    "sony wh-1000xm5": {
        name: "Sony WH-1000XM5",
        brand: "Sony",
        type: "over-ear",
        preamp: -4.5,
        eq: [3.0, 3.5, 4.5, 3.5, 1.5, 0.5, 0.0, 0.0, 1.0, 1.5]
    },
    "apple airpods pro": {
        name: "Apple AirPods Pro",
        brand: "Apple",
        type: "in-ear",
        preamp: -3.0,
        eq: [2.0, 2.5, 1.5, 0.0, -1.0, 0.0, 1.0, 2.0, 2.5, 2.0]
    },
    "beyerdynamic dt 770": {
        name: "Beyerdynamic DT 770",
        brand: "Beyerdynamic",
        type: "over-ear",
        preamp: -4.0,
        eq: [2.0, 2.0, 1.0, 0.0, -1.0, -1.5, -1.0, 0.0, 1.0, 2.0]
    },
    "beyerdynamic dt 990": {
        name: "Beyerdynamic DT 990",
        brand: "Beyerdynamic",
        type: "over-ear",
        preamp: -4.5,
        eq: [2.5, 2.0, 1.0, 0.0, -1.0, -1.5, -1.0, 0.0, 1.5, 2.5]
    },
    "bose qc35": {
        name: "Bose QC35",
        brand: "Bose",
        type: "over-ear",
        preamp: -3.5,
        eq: [2.0, 2.5, 2.0, 1.0, 0.0, -0.5, 0.0, 0.5, 1.0, 1.5]
    },
    "hifiman sundara": {
        name: "Hifiman Sundara",
        brand: "Hifiman",
        type: "over-ear",
        preamp: -3.0,
        eq: [1.5, 1.5, 1.0, 0.0, -0.5, -1.0, -0.5, 0.5, 1.5, 2.0]
    },
    "akg k702": {
        name: "AKG K702",
        brand: "AKG",
        type: "over-ear",
        preamp: -3.0,
        eq: [1.0, 1.0, 0.5, 0.0, -0.5, -1.0, -0.5, 0.5, 1.5, 2.0]
    },
    "audio technica ath-m50x": {
        name: "Audio-Technica ATH-M50x",
        brand: "Audio-Technica",
        type: "over-ear",
        preamp: -3.0,
        eq: [1.5, 2.0, 2.0, 1.0, 0.0, -0.5, 0.0, 0.5, 1.0, 1.5]
    }
};

// Load all profiles (built-in + custom)
function loadAllProfiles() {
    let allProfiles = { ...BUILTIN_PROFILES };
    
    // Try to load custom profiles if they exist
    try {
        const customPath = path.join(__dirname, 'custom.json');
        if (fs.existsSync(customPath)) {
            const custom = JSON.parse(fs.readFileSync(customPath, 'utf-8'));
            allProfiles = { ...allProfiles, ...custom };
            console.log("[Profiles] Loaded custom profiles");
        }
    } catch (err) {
        // No custom profiles
    }
    
    return allProfiles;
}

// Find matching profile for a device
function findMatchingProfile(deviceName) {
    if (!deviceName) return null;
    
    const deviceLower = deviceName.toLowerCase();
    const profiles = loadAllProfiles();
    
    // First try exact match
    for (const [key, profile] of Object.entries(profiles)) {
        if (deviceLower.includes(key)) {
            console.log(`[Profiles] ✓ Matched: ${profile.name}`);
            return { profile, confidence: 0.95 };
        }
    }
    
    // Try partial match (brand detection)
    for (const [key, profile] of Object.entries(profiles)) {
        const brandMatch = profile.brand.toLowerCase();
        if (deviceLower.includes(brandMatch)) {
            console.log(`[Profiles] ⚠ Partial match: ${profile.brand} (using generic profile)`);
            return { profile, confidence: 0.70 };
        }
    }
    
    console.log(`[Profiles] ✗ No profile found for: ${deviceName}`);
    return null;
}

// Generate a smart profile for unknown devices
function generateSmartProfile(deviceName) {
    const lowerName = deviceName.toLowerCase();
    let eq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let type = "unknown";
    
    if (lowerName.includes('bud') || lowerName.includes('ear')) {
        // IEMs - boost bass and treble
        eq = [3.0, 2.5, 1.5, 0.0, -1.0, -0.5, 0.0, 1.0, 2.0, 3.0];
        type = "in-ear";
    } else if (lowerName.includes('headphone') || lowerName.includes('headset')) {
        // Headphones - mild boost
        eq = [2.0, 1.5, 1.0, 0.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0];
        type = "over-ear";
    } else if (lowerName.includes('speaker')) {
        // Speakers - neutral
        eq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        type = "speaker";
    }
    
    console.log(`[Profiles] 🧠 Generated smart profile for: ${deviceName} (${type})`);
    
    return {
        name: deviceName,
        brand: "Auto-Detected",
        type: type,
        preamp: -3.0,
        eq: eq,
        isGenerated: true
    };
}

// Convert profile to EQ string for Equalizer APO
function profileToEQString(profile) {
    const freqs = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    return profile.eq.map((gain, i) => `${freqs[i]} ${gain.toFixed(1)}`).join('; ');
}

// Apply profile to audio engine
async function applyProfile(profile, configPath) {
    const eqString = profileToEQString(profile);
    const config = `# ZENITH HEADPHONE PROFILE
# Device: ${profile.name}
# Brand: ${profile.brand}
# Type: ${profile.type || "unknown"}
# Generated: ${new Date().toLocaleString()}

Preamp: ${profile.preamp} dB
GraphicEQ: ${eqString}

# Spatial Processing (Haas Effect)
Copy: L=L+0.25*R R=R+0.25*L
Delay: 8 ms

# Protection Limiter
Filter: ON PK Fc 40 Hz Gain -2.0 dB Q 0.5
`;
    
    try {
        const fs = require('fs').promises;
        await fs.writeFile(configPath, config, 'utf-8');
        console.log(`[Profiles] ✅ Applied profile for: ${profile.name}`);
        return true;
    } catch (err) {
        console.error(`[Profiles] ❌ Failed to apply profile:`, err);
        return false;
    }
}

module.exports = {
    loadAllProfiles,
    findMatchingProfile,
    generateSmartProfile,
    profileToEQString,
    applyProfile
};
