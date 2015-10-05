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

Tessellator.DirectionalCamera = function (){
    this.type = Tessellator.VIEW;
    this.subtype = Tessellator.CAMERA;
    this.view = arguments[0];
    
    if (arguments.length === 4){
        this.vec = Tessellator.vec3(arguments[1], arguments[2], arguments[3]);
        this.up = Tessellator.vec3(0, 1, 0);
    }else if (arguments.length === 7){
        this.vec = Tessellator.vec3(arguments[1], arguments[2], arguments[3]);
        this.up = Tessellator.vec3(arguments[4], arguments[5], arguments[6]);
    }else{
        this.vec = arguments[1];
        this.up = arguments[2] !== undefined ? arguments[2] : Tessellator.vec3(0, 1, 0);
    };
};

Tessellator.DirectionalCamera.prototype.applyLighting = function (matrix){
    if (this.view.applyLighting) this.view.applyLighting(matrix);
    
    this.set(matrix);
};

Tessellator.DirectionalCamera.prototype.apply = function (render){
    this.view.apply(render);
    this.set(render.get("mvMatrix"));
};

Tessellator.DirectionalCamera.prototype.set = function (m){
    m.rotateVec(this.vec, this.up);
};

Tessellator.DirectionalCamera.prototype.init = function (interpreter){
    this.view.init(interpreter)
};

Tessellator.DirectionalCamera.prototype.postInit = function (interpreter){
    this.view.postInit(interpreter);
};