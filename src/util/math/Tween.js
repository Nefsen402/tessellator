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

Tessellator.Tween = function (vec){
    this.vec = vec;
    
    this.directives = [];
    this.directiveStartTime = null;
    this.loopDirectives = false;
    
    this.updated = false;
    this.lock = null;
};

Tessellator.Tween.locked = null;

Tessellator.Tween.lock = function (id){
    this.locked = id;
};

Tessellator.Tween.unlock = function (){
    this.locked = null;
};

Tessellator.Tween.prototype.getVec = function (){
    return this.vec;
};

Tessellator.Tween.prototype.cancel = function (){
    if (!this.updating){
        this.update();
        
        this.directives = [];
        
        this.loopDirectives = false;
    };
};

Tessellator.Tween.prototype.add = function (e){
    this.directives.push(e);
    
    if (this.directives.length === 1){
        this.directiveStartTime = Tessellator.now();
        this.ovec = this.vec.clone();
    };
};

Tessellator.Tween.prototype.loop = function (flag){
    this.loopDirectives = flag === undefined ? true : flag;
    
    return this;
};

Tessellator.Tween.prototype.update = function (){
    if (!this.updating && (!Tessellator.Tween.locked || Tessellator.Tween.locked !== this.lock) && this.time != this.updated && this.ovec){
        this.lock = Tessellator.Tween.locked;
        this.updating = true;
        
        var time = Tessellator.now();
        
        while (this.directives.length){
            this.updated = time;
            
            var st = this.directives[0](this, time - this.directiveStartTime);
            
            if (st >= 0){
                var e = this.directives.splice(0, 1)[0];
                
                if (this.loopDirectives){
                    this.add(e);
                };
                
                if (this.directives.length){
                    this.ovec = this.vec.clone();
                    this.directiveStartTime = time - st;
                };
            }else{
                break;
            };
        };
        
        this.updating = false;
    };
};

Tessellator.Tween.prototype.dir = function (vec, time){
    time = Tessellator.float.forValue(time || 0);
    
    if (!isNaN(vec)){
        vec = Tessellator.float(vec);
    };
    
    if (time <= 0){
        this.add(function (tween, t){
            for (var i = 0; i < tween.vec.length; i++){
                tween.vec[i] = tween.ovec[i] + t * vec[i];
            };
            
            return -1;
        });
    }else{
        this.add(function (tween, t){
            for (var i = 0; i < tween.vec.length; i++){
                tween.vec[i] = tween.ovec[i] + Math.min(t / time, 1) * vec[i];
            };
            
            return t - time;
        });
    };
    
    return this;
};

Tessellator.Tween.prototype.to = function (pos, rate){
    rate = Tessellator.float.forValue(rate || 0);
    
    if (!isNaN(pos)){
        pos = Tessellator.float(pos);
    };
    
    this.add(function (tween, t){
        var vec = pos.clone().subtract(tween.ovec).divide(rate);
        
        for (var i = 0; i < tween.vec.length; i++){
            tween.vec[i] = tween.ovec[i] + Math.min(t, rate) * vec[i];
        };
        
        return t - rate;
    });
    
    return this;
};

Tessellator.Tween.prototype.set = function (pos){
    if (!isNaN(pos)){
        pos = Tessellator.float(pos);
    };
    
    this.add(function (tween){
        tween.vec.set(pos);
        
        return 0;
    });
    
    return this;
};

Tessellator.Tween.prototype.delay = function (time){
    this.add(function (tween, t){
        return t - time;
    });
    
    return this;
};

Tessellator.Tween.prototype.sin = function (amp, frq, time){
    time = Tessellator.float.forValue(time || 0);
    
    if (!isNaN(amp)){
        amp = Tessellator.float(amp);
    };
    
    if (!isNaN(frq)){
        frq = Tessellator.float(frq);
    };
    
    if (time <= 0){
        this.add(function (tween, t){
            for (var i = 0; i < tween.vec.length; i++){
                tween.vec[i] = tween.ovec[i] + Math.sin(t / 1000 * frq[0] * Math.PI * 2) * amp[i];
            };
            
            return -1;
        });
    }else{
        this.add(function (tween, t){
            for (var i = 0; i < tween.vec.length; i++){
                tween.vec[i] = tween.ovec[i] + Math.sin(Math.min(t, time) / 1000 * frq[0] * Math.PI * 2) * amp[i];
            };
            
            return t - time;
        });
    };
    
    return this;
};

