precision mediump float;

const int lightCount = 32;

uniform sampler2D sampler;
uniform vec4 mask;

uniform vec4 clip;
uniform int wwidth;
uniform int wheight;

varying vec4 vColor;
varying vec3 lightNormal;
varying vec4 mvPosition;
varying float specular;

varying lowp float useTexture;
varying lowp float useMask;

uniform vec4 lights[lightCount];

vec3 getLightMask(void){
	if (lights[0].x == -1.0){
		return vec3(1, 1, 1);
	}else{
		vec3 lightMask = vec3(0, 0, 0);
		
		int skip = 0;
		
		for (int i = 0; i < lightCount; i++){
			if (skip > 0){
				skip--;
				continue;
			}
			
			vec4 light0 = lights[i + 0];
			
			int type = int(light0.x);
			vec3 color = light0.yzw;
			
			if (type == 1){ // ambient light
				lightMask += color;
				
				skip = 0;
			}else if (type == 2){ //directional light
				vec3 dir = lights[i + 1].xyz;
				
				float intensity = max(dot(lightNormal, dir), 0.0);
			
				lightMask += color * intensity;
				
				skip = 1;
			}else if (type == 3){ //point lighting
				vec3 pos = lights[i + 1].xyz;
				vec3 npos = normalize(pos - mvPosition.xyz);
				
				vec3 look = normalize(-mvPosition.xyz);
				vec3 reflection = reflect(-npos, lightNormal);
				
				float specularLight = 0.0;
				
				if (specular >= 1.0){
					specularLight = pow(max(dot(reflect(-npos, lightNormal), normalize(-mvPosition.xyz)), 0.0), specular);
				}
				
				float intensity = max(dot(lightNormal, npos), 0.0) + specularLight;
			
				lightMask += color * intensity;
				
				skip = 1;
			}else if (type == 4){ //point lighting with range
				vec4 light1 = lights[i + 1];
				
				vec3 pos = light1.xyz;
				float range = light1.w;
				
				vec3 dist = pos - mvPosition.xyz;
				
				float length = sqrt(dist.x * dist.x + dist.y * dist.y + dist.z * dist.z);
				
				if (range >= length){
					vec3 npos = dist / length;
					
					float specularLight = 0.0;
					
					if (specular > 1.0){
						specularLight = pow(max(dot(reflect(-npos, lightNormal), normalize(-mvPosition.xyz)), 0.0), specular);
					}
					
					float intensity = max(dot(lightNormal, npos), 0.0) + specularLight;
				
					lightMask += color * intensity * ((range - length) / range);
				}
				
				skip = 1;
			}else if (type == 5){ //spot light
				vec4 light1 = lights[i + 1];
				vec4 light2 = lights[i + 2];
			
				vec3 pos = light1.xyz;
				vec3 npos = normalize(pos - mvPosition.xyz);
				
				vec3 vec = light2.xyz;
				float size = light2.w; 
				
				if (dot(vec, npos) > size){
					vec3 look = normalize(-mvPosition.xyz);
					vec3 reflection = reflect(-npos, lightNormal);
					
					float specularLight = 0.0;
					
					if (specular >= 1.0){
						specularLight = pow(max(dot(reflect(-npos, lightNormal), normalize(-mvPosition.xyz)), 0.0), specular);
					}
					
					float intensity = max(dot(lightNormal, npos), 0.0) + specularLight;
				
					lightMask += color * intensity;
				}
				
				skip = 2;
			}else if (type == 6){ // spot light with range
				vec4 light1 = lights[i + 1];
				vec4 light2 = lights[i + 2];
			
				vec3 pos = light1.xyz;
				float range = light1.w;
				
				vec3 dist = pos - mvPosition.xyz;
				float length = sqrt(dist.x * dist.x + dist.y * dist.y + dist.z * dist.z);
				
				vec3 npos = dist / length;
				
				vec3 vec = light2.xyz;
				float size = light2.w; 
				
				if (range > length && dot(vec, npos) > size){
					vec3 look = normalize(-mvPosition.xyz);
					vec3 reflection = reflect(-npos, lightNormal);
					
					float specularLight = 0.0;
					
					if (specular >= 1.0){
						specularLight = pow(max(dot(reflect(-npos, lightNormal), normalize(-mvPosition.xyz)), 0.0), specular);
					}
					
					float intensity = max(dot(lightNormal, npos), 0.0) + specularLight;
					
					lightMask += color * intensity * ((range - length) / range);
				}
				
				skip = 2;
			}else{
				return lightMask;
			}
		}
		
		return lightMask;
	}
}

void main(void) {
	{
		float xarea = gl_FragCoord.x / float(wwidth);
		float yarea = gl_FragCoord.y / float(wheight);
		
		if (xarea < clip.x || yarea < clip.y || clip.x + clip.z < xarea || clip.y + clip.w < yarea){
			//discard any fragments outside of the clip.
			discard;
		}
	}
	
	vec4 mainColor;
	
	if (useTexture > 0.5){
		mainColor = texture2D(sampler, vColor.xy);
	}else{
		mainColor = vColor;
	}
	
	if (useMask > 0.5){
		mainColor *= mask;
	}
	
	if (mainColor.w == 0.0){
		discard;
	}else{
		vec3 lightMask;
		
		if (lightNormal.x != 0.0 || lightNormal.y != 0.0 || lightNormal.z != 0.0){
			lightMask = getLightMask();
		}else{
			lightMask = vec3(1.0, 1.0, 1.0);
		}
	
		mainColor *= vec4(lightMask, 1.0);
		
		gl_FragColor = mainColor;
	}
}
