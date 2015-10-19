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

Tessellator.float = function (){
    var array = new Float32Array(1);
    
    if (arguments.length === 0){
        array[0] = 0;
    }else if (arguments.length === 1){
        var arg = arguments[0];
        
        if (typeof arg !== "number"){
            if (arg.length === 1){
                if (arg.tween) arg.tween.update();
                
                array[0] = arg[0];
            }else{
                throw "too much information";
            };
        }else{
            array[0] = arg;
        };
    }else{
        throw "too much information";
    };
    
    array.__proto__ = Tessellator.float.prototype;
    
    return array;
};

Tessellator.float.forValue = function (value){
    if (value.length){
        if (value.tween){
            value.tween.update();
        };
        
        if (value.length === 1){
            return value[0];
        }else{
            return value;
        };
    }else{
        return value;
    };
};

Tessellator.float.prototype = Object.create(Float32Array.prototype);
Tessellator.float.prototype.constructor = Tessellator.float;

Tessellator.float.prototype.clear = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = 0;
    
    return this;
};

Tessellator.float.prototype.clone = function (){
    return Tessellator.float(this);
};

Tessellator.float.prototype.copy = function (float){
    if (this.tween) this.tween.cancel();
    
    this[0] = Tessellator.float.forValue(float);
};

Tessellator.float.prototype.multiply = function (float){
    if (this.tween) this.tween.cancel();
    
    this[0] *= Tessellator.float.forValue(float);
    
    return this;
};

Tessellator.float.prototype.add = function (float){
    if (this.tween) this.tween.cancel();
    
    this[0] += Tessellator.float.forValue(float);
    
    return this;
};

Tessellator.float.prototype.subtract = function (float) {
    if (this.tween) this.tween.cancel();
    
    this[0] -= Tessellator.float.forValue(float);
    
    return this;
};

Tessellator.float.prototype.divide = function (float) {
    if (this.tween) this.tween.cancel();
    
    this[0] /= Tessellator.float.forValue(float);
    
    return this;
};

Tessellator.float.prototype.sqrt = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.sqrt(this[0]);
    
    return this;
};

Tessellator.float.prototype.square = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] *= this[0];
    
    return this;
};

Tessellator.float.prototype.cube = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] *= this[0] * this[0];
    
    return this;
};

Tessellator.float.prototype.min = function (min){
    if (this.tween) this.tween.cancel();
    min = Tessellator.float.forValue(min);
    
    this[0] = Math.min(min, this[0]);
    
    return this;
};

Tessellator.float.prototype.max = function (min){
    if (this.tween) this.tween.cancel();
    max = Tessellator.float.forValue(max);
    
    this[0] = Math.max(max, this[0]);
    
    return this;
};

Tessellator.float.prototype.fract = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = this[0] - Math.floor(this[0]);
    
    return this;
};

Tessellator.float.prototype.negate = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = -this[0];
    
    return this;
};

Tessellator.float.prototype.invert = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = 1 / this[0];
    
    return this;
};

Tessellator.float.prototype.inversesqrt = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = 1 / Math.sqrt(this[0]);
    
    return this;
};

Tessellator.float.prototype.pow = function (f){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.pow(this[0], Tessellator.float.forValue(f));
    
    return this;
};

Tessellator.float.prototype.round = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.round(this[0]);
    
    return this;
};

Tessellator.float.prototype.ceil = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.ceil(this[0]);
    
    return this;
};

Tessellator.float.abs = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.abs(this[0]);
    
    return this;
};

Tessellator.float.mix = function (float, l){
    if (this.tween) this.tween.cancel();
    
    float = Tessellator.float.forValue(float);
    l = Tessellator.float.forValue(l);
    
    this[0] = this[0] * (1 - l) + float * l;
    
    return this;
};

Tessellator.float.sign = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = this[0] < 0 ? -1 : (this[0] > 0 ? 1 : this[0]);
    
    return this;
};

Tessellator.float.step = function (edge){
    if (this.tween) this.tween.cancel();
    edge = Tessellator.float.forValue(edge);
    
    this[0] = this[0] < edge ? 0 : 1;
    
    return this;
};

Tessellator.float.mod = function (float){
    if (this.tween) this.tween.cancel();
    float = Tessellator.float.forValue(float);
    
    this[0] = this[0] % float;
    
    return this;
};

Tessellator.float.clamp = function (min, max){
    if (this.tween) this.tween.cancel();
    min = Tessellator.float.forValue(min);
    max = Tessellator.float.forValue(max);
    
    this[0] = this[0] < min ? min : (this[0] > max ? max : this[0]);
    
    return this;
};

Tessellator.float.prototype.random = function (scale){
    if (this.tween) this.tween.update();
    
    if (scale === undefined){
        scale = 1;
    }else{
        scale = Tessellator.float.forValue(scale);
    };
    
    this[0] = (Math.random() * 2 - 1) * scale;
    
    return this;
};

Tessellator.float.prototype.createTween = function (){
    return this.tween = new Tessellator.Tween(this);
};

Tessellator.float.prototype.toString = function (){
    return "float(" + this[0] + ")";
};

Tessellator.float.prototype.asin = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.asin(this[0]);
    
    return this;
};

Tessellator.float.prototype.acos = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.acos(this[0]);
    
    return this;
};

Tessellator.float.prototype.atan = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.atan(this[0]);
    
    return this;
};

Tessellator.float.prototype.sin = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.sin(this[0]);
    
    return this;
};

Tessellator.float.prototype.cos = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.cos(this[0]);
    
    return this;
};

Tessellator.float.prototype.tan = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.tan(this[0]);
    
    return this;
};

Tessellator.float.prototype.atan = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.atan(this[0]);
    
    return this;
};

if (Object.defineProperty) (function (){
    var getSwizzle = function (vec, s){
        if (vec.tween) vec.tween.update();
        
        var k = s.length;
        
        if (k === 1){
            return vec[0];
        }else{
            var v = new Float32Array(k);
            
            for (var i = 0; i < k; i++){
                v[i] = vec[0];
            };
            
            if (k === 2){
                v.__proto__ = Tessellator.vec2.prototype;
            }else if (k === 3){
                v.__proto__ = Tessellator.vec3.prototype;
            }else if (k === 4){
                v.__proto__ = Tessellator.vec4.prototype;
            };
            
            return v;
        };
    };
    
    var setSwizzle = function (vec, s, v){
        if (vec.tween) vec.tween.cancel();
        
        v = Tessellator.float.forValue(v);
        
        if (v.length){
            vec[0] = v[v.length - 1];
        }else{
            vec[0] = v;
        };
    };
    
    Object.defineProperty(Tessellator.float.prototype,    "x", {get: function (){return getSwizzle(this,    "x");},set: function (v){setSwizzle(this,    "x", v);}});
    Object.defineProperty(Tessellator.float.prototype,   "xx", {get: function (){return getSwizzle(this,   "xx");},set: function (v){setSwizzle(this,   "xx", v);}});
    Object.defineProperty(Tessellator.float.prototype,  "xxx", {get: function (){return getSwizzle(this,  "xxx");},set: function (v){setSwizzle(this,  "xxx", v);}});
    Object.defineProperty(Tessellator.float.prototype, "xxxx", {get: function (){return getSwizzle(this, "xxxx");},set: function (v){setSwizzle(this, "xxxx", v);}});
})();