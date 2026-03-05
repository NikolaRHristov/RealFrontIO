import { Filter } from 'pixi.js';

const multiLensFrag = `
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

// 16 Channels Packed into 4 Textures
uniform sampler2D uDataBlockA; // [0-3]: Seismic, Fire(Thermal), Cyber, GPS
uniform sampler2D uDataBlockB; // [4-7]: WindU, WindV, CBRN, Unrest
uniform sampler2D uDataBlockC; // [8-11]: Maritime, Econ, ACLED, Recon
uniform sampler2D uDataBlockD; // [12-15]: Precip, Cold, Bio, SpaceWeather

uniform sampler2D uSolarIllumination; 
uniform int uActiveLens; 
uniform float uTime;

void main(void) {
    vec4 baseColor = texture2D(uSampler, vTextureCoord);
    vec4 blockA = texture2D(uDataBlockA, vTextureCoord);
    vec4 blockB = texture2D(uDataBlockB, vTextureCoord);
    vec4 blockC = texture2D(uDataBlockC, vTextureCoord);
    vec4 blockD = texture2D(uDataBlockD, vTextureCoord);
    
    float sunlight = texture2D(uSolarIllumination, vTextureCoord).r;
    
    // Lens -1: Standard Visuals (Day/Night Cycle applied)
    if (uActiveLens == -1) {
        gl_FragColor = vec4(baseColor.rgb * sunlight, baseColor.a);
        return;
    }

    float severity = 0.0;
    vec3 brutalColor = vec3(0.0);

    // Lens 0: Seismic (Block A, R)
    if (uActiveLens == 0) {
        severity = blockA.r;
        brutalColor = vec3(1.0, 0.2, 0.0);
    } 
    // Lens 1: Cyber/NetBlocks (Block A, B)
    else if (uActiveLens == 1) {
        severity = blockA.b;
        if (severity > 0.8) {
            // Chromatic Aberration & CRT distortion
            float r = texture2D(uSampler, vTextureCoord + vec2(0.01, 0.0)).r;
            float g = texture2D(uSampler, vTextureCoord).g;
            float b = texture2D(uSampler, vTextureCoord + vec2(-0.01, 0.0)).b;
            baseColor = vec4(r, g, b, 1.0);
            
            float wipe = sin(vTextureCoord.y * 50.0 + uTime * 20.0);
            if (wipe > 0.9) baseColor.rgb = vec3(0.0, 1.0, 0.0);
        }
        brutalColor = vec3(0.0, 1.0, 0.1);
    } 
    // Lens 2: CBRN (Block B, B)
    else if (uActiveLens == 2) {
        severity = blockB.b;
        brutalColor = vec3(0.8, 0.0, 1.0);
    } 
    // Lens 3: Wind Vectors (Block B, R & G)
    else if (uActiveLens == 3) {
        severity = clamp(length(vec2(blockB.r, blockB.g)), 0.0, 1.0);
        brutalColor = vec3(0.5, 0.8, 1.0);
    }
    // Lens 4: FLIR / Thermal (Block A, G)
    else if (uActiveLens == 4) {
        float heat = blockA.g;
        vec3 coldBg = vec3(0.1, 0.0, 0.3);
        vec3 midHeat = vec3(1.0, 0.3, 0.0);
        vec3 hotObj = vec3(1.0, 1.0, 1.0);

        if (heat < 0.3) brutalColor = mix(coldBg, midHeat, heat / 0.3);
        else brutalColor = mix(midHeat, hotObj, (heat - 0.3) / 0.7);
        
        float flirNoise = fract(sin(dot(vTextureCoord * 12.9898 + uTime, vec2(78.233, 45.164))) * 43758.5453);
        brutalColor += (flirNoise * 0.1);
        
        gl_FragColor = vec4(brutalColor, 1.0);
        return;
    }
    // Lens 5: Climate (Block D, R & G)
    else if (uActiveLens == 5) {
        float precip = blockD.r;
        float cold = blockD.g;
        vec3 color = vec3(0.1, 0.15, 0.1); 

        if (precip > 0.1) {
            if (cold > 0.1) color = mix(color, vec3(0.8, 0.9, 1.0), precip); // Snow
            else color = mix(color, vec3(0.0, 0.2, 0.6), precip); // Rain/Mud
        }
        if (cold > 0.5) color += vec3(0.0, 0.1, 0.3) * cold; // Ice vignette

        gl_FragColor = vec4(color, 1.0);
        return;
    }

    if (severity > 0.05) {
        float scanline = step(0.5, fract(vTextureCoord.y * 1000.0));
        vec3 finalColor = mix(baseColor.rgb, brutalColor, scanline * severity);
        gl_FragColor = vec4(finalColor, baseColor.a);
    } else {
        gl_FragColor = baseColor;
    }
}
`;

export class HexaLensFilter extends Filter {
    constructor() {
        super(undefined, multiLensFrag, {
            uActiveLens: -1,
            uTime: 0.0
        });
    }

    public update(delta: number) {
        this.uniforms.uTime += delta;
    }
}