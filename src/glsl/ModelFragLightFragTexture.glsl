precision mediump float;

uniform vec4 clip;
uniform vec2 window;
uniform float specular;
uniform sampler2D lights, shadowMap;

uniform samplerCube cube1, cube2, cube3, cube4;

uniform sampler2D texture;

varying vec2 texCoord;
varying vec3 lightNormal;
varying vec4 mvPosition;

#define LIGHTING_EPSILON 0.0005

float unpackFloat(vec4 value){
  return dot(value, vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0));
}

vec4 getCube (int cube, vec3 pos){
    if (cube == 1) return textureCube(cube1, pos);
    if (cube == 2) return textureCube(cube2, pos);
    if (cube == 3) return textureCube(cube3, pos);
    if (cube == 4) return textureCube(cube4, pos);
    
    return vec4(0);
}

vec3 getLightMask(void){
    vec3 lightMask=vec3(0);
    
    for (float i = 0.0; i < 256.; i++){
        vec4 light0 = texture2D(lights ,vec2(0. / 4., i / 256.));
        
        int type = int(light0.x);
        vec3 color = light0.yzw;
        
        if(type == 0){
            lightMask+=color;
            
            break;
        }else if(type == 1){
            lightMask += color;
        }else if(type == 2){
            vec3 dir = texture2D(lights, vec2(1./4., i/256.)).xyz;
            float intensity = max(0., dot(lightNormal, dir));
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
            float angle = max(0.0, dot(lightNormal, npos));
            
            float intensity = 0.0;
            
            if(specular >= 1.0){
                intensity += pow(max(0., dot(reflect(-npos, lightNormal), normalize(-mvPosition.xyz))), specular);
            }
            
            if (shadow.x > .5){
                float mapLen = unpackFloat(getCube(int(shadow.x), npos * vec3(1, -1, 1)));
                float thisLen = (len - shadow.y) / (shadow.z - shadow.y);
                
                if (thisLen < mapLen + LIGHTING_EPSILON / angle){
                    intensity += angle;
                }
            }else{
                intensity += angle;
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
                float angle = max(0.0, dot(lightNormal, npos));
                
                float intensity = 0.0;
                
                if(specular > 1.0){
                    intensity += pow(max(0., dot(reflect(-npos, lightNormal), normalize(-mvPosition.xyz))), specular);
                }
                
                if (shadow.x > .5){
                    float mapLen = unpackFloat(getCube(int(shadow.x), npos * vec3(1, -1, 1)));
                    float thisLen = (len - shadow.y) / (shadow.z - shadow.y);
                    
                    if (thisLen < mapLen + LIGHTING_EPSILON / angle){
                        intensity += angle;
                    }
                }else{
                    intensity += angle;
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
                vec3 reflection = reflect(-npos, lightNormal);
                
                float specularLight = 0.0;
                
                if(specular >= 1.0){
                    specularLight = pow(max(0., dot(reflect(-npos, lightNormal), normalize(-mvPosition.xyz))), specular);
                }
                
                float intensity = max(0., dot(lightNormal, npos)) + specularLight;
                
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
                
                vec3 reflection = reflect(-npos, lightNormal);
                
                float specularLight = 0.0;
                
                if(specular >= 1.0){
                    specularLight = pow(max(0., dot(reflect(-npos, lightNormal), normalize(-mvPosition.xyz))), specular);
                }
                
                float intensity = max(0., dot(lightNormal, npos)) + specularLight;
                
                lightMask += color * intensity * ((range - length) / range);
            }
        }else{
            return lightMask;
        }
    }
    
    return lightMask;
}

void main(void){
    {
        float xarea=gl_FragCoord.x / window.x;
        float yarea=gl_FragCoord.y / window.y;
        
        if(xarea < clip.x || yarea < clip.y || clip.x + clip.z < xarea || clip.y + clip.w < yarea){
            discard;
        }
    }
    
    vec4 mainColor = texture2D(texture, mod(texCoord, 1.));
    
    if(mainColor.w == 0.0){
        discard;
    }else{
        if(lightNormal != vec3(0)){
            mainColor *= vec4(getLightMask(), 1.0);
        }
        
        gl_FragColor=mainColor;
    }
}