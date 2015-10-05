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

Tessellator.Array = function (){
    if (arguments.length === 2){
        this.buffer = new Float64Array(arguments[0]);
        this.incrementSize = arguments[1];
        this.length = arguments[0].length;
    }else if (arguments.length === 1){
        if (isNaN(arguments[0])){
            this.buffer = new Float64Array(arguments[0]);
            this.incrementSize = 256;
            this.length = arguments[0].length;
        }else{
            this.incrementSize = arguments[0];
            this.buffer = new Float64Array(this.incrementSize);
            this.length = 0;
        }
    }else{
        this.incrementSize = 256;
        this.buffer = new Float64Array(this.incrementSize);
        this.length = 0;
    }
}

Tessellator.Array.prototype.isEmpty = function (){
    return this.length === 0;
}

Tessellator.Array.prototype.clear = function (){
    this.buffer = new Float64Array(this.incrementSize);
    this.length = 0;
}

Tessellator.Array.prototype.instance = function (value, copies){
    var a = new Float32Array(copies);
    
    for (var i = 0; i < a.length; a++){
        a[i] = value;
    }
    
    this.push(a);
}

Tessellator.Array.prototype.push = function (){
    var size = 0;
    
    for (var i = 0, k = arguments.length; i < k; i++){
        var arg = arguments[i];
        
        if (arg.length){
            size += arg.length;
        }else{
            size++;
        }  
    }
    
    if (size > 0){
        if (this.buffer.length < this.length + size){
            var newArray = new Float64Array(this.length + size + this.incrementSize);
            newArray.set(this.buffer, 0);
            this.buffer = newArray;
        }
        
        var pos = this.length;
        this.length += size;
        
        for (var i = 0, k = arguments.length; i < k; i++){
            var arg = arguments[i];
            
            if (arg.length){
                if (arg.constructor === Tessellator.Array || arg.constructor === Tessellator.FragmentedArray){
                    arg.write(this.buffer, pos);
                }else{
                    this.buffer.set(arg, pos);
                }
                
                pos += arg.length;
            }else{
                this.buffer[pos++] = arg;
            }
        }
    }
}

Tessellator.Array.prototype.offset = function (off){
    for (var i = 0; i < this.length; i++){
        this.buffer[i] += off;
    }
}

Tessellator.Array.prototype.get = function (index){
    return this.buffer[index];
}

Tessellator.Array.prototype.set = function (index, value){
    this.buffer[index] = value;
}

Tessellator.Array.prototype.write = function (array, pos){
    array.set(this.buffer.subarray(0, this.length), pos);
}

Tessellator.Array.prototype.compress = function (){}

Tessellator.Array.prototype.combine = function (func){
    if (this.buffer.constructor === func){
        return this.buffer.subarray(0, this.length);
    }
    
    return new (func || Float32Array)(this.buffer.subarray(0, this.length));
}

Tessellator.Array.prototype.iterator = function (start){
    return new Tessellator.Array.Iterator(this, start);
}

Tessellator.Array.Iterator = function (array, start){
    this.array = array;
    this.index = start || 0;
}

Tessellator.Array.Iterator.prototype.hasNext = function (){
    return this.index < this.array.length;
}

Tessellator.Array.Iterator.prototype.hasPrevious = function (){
    return this.index > 0;
}

Tessellator.Array.Iterator.prototype.next = function (){
    return this.array.buffer[this.index++];
}

Tessellator.Array.Iterator.prototype.previous = function (){
    return this.array.buffer[this.index--];
}