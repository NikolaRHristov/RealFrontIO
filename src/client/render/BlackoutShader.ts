// Patching HexaLensFilter (Batch 20) to include the EMP Grid-Wipe
import { Filter } from 'pixi.js';

const blackoutFrag = `
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

// 16 Channels
uniform sampler2D uDataBlockA; // [0-3]: Seismic, Thermal, Cyber, GPS
uniform sampler2D uDataBlockC; // [8-11]: Maritime, Econ, ACLED, Recon
uniform sampler2D uCityLightsMap; // Pre-rendered texture of glowing city lights

void main(void) {
    vec4 baseColor = texture2D(uSampler, vTextureCoord);
    vec4 lights = texture2D(uCityLightsMap, vTextureCoord);
    
    // Channel 2 (BGP/Cyber) and a synthetic Power Grid channel 
    // For this shader, we assume Cyber (BlockA.b) > 0.8 means an EMP/Blackout
    float cyberSeverity = texture2D(uDataBlockA, vTextureCoord).b;

    // If there is NO cyber attack, add the glowing yellow/orange city lights to the base map
    if (cyberSeverity < 0.5) {
        baseColor.rgb += (lights.rgb * 1.5);
    } else {
        // EMP / Blackout: The lights turn off, and the pixel becomes significantly darker
        baseColor.rgb *= 0.5; 
    }

    gl_FragColor = baseColor;
}
`;

export class BlackoutShader extends Filter {
    constructor() {
        super(undefined, blackoutFrag);
    }
}