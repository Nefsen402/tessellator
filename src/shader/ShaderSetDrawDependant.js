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
    };
    
    this.drawMode = drawMode;
    this.shaders = shaders;
    
    for (var i = 0, k = this.shaders.length; i < k; i++){
        if (this.tessellator){
            if (this.tessellator !== this.shaders[i].tessellator){
                throw "not uniform tessellator!";
            };
        }else{
            this.tessellator = this.shaders[i].tessellator;
        };
    };
    
    this.shader = shaders[shaders.length - 1];
    
    this.uniformManager = new Tessellator.UniformManagerWraper(this.shader.getUniforms());
    
    this.uniformManager.setInheriter = function (key, value){
        for (var i = 0; i < shaders.length; i++){
            shaders[i].getUniforms().setInheriter(key, value);
        };
    };
};

Tessellator.ShaderSetDrawDependant.prototype.init = function (){
    if (this.shader){
        this.shader.init();
    };
};

Tessellator.ShaderSetDrawDependant.prototype.postInit = function (){
    if (this.shader){
        this.shader.postInit();
    };
};

Tessellator.ShaderSetDrawDependant.prototype.set = function (matrix, render, draw){
    var drawMode = draw.drawMode;
    
    for (var i = 0, k = this.drawMode.length; i < k; i++){
        if (i + 1 === k || drawMode === this.drawMode[i]){
            this.shader = this.shaders[i];
            this.uniformManager.setManager(this.shader.getUniforms());
            
            return this.shader.set();
        };
    };
};

Tessellator.ShaderSetDrawDependant.prototype.getAttributes = function (){
    return this.shader.getAttributes();
};

Tessellator.ShaderSetDrawDependant.prototype.dispose = function (key, value){
    for (var i = 0, k = this.shaders.length; i < k; i++){
        this.shaders[i].dispose();
    };
};

Tessellator.ShaderSetDrawDependant.prototype.getUniforms = function (){
    return this.uniformManager;
};

Tessellator.ShaderSetDrawDependant.prototype.getUniform = function (key){
    return this.shader.getUniform(key);
};

Tessellator.ShaderSetDrawDependant.prototype.bind = function (){
    return this.shader.bind();
};

Tessellator.ShaderSetDrawDependant.prototype.isReady = function (){
    return true;
};

Tessellator.ShaderSetDrawDependant.prototype.addDefinition = function (def){
    for (var i = 0; i < this.shaders.length; i++) this.shaders[i].addDefinition(def);
};

Tessellator.ShaderSetDrawDependant.prototype.removeDefinition = function (def){
    for (var i = 0; i < this.shaders.length; i++) this.shaders[i].removeDefinition(def);
};

Tessellator.ShaderSetDrawDependant.prototype.resetDefinitions = function (){
    for (var i = 0; i < this.shaders.length; i++) this.shaders[i].resetDefinitions();
};

Tessellator.ShaderSetDrawDependant.prototype.setDefinitions = function (def){
    for (var i = 0; i < this.shaders.length; i++) this.shaders[i].setDefinitions(def[i]);
};

Tessellator.ShaderSetDrawDependant.prototype.getDefinitions = function (){
    var def = new Array(this.shaders.length);
    
    for (var i = 0; i < this.shaders.length; i++){
        def[i] = this.shaders[i].getDefinitions();
    };
    
    return def;
};