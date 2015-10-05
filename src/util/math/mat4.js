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

Tessellator.mat4 = function (){
    var array = new Float32Array(16);
    
    var pos = 0;
    
    for (var i = 0, k = arguments.length; i < k; i++){
        var arg = arguments[i];
        
        if (typeof arg != "number"){
            array.set(arg, pos);
            pos += arg.length;
        }else{
            array[pos++] = arg;
        }
    }
    
    if (pos === 0){
        array[ 0] = 1;
        array[ 5] = 1;
        array[10] = 1;
        array[15] = 1;
    }else if (pos === 1){
        array[5] = array[0];
        array[10] = array[0];
        array[15] = array[0];
    }else{
        if (pos < array.length){
            throw "too little information";
        }else if (pos > array.length){
            throw "too much information";
        }
    }
    
    array.__proto__ = Tessellator.mat4.prototype;
    
    return array;
}

Tessellator.mat4.prototype = Object.create(Float32Array.prototype);
Tessellator.mat4.prototype.constructor = Tessellator.mat4;

Tessellator.mat4.prototype.random = function (scale){
    scale = Tessellator.float.forValue(scale || 1);
    
    this[ 0] = (Math.random() * 2 - 1) * scale;
    this[ 1] = (Math.random() * 2 - 1) * scale;
    this[ 2] = (Math.random() * 2 - 1) * scale;
    this[ 3] = (Math.random() * 2 - 1) * scale;
    
    this[ 4] = (Math.random() * 2 - 1) * scale;
    this[ 5] = (Math.random() * 2 - 1) * scale;
    this[ 6] = (Math.random() * 2 - 1) * scale;
    this[ 7] = (Math.random() * 2 - 1) * scale;
    
    this[ 8] = (Math.random() * 2 - 1) * scale;
    this[ 9] = (Math.random() * 2 - 1) * scale;
    this[10] = (Math.random() * 2 - 1) * scale;
    this[11] = (Math.random() * 2 - 1) * scale;
    
    this[12] = (Math.random() * 2 - 1) * scale;
    this[13] = (Math.random() * 2 - 1) * scale;
    this[14] = (Math.random() * 2 - 1) * scale;
    this[15] = (Math.random() * 2 - 1) * scale;
    
    return this;
}

Tessellator.mat4.prototype.clone = function (){
    return Tessellator.mat4(this);
}

Tessellator.mat4.prototype.copy = function (copy){
    if (copy.length === 16){
        this.set(copy);
    }else if (copy.length === 9){
        this[ 0] = copy[0];
        this[ 1] = copy[1];
        this[ 2] = copy[2];
        this[ 3] = 0;
        
        this[ 4] = copy[3];
        this[ 5] = copy[4];
        this[ 6] = copy[5];
        this[ 7] = 0;
        
        this[ 8] = copy[6];
        this[ 9] = copy[7];
        this[10] = copy[8];
        this[11] = 0;
        
        this[12] = 0;
        this[13] = 0;
        this[14] = 0;
        this[15] = 1;
    }else if (copy.length === 4){
        this[ 0] = copy[0];
        this[ 1] = copy[1];
        this[ 2] = 0;
        this[ 3] = 0;
        
        this[ 4] = copy[2];
        this[ 5] = copy[3];
        this[ 6] = 0;
        this[ 7] = 0;
        
        this[ 8] = 0;
        this[ 9] = 0;
        this[10] = 1;
        this[11] = 0;
        
        this[12] = 0;
        this[13] = 0;
        this[14] = 0;
        this[15] = 1;
    }else{
        throw "invalid arguments";
    }
    
    return this;
}

