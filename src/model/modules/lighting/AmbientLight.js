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

Tessellator.Model.prototype.setAmbientLight = function (){
    return this.add(new Tessellator.AmbientLight());
}

Tessellator.AmbientLight = function (){
    this.type = Tessellator.LIGHTING_AMBIENT;
    this.subtype = Tessellator.LIGHTING;
}


Tessellator.AmbientLight.prototype.set = function (lighting, index, matrix){
    if (this.color.tween) this.color.tween.update();
    
    lighting[0 + index] = 1;
    lighting[1 + index] = this.color[0] * this.color[3];
    lighting[2 + index] = this.color[1] * this.color[3];
    lighting[3 + index] = this.color[2] * this.color[3];
}

Tessellator.AmbientLight.prototype.applyLighting = function (matrix, index, renderer){
    this.set(renderer.lightingTexture.data, index[0] * 4 * 4, matrix);
    
    if (index[0]++ * 4 * 4 >= renderer.lightingTexture.data.length){
        throw "too many lights!";
    }
}

Tessellator.AmbientLight.prototype.init = function (interpreter){
    this.color = interpreter.get("color");
}