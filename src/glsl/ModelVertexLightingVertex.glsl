attribute vec3 position;

uniform mat4 mvMatrix;
uniform mat4 pMatrix;

vec4 mvPosition;

#ifdef USE_TEXTURE
    attribute vec2 color;
    
    varying vec2 colorInfo;
#else
    attribute vec4 color;
    
    varying vec4 colorInfo;
#endif

#ifdef USE_SPECULAR_REFLECTION
    uniform float specular;
#endif

uniform sampler2D normalTexture;

#define LIGHTING_EPSILON 0.0005
#define LIGHTING_MAX_ANGLE_INFUANCE 0.5

#ifdef USE_LIGHTING
    attribute vec3 normal;
    
    uniform mat3 nMatrix;
    uniform sampler2D lights, shadowMap;
    uniform samplerCube cube1, cube2, cube3, cube4;
    
    varying vec3 lightMask;
    
    float unpackFloat(vec4 value){
        return dot(value, vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0));
    }
    
    vec4 getCube (int cube, vec3 pos){
        #ifdef TEXTURE_CUBE_1
            if (cube == 1) return textureCube(cube1, pos);
        #endif
        
        #ifdef TEXTURE_CUBE_2
            if (cube == 2) return textureCube(cube2, pos);
        #endif
        
        #ifdef TEXTURE_CUBE_3
            if (cube == 3) return textureCube(cube3, pos);
        #endif
        
        #ifdef TEXTURE_CUBE_4
            if (cube == 4) return textureCube(cube4, pos);
        #endif
        
        return vec4(0);
    }

    vec3 getLightMask(vec3 normal){
        vec3 lightMask = vec3(0);
        
        for (float i = 0.0; i < 256.; i++){
            vec4 light0 = texture2D(lights ,vec2(0. / 4., i / 256.));
            
            int type = int(light0.x);
            vec3 color = light0.yzw;
            
            if(type == 0){
                lightMask += color;
                
                break;
            }else if(type == 1){
                lightMask += color;
            }else if(type == 2){
                vec3 dir = texture2D(lights, vec2(1./4., i/256.)).xyz;
                float intensity = max(0., dot(normal, dir));
                vec4 shadow = texture2D(lights, vec2(3./4., i/256.));
                
                if(shadow.x > .5){
                    vec3 pos = texture2D(lights, vec2(2./4., i/256.)).xyz;
                    
                    lightMask = vec3(length(shadow.w - mvPosition.xyz * dir)) / 50.;
                    
                    /*npos.xy = npos.xy / shadow.yz * 4. + .5;
                    vec2 depthMap = texture2D(shadowMap, npos.xy).xw;
                    float depth = abs(depthMap.x - npos.z);
                    lightMask = vec3(depth);
                    */
                }else{
                    lightMask += color * intensity;
                }
            }else if(type == 3){
                vec3 pos = texture2D(lights, vec2(1./4.,i/256.)).xyz;
                vec4 shadow = texture2D(lights, vec2(3./4.,i/256.));
                
                vec3 dist = pos - mvPosition.xyz;
                float len = length(dist);
                vec3 npos = dist / len;
                float angle = max(0.0, dot(normal, npos));
                
                float intensity = angle;
                
                #ifdef USE_SPECULAR_REFLECTION
                    intensity += pow(max(0., dot(reflect(-npos, normal), normalize(-mvPosition.xyz))), specular);
                #endif
                
                if (shadow.x > .5){
                    float mapLen = unpackFloat(getCube(int(shadow.x), npos * vec3(1, -1, 1)));
                    float thisLen = (len - shadow.y) / (shadow.z - shadow.y);
                    
                    if (thisLen >= mapLen + LIGHTING_EPSILON / max(angle, LIGHTING_MAX_ANGLE_INFUANCE)){
                        intensity *= 0.0;
                    }
                }
                
                lightMask += color * intensity;
            }else if(type == 4){
                vec4 light1 = texture2D(lights, vec2(1./4., i/256.));
                vec4 shadow = texture2D(lights, vec2(3./4., i/256.));
                
                vec3 pos = light1.xyz;
                float range = light1.w;
                
                vec3 dist = pos - mvPosition.xyz;
                float len = length(dist);
                
                if(range >= len){
                    vec3 npos = dist / len;
                    float angle = max(0.0, dot(normal, npos));
                    
                    float intensity = angle;
                    
                    #ifdef USE_SPECULAR_REFLECTION
                        intensity += pow(max(0., dot(reflect(-npos, normal), normalize(-mvPosition.xyz))), specular);
                    #endif
                    
                    if (shadow.x > .5){
                        float mapLen = unpackFloat(getCube(int(shadow.x), npos * vec3(1, -1, 1)));
                        float thisLen = (len - shadow.y) / (shadow.z - shadow.y);
                        
                        if (thisLen >= mapLen + LIGHTING_EPSILON / max(angle, LIGHTING_MAX_ANGLE_INFUANCE)){
                            intensity *= 0.0;
                        }
                    }
                    
                    lightMask += color * intensity * ((range - len) / range);
                }
            }else if(type == 5){
                vec4 light1 = texture2D(lights, vec2(1./4., i/256.));
                vec4 light2 = texture2D(lights, vec2(2./4., i/256.));
                
                vec3 pos = light1.xyz;
                vec3 npos = normalize(pos - mvPosition.xyz);
                vec3 vec = light2.xyz;
                float size = light2.w;
                
                if(dot(vec, npos) > size){
                    vec3 look = normalize(-mvPosition.xyz);
                    vec3 reflection = reflect(-npos, normal);
                    
                    float specularLight = 0.0;
                    
                    #ifdef USE_SPECULAR_REFLECTION
                        specularLight = pow(max(0., dot(reflect(-npos, normal), normalize(-mvPosition.xyz))), specular);
                    #endif
                    
                    float intensity = max(0., dot(normal, npos)) + specularLight;
                    
                    lightMask += color * intensity;
                }
            }else if(type == 6){
                vec4 light1 = texture2D(lights, vec2(1./4., i/256.));
                vec4 light2 = texture2D(lights, vec2(2./4., i/256.));
                
                vec3 pos= light1.xyz;
                float range = light1.w;
                vec3 dist = pos - mvPosition.xyz;
                float length = length(dist);
                
                vec3 npos = dist /length;
                vec3 vec = light2.xyz;
                
                float size = light2.w;
                
                if(range > length && dot(vec, npos) > size){
                    vec3 look = normalize(-mvPosition.xyz);
                    
                    vec3 reflection = reflect(-npos, normal);
                    
                    float specularLight = 0.0;
                    
                    #ifdef USE_SPECULAR_REFLECTION
                        specularLight = pow(max(0., dot(reflect(-npos, normal), normalize(-mvPosition.xyz))), specular);
                    #endif
                    
                    float intensity = max(0., dot(normal, npos)) + specularLight;
                    
                    lightMask += color * intensity * ((range - length) / range);
                }
            }
        }
        
        return lightMask;
    }
#endif

void main(void){
    mvPosition = mvMatrix * vec4(position, 1);
    
    gl_Position = pMatrix * mvPosition;
    
    colorInfo = color;
    
    #ifdef USE_LIGHTING
        vec3 norm = normalize(nMatrix * normal);
        
        #ifdef USE_NORMAL_MAP
            vec3 normalTex = texture2D(normalTexture, tex).xyz * 2. - 1.;
            vec3 c = cross (norm, normalTex);
            
            norm = -normalTex * c + norm * abs(1. - c);
        #endif
        
        lightMask = getLightMask(norm);
    #endif
}