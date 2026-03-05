import { Filter } from 'pixi.js';

const auroraFrag = `
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uTime;
uniform float uHempIntensity; // 0.0 to 1.0

void main(void) {
    vec4 baseColor = texture2D(uSampler, vTextureCoord);
    
    if (uHempIntensity <= 0.0) {
        gl_FragColor = baseColor;
        return;
    }

    // Generate a rippling sine wave pattern
    float wave1 = sin(vTextureCoord.x * 10.0 + uTime * 2.0);
    float wave2 = cos(vTextureCoord.y * 8.0 - uTime * 1.5);
    float noise = (wave1 + wave2) * 0.5;

    // Aurora colors (Neon Green and Purple)
    vec3 auroraColor = mix(vec3(0.0, 1.0, 0.2), vec3(0.6, 0.0, 1.0), noise * 0.5 + 0.5);
    
    // Pulse intensity
    float pulse = abs(sin(uTime * 5.0)) * 0.5 + 0.5;
    
    vec3 finalColor = mix(baseColor.rgb, auroraColor * pulse, uHempIntensity * 0.6);

    gl_FragColor = vec4(finalColor, baseColor.a);
}
`;

export class HempAuroraShader extends Filter {
    constructor() {
        super(undefined, auroraFrag, {
            uTime: 0.0,
            uHempIntensity: 0.0
        });
    }

    public update(delta: number, intensity: number) {
        this.uniforms.uTime += delta * 0.01;
        this.uniforms.uHempIntensity = intensity;
    }
}