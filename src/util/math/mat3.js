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

Tessellator.mat3 = function (){
    var array = new Float32Array(9);
    var pos = 0;
    
    for (var i = 0, k = arguments.length; i < k; i++){
        var arg = arguments[i];
        
        if (isNaN(arg)){
            array.set(arg, pos);
            pos += arg.length;
        }else{
            array[pos++] = arg;
        }
    }
    
    if (pos === 0){
        array[0] = 1;
        array[4] = 1;
        array[8] = 1;
    }else if (pos === 1){
        array[4] = array[0];
        array[8] = array[0];
    }else{
        if (pos < array.length){
            throw "too little information";
        }else if (pos > array.length){
            throw "too much information";
        }
    }
    
    array.__proto__ = Tessellator.mat3.prototype;
    return array;
}

Tessellator.mat3.prototype = Object.create(Float32Array.prototype);
Tessellator.mat3.prototype.constructor = Tessellator.mat3;

Tessellator.mat3.prototype.clone = function (){
    return Tessellator.mat3(this);
}

Tessellator.mat3.prototype.copy = function (copy){
    if (copy.constructor === Tessellator.mat3){
        this.set(copy);
    }else if (copy.length === 16){
        this[0] = copy[ 0];
        this[1] = copy[ 1];
        this[2] = copy[ 2];
        
        this[3] = copy[ 4];
        this[4] = copy[ 5];
        this[5] = copy[ 6];
        
        this[6] = copy[ 8];
        this[7] = copy[ 9];
        this[8] = copy[10];
    }else if (copy.length === 4){
        this[0] = copy[0];
        this[1] = copy[1];
        this[2] = 0;
        
        this[3] = copy[2];
        this[4] = copy[3];
        this[5] = 0;
        
        this[6] = 0;
        this[7] = 0;
        this[8] = 1;
    }else{
        throw "invalid arguments";
    }
    
    return this;
}

Tessellator.mat3.prototype.identity = function (){
    this[0] = 1;
    this[1] = 0;
    this[2] = 0;
    
    this[3] = 0;
    this[4] = 1;
    this[5] = 0;
    
    this[6] = 0;
    this[7] = 0;
    this[8] = 1;
    
    return this;
}

Tessellator.mat3.prototype.adjoint = function (joint) {
    var
        a00 = joint[0],
        a01 = joint[1],
        a02 = joint[2],
        a10 = joint[3],
        a11 = joint[4],
        a12 = joint[5],
        a20 = joint[6],
        a21 = joint[7],
        a22 = joint[8];


    this[0] = (a11 * a22 - a12 * a21);
    this[1] = (a02 * a21 - a01 * a22);
    this[2] = (a01 * a12 - a02 * a11);
    this[3] = (a12 * a20 - a10 * a22);
    this[4] = (a00 * a22 - a02 * a20);
    this[5] = (a02 * a10 - a00 * a12);
    this[6] = (a10 * a21 - a11 * a20);
    this[7] = (a01 * a20 - a00 * a21);
    this[8] = (a00 * a11 - a01 * a10);
    
    return this;
}

Tessellator.mat3.prototype.transpose = function (){
    var
        m01 = this[1],
        m02 = this[2],
        
        m10 = this[3],
        m12 = this[5],
        
        m20 = this[6],
        m21 = this[7];
    
    this[1] = m10;
    this[2] = m20;
    
    this[3] = m01;
    this[5] = m21;
    
    this[6] = m02;
    this[7] = m12;
}

Tessellator.mat3.prototype.invert = function (){
    var
        a00 = this[0],
        a01 = this[1],
        a02 = this[2],
        
        a10 = this[3],
        a11 = this[4],
        a12 = this[5],
        
        a20 = this[6],
        a21 = this[7],
        a22 = this[8];
    
    var
        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20;


    var det = a00 * b01 + a01 * b11 + a02 * b21;


    this[0] = b01                      / det;
    this[1] = (-a22 * a01 + a02 * a21) / det;
    this[2] = (a12 * a01 - a02 * a11)  / det;
    this[3] = b11                      / det;
    this[4] = (a22 * a00 - a02 * a20)  / det;
    this[5] = (-a12 * a00 + a02 * a10) / det;
    this[6] = b21                      / det;
    this[7] = (-a21 * a00 + a01 * a20) / det;
    this[8] = (a11 * a00 - a01 * a10)  / det;
}

