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

Tessellator.Initializer = function (tessellator, model, inheritFrom){
    this.tessellator = tessellator;
    
    this.model = model;
    this.finished = false;
    
    this.attribs = {};
    
    if (inheritFrom){
        for (var o in inheritFrom.attribs){
            this.attribs[o] = inheritFrom.attribs[o];
        };
    }else{
        for (var o in Tessellator.Initializer.defaults){
            this.attribs[o] = Tessellator.Initializer.defaults[o](this);
        };
    };
};

Tessellator.Initializer.prototype.get = function (key){
    return this.attribs[key];
};

Tessellator.Initializer.prototype.getr = function (key){
    var value = this.attribs[key];
    this.attribs[key] = null;
    
    return value;
};

Tessellator.Initializer.prototype.getd = function (key, def){
    var value = this.attribs[key];
    
    if (!value){
        value = def;
        
        this.attribs[key] = value;
    };
    
    return value;
};

Tessellator.Initializer.prototype.set = function (key, value){
    return this.attribs[key] = value;
};

Tessellator.Initializer.defaults = {};

Tessellator.Initializer.setDefault = function (key, value){
    Tessellator.Initializer.defaults[key] = value;
};

Tessellator.Initializer.prototype.push = function (action){
    if (action.init){
        var push = action.init(this);
        
        if (push !== null){
            if (push){
                this.put(push);
            }else{
                this.put(action);
            };
        };
        
        return push;
    }else{
        this.put(action);
    };
};

Tessellator.Initializer.prototype.put = function (item){
    this.model.model.push(item);
};

Tessellator.Initializer.prototype.finish = function (){
    this.flush();
    
    for (var i = 0; i < this.model.model.length; i++){
        if (this.model.model[i].postInit){
            this.model.model[i].postInit(this);
        };
    };
};

Tessellator.Initializer.prototype.flush = function (){};