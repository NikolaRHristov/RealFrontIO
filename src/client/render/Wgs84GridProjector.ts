import { Filter } from 'pixi.js';

const hexGridFrag = `
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

// WGS84 mapping parameters
uniform float uMapWidth;
uniform float uMapHeight;
uniform float uZoomLevel;

void main(void) {
    vec4 baseColor = texture2D(uSampler, vTextureCoord);
    
    // Calculate global grid coordinates
    float gridX = fract(vTextureCoord.x * uMapWidth * 0.1 * uZoomLevel);
    float gridY = fract(vTextureCoord.y * uMapHeight * 0.1 * uZoomLevel);

    // Draw thin grid lines
    float lineThickness = 0.02;
    if (gridX < lineThickness || gridY < lineThickness) {
        // Overlay a faint, glowing cyan tactical grid
        baseColor.rgb = mix(baseColor.rgb, vec3(0.0, 0.8, 1.0), 0.5);
    }

    gl_FragColor = baseColor;
}
`;

export class Wgs84GridProjector extends Filter {
    constructor() {
        super(undefined, hexGridFrag, {
            uMapWidth: 1024.0, // Arbitrary defaults, updated by the renderer
            uMapHeight: 1024.0,
            uZoomLevel: 1.0
        });
    }

    public updateUniforms(width: number, height: number, zoom: number) {
        this.uniforms.uMapWidth = width;
        this.uniforms.uMapHeight = height;
        this.uniforms.uZoomLevel = zoom;
    }
}