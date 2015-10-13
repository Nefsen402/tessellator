precision mediump float;

uniform vec4 clip;
uniform vec2 window;
uniform vec4 mask;

#ifdef USE_TEXTURE
    uniform sampler2D texture;
    
    varying vec2 colorInfo;
#else
    varying vec4 colorInfo;
#endif

#ifdef USE_LIGHTING
    varying vec3 lightMask;
#endif

void main(void){
    {
        float xarea=gl_FragCoord.x / window.x;
        float yarea=gl_FragCoord.y / window.y;
        
        if(xarea < clip.x || yarea < clip.y || clip.x + clip.z < xarea || clip.y + clip.w < yarea){
            discard;
        }
    }
    
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
        gl_FragColor = mainColor;
    }
}