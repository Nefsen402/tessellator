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

Tessellator.FullScreenTextureRenderer = function (shader){
    this.super(shader);
    
    if (arguments.length > 1){
        this.textures = Array.prototype.slice.call(arguments, 1, arguments.length);
    }
}

Tessellator.copyProto(Tessellator.FullScreenTextureRenderer, Tessellator.FullScreenRenderer);

Tessellator.FullScreenTextureRenderer.prototype.setTextures = function (textures){
    this.textures = textures;
    
    return this;
}

Tessellator.FullScreenTextureRenderer.prototype.setResolutionScale = function (res){
    if (isNaN(res)){
        this.res = res;
    }else{
        this.res = Tessellator.vec2(res);
    }
}

Tessellator.FullScreenTextureRenderer.prototype.setRenderer = function (renderer){
    this.rendererAttachment.renderer = renderer;
}

Tessellator.FullScreenTextureRenderer.prototype.renderRaw = function (render, arg){
    var textures = this.textures;
    
    if (!textures && arg){
        if (arg.constructor === Array){
            textures = arg;
        }else{
            textures = [ arg ];
        }
    }
    
    if (textures){
        for (var i = 0; i < textures.length; i++){
            if (i === 0){
                render.set("sampler", textures[0]);
            }else{
                render.set("sampler" + (i + 1).toString(), textures[i]);
            }
        }
        
        this.super.renderRaw(render, arg);
    }
}