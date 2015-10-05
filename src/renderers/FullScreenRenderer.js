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

Tessellator.FullScreenRenderer = function (shader){
    this.super(shader);
    
    this.object = new Tessellator.Object(this.tessellator, Tessellator.TRIANGLE);
    
    this.object.setAttribute("position", Tessellator.VEC2, new Tessellator.Array([
        -1, -1,
        1, -1,
        1, 1,
        -1, 1
    ]), Int8Array);
    
    this.object.resetIndices(Uint8Array);
    
    this.object.getIndices().push([
        0, 1, 2,
        0, 2, 3
    ]);
    
    this.object.upload();
    this.object.useOES();
};

Tessellator.copyProto(Tessellator.FullScreenRenderer, Tessellator.RendererAbstract);

Tessellator.FullScreenRenderer.prototype.setAspect = function(aspect){
    this.aspect = aspect;
    
    return this;
};

Tessellator.FullScreenRenderer.prototype.unifyAspect = function (matrix){
    if (this.aspect){
        var g = !isNaN(this.aspect);
        
        if (!g){
            if (!isNaN(this.aspect.getAspect())){
                g = this.aspect.getAspect();
            };
        }else{
            g = this.aspect;
        };
        
        if (g){
            var window = matrix.get("window");
            var currentAspect = window[0] / window[1];
            
            var aspect = Tessellator.vec2(
                Math.min(0, g / currentAspect - 1), 
                Math.min(0, currentAspect / g - 1)
            );
            
            matrix.set("aspect", aspect);
        }else{
            matrix.set("aspect", Tessellator.vec2());
        };
    }else{
        matrix.set("aspect", Tessellator.vec2());
    };
};

Tessellator.FullScreenRenderer.prototype.renderRaw = function (matrix){
    this.unifyAspect(matrix);
    
    matrix.disable(Tessellator.DEPTH_TEST);
    
    this.object.render(matrix);
};