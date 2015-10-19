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
    this.uniforms = [];
    this.enabled = [];
    
    this.renderer = renderer;
    this.tessellator = renderer.tessellator;
    
    if (parent){
        this.copyMatrix(parent);
    }else{
        this.uniformManager = new Tessellator.UniformManager(this.tessellator);
        
        if (this.renderer.shader){
            this.uniformManager.fallback = this.renderer.shader.getUniforms();
        };
        
        this.changes = [];
        this.eChanges = [];
        
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

Tessellator.RenderMatrix.prototype.copyMatrix = function (parent){
    this.uniformManager = parent.uniformManager;
    
    if (this.renderer.shader){
        this.uniformManager.fallback = this.renderer.shader.getUniforms();
    };
    
    this.uniforms = parent.uniforms.slice(0);
    this.enabled = parent.enabled.slice(0);
    
    this.changes = parent.changes;
    this.eChanges = parent.eChanges;
    
    for (var i = 0; i < this.changes.length; i += 2){
        if (this.changes[i + 1] > parent.index){
            this.changes[i + 1] = -parent.index;
        };
    };
    
    for (var i = 0; i < this.eChanges.length; i += 2){
        if (this.eChanges[i + 1] > parent.index){
            this.eChanges[i + 1] = -parent.index;
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

Tessellator.RenderMatrix.prototype.dirty = function (key){
    if (key){
        for (var i = 0; i < this.changes.length; i += 2){
            if (this.changes[i] === key){
                this.changes[i + 1] = -this.index;
                
                return;
            };
        };
    }else for (var i = 0; i < this.changes.length; i += 2){
        this.changes[i + 1] = -this.index;
    };
};

Tessellator.RenderMatrix.prototype.exists = function (key){
    return this.uniformManager.hasUniform(key);
};

//new set. will not set if there is already a value
Tessellator.RenderMatrix.prototype.setn = function (key, value){
    if (!this.gets(key)){
        this.set(key, value)
    };
};

Tessellator.RenderMatrix.prototype.get = function (key){
    this.dirty(key);
    
    return this.gets(key);
};

Tessellator.RenderMatrix.prototype.preUnify = function (){
    this.uniformManager.preUnify(this);
    
    if (this.definitions){
        this.renderer.shader.setDefinitions(this.definitions);
    };
};

Tessellator.RenderMatrix.prototype.has = function (key){
    return this.gets(key) !== undefined;
};

Tessellator.RenderMatrix.prototype.gets = function (key){
    for (var i = 0; i < this.changes.length; i += 2){
        if (this.changes[i] === key) return this.uniforms[i / 2];
    };
    
    return null;
};

Tessellator.RenderMatrix.prototype.set = function (key, value){
    this.changes[this.sets(key, value) + 1] = -this.index; 
};

Tessellator.RenderMatrix.prototype.sets = function (key, value){
    for (var i = 0; i < this.changes.length; i += 2){
        if (this.changes[i] === key){
            this.uniforms[i / 2] = value;
            
            return i;
        };
    };
    
    this.changes[i + 0] = key;
    this.uniforms[i / 2] = value;
    
    return i;
};

Tessellator.RenderMatrix.prototype.unify = function (){
    var c = false;
    
    for (var i = 0; i < this.changes.length; i += 2){
        var index = this.changes[i + 1];
        
        if (index < 0){
            this.uniformManager.uniform(this.changes[i], this.uniforms[i / 2], this);
            this.changes[i + 1] = -index;
            
            c = true;
         }else if (index > this.index){
            this.uniformManager.uniform(this.changes[i], this.uniforms[i / 2], this);
            
            this.changes[i + 1] = this.index;
            
            c = true;
        };
    };
    
    if (c){
        this.uniformManager.unify(this);
    };
    
    this.unifyGLAttributes();
};

Tessellator.RenderMatrix.prototype.unifyAll = function (){
    for (var i = 0; i < this.changes.length; i += 2){
        this.uniformManager.uniform(this.changes[i], this.uniforms[i / 2], this);
        
        this.changes[i + 1] = this.index;
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
    
    for (var i = 0; i < this.eChanges.length; i += 2){
        var index = this.eChanges[i + 1];
        
        if (index < 0){
            var a = this.eChanges[i];
            
            if (this.enabled[i / 2]){
                t.GL.enable(a);
            }else{
                t.GL.disable(a);
            };
            
            this.eChanges[i + 1] = -index;
        }else if (index > this.index){
            var a = this.eChanges[i];
            
            if (this.enabled[i / 2]){
                t.GL.enable(a);
            }else{
                t.GL.disable(a);
            };
            
            this.eChanges[i + 1] = this.index;
        };
    };
};

Tessellator.RenderMatrix.prototype.blendFunc = function (value){
    this.glBlendFunc = value;
    
    this.changes.GL_BLEND_FUNC = -this.index;
};

Tessellator.RenderMatrix.prototype.depthMask = function (value){
    this.glDepthMask = value;
    
    this.changes.GL_DEPTH_MASK = -this.index;
};

Tessellator.RenderMatrix.prototype.depthFunc = function (value){
    this.glDepthFunc = value;
    
    this.changes.GL_DEPTH_FUNC = -this.index;
};

Tessellator.RenderMatrix.prototype.lineWidth = function (value){
    this.glLineWidth = value;
    
    this.changes.GL_LINE_WIDTH = -this.index;
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
    for (var i = 0; i < this.eChanges.length; i += 2){
        if (this.eChanges[i] === value){
            return this.enabled[i / 2];
        };
    };
    
    return false;
};

Tessellator.RenderMatrix.prototype.isEnableDefined = function (value){
    for (var i = 0; i < this.eChanges.length; i += 2){
        if (this.eChanges[i] === value){
            return true;
        };
    };
    
    return false;
};

Tessellator.RenderMatrix.prototype.enable = function (value){
    for (var i = 0; i < this.eChanges.length; i += 2){
        if (this.eChanges[i] === value){
            this.eChanges[i + 1] = -this.index;
            
            this.enabled[i / 2] = true;
            
            return;
        };
    };
    
    this.eChanges[i + 0] = value;
    this.eChanges[i + 1] = -this.index;
    this.enabled[i / 2] = true;
};

Tessellator.RenderMatrix.prototype.disable = function (value){
    for (var i = 0; i < this.eChanges.length; i += 2){
        if (this.eChanges[i] === value){
            this.eChanges[i + 1] = -this.index;
            
            this.enabled[i / 2] = false;
            
            return;
        };
    };
    
    this.eChanges[i + 0] = value;
    this.eChanges[i + 1] = -this.index;
    this.enabled[i / 2] = false;
};

Tessellator.RenderMatrix.prototype.copy = function (renderer) {
    if (renderer){
        var copy = new Tessellator.RenderMatrix(renderer, this);
        renderer.configure(copy);
        
        return copy;
    }else{
        return new Tessellator.RenderMatrix(this.renderer, this);
    };
};