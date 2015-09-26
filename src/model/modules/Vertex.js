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

Tessellator.Initializer.setDefault ("draw", function (){
    return Tessellator.COLOR;
});

Tessellator.Initializer.prototype.flush = function (){
    if (this.get("drawCache")){
        var cache = this.getr("drawCache");
        
        this.model.push(cache);
        
        return cache;
    }
    
    return null;
}

Tessellator.Model.prototype.setVertex = function(){
    if (arguments.length === 1){
        return this.add(new Tessellator.Vertex(arguments[0]));
    }else{
        return this.add(new Tessellator.Vertex(arguments));
    }
}

Tessellator.Vertex = function (vertices){
    this.type = Tessellator.VERTEX;
    
    this.vertices = vertices;
}


Tessellator.Vertex.prototype.init = function (interpreter){
    if (interpreter.shape === null){
        throw "cannot add vertices to a non existing shape";
    }
    
    if (interpreter.shape.type === Tessellator.TEXTURE){
        if (this.vertices.length){
            interpreter.shape.vertices.push(this.vertices);
        }
    }else if (interpreter.shape.type === Tessellator.NORMAL){
        if (this.vertices.length){
            interpreter.shape.vertices.push(this.vertices);
        }
    }else{
        if (this.vertices.length){
            if (interpreter.get("colorAttribEnabled") && interpreter.get("draw") !== Tessellator.TEXTURE){
                var k = this.vertices.length / 3;
                var c = interpreter.get("color255");
                
                for (var i = 0; i < k; i++){
                    interpreter.shape.colors.push(c);
                }
            }
            
            if (interpreter.shape.matrix){
                var ver = this.vertices;
                var m = interpreter.shape.matrix;
                
                for (var i = 0, k = ver.length / 3; i < k; i++){
                    var
                        x = ver[i * 3 + 0],
                        y = ver[i * 3 + 1],
                        z = ver[i * 3 + 2];
                    
                    ver[i * 3 + 0] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
                    ver[i * 3 + 1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
                    ver[i * 3 + 2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];
                }
            }
        
            interpreter.shape.vertices.push(this.vertices);
            interpreter.shape.items += k;
        }
    }
    
    return null;
}