Tessellator.mat3.prototype.normalFromMat4 = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],


        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,


        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;


    this[0] = (a11 * b11 - a12 * b10 + a13 * b09) / det;
    this[1] = (a12 * b08 - a10 * b11 - a13 * b07) / det;
    this[2] = (a10 * b10 - a11 * b08 + a13 * b06) / det;


    this[3] = (a02 * b10 - a01 * b11 - a03 * b09) / det;
    this[4] = (a00 * b11 - a02 * b08 + a03 * b07) / det;
    this[5] = (a01 * b08 - a00 * b10 - a03 * b06) / det;


    this[6] = (a31 * b05 - a32 * b04 + a33 * b03) / det;
    this[7] = (a32 * b02 - a30 * b05 - a33 * b01) / det;
    this[8] = (a30 * b04 - a31 * b02 + a33 * b00) / det;


    return this;
}

Tessellator.mat3.prototype.multiply = function (mat){
    var a00 = this[0], a01 = this[1], a02 = this[2],
        a10 = this[3], a11 = this[4], a12 = this[5],
        a20 = this[6], a21 = this[7], a22 = this[8],

        b00 = mat[0], b01 = mat[1], b02 = mat[2],
        b10 = mat[3], b11 = mat[4], b12 = mat[5],
        b20 = mat[6], b21 = mat[7], b22 = mat[8];

    this[0] = b00 * a00 + b01 * a10 + b02 * a20;
    this[1] = b00 * a01 + b01 * a11 + b02 * a21;
    this[2] = b00 * a02 + b01 * a12 + b02 * a22;

    this[3] = b10 * a00 + b11 * a10 + b12 * a20;
    this[4] = b10 * a01 + b11 * a11 + b12 * a21;
    this[5] = b10 * a02 + b11 * a12 + b12 * a22;

    this[6] = b20 * a00 + b21 * a10 + b22 * a20;
    this[7] = b20 * a01 + b21 * a11 + b22 * a21;
    this[8] = b20 * a02 + b21 * a12 + b22 * a22;
    
    return this;
}

Tessellator.mat3.prototype.translate = function (vec){
    if (vec.tween){
        vec.tween.update();
    }
    
    this[6] += vec[0] * this[0] + vec[1] * this[3];
    this[7] += vec[0] * this[1] + vec[1] * this[4];
    this[8] += vec[0] * this[2] + vec[1] * this[5];
    
    return this;
}

Tessellator.mat3.prototype.scale = function (vec){
    if (vec.tween){
        vec.tween.update();
    }
    
    this[0] *= vec[0];
    this[1] *= vec[0];
    this[2] *= vec[0];
    
    this[3] *= vec[1];
    this[4] *= vec[1];
    this[5] *= vec[1];
    
    return this;
}

