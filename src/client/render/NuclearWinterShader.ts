import { Filter } from 'pixi.js';

const nuclearWinterFrag = `
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uGlobalAshDensity; // 0.0 to 1.0

void main(void) {
    vec4 color = texture2D(uSampler, vTextureCoord);
    
    // Grayscale conversion
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grayscaleColor = vec3(gray);
    
    // Blend between normal color and desaturated/darkened ash
    vec3 finalColor = mix(color.rgb, grayscaleColor * 0.5, uGlobalAshDensity);

    // Add a sickly green/yellow radiation tint
    if (uGlobalAshDensity > 0.0) {
        finalColor += vec3(0.05, 0.1, 0.02) * uGlobalAshDensity;
    }

    gl_FragColor = vec4(finalColor, color.a);
}
`;

export class NuclearWinterShader extends Filter {
    constructor() {
        super(undefined, nuclearWinterFrag, {
            uGlobalAshDensity: 0.0 // Modified by the game state when ICBMs detonate
        });
    }

    public setAshDensity(density: number) {
        this.uniforms.uGlobalAshDensity = density;
    }
}