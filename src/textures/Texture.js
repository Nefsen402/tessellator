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
 
Tessellator.Texture = function (tessellator){
    this.setTessellator(tessellator);
    this.disposable = false;
    this.disposed = false;
    this.ready = false;
    this.updateRequested = false;
    
    this.tracking = [];
    
    this.type = Tessellator.TEXTURE_2D;
    
    this.width = -1;
    this.height = -1;
};

Tessellator.Texture.prototype.setTessellator = function (tess){
    if (tess && !this.tessellator){
        this.tessellator = tess;
        
        this.tessellator.resources.push(this);
    };
};

Tessellator.Texture.prototype.track = function (obj){
    if (!this.isTracking(obj)){
        this.tracking.push(obj);
        
        return true;
    };
    
    return false;
};

Tessellator.Texture.prototype.isTracking = function (obj){
    for (var i = 0; i < this.tracking.length; i++){
        if (this.tracking[i] === obj){
            return true;
        };
    };
    
    return false;
};

Tessellator.Texture.prototype.untrack = function (obj){
    for (var i = 0; i < this.tracking.length; i++){
        if (this.tracking[i] === obj){
            this.tracking.splice(i, i + 1);
            
            return true;
        };
    };
    
    return false;
};

Tessellator.Texture.prototype.clearTracking = function (){
    this.tracking.splice(0, this.tracking.length);
};

Tessellator.Texture.prototype.getAspect = function (){
    return this.isReady() ? this.width / this.height : undefined;
};

Tessellator.Texture.prototype.addListener = function (func){
    if (!this.isReady()){
        if (this.listeners){
            this.listeners.push(func);
        }else{
            this.listeners = [ func ];
        };
    }else{
        func(this);
    };
};

Tessellator.Texture.prototype.isReady = function (){
    return this.ready && !this.disposed;
};

Tessellator.Texture.prototype.setReady = function (){
    if (!this.isReady()){
        this.ready = true;
        this.disposed = false;
        
        if (this.listeners){
            for (var i = 0; i < this.listeners.length; i++){
                this.listeners[i](this);
            };
            
            this.listeners = null;
        };
        
        if (this.tessellator && this.tessellator.onTextureLoaded){
            this.tessellator.onTextureLoaded(this);
        };
    };
};

Tessellator.Texture.prototype.setDisposable = function (disposable){
    this.disposable = disposable;
    
    return this;
};

Tessellator.Texture.prototype.dispose = function (){
    this.tessellator.resources.remove(this);
    this.disposed = true;
    
    if (this.texture){
        this.tessellator.GL.deleteTexture(this.texture);
        this.texture = null;
    };
};

Tessellator.Texture.prototype.bind = function (){
    this.tessellator.GL.bindTexture(this.type, this.isReady() ? this.texture : null);
};

Tessellator.Texture.prototype.update = function (){
    this.clearTracking();
};

Tessellator.TEXTURE_FILTER_NEAREST = function TEXTURE_FILTER_NEAREST (tessellator, texture){
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_MAG_FILTER, tessellator.GL.NEAREST);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_MIN_FILTER, tessellator.GL.NEAREST);
};

Tessellator.TEXTURE_FILTER_LINEAR = function TEXTURE_FILTER_LINEAR (tessellator, texture){
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_MAG_FILTER, tessellator.GL.LINEAR);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_MIN_FILTER, tessellator.GL.LINEAR);
};

Tessellator.TEXTURE_FILTER_MIPMAP_NEAREST = function TEXTURE_FILTER_MIPMAP_NEAREST (tessellator, texture){
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_MAG_FILTER, tessellator.GL.NEAREST);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_MIN_FILTER, tessellator.GL.LINEAR_MIPMAP_NEAREST);
    tessellator.GL.generateMipmap(texture.type);
};

Tessellator.TEXTURE_FILTER_MIPMAP_LINEAR = function TEXTURE_FILTER_MIPMAP_LINEAR (tessellator, texture){
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_MAG_FILTER, tessellator.GL.LINEAR);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_MIN_FILTER, tessellator.GL.LINEAR_MIPMAP_NEAREST);
    tessellator.GL.generateMipmap(texture.type);
};

Tessellator.TEXTURE_FILTER_LINEAR_CLAMP = function TEXTURE_FILTER_LINEAR_CLAMP (tessellator, texture){
    Tessellator.TEXTURE_FILTER_LINEAR(tessellator, texture);
    
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_S, tessellator.GL.CLAMP_TO_EDGE);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_T, tessellator.GL.CLAMP_TO_EDGE);
};

