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

Tessellator.TextureModel.AttachmentDepthTexture = function (filter){
    this.filter = filter;
}

Tessellator.copyProto(Tessellator.TextureModel.AttachmentDepthTexture, Tessellator.Texture);

Tessellator.TextureModel.AttachmentDepthTexture.prototype.setup = function (texture){
    if (this.tessellator && this.tessellator !== texture.tessellator){
        throw "cannot mix resources between multiple contexts";
    }
    
    if (!texture.tessellator.extensions.get("WEBGL_depth_texture")){
        throw "depth texture is not supported!";
    }
    
    if (!this.tessellator){
        this.super(texture.tessellator);
    }
    
    this.width = texture.width;
    this.height = texture.height;
    
    if (!this.filter){
        this.filter = Tessellator.getAppropriateTextureFilter(texture.width, texture.height);
    }
    
    if (texture.bindingAttachment.constructor === Tessellator.TextureDummy){
        texture.bindingAttachment = this;
    }
    
    this.dispose();
    this.clearTracking();
    this.setReady();
}

Tessellator.TextureModel.AttachmentDepthTexture.prototype.configure = function (parent, target, track){
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
        
        gl.texImage2D(parent.tessellator.glConst(target), 0, gl.DEPTH_COMPONENT, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, parent.tessellator.glConst(target), tex, 0);
        
        this.track(track);
    }
}