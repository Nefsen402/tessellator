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

Tessellator.prototype.createTextureBuffered = function (){
    return Tessellator.new.apply(Tessellator.TextureBuffered, [this].concat(Array.prototype.slice.call(arguments)));
}

Tessellator.TextureBuffered = function (){
    this.tessellator = arguments[0];
    this.parentTexture = arguments[1];
    
    if (arguments.length === 4){
        this.width = arguments[2];
        this.height = arguments[3];
        
        if (!this.parentTexture.isReady()){
            var self = this;
            
            this.parentTexture.addListener(function (){
                self.init();
            });
        }else{
            this.init();
        }
    }else if (arguments.length === 3){
        var scale = arguments[2];
        
        if (!this.parentTexture.isReady()){
            var self = this;
            
            this.parentTexture.addListener(function (){
                self.width = self.parentTexture.width * scale;
                self.height = self.parentTexture.height * scale;
                
                self.init();
            });
        }else{
            this.width = this.parentTexture.width * scale;
            this.height = this.parentTexture.height * scale;
            
            this.init();
        }
    }else{
        throw "invalid arguments in Tessellator.CompressedTexture";
    }
}

Tessellator.extend(Tessellator.TextureBuffered, Tessellator.TextureModel);

Tessellator.TextureBuffered.prototype.init = function (){
    this.renderer = new Tessellator.FullScreenTextureRenderer(this.tessellator.createPixelShader(Tessellator.PIXEL_SHADER_PASS));
    
    this.super(this.tessellator, this.width, this.height, [
        new Tessellator.TextureModel.AttachmentColor(this.filter),
        new Tessellator.TextureModel.AttachmentRenderer(this.renderer, this.parentTexture),
    ]);
}