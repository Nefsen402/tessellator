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

Tessellator.UniformManager = function (tessellator, fallback){
    this.uniforms = {};
    
    this.tessellator = tessellator;
    this.fallback = fallback;
    this.uedits = 0;
};

Tessellator.UniformManager.prototype.hasUniform = function (key){
    return (key in this.uniforms) || (this.fallback && this.fallback.hasUniform(key));
};

Tessellator.UniformManager.prototype.getUniform = function (key){
    return this.uniforms[key] || (this.fallback && this.fallback.getUniform(key));
};

Tessellator.UniformManager.prototype.uniform = function (key, value, matrix){
    var u = this.uniforms[key];
    
    if (u){
        u.configure(value, matrix);
        u.initialValue = false;
        u.edits++;
    }else if (this.fallback){
        this.fallback.uniform(key, value, matrix);
    }
};

Tessellator.UniformManager.prototype.preUnify = function (matrix){
    for (var o in this.uniforms){
        var u = this.uniforms[o];
        u.shader = matrix.renderer.shader;
        u.location = u.shader.getUniform(o);
        
        if (u.startMap){
            u.startMap(matrix, matrix.gets(o));
        };
    };
    
    if (this.fallback) this.fallback.preUnify(matrix);
};

Tessellator.UniformManager.prototype.unify = function (matrix){
    for (var o in this.uniforms){
        var u = this.uniforms[o];
        var ru = u.shader.getUniform(o);
        
        if (ru){
            if (u.map){
                u.map(matrix);
            };
            
            if (!u.initialValue && u.inherit && u.edits !== ru.edits){
                u.inherit(matrix);
                
                ru.edits = u.edits;
                this.uedits++;
            };
        };
    };
    
    if (this.fallback) this.fallback.unify(matrix);
};

Tessellator.UniformManager.prototype.setInheriter = function (key, value){
    if (!value.configure){
        value.configure = Tessellator.Program.DEFAULT_CONFIG;
    };
    
    var u = this.uniforms[key];
    
    if (!u && this.fallback){
        var uu = this.fallback.getUniform(key);
        
        if (uu){
            u = {};
            
            for (var o in uu){
                u[o] = uu[o];
            };
        };
    };
    
    if (u){
        u.inherit = value;
        u.configure = u.inherit.configure;
        u.map = u.inherit.map;
        u.startMap = u.inherit.startMap;
        
        if (u.edits === undefined){
            u.edits = 0;
        };
    }else{
        u = {
            gl: this.tessellator.GL,
            configure: value.configure,
            tessellator: this.tessellator,
            manager: this,
            custom: value,
        };
        
        this.uniforms[key] = u;
    };
    
    return this;
};

Tessellator.UniformManager.prototype.createManager = function (uniform){
    var name;
                
    if (uniform.size > 1){
        name = uniform.name.substring(0, uniform.name.length - 3);
    }else{
        name = uniform.name;
    };
    
    if (!this.uniforms[name]){
        var inherit = Tessellator.Program.DEFAULT_UNIFORM_INHERITER[uniform.type];
        
        this.uniforms[name] = {
            gl: this.tessellator.GL,
            manager: this,
            tessellator: this.tessellator,
            name: name,
            value: null,
            initialValue: true,
            inherit: inherit,
            configure: inherit.configure,
            map: inherit.map,
            startMap: inherit.startMap,
            size: uniform.size,
            type: uniform.type,
            edits: 0,
        };
    }else if (this.uniforms[name].custom){
        var u = this.uniforms[name];
        
        u.size = uniform.size;
        u.type = uniform.type;
        u.edits = 0;
        u.startMap = u.custom.startMap;
        u.map = u.custom.map;
        u.inherit = u.custom;
        u.initialValue = true;
        u.name = name;
        u.value = null;
        
        u.custom = undefined;
    };
    
    return name;
};

Tessellator.UniformManager.prototype.clone = function (){
    var u = new Tessellator.UniformManager(this.tessellator);
    
    for (var o in this.uniforms){
        var n = {};
        var old = this.uniforms[o];
        
        for (var oo in old){
            n[oo] = old[oo];
        };
        
        n.manager = u;
        
        u.uniforms[o] = n;
    };
    
    return u;
};