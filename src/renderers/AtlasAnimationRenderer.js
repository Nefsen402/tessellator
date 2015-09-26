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

Tessellator.AtlasAnimationRenderer = function (shader){
    this.super(shader);
    
    this.buffer = new Tessellator.Array(new Float32Array(8));
    
    this.object.setAttribute("textureCoord", Tessellator.VEC2, this.buffer, Float32Array, false, Tessellator.DYNAMIC);
    this.object.upload();
}

Tessellator.copyProto(Tessellator.AtlasAnimationRenderer, Tessellator.FullScreenRenderer);

Tessellator.AtlasAnimationRenderer.prototype.renderRaw = function (render, texture){
    render.set("sampler", texture.src);
    
    var gl = this.tessellator.GL;
    
    var frame = texture.frame;
    var frames = texture.frames;
    
    if (texture.src.width === texture.size){
        this.buffer.set(0, 0);
        this.buffer.set(2, 1);
        this.buffer.set(4, 1);
        this.buffer.set(6, 0);
        
        this.buffer.set(1, frame / frames);
        this.buffer.set(3, frame / frames);
        this.buffer.set(5, (frame + 1) / frames);
        this.buffer.set(7, (frame + 1) / frames);
    }else{
        this.buffer.set(1, 0);
        this.buffer.set(3, 1);
        this.buffer.set(5, 1);
        this.buffer.set(7, 0);
        
        this.buffer.set(0, frame / frames);
        this.buffer.set(2, frame / frames);
        this.buffer.set(4, (frame + 1) / frames);
        this.buffer.set(6, (frame + 1) / frames);
    }
    
    this.object.setAttributeData("textureCoord", this.buffer);
    
    render.disable(gl.BLEND);
    render.disable(gl.DEPTH_TEST);
    
    this.object.render(render);
}