Tessellator.mat4.prototype.multiply = function (mat){
    if (mat.length === 16){
        var
            x00 = this[ 0],
            x01 = this[ 1],
            x02 = this[ 2],
            x03 = this[ 3],
            x10 = this[ 4],
            x11 = this[ 5],
            x12 = this[ 6],
            x13 = this[ 7],
            x20 = this[ 8],
            x21 = this[ 9],
            x22 = this[10],
            x23 = this[11],
            x30 = this[12],
            x31 = this[13],
            x32 = this[14],
            x33 = this[15],
            
            y00 = mat[ 0],
            y01 = mat[ 1],
            y02 = mat[ 2],
            y03 = mat[ 3],
            y10 = mat[ 4],
            y11 = mat[ 5],
            y12 = mat[ 6],
            y13 = mat[ 7],
            y20 = mat[ 8],
            y21 = mat[ 9],
            y22 = mat[10],
            y23 = mat[11],
            y30 = mat[12],
            y31 = mat[13],
            y32 = mat[14],
            y33 = mat[15];
        
        this[ 0] = y00 * x00 + y01 * x10 + y02 * x20 + y03 * x30;
        this[ 1] = y00 * x01 + y01 * x11 + y02 * x21 + y03 * x31;
        this[ 2] = y00 * x02 + y01 * x12 + y02 * x22 + y03 * x32;
        this[ 3] = y00 * x03 + y01 * x13 + y02 * x23 + y03 * x33;
        
        this[ 4] = y10 * x00 + y11 * x10 + y12 * x20 + y13 * x30;
        this[ 5] = y10 * x01 + y11 * x11 + y12 * x21 + y13 * x31;
        this[ 6] = y10 * x02 + y11 * x12 + y12 * x22 + y13 * x32;
        this[ 7] = y10 * x03 + y11 * x13 + y12 * x23 + y13 * x33;
        
        this[ 8] = y20 * x00 + y21 * x10 + y22 * x20 + y23 * x30;
        this[ 9] = y20 * x01 + y21 * x11 + y22 * x21 + y23 * x31;
        this[10] = y20 * x02 + y21 * x12 + y22 * x22 + y23 * x32;
        this[11] = y20 * x03 + y21 * x13 + y22 * x23 + y23 * x33;
        
        this[12] = y30 * x00 + y31 * x10 + y32 * x20 + y33 * x30;
        this[13] = y30 * x01 + y31 * x11 + y32 * x21 + y33 * x31;
        this[14] = y30 * x02 + y31 * x12 + y32 * x22 + y33 * x32;
        this[15] = y30 * x03 + y31 * x13 + y32 * x23 + y33 * x33;
    }else if (mat.length === 9){
        var
            x00 = this[ 0],
            x01 = this[ 1],
            x02 = this[ 2],
            x03 = this[ 3],
            x10 = this[ 4],
            x11 = this[ 5],
            x12 = this[ 6],
            x13 = this[ 7],
            x20 = this[ 8],
            x21 = this[ 9],
            x22 = this[10],
            x23 = this[11],
            
            y00 = mat[0],
            y01 = mat[1],
            y02 = mat[2],
            
            y10 = mat[3],
            y11 = mat[4],
            y12 = mat[5],
            
            y20 = mat[6],
            y21 = mat[7],
            y22 = mat[8];
        
        this[ 0] = y00 * x00 + y01 * x10 + y02 * x20;
        this[ 1] = y00 * x01 + y01 * x11 + y02 * x21;
        this[ 2] = y00 * x02 + y01 * x12 + y02 * x22;
        this[ 3] = y00 * x03 + y01 * x13 + y02 * x23;
        
        this[ 4] = y10 * x00 + y11 * x10 + y12 * x20;
        this[ 5] = y10 * x01 + y11 * x11 + y12 * x21;
        this[ 6] = y10 * x02 + y11 * x12 + y12 * x22;
        this[ 7] = y10 * x03 + y11 * x13 + y12 * x23;
        
        this[ 8] = y20 * x00 + y21 * x10 + y22 * x20;
        this[ 9] = y20 * x01 + y21 * x11 + y22 * x21;
        this[10] = y20 * x02 + y21 * x12 + y22 * x22;
        this[11] = y20 * x03 + y21 * x13 + y22 * x23;
    }else if (mat.length === 4){
        var
            x00 = this[ 0],
            x01 = this[ 1],
            x02 = this[ 2],
            x03 = this[ 3],
            x10 = this[ 4],
            x11 = this[ 5],
            x12 = this[ 6],
            x13 = this[ 7],
            
            y00 = mat3[0],
            y01 = mat3[1],
            
            y10 = mat3[2],
            y11 = mat3[3];
        
        this[ 0] = y00 * x00 + y01 * x10;
        this[ 1] = y00 * x01 + y01 * x11;
        this[ 2] = y00 * x02 + y01 * x12;
        this[ 3] = y00 * x03 + y01 * x13;
        
        this[ 4] = y10 * x00 + y11 * x10;
        this[ 5] = y10 * x01 + y11 * x11;
        this[ 6] = y10 * x02 + y11 * x12;
        this[ 7] = y10 * x03 + y11 * x13;
    }else{
        throw "invalid arguments";
    }
    
    return this;
}

