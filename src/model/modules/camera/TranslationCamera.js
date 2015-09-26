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

Tessellator.TranslationCamera = function (view, x, y, z){
    this.type = Tessellator.VIEW;
    this.subtype = Tessellator.CAMERA;
    
    this.view = view;
    
    if (arguments.length === 2){
        this.pos = x;
    }else{
        this.pos = Tessellator.vec3(x, y, z);
    }
}

Tessellator.TranslationCamera.prototype.applyLighting = function (matrix){
    if (this.view.applyLighting) this.view.applyLighting(matrix);
    
    this.set(matrix);
}

Tessellator.TranslationCamera.prototype.apply = function (render){
    this.view.apply(render);
    
    this.set(render.exists("mvMatrix") ? render.get("mvMatrix") : render.get("pMatrix"));
}

Tessellator.TranslationCamera.prototype.set = function (m){
    m.translate(this.pos.clone().negate());
}

Tessellator.TranslationCamera.prototype.init = function (interpreter){
    this.view.init(interpreter);
}

Tessellator.TranslationCamera.prototype.postInit = function (interpreter){
    this.view.postInit(interpreter);
}