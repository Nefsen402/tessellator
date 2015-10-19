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

Tessellator.Program.UNIFY_WINDOW = function (){
    if (this.location){
        this.gl.uniform2fv(this.location, this.value);
    };
};

Tessellator.Program.UNIFY_WINDOW.configure = function (value){
    this.value = value;
    
    this.gl.viewport(0, 0, this.value[0], this.value[1]);
};

Tessellator.Program.F_UNIFY_FUNC = function (){
    if (typeof this.value === "number"){
        this.gl.uniform1f(this.location, this.value);
    }else{
        if (this.value.tween) this.value.tween.update();
        
        this.gl.uniform1fv(this.location, this.value);
    }
};

Tessellator.Program.I_UNIFY_FUNC = function (){
    if (typeof this.value === "number"){
        this.gl.uniform1i(this.location, this.value | 0);
    }else{
        if (this.value.tween) this.value.tween.update();
        
        this.gl.uniform1i(this.location, this.value[0] | 0);
    }
};

Tessellator.Program.F2V_UNIFY_FUNC = function (){
    if (this.value.tween) this.value.tween.update();
    
    this.gl.uniform2fv(this.location, this.value);
};

Tessellator.Program.F3V_UNIFY_FUNC = function (){
    if (this.value.tween) this.value.tween.update();
    
    this.gl.uniform3fv(this.location, this.value);
};

Tessellator.Program.F4V_UNIFY_FUNC = function (){
    if (this.value.tween) this.value.tween.update();
    
    this.gl.uniform4fv(this.location, this.value);
};

Tessellator.Program.MAT4_UNIFY_FUNC = function (){
    this.gl.uniformMatrix4fv(this.location, false, this.value);
};

Tessellator.Program.MAT3_UNIFY_FUNC = function (){
    this.gl.uniformMatrix3fv(this.location, false, this.value);
};

Tessellator.Program.MAT2_UNIFY_FUNC = function (){
    this.gl.uniformMatrix2fv(this.location, false, this.value);
};

Tessellator.Program.BIND_TEXTURE_2D = function (render){
    this.gl.activeTexture(Tessellator.TEXTURE0 + Tessellator.Program.textureUnit);
    this.gl.uniform1i(this.location, Tessellator.Program.textureUnit);
    
    if (this.value){
        this.value.bind();
    }else{
        this.gl.bindTexture(Tessellator.TEXTURE_2D, null);
    };
};

Tessellator.Program.BIND_TEXTURE_2D.map = function (matrix){
    Tessellator.Program.textureUnit++;
};

Tessellator.Program.BIND_TEXTURE_2D.startMap = function (matrix, value){
    if (value && this.inherit && value.lastFrameUpdate !== this.tessellator.frame){
        value.lastFrameUpdate = this.tessellator.frame;
        
        value.configure(Tessellator.TEXTURE_2D, matrix);
    };
    
    Tessellator.Program.textureUnit = -1;
};

Tessellator.Program.BIND_TEXTURE_CUBE = function (render){
    this.gl.activeTexture(Tessellator.TEXTURE0 + Tessellator.Program.textureUnit);
    this.gl.uniform1i(this.location, Tessellator.Program.textureUnit);
    
    if (this.value){
        this.value.bind();
    }else{
        this.gl.bindTexture(Tessellator.TEXTURE_CUBE_MAP, null);
    };
};

Tessellator.Program.BIND_TEXTURE_CUBE.map = function (matrix){
    Tessellator.Program.textureUnit++;
};

Tessellator.Program.BIND_TEXTURE_CUBE.startMap = function (matrix, value){
    if (value && this.inherit && value.lastFrameUpdate !== this.tessellator.frame){
        value.lastFrameUpdate = this.tessellator.frame;
        
        value.configure(Tessellator.TEXTURE_CUBE_MAP, matrix);
    };
    
    Tessellator.Program.textureUnit = -1;
};

Tessellator.Program.MV_MATRIX_UNIFY_FUNC = function (){
    this.gl.uniformMatrix4fv(this.location, false, this.value);
    
    if (this.manager.getUniform("nMatrix")){
        this.gl.uniformMatrix3fv(this.manager.getUniform("nMatrix").location, false, Tessellator.Program.lightNormalCache.normalFromMat4(this.value));
    };
};

Tessellator.Program.lightNormalCache = Tessellator.mat3();

Tessellator.Program.DEFAULT_CONFIG = function (value){
    this.value = value;
};

Tessellator.Program.DEFAULT_UNIFORM_INHERITER = {};

(function (){
    this[Tessellator.FLOAT_MAT4] = Tessellator.Program.MAT4_UNIFY_FUNC;
    this[Tessellator.FLOAT_MAT3] = Tessellator.Program.MAT3_UNIFY_FUNC;
    this[Tessellator.FLOAT_MAT2] = Tessellator.Program.MAT2_UNIFY_FUNC;
    
    this[Tessellator.FLOAT_VEC4] = Tessellator.Program.F4V_UNIFY_FUNC;
    this[Tessellator.INT_VEC4] = Tessellator.Program.F4V_UNIFY_FUNC;
    this[Tessellator.BOOL_VEC4] = Tessellator.Program.F4V_UNIFY_FUNC;
    
    this[Tessellator.FLOAT_VEC3] = Tessellator.Program.F3V_UNIFY_FUNC;
    this[Tessellator.INT_VEC3] = Tessellator.Program.F3V_UNIFY_FUNC;
    this[Tessellator.BOOL_VEC3] = Tessellator.Program.F3V_UNIFY_FUNC;
    
    this[Tessellator.FLOAT_VEC2] = Tessellator.Program.F2V_UNIFY_FUNC;
    this[Tessellator.INT_VEC2] = Tessellator.Program.F2V_UNIFY_FUNC;
    this[Tessellator.BOOL_VEC2] = Tessellator.Program.F2V_UNIFY_FUNC;
    
    this[Tessellator.FLOAT] = Tessellator.Program.F_UNIFY_FUNC;
    this[Tessellator.INT] = Tessellator.Program.I_UNIFY_FUNC;
    
    this[Tessellator.SAMPLER_2D] = Tessellator.Program.BIND_TEXTURE_2D;
    this[Tessellator.SAMPLER_CUBE] = Tessellator.Program.BIND_TEXTURE_CUBE;
}).call (Tessellator.Program.DEFAULT_UNIFORM_INHERITER);

for (var o in Tessellator.Program.DEFAULT_UNIFORM_INHERITER){
    if (!Tessellator.Program.DEFAULT_UNIFORM_INHERITER[o].configure){
        Tessellator.Program.DEFAULT_UNIFORM_INHERITER[o].configure = Tessellator.Program.DEFAULT_CONFIG;
    };
};