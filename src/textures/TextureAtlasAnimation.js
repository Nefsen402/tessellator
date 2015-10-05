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

Tessellator.prototype.createTextureAtlasAnimation = function (){
    return Tessellator.new.apply(Tessellator.TextureAtlasAnimation, [this].concat(Array.prototype.slice.call(arguments)));
}

Tessellator.TextureAtlasAnimation = function (tessellator, src, animationRate, animation){
    if (!src){
        throw "no source!";
    }
    
    this.tessellator = tessellator;
    
    this.src = src;
    this.animationRate = animationRate || 1;
    this.animation = animation;
    this.time = 0;
    this.size = 1;
    
    if (src.isReady()){
        this.size = Math.min(src.width, src.height);
        
        if (src.width % this.size !== 0 || src.height & this.size !== 0){
            throw "texture not uniform size";
        }
        
        this.frames = Math.max(src.width / this.size, src.height / this.size);
        
        this.init();
    }else{
        var self = this;
        
        src.addListener(function (){
            self.size = Math.min(src.width, src.height);
            
            if (src.width % self.size !== 0 || src.height & self.size !== 0){
                throw "texture not uniform size";
            }
            
            self.frames = Math.max(src.width / self.size, src.height / self.size);
            
            self.init();
        });
    }
    
    if (!this.tessellator.shaderTextureAtlasAnimation){
        this.tessellator.shaderTextureAtlasAnimation = new Tessellator.AtlasAnimationRenderer(Tessellator.ATLAS_SHADER_ANIMATION.create(this.tessellator));
    }
}

Tessellator.copyProto(Tessellator.TextureAtlasAnimation, Tessellator.TextureModel);

Tessellator.TextureAtlasAnimation.prototype.init = function (){
    this.super(this.tessellator, this.size, this.size, [
        new Tessellator.TextureModel.AttachmentColor(),
        new Tessellator.TextureModel.AttachmentRenderer(this.tessellator.shaderTextureAtlasAnimation, this)
    ]);
    
    this.autoUpdate = false;
    
    this.super.configure(Tessellator.TEXTURE_2D);
}

Tessellator.TextureAtlasAnimation.prototype.configure = function (target, matrix){
    if (this.isReady()){
        var frame;
        
        if (this.animation){
            frame = this.animation[Math.floor(this.time / this.animationRate) % this.animation.length];
        }else{
            frame = Math.floor(this.time / this.animationRate) % this.frames;
        }
        
        if (frame !== this.frame){
            this.frame = frame;
            
            this.render(matrix);
        }
        
        this.time++;
    }
}