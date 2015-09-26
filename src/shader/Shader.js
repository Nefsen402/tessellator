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

Tessellator.Shader = function (tessellator, type){
    this.tessellator = tessellator;
    
    if (type){
        this.create(type);
    }
    
    this.ready = false;
    this.disposable = true;
}

Tessellator.Shader.prototype.setReady = function (){
    this.ready = true;
    
    if (this.listener){
        this.listener(this);
    }
}

Tessellator.Shader.prototype.isReady = function (){
    return this.ready;
}

Tessellator.Shader.prototype.loadDOM = function (dom){
    if (!dom){
        return;
    }else if (dom.constructor === String){
        dom = document.getElementById(dom);
    }
    
    
    if (!this.shader){
        var type;
        
        if (dom.type == "shader/fragment" || dom.type == "shader/pixel"){
            type = this.tessellator.GL.FRAGMENT_SHADER;
        }else if (dom.type == "shader/vertex"){
            type = this.tessellator.GL.VERTEX_SHADER;
        }else{
            throw "unknown shader: " + dom.type;
        }
        
        this.create(type);
    }
    
    var self = this;
    
    Tessellator.getSourceText(dom, function (source){
        self.load(source);
    });
    
    return this;
}

Tessellator.Shader.prototype.loadRemote = function (src){
    var self = this;
    
    Tessellator.getRemoteText(src, function (source){
        self.load(source);
    });
    
    return this;
}

Tessellator.Shader.prototype.load = function (source){
    if (!source){
        throw "no source!";
    }else if (!this.shader){
        throw "no shader!";
    }
    
    {
        var gl = this.tessellator.GL;
        
        gl.shaderSource(this.shader, source);
        gl.compileShader(this.shader);
        
        if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
            var error;
            
            if (this.type === gl.FRAGMENT_SHADER){
                error = "fragment shader problem";
            }else if (this.type === gl.VERTEX_SHADER){
                error = "vertex shader problem";
            }
            
            var t = [];
            t.type = error;
            
            t.toString = function (){
                var s = [];
                
                s.push(this.type + ":");
                
                for (var i = 0; i < this.length; i++){
                    s.push(this[i].raw);
                }
                
                return s.join("\n");
            }
            
            var info = gl.getShaderInfoLog(this.shader);
            var lines = info.split("\n");
            
            for (var i = 0; i < lines.length; i++){
                if (!lines[i].trim().length){
                    continue;
                }
                
                var ii = lines[i].indexOf(":");
                
                if (ii > 0){
                    var o = {
                        raw: lines[i]
                    };
                    
                    var m = 0;
                    
                    o.type = lines[i].substring(0, ii);
                    
                    var iii = lines[i].indexOf(":", ii + 1);
                    
                    if (iii > 0){
                        var c = parseInt(lines[i].substring(ii + 1, iii).trim());
                        var iv = lines[i].indexOf(":", iii + 1);
                        
                        if (iv > 0){
                            var l = parseInt(lines[i].substring(iii + 1, iv).trim());
                            
                            o.line = l;
                            o.char = c;
                            
                            m = iv + 1;
                        }else{
                            o.line = l;
                            
                            m = iii + 1;
                        }
                    }else{
                        m = ii + 1;
                    }
                    
                    o.info = lines[i].substring(m);
                    
                    t.push(o);
                }else{
                    t.push({
                        type: "unknown",
                        info: lines[i]
                    });
                }
            }
            
            throw t;
        }
    }
    
    this.setReady();
    
    return this;
}

Tessellator.Shader.prototype.create = function (type){
    if (this.shader){
        throw "shader is already initialized!";
    }else{
        this.type = this.tessellator.glConst(type);
        this.shader = this.tessellator.GL.createShader(this.type);
    }
    
    return this;
}

Tessellator.Shader.prototype.dispose = function (){
    if (this.shader){
        this.tessellator.GL.deleteShader(this.shader);
    }
}

Tessellator.Shader.prototype.onLink = Tessellator.EMPTY_FUNC;

Tessellator.Shader.prototype.onProgramLoad = Tessellator.EMPTY_FUNC;