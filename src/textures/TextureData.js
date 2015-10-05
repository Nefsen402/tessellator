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

Tessellator.TextureData = function (tessellator, width, height, dataType, storeType, data, filter){
    this.super(tessellator);
    
    this.width = width;
    this.height = height;
    this.data = data;
    this.filter = filter;
    
    dataType = dataType || Tessellator.RGBA;
    storeType = storeType || Tessellator.UNSIGNED_BYTE;
    
    if (!this.filter){
        this.filter = Tessellator.getAppropriateTextureFilter(this.width, this.height);
    };
    
    {
        var dataStorageType = Uint8Array;
        
        if (storeType === Tessellator.FLOAT || storeType === Tessellator.FLOAT32){
            if (this.filter.name.indexOf("LINEAR") >= 0){
                if (!tessellator.extensions.get("OES_texture_float_linear")){
                    throw "floating point linear textures not supported. Support for a non-linear texture filter may be possibe";
                };
            }else{
                if (!tessellator.extensions.get("OES_texture_float")){
                    throw "floating point textures not supported!";
                };
            };
            
            dataStorageType = Float32Array;
        }else if (storeType === Tessellator.FLOAT16){
            if (this.filter.name.indexOf("LINEAR") >= 0){
                if (!tessellator.extensions.get("OES_texture_half_float_linear")){
                    throw "half floating point linear textures not supported. Support for a non-linear texture filter may be possibe";
                };
            }else{
                if (!tessellator.extensions.get("OES_texture_half_float")){
                    throw "half floating point textures not supported!";
                };
            };
            
            dataStorageType = Uint16Array;
        }else if (storeType === Tessellator.UNSIGNED_SHORT_4_4_4_4){
            dataStorageType = Uint16Array;
        }else if (storeType === Tessellator.UNSIGNED_SHORT_5_5_5_1){
            dataStorageType = Uint16Array;
        }else if (storeType === Tessellator.UNSIGNED_SHORT_5_6_5){
            dataStorageType = Uint16Array;
        };
        
        if (!this.data){
            if (dataType === Tessellator.ALPHA){
                this.data = new dataStorageType(this.width * this.height * 1);
            }else if (dataType === Tessellator.LUMINANCE){
                this.data = new dataStorageType(this.width * this.height * 1);
            }else if (dataType === Tessellator.LUMINANCE_ALPHA){
                this.data = new dataStorageType(this.width * this.height * 2);
            }else if (dataType === Tessellator.RGB){
                this.data = new dataStorageType(this.width * this.height * 3);
            }else if (dataType === Tessellator.RGBA){
                this.data = new dataStorageType(this.width * this.height * 4);
            };
        };
        
        this.dataType = tessellator.glConst(dataType);
        this.storeType = tessellator.glConst(storeType);
    };
    
    this.setReady();
};

Tessellator.copyProto(Tessellator.TextureData, Tessellator.Texture);

Tessellator.TextureData.prototype.configure = function (target, track){
    var gl = this.tessellator.GL;
    if (this.isReady()){
        if (!track || track.constructor === Tessellator.RenderMatrix){
            track = null;
            
            if (!this.isTracking(track)){
                if (!this.texture){
                    gl.bindTexture(gl.TEXTURE_2D, this.texture = gl.createTexture());
                    this.filter(this.tessellator, this);
                }else{
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                };
            };
        };
        
        if (!this.isTracking(track)){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
            this.tessellator.GL.texImage2D(this.tessellator.glConst(target), 0, this.dataType, this.width, this.height, 0, this.dataType, this.storeType, this.data);
            
            this.track(track);
        };
    };
};