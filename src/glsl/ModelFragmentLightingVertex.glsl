attribute vec3 position;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;

varying vec4 mvPosition;

#ifdef USE_TEXTURE
    attribute vec2 color;
    
    varying vec2 colorInfo;
#else
    attribute vec4 color;
    
    varying vec4 colorInfo;
#endif

#ifdef USE_LIGHTING
    attribute vec3 normal;
    
    uniform mat3 nMatrix;
    
    varying vec3 lightNormal;
#endif

void main(void){
    mvPosition = mvMatrix * vec4(position, 1);
    
    gl_Position = pMatrix * mvPosition;
    
    #ifdef USE_LIGHTING
        lightNormal = normalize(nMatrix * normal);
    #endif
    
    colorInfo = color;
}