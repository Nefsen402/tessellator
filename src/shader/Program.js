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

Tessellator.Program = function (tessellator){
    this.tessellator = tessellator;
    
    this.linked = [];
    this.shader = this.tessellator.GL.createProgram();
    this.ready = false;
    this.active = false;
    
    this.attribs = {};
    this.uniforms = {};
    this.uedits = 0;
    
    this.disposable = false;
}

Tessellator.Program.prototype.link = function (shader){
    if (shader.constructor === Tessellator.ShaderPreset){
        shader = shader.create(this.tessellator);
    }
    
    this.linked.push(shader);
    
    if (shader.isReady()){
        var res = shader.onLink(this);
        
        if (res === undefined || res){
            this.tessellator.GL.attachShader(this.shader, shader.shader);
        }
    }else{
        var self = this;
        
        shader.listener = function (shader){
            var res = shader.onLink(self);
        
            if (res === undefined || res){
                self.tessellator.GL.attachShader(self.shader, shader.shader);
            }
            
            if (self.listener){
                self.listener(shader);
            }
        }
    }
    
    return this;
}

Tessellator.Program.prototype.load = function (){
    var ready = true;
    
    for (var i = 0; i < this.linked.length; i++){
        if (!this.linked[i].isReady()){
            ready = false;
            break;
        }
    }
    
    if (!ready){
        var self = this;
        
        this.listener = self.load;
    }else{
        var gl = this.tessellator.GL;
        
        for (var i = 0; i < this.linked.length; i++){
            this.linked[i].onProgramLoad(this);
        }
        
        gl.linkProgram(this.shader);
        
        if (!gl.getProgramParameter(this.shader, gl.LINK_STATUS)){
            var error = gl.getProgramInfoLog(this.shader);
            
            throw "unable to load shader program: " + error;
        }
        
        {
            var attribs = gl.getProgramParameter(this.shader, gl.ACTIVE_ATTRIBUTES);
            
            this.attributeCount = attribs;
            
            for (var i = 0; i < attribs; i++){
                var attrib = gl.getActiveAttrib(this.shader, i);
                
                this.attribs[attrib.name] = i;
            }
        }
        
        {
            var uniforms = gl.getProgramParameter(this.shader, gl.ACTIVE_UNIFORMS);
            
            this.uniformCount = uniforms;
            this.uniformSpace = 0;
            
            for (var i = 0; i < uniforms; i++){
                var uniform = gl.getActiveUniform(this.shader, i);
                
                if (uniform.type === gl.FLOAT_MAT4){
                    this.uniformSpace += uniform.size * 4;
                }else if (uniform.type === gl.FLOAT_MAT3){
                    this.uniformSpace += uniform.size * 3;
                }else if (uniform.type === gl.FLOAT_MAT2){
                    this.uniformSpace += uniform.size * 2;
                }else{
                    this.uniformSpace += uniform.size;
                }
                
                var name;
                
                if (uniform.size > 1){
                    name = uniform.name.substring(0, uniform.name.length - 3);
                }else{
                    name = uniform.name;
                }
                
                var inherit = Tessellator.Program.DEFAULT_UNIFORM_INHERITER[this.tessellator.tessConst(uniform.type)]
                
                this.uniforms[name] = {
                    tessellator: this.tessellator,
                    name: name,
                    value: null,
                    initialValue: true,
                    inherit: inherit,
                    configure: inherit.configure,
                    map: inherit.map,
                    startMap: inherit.startMap,
                    location: gl.getUniformLocation(this.shader, name),
                    shader: this,
                    size: uniform.size,
                    type: this.tessellator.tessConst(uniform.type),
                    edits: 0,
                };
                
            }
            
            if (this.uniformSpace > this.tessellator.maxUniformSpace){
                console.error("The amount of uniforms exceeded the maximum! There may be problems!");
            }
        }
        
        this.setReady();
    }
    
    return this;
}

Tessellator.Program.prototype.setReady = function (){
    this.ready = true;
}

Tessellator.Program.prototype.isReady = function (){
    return this.ready;
}

Tessellator.Program.prototype.hasUniform = function (key){
    return key in this.uniforms;
}

Tessellator.Program.prototype.uniform = function (key, value, matrix, reason){
    var u = this.uniforms[key];
    
    if (u){
        u.configure(value, matrix, reason);
        u.initialValue = false;
        u.edits++;
    }
}

Tessellator.Program.prototype.preUnify = function (matrix){
    for (var o in this.uniforms){
        var u = this.uniforms[o];
        
        if (u.startMap){
            u.startMap(matrix, matrix.gets(o));
        }
    }
}

Tessellator.Program.prototype.unify = function (matrix){
    for (var o in this.uniforms){
        var u = this.uniforms[o];
        
        if (u.map){
            u.map(matrix);
        }
        
        if (!u.initialValue && u.inherit && u.edits !== u.lastUnify){
            u.inherit(matrix);
            
            u.lastUnify = u.edits;
            this.uedits++;
        }
    }
}

Tessellator.Program.prototype.setInheriter = function (key, value){
    if (!value.configure){
        value.configure = Tessellator.Program.DEFAULT_CONFIG;
    }
    
    var u = this.uniforms[key];
    
    if (u){
        u.inherit = value;
        u.configure = u.inherit.configure;
        u.map = u.inherit.map;
        u.startMap = u.inherit.startMap;
        
        if (u.edits === undefined){
            u.edits = 0;
        }
    }else{
        u = {
            configure: value.configure,
            tessellator: this.tessellator,
            shader: this
        };
        
        this.uniforms[key] = u;
    }
    
    return this;
}

Tessellator.Program.prototype.dispose = function (){
    for (var i = 0; i < this.linked.length; i++){
        if (this.linked[i].disposable){
            this.linked[i].dispose();
        }
    }
    
    this.tessellator.GL.deleteProgram(this.shader);
    
    return this;
}

Tessellator.Program.prototype.bind = function (){
    if (this.tessellator.shader !== this){
        this.tessellator.shader = this;
        
        this.tessellator.GL.useProgram(this.shader);
        
        return true;
    }
    
    return false;
}

Tessellator.Program.prototype.set = function (){
    return this.isReady();
}

Tessellator.Program.prototype.postSet = function (){}