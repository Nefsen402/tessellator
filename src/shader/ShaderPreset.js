/**
 * Copyright (c) 2015, Alexander Orzechowski.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


/**
 * Currently in beta stage. Changes can and will be made to the core mechanic
 * making this not backwards compatible.
 * 
 * Github: https://github.com/Need4Speed402/tessellator
 */

Tessellator.ShaderPreset = function (){
    if (arguments.length === 2){
        this.configureCreate(arguments[0], arguments[1]);
    }else{
        this.create = arguments[0];
    };
};

Tessellator.ShaderPreset.prototype.configureCreate = function (type, code){
    this.shaders = [];
    this.type = type;
    
    this.create = function (tessellator){
        for (var i = 0; i < this.shaders.length; i++){
            if (this.shaders[i][0] === tessellator){
                return this.shaders[i][1];
            };
        };
        
        var shader = new Tessellator.Shader(tessellator, type).load(code);
        
        this.shaders.push([tessellator, shader]);
        
        return shader;
    };
};

Tessellator.ShaderPreset.prototype.configureDrawDependant = function (svert1, sfrag1, svert2, sfrag2, svert3, sfrag3){
    this.create = function (tessellator){
        return new Tessellator.ShaderSetDrawDependant(
            [
                Tessellator.COLOR,
                Tessellator.LINE,
                Tessellator.TEXTURE
            ],
            [
                tessellator.createShaderProgram(svert1, sfrag1),
                tessellator.createShaderProgram(svert3, sfrag3),
                tessellator.createShaderProgram(svert2, sfrag2),
            ]
        );
    };
    
    return this;
};

Tessellator.ShaderPreset.prototype.configureStandardPair = function (svert, sfrag){
    this.create = function (tessellator) {
        return tessellator.createShaderProgram(svert, sfrag);
    };
    
    return this;
};

Tessellator.PIXEL_SHADER_VERTEX_SHADER = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "precision lowp float;attribute vec2 position;uniform vec2 aspect;varying vec2 texturePos;void main(void){texturePos=(position+1.0)/2.0;gl_Position=vec4(position*(aspect+1.),0.0,1.0);}");
Tessellator.ATLAS_ANIMATION_VERTEX_SHADER = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "precision lowp float;attribute vec2 position;attribute vec2 textureCoord;varying vec2 texturePos;void main(void){texturePos=textureCoord;gl_Position=vec4(position,0.0,1.0);}");
Tessellator.ATLAS_VERTEX_SHADER = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "precision lowp float;attribute vec2 position;uniform vec2 atlasDims;uniform vec2 atlas;varying vec2 texturePos;void main(void){texturePos=(position+1.0)/2.0;gl_Position=vec4((atlas+texturePos)/atlasDims*2.0-1.0,0.0,1.0);}");

