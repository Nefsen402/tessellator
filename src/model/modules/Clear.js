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


//strict mode can be used with this.
"use strict";

Tessellator.Model.prototype.clear = function (){
    this.add(new Tessellator.Clear(Tessellator.COLOR_BUFFER_BIT.gl | Tessellator.DEPTH_BUFFER_BIT.gl, Tessellator.getColor(arguments)));
}

Tessellator.Model.prototype.clearColor = function (){
    this.add(new Tessellator.Clear(Tessellator.COLOR_BUFFER_BIT.glTessellator.getColor(arguments)));
}

Tessellator.Model.prototype.clearDepth = function (){
    this.add(new Tessellator.Clear(Tessellator.DEPTH_BUFFER_BIT.gl));
}

Tessellator.Clear = function (clearCode, color) {
    this.type = Tessellator.CLEAR;
    
    this.clearCode = clearCode;
    this.color = color;
}

Tessellator.Clear.prototype.apply = function (render){
    if ((this.clearCode & Tessellator.COLOR_BUFFER_BIT.gl) !== 0){
        if (this.color){
            render.tessellator.GL.clearColor(this.color[0], this.color[1], this.color[2], this.color[3]);
        }else{
            render.tessellator.GL.clearColor(0, 0, 0, 0);
        }
    }
    
    render.tessellator.GL.clear(this.clearCode);
}

Tessellator.Clear.prototype.init = function (interpreter){
    interpreter.flush();
}