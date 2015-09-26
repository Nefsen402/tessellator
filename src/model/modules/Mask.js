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

Tessellator.Initializer.setDefault("mask", function () {
    return false;
});

Tessellator.Model.prototype.setMask = function (){
    return this.add(new Tessellator.MaskSet(Tessellator.getColor(arguments)));
}

Tessellator.MaskSet = function (color){
    this.type = Tessellator.MASK;
    
    this.mask = color;
}


Tessellator.MaskSet.prototype.init = function (interpreter){
    if (interpreter.get("draw") === Tessellator.TEXTURE){
        if (interpreter.shape){
            throw "cannot change mask while shape is being drawn";
        }
        
        interpreter.flush();
        
        interpreter.set("mask", true);
    }else{
        interpreter.set("color", new Tessellator.Color(
            interpreter.get("color").r * this.mask[0],
            interpreter.get("color").g * this.mask[1],
            interpreter.get("color").b * this.mask[2],
            interpreter.get("color").a * this.mask[3]
        ));
        
        return null;
    }
}


Tessellator.MaskSet.prototype.apply = function (render){
    render.set("mask", this.mask);
}