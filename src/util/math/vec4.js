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

Tessellator.vec4 = function (){
    var array = new Float32Array(4);
    var pos = 0;
    
    for (var i = 0, k = arguments.length; i < k; i++){
        var arg = arguments[i];
        
        if (isNaN(arg)){
            if (arg.tween) arg.tween.update();
            
            array.set(arg, pos);
            pos += arg.length;
        }else{
            array[pos++] = arg;
        };
    };
    
    if (pos === 1){
        array[1] = array[0];
        array[2] = array[0];
        array[3] = array[0];
    }else if (pos !== 0){
        if (pos < array.length){
            throw "too little information";
        }else if (pos > array.length){
            throw "too much information";
        };
    };
    
    array.__proto__ = Tessellator.vec4.prototype;
    
    return array;
};

Tessellator.vec4.prototype = Object.create(Float32Array.prototype);
Tessellator.vec4.prototype.constructor = Tessellator.vec4;

Tessellator.vec4.prototype.clear = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = 0;
    this[1] = 0;
    this[3] = 0;
    this[2] = 0;
};

Tessellator.vec4.prototype.clone = function (){
    return Tessellator.vec4(this);
};

Tessellator.vec4.prototype.copy = function (vec4){
    if (vec4.tween) vec4.tween.update();
    
    this.set(vec4);
    
    return this;
};

Tessellator.vec4.prototype.pow = function(vec){
    if (this.tween) this.tween.cancel();
    vec = Tessellator.float.forValue(vec);
    
    if (vec.length){
        this[0] = Math.pow(this[0], vec[0]);
        this[1] = Math.pow(this[1], vec[1]);
        this[2] = Math.pow(this[2], vec[2]);
        this[3] = Math.pow(this[3], vec[3]);
    }else{
        this[0] = Math.pow(this[0], vec);
        this[1] = Math.pow(this[1], vec);
        this[2] = Math.pow(this[2], vec);
        this[3] = Math.pow(this[3], vec);
    };
    
    return this;
};

