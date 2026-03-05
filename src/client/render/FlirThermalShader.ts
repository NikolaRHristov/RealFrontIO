import { Filter } from 'pixi.js';

const flirFrag = `
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uDataBlockA; // [0-3]: Seismic, Thermal, Cyber, GPS

// FLIR Color Ramp (White-Hot)
vec3 getFlirColor(float heat) {
    if (heat < 0.2) return mix(vec3(0.0), vec3(0.2, 0.0, 0.5), heat * 5.0); // Dark purple
    if (heat < 0.5) return mix(vec3(0.2, 0.0, 0.5), vec3(0.8, 0.2, 0.2), (heat - 0.2) * 3.33); // Red/Orange
    if (heat < 0.8) return mix(vec3(0.8, 0.2, 0.2), vec3(1.0, 0.8, 0.0), (heat - 0.5) * 3.33); // Yellow
    return mix(vec3(1.0, 0.8, 0.0), vec3(1.0, 1.0, 1.0), (heat - 0.8) * 5.0); // White hot
}

void main(void) {
    vec4 baseColor = texture2D(uSampler, vTextureCoord);
    
    // Channel 1: Thermal Anomalies (FIRMS data + Game Engine Unit Heat)
    float heatValue = texture2D(uDataBlockA, vTextureCoord).g; 

    // Apply the FLIR gradient
    vec3 flirColor = getFlirColor(heatValue);
    
    // Completely overwrite the base texture with the FLIR vision
    gl_FragColor = vec4(flirColor, baseColor.a);
}
`;

export class FlirThermalShader extends Filter {
    constructor() {
        super(undefined, flirFrag);
    }
}