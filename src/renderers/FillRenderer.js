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

Tessellator.FillRenderer = function (renderer){
    this.color = Tessellator.getColor(Array.prototype.slice.call(arguments, 1, arguments.length));
    
    if (renderer.constructor === Tessellator){
        this.renderer = null;
        this.super (tessellator.createPixelShader(Tessellator.PIXEL_SHADER_COLOR));
    }else{
        this.renderer = renderer;
        this.super(renderer.tessellator.createPixelShader(Tessellator.PIXEL_SHADER_COLOR));
    }
    
}

Tessellator.extend(Tessellator.FillRenderer, Tessellator.FullScreenRenderer);

Tessellator.FillRenderer.prototype.renderRaw = function (render, arg){
    render.set("color", this.color);
    
    this.super.renderRaw(render);
    
    if (this.renderer){
        var newrender = new Tessellator.RenderMatrix(this.renderer);
        newrender.set("window", render.gets("window"));
        
        this.renderer.render(newrender, arg);
    }
}