Tessellator.vec4.prototype.sqrt = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.sqrt(this[0]);
    this[1] = Math.sqrt(this[1]);
    this[2] = Math.sqrt(this[2]);
    this[3] = Math.sqrt(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.inversesqrt = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = 1 / Math.sqrt(this[0]);
    this[1] = 1 / Math.sqrt(this[1]);
    this[2] = 1 / Math.sqrt(this[2]);
    this[3] = 1 / Math.sqrt(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.abs = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.abs(this[0]);
    this[1] = Math.abs(this[1]);
    this[2] = Math.abs(this[2]);
    this[3] = Math.abs(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.sign = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = this[0] > 0 ? 1 : (this[0] < 0 ? -1 : this[0]);
    this[1] = this[1] > 0 ? 1 : (this[1] < 0 ? -1 : this[1]);
    this[2] = this[2] > 0 ? 1 : (this[2] < 0 ? -1 : this[2]);
    this[3] = this[3] > 0 ? 1 : (this[3] < 0 ? -1 : this[3]);
    
    return this;
};

Tessellator.vec4.prototype.step = function (edge){
    if (this.tween) this.tween.update();
    edge = Tessellator.float.forValue(edge);
    
    if (edge.length){
        this[0] = this[0] < edge[0] ? 0 : 1;
        this[1] = this[1] < edge[1] ? 0 : 1;
        this[2] = this[2] < edge[2] ? 0 : 1;
        this[3] = this[3] < edge[3] ? 0 : 1;
    }else{
        this[0] = this[0] < edge ? 0 : 1;
        this[1] = this[1] < edge ? 0 : 1;
        this[2] = this[2] < edge ? 0 : 1;
        this[3] = this[3] < edge ? 0 : 1;
    };
    
    return this;
};

Tessellator.vec4.prototype.floor = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.floor(this[0]);
    this[1] = Math.floor(this[1]);
    this[2] = Math.floor(this[2]);
    this[3] = Math.floor(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.ceil = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.ceil(this[0]);
    this[1] = Math.ceil(this[1]);
    this[2] = Math.ceil(this[2]);
    this[3] = Math.ceil(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.mod = function (vec){
    if (this.tween) this.tween.cancel();
    vec = Tessellator.float.forValue(vec);
    
    if (vec.length){
        this[0] = this[0] % vec[0];
        this[1] = this[1] % vec[1];
        this[2] = this[2] % vec[2];
        this[3] = this[3] % vec[3];
    }else{
        this[0] = this[0] % vec;
        this[1] = this[1] % vec;
        this[2] = this[2] % vec;
        this[3] = this[3] % vec;
    };
    
    return this;
};

Tessellator.vec4.prototype.clamp = function (min, max){
    if (this.tween) this.tween.cancel();
    min = Tessellator.float.forValue(min);
    max = Tessellator.float.forValue(max);
    
    if (!min.length) min = Tessellator.vec4(min);
    if (!max.length) max = Tessellator.vec4(max);
    
    this[0] = this[0] < min[0] ? min[0] : (this[0] > max[0] ? max[0] : this[0]);
    this[1] = this[1] < min[1] ? min[1] : (this[1] > max[0] ? max[1] : this[1]);
    this[2] = this[2] < min[2] ? min[2] : (this[2] > max[0] ? max[2] : this[2]);
    this[3] = this[3] < min[3] ? min[3] : (this[3] > max[0] ? max[3] : this[3]);
    
    return this;
};

Tessellator.vec4.prototype.fract = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = this[0] - Math.floor(this[0]);
    this[1] = this[1] - Math.floor(this[1]);
    this[2] = this[2] - Math.floor(this[2]);
    this[3] = this[3] - Math.floor(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.mix = function (vec, l){
    if (this.tween) this.tween.update();
    l = Tessellator.float.forValue(l);
    
    if (l.length){
        this[0] = this[0] + l[0] * (vec4[0] - this[0]);
        this[1] = this[1] + l[1] * (vec4[1] - this[1]);
        this[2] = this[2] + l[2] * (vec4[2] - this[2]);
        this[3] = this[3] + l[3] * (vec4[3] - this[3]);
    }else{
        this[0] = this[0] + l * (vec4[0] - this[0]);
        this[1] = this[1] + l * (vec4[1] - this[1]);
        this[2] = this[2] + l * (vec4[2] - this[2]);
        this[3] = this[3] + l * (vec4[3] - this[3]);
    };
    
    return this;
};

Tessellator.vec4.prototype.add = function (){
    if (this.tween) this.tween.cancel();
    
    if (arguments.length === 1){
        var vec = Tessellator.float.forValue(arguments[0]);
        
        if (vec.length){
            this[0] += vec[0];
            this[1] += vec[1];
            this[2] += vec[2];
            this[3] += vec[3];
        }else{
            this[0] += vec;
            this[1] += vec;
            this[2] += vec;
            this[3] += vec;
        };
    }else{
        this[0] += arguments[0];
        this[1] += arguments[1];
        this[2] += arguments[2];
        this[3] += arguments[3];
    };
    
    return this;
};

Tessellator.vec4.prototype.subtract = function (){
    if (this.tween) this.tween.cancel();
    
    if (arguments.length === 1){
        var vec = Tessellator.float.forValue(arguments[0]);
        
        if (vec.length){
            this[0] -= vec[0];
            this[1] -= vec[1];
            this[2] -= vec[2];
            this[3] -= vec[3];
        }else{
            this[0] -= vec;
            this[1] -= vec;
            this[2] -= vec;
            this[3] -= vec;
        };
    }else{
        this[0] -= arguments[0];
        this[1] -= arguments[1];
        this[2] -= arguments[2];
        this[3] -= arguments[3];
    };
    
    return this;
};

Tessellator.vec4.prototype.multiply = function (){
    if (this.tween) this.tween.cancel();
    
    if (arguments.length === 1){
        var vec = Tessellator.float.forValue(arguments[0]);
        
        if (vec.length === 16){
            var x = this[0],
                y = this[1],
                z = this[2],
                w = this[3];
            
            this[0] = vec[0] * x + vec[4] * y + vec[8 ] * z + vec[12] * w;
            this[1] = vec[1] * x + vec[5] * y + vec[9 ] * z + vec[13] * w;
            this[2] = vec[2] * x + vec[6] * y + vec[10] * z + vec[14] * w;
            this[3] = vec[3] * x + vec[7] * y + vec[11] * z + vec[15] * w;
        }else if (vec.length){
            this[0] *= vec[0];
            this[1] *= vec[1];
            this[2] *= vec[2];
            this[3] *= vec[3];
        }else{
            this[0] *= vec;
            this[1] *= vec;
            this[2] *= vec;
            this[3] *= vec;
        };
    }else{
        this[0] *= arguments[0];
        this[1] *= arguments[1];
        this[2] *= arguments[2];
        this[3] *= arguments[3];
    };
    
    return this;
};

Tessellator.vec4.prototype.divide = function (){
    if (this.tween) this.tween.update();
    
    if (arguments.length === 1){
        var vec = Tessellator.float.forValue(arguments[0]);
        
        if (vec.length){
            this[0] /= vec[0];
            this[1] /= vec[1];
            this[2] /= vec[2];
            this[3] /= vec[3];
        }else{
            this[0] /= vec;
            this[1] /= vec;
            this[2] /= vec;
            this[3] /= vec;
        };
    }else{
        this[0] /= arguments[0];
        this[1] /= arguments[1];
        this[2] /= arguments[2];
        this[3] /= arguments[3];
    };
    
    return this;
};

Tessellator.vec4.prototype.min = function (vec){
    if (this.tween) this.tween.cancel();
    vec = Tessellator.float.forValue(vec);
    
    if (vec.length){
        this[0] = Math.min(this[0], vec[0]);
        this[1] = Math.min(this[1], vec[1]);
        this[2] = Math.min(this[2], vec[2]);
        this[3] = Math.min(this[3], vec[3]);
    }else{
        this[0] = Math.min(this[0], vec);
        this[1] = Math.min(this[1], vec);
        this[2] = Math.min(this[2], vec);
        this[3] = Math.min(this[3], vec);
    };
    
    return this;
};

Tessellator.vec4.prototype.max = function (vec){
    if (this.tween) this.tween.update();
    vec = Tessellator.float.forValue(vec);
    
    if (vec.length){
        this[0] = Math.max(this[0], vec[0]);
        this[1] = Math.max(this[1], vec[1]);
        this[2] = Math.max(this[2], vec[2]);
        this[3] = Math.max(this[3], vec[3]);
    }else{
        this[0] = Math.max(this[0], vec);
        this[1] = Math.max(this[1], vec);
        this[2] = Math.max(this[2], vec);
        this[3] = Math.max(this[3], vec);
    };
    
    return this;
};

Tessellator.vec4.prototype.squaredDistance = function (vec){
    if (this.tween) this.tween.update();
    vec = Tessellator.float.forValue(vec);
    
    var x, y, z, w;
    
    if (vec.length){
        x = vec[0] - this[0];
        y = vec[1] - this[1];
        z = vec[2] - this[2];
        w = vec[3] - this[3];
    }else{
        x = vec - this[0];
        y = vec - this[1];
        z = vec - this[2];
        w = vec - this[3];
    };
    
    return Tessellator.float(x * x + y * y + z * z + w * w);
};

Tessellator.vec4.prototype.distance = function (vec4){
    return this.squaredDistance(vec4).sqrt();
};

Tessellator.vec4.prototype.dot = function (vec){
    if (this.tween) this.tween.update();
    vec = Tessellator.float.forValue(vec);
    
    if (vec.length){
        return Tessellator.float(this[0] * vec[0] + this[1] * vec[1] + this[2] * vec[2] + this[3] * vec[3]);
    }else{
        return Tessellator.float(this[0] * vec + this[1] * vec + this[2] * vec + this[3] * vec);
    };
};

Tessellator.vec4.prototype.squaredLength = function (){
    return this.dot(this);
};

Tessellator.vec4.prototype.len = function (){
    return this.squaredLength().sqrt();
};

Tessellator.vec4.prototype.normalize = function (){
    if (this.tween) this.tween.cancel();
    
    var d = this.len();
    this[0] /= d[0];
    this[1] /= d[0];
    this[2] /= d[0];
    this[3] /= d[0];
    
    return this;
};

Tessellator.vec4.prototype.invert = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = 1 / this[0];
    this[1] = 1 / this[1];
    this[2] = 1 / this[2];
    this[3] = 1 / this[3];
    
    return this;
};

Tessellator.vec4.prototype.negate = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = -this[0];
    this[1] = -this[1];
    this[2] = -this[2];
    this[3] = -this[3];
    
    return this;
};

Tessellator.vec4.prototype.random = function (scale){
    if (this.tween) this.tween.cancel();
    
    if (scale === undefined){
        scale = 1;
    }else{
        scale = Tessellator.float.forValue(scale);
    };
    
    if (scale.length){
        this[0] = (Math.random() * 2 - 1) * scale[0];
        this[1] = (Math.random() * 2 - 1) * scale[1];
        this[2] = (Math.random() * 2 - 1) * scale[2];
        this[3] = (Math.random() * 2 - 1) * scale[3];

    }else{
        this[0] = (Math.random() * 2 - 1) * scale;
        this[1] = (Math.random() * 2 - 1) * scale;
        this[2] = (Math.random() * 2 - 1) * scale;
        this[3] = (Math.random() * 2 - 1) * scale;
    };
    
    return this;
};

Tessellator.vec4.prototype.asin = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.asin(this[0]);
    this[1] = Math.asin(this[1]);
    this[2] = Math.asin(this[2]);
    this[3] = Math.asin(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.acos = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.acos(this[0]);
    this[1] = Math.acos(this[1]);
    this[2] = Math.acos(this[2]);
    this[3] = Math.acos(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.atan = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.atan(this[0]);
    this[1] = Math.atan(this[1]);
    this[2] = Math.atan(this[2]);
    this[3] = Math.atan(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.sin = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.sin(this[0]);
    this[1] = Math.sin(this[1]);
    this[2] = Math.sin(this[2]);
    this[3] = Math.sin(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.cos = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.cos(this[0]);
    this[1] = Math.cos(this[1]);
    this[2] = Math.cos(this[2]);
    this[3] = Math.cos(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.tan = function (){
    if (this.tween) this.tween.cancel();
    
    this[0] = Math.tan(this[0]);
    this[1] = Math.tan(this[1]);
    this[2] = Math.tan(this[2]);
    this[3] = Math.tan(this[3]);
    
    return this;
};

Tessellator.vec4.prototype.createTween = function (){
    return this.tween = new Tessellator.Tween(this);
};

Tessellator.vec4.prototype.toString = function (){
    return "vec4(" + this[0] + ", " + this[1] + ", " + this[2] + ", " + this[3] + ")";
};

if (Object.defineProperty) (function (){
    var getSwizzle = function (vec, s){
        if (vec.tween) vec.tween.update();
        
        var k = s.length;
        
        if (k === 1){
            var c = s.charCodeAt(0);
            
            if (c === 119){
                return vec[3];
            }else{
                return vec[c - 120];
            };
        }else{
            var v = new Float32Array(k);
            
            for (var i = 0; i < k; i++){
                var c = s.charCodeAt(i);
                
                if (c === 119){
                    v[i] = vec[3];
                }else{
                    v[i] = vec[c - 120];
                };
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
        var k = s.length;
        
        if (v.length){
            for (var i = 0; i < k; i++){
                var c = s.charCodeAt(i);
                
                if (c === 119){
                    vec[3] = v[i];
                }else{
                    vec[c - 120] = v[i];
                };
            };
        }else{
            for (var i = 0; i < k; i++){
                var c = s.charCodeAt(i);
                
                if (c === 119){
                    vec[3] = v;
                }else{
                    vec[c - 120] = v;
                };
            };
        };
    };
    
    var t = [0, -1, -1, -1];
    var c = {};
    
    main:while (true){
        (function (){
            var s = "";
            
            for (var i = 0; i < t.length; i++){
                switch (t[i]){
                    case 0: s += "x"; break;
                    case 1: s += "y"; break;
                    case 2: s += "z"; break;
                    case 3: s += "w"; break;
                };
            };
            
            if (!c[s]){
                Object.defineProperty(Tessellator.vec4.prototype, s, {
                    get: function (){
                        return getSwizzle(this, s);
                    },
                    
                    set: function (v){
                        setSwizzle(this, s, v);
                    }
                });
                
                c[s] = true;
            };
        })();
        
        t[t.length - 1]++;
        
        for (var i = t.length - 1; i >= 0; i--){
            if (t[i] === 4){
                t[i] = -1;
                
                if (i === 0){
                    break main;
                };
                
                t[i - 1]++;
            }else{
                break;
            };
        };
    };
})();