Tessellator.PIXEL_SHADER_BLACK = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;void main(void){gl_FragColor=vec4(0,0,0,1);}");
Tessellator.PIXEL_SHADER_WHITE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;void main(void){gl_FragColor=vec4(1,1,1,1);}");
Tessellator.PIXEL_SHADER_COLOR = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;uniform vec4 color;varying vec2 texturePos;void main(void){gl_FragColor=color;}");
Tessellator.PIXEL_SHADER_PASS = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,texturePos);}");
Tessellator.PIXEL_SHADER_RGB = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=vec4(texture2D(sampler,texturePos).xyz,1);}");
Tessellator.PIXEL_SHADER_FLIP_X = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,vec2(1.-texturePos.x,texturePos.y));}");
Tessellator.PIXEL_SHADER_FLIP_Y = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,vec2(texturePos.x,1.-texturePos.y));}");
Tessellator.PIXEL_SHADER_BLACK_AND_WHITE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);float color=(o.x+o.y+o.z)/3.0;gl_FragColor=vec4(color,color,color,o.w);}");
Tessellator.PIXEL_SHADER_INVERT_COLOR = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(1.0-o.xyz,o.w);}");
Tessellator.PIXEL_SHADER_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform vec3 mask;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);float color=(o.x*mask.x+o.y*mask.y+o.z*mask.z)/(mask.x+mask.y+mask.z);gl_FragColor=vec4(vec3(color)*mask, o.w);}");
Tessellator.PIXEL_SHADER_MASK = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform vec4 mask;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=o*mask;}");
Tessellator.PIXEL_SHADER_RED_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(o.x,0,0,o.w);}");
Tessellator.PIXEL_SHADER_GREEN_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(0,o.y,0,o.w);}");
Tessellator.PIXEL_SHADER_BLUE_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(0,0,o.z,o.w);}");
Tessellator.PIXEL_SHADER_QUALITY_FILTER = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;uniform float quality;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(floor(o.xyz*quality+0.5)/quality,o.w);}");
Tessellator.PIXEL_SHADER_NOISE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;uniform sampler2D sampler;uniform float time,intensity;uniform vec2 window;varying vec2 texturePos;float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}float rand(float m){return tan(rand(vec2(gl_FragCoord.x/window.x*cos(time)*3.243,gl_FragCoord.y/window.y/tan(time*5.9273)*.918)*m));}void main(void){vec4 c=texture2D(sampler,texturePos);c.xyz+=(vec3(rand(1.+c.z),rand(1.72+c.x),rand(.829+c.y))*2.-1.)*intensity;gl_FragColor=c;}");
Tessellator.PIXEL_SHADER_BWNOISE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;uniform sampler2D sampler;uniform float time,intensity;uniform vec2 window;varying vec2 texturePos;float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}float rand(float m){return tan(rand(vec2(gl_FragCoord.x/window.x*cos(time)*3.243,gl_FragCoord.y/window.y/tan(time*5.9273)*.918)*m));}void main(void){vec4 c=texture2D(sampler,texturePos);c.xyz+=(vec3(rand(1.+dot(c.xyz, cross(c.yxz, c.zyx))))*2.-1.)*intensity;gl_FragColor=c;}");
Tessellator.PIXEL_SHADER_TRANSLATE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform mat2 translate;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,(texturePos*2.-1.)*translate/2.+.5);}");
Tessellator.PIXEL_SHADER_DEPTH = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,texturePos).xxxw;}");

Tessellator.PIXEL_SHADER_CUBE_MAP = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform mat4 perspective;uniform samplerCube sampler;void main(void){vec4 pos=vec4(texturePos*2.-1.,1,1)*perspective;gl_FragColor=textureCube(sampler,pos.xyz/pos.w);}");

Tessellator.PIXEL_SHADER_BLEND = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){gl_FragColor=texture2D(sampler,texturePos)*(1.-weight)+texture2D(sampler2,texturePos)*weight;}");
Tessellator.PIXEL_SHADER_SLIDE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){vec2 pos=texturePos;pos.x+=weight;if(pos.x<1.){gl_FragColor=texture2D(sampler,pos);}else{gl_FragColor=texture2D(sampler2,vec2(texturePos.x-(1.-weight),texturePos.y));}}");
Tessellator.PIXEL_SHADER_SLIDE_IN = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){gl_FragColor=texture2D(sampler,texturePos);if(texturePos.x+weight>1.){gl_FragColor=texture2D(sampler2,vec2(texturePos.x-(1.-weight),texturePos.y));}}");
Tessellator.PIXEL_SHADER_SLICE_IN = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;uniform vec2 window;void main(void){gl_FragColor=texture2D(sampler,texturePos);bool dir=int(mod(gl_FragCoord.y/window.y*8.,2.))==0;if(dir?texturePos.x-weight<0.:texturePos.x+weight>1.){gl_FragColor=texture2D(sampler2,vec2(dir?texturePos.x+(1.-weight):texturePos.x-(1.-weight),texturePos.y));}}");
Tessellator.PIXEL_SHADER_RADIAL = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision lowp float;varying vec2 texturePos;uniform vec2 window;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){vec2 cube=(gl_FragCoord.xy/window*2.-1.);if(length(cube)>weight*sqrt(2.)){gl_FragColor=texture2D(sampler,texturePos);}else{gl_FragColor=texture2D(sampler2, texturePos);}}");

Tessellator.PIXEL_SHADER_BLUR = new Tessellator.ShaderPreset(function (tessellator, resX, resY){
    return tessellator.createPixelShader("precision highp float;const int resX=" + (resX | 5) + ",resY=" + (resY | 4) + ";uniform float intensity;const float TAU=atan(1.0)*8.0;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 color=texture2D(sampler,texturePos);int index=1;for(int y=1;y<=resY;y++){float len=float(y)/float(resY)*intensity;for(int x=0;x<resX;x++){index++;float rad=float(x)/float(resX)*TAU;color+=texture2D(sampler,texturePos+vec2(sin(rad),cos(rad))*len/16.0);}}gl_FragColor=color/float(index);}");
});

