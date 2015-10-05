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

Tessellator.ModelRenderer = function (){
    if (arguments.length === 1){
        var arg = arguments[0];
        
        if (arg.type === Tessellator.MODEL){
            if (!Tessellator.ModelRenderer.defaultShader){
                Tessellator.ModelRenderer.defaultShader = Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_SHADER.create(arg.tessellator);
            };
            
            this.super(Tessellator.ModelRenderer.defaultShader);
            
            this.model = arg;
        }else if (arg.constructor === Tessellator){
            if (!Tessellator.ModelRenderer.defaultShader){
                Tessellator.ModelRenderer.defaultShader = Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_SHADER.create(arg);
            };
            
            this.super(Tessellator.ModelRenderer.defaultShader);
        }else{
            this.super(arg);
        };
    }else if (arguments.length === 2){
        var arg = arguments[0];
        
        if (arg.constructor === Tessellator){
            if (!Tessellator.ModelRenderer.defaultShader){
                Tessellator.ModelRenderer.defaultShader = Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_SHADER.create(arg);
            };
            this.super(Tessellator.ModelRenderer.defaultShader);
        }else{
            this.super(arg);
        };
        
        this.model = arguments[1];
    }else{
        this.super();
    };
    
    this.noLightingTexture = new Tessellator.TextureData(this.tessellator, 1, 1, Tessellator.RGBA, Tessellator.UNSIGNED_BYTE, new Uint8Array([0, 255, 255, 255]));
    this.lightingTexture = new Tessellator.TextureData(this.tessellator, 4, 256, Tessellator.RGBA, Tessellator.FLOAT);
};

Tessellator.extend(Tessellator.ModelRenderer, Tessellator.RendererAbstract);

Tessellator.ModelRenderer.prototype.setLighting = function (model, matrix, index){
    var lighting = false;
    
    if (!matrix){
        matrix = Tessellator.mat4();
        var float = Tessellator.float();
        
        lighting = this.setLighting(model, matrix, float);
        this.lightingTexture.data.set(Tessellator.vec4(), float[0] * 4 * 4);
    }else{
        for (var i = 0, k = model.model.length; i < k; i++){
            var action = model.model[i];
            
            if (action.applyLighting && action.applyLighting(matrix, index, this)){
                lighting = true;
            };
        };
    };
    
    return lighting;
};

Tessellator.ModelRenderer.prototype.configure = function (matrix){
    this.shader.setInheriter("mvMatrix", Tessellator.Program.MV_MATRIX_UNIFY_FUNC);
    
    matrix.set("mvMatrix", Tessellator.mat4());
    matrix.set("mask", Tessellator.vec4(1, 1, 1, 1));
    matrix.set("clip", Tessellator.NO_CLIP);
    matrix.set("lights", this.noLightingTexture);
    matrix.set("specular", 0);
    
    this.super.configure(matrix);
};

Tessellator.ModelRenderer.prototype.init = function (matrix, model){
    model = model || this.model;
    
    if (!this.super.init(matrix, model) || !model.render){
        return false;
    };
    
    if (this.setLighting(model)){
        this.lightingTexture.update();
    };
    
    return true;
};

Tessellator.ModelRenderer.prototype.renderRaw = function (matrix, model){
    this.renderModel(matrix, model || this.model);
};

Tessellator.ModelRenderer.prototype.renderModel = function (matrix, model){
    if (model) for (var i = 0, k = model.model.length; i < k; i++){
        var mod = model.model[i];
        
        if (mod.apply){
            mod.apply(matrix, model, this);
        };
    };
};