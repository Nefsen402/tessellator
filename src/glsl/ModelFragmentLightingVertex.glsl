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

#if defined(USE_LIGHTING) || defined(USE_REFLECTION_CUBE)
    attribute vec3 normal;
    
    uniform mat3 nMatrix;
    
    varying vec3 lightNormal;
#endif

void main(void){
    #ifdef FLATTEN_MATRIX
        mvPosition = mvMatrix * vec4(0, 0, 0, 1) + vec4(position, 0);
    #else
        mvPosition = mvMatrix * vec4(position, 1);
    #endif
    
    gl_Position = pMatrix * mvPosition;
    
    #if defined(USE_LIGHTING) || defined(USE_REFLECTION_CUBE)
        lightNormal = normalize(nMatrix * normal);
    #endif
    
    colorInfo = color;
}