Tessellator.ATLAS_SHADER = new Tessellator.ShaderPreset().configureStandardPair(
    Tessellator.ATLAS_VERTEX_SHADER,
    Tessellator.PIXEL_SHADER_MASK
    
);

Tessellator.ATLAS_SHADER_ANIMATION = new Tessellator.ShaderPreset().configureStandardPair(
    Tessellator.ATLAS_ANIMATION_VERTEX_SHADER,
    Tessellator.PIXEL_SHADER_PASS
);

Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_COLOR = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "attribute vec3 position;attribute vec4 color;attribute vec3 normal;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec3 lightNormal;varying vec4 mvPosition;varying vec4 vColor;void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;lightNormal=normalize(nMatrix*normal);vColor=color;}");
Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_COLOR = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision mediump float;const int lightCount=32;uniform vec4 clip;uniform vec2 window;uniform float specular;varying vec4 vColor;varying vec3 lightNormal;varying vec4 mvPosition;uniform sampler2D lights,shadowMap;vec3 getLightMask(void){vec3 lightMask=vec3(0);for(float i=0.;i<256.;i++){vec4 light0=texture2D(lights,vec2(0./4.,i/256.));int type=int(light0.x);vec3 color=light0.yzw;if(type==0){lightMask+=color;break;}else if(type==1){lightMask+=color;}else if(type==2){vec3 dir=texture2D(lights,vec2(1./4.,i/256.)).xyz;float intensity=max(0.,dot(lightNormal,dir));vec4 shadow=texture2D(lights,vec2(3./4.,i/256.));if(shadow.x>.5){vec3 pos=texture2D(lights, vec2(2./4.,i/256.)).xyz;lightMask=vec3(length(shadow.w-mvPosition.xyz*dir))/50.;/*npos.xy=npos.xy/shadow.yz*4.+.5;vec2 depthMap=texture2D(shadowMap,npos.xy).xw;float depth=abs(depthMap.x-npos.z);lightMask=vec3(depth);*/}else{lightMask+=color*intensity;}}else if(type==3){vec3 pos=texture2D(lights,vec2(1./4.,i/256.)).xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(0.,dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz))),specular);}float intensity=max(0.,dot(lightNormal,npos))+specularLight;lightMask+=color*intensity;}else if(type==4){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float specularLight=0.0;if(specular>1.0){specularLight=pow(max(0.,dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz))),specular);}float intensity=max(0.,dot(lightNormal,npos))+specularLight;lightMask+=color*intensity*((range-length)/range);}}else if(type==5){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 light2=texture2D(lights,vec2(2./4.,i/256.));vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(0.,dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz))),specular);}float intensity=max(0.,dot(lightNormal,npos))+specularLight;lightMask+=color*intensity;}}else if(type==6){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 light2=texture2D(lights,vec2(2./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(0.,dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz))),specular);}float intensity=max(0.,dot(lightNormal,npos))+specularLight;lightMask+=color*intensity*((range-length)/range);}}else{return lightMask;}}return lightMask;}void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=vColor;if(mainColor.w==0.0){discard;}else{if(lightNormal.x!=0.0||lightNormal.y!=0.0||lightNormal.z!=0.0){mainColor*=vec4(getLightMask(),1.0);}gl_FragColor=mainColor;}}");
Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_TEXTURE = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "attribute vec3 position;attribute vec2 color;attribute vec3 normal;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec3 lightNormal;varying vec4 mvPosition;varying vec2 vTexture;void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;lightNormal=normalize(nMatrix*normal);vTexture=color;}");
Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_TEXTURE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision mediump float;const int lightCount=32;uniform sampler2D texture;uniform vec4 mask;uniform vec4 clip;uniform vec2 window;uniform float specular;varying vec2 vTexture;varying vec3 lightNormal;varying vec4 mvPosition;uniform sampler2D lights;vec3 getLightMask(void){vec3 lightMask=vec3(0);for(float i=0.;i<256.;i++){vec4 light0=texture2D(lights,vec2(0./4.,i/256.));int type=int(light0.x);vec3 color=light0.yzw;if(type==0){lightMask+=color;break;}else if(type==1){lightMask+=color;}else if(type==2){vec3 dir=texture2D(lights,vec2(1./4.,i/256.)).xyz;float intensity=max(0.,dot(lightNormal,dir));lightMask+=color*intensity;}else if(type==3){vec3 pos=texture2D(lights,vec2(1./4.,i/256.)).xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(0.,dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz))),specular);}float intensity=max(0.,dot(lightNormal,npos))+specularLight;lightMask+=color*intensity;}else if(type==4){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float specularLight=0.0;if(specular>1.0){specularLight=pow(max(0.,dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz))),specular);}float intensity=max(0.,dot(lightNormal,npos))+specularLight;lightMask+=color*intensity*((range-length)/range);}}else if(type==5){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 light2=texture2D(lights,vec2(2./4.,i/256.));vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(0.,dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz))),specular);}float intensity=max(0.,dot(lightNormal,npos))+specularLight;lightMask+=color*intensity;}}else if(type==6){vec4 light1=texture2D(lights,vec2(1./4.,i/256.));vec4 light2=texture2D(lights,vec2(2./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(0.,dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz))),specular);}float intensity=max(0.,dot(lightNormal,npos))+specularLight;lightMask+=color*intensity*((range-length)/range);}}else{return lightMask;}}return lightMask;}void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=texture2D(texture,vTexture)*mask;if(mainColor.w==0.0){discard;}else{if(lightNormal.x!=0.0||lightNormal.y!=0.0||lightNormal.z!=0.0){mainColor.xyz*=getLightMask();}gl_FragColor=mainColor;}}");

Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_COLOR = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "attribute vec3 position;attribute vec4 color;attribute vec3 normal;const int lightCount=32;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;vec3 lightNormal;vec4 mvPosition;varying vec4 vColor;uniform sampler2D lights;vec3 getLightMask(void){vec3 lightMask=vec3(0);for(float i=0.;i<256.;i++){vec4 light0=texture2D(lights, vec2(0./4.,i/256.));int type=int(light0.x);vec3 color=light0.yzw;if(type==0){lightMask+=color;break;}else if(type==1){lightMask+=color;}else if(type==2){vec3 dir=texture2D(lights, vec2(1./4.,i/256.)).xyz;float intensity=max(0.,dot(lightNormal,dir));lightMask+=color*intensity;}else if(type==3){vec3 pos=texture2D(lights, vec2(1./4.,i/256.)).xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(0.,dot(lightNormal,npos));lightMask+=color*intensity;}else if(type==4){vec4 light1=texture2D(lights, vec2(1./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float intensity=max(0.,dot(lightNormal,npos));lightMask+=color*intensity*((range-length)/range);}}else if(type==5){vec4 light1=texture2D(lights, vec2(1./4.,i/256.));vec4 light2=texture2D(lights, vec2(2./4.,i/256.));vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(0.,dot(lightNormal,npos));lightMask+=color*intensity;}}else if(type==6){vec4 light1=texture2D(lights, vec2(1./4.,i/256.));vec4 light2=texture2D(lights, vec2(2./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(0.,dot(lightNormal,npos));lightMask+=color*intensity*((range-length)/range);}}else{return lightMask;}}return lightMask;}void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;vColor=color;lightNormal=normalize(nMatrix*normal);vColor.rgb*=getLightMask();}");
Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_COLOR = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision mediump float;uniform vec4 clip;uniform vec2 window;varying vec4 vColor;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}if(vColor.w==0.0){discard;}else{gl_FragColor=vColor;}}");
Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_TEXTURE = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "attribute vec3 position;attribute vec2 color;attribute vec3 normal;const int lightCount=32;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec2 vTexture;varying vec3 lightMask;vec3 lightNormal;vec4 mvPosition;uniform sampler2D lights;vec3 getLightMask(void){vec3 lightMask=vec3(0);for(float i=0.;i<256.;i++){vec4 light0=texture2D(lights, vec2(0./4.,i/256.));int type=int(light0.x);vec3 color=light0.yzw;if(type==0){lightMask+=color;break;}else if(type==1){lightMask+=color;}else if(type==2){vec3 dir=texture2D(lights, vec2(1./4.,i/256.)).xyz;float intensity=max(0.,dot(lightNormal,dir));lightMask+=color*intensity;}else if(type==3){vec3 pos=texture2D(lights, vec2(1./4.,i/256.)).xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(0.,dot(lightNormal,npos));lightMask+=color*intensity;}else if(type==4){vec4 light1=texture2D(lights, vec2(1./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float intensity=max(0.,dot(lightNormal,npos));lightMask+=color*intensity*((range-length)/range);}}else if(type==5){vec4 light1=texture2D(lights, vec2(1./4.,i/256.));vec4 light2=texture2D(lights, vec2(2./4.,i/256.));vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(0.,dot(lightNormal,npos));lightMask+=color*intensity;}}else if(type==6){vec4 light1=texture2D(lights, vec2(1./4.,i/256.));vec4 light2=texture2D(lights, vec2(2./4.,i/256.));vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(0.,dot(lightNormal,npos));lightMask+=color*intensity*((range-length)/range);}}else{return lightMask;}}return lightMask;}void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;lightNormal=normalize(nMatrix*normal);lightMask=getLightMask();vTexture=color;}");
Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_TEXTURE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision mediump float;uniform sampler2D texture;uniform vec4 mask;uniform vec4 clip;uniform vec2 window;varying vec2 vTexture;varying vec3 lightMask;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=texture2D(texture,vTexture)*mask;mainColor.xyz*=lightMask;if(mainColor.w==0.0){discard;}else{gl_FragColor=mainColor;}}");

Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "attribute vec3 position;attribute vec4 color;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 vColor;void main(void){gl_Position=pMatrix*mvMatrix*vec4(position,1.0);vColor=color;}");
Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision mediump float;uniform vec4 clip;uniform vec2 window;varying vec4 vColor;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}if(vColor.w==0.0){discard;}else{gl_FragColor=vColor;}}");
Tessellator.MODEL_VIEW_VERTEX_SHADER_TEXTURE = new Tessellator.ShaderPreset(Tessellator.VERTEX_SHADER, "attribute vec3 position;attribute vec2 color;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec2 vTexture;void main(void){gl_Position=pMatrix*mvMatrix*vec4(position,1.0);vTexture=color;}");
Tessellator.MODEL_VIEW_FRAGMENT_SHADER_TEXTURE = new Tessellator.ShaderPreset(Tessellator.FRAGMENT_SHADER, "precision mediump float;uniform sampler2D texture;uniform vec4 mask;uniform vec4 clip;uniform vec2 window;varying vec2 vTexture;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=texture2D(texture,vTexture)*mask;if(mainColor.w==0.0){discard;}else{gl_FragColor=mainColor;}}");

Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_SHADER = new Tessellator.ShaderPreset().configureDrawDependant(
    Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_COLOR,
    Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_COLOR,
    Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_TEXTURE,
    Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_TEXTURE,
    Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR,
    Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR
);

