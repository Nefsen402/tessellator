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

Tessellator.StaticView = function (x, y){
    this.type = Tessellator.VIEW;
    
    this.x = x || Tessellator.LEFT;
    this.y = y || Tessellator.TOP;
}

Tessellator.StaticView.prototype.apply = function (render){
    var window = render.get("window");
    
    var yoff, xoff;
    
    if (isNaN(this.x)){
        xoff = this.x.value;
    }else{
        xoff = this.x;
    }
    
    if (isNaN(this.y)){
        yoff = this.y.value;
    }else{
        yoff = this.y;
    }
    
    render.set("pMatrix", Tessellator.mat4(
        2 / window[0], 0, 0, 0,
        0, 2 / window[1], 0, 0,
        0, 0, 0, 0,
        xoff, yoff, -1, 1
    ));
}

Tessellator.StaticView.prototype.init = function (interpreter){
    interpreter.flush();
}