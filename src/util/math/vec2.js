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

Tessellator.vec2 = function (){
    var array = new Float32Array(2);
    var pos = 0;
    
    for (var i = 0, k = arguments.length; i < k; i++){
        var arg = arguments[i];
        
        if (isNaN(arg)){
            if (arg.tween) arg.tween.update();
            
            array.set(arg, pos);
            pos += arg.length;
        }else{
            array[pos++] = arg;
        }
    }
    
    if (pos === 1){
        array[1] = array[0];
    }else if (pos !== 0){
        if (pos < array.length){
            throw "too little information";
        }else if (pos > array.length){
            throw "too much information";
        }
    }
    
    array.__proto__ = Tessellator.vec2.prototype;
    
    return array;
}

Tessellator.vec2.prototype = Object.create(Float32Array.prototype);
Tessellator.vec2.prototype.constructor = Tessellator.vec2;

Tessellator.vec2.prototype.clear = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = 0;
    this[1] = 0;
}

Tessellator.vec2.prototype.clone = function (){
    return Tessellator.vec2(this);
}

Tessellator.vec2.prototype.copy = function (vec2){
    if (vec2.tween) vec2.tween.update();
    
    this.set(vec2);
    
    return this;
}

Tessellator.vec2.prototype.pow = function(vec){
    if (this.tween) this.tween.cancel();
    if (vec.tween) vec.tween.update();
    
    this[0] = Math.pow(this[0], vec[0]);
    this[1] = Math.pow(this[1], vec[1]);
    
    return this;
}

Tessellator.vec2.prototype.sqrt = function(){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.sqrt(this[0]);
    this[1] = Math.sqrt(this[1]);
    
    return this;
}

Tessellator.vec2.prototype.inversesqrt = function(){
    if (this.tween) this.tween.cancel();
    
    this[0] = 1 / Math.sqrt(this[0]);
    this[1] = 1 / Math.sqrt(this[1]);
    
    return this;
}

Tessellator.vec2.prototype.abs = function(){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.abs(this[0]);
    this[1] = Math.abs(this[1]);
    
    return this;
}

Tessellator.vec2.prototype.sign = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = this[0] > 0 ? 1 : (this[0] < 0 ? -1 : this[0]);
    this[1] = this[1] > 0 ? 1 : (this[1] < 0 ? -1 : this[1]);
    
    return this;
}

Tessellator.vec2.prototype.step = function (edge){
    if (this.tween) this.tween.cancel();
    edge = Tessellator.float.forValue(edge);
    
    if (edge.length){
        this[0] = this[0] < edge[0] ? 0 : 1;
        this[1] = this[1] < edge[1] ? 0 : 1;
    }else{
        this[0] = this[0] < edge ? 0 : 1;
        this[1] = this[1] < edge ? 0 : 1;
    }
    
    return this;
}

Tessellator.vec2.prototype.floor = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.floor(this[0]);
    this[1] = Math.floor(this[1]);
    
    return this;
}

Tessellator.vec2.prototype.ceil = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.ceil(this[0]);
    this[1] = Math.ceil(this[1]);
    
    return this;
}

Tessellator.vec2.prototype.mod = function (vec){
    if (this.tween) this.tween.cancel();
    vec = Tessellator.float.forValue(vec);
    
    if (vec.length){
        this[0] = this[0] % vec[0];
        this[1] = this[1] % vec[1];
    }else{
        this[0] = this[0] % vec;
        this[1] = this[1] % vec;
    }
    
    return this;
}

Tessellator.vec2.prototype.clamp = function (min, max){
    if (this.tween) this.tween.cancel();
    min = Tessellator.float.forValue(min);
    max = Tessellator.float.forValue(max);
    
    if (!min.length) min = Tessellator.vec2(min);
    if (!max.length) max = Tessellator.vec2(max);
    
    this[0] = this[0] < min[0] ? min[0] : (this[0] > max[0] ? max[0] : this[0]);
    this[1] = this[1] < min[1] ? min[1] : (this[1] > max[1] ? max[1] : this[1]);
    
    return this;
}

