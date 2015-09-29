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


//strict mode can be used with this.
"use strict";

Tessellator.Model.prototype.setDirectionalLight = function (){
    return this.add(Tessellator.new.apply(Tessellator.DirectionalLight, arguments));
}

Tessellator.DirectionalLight = function (){
    if (arguments.length === 1){
        this.vec = arguments[0];
    }else if (arguments.length === 3){
        this.vec = Tessellator.vec3(arguments);
    }else{
        throw "invalid arguments in Tessellator.DirectionalLight";
    }
    
    this.type = Tessellator.LIGHTING_DIRECTIONAL;
    this.subtype = Tessellator.LIGHTING;
    
}

Tessellator.DirectionalLight.prototype.set = function (lighting, index, matrix){
    if (this.color.tween) this.color.tween.update();
    
    lighting[0 + index] = 2;
    lighting[1 + index] = this.color[0] * this.color[3];
    lighting[2 + index] = this.color[1] * this.color[3];
    lighting[3 + index] = this.color[2] * this.color[3];
    
    var vec = this.vec.clone().rotate(matrix).normalize();
    
    lighting[4 + index] = vec[0];
    lighting[5 + index] = vec[1];
    lighting[6 + index] = vec[2];
    
    if (this.shadowMap){
        lighting[12 + index] = 1;
        lighting[13 + index] = this.shadowRenderer.x;
        lighting[14 + index] = this.shadowRenderer.y;
        lighting[15 + index] = this.shadowRenderer.z;
    }
}

Tessellator.DirectionalLight.prototype.applyLighting = function (matrix, index, renderer){
    this.set(renderer.lightingTexture.data, index[0] * 4 * 4, matrix);
    
    if (index[0]++ * 4 * 4 >= renderer.lightingTexture.data.length){
        throw "too many lights!";
    }
}

Tessellator.DirectionalLight.prototype.init = function (interpreter){
    this.tessellator = interpreter.tessellator;
    this.color = interpreter.get("color");
    
    if (this.shadowMap){
        this.createShadow.apply(this, this.shadowMap);
    }
}

Tessellator.DirectionalLight.prototype.apply = function (matrix){
    if (this.shadowMap){
        matrix.set("shadowMap", this.shadowMap);
    }
}


Tessellator.DirectionalLight.prototype.createShadow = function (model, x, y, z, resolution){
    if (this.tessellator){
        this.shadowRenderer = new Tessellator.DirectionalLightingShadowMapRenderer(Tessellator.DEPTH_MAP_SHADER.create(tessellator), x, y, z, this);
        
        this.shadowMap = new Tessellator.TextureModel(this.tessellator, resolution * x / y, resolution * y / x, [
            new Tessellator.TextureModel.AttachmentDepthTexture(),
            new Tessellator.TextureModel.AttachmentRenderer(this.shadowRenderer, model)
        ]);
    }else{
        this.shadowMap = [model, x, y, z, resolution];
    }
}