Tessellator.TEXTURE_FILTER_NEAREST_CLAMP = function TEXTURE_FILTER_NEAREST_CLAMP (tessellator, texture){
    Tessellator.TEXTURE_FILTER_NEAREST(tessellator, texture);
    
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_S, tessellator.GL.CLAMP_TO_EDGE);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_T, tessellator.GL.CLAMP_TO_EDGE);
};

Tessellator.TEXTURE_FILTER_LINEAR_REPEAT = function TEXTURE_FILTER_LINEAR_REPEAT (tessellator, texture){
    Tessellator.TEXTURE_FILTER_LINEAR(tessellator, texture);
    
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_S, tessellator.GL.REPEAT);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_T, tessellator.GL.REPEAT);
};

Tessellator.TEXTURE_FILTER_NEAREST_REPEAT = function TEXTURE_FILTER_NEAREST_REPEAT (tessellator, texture){
    Tessellator.TEXTURE_FILTER_NEAREST(tessellator, texture);
    
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_S, tessellator.GL.REPEAT);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_T, tessellator.GL.REPEAT);
};

Tessellator.TEXTURE_FILTER_LINEAR_MIRRORED_REPEAT = function TEXTURE_FILTER_LINEAR_MIRRORED_REPEAT (tessellator, texture){
    Tessellator.TEXTURE_FILTER_LINEAR(tessellator, texture);
    
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_S, tessellator.GL.MIRRORED_REPEAT);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_T, tessellator.GL.MIRRORED_REPEAT);
};

Tessellator.TEXTURE_FILTER_NEAREST_MIRRORED_REPEAT = function TEXTURE_FILTER_NEAREST_MIRRORED_REPEAT (tessellator, texture){
    Tessellator.TEXTURE_FILTER_NEAREST(tessellator, texture);
    
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_S, tessellator.GL.MIRRORED_REPEAT);
    tessellator.GL.texParameteri(texture.type, tessellator.GL.TEXTURE_WRAP_T, tessellator.GL.MIRRORED_REPEAT);
};

Tessellator.TEXTURE_FILTER_NEAREST_ANISOTROPY = function (tessellator, texture){
    var f = tessellator.extensions.get("EXT_texture_filter_anisotropic");
    
    if (!f){
        throw "anisotropic filtering not supported";
    };
    
    Tessellator.TEXTURE_FILTER_NEAREST(tessellator, texture);
    
    var max = tessellator.GL.getParameter(f.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    tessellator.GL.texParameteri(texture.type, f.TEXTURE_MAX_ANISOTROPY_EXT, max);
};

Tessellator.TEXTURE_FILTER_LINEAR_ANISOTROPY = function (tessellator, texture){
    var f = tessellator.extensions.get("EXT_texture_filter_anisotropic");
    
    if (!f){
        throw "anisotropic filtering not supported";
    };
    
    Tessellator.TEXTURE_FILTER_LINEAR(tessellator, texture);
    
    var max = tessellator.GL.getParameter(f.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    tessellator.GL.texParameteri(texture.type, f.TEXTURE_MAX_ANISOTROPY_EXT, max);
};

Tessellator.TEXTURE_FILTER_NEAREST_ANISOTROPY = function (tessellator, texture){
    var f = tessellator.extensions.get("EXT_texture_filter_anisotropic");
    
    if (!f){
        throw "anisotropic filtering not supported";
    };
    
    Tessellator.TEXTURE_FILTER_NEAREST(tessellator, texture);
    
    var max = tessellator.GL.getParameter(f.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    tessellator.GL.texParameteri(texture.type, f.TEXTURE_MAX_ANISOTROPY_EXT, max);
};

Tessellator.DEFAULT_TEXTURE_FILTER = Tessellator.TEXTURE_FILTER_NEAREST;
Tessellator.DEFAULT_CLAMP_TEXTURE_FILTER = Tessellator.TEXTURE_FILTER_NEAREST_CLAMP;

Tessellator.getAppropriateTextureFilter = function (width, height){
    if (width && height && (width & (width - 1)) === 0 && (height & (height - 1)) === 0){
        return Tessellator.DEFAULT_TEXTURE_FILTER;
    }else{
        return Tessellator.DEFAULT_CLAMP_TEXTURE_FILTER;
    };
};