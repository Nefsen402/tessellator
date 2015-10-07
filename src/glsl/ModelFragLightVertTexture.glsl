attribute vec3 position;
attribute vec2 color;
attribute vec3 normal;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform mat3 nMatrix;

varying vec3 lightNormal;
varying vec4 mvPosition;
varying vec2 texCoord;

void main(void){
    mvPosition = mvMatrix * vec4(position, 1);
    
    gl_Position = pMatrix * mvPosition;
    lightNormal = normalize(nMatrix * normal);
    texCoord = color;
}