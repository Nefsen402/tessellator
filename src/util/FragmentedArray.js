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

Tessellator.FragmentedArray = function (size){
    this.length = 0;
    
    if (isNaN(size) && arguments.length){
        this.incrementSize = 8;
        
        this.elements = arguments.length;
        this.buffer = new Array(this.elements);
        
        for (var i = 0; i < this.elements; i++){
            this.buffer = arguments[i];
            this.length += arguments[i];
        };
    }else{
        this.incrementSize = size || 8;
        this.buffer = null;
        this.elements = 0;
    };
};

Tessellator.FragmentedArray.prototype.isEmpty = function (){
    return this.length === 0;
};

Tessellator.FragmentedArray.prototype.clear = function (){
    this.length = 0;
    this.buffer = null;
    this.elements = 0;
};

Tessellator.FragmentedArray.prototype.instance = function (value, copies){
    var a = new Float32Array(copies);
    
    for (var i = 0; i < a.length; a++){
        a[i] = value;
    };
    
    this.push(a);
};

Tessellator.FragmentedArray.prototype.removeElement = function (index){
    this.length -= this.buffer[index].length;
    for (var i = index; i < this.elements; i++){
        this.buffer[i] = this.buffer[i + 1];
    };
    
    this.elements--;
};

Tessellator.FragmentedArray.prototype.push = function (arg){
    if (arg.length){
        if (!this.buffer){
            this.buffer = new Array(this.incrementSize);
        }else if (this.buffer.length === this.elements){
            this.buffer.length += this.incrementSize;
        };
        
        this.buffer[this.elements] = arg;
        
        this.length += arg.length;
        this.elements++;
    };
};

Tessellator.FragmentedArray.prototype.offset = function (off){
    for (var i = 0; i < this.elements; i++){
        var e = this.buffer[i];
        
        if (e.constructor === Tessellator.FragmentedArray || e.constructor === Tessellator.Array){
            e.offset(off);
        }else{
            for (var i = 0, k = e.length; i < k; i++){
                e[i] += off;
            };
        };
    };
};

Tessellator.FragmentedArray.prototype.get = function (index){
    if (index < 0 || index > this.length){
        throw "index is out of range to access fragmented array";
    };
    
    var i, pos = this.length;
    
    for (i = this.elements - 1; pos > index; i--){
        pos -= this.buffer[i].length;
    };
    
    var e = this.buffer[i + 1];
    
    if (e.constructor === Tessellator.FragmentedArray || e.constructor === Tessellator.Array){
        return e.get(index - pos);
    }else{
        return e[index - pos];
    };
};

Tessellator.FragmentedArray.prototype.set = function (index, value){
    var i, pos = this.length;
    
    for (i = this.elements - 1; pos > index; i--){
        pos -= this.buffer[i].length;
    };
    
    var e = this.buffer[i + 1];
    
    if (e.constructor === Tessellator.FragmentedArray){
        return e.set(index - pos, value);
    }else{
        return e[index - pos] = value;
    };
};

Tessellator.FragmentedArray.prototype.write = function (array, pos){
    for (var i = 0; i < this.elements; i++){
        var e = this.buffer[i];
        
        if (e.constructor === Tessellator.FragmentedArray || e.constructor === Tessellator.Array){
            e.write(array, pos);
        }else{
            array.set(e, pos);
        };
        
        pos += e.length;
    };
};

Tessellator.FragmentedArray.prototype.compress = function (){
    this.buffer = [ this.combine() ];
    this.elements = 1;
};

Tessellator.FragmentedArray.prototype.combine = function (func){
    var arr = new (func || Float32Array)(this.length);
    
    this.write(arr, 0);
    
    return arr;
};

Tessellator.FragmentedArray.prototype.iterator = function (start){
    return new Tessellator.Array.Iterator(this, start);
};