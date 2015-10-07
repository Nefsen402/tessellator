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

Tessellator.prototype.createTextureCubeMap = function (filter){
    return new Tessellator.TextureCubeMap(this, filter);
};

Tessellator.TextureCubeMap = function (tessellator, filter){
    this.super(tessellator);
    
    this.type = Tessellator.TEXTURE_CUBE_MAP;
    this.fliter = filter || Tessellator.TEXTURE_FILTER_NEAREST_CLAMP;
    
    this.textures = new Array(6);
};

Tessellator.extend(Tessellator.TextureCubeMap, Tessellator.Texture);

Tessellator.TextureCubeMap.prototype.set = function (side, texture){
    this.textures[Tessellator.TextureCubeMap.INDEX_LOOKUP.indexOf(side)] = {
        texture: texture,
        target: side,
        ref: this,
        tessellator: this.tessellator,
    };
};

Tessellator.TextureCubeMap.prototype.get = function (side){
    return this.textures[Tessellator.TextureCubeMap.INDEX_LOOKUP.indexOf(side)].texture;
};

Tessellator.TextureCubeMap.prototype.configure = function (target, track){
    var gl = this.tessellator.GL;
    
    if (track.constructor === Tessellator.RenderMatrix){
        if (!this.texture){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture = gl.createTexture());
            this.fliter(this.tessellator, this);
        };
        
        var ready = true;
        
        for (var i = 0; i < this.textures.length; i++){
            var tex = this.textures[i];
            
            if (!tex || !tex.texture.isReady()){
                ready = false;
            }else{
                tex.glTexture = this.texture;
                
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
                tex.texture.configure(tex.target, tex);
            };
        };
        
        if (ready){
            this.setReady();
        };
    };
};

Tessellator.TextureCubeMap.mapPos = {};
Tessellator.TextureCubeMap.mapPos[Tessellator.TEXTURE_CUBE_MAP_POSITIVE_X] = Tessellator.vec3(1, 0, 0);
Tessellator.TextureCubeMap.mapPos[Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_X] = Tessellator.vec3(-1, 0, 0);
Tessellator.TextureCubeMap.mapPos[Tessellator.TEXTURE_CUBE_MAP_POSITIVE_Y] = Tessellator.vec3(0, 1, 0);
Tessellator.TextureCubeMap.mapPos[Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_Y] = Tessellator.vec3(0, -1, 0);
Tessellator.TextureCubeMap.mapPos[Tessellator.TEXTURE_CUBE_MAP_POSITIVE_Z] = Tessellator.vec3(0, 0, 1);
Tessellator.TextureCubeMap.mapPos[Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_Z] = Tessellator.vec3(0, 0, -1);

Tessellator.TextureCubeMap.INDEX_LOOKUP = [
    Tessellator.TEXTURE_CUBE_MAP_POSITIVE_X,
    Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_X,
    Tessellator.TEXTURE_CUBE_MAP_POSITIVE_Y,
    Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    Tessellator.TEXTURE_CUBE_MAP_POSITIVE_Z,
    Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_Z
];