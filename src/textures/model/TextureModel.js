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

Tessellator.prototype.frameBuffer = {
    bindFramebuffer: function (last){
        last.tessellator.GL.bindFramebuffer(last.tessellator.GL.FRAMEBUFFER, null);
        last.tessellator.frameBuffer = Tessellator.prototype.frameBuffer;
    }
};

Tessellator.TextureModel = function (tessellator, width, height, attachments){
    this.super (tessellator);
    this.autoUpdate = true;
    
    this.disposable = true;
    this.configured = false;
    
    this.attachments = attachments;
    
    if (!this.attachments || this.attachments.constructor !== Array){
        this.attachments = [
            new Tessellator.TextureModel.AttachmentColor(this.attachments),
            new Tessellator.TextureModel.AttachmentDepth()
        ];
    }
    
    this.bindingAttachment = new Tessellator.TextureDummy();
    this.renderAttachment = null;
    
    this.setSize(width, height);
}

Tessellator.copyProto(Tessellator.TextureModel, Tessellator.Texture);

Tessellator.TextureModel.prototype.isReady = function (){
    return this.bindingAttachment && this.bindingAttachment.isReady();
}

Tessellator.TextureModel.prototype.setup = function (){
    this.disposeShallow();
    this.clearTracking();
    this.configured = false;
    
    this.frameBuffer = this.tessellator.GL.createFramebuffer();
    
    var lastFrameBuffer = this.tessellator.frameBuffer;
    this.bindFramebuffer();
    
    if (this.tessellator.extensions.get("WEBGL_draw_buffers")){
        this.buffers = [];
        this.buffers.ext = this.tessellator.extensions.get("WEBGL_draw_buffers");
    }
    
    for (var i = 0, k = this.attachments.length; i < k; i++){
        this.attachments[i].setup(this);
    }
    
    lastFrameBuffer.bindFramebuffer(this);
    this.setReady();
}

Tessellator.TextureModel.prototype.configure = function (target, track){
    if (this.isReady()){
        var lastFrameBuffer = this.tessellator.frameBuffer;
        this.bindFramebuffer();
        
        for (var i = 0; i < this.attachments.length; i++){
            this.attachments[i].configure(this, target, track);
        }
        
        if (this.autoUpdate || !this.isTracking(null)){
            this.renderAttachment.render(this, track);
            
            this.track(null);
        }
        
        lastFrameBuffer.bindFramebuffer(this);
        this.configured = true;
    }
}

Tessellator.TextureModel.prototype.render = function (track){
    if (!this.configured){
        this.configure(Tessellator.TEXTURE_2D, track);
    }else if (this.isReady()){
        var lastFrameBuffer = this.tessellator.frameBuffer;
        this.bindFramebuffer();
        
        this.renderAttachment.render(this);
        
        lastFrameBuffer.bindFramebuffer(this);
    }
}

Tessellator.TextureModel.prototype.bindFramebuffer = function (last){
    this.tessellator.GL.bindFramebuffer(this.tessellator.GL.FRAMEBUFFER, this.frameBuffer);
    this.tessellator.frameBuffer = this;
    
    if (this.buffers){
        this.buffers.ext.drawBuffersWEBGL(this.buffers);
    }
}

Tessellator.TextureModel.prototype.disposeShallow = function (){
    if (this.frameBuffer){
        this.tessellator.GL.deleteFramebuffer(this.frameBuffer);
        
        this.tessellator.resources.remove(this);
        this.frameBuffer = null;
    }
}

Tessellator.TextureModel.prototype.dispose = function (){
    this.disposeShallow();
    
    for (var i = 0, k = this.attachments.length; i < k; i++){
        this.attachments[i].dispose(this);
    }
}

Tessellator.TextureModel.prototype.setSize = function (width, height){
    width = width | 0;
    height = height | 0;
    
    if (this.width !== width || this.height !== height){
        this.width = width;
        this.height = height;
        
        this.setup();
    }
}

Tessellator.TextureModel.prototype.bind = function (){
    if (this.bindingAttachment){
        this.bindingAttachment.bind();
    }
}

Tessellator.TextureModel.prototype.getAttachment = function (c) {
    for (var i = 0, k = this.attachments.length; i < k; i++){
        if (this.attachments[i].constructor === c){
            return this.attachments[i];
        }
    }
    
    return null;
}