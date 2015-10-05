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

Tessellator.Model.prototype.setSpotLight = function (){
    return this.add(Tessellator.new.apply(Tessellator.SpotLight, arguments));
}

Tessellator.SpotLight = function (){
    if (arguments.length === 3 || arguments.length === 4){
        this.pos = arguments[0];
        this.vec = arguments[1];
        this.angle = isNaN(arguments[2]) ? arguments[2] : Tessellator.float(arguments[2]);
        
        var range = arguments[3];
        
        if (range === undefined || isNaN(range)){
            this.range = range;
        }else{
            this.range = Tessellator.float(range);
        }
    }else if (arguments.length === 7 || arguments.length === 8){
        this.pos = Tessellator.vec3(arguments[0], arguments[1], arguments[2]);
        this.vec = Tessellator.vec3(arguments[3], arguments[4], arguments[5]);
        this.angle = isNaN(arguments[6]) ? arguments[6] : Tessellator.float(arguments[6]);
        
        var range = arguments[7];
        
        if (range === undefined || isNaN(range)){
            this.range = range;
        }else{
            this.range = Tessellator.float(range);
        }
    }
    
    this.type = Tessellator.LIGHTING_SPOT;
    this.subtype = Tessellator.LIGHTING;
}

Tessellator.SpotLight.prototype.set = function (lighting, index, matrix){
    if (this.color.tween) this.color.tween.update();
    
    lighting[1 + index] = this.color[0] * this.color[3];
    lighting[2 + index] = this.color[1] * this.color[3];
    lighting[3 + index] = this.color[2] * this.color[3];
    
    var pos = this.pos.clone().multiply(matrix);
    lighting[4 + index] = pos[0];
    lighting[5 + index] = pos[1];
    lighting[6 + index] = pos[2];
    
    var vec = this.vec.clone().rotate(matrix);
    lighting[8  + index] = vec[0];
    lighting[9  + index] = vec[1];
    lighting[10 + index] = vec[2];
    if (!this.range){
        lighting[0 + index] = 5;
        
        lighting[11 + index] = this.angle.x;
    }else{
        lighting[0 + index] = 6;
        
        lighting[7 + index] = Math.abs(this.range.x);
        lighting[11 + index] = this.angle.x;
    }
}

Tessellator.SpotLight.prototype.applyLighting = function (matrix, index, renderer){
    this.set(renderer.lightingTexture.data, index[0] * 4 * 4, matrix);
    
    if (index[0]++ * 4 * 4 >= renderer.lightingTexture.data.length){
        throw "too many lights!";
    }
}

Tessellator.SpotLight.prototype.init = function (interpreter){
    this.color = interpreter.get("color");
}