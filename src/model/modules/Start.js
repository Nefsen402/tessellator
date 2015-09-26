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

Tessellator.Initializer.setDefault("colorAttribEnabled", function (){
    return true;
});

Tessellator.Model.prototype.start = function (type, drawType){
    return this.add(new Tessellator.Start(this.tessellator, type, drawType));
}

Tessellator.Start = function (tessellator, shapeType, drawType) {
    this.type = shapeType;
    this.subtype = Tessellator.VERTEX;
    
    this.drawType = drawType || Tessellator.STATIC;
    
    this.matrix = null;
    
    this.vertices = new Tessellator.FragmentedArray();
    this.normals = new Tessellator.FragmentedArray();
    this.colors = new Tessellator.FragmentedArray();
    
    this.object = new Tessellator.Object(tessellator);
    this.indices = this.object.getIndices();
    
    this.disposable = true;
}

Tessellator.Start.prototype.compress = function (){
    this.vertices.compress();
    this.indices.compress();
    this.normals.compress();
    this.colors.compress();
}

Tessellator.Start.prototype.init = function (interpreter){
    if (interpreter.shape){
        throw "cannot start new draw if the old one did not end yet";
    }else if (!this.type){
        throw "nothing to start";
    }
    
    if (this.type === Tessellator.LINE){
        interpreter.flush();
        interpreter.set("draw", Tessellator.LINE);
    }
    
    this.drawMode = interpreter.get("draw");
    
    interpreter.shape = this;
    return null;
}


Tessellator.Start.prototype.dispose = function (){
    this.object.dispose();
}

Tessellator.Start.prototype.apply = function (render){
    this.object.render(render);
}

Tessellator.Start.prototype.postInit = function (interpreter){
    if (interpreter.shape){
        throw "cannot finish a matrix when there are sill objects being drawn!";
    }
    
    this.object.setType(this.type);
    this.object.drawMode = this.drawMode;
    
    this.object.setAttribute("position", Tessellator.VEC3, this.vertices, Float32Array, false, this.drawType);
    if (this.normals.length) this.object.setAttribute("normal", Tessellator.VEC3, this.normals, Float32Array, false, this.drawType);
    
    if (this.drawMode === Tessellator.TEXTURE){
        this.object.setAttribute("color", Tessellator.VEC2, this.colors, Float32Array, false, this.drawType);
    }else{
       this.object.setAttribute("color", Tessellator.VEC4, this.colors, Uint8Array, true, this.drawType);
    }
    
    //upload everything to GPU
    this.end = this.vertices.length / 3;
    this.object.upload();
    this.object.useOES();
    
    this.vertices = null;
    this.indices = null;
    this.normals = null;
    this.colors = null;
}

Tessellator.Start.prototype.translate = function (x, y, z){
    if (!this.matrix){
        this.matrix = Tessellator.mat4().identity();
    }
    
    this.matrix.translate(Tessellator.vec3(x, y, z));
}

Tessellator.Start.prototype.scale = function (x, y, z){
    if (!this.matrix){
        this.matrix = Tessellator.mat4().identity();
    }
    
    this.matrix.scale(Tessellator.vec3(x, y, z));
}

Tessellator.Start.prototype.rotate = function (deg, x, y, z){
    if (!this.matrix){
        this.matrix = Tessellator.mat4().identity();
    }
    
    this.matrix.rotate(deg, Tessellator.vec3(x, y, z));
}

Tessellator.Start.prototype.setVertex = function (){
    Tessellator.Model.prototype.setVertex.apply(this.model, arguments);
}

Tessellator.Start.prototype.end = function (){
    Tessellator.Model.prototype.end.apply(this.model, arguments);
}

Tessellator.Start.prototype.getSubsection = function (start, end){
    if (!end){
        end = this.end;
    }
    
    if (end){
        return new Tessellator.Start.Subsection(this, start, end);
    }else{
        throw "cannot get subsection of incompatible type";
    }
}

{ //subsection
    Tessellator.Start.Subsection = function (parent, start, end){
        this.parent = parent;
        this.start = start;
        this.end = end;
    }
    
    Tessellator.Start.Subsection.prototype.getSubsection = function (start, end){
        return new Tessellator.Start.Subsection(this.parent, this.start + start, this.start + end)
    }
    
    Tessellator.Start.Subsection.prototype.setColor = function (){
        var delta = this.end - this.start;
        var color = this.parent.model.getColor.apply(this.parent.matrix, arguments);
        
        var array = new Uint8Array(delta * 4);
        
        for (var i = 0; i < delta; i++){
            array[i * 4 + 0] = color.r * 255;
            array[i * 4 + 1] = color.g * 255;
            array[i * 4 + 2] = color.b * 255;
            array[i * 4 + 3] = color.a * 255;
        }
        
        this.parent.object.setAttributeData("color", new Tessellator.Array(array), this.start * 4);
    }
    
    Tessellator.Start.Subsection.prototype.setVertex = function (){
        var vertices;
        
        if (arguments.length === 1){
            vertices = arguments[0];
        }else{
            vertices = arguments;
        }
        
        if (vertices.constructor !== Float32Array){
            vertices = new Tessellator.Array(new Float32Array(vertices));
        }
        
        this.parent.object.setAttributeData("position", vertices, this.start * 3);
    }
}