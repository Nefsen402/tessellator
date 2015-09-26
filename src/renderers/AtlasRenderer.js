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

Tessellator.AtlasRenderer = function (tessellator){
    this.super(Tessellator.ATLAS_SHADER.create(tessellator));
}

Tessellator.copyProto(Tessellator.AtlasRenderer, Tessellator.FullScreenRenderer);

Tessellator.AtlasRenderer.prototype.NO_MASK = Tessellator.vec4(1, 1, 1, 1);

Tessellator.AtlasRenderer.prototype.renderRaw = function (render, atlas){
    var gl = this.tessellator.GL;
    
    render.blendFunc(Tessellator.BLEND_DEFAULT);
    render.disable(gl.BLEND);
    
    render.set("atlasDims", Tessellator.vec2(atlas.atlas.length, atlas.atlas[0].length));
    
    for (var i = 0; i < atlas.updateCache.length; i++){
        var textures = atlas.updateCache[i];
        var ii;
        
        render.set("atlas", textures.pos);
        
        for (ii = 0; ii < textures.length; ii++){
            var texture = textures[ii];
            
            if (texture.mask){
                render.set("mask", texture.mask);
            }else{
                render.set("mask", this.NO_MASK);
            }
            
            if (ii > 0){
                render.enable(gl.BLEND);
            }
            
            render.set("sampler", texture.texture);
            this.super.renderRaw(render);
        }
        
        if (ii > 1){
            render.disable(gl.BLEND);
        }
    }
}