Tessellator.vec2.prototype.fract = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = this[0] - Math.floor(this[0]);
    this[1] = this[1] - Math.floor(this[1]);
    
    return this;
}

Tessellator.vec2.prototype.mix = function (vec2, l){
    if (this.tween) this.tween.update();
    if (vec2.tween) vec2.tween.update();
    l = Tessellator.float.forValue(l);
    
    if (l.length){
        this[0] = this[0] + l[0] * (vec2[0] - this[0]);
        this[1] = this[1] + l[1] * (vec2[1] - this[1]);
    }else{
        this[0] = this[0] + l * (vec2[0] - this[0]);
        this[1] = this[1] + l * (vec2[1] - this[1]);
    }
    
    return this;
}

Tessellator.vec2.prototype.add = function (){
    if (this.tween) this.tween.cancel();
    
    if (arguments.length === 1){
        var vec = Tessellator.float.forValue(arguments[0]);
        
        if (vec.length){
            this[0] += vec[0];
            this[1] += vec[1];
        }else{
            this[0] += vec;
            this[1] += vec;
        }
    }else{
        this[0] += arguments[0];
        this[1] += arguments[1];
    }
    
    return this;
}

Tessellator.vec2.prototype.subtract = function (){
    if (this.tween) this.tween.cancel();
    
    if (arguments.length === 1){
        var vec = Tessellator.float.forValue(arguments[0]);
        
        if (vec.length){
            this[0] -= vec[0];
            this[1] -= vec[1];
        }else{
            this[0] -= vec;
            this[1] -= vec;
        }
    }else{
        this[0] -= arguments[0];
        this[1] -= arguments[1];
    }
    
    return this;
}

Tessellator.vec2.prototype.multiply = function (){
    if (this.tween) this.tween.cancel();
    
    if (arguments.length === 1){
        var vec = Tessellator.float.forValue(arguments[0]);
        
        if (vec.length){
            this[0] *= vec[0];
            this[1] *= vec[1];
        }else{
            this[0] *= vec;
            this[1] *= vec;
        }
    }else{
        this[0] *= arguments[0];
        this[1] *= arguments[1];
    }
    
    return this;
}

Tessellator.vec2.prototype.divide = function (){
    if (this.tween) this.tween.cancel();
    
    if (arguments.length === 1){
        var vec = Tessellator.float.forValue(arguments[0]);
        
        if (vec.length){
            this[0] /= vec[0];
            this[1] /= vec[1];
        }else{
            this[0] /= vec;
            this[1] /= vec;
        }
    }else{
        this[0] /= arguments[0];
        this[1] /= arguments[1];
    }
    
    return this;
}

Tessellator.vec2.prototype.min = function (vec){
    if (this.tween) this.tween.cancel();
    vec = Tessellator.float.forValue(vec);
    
    if (vec.length){
        this[0] = Math.min(this[0], vec[0]);
        this[1] = Math.min(this[1], vec[1]);
    }else{
        this[0] = Math.min(this[0], vec);
        this[1] = Math.min(this[1], vec);
    }
    
    return this;
}

Tessellator.vec2.prototype.max = function (vec2){
    if (this.tween) this.tween.cancel();
    vec = Tessellator.float.forValue(vec);
    
    if (vec.length){
        this[0] = Math.max(this[0], vec[0]);
        this[1] = Math.max(this[1], vec[1]);
    }else{
        this[0] = Math.max(this[0], vec);
        this[1] = Math.max(this[1], vec);
    }
    
    return this;
}

Tessellator.vec2.prototype.squaredDistance = function (vec){
    if (this.tween) this.tween.update();
    vec = Tessellator.float.forValue(vec);
    
    var x, y;
    
    if (vec.length){
        x = vec[0] - this[0];
        y = vec[1] - this[1];
    }else{
        x = vec - this[0];
        y = vec - this[1];
    }
    
    return Tessellator.float(x * x + y * y);
}

Tessellator.vec2.prototype.distance = function (vec){
    return this.squaredDistance(vec).sqrt();
}

