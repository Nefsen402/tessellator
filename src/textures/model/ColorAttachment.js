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

Tessellator.TextureModel.AttachmentColor = function (filter, index, quality, channels){
    this.filter = filter;
    this.index = index || 0;
    this.quality = quality;
    this.channels = channels || Tessellator.RGBA;
}

Tessellator.copyProto(Tessellator.TextureModel.AttachmentColor, Tessellator.Texture);

Tessellator.TextureModel.AttachmentColor.prototype.setup = function (texture){
    if (this.tessellator && this.tessellator !== texture.tessellator){
        throw "cannot mix resources between multiple contexts";
    }
    
    if (!this.tessellator){
        this.super(texture.tessellator);
    }
    
    if (!this.quality){
        this.quality = texture.tessellator.GL.UNSIGNED_BYTE;
    }else{
        if (this.quality === Tessellator.FLOAT || this.quality === Tessellator.FLOAT32){
            texture.tessellator.extensions.get("OES_texture_float");
        }else if (this.quality === Tessellator.FLOAT16){
            texture.tessellator.extensions.get("OES_texture_half_float");
        }
        
        this.quality = texture.tessellator.glConst(this.quality);
    }
    
    this.channels = this.tessellator.glConst(this.channels);
    this.width = texture.width;
    this.height = texture.height;
    
    if (!this.filter){
        this.filter = Tessellator.getAppropriateTextureFilter(texture.width, texture.height);
    }
    
    if (texture.buffers){
        texture.buffers.push(texture.tessellator.GL.COLOR_ATTACHMENT0 + this.index);
    }
    
    if (this.index === 0){
        texture.bindingAttachment = this;
    }
    
    this.dispose();
    this.clearTracking();
    this.setReady();
}

Tessellator.TextureModel.AttachmentColor.prototype.configure = function (parent, target, track){
    var gl = parent.tessellator.GL;
    
    var tex;
    
    if (!track || track.constructor === Tessellator.RenderMatrix){
        if (track){
            track.dirty();
        }
        
        track = null;
        
        if (!this.isTracking(track)){
            gl.bindTexture(gl.TEXTURE_2D, this.texture = gl.createTexture());
            this.filter(parent.tessellator, this);
        }
        
        tex = this.texture;
    }
    
    if (!this.isTracking(track)){
        if (!tex){
            tex = track.glTexture;
        }
        
        gl.texImage2D(parent.tessellator.glConst(target), 0, this.channels, this.width, this.height, 0, this.channels, this.quality, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + this.index, parent.tessellator.glConst(target), tex, 0);
        
        this.track(track);
    }
}