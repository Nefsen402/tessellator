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

Tessellator.ActiveProgram = function (program){
    this.tessellator = program.tessellator;
    this.program = program;
    
    this.definitions = [];
    this.definitions.additions = {};
    this.definitions.removed = {};
    this.cache = [this.definitions];
    
    this.uniformManager = new Tessellator.UniformManager(this.tessellator);
};

Tessellator.ActiveProgram.prototype.hasDefinition = function (name){
    return this.definitions.indexOf(name) >= 0;
};

Tessellator.ActiveProgram.prototype.getDefinitions = function (){
    return this.definitions;
};

Tessellator.ActiveProgram.prototype.setDefinitions = function (def){
    this.definitions = def;
};

Tessellator.ActiveProgram.prototype.resetDefinitions = function (){
    this.definitions = this.cache[0];
};

Tessellator.ActiveProgram.prototype.addDefinition = function (name){
    var i = this.definitions.indexOf(name);
    
    if (i < 0){
        i = this.definitions.additions[name];
        
        if (!i){
            for (var x = 1; x < this.cache.length; x++){
                var c = this.cache[x];
                
                var found = c.length === this.definitions.length + 1;
                
                if (found) main:for (var y = 0; y < c.length; y++){
                    for (var z = 0; z < this.definitions.length; z++){
                        if (this.definitions[z] == c[y]){
                            continue main;
                        };
                    };
                    
                    if (name != c[y]){
                        found = false;
                        break;
                    };
                };
                
                if (found){
                    this.definitions.additions[name] = c;
                    c.removed[name] = this.definitions;
                    this.definitions = c;
                    
                    return;
                };
            };
            
            var def = this.definitions.slice();
            def.additions = {};
            def.removed = {};
            def.removed[name] = this.definitions;
            def.push(name);
            
            this.definitions.additions[name] = def;
            this.cache.push(def);
            this.definitions = def;
        }else{
            this.definitions = i;
        };
    };
};

Tessellator.ActiveProgram.prototype.removeDefinition = function (name){
    var i = this.definitions.indexOf(name);
    
    if (i >= 0){
        i = this.definitions.removed[name];
        
        if (!i){
            for (var x = 1; x < this.cache.length; x++){
                var c = this.cache[x];
                
                var found = c.length === this.definitions.length - 1;
                
                if (found) main:for (var y = 0; y < c.length; y++){
                    if (name == c[y]){
                        found = false;
                        break;
                    };
                    
                    for (var z = 0; z < this.definitions.length; z++){
                        if (this.definitions[z] == c[y]){
                            continue main;
                        };
                    };
                };
                
                if (found){
                    this.definitions.removed[name] = c;
                    c.additions[name] = this.definitions;
                    this.definitions = c;
                    
                    return;
                };
            };
            
            var def = this.definitions.slice();
            def.additions = {};
            def.additions[name] = this.definitions;
            def.removed = {};
            def.splice(def.indexOf(name), 1);
            
            this.definitions.removed[name] = def;
            this.cache.push(def);
            this.definitions = def;
        }else{
            this.definitions = i;
        };
    };
};

Tessellator.ActiveProgram.prototype.set = function (){
    return !!this.getShader();
};

Tessellator.ActiveProgram.prototype.getShader = function (){
    if (this.program.isReady()){
        if (!this.definitions.shader){
            if (this.definitions.length === 0){
                this.definitions.shader = this.program;
            }else{
                var str = [];
                
                for (var i = 0; i < this.definitions.length; i++){
                    str.push("#define ", this.definitions[i], "\r\n");
                };
                
                str = str.join("");
                
                var vert = new Tessellator.Shader(this.tessellator, Tessellator.VERTEX_SHADER).load(str + this.program.getLinked(Tessellator.VERTEX_SHADER).getSource());
                var frag = new Tessellator.Shader(this.tessellator, Tessellator.FRAGMENT_SHADER).load(str + this.program.getLinked(Tessellator.FRAGMENT_SHADER).getSource());
                
                this.definitions.shader = new Tessellator.Program(this.tessellator).link(vert).link(frag).load();
                
                for (var o in this.inheriters){
                    this.definitions.shader.setInheriter(o, this.inheriters[o]);
                };
            };
        };
        
        this.uniformManager.fallback = this.definitions.shader.getUniforms();
    };
    
    return this.definitions.shader;
};

Tessellator.ActiveProgram.prototype.dispose = function (){
    for (var i = 1; i < this.cache.length; i++){
        if (this.cache[i].shader){
            this.cache[i].shader.dispose();
        };
    };
};

Tessellator.ActiveProgram.prototype.getAttributes = function (){
    return this.getShader().getAttributes();
};

Tessellator.ActiveProgram.prototype.bind = function (){
    return this.getShader().bind();
};

Tessellator.ActiveProgram.prototype.getUniforms = function (){
    return this.uniformManager;
};

Tessellator.ActiveProgram.prototype.isReady = function (){
    return this.getShader().isReady();
};

Tessellator.ActiveProgram.prototype.getUniform = function (name){
    if (this.getShader()){
        return this.getShader().getUniform(name);
    };
};