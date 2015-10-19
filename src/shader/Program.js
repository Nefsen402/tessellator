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

Tessellator.Program = function (tessellator){
    this.tessellator = tessellator;
    
    this.ready = false;
    
    this.disposable = false;
};

Tessellator.Program.prototype.link = function (shader){
    if (!this.tessellator && !shader.tessellator){
        throw "cannot attach this shader because it does not contain a tessellator object to inherit from";
    }else if (!this.tessellator){
        this.tessellator = shader.tessellator;
    }else if (shader.constructor === Tessellator.ShaderPreset){
        shader = shader.create(this.tessellator);
    };
    
    if (!this.shader){
        this.uniformManager = new Tessellator.UniformManager(this.tessellator);
        this.shader = this.tessellator.GL.createProgram();
        
        this.attribs = {};
        this.uniforms = {};
        
        this.linked = [];
    };
    
    this.linked.push(shader);
    
    if (shader.isReady()){
        var res = shader.onLink(this);
        
        if (res === undefined || res){
            this.tessellator.GL.attachShader(this.shader, shader.shader);
        };
    }else{
        var self = this;
        
        shader.listener = function (shader){
            var res = shader.onLink(self);
        
            if (res === undefined || res){
                self.tessellator.GL.attachShader(self.shader, shader.shader);
            };
            
            if (self.listener){
                self.listener(shader);
            };
        };
    };
    
    return this;
};

Tessellator.Program.prototype.getLinked = function (type){
    for (var i = 0; i < this.linked.length; i++){
        if (this.linked[i].type === type){
            return this.linked[i];
        };
    };
    
    return null;
};

Tessellator.Program.prototype.load = function (){
    if (!this.linked.length){
        throw "no linked shaders!";
    };
    
    var ready = true;
    
    for (var i = 0; i < this.linked.length; i++){
        if (!this.linked[i].isReady()){
            ready = false;
            break;
        };
    };
    
    if (!ready){
        var self = this;
        
        this.listener = self.load;
    }else{
        var gl = this.tessellator.GL;
        
        for (var i = 0; i < this.linked.length; i++){
            this.linked[i].onProgramLoad(this);
        };
        
        gl.linkProgram(this.shader);
        
        if (!gl.getProgramParameter(this.shader, Tessellator.LINK_STATUS)){
            var error = gl.getProgramInfoLog(this.shader);
            
            throw "unable to load shader program: " + error;
        };
        
        {
            var attribs = gl.getProgramParameter(this.shader, Tessellator.ACTIVE_ATTRIBUTES);
            
            this.attributeCount = attribs;
            
            for (var i = 0; i < attribs; i++){
                var attrib = gl.getActiveAttrib(this.shader, i);
                
                this.attribs[attrib.name] = i;
            };
        };
        
        {
            var uniforms = gl.getProgramParameter(this.shader, Tessellator.ACTIVE_UNIFORMS);
            
            this.uniformCount = uniforms;
            this.uniformSpace = 0;
            
            for (var i = 0; i < uniforms; i++){
                var uniform = gl.getActiveUniform(this.shader, i);
                
                if (uniform.type === Tessellator.FLOAT_MAT4){
                    this.uniformSpace += uniform.size * 4;
                }else if (uniform.type === Tessellator.FLOAT_MAT3){
                    this.uniformSpace += uniform.size * 3;
                }else if (uniform.type === Tessellator.FLOAT_MAT2){
                    this.uniformSpace += uniform.size * 2;
                }else{
                    this.uniformSpace += uniform.size;
                };
                
                var name = this.uniformManager.createManager(uniform);
                
                this.uniforms[name] = gl.getUniformLocation(this.shader, uniform.name);
                this.uniforms[name].edits = 0;
            };
        };
        
        this.setReady();
    };
    
    return this;
};

Tessellator.Program.prototype.setReady = function (){
    this.ready = true;
    this.disposed = false;
};

Tessellator.Program.prototype.isReady = function (){
    this.disposed = false;
    
    return this.ready;
};

Tessellator.Program.prototype.getAttributes = function (){
    return this.attribs;
};

Tessellator.Program.prototype.dispose = function (){
    if (this.shader){
        this.tessellator.resources.remove(this);
        
        for (var i = 0; i < this.linked.length; i++){
            if (this.linked[i].disposable){
                this.linked[i].dispose();
            };
        };
        
        this.tessellator.GL.deleteProgram(this.shader);
        this.shader = null;
        
        this.disposed = true;
        this.uniformManager = null;
        this.ready = false;
    }
};

Tessellator.Program.prototype.bind = function (){
    if (this.tessellator.shader !== this){
        this.tessellator.shader = this;
        
        this.tessellator.GL.useProgram(this.shader);
        
        return true;
    };
    
    return false;
};

Tessellator.Program.prototype.set = function (){
    return this.isReady();
};

Tessellator.Program.prototype.getUniforms = function (){
    return this.uniformManager;
};

Tessellator.Program.prototype.getUniform = function (key){
    return this.uniforms[key];
};