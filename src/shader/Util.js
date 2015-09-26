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

Tessellator.prototype.createShaderProgram = function (vertexShader, fragmentShader){
    if (vertexShader.constructor === Tessellator.ShaderPreset){
        if (vertexShader.type !== Tessellator.VERTEX_SHADER){
            throw "the vertexShader argument is set to something else then a vertex shader";
        }
        
        vertexShader = vertexShader.create(this);
    }else if (vertexShader.constructor !== Tessellator.Shader){
        var shader = new Tessellator.Shader(this, Tessellator.VERTEX_SHADER);
        
        if (vertexShader.constructor === String){
            if (vertexShader.indexOf(".glsl", vertexShader.length - 5) !== -1){
                shader.loadRemote(vertexShader);
            }else{
                shader.load(vertexShader);
            }
        }else{
            shader.loadDOM(vertexShader);
        }
        
        vertexShader = shader;
    }
    
    if (fragmentShader.constructor === Tessellator.ShaderPreset){
        if (fragmentShader.type !== Tessellator.FRAGMENT_SHADER){
            throw "the fragmentShader argument is set to something else then a fragment shader";
        }
        
        fragmentShader = fragmentShader.create(this);
    }else if (fragmentShader.constructor !== Tessellator.Shader){
        var shader = new Tessellator.Shader(this, Tessellator.FRAGMENT_SHADER);
        
        if (fragmentShader.constructor === String){
            if (fragmentShader.indexOf(".glsl", fragmentShader.length - 5) !== -1){
                shader.loadRemote(fragmentShader);
            }else{
                shader.load(fragmentShader);
            }
        }else{
            shader.loadDOM(fragmentShader);
        }
        
        fragmentShader = shader;
    }
    
    return new Tessellator.Program(this).link(vertexShader).link(fragmentShader).load();
}

Tessellator.prototype.loadShaderProgram = Tessellator.prototype.createShaderProgram;
Tessellator.prototype.loadShaderProgramFromCode = Tessellator.prototype.createShaderProgram;
Tessellator.prototype.loadShaderProgramFromDOM = Tessellator.prototype.createShaderProgram;

Tessellator.prototype.createPixelShader = function (shader){
    return this.createShaderProgram(Tessellator.PIXEL_SHADER_VERTEX_SHADER, shader);
}

Tessellator.prototype.getShaderFromDOM = function (dom){
    return new Tessellator.Shader(this).loadDOM(dom);
}


Tessellator.prototype.getShader = function (shaderSource, type){
    if (shaderSource.constructor === Tessellator.ShaderPreset){
        console.warn("Passing a Tessellator.ShaderPreset to the getShader helper function in not recommended.")
        return shaderSource.create(this);
    }
    
    return new Tessellator.Shader(this, type).load(shaderSource);
}

Tessellator.prototype.createBypassShader = function (){
    return this.createPixelShader(tessellator.getShader(Tessellator.PIXEL_SHADER_PASS, Tessellator.FRAGMENT_SHADER));
}