Tessellator.mat4.prototype.transpose = function (){
    var
        x01 = this[ 1],
        x02 = this[ 2],
        x03 = this[ 3],
        
        x10 = this[ 4],
        x12 = this[ 6],
        x13 = this[ 7],
        
        x20 = this[ 8],
        x21 = this[ 9],
        x23 = this[11],
        
        x30 = this[12],
        x31 = this[13],
        x32 = this[14];
    
    this[ 1] = x10;
    this[ 2] = x20;
    this[ 3] = x30;
    
    this[ 4] = x01;
    this[ 6] = x21;
    this[ 7] = x31;
    
    this[ 8] = x02;
    this[ 9] = x12;
    this[11] = x32;
    
    this[12] = x03;
    this[13] = x13;
    this[14] = x23;
    
    return this;
}

Tessellator.mat4.prototype.invert = function (){
    var
        x00 = this[ 0],
        x01 = this[ 1],
        x02 = this[ 2],
        x03 = this[ 3],
        x10 = this[ 4],
        x11 = this[ 5],
        x12 = this[ 6],
        x13 = this[ 7],
        x20 = this[ 8],
        x21 = this[ 9],
        x22 = this[10],
        x23 = this[11],
        x30 = this[12],
        x31 = this[13],
        x32 = this[14],
        x33 = this[15];
    
    var
        y00 = x00 * x11 - x01 * x10,
        y01 = x00 * x12 - x02 * x10,
        y02 = x00 * x13 - x03 * x10,
        y03 = x01 * x12 - x02 * x11,
        y04 = x01 * x13 - x03 * x11,
        y05 = x02 * x13 - x03 * x12,
        y06 = x20 * x31 - x21 * x30,
        y07 = x20 * x32 - x22 * x30,
        y08 = x20 * x33 - x23 * x30,
        y09 = x21 * x32 - x22 * x31,
        y10 = x21 * x33 - x23 * x31,
        y11 = x22 * x33 - x23 * x32;
    
    var d = y00 * y11 - y01 * y10 + y02 * y09 + y03 * y08 - y04 * y07 + y05 * y06;
    
    this[ 0] = (x11 * y11 - x12 * y10 + x13 * y09) / d;
    this[ 1] = (x02 * y10 - x01 * y11 - x03 * y09) / d;
    this[ 2] = (x31 * y05 - x32 * y04 + x33 * y03) / d;
    this[ 3] = (x22 * y04 - x21 * y05 - x23 * y03) / d;
    this[ 4] = (x12 * y08 - x10 * y11 - x13 * y07) / d;
    this[ 5] = (x00 * y11 - x02 * y08 + x03 * y07) / d;
    this[ 6] = (x32 * y02 - x30 * y05 - x33 * y01) / d;
    this[ 7] = (x20 * y05 - x22 * y02 + x23 * y01) / d;
    this[ 8] = (x10 * y10 - x11 * y08 + x13 * y06) / d;
    this[ 9] = (x01 * y08 - x00 * y10 - x03 * y06) / d;
    this[10] = (x30 * y04 - x31 * y02 + x33 * y00) / d;
    this[11] = (x21 * y02 - x20 * y04 - x23 * y00) / d;
    this[12] = (x11 * y07 - x10 * y09 - x12 * y06) / d;
    this[13] = (x00 * y09 - x01 * y07 + x02 * y06) / d;
    this[14] = (x31 * y01 - x30 * y03 - x32 * y00) / d;
    this[15] = (x20 * y03 - x21 * y01 + x22 * y00) / d;
    
    return this;
}

