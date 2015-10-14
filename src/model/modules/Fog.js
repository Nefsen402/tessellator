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

Tessellator.Model.prototype.setFog = function (stop, start){
    return this.add(new Tessellator.Model.Fog(stop, start));
};

Tessellator.Model.Fog = function (stop, start){
    this.stop = isNaN(stop) ? stop : Tessellator.float(stop);
    this.start = start ? (isNaN(start) ? start : Tessellator.float(start)) : Tessellator.float();
};

Tessellator.Model.Fog.prototype.init = function (inter){
    this.color = inter.get("color");
};

Tessellator.Model.Fog.prototype.apply = function (matrix){
    matrix.addDefinition("USE_FOG");
    
    matrix.set("fogColor", this.color.xyz.divide(this.color.w));
    matrix.set("fog", Tessellator.vec2(this.start, this.stop));
};