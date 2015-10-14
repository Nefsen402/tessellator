precision mediump float;

varying vec4 mvPosition;

uniform vec2 window;
uniform vec4 mask;

#ifdef USE_SCISSOR
    uniform vec4 scissor;
#endif

#ifdef USE_TEXTURE
    uniform sampler2D texture;
    
    varying vec2 colorInfo;
#else
    varying vec4 colorInfo;
#endif

#ifdef USE_LIGHTING
    varying vec3 lightMask;
#endif

#ifdef USE_FOG
    uniform vec2 fog;
    uniform vec3 fogColor;
#endif

void main(void){
    #ifdef USE_SCISSOR
        vec2 area = gl_FragCoord.xy / window;
        
        if(area.x < scissor.x || area.y < scissor.y || scissor.x + scissor.z < area.x || scissor.y + scissor.w < area.y){
            discard;
        }
    #endif
    
    #ifdef USE_TEXTURE
        vec2 tex = mod(colorInfo, 1.);
        vec4 mainColor = texture2D(texture, tex);
    #else
        vec4 mainColor = colorInfo;
    #endif
    
    mainColor *= mask;
    
    #ifdef USE_LIGHTING
        mainColor.xyz *= lightMask;
    #endif
    
    if(mainColor.w == 0.0){
        discard;
    }else{
        #ifdef USE_FOG
            float fogLerp = clamp((length(mvPosition.xyz) - fog.x) / (fog.y - fog.x), 0., 1.);
            
            mainColor.xyz = mainColor.xyz * (1. - fogLerp) + fogColor * fogLerp;
        #endif
        
        gl_FragColor = mainColor;
    }
}