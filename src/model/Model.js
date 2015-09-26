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

Tessellator.prototype.renderModel = function (model, renderer){
    model.renderModel(renderer);
}

Tessellator.prototype.createModel = function (renderer){
    return new Tessellator.Model(this, renderer);
}

Tessellator.prototype.createMatrix = Tessellator.prototype.createModel;

Tessellator.Model = function (tessellator, renderer){
    this.type = Tessellator.MODEL;
    
    this.render = false;
    this.disposable = true;
    this.disposed = false;
    this.renderer = renderer;
    
    this.tessellator = tessellator;
    
    this.matrixStack = [ this ];
}

Tessellator.Model.prototype.renderModel = function (renderer){
    if (!renderer){
        if (this.renderer){
            renderer = this.renderer;
        }else{
            if (!this.tessellator.defaultRenderer){
                this.tessellator.defaultRenderer = new Tessellator.ModelRenderer(this.tessellator);
            }
            
            renderer = this.tessellator.defaultRenderer;
        }
    }
    
    renderer.render(null, this);
}

Tessellator.Model.prototype.remove = function (obj){
    if (this.model){
        if (!isNaN(obj)){
            this.model.splice(obj, 1)
        }else{
            if (!obj && this.parent){
                this.parent.remove(this);
            }else{
                this.model.splice(this.model.indexOf(obj), 1);
            }
        }
    }
}

Tessellator.Model.prototype.apply = function (matrix, mod, renderer){
    if (this.render){
        var copy = matrix.copy(renderer || this.renderer);
        copy.set("mvMatrix", matrix.gets("mvMatrix").clone());
        
        if (this.renderer){
            this.renderer.render(copy, this);
        }else{
            renderer.renderRaw(copy, this);
        }
    }
}

Tessellator.Model.prototype.applyLighting = function (matrix, index, renderer){
    if (this.render && !this.renderer){
        return renderer.setLighting(this, matrix.clone(), index);
    }
}

Tessellator.Model.prototype.init = function (interpreter){
    interpreter.flush();
}

Tessellator.Model.prototype.push = function (renderer){
    var matrix = new Tessellator.Model(this.tessellator, renderer);
    matrix.parent = this.matrixStack[this.matrixStack.length - 1];
    
    this.add(matrix);
    this.matrixStack.push(matrix);
    
    return matrix;
}

Tessellator.Model.prototype.pop = function () {
    if (this.matrixStack.length <= 1){
        throw "cannot pop from a empty matrix stack!";
    }
    
    return this.matrixStack.pop().update();
}


Tessellator.Model.prototype.createModel = function (renderer) {
    var matrix = new Tessellator.Model(this.tessellator, renderer);
    matrix.parent = this;
    
    this.add(matrix);
    
    return matrix;
}

Tessellator.Model.prototype.createMatrix = Tessellator.Model.prototype.createModel;

Tessellator.Model.prototype.configureDrawing = function (){
    var matrix = this.matrixStack[this.matrixStack.length - 1];
    
    if (!matrix.isDrawing()){
        matrix.disposeShallow();
        this.disposed = false;
        
        matrix.actions = new Tessellator.Initializer(matrix.tessellator, matrix.parent ? matrix.parent.actions : null);
    }
}

Tessellator.Model.prototype.add = function (action){
    if (!action){
        throw "null pointer";
    }
    
    this.configureDrawing();
    
    this.matrixStack[this.matrixStack.length - 1].actions.push(action);
    return action;
}

Tessellator.Model.prototype.isDrawing = function (){
    return this.actions && this.actions.constructor === Tessellator.Initializer;
}

Tessellator.Model.prototype.finish = function (){
    if (this.matrixStack.length > 1){
        throw "cannot finish a model with items in the matrixStack!";
    }
    
    this.disposed = false;
    
    if (this.isDrawing()){
        this.model = this.actions.finish();
        this.actions = {
            attribs: this.actions.attribs
        };
        
        this.render = true;
    }else{
        this.model = null;
        
        this.render = false;
    }
    
    return this;
}

//for compatibility
Tessellator.Model.prototype.update = Tessellator.Model.prototype.finish;


Tessellator.Model.prototype.dispose = function (){
    this.render = false;
    
    if (this.model){
        this.disposed = true;
        
        for (var i = 0, k = this.model.length; i < k; i++){
            var mod = this.model[i];
            
            if (mod.disposable){
                mod.dispose();
            }
        }
        
        this.model = null;
    }
    
    this.remove();
}

Tessellator.Model.prototype.disposeShallow = function (){
    this.render = false;
    this.disposed = true;
    
    if (this.model){
        for (var i = 0, k = this.model.length; i < k; i++){
            var mod = this.model[i];
            
            if (mod.type !== Tessellator.MODEL && mod.type !== Tessellator.MODEL_FRAGMENT){
                if (mod.disposable){
                    if (mod.disposable){
                        mod.dispose();
                    }
                }
            }
        }
        
        this.model = null;
    }
    
    this.remove();
}

Tessellator.Model.prototype.createTexture = function (width, height, filter, renderer){
    return new Tessellator.TextureModel(this.tessellator, width, height, [
        new Tessellator.TextureModel.AttachmentColor(filter),
        new Tessellator.TextureModel.AttachmentDepth(),
        new Tessellator.TextureModel.AttachmentModel(this, renderer)
    ]);
}

Tessellator.Model.prototype.countRenderItems = function (){
    var count = 0;
    
    if (this.model){
        for (var i = 0, k = this.model.length; i < k; i++){
            if (this.model[i].type === Tessellator.MODEL){
                if (this.model[i].render){
                    count += this.model[i].countRenderItems();
                }
            }
            
            count++;
        }
    }
    
    return count;
}