Tessellator.Tween.prototype.cos = function (amp, frq, time){
    time = Tessellator.float.forValue(time || 0);
    
    if (!isNaN(amp)){
        amp = Tessellator.float(amp);
    };
    
    if (!isNaN(frq)){
        frq = Tessellator.float(frq);
    };
    
    if (time <= 0){
        this.add(function (tween, t){
            for (var i = 0; i < tween.vec.length; i++){
                tween.vec[i] = tween.ovec[i] + Math.cos(t / 1000 * frq[0] * Math.PI * 2) * amp[i];
            };
            
            return -1;
        });
    }else{
        this.add(function (tween, t){
            for (var i = 0; i < tween.vec.length; i++){
                tween.vec[i] = tween.ovec[i] + Math.cos(Math.min(t, time) / 1000 * frq[0] * Math.PI * 2) * amp[i];
            };
            
            return t - time;
        });
    };
    
    return this;
};

Tessellator.Tween.prototype.rad = function (start, cycles, rsin, rcos, time){
    time = Tessellator.float.forValue(time || 0);
    
    if (!isNaN(start)){
        start = Tessellator.float(start);
    };
    
    if (!isNaN(cycles)){
        cycles = Tessellator.float(cycles);
    };
    
    if (time <= 0){
        this.add(function (tween, t){
            for (var i = 0; i < tween.vec.length; i++){
                tween.vec[i] = tween.ovec[i] + Math.sin(t / 1000 * cycles[0] * Math.PI * 2 + start[0] * Math.PI * 2) * rsin[i] + Math.cos(t / 1000 * cycles[0] * Math.PI * 2 + start[0] * Math.PI * 2) * rcos[i];
            };
            
            return -1;
        });
    }else{
        this.add(function (tween, t){
            for (var i = 0; i < tween.vec.length; i++){
                tween.vec[i] = tween.ovec[i] + Math.sin(Math.min(t / time, 1) * cycles[0] * Math.PI * 2 + start[0] * Math.PI * 2) * rsin[i] + Math.cos(Math.min(t / time, 1) * cycles[0] * Math.PI * 2 + start[0] * Math.PI * 2) * rcos[i];
            };
            
            return t - time;
        });
    };
    
    return this;
};

Tessellator.Tween.prototype.addAll = function (){
    var vecs = Array.prototype.slice.call(arguments);
    
    for (var i = 0; i < vecs.length; i++){
        if (!isNaN(vecs[i])){
            vecs[i] = Tessellator.float(vecs[i]);
        };
    };
    
    this.add(function (tween){
        for (var i = 0; i < vecs.length; i++){
            if (vecs[i].tween){
                vecs[i].tween.update();
            };
        };
        
        for (var i = 0; i < tween.vec.length; i++){
            var x = tween.ovec[i];
            
            for (var ii = 0; ii < vecs.length; ii++){
                x += vecs[ii][i];
            };
            
            tween.vec[i] = x;
        };
        
        return -1;
    });
    
    return this;
};

Tessellator.Tween.prototype.multiplyAll = function (){
    var vecs = Array.prototype.slice.call(arguments);
    
    for (var i = 0; i < vecs.length; i++){
        if (!isNaN(vecs[i])){
            vecs[i] = Tessellator.float(vecs[i]);
        };
    };
    
    this.add(function (tween){
        for (var i = 0; i < vecs.length; i++){
            if (vecs[i].tween){
                vecs[i].tween.update();
            };
        };
        
        for (var i = 0; i < tween.vec.length; i++){
            var x = tween.ovec[i];
            
            for (var ii = 0; ii < vecs.length; ii++){
                x *= vecs[ii][i];
            };
            
            tween.vec[i] = x;
        };
        
        return -1;
    });
    
    return this;
};

Tessellator.Tween.prototype.divideAll = function (){
    var vecs = Array.prototype.slice.call(arguments);
    
    for (var i = 0; i < vecs.length; i++){
        if (!isNaN(vecs[i])){
            vecs[i] = Tessellator.float(vecs[i]);
        };
    };
    
    this.add(function (tween){
        for (var i = 0; i < vecs.length; i++){
            if (vecs[i].tween){
                vecs[i].tween.update();
            };
        };
        
        for (var i = 0; i < tween.vec.length; i++){
            var x = tween.ovec[i];
            
            for (var ii = 0; ii < vecs.length; ii++){
                x /= vecs[ii][i];
            };
            
            tween.vec[i] = x;
        };
        
        return -1;
    });
    
    return this;
};

Tessellator.Tween.prototype.subtractAll = function (){
    var vecs = Array.prototype.slice.call(arguments);
    
    for (var i = 0; i < vecs.length; i++){
        if (!isNaN(vecs[i])){
            vecs[i] = Tessellator.float(vecs[i]);
        };
    };
    
    this.add(function (tween){
        for (var i = 0; i < vecs.length; i++){
            if (vecs[i].tween){
                vecs[i].tween.update();
            };
        };
        
        for (var i = 0; i < tween.vec.length; i++){
            var x = tween.ovec[i];
            
            for (var ii = 0; ii < vecs.length; ii++){
                x -= vecs[ii][i];
            };
            
            tween.vec[i] = x;
        };
        
        return -1;
    });
    
    return this;
};
