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

Tessellator.prototype.createTextureQueue = function (){
    return Tessellator.new.apply(Tessellator.TextureQueue, arguments);
}

Tessellator.TextureQueue = function (){
    this.textures = Array.prototype.slice.call(arguments);
    
    this.textureIndex = 0;
    this.texture = this.textures[this.textureIndex];
    
    this.loaded = true;
}

Tessellator.TextureQueue.prototype.frame = function (frame){
    this.textureIndex = frame;
    this.texture = this.textures[frame];
    
    this.loaded = this.texture.loaded;
    
    if (!this.texture.isReady()){
        var self = this;
        
        this.texture.addListener(function (tex){
            self.texture = tex;
        });
        
        self.texture = new Tessellator.TextureDummy();
    }
}

Tessellator.TextureQueue.prototype.nextTexture = function (){
    if (this.textureIndex = this.textures.length - 1){
        this.textureIndex = 0;
        this.texture = this.textures[0];
    }else{
        this.texture = this.textures[++this.textureIndex];
    }
}

Tessellator.TextureQueue.prototype.play = function (frequency){
    var self = this;
    
    this.interval = window.setInterval(function (){
        self.nextTexture();
    }, frequency);
}

Tessellator.TextureQueue.prototype.stop = function (){
    if (this.interval){
        window.clearInterval(this.interval);
        
        delete this.interval;
    }
}

Tessellator.TextureQueue.prototype.configure = function (target, track){
    this.texture.configure(target, track);
}

Tessellator.TextureQueue.prototype.bind = function (render){
    this.texture.bind(render);
}

Tessellator.TextureQueue.prototype.dispose = function (){
    this.stop();
    
    for (var i = 0, k = this.textures.length; i < k; i++){
        this.textures[i].dispose();
    }
    
    this.tessellator.resources.remove(this);
}