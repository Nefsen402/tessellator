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

Tessellator.prototype.createTextureAtlas = function (){
    return Tessellator.new.apply(Tessellator.TextureAtlas, [this].concat(Array.prototype.slice.call(arguments)));
}

Tessellator.TextureAtlas = function (tessellator, width, height){
    if (!tessellator.textureAtlasRenderer){
        tessellator.textureAtlasRenderer = new Tessellator.AtlasRenderer(tessellator);
    }
    
    if (arguments.length === 4){
        this.atlas = arguments[3];
        
        this.updateAtlas();
    }else if (arguments.length === 5){
        if (isNaN(arguments[3])){
            this.atlas = arguments[3];
            this.filter = arguments[4];
            
            this.updateAtlas();
        }else{
            var
                segX = arguments[3],
                segY = arguments[4];
            
            this.atlas = new Array(segX);
            for (var i = 0; i < segX; i++){
                this.atlas[i] = new Array(segY);
            }
        }
    }else if (arguments.length === 6){
        var
            segX = arguments[3],
            segY = arguments[4];
        
        this.filter = arguments[5];
        
        this.atlas = new Array(segX);
        for (var i = 0; i < segX; i++){
            this.atlas[i] = new Array(segY);
        }
    }else{
        throw "invalid arguments";
    }
    
    this.super(tessellator, width, height, [
        new Tessellator.TextureModel.AttachmentColor(this.filter),
        new Tessellator.TextureModel.AttachmentRenderer(tessellator.textureAtlasRenderer, this),
    ]);
    
    this.disposable = false;
    this.updateCache = [];
}

Tessellator.copyProto(Tessellator.TextureAtlas, Tessellator.TextureModel);

Tessellator.TextureAtlas.prototype.updateAtlas = function (textures){
    if (textures){
        var self = this;
        
        if (!textures.update){
            textures.update = true;
            
            var func = function (){
                for (var i = 0; i < textures.length; i++){
                    if (!textures[i].texture.isReady()){
                        textures[i].texture.addListener(func);
                        
                        return;
                    }
                }
                
                self.updateCache.push(textures);
            }
            
            func();
        }
    }else{
        for (var x = 0, xk = this.atlas.length; x < xk; x++){
            for (var y = 0, yk = this.atlas[x].length; y < yk; y++){
                if (this.atlas[x][y]) this.updateAtlas(this.atlas[x][y]);
            }
        }
    }
}

Tessellator.TextureAtlas.prototype.set = function (x, y, texture){
    this.atlas[x][y] = [{
        texture: texture,
    }];
    
    this.atlas[x][y].pos = Tessellator.vec2(x, y);
    
    this.updateAtlas(this.atlas[x][y]);
}

Tessellator.TextureAtlas.prototype.get = function (x, y, i){
    return this.atlas[x][y][i || 0].texture;
}

Tessellator.TextureAtlas.prototype.add = function (x, y, texture){
    if (!this.atlas[x][y]){
        this.set.apply(this, arguments);
    }else{
        this.atlas[x][y].push({
            texture: texture
        });
        
        this.updateAtlas(this.atlas[x][y]);
    }
}

Tessellator.TextureAtlas.prototype.mask = function (x, y, mask, i){
    this.atlas[x][y][i || 0].mask = mask;
    
    this.updateAtlas(this.atlas[x][y]);
}