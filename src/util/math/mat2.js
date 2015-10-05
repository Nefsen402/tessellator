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

Tessellator.mat2 = function (){
    var array = new Float32Array(4);
    var pos = 0;
    
    for (var i = 0, k = arguments.length; i < k; i++){
        var arg = arguments[i];
        
        if (isNaN(arg)){
            array.set(arg, pos);
            pos += arg.length;
        }else{
            array[pos++] = arg;
        };
    };
    
    if (pos === 0){
        array[0] = 1;
        array[3] = 1;
    }else if (pos === 1){
        array[3] = array[0];
    }else{
        if (pos < array.length){
            throw "too little information";
        }else if (pos > array.length){
            throw "too much information";
        };
    };
    
    array.__proto__ = Tessellator.mat2.prototype;
    return array;
};

Tessellator.mat2.prototype = Object.create(Float32Array.prototype);
Tessellator.mat2.prototype.constructor = Tessellator.mat2;

Tessellator.mat2.prototype.identity = function (scale){
    if (scale === undefined){
        scale = 1;
    }else if (scale.tween){
        scale.tween.update();
    };
    
    this[0] = scale[0];
    this[1] = 0;
    
    this[2] = 0;
    this[3] = scale[0];
    
    return this;
};

Tessellator.mat2.prototype.invert = function (){
    var a0 = this[0],
        a1 = this[1],
        a2 = this[2],
        a3 = this[3],
        
        det = a0 * a3 - a2 * a1;
    
    this[0] =  a3 / det;
    this[1] = -a1 / det;
    this[2] = -a2 / det;
    this[2] =  a0 / det;
    
    return this;
};

Tessellator.mat2.prototype.determinant = function (){
    return this[0] * this[3] - this[2] * this[1];
};

Tessellator.mat2.prototype.adjoint = function (){
    var a0 = this[0];
    this[0] =  this[3];
    this[1] = -this[1];
    this[2] = -this[2];
    this[3] = a0;
    
    return this;
};

Tessellator.mat2.prototype.multiply = function (mat){
    var a0 = this[0],
        a1 = this[1],
        a2 = this[2],
        a3 = this[3],
        
        b0 = mat[0],
        b1 = mat[1],
        b2 = mat[2],
        b3 = mat[3];
    
    this[0] = a0 * b0 + a2 * b1;
    this[1] = a1 * b0 + a3 * b1;
    this[2] = a0 * b2 + a2 * b3;
    this[3] = a1 * b2 + a3 * b3;

    return this;
};

Tessellator.mat2.prototype.random = function (scale){
    scale = Tessellator.float.forValue(scale || 1);
    
    this[0] = (Math.random() * 2 - 1) * scale;
    this[1] = (Math.random() * 2 - 1) * scale;
    this[2] = (Math.random() * 2 - 1) * scale;
    this[3] = (Math.random() * 2 - 1) * scale;
};

Tessellator.mat2.prototype.rotate = function (rad){
    if (rad.length){
        if (rad.tween) rad.tween.update();
        
        rad = Tessellator.float.forValue(rad);
    };
    
    var a0 = this[0],
        a1 = this[1],
        a2 = this[2],
        a3 = this[3],
        
        s = Math.sin(rad),
        c = Math.cos(rad);
    
    this[0] = a0 *  c + a2 * s;
    this[1] = a1 *  c + a3 * s;
    this[2] = a0 * -s + a2 * c;
    this[3] = a1 * -s + a3 * c;
    
    return this;
};

Tessellator.mat2.prototype.scale = function (s){
    if (s.tween){
        s.tween.update();
    };
    
    this[0] *= s[0];
    this[1] *= s[0];
    this[2] *= s[0];
    this[3] *= s[0];
    
    return this;
};

Tessellator.mat2.prototype.copy = function (mat){
    this.set(mat);
    
    return this;
};

Tessellator.mat2.prototype.clone = function (){
    return Tessellator.mat2(this);
};

Tessellator.mat2.prototype.transpose = function (){
    var x01 = this[1],
        x10 = this[2];
    
    this[1] = x10;
    this[2] = x01;
    
    return this;
};

Tessellator.mat2.prototype.toString = function (){
    return "mat2(" + this[0] + ", " + this[1] + ", " + this[2] + ", " + this[3] + ")";
};