Tessellator.MODEL_VIEW_VERTEX_LIGHTING_SHADER = new Tessellator.ShaderPreset().configureDrawDependant(
    Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_COLOR,
    Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_COLOR,
    Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_TEXTURE,
    Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_TEXTURE,
    Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR,
    Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR
);

Tessellator.MODEL_VIEW_SHADER = new Tessellator.ShaderPreset().configureDrawDependant(
    Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR,
    Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR,
    Tessellator.MODEL_VIEW_VERTEX_SHADER_TEXTURE,
    Tessellator.MODEL_VIEW_FRAGMENT_SHADER_TEXTURE,
    Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR,
    Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR
);

Tessellator.DEPTH_MAP_VERTEX_SHADER = "attribute vec3 position;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 vecp;varying lowp float hasNormal;void main(void){vecp=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*vecp;}";
Tessellator.DEPTH_MAP_FRAGMENT_SHADER = "precision highp float;varying vec4 vecp;uniform vec2 viewBounds;vec4 packFloat(float value){vec4 res=fract(value*vec4(256.0*256.0*256.0,256.0*256.0,256.0,1.0));res-=res.xxyz*vec4(0.0,vec3(1.0/256.0));return res;}void main(void){gl_FragColor=packFloat((length(vecp)-viewBounds.x)/(viewBounds.y-viewBounds.x));}";

Tessellator.DEPTH_MAP_SHADER = new Tessellator.ShaderPreset().configureStandardPair(
    Tessellator.DEPTH_MAP_VERTEX_SHADER,
    Tessellator.DEPTH_MAP_FRAGMENT_SHADER
);