Tessellator.mat3.prototype.rotate = function (){
    if (arguments.length === 1){
        var rad = arguments[0];
        
        if (rad.length){
            rad = Tessellator.float.forValue(rad);
        }
        
        var
            s = Math.sin(rad),
            c = Math.cos(rad),
            
            a00 = this[0], a01 = this[1], a02 = this[2],
            a10 = this[3], a11 = this[4], a12 = this[5];
        
        this[0] = c * a00 + s * a10;
        this[1] = c * a01 + s * a11;
        this[2] = c * a02 + s * a12;

        this[3] = c * a10 - s * a00;
        this[4] = c * a11 - s * a01;
        this[5] = c * a12 - s * a02;
    }else{
        var
            rot = arguments[0],
            vec3 = arguments[1];
        
        if (rot.length){
            rot = Tessellator.float.forValue(rot);
        }
        
        if (vec3.tween){
            vec3.tween.update();
        }
        
        //normalize
        var
            x = vec3[0],
            y = vec3[1],
            z = vec3[2],
            
            l = Math.sqrt(x * x + y * y + z * z);
        x /= l;
        y /= l;
        z /= l;
        
        var
            s = Math.sin(rot),
            c = Math.cos(rot),
            t = 1 - c,
            
            a00 = this[0],
            a01 = this[1],
            a02 = this[2],
            
            a10 = this[3],
            a11 = this[4],
            a12 = this[5],
            
            a20 = this[6],
            a21 = this[7],
            a22 = this[8],
            
            b00 = x * x * t + c,
            b01 = y * x * t + z * s,
            b02 = z * x * t - y * s,
            
            b10 = x * y * t - z * s,
            b11 = y * y * t + c,
            b12 = z * y * t + x * s,
            
            b20 = x * z * t + y * s,
            b21 = y * z * t - x * s,
            b22 = z * z * t + c;
        
        this[0] = a00 * b00 + a10 * b01 + a20 * b02;
        this[1] = a01 * b00 + a11 * b01 + a21 * b02;
        this[2] = a02 * b00 + a12 * b01 + a22 * b02;
        
        this[3] = a00 * b10 + a10 * b11 + a20 * b12;
        this[4] = a01 * b10 + a11 * b11 + a21 * b12;
        this[5] = a02 * b10 + a12 * b11 + a22 * b12;
        
        this[6] = a00 * b20 + a10 * b21 + a20 * b22;
        this[7] = a01 * b20 + a11 * b21 + a21 * b22;
        this[8] = a02 * b20 + a12 * b21 + a22 * b22;
    }
    
    return this;
}

Tessellator.mat3.prototype.rotateVec = function (vec, up){
    if (vec.tween) vec.tween.update();
    if (up.tween) up.tween.update();
    
    var z = vec.clone().normalize();
    var x = up.clone().cross(z).normalize();
    var y = z.clone().cross(x).normalize();
    
    var
        x00 = this[0],
        x01 = this[1],
        x02 = this[2],
        x10 = this[3],
        x11 = this[4],
        x12 = this[5],
        x20 = this[6],
        x21 = this[7],
        x22 = this[8];
    
    this[0] = x[0] * x00 + y[0] * x10 + z[0] * x20;
    this[1] = x[0] * x01 + y[0] * x11 + z[0] * x21;
    this[2] = x[0] * x02 + y[0] * x12 + z[0] * x22;
    
    this[3] = x[1] * x00 + y[1] * x10 + z[1] * x20;
    this[4] = x[1] * x01 + y[1] * x11 + z[1] * x21;
    this[5] = x[1] * x02 + y[1] * x12 + z[1] * x22;
    
    this[6] = x[2] * x00 + y[2] * x10 + z[2] * x20;
    this[7] = x[2] * x01 + y[2] * x11 + z[2] * x21;
    this[8] = x[2] * x02 + y[2] * x12 + z[2] * x22;
    
    return this;
}

Tessellator.mat3.prototype.align = function (v1, v2){
    if (v1.tween) v1.tween.update();
    if (v2.tween) v2.tween.update();
    
    v1 = v1.clone().normalize();
    v2 = v2.clone().normalize();
    
    var v = v1.clone().cross(v2);
    var c = v1.clone().dot(v2);
    
    if (v[0] === 0 && v[1] === 0 && v[2] === 0){
        v = Tessellator.vec3(1, 0, 0);
    }
    
    this.rotate(Math.acos(c[0]), v);
    return this;
}

Tessellator.mat3.prototype.toString = function (){
    var str = ["mat3("];
    
    for (var i = 0; i < 8; i++){
        str.push(this[i], ", ");
    }
    
    str.push(this[8], ")");
    
    return str.join("");
}