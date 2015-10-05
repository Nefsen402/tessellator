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

Tessellator.prototype.createObject = function (){
    return Tessellator.new.apply(Tessellator.Object, [this].concat(arguments));
}

Tessellator.Object = function (tessellator, type){
    tessellator.resources.push(this);
    
    this.attribs = {};
    this.attribCount = 0;
    
    this.uniforms = {};
    this.uniformCount = 0;
    
    this.tessellator = tessellator;
    this.type = type;
    this.renderType = type;
    
    this.disposed = false;
    this.disposable = true;
    
    this.resetIndices();
}

Tessellator.Object.prototype.setType = function (type){
    this.type = type;
    this.renderType = type;
}

Tessellator.Object.prototype.resetIndices = function (type){
    if (type === Uint32Array && !this.tessellator.extensions.get("OES_element_index_uint")){
        throw "Usigned Integer indices are not supported.";
    }
    
    if (this.indices){
        this.indices.buffer.dispose(this.tessellator);
    }
    
    this.indices = {
        name: "indices",
        buffer: new Tessellator.Object.Buffer(new Tessellator.FragmentedArray(), type || Uint16Array, Tessellator.ELEMENT_ARRAY_BUFFER, Tessellator.STATIC)
    }
}

Tessellator.Object.prototype.getValue = function (name){
    var o = this.attribs[name];
    
    if (o){
        return o.buffer.value;
    }
}

Tessellator.Object.prototype.getIndices = function (){
    return this.indices.buffer.value;
}

Tessellator.Object.prototype.setAttribute = function (){
    if (arguments[2].constructor === Tessellator.Object.Buffer){
        var name = arguments[0];
        
        this.attribCount += this.attribs[name] ? 0 : 1;
    
        if (this.attribCount > this.tessellator.maxAttributes){
            throw "the maximum amount of bound attributes was exceeded: " + this.tessellator.maxAttributes;
        }
        
        if (this.attribs[name]){
            this.attribs[name].buffer.dispose(this.tessellator);
        }
        
        this.attribs[name] = {
            name: name,
            dataSize: (isNaN(arguments[1]) ? arguments[1].value : arguments[1]),
            buffer: arguments[2],
            normalize: arguments[3] || false,
            stride: arguments[4] || arguments[1].value,
            offset: arguments[5] || 0,
        }
    }else{
        var
            name = arguments[0],
            size = arguments[1], 
            value = arguments[2], 
            arrayType = arguments[3], 
            normalize = arguments[4], 
            type = arguments[5], 
            stride = arguments[6], 
            offset = arguments[7];
        
        this.setAttribute(name, size, new Tessellator.Object.Buffer(value, arrayType, Tessellator.ARRAY_BUFFER, type), normalize, stride, offset);
    }
}

Tessellator.Object.prototype.setUniform = function (name, value){
    if (!this.uniforms[name]){
        this.uniformCount++;
    }
    
    this.uniforms[name] = value;
}

Tessellator.Object.prototype.setAttributeData = function (name, value, off){
    off = off || 0;
    var attrib = this.attribs[name];
    
    if (!attrib){
        throw "that attribute does not exist!";
    }
    
    attrib.buffer.subData(tessellator, value, off);
}

Tessellator.Object.prototype.upload = function (){
    if (this.oes){
        this.oes.shader = null;
    }
    
    if (this.indices && !this.indices.buffer.uploaded){
        if (this.indices.buffer.getLength() && !this.indices.buffer.uploaded){
            this.indices.buffer.upload(this.tessellator);
            
            this.items = this.indices.buffer.getLength();
        }else{
            this.indices = null;
            
            for (var o in this.attribs){
                this.items = this.attribs[o].buffer.getLength() / this.attribs[o].dataSize;
                
                break;
            }
        }
    }
    
    var ext = Tessellator.Object.getTypeExtension(this.type);
    
    if (ext){
        this.renderType = ext(this);
    }
    
    for (var o in this.attribs){
        this.attribs[o].buffer.upload(this.tessellator);
    }
}

