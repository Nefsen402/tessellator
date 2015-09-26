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

Tessellator.BufferedRenderer = function (shader, renderer, res, bufferAttachments){
    if (shader.constructor === String){
        shader = renderer.tessellator.createPixelShader(shader);
    }else if (shader.constructor === Tessellator){
        shader = shader.createPixelShader(Tessellator.PIXEL_SHADER_PASS);
    }else if (shader.constructor === Tessellator.ShaderPreset){
        shader = renderer.tessellator.createPixelShader(shader);
    }else if (shader.constructor !== Tessellator.Program){
        bufferAttachments = res;
        res = renderer;
        renderer = shader;
        
        shader = shader.tessellator.createPixelShader(Tessellator.PIXEL_SHADER_PASS);
    }
    
    this.super(shader);
    
    this.rendererAttachment = new Tessellator.TextureModel.AttachmentRenderer(renderer);
    this.res = Tessellator.vec2(res || 1);
    
    this.bufferAttachments = bufferAttachments;
    
    if (this.bufferAttachments && this.bufferAttachments !== true){
        this.bufferAttachments.push(this.rendererAttachment);
    }else{
        var includeDepth = this.bufferAttachments;
        
        this.bufferAttachments = [
            new Tessellator.TextureModel.AttachmentColor(),
            this.rendererAttachment,
        ]
        
        if (includeDepth){
            this.bufferAttachments.push(new Tessellator.TextureModel.AttachmentDepth());
        }
    }
}

Tessellator.copyProto(Tessellator.BufferedRenderer, Tessellator.FullScreenRenderer);

Tessellator.BufferedRenderer.prototype.setResolutionScale = function (res){
    if (isNaN(res)){
        this.res = res;
    }else{
        this.res = Tessellator.vec2(res);
    }
}

Tessellator.BufferedRenderer.prototype.setRenderer = function (renderer){
    this.rendererAttachment.renderer = renderer;
}

Tessellator.BufferedRenderer.prototype.renderRaw = function (render, arg){
    if (this.rendererAttachment.renderer){
        this.unifyAspect(render);
        
        var window = render.gets("window");
        var aspect = render.gets("aspect");
        
        if (!aspect){
            aspect = Tessellator.vec2(1);
        }
        
        if (!this.buffer){
            this.buffer = new Tessellator.TextureModel(this.tessellator,
                window[0] * this.res[0] * (aspect[0] + 1),
                window[1] * this.res[1] * (aspect[1] + 1),
                this.bufferAttachments);
            
            this.buffer.autoUpdate = false;
        }else{
            this.buffer.setSize(
                window[0] * this.res[0] * (aspect[0] + 1),
                window[1] * this.res[1] * (aspect[1] + 1)
            );
        }
        
        this.rendererAttachment.arg = arg;
        
        this.buffer.render(render);
        render.set("sampler", this.buffer);
        
        render.disable(Tessellator.BLEND);
        render.disable(Tessellator.DEPTH_TEST);
    
        this.object.render(render);
    }
}