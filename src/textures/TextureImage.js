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

Tessellator.prototype.loadTexture = function (src, filter){
    return new Tessellator.TextureImage(this, src, filter);
};

Tessellator.prototype.createTexture = Tessellator.prototype.loadTexture;

Tessellator.prototype.getTexture = function (src){
    var texture;
    
    if (this.textureCache[src]){
        texture = this.textureCache[src];
    }else{
        texture = this.createTexture(src);
        
        this.textureCache[src] = texture;
    };
    
    return texture;
};

Tessellator.TextureImage = function (tessellator, src, filter){
    this.super (tessellator);
    this.filter = filter;
    this.autoUpdate = false;
    
    if (src){
        if (src.constructor === String){
            var self = this;
            
            Tessellator.TextureImage.loadImage(src, function (image){
                self.image = image;
                
                self.width = self.image.width;
                self.height = self.image.height;
                
                if (!self.filter){
                    self.filter = Tessellator.getAppropriateTextureFilter(self.width, self.height);
                };
                
                self.setReady();
            });
        }else if (src.tagName && src.tagName.toLowerCase() == "img"){
            if (src.loaded){
                this.image = src;
                this.width = this.image.width;
                this.height = this.image.height;
                
                if (!this.filter){
                    this.filter = Tessellator.getAppropriateTextureFilter(this.image.width, this.image.height);
                };
                
                this.setReady();
            }else{
                this.image = src;
                var self = this;
                
                this.image.listeners.push(function (){
                    self.width = self.image.width;
                    self.height = self.image.height;
                    
                    if (!self.filter){
                        self.filter = Tessellator.getAppropriateTextureFilter(self.width, self.height);
                    };
                    
                    self.setReady();
                });
            };
        }else{
            this.image = src;
            this.width = this.image.width;
            this.height = this.image.height;
            
            if (!this.filter){
                this.filter = Tessellator.getAppropriateTextureFilter(this.width, this.height);
            };
            
            this.setReady();
        };
    };
};

Tessellator.copyProto(Tessellator.TextureImage, Tessellator.Texture);

Tessellator.TextureImage.prototype.configure = function (target, track){
    var gl = this.tessellator.GL;
    
    if (this.isReady()){
        if (!track || track.constructor === Tessellator.RenderMatrix){
            track = null;
            
            if (this.autoUpdate || !this.isTracking(track)){
                if (!this.texture){
                    gl.bindTexture(gl.TEXTURE_2D, this.texture = gl.createTexture());
                }else{
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                };
                
                this.filter(this.tessellator, this);
            };
        };
        
        if (this.autoUpdate || !this.isTracking(track)){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
            
            this.track(track);
            return true;
        };
    };
    
    return false;
};

Tessellator.TextureImage.imageCache = [];

Tessellator.TextureImage.imageCache.find = function (name){
    for (var i = 0; i < this.length; i++){
        if (this[i].src == name){
            return this[i]
        };
    };
};

Tessellator.TextureImage.loadImage = function (src, onLoad){
    var image = Tessellator.TextureImage.imageCache.find(src);
    
    if (image){
        if (onLoad){
            if (!image.loaded){
                image.listeners.push(onLoad);
            }else{
                onLoad(image);
            };
        };
    }else{
        if (Tessellator.TextureImage.imageCache.length >= 16){
            Tessellator.TextureImage.imageCache.splice(0, 1);
        };
        
        image = document.createElement("img");
        image.loaded = false;
        
        if (onLoad){
            image.listeners = [
                onLoad
            ];
        }else{
            image.listeners = [];
        };
        
        image.onload = function (){
            this.loaded = true;
            Tessellator.TextureImage.lengthLoaded++;
            
            for (var i = 0, k = this.listeners.length; i < k; i++){
                this.listeners[i](this);
            };
            
            delete this.listeners;
        };
        
        image.crossOrigin='';
        image.src = src;
        
        Tessellator.TextureImage.imageCache[src] = image;
    };
    
    return image;
};