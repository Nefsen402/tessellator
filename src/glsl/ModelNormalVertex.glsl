attribute vec3 position;
attribute vec3 normal;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform mat3 nMatrix;

varying vec3 color;

void main(void){
    gl_Position = pMatrix * mvMatrix * vec4(position, 1);
    
    color = normal * nMatrix;
}