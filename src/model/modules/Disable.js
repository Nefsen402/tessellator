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

Tessellator.Model.prototype.disable = function (e){
    return this.add(new Tessellator.Disable(e));
};

Tessellator.Disable = function (arg){
    this.type = Tessellator.DISABLE;
    this.arg = arg;
};


Tessellator.Disable.prototype.apply = function (render){
    if (this.arg === Tessellator.LIGHTING){
        render.set("lights", render.renderer.noLightingTexture);
    }else{
        render.disable(this.arg)
    };
};


Tessellator.Disable.prototype.init = function (interpreter){
    if (this.arg === Tessellator.NORMAL){
        interpreter.set("lighting", false);
        
        return null;
    }else if (this.arg === Tessellator.COLOR){
        interpreter.set("colorAttribEnabled", false);
        
        return null;
    }else{
        interpreter.flush();
    };
};