Tessellator.vec2.prototype.dot = function (vec){
    if (this.tween) this.tween.update();
    vec = Tessellator.float.forValue(vec);
    
    if (vec.length){
        return Tessellator.float(this[0] * vec[0] + this[1] * vec[1]);
    }else{
        return Tessellator.float(this[0] * vec + this[1] * vec);
    }
}

Tessellator.vec2.prototype.squaredLength = function (){
    return this.dot(this);
}

Tessellator.vec2.prototype.len = function (){
    return this.squaredLength().sqrt();
}

Tessellator.vec2.prototype.normalize = function (){
    if (this.tween) this.tween.cancel();
    
    var d = this.len();
    this[0] /= d[0];
    this[1] /= d[0];
    
    return this;
}

Tessellator.vec2.prototype.invert = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = 1 / this[0];
    this[1] = 1 / this[1];
    
    return this;
}

Tessellator.vec2.prototype.negate = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = -this[0];
    this[1] = -this[1];
    
    return this;
}

Tessellator.vec2.prototype.random = function (scale){
    if (scale === undefined){
        scale = 1;
    }else {
        scale = Tessellator.float.forValue(scale);
    }
    
    if (scale.length){
        this[0] = (Math.random() * 2 - 1) * scale[0];
        this[1] = (Math.random() * 2 - 1) * scale[1];
    }else{
        this[0] = (Math.random() * 2 - 1) * scale;
        this[1] = (Math.random() * 2 - 1) * scale;
    }
    
    return this;
}

Tessellator.vec2.prototype.aspect = function (){
    if (this.tween) this.tween.update();
    
    return this[0] / this[1];
}

Tessellator.vec2.prototype.x = function (){
    if (this.tween) this.tween.update();
    
    return this[0];
}

Tessellator.vec2.prototype.y = function (){
    if (this.tween) this.tween.update();
    
    return this[1];
}

Tessellator.vec2.prototype.createTween = function (){
    return this.tween = new Tessellator.Tween(this);
}

Tessellator.vec2.prototype.toString = function (){
    return "vec2(" + this[0] + ", " + this[1] + ")";
}

if (Object.defineProperty) (function (){
    var getSwizzle = function (vec, s){
        if (vec.tween) vec.tween.update();
        
        var k = s.length;
        
        if (k === 1){
            return vec[s.charCodeAt(0) - 120];
        }else{
            var v = new Float32Array(k);
            
            for (var i = 0; i < k; i++){
                v[i] = vec[s.charCodeAt(i) - 120];
            }
            
            if (k === 2){
                v.__proto__ = Tessellator.vec2.prototype;
            }else if (k === 3){
                v.__proto__ = Tessellator.vec3.prototype;
            }else if (k === 4){
                v.__proto__ = Tessellator.vec4.prototype;
            }
            
            return v;
        }
    }
    
    var setSwizzle = function (vec, s, v){
        if (vec.tween) vec.tween.cancel();
        
        v = Tessellator.float.forValue(v);
        var k = s.length;
        
        if (v.length){
            for (var i = 0; i < k; i++){
                vec[s.charCodeAt(i) - 120] = v[i];
            }
        }else{
            for (var i = 0; i < k; i++){
                vec[s.charCodeAt(i) - 120] = v;
            }
        }
    }
    
    var t = [0, -1, -1, -1];
    var c = {};
    
    main:while (true){
        (function (){
            var s = "";
            for (var i = 0; i < t.length; i++){
                switch (t[i]){
                    case 0: s += "x"; break;
                    case 1: s += "y"; break;
                }
            }
            
            if (!c[s]){
                Object.defineProperty(Tessellator.vec2.prototype, s, {
                    get: function (){
                        return getSwizzle(this, s);
                    },
                    
                    set: function (v){
                        setSwizzle(this, s, v);
                    }
                });
                
                c[s] = true;
            }
        })();
        
        t[t.length - 1]++;
        
        for (var i = t.length - 1; i >= 0; i--){
            if (t[i] === 2){
                t[i] = -1;
                
                if (i === 0){
                    break main;
                }
                
                t[i - 1]++;
            }else{
                break;
            }
        }
    }
})();