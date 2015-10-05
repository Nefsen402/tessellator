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

Tessellator.ShaderSetDrawDependant = function (drawMode, shaders){
    if (drawMode.length !== shaders.length){
        throw "the length of the arrays does not match!";
    }
    
    this.drawMode = drawMode;
    this.shaders = shaders;
    
    for (var i = 0, k = this.shaders.length; i < k; i++){
        if (this.tessellator){
            if (this.tessellator !== this.shaders[i].tessellator){
                throw "not uniform tessellator!";
            }
        }else{
            this.tessellator = this.shaders[i].tessellator;
        }
    }
}

Tessellator.ShaderSetDrawDependant.prototype.init = function (){
    if (this.shader){
        this.shader.init();
    }
}

Tessellator.ShaderSetDrawDependant.prototype.postInit = function (){
    if (this.shader){
        this.shader.postInit();
    }
}

Tessellator.ShaderSetDrawDependant.prototype.hasUniform = function (key){
    if (this.shader){
        return this.shader.hasUniform(key);
    }else{
        return this.shaders[0].hasUniform(key);
    } 
}

Tessellator.ShaderSetDrawDependant.prototype.set = function (matrix, render, draw){
    var drawMode = draw.drawMode;
    
    for (var i = 0, k = this.drawMode.length; i < k; i++){
        if (i + 1 === k || drawMode === this.drawMode[i]){
            this.shader = this.shaders[i];
            this.uniforms = this.shader.uniforms;
            this.attribs = this.shader.attribs;
            
            return this.shader.set();
        }
    }
}

Tessellator.ShaderSetDrawDependant.prototype.postSet = function (){
    this.shader.postSet();
}

Tessellator.ShaderSetDrawDependant.prototype.setInheriter = function (key, value){
    for (var i = 0, k = this.shaders.length; i < k; i++){
        this.shaders[i].setInheriter(key, value);
    }
}

Tessellator.ShaderSetDrawDependant.prototype.dispose = function (key, value){
    for (var i = 0, k = this.shaders.length; i < k; i++){
        this.shaders[i].dispose();
    }
}

Tessellator.ShaderSetDrawDependant.prototype.unify = function (matrix){
    this.shader.unify(matrix);
}

Tessellator.ShaderSetDrawDependant.prototype.preUnify = function (matrix){
    this.shader.preUnify(matrix);
}

Tessellator.ShaderSetDrawDependant.prototype.uniform = function (key, value, matrix, reason){
    this.shader.uniform(key, value, matrix, reason);
}

Tessellator.ShaderSetDrawDependant.prototype.bind = function (){
    return this.shader.bind();
}

Tessellator.ShaderSetDrawDependant.prototype.isReady = function (){
    return true;
}