Tessellator.mat4.prototype.adjoint = function(joint) {
    var
        a00 = joint[ 0],
        a01 = joint[ 1],
        a02 = joint[ 2],
        a03 = joint[ 3],
        a10 = joint[ 4],
        a11 = joint[ 5],
        a12 = joint[ 6],
        a13 = joint[ 7],
        a20 = joint[ 8],
        a21 = joint[ 9],
        a22 = joint[10],
        a23 = joint[11],
        a30 = joint[12],
        a31 = joint[13],
        a32 = joint[14],
        a33 = joint[15];


    this[ 0] =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    this[ 1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    this[ 2] =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    this[ 3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    this[ 4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    this[ 5] =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    this[ 6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    this[ 7] =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    this[ 8] =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    this[ 9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    this[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    this[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    this[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    this[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    this[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    this[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    
    return this;
}

Tessellator.mat4.prototype.translate = function (vec3){
    if (vec3.tween){
        vec3.tween.update();
    }
    
    this[12] += this[ 0] * vec3[0] + this[ 4] * vec3[1] + this[ 8] * vec3[2];
    this[13] += this[ 1] * vec3[0] + this[ 5] * vec3[1] + this[ 9] * vec3[2];
    this[14] += this[ 2] * vec3[0] + this[ 6] * vec3[1] + this[10] * vec3[2];
    this[15] += this[ 3] * vec3[0] + this[ 7] * vec3[1] + this[11] * vec3[2];
    
    return this;
}

Tessellator.mat4.prototype.identity = function (){
    this[ 0] = 1;
    this[ 1] = 0;
    this[ 2] = 0;
    this[ 3] = 0;
    
    this[ 4] = 0;
    this[ 5] = 1;
    this[ 6] = 0;
    this[ 7] = 0;
    
    this[ 8] = 0;
    this[ 9] = 0;
    this[10] = 1;
    this[11] = 0;
    
    this[12] = 0;
    this[13] = 0;
    this[14] = 0;
    this[15] = 1;
    
    return this;
}

Tessellator.mat4.prototype.scale = function (vec3){
    if (vec3.tween){
        vec3.tween.update();
    }
    
    this[ 0] *= vec3[0];
    this[ 1] *= vec3[0];
    this[ 2] *= vec3[0];
    this[ 3] *= vec3[0];
    
    this[ 4] *= vec3[1];
    this[ 5] *= vec3[1];
    this[ 6] *= vec3[1];
    this[ 7] *= vec3[1];
    
    this[ 8] *= vec3[2];
    this[ 9] *= vec3[2];
    this[10] *= vec3[2];
    this[11] *= vec3[2];
    
    return this;
}

Tessellator.mat4.prototype.rotate = function (rot, vec3){
    if (rot.tween){
        rot.tween.update();
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
        s = Math.sin(rot[0]),
        c = Math.cos(rot[0]),
        t = 1 - c,
        
        a00 = this[ 0],
        a01 = this[ 1],
        a02 = this[ 2],
        a03 = this[ 3],
        
        a10 = this[ 4],
        a11 = this[ 5],
        a12 = this[ 6],
        a13 = this[ 7],
        
        a20 = this[ 8],
        a21 = this[ 9],
        a22 = this[10],
        a23 = this[11],
        
        b00 = x * x * t + c,
        b01 = y * x * t + z * s,
        b02 = z * x * t - y * s,
        
        b10 = x * y * t - z * s,
        b11 = y * y * t + c,
        b12 = z * y * t + x * s,
        
        b20 = x * z * t + y * s,
        b21 = y * z * t - x * s,
        b22 = z * z * t + c;
    
    this[ 0] = a00 * b00 + a10 * b01 + a20 * b02;
    this[ 1] = a01 * b00 + a11 * b01 + a21 * b02;
    this[ 2] = a02 * b00 + a12 * b01 + a22 * b02;
    this[ 3] = a03 * b00 + a13 * b01 + a23 * b02;
    this[ 4] = a00 * b10 + a10 * b11 + a20 * b12;
    this[ 5] = a01 * b10 + a11 * b11 + a21 * b12;
    this[ 6] = a02 * b10 + a12 * b11 + a22 * b12;
    this[ 7] = a03 * b10 + a13 * b11 + a23 * b12;
    this[ 8] = a00 * b20 + a10 * b21 + a20 * b22;
    this[ 9] = a01 * b20 + a11 * b21 + a21 * b22;
    this[10] = a02 * b20 + a12 * b21 + a22 * b22;
    this[11] = a03 * b20 + a13 * b21 + a23 * b22;
    
    return this;
}

Tessellator.mat4.prototype.rotateX = function (rad) {
    if (rad.tween){
        rad.tween.update();
    }
    
    var s = Math.sin(rad[0]),
        c = Math.cos(rad[0]);
    
    var
        x10 = this[4],
        x11 = this[5],
        x12 = this[6],
        x13 = this[7];
    
    this[ 4] = this[ 4] * c + this[ 8] * s;
    this[ 5] = this[ 5] * c + this[ 9] * s;
    this[ 6] = this[ 6] * c + this[10] * s;
    this[ 7] = this[ 7] * c + this[11] * s;
    this[ 8] = this[ 8] * c - x10 * s;
    this[ 9] = this[ 9] * c - x11 * s;
    this[10] = this[10] * c - x12 * s;
    this[11] = this[11] * c - x13 * s;
    
    return this;
}

Tessellator.mat4.prototype.rotateY = function (rad) {
    if (rad.tween){
        rad.tween.update();
    }
    
    var s = Math.sin(rad[0]),
        c = Math.cos(rad[0]);
    
    //cache values
    var
        x00 = this[0],
        x01 = this[1],
        x02 = this[2],
        x03 = this[3];
    
    this[ 0] = x00 * c - this[ 8] * s;
    this[ 1] = x01 * c - this[ 9] * s;
    this[ 2] = x02 * c - this[10] * s;
    this[ 3] = x03 * c - this[11] * s;
    this[ 8] = x00 * s + this[ 8] * c;
    this[ 9] = x01 * s + this[ 9] * c;
    this[10] = x02 * s + this[10] * c;
    this[11] = x03 * s + this[11] * c;
    
    return this;
}

Tessellator.mat4.prototype.rotateZ = function (rad) {
    if (rad.tween){
        rad.tween.update();
    }
    
    var s = Math.sin(rad[0]),
        c = Math.cos(rad[0]);
    
    //cache values
    var
        x00 = this[0],
        x01 = this[1],
        x02 = this[2],
        x03 = this[3];
    
    this[0] = this[0] * c + this[4] * s;
    this[1] = this[1] * c + this[5] * s;
    this[2] = this[2] * c + this[6] * s;
    this[3] = this[3] * c + this[7] * s;
    this[4] = this[4] * c - x00 * s;
    this[5] = this[5] * c - x01 * s;
    this[6] = this[6] * c - x02 * s;
    this[7] = this[7] * c - x03 * s;
    
    return this;
}

Tessellator.mat4.prototype.rotateVec = function (vec, up){
    if (vec.tween) vec.tween.update();
    if (up.tween) up.tween.update();
    
    var z = vec.clone().normalize();
    var x = up.clone().cross(z).normalize();
    var y = z.clone().cross(x).normalize();
    
    var
        x00 = this[ 0],
        x01 = this[ 1],
        x02 = this[ 2],
        x03 = this[ 3],
        x10 = this[ 4],
        x11 = this[ 5],
        x12 = this[ 6],
        x13 = this[ 7],
        x20 = this[ 8],
        x21 = this[ 9],
        x22 = this[10],
        x23 = this[11];
    
    this[ 0] = x[0] * x00 + y[0] * x10 + z[0] * x20;
    this[ 1] = x[0] * x01 + y[0] * x11 + z[0] * x21;
    this[ 2] = x[0] * x02 + y[0] * x12 + z[0] * x22;
    this[ 3] = x[0] * x03 + y[0] * x13 + z[0] * x23;
    
    this[ 4] = x[1] * x00 + y[1] * x10 + z[1] * x20;
    this[ 5] = x[1] * x01 + y[1] * x11 + z[1] * x21;
    this[ 6] = x[1] * x02 + y[1] * x12 + z[1] * x22;
    this[ 7] = x[1] * x03 + y[1] * x13 + z[1] * x23;
    
    this[ 8] = x[2] * x00 + y[2] * x10 + z[2] * x20;
    this[ 9] = x[2] * x01 + y[2] * x11 + z[2] * x21;
    this[10] = x[2] * x02 + y[2] * x12 + z[2] * x22;
    this[11] = x[2] * x03 + y[2] * x13 + z[2] * x23;
    
    return this;
}

Tessellator.mat4.prototype.align = function (v1, v2){
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

Tessellator.mat4.prototype.toString = function (){
    var str = ["mat4("];
    
    for (var i = 0; i < 15; i++){
        str.push(this[i], ", ");
    }
    
    str.push(this[15], ")");
    
    return str.join("");
}