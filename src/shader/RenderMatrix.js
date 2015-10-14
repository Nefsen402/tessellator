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

Tessellator.RenderMatrix = function (renderer, parent){
    this.uniforms = {};
    this.enabled = {};
    
    this.renderer = renderer;
    this.tessellator = renderer.tessellator;
    
    if (parent){
        this.copyMatrix(parent);
    }else{
        if (renderer.shader){
            this.uniformManager = new Tessellator.UniformManager(this.tessellator, this.renderer.shader.getUniforms());
        };
        
        this.changes = {};
        
        this.index = 1;
        
        this.glBlendFunc = Tessellator.BLEND_DEFAULT;
        this.glDepthMask = 1;
        this.glDepthFunc = Tessellator.LEQUAL;
        this.glLineWidth = 1;
        
        this.enable(Tessellator.CULL_FACE);
        this.enable(Tessellator.DEPTH_TEST);
        
        if (this.renderer.shader && this.renderer.shader.getDefinitions){
            this.definitions = this.renderer.shader.getDefinitions();
        };
        
        renderer.configure(this);
    };
};

Tessellator.RenderMatrix.prototype.MAX_INDEX = 1000000000;

Tessellator.RenderMatrix.prototype.copyMatrix = function (parent){
    this.uniformManager = parent.uniformManager;
    
    for (var o in parent.uniforms){
        this.uniforms[o] = parent.uniforms[o];
    };
    
    for (var o in parent.enabled){
        this.enabled[o] = parent.enabled[o];
    };
    
    this.changes = parent.changes;
    
    for (var o in this.changes){
        if (this.changes[o] > parent.index){
            this.changes[o] = this.MAX_INDEX;
        };
    };
    
    this.index = parent.index + 1;
    
    this.glBlendFunc = parent.glBlendFunc;
    this.glDepthMask = parent.glDepthMask;
    this.glDepthFunc = parent.glDepthFunc;
    this.glLineWidth = parent.glLineWidth;
    
    if (!parent.definitions){
        if (this.renderer.shader && this.renderer.shader.getDefinitions){
            this.definitions = this.renderer.shader.getDefinitions();
        };
    }else{
        this.definitions = parent.definitions;
    };
};

Tessellator.RenderMatrix.prototype.dirty = function (item){
    if (item){
        this.changes[item] = this.MAX_INDEX;
    }else for (var o in this.changes){
        this.changes[o] = this.MAX_INDEX;
    };
};

Tessellator.RenderMatrix.prototype.exists = function (key){
    return this.uniformManager.hasUniform(key);
};

Tessellator.RenderMatrix.prototype.set = function (key, value){
    this.dirty(key);
    
    this.uniforms[key] = value;
};

//new set. will not set if there is already a value
Tessellator.RenderMatrix.prototype.setn = function (key, value){
    if (!this.uniforms[key]){
        this.dirty(key);
        
        this.uniforms[key] = value;
    };
};

Tessellator.RenderMatrix.prototype.get = function (key){
    this.dirty(key);
    
    return this.gets(key);
};

//sneaky get. does not set the value dirty
Tessellator.RenderMatrix.prototype.gets = function (key){
    return this.uniforms[key];
};

Tessellator.RenderMatrix.prototype.preUnify = function (){
    if (this.definitions){
        this.renderer.shader.setDefinitions(this.definitions);
    };
    
    this.uniformManager.preUnify(this);
};

Tessellator.RenderMatrix.prototype.unify = function (){
    var c = false;
    
    for (var o in this.uniforms){
        if (this.changes[o] > this.index){
            this.uniformManager.uniform(o, this.uniforms[o], this);
            
            this.changes[o] = this.index;
            
            c = true;
        };
    };
    
    if (c){
        this.uniformManager.unify(this);
    };
    
    this.unifyGLAttributes();
};

Tessellator.RenderMatrix.prototype.unifyAll = function (){
    for (var o in this.uniforms){
        this.uniformManager.uniform(o, this.uniforms[o], this);
        
        this.changes[o] = this.index;
    };
    
    this.uniformManager.unify(this);
    
    this.unifyGLAttributes();
};

Tessellator.RenderMatrix.prototype.unifyGLAttributes = function (){
    var t = this.tessellator;
    
    if (!this.changes.GL_BLEND_FUNC || this.changes.GL_BLEND_FUNC > this.index){
        t.GL.blendFunc(this.glBlendFunc[0], this.glBlendFunc[1]);
        
        this.changes.GL_BLEND_FUNC = this.index;
    };
    
    if (!this.changes.GL_DEPTH_MASK || this.changes.GL_DEPTH_MASK > this.index){
        t.GL.depthMask(this.glDepthMask);
        
        this.changes.GL_DEPTH_MASK = this.index;
    };
    
    if (!this.changes.GL_DEPTH_FUNC || this.changes.GL_DEPTH_FUNC > this.index){
        t.GL.depthFunc(this.glDepthFunc);
        
        this.changes.GL_DEPTH_FUNC = this.index;
    };
    
    if (!this.changes.GL_LINE_WIDTH || this.changes.GL_LINE_WIDTH > this.index){
        t.GL.lineWidth(this.glLineWidth);
        
        this.changes.GL_LINE_WIDTH = this.index;
    };
    
    for (var o in this.enabled){
        if (this.changes[o] > this.index){
            if (this.enabled[o]){
                t.GL.enable(o);
            }else{
                t.GL.disable(o);
            };
            
            this.changes[o] = this.index;
        };
    };
};

Tessellator.RenderMatrix.prototype.has = function (key){
    if (this.uniforms[key] !== undefined){
        return true;
    }else{
        return false;
    };
};

Tessellator.RenderMatrix.prototype.blendFunc = function (value){
    this.glBlendFunc = value;
    
    this.dirty("GL_BLEND_FUNC");
};

Tessellator.RenderMatrix.prototype.depthMask = function (value){
    this.glDepthMask = value;
    
    this.dirty("GL_DEPTH_MASK");
};

Tessellator.RenderMatrix.prototype.depthFunc = function (value){
    this.glDepthFunc = value;
    
    this.dirty("GL_DEPTH_FUNC");
};

Tessellator.RenderMatrix.prototype.lineWidth = function (value){
    this.glLineWidth = value;
    
    this.dirty("GL_LINE_WIDTH");
};

Tessellator.RenderMatrix.prototype.addDefinition = function (def){
    if (this.definitions){
        var s = this.renderer.shader;
        
        s.setDefinitions(this.definitions);
        s.addDefinition(def);
        this.definitions = s.getDefinitions();
    };
};

Tessellator.RenderMatrix.prototype.removeDefinition = function (def){
    if (this.definitions){
        var s = this.renderer.shader;
        
        s.setDefinitions(this.definitions);
        s.removeDefinition(def);
        this.definitions = s.getDefinitions();
    };
};

Tessellator.RenderMatrix.prototype.resetDefinitions = function (){
    if (this.definitions){
        var s = this.renderer.shader;
        
        s.resetDefinitions();
        this.definitions = s.getDefinitions();
    };
};

Tessellator.RenderMatrix.prototype.isEnabled = function (value){
    return this.enabled[value];
};

Tessellator.RenderMatrix.prototype.enable = function (value){
    this.enabled[value] = true;
    this.dirty(value);
};

Tessellator.RenderMatrix.prototype.disable = function (value){
    this.enabled[value] = false;
    this.dirty(value);
};

Tessellator.RenderMatrix.prototype.copy = function (renderer) {
    if (renderer){
        var copy = new Tessellator.RenderMatrix(renderer);
        copy.copyMatrix(this);
        
        return copy;
    }else{
        return new Tessellator.RenderMatrix(this.renderer, this);
    };
};