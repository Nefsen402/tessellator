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

Tessellator.prototype.createVideoTexture = function (src, filter, autoPlay){
    return new Tessellator.TextureVideo(this, src, filter, autoPlay);
};

Tessellator.prototype.loadVideoTexture = Tessellator.prototype.createVideoTexture;

Tessellator.TextureVideo = function (tessellator, src, filter, autoPlay){
    this.super(tessellator);
    
    this.location = src;
    
    this.filter = filter;
    this.index = 0;
    this.timeUpdate = null;
    this.autoPlay = autoPlay === undefined ? true : autoPlay;
    this.paused = null;
    this.volumeLevel = null;
    this.autoUpdate = true;
    
    if (src.constructor === String){
        var self = this;
        
        this.video = document.createElement("video");
        
        this.video.src = src;
        this.video.load();
        
        this.video.addEventListener("canplay", function (){
            self.width = self.video.videoWidth;
            self.height = self.video.videoHeight;
            
            if (!self.filter){
                self.filter = Tessellator.getAppropriateTextureFilter(self.width, self.height);
            };
            
            self.setReady();
        });
    }else if (src && src.tagName.toLowerCase() == "video"){
        this.video = src;
        
        this.video.addEventListener("canplay", function (){
            self.width = self.video.videoWidth;
            self.height = self.video.videoHeight;
            
            if (!self.filter){
                self.filter = Tessellator.getAppropriateTextureFilter(self.width, self.height);
            };
            
            self.setReady();
        });
    }else if (src && src.tagName.toLowerCase() == "canvas"){
        this.video = src;
        this.width = this.video.width;
        this.height = this.video.height;
        
        if (!this.filter){
            this.filter = Tessellator.getAppropriateTextureFilter(this.width, this.height);
        };
        
        this.setReady();
    }else if (src){
        this.video = src;
        this.width = this.video.videoWidth;
        this.height = this.video.videoHeight;
        
        if (!this.filter){
            this.filter = Tessellator.getAppropriateTextureFilter(this.width, this.height);
        };
        
        this.setReady();
    };
};

Tessellator.copyProto(Tessellator.TextureVideo, Tessellator.Texture);

Tessellator.TextureVideo.prototype.setReady = function (){
    this.super.setReady();
    
    if (this.autoPlay){
        this.looping(true);
        
        if (!this.volumeLevel){
            this.mute();
        };
        
        if (this.paused === null){
            this.play();
        };
    };
};

Tessellator.TextureVideo.prototype.play = function (){
    this.paused = false;
    
    if (this.isReady()){
        this.video.play();
    };
};

Tessellator.TextureVideo.prototype.pause = function (){
    this.paused = true;
    
    if (this.isReady()){
        this.video.pause();
    };
};

Tessellator.TextureVideo.prototype.toogle = function (){
    if (this.paused){
        this.play();
    }else{
        this.pause();
    };
};

Tessellator.TextureVideo.prototype.loop = function (){
    return this.video.loop;
};

Tessellator.TextureVideo.prototype.looping = function (loop){
    this.video.loop = loop;
};

Tessellator.TextureVideo.prototype.mute = function (){
    this.video.volume = 0;
};

Tessellator.TextureVideo.prototype.volume = function (level){
    this.volumeLevel = level;
    this.unmute();
};

Tessellator.TextureVideo.prototype.unmute = function (){
    if (!this.volumeLevel){
        this.volumeLevel = 1;
    };
    
    this.video.volume = this.volumeLevel;
};

Tessellator.TextureVideo.prototype.configure = function (target, track){
    var gl = this.tessellator.GL;
    
    if (this.isReady()){
        if (!track || track.constructor === Tessellator.RenderMatrix){
            track = null;
            
            if (this.autoUpdate || !this.isTracking(track)){
                if (!this.texture){
                    gl.bindTexture(gl.TEXTURE_2D, this.texture = gl.createTexture());
                    this.filter(this.tessellator, this);
                }else{
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                };
            };
        };
        
        if (this.autoUpdate || !this.isTracking(track)){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(this.tessellator.glConst(target), 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
            
            this.track(track);
            return true;
        };
    };
    
    return false;
};