import { Filter } from 'pixi.js';

const rayleighFrag = `
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

// Passed in from the Rust parser (Batch 55) based on real-world UTC
uniform float uSunAngle; // 0.0 = Midnight, 0.5 = High Noon, 1.0 = Midnight
uniform float uCloudCover; // Channel 12/13 interpolation

// Approximate Rayleigh Scattering coefficients
vec3 calculateScattering(float angle) {
    // Twilight / Sunset (Golden/Red/Purple)
    if (angle < 0.2 || angle > 0.8) {
        return vec3(0.8, 0.4, 0.2); 
    }
    // High Noon (Blue/White)
    return vec3(0.6, 0.8, 1.0);
}

void main(void) {
    vec4 baseColor = texture2D(uSampler, vTextureCoord);
    
    vec3 atmosphere = calculateScattering(uSunAngle);
    
    // As the sun sets, the overall light level drops (Night cycle)
    float lightIntensity = sin(uSunAngle * 3.14159);
    
    // Mix the base map color with the atmospheric tint, scaled by the sun's height
    vec3 finalColor = mix(baseColor.rgb * lightIntensity, atmosphere, 0.2 - (uCloudCover * 0.1));

    gl_FragColor = vec4(finalColor, baseColor.a);
}
`;

export class RayleighScatteringShader extends Filter {
    constructor() {
        super(undefined, rayleighFrag, {
            uSunAngle: 0.5,
            uCloudCover: 0.0
        });
    }

    public updateTime(utcNormalized: number, cloudCover: number) {
        this.uniforms.uSunAngle = utcNormalized;
        this.uniforms.uCloudCover = cloudCover;
    }
}