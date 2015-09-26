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

Tessellator.prototype.createModelFromJSON = function (json, obj){
    if (!json){
        throw "json model must be given";
    }
    
    if (!obj){
        obj = new Tessellator.Object(this, Tessellator.TRIANGLE);
    }
    
    obj.setAttribute("position", Tessellator.VEC3, new Tessellator.Array(json.vertexPositions), Float32Array);
    obj.setAttribute("color", Tessellator.VEC2, new Tessellator.Array(json.vertexTextureCoords), Float32Array);
    obj.setAttribute("normal", Tessellator.VEC3, new Tessellator.Array(json.vertexNormals), Float32Array);
    obj.getIndices().push(json.indices);
    
    obj.upload();
    
    return obj;
}

Tessellator.prototype.loadJSONModel = function (url, obj){
    if (!obj){
        obj = new Tessellator.Object(this, Tessellator.TRIANGLE);
    }
    
    var self = this;
    
    Tessellator.getRemoteText(url, function (text){
        self.createModelFromJSON(JSON.parse(text), obj);
    });
    
    return obj;
}