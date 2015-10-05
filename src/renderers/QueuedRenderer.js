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

Tessellator.QueuedRenderer = function (){
    this.set(arguments);
};

Tessellator.extend(Tessellator.QueuedRenderer, Tessellator.RendererAbstract);

Tessellator.QueuedRenderer.prototype.set = function (){
    if (arguments.length === 1){
        if (arguments[0].length){
            this.queue = arguments[0];
        }else{
            this.queue = arguments;
        };
    }else{
        this.queue = arguments;
    };
    
    for (var i = 0; i < this.queue.length; i++){
        if (this.queue[i].tessellator){
            this.tessellator = this.queue[i].tessellator;
            break;
        };
    };
};

Tessellator.QueuedRenderer.prototype.add = function (){
    if (!this.queue){
        this.set(arguments);
    }else if (this.queue.constructor !== Array){
        this.queue = Array.prototype.slice.call(this.queue);
    };
    
    if (arguments.length === 1){
        if (arguments[0].length){
            this.queue.push.apply(this.queue, arguments[0]);
        }else{
            this.queue = this.queue.push(arguments[0]);
        };
    }else{
        this.queue.push.apply(this.queue, arguments);
    };
};

Tessellator.QueuedRenderer.prototype.setAspect = function(aspect){
    for (var i = 0; i < this.queue.length; i++){
        if (this.queue[i].setAspect){
            this.queue[i].setAspect(aspect);
        };
    };
    
    return this;
};

Tessellator.QueuedRenderer.prototype.init = function (){
    return this.queue;
};

Tessellator.QueuedRenderer.prototype.renderRaw = function (matrix, arg){
    for (var i = 0; i < this.queue.length; i++){
        this.queue[i].render(matrix.copy(this.queue[i]), arg);
    };
};