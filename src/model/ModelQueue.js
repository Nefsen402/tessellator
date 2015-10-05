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

Tessellator.ModelQueue = function (){
    this.render = true;
    this.model = [];
    this.length = 0;
};

Tessellator.ModelQueue.prototype.apply = function (matrix, mod, renderer){
    renderer.renderModel(matrix, this);
};

Tessellator.ModelQueue.finish = function (){};

Tessellator.ModelQueue.prototype.destroy = function (i){
    if (isNaN(i)){
        i = this.model.indexOf(i);
    };
    
    this.model.splice(i, 1);
    this.length--;
};

Tessellator.ModelQueue.prototype.remove = function (i){
    if (isNaN(i)){
        i = this.model.indexOf(i);
    };
    
    this.model[i] = {realModel: this.model[i]};
};

Tessellator.ModelQueue.prototype.readd = function (i){
    if (isNaN(i)){
        for (var ii = 0; ii < this.model.length; ii++){
            if (this.model[ii].realModel === i){
                i = ii;
                
                break;
            };
        };
        
        if (isNaN(i)){
            return;
        };
    };
    
    if (this.model[i].realModel){
        this.model[i] = this.model[i].realModel;
    };
};

Tessellator.ModelQueue.prototype.readdFirst = function (){
    for (var i = 0; i < this.model.length; i++){
        if (this.model[i].realModel){
            this.model[i] = this.model[i].realModel;
            
            break;
        };
    };
};

Tessellator.ModelQueue.prototype.readdLast = function (){
    for (var i = this.model.length - 1; i >= 0; i--){
        if (this.model[i].realModel){
            this.model[i] = this.model[i].realModel;
            
            break;
        };
    };
};

Tessellator.ModelQueue.prototype.get = function (i){
    return this.model[i];
};

Tessellator.ModelQueue.prototype.add = function (mod){
    if (mod.constructor !== Tessellator.Model){
        throw "cannot add a non-model to a model queue";
    };
    
    this.model.push.apply(this.model, arguments);
    this.length += arguments.length;
};