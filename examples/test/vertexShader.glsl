attribute vec3 position;
attribute vec4 color;
attribute vec3 normal;
attribute vec4 material;

uniform mat4 MVMatrix;
uniform mat4 PMatrix;
uniform mat3 NMatrix;

varying vec3 lightNormal;
varying vec4 mvPosition;
varying float specular;

varying vec4 vColor;
varying lowp float useTexture;
varying lowp float useMask;

void main(void) {
	int option = int(material.x);
	
	{
		mat4 view = MVMatrix;
		
		if (option >= 4 && option <= 7){
			view[0].w += view[0].x * position.x + view[1].x * position.x + view[2].x * position.x;
			view[1].w += view[0].y * position.x + view[1].y * position.x + view[2].y * position.x;
			view[2].w += view[0].z * position.x + view[1].z * position.x + view[2].z * position.x;

			view[0].x = 1.0;
			view[0].y = 0.0;
			view[0].z = 0.0;
			
			view[1].x = 0.0;
			view[1].y = 1.0;
			view[1].z = 0.0;
			
			view[2].x = 0.0;
			view[2].y = 0.0;
			view[2].z = 1.0;
			
			mvPosition = view * vec4(0.0, 0.0, 0.0, 0.0);
			
			/*mat4 sr = mat4(sqrt(view[0].x * view[0].x + view[1].x * view[1].x + view[2].x * view[2].x));
			sr[0].w = position.x;
			sr[1].w = position.y;
			sr[2].w = position.z;
			sr[3].w = 1.0;
			
			view = sr;*/
		}else{
			mvPosition = view * vec4(position, 1.0);
		}
		
		//mat3 normal = transpose(inverse(mat3(gl_Position)))
	}
	
	gl_Position = PMatrix * mvPosition;
	specular = material.w;
	
	if (normal.x == 0.0 && normal.y == 0.0 && normal.z == 0.0){
		lightNormal = vec3(0.0, 0.0, 0.0);
	}else{
		lightNormal = normalize(NMatrix * normal);
	}
	
	vColor = color;
	
	option = int(mod(material.x, 4.0));
	
	if (option == 1){
		useTexture = 1.0;
		useMask = 0.0;
	}else if (option == 2){
		useMask = 1.0;
		useTexture = 0.0;
	}else if (option == 3){
		useMask = 1.0;
		useTexture = 1.0;
	}else{
		useMask = 0.0;
		useTexture = 0.0;
	}
}
