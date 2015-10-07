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

Tessellator.Model.prototype.setPointLight = function (){
    return this.add(Tessellator.new.apply(Tessellator.PointLight, arguments));
};

Tessellator.PointLight = function (){
    if (arguments.length === 1 || arguments.length === 2){
        this.pos = arguments[0];
        var range = arguments[1];
        
        if (range === undefined || isNaN(range)){
            this.range = range;
        }else{
            this.range = Tessellator.float(range);
        };
    }else if (arguments.length === 3 || arguments.length === 4){
        this.pos = Tessellator.vec3(arguments[0], arguments[1], arguments[2]);
        var range = arguments[3];
        
        if (range === undefined || isNaN(range)){
            this.range = range;
        }else{
            this.range = Tessellator.float(range);
        };
    }else{
        throw "invalid arguments in Tessellator.PointLight";
    };
    
    this.type = Tessellator.LIGHTING_POINT;
    this.subtype = Tessellator.LIGHTING;
};

Tessellator.PointLight.prototype.set = function (lighting, index, matrix){
    if (this.color.tween) this.color.tween.update();
    
    lighting.set(this.color.xyz.multiply(this.color.w), 1 + index);
    
    var pos = this.pos.clone().multiply(matrix);
    lighting.set(pos, 4 + index);
    
    if (this.range){
        lighting[0 + index] = 4;
        
        lighting[7 + index] = Math.abs(this.range.x);
    }else{
        lighting[0 + index] = 3;
    };
    
    if (this.shadowMap){
        lighting[12 + index] = this.cubeIndex;
        
        lighting.set(this.shadowMap.renderer.applyViewMatrix, 13 + index);
        
        this.shadowMap.setPos(pos.negate());
    }else{
        lighting[12 + index] = 0;
    };
};

Tessellator.PointLight.prototype.createShadow = function (model, far, near, res){
    if (this.tessellator){
        this.shadowMap = new Tessellator.TextureModelCubeMap(Tessellator.DEPTH_MAP_SHADER.create(tessellator), res, model, this.pos);
        this.shadowMap.renderer.applyViewMatrix = Tessellator.vec2(near, far);
        
        if (this.cubeIndex === 1){
            model.addl(new Tessellator.Model.UniformSetter("cube1", this.shadowMap));
            model.addl(new Tessellator.Model.UniformSetter("cube2", this.shadowMap));
            model.addl(new Tessellator.Model.UniformSetter("cube3", this.shadowMap));
            model.addl(new Tessellator.Model.UniformSetter("cube4", this.shadowMap));
        }else{
            model.addl(new Tessellator.Model.UniformSetter("cube" + this.cubeIndex, this.shadowMap));
        }
    }else{
        this.shadowMap = arguments;
    };
};

Tessellator.PointLight.prototype.applyLighting = function (matrix, index, renderer){
    this.set(renderer.lightingTexture.data, index[0] * 4 * 4, matrix);
    
    if (index[0]++ * 4 * 4 >= renderer.lightingTexture.data.length){
        throw "too many lights!";
    };
};

Tessellator.Initializer.setDefault("cubeIndex", function (){
    return 0;
});

Tessellator.PointLight.prototype.init = function (interpreter){
    this.color = interpreter.get("color");
    
    this.tessellator = interpreter.tessellator;
    this.cubeIndex = interpreter.get("cubeIndex") + 1;
    interpreter.set("cubeIndex", this.cubeIndex);
    
    if (this.shadowMap){
        this.createShadow.apply(this, arguments);
    }
};