Tessellator.Object.prototype.bindAttributes = function (shader){
    var gl = this.tessellator.GL;
    
    var bound = null;
    
    for (var o in this.attribs){
        if (shader.attribs[o] !== undefined){
            var oo = this.attribs[o];
            
            if (oo.buffer.uploaded){
                if (bound !== oo.buffer){
                    bound = oo.buffer;
                    
                    gl.bindBuffer(this.tessellator.glConst(oo.buffer.type), bound.value);
                }
                
                gl.enableVertexAttribArray(shader.attribs[o]);
                gl.vertexAttribPointer(shader.attribs[o], oo.dataSize, gl[Tessellator.Object.dataTypes[oo.buffer.dataType.name]], oo.normalize, oo.stride * Tessellator.Object.dataTypeSizes[oo.buffer.dataType.name], oo.offset * Tessellator.Object.dataTypeSizes[oo.buffer.dataType.name]);
                
                if (oo.divisor !== undefined && this.instancinginstance){
                    this.instancinginstance.vertexAttribDivisorANGLE(shader.attribs[o], oo.divisor);
                }
            }
        }
    }
    
    if (this.indices){
        gl.bindBuffer(this.tessellator.glConst(this.indices.buffer.type), this.indices.buffer.value);
    }
}

Tessellator.Object.prototype.disableAttributes = function (shader){
    for (var o in shader.attribs){
        var oo = this.attribs[o];
        
        if (oo){
            this.tessellator.GL.disableVertexAttribArray(shader.attribs[o]);
            
            if (oo.divisor !== undefined && this.instancinginstance){
                this.instancinginstance.vertexAttribDivisorANGLE(shader.attribs[o], 0);
            }
        }
    }
}

Tessellator.Object.prototype.useOES = function (){
    if (!this.oesinsance){
        this.oesinsance = this.tessellator.extensions.get("OES_vertex_array_object");
            
        if (this.oesinsance){
            this.oes = {
                instance: this.oesinsance.createVertexArrayOES()
            }
        }
    }
    
    return this.oesinsance;
}

Tessellator.Object.prototype.useInstancing = function (){
    if (!this.instancinginstance){
        this.instancinginstance = this.tessellator.extensions.get("ANGLE_instanced_arrays");
    }
    
    var self = this;
    
    var func = function (name, divisor){
        divisor = divisor === undefined ? 1 : divisor
        
        var o = self.attribs[name];
        
        o.divisor = divisor;
        self.instances = o.buffer.getLength() / o.dataSize * divisor;
    }
    
    for (var i = 0; i < arguments.length; i++){
        func(arguments[i]);
    }
    
    return func;
}

Tessellator.Object.prototype.render = function (shader){
    if (!this.items){
        return;
    }
    
    if (shader.constructor === Tessellator.RenderMatrix){
        var matrix = shader;
        shader = shader.renderer.shader;
        
        if (this.uniformCount > 0){
            matrix = matrix.copy();
            
            for (var o in this.uniforms){
                matrix.set(o, this.uniforms[o]);
            }
        }
        
        if (!shader.set(matrix.renderer, matrix, this)){
            return;
        }
        
        shader.preUnify(matrix);
        
        if (!shader.set(matrix.renderer, matrix, this)){
            return;
        }
        
        if (shader.bind()){
            matrix.unifyAll();
        }else{
            matrix.unify();
        }
    }else if (!shader.isReady()){
        return;
    }
    
    if (this.oes){
        this.oesinsance.bindVertexArrayOES(this.oes.instance);
        
        if (this.oes.shader !== shader){
            if (this.oes.shader){
                this.disableAttributes(this.oes.shader);
            }
            
            this.oes.shader = shader;
            
            this.bindAttributes(shader);
        }
    }else{
        this.bindAttributes(shader);
    }
    
    var gl = this.tessellator.GL;
    
    if (this.instancinginstance && this.instances){
        if (this.indices){
            this.instancinginstance.drawElementsInstancedANGLE(this.tessellator.glConst(this.renderType), this.items, gl[Tessellator.Object.dataTypes[this.indices.buffer.dataType.name]], 0, this.instances);
        }else{
            this.instancinginstance.drawArraysInstancedANGLE(this.tessellator.glConst(this.renderType), 0, this.items, this.instances);
        }
    }else{
        if (this.indices){
            gl.drawElements(this.tessellator.glConst(this.renderType), this.items, gl[Tessellator.Object.dataTypes[this.indices.buffer.dataType.name]], 0);
        }else{
            gl.drawArrays(this.tessellator.glConst(this.renderType), 0, this.items);
        }
    }
    
    if (this.oes){
        this.oesinsance.bindVertexArrayOES(null);
    }else{
        this.disableAttributes(shader);
    }
    
    if (matrix){
        shader.postSet(matrix.renderer, matrix, this);
    }
}

Tessellator.Object.prototype.apply = Tessellator.Object.prototype.render;

Tessellator.Object.prototype.dispose = function (){
    if (!this.disposed){
        for (var o in this.attribs){
            this.attribs[o].buffer.dispose(this.tessellator);
        }
        
        if (this.indices){
            this.indices.buffer.dispose(this.tessellator);
        }
        
        if (this.oes){
            this.oesinsance.deleteVertexArrayOES(this.oes.instance);
        }
        
        this.tessellator.resources.remove(this);
        this.disposed = true;
    }
}

Tessellator.Object.Buffer = function (value, dataType, type, readHint){
    this.value = value;
    this.dataType = dataType || Float32Array;
    this.type = type || Tessellator.ARRAY_BUFFER;
    this.readHint = readHint || Tessellator.STATIC;
    
    this.uploaded = false;
}

Tessellator.Object.Buffer.prototype.getLength = function (){
    return this.uploaded ? this.length : this.value.length;
}

Tessellator.Object.Buffer.prototype.subData = function (tessellator, value, off){
    if (off < 0){
        throw "offset is under 0";
    }else if (this.getLength() < value.length){
        throw "attributes can not increase in size: " + this.getLength() + " < " + value.length;
    }
    
    if (!this.uploaded){
        if (off !== 0){
            var c = this.value.combine(this.dataType);
            c.set(value.combine(this.dataType), off);
            
            this.value = new Tessellator.Array(c);
        }
    }else{
        var gl = tessellator.GL;
        
        gl.bindBuffer(tessellator.glConst(this.type), this.value);
        gl.bufferSubData(tessellator.glConst(this.type), off * Tessellator.Object.dataTypeSizes[this.dataType.name], value.combine(this.dataType));
    }
}

Tessellator.Object.Buffer.prototype.upload = function (tessellator){
    var gl = tessellator.GL;
    
    if (!this.uploaded && this.value.length){ 
        var buf = gl.createBuffer();
        gl.bindBuffer(tessellator.glConst(this.type), buf);
        gl.bufferData(tessellator.glConst(this.type), this.value.combine(this.dataType), tessellator.glConst(this.readHint));
        
        this.length = this.value.length;
        this.uploaded = true;
        this.value = buf;
    }
}

Tessellator.Object.Buffer.prototype.dispose = function (tessellator){
    if (this.uploaded && this.value){
        tessellator.GL.deleteBuffer(this.value);
        
        this.value = null;
    }
}

Tessellator.Object.dataTypes = {
    "Int8Array": "BYTE",
    "Uint8Array": "UNSIGNED_BYTE",
    "Int16Array": "SHORT",
    "Uint16Array": "UNSIGNED_SHORT",
    "Int32Array": "INT",
    "Uint32Array": "UNSIGNED_INT",
    "Int64Array": "LONG",
    "Uint64Array": "UNSIGNED_LONG",
    "Float32Array": "FLOAT",
    "Float64Array": "DOUBLE",
};

Tessellator.Object.dataTypeSizes = {
    "Int8Array": 1,
    "Uint8Array": 1,
    "Int16Array": 2,
    "Uint16Array": 2,
    "Int32Array": 4,
    "Uint32Array": 4,
    "Int64Array": 8,
    "Uint64Array": 8,
    "Float32Array": 4,
    "Float64Array": 8,
};

Tessellator.Object.registerTypeExtension = function (type, ext){
    Tessellator.Object.typeExtensions.push([type, ext]);
}

Tessellator.Object.getTypeExtension = function (type){
    for (var i = 0, k = Tessellator.Object.typeExtensions.length; i < k; i++){
        if (Tessellator.Object.typeExtensions[i][0] == type){
            return Tessellator.Object.typeExtensions[i][1];
        }
    }
}

Tessellator.Object.typeExtensions = [];