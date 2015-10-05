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

Tessellator.Initializer.setDefault ("draw", function (){
    return Tessellator.COLOR;
});

Tessellator.Model.prototype.setVertex = function (){
    if (arguments.length === 1 && isNaN(arguments[0])){
        this.add(new Tessellator.Vertex(arguments[0]));
    }else{
        if (arguments.length === 2 && isNaN(arguments[1])){
            this.start(arguments[0]);
            this.add(new Tessellator.Vertex(arguments[1]));
            this.end();
        }else{
            this.add(new Tessellator.Vertex(arguments));
        };
    };
};

Tessellator.Vertex = function (vertices){
    this.type = Tessellator.VERTEX;
    
    this.vertices = vertices;
};

Tessellator.Vertex.prototype.init = function (interpreter){
    if (this.vertices.length){
        var geometry = interpreter.get("currentGeometry");
        
        if (!geometry){
            throw "cannot add vertices to a non existing shape";
        };
        
        if (geometry.type === Tessellator.INDICES){
            geometry.indices.push(this.vertices);
        }else if (geometry.type === Tessellator.TEXTURE){
            geometry.colors.push(this.vertices);
        }else if (geometry.type === Tessellator.NORMAL){
            geometry.normals.push(this.vertices);
        }else{
            if (interpreter.get("colorAttribEnabled") && interpreter.get("draw") !== Tessellator.TEXTURE){
                var k = this.vertices.length / 3;
                var c = interpreter.get("color255");
                
                for (var i = 0; i < k; i++){
                    geometry.colors.push(c);
                };
            };
            
            geometry.addPositions(this.vertices);
        };
    };
    
    return null;
};