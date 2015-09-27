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

Tessellator.Model.prototype.end = function (indices){
    return this.add(new Tessellator.End(indices));
}

Tessellator.End = function (indices){
    this.type = Tessellator.END;
    this.indices = indices;
}

Tessellator.End.prototype.init = function (interpreter){
    this.shape = interpreter.shape;
    
    if (!this.shape){
        throw "cannot end a draw that had not started yet";
    }else if (!this.shape.vertices.length){
        this.shape = null;
        return null;
    }
    
    var textureBounds = null;
    
    if (interpreter.get("colorAttribEnabled")){
        textureBounds = interpreter.get("textureBounds");
    }
    
    if (this.shape.type === Tessellator.TEXTURE){
        if (textureBounds){
            textureBounds.bounds = this.shape.vertices.combine();
            textureBounds.defaultBounds = false;
        }
    }else if (this.shape.type === Tessellator.NORMAL){
        interpreter.normals = this.shape.vertices;
    }else if (this.shape.type === Tessellator.POINT){
        interpreter.flush();
        
        interpreter.model.push(this.shape);
    }else if (this.shape.type === Tessellator.POINT){
        interpreter.flush();
        
        if (this.indices){
            this.shape.indices.push(this.indices);
        }
        
        interpreter.model.push(this.shape);
    }else if (this.shape.type === Tessellator.LINE){
        interpreter.flush();
        
        if (this.indices){
            this.shape.indices.push(this.indices);
        }
        
        interpreter.model.push(this.shape);
        
        if (interpreter.get("lighting")){
            if (interpreter.normals){
                this.shape.normals.push(interpreter.normals);
                
                intrepreter.normals = null;
            }else{
                var vcache = this.shape.vertices;
                
                if (this.indices){
                    var norm = new Float32Array(vcache.length);
                    
                    for (var i = 0; i < this.indices.length; i += 2){
                        var i1 = this.shape.indices.get(i + 0) * 3;
                        var i2 = this.shape.indices.get(i + 1) * 3;
                        
                        var normal = Tessellator.vec3(
                            vcache.get(i1 + 0) - vcache.get(i2 + 0),
                            vcache.get(i1 + 1) - vcache.get(i2 + 1),
                            vcache.get(i1 + 2) - vcache.get(i2 + 2)
                        ).normalize();
                        
                        norm.set(normal, i1);
                        norm.set(normal, i2);
                    }
                    
                    this.shape.normals.push(norm);
                }else for (var i = 0; i < vcache.length; i += 6){
                    var normal = Tessellator.vec3(
                        vcache.get(i + 0) - vcache.get(i + 3),
                        vcache.get(i + 1) - vcache.get(i + 4),
                        vcache.get(i + 2) - vcache.get(i + 5)
                    ).normalize();
                    
                    this.shape.normals.push(normal);
                    this.shape.normals.push(normal);
                }
            }
        }
    }else{
        var vertexIndexes = this.shape.indices;
        
        var vertexOffset = 0;
        var shapeAddon = interpreter.get("drawCache");
        
        if (shapeAddon){
            vertexOffset = shapeAddon.vertices.length / 3;
        }
        
        if (this.indices){
            if (this.shape.type !== Tessellator.TRIANGLE){
                throw "vertex buffers only supported with triangles";
            }
            
            vertexIndexes.push(this.indices);
            vertexIndexes.offset(vertexOffset);
            
            if (textureBounds){
                if (textureBounds.defaultBounds){
                    var bounds = [
                                              0,                       0,
                        textureBounds.bounds[0],                       0,
                        textureBounds.bounds[1], textureBounds.bounds[1],
                    ];
                    
                    for (var i = 0, k = this.shape.vertices.length; i < k; i++){
                        this.shape.colors.push(bounds);
                    }
                }else{
                    this.shape.colors.push(textureBounds.bounds);
                }
            }
        }else if (this.shape.type === Tessellator.POLYGON){
        
        }else if (this.shape.type === Tessellator.QUAD){
            var k = this.shape.vertices.length;
            
            if (k % 12 !== 0){
                throw "invalid number of vertices for quad draw!";
            }else{
                k /= 3 * 4;
            }
            
            for (var i = 0; i < k; i++){
                vertexIndexes.push([
                    0 + i * 4 + vertexOffset,
                    1 + i * 4 + vertexOffset,
                    2 + i * 4 + vertexOffset,
                    
                    0 + i * 4 + vertexOffset,
                    2 + i * 4 + vertexOffset,
                    3 + i * 4 + vertexOffset,
                ]);
                
                if (textureBounds){
                    var bounds;
                    
                    if (textureBounds.defaultBounds){
                        bounds = [
                                                  0,                       0,
                            textureBounds.bounds[0],                       0,
                            textureBounds.bounds[0], textureBounds.bounds[1],
                                                  0, textureBounds.bounds[1],
                        ];
                    }else{
                        bounds = textureBounds.bounds.subarray(i * 8, (i + 1) * 8)
                    }
                    
                    this.shape.colors.push(bounds);
                }
            }
        }else if (this.shape.type === Tessellator.TRIANGLE){
            var k = this.shape.vertices.length;
            
            if (k % 9 !== 0){
                throw "vector length is invalid for triangles!";
            }else{
                k /= 3 * 3;
            }
            
            for (var i = 0; i < k; i++){
                vertexIndexes.push([
                    (i * 3) + vertexOffset + 0,
                    (i * 3) + vertexOffset + 1,
                    (i * 3) + vertexOffset + 2
                ]);
                
                if (textureBounds){
                    var bounds;
                    
                    if (textureBounds.defaultBounds){
                        bounds = [
                                                  0,                       0,
                            textureBounds.bounds[0],                       0,
                            textureBounds.bounds[1], textureBounds.bounds[1],
                        ];
                    }else{
                        bounds = textureBounds.bounds.subarray(i * 6, (i + 1) * 6);
                    }
                    
                    this.shape.colors.push(bounds);
                }
            }
        }else if (this.shape.type === Tessellator.TRIANGLE_STRIP){
            var k = this.shape.vertices.length / 3;
            
            if (k < 3){
                throw "not enough vertices to draw triangle strip."
            }
            
            if (textureBounds && !textureBounds.defaultBounds && textureBounds.bounds.length / 4 !== k){
                throw "bound texture coordinates length mismatch with vertices length!";
            }
            
            var indices = [];
            
            for (var i = 0; i < k; i++){
                if (i < 3){
                    indices.push(i + vertexOffset);
                }else{
                    indices.push(indices[indices.length - 2]);
                    indices.push(indices[indices.length - 2]);
                    indices.push(i                        + vertexOffset);
                }
                
                if (textureBounds){
                    var colorBoundsIndex = (i * 3) % textureBounds.length;
                    
                    if (i === 2){
                        var bounds;
                        
                        if (textureBounds.defaultBounds){
                            bounds = [
                                                      0,                       0,
                                textureBounds.bounds[0],                       0,
                                textureBounds.bounds[1], textureBounds.bounds[1],
                            ];
                        }else{
                            bounds = textureBounds.bounds.subarray(0, i * 3);
                        }
                        
                        this.shape.colors.push(bounds);
                    }else if (i >= 3){
                        var bounds;
                        
                        if (textureBounds.defaultBounds){
                            bounds = [
                                textureBounds.bounds[1], textureBounds.bounds[1], 0, 0,
                            ];
                        }else{
                            bounds = textureBounds.bounds.subarray(i * 3, (i + 1) * 3);
                        }
                        
                        this.shape.colors.push(bounds);
                    }
                }
            }
            
            vertexIndexes.push(indices);
        }else if (this.shape.type === Tessellator.TRIANGLE_FAN_CCW){
            var k = this.shape.vertices.length / 3;
            
            if (k < 3){
                throw "not enough vertices to draw triangle strip."
            }
            
            if (textureBounds && !textureBounds.defaultBounds && textureBounds.bounds.length / 4 !== k){
                throw "bound texture coordinates length mismatch with vertices length!";
            }
            
            var indices = [];
            
            for (var i = 0; i < k; i++){
                if (i < 3){
                    indices.push(i + vertexOffset);
                }else{
                    indices.push(indices[indices.length - 1]);
                    indices.push(indices[                 0]);
                    indices.push(i            + vertexOffset);
                }
                
                if (textureBounds){
                    var colorBoundsIndex = (i * 3) % textureBounds.length;
                    
                    if (i === 2){
                        var bounds;
                        
                        if (textureBounds.defaultBounds){
                            bounds = [
                                                      0,                       0,
                                textureBounds.bounds[0],                       0,
                                textureBounds.bounds[1], textureBounds.bounds[1],
                            ];
                        }else{
                            bounds = textureBounds.bounds.subarray(0, i * 3);
                        }
                        
                        this.shape.colors.push(bounds);
                    }else if (i >= 3){
                        var bounds;
                        
                        if (textureBounds.defaultBounds){
                            bounds = [
                                textureBounds.bounds[1], textureBounds.bounds[1],
                            ];
                        }else{
                            bounds = textureBounds.bounds.subarray(i * 3, (i + 1) * 3);
                        }
                        
                        this.shape.colors.push(bounds);
                    }
                }
            }
            
            vertexIndexes.push(indices);
        }else if (this.shape.type === Tessellator.TRIANGLE_FAN_CW){
            var k = this.shape.vertices.length / 3;
            
            if (k < 3){
                throw "not enough vertices to draw triangle strip."
            }
            
            if (textureBounds && !textureBounds.defaultBounds && textureBounds.bounds.length / 4 !== k){
                throw "bound texture coordinates length mismatch with vertices length!";
            }
            
            var indices = [];
            
            for (var i = 0; i < k; i++){
                if (i < 3){
                    indices.push(i + vertexOffset);
                }else{
                    indices.push(indices[                 0]);
                    indices.push(indices[indices.length - 2]);
                    indices.push(i            + vertexOffset);
                }
                
                if (textureBounds){
                    var colorBoundsIndex = (i * 3) % textureBounds.length;
                    
                    if (i === 2){
                        var bounds;
                        
                        if (textureBounds.defaultBounds){
                            bounds = [
                                                      0,                       0,
                                textureBounds.bounds[0],                       0,
                                textureBounds.bounds[1], textureBounds.bounds[1],
                            ];
                        }else{
                            bounds = textureBounds.bounds.slice(0, i * 3);
                        }
                        
                        this.shape.colors.push(bounds);
                    }else if (i >= 3){
                        var bounds;
                        
                        if (textureBounds.defaultBounds){
                            bounds = [
                                textureBounds.bounds[1], textureBounds.bounds[1],
                            ];
                        }else{
                            bounds = textureBounds.bounds.slice(i * 3, (i + 1) * 3);
                        }
                        
                        this.shape.colors.push(bounds);
                    }
                }
            }
            
            vertexIndexes.push(indices);
        }
        
        this.shape.type = Tessellator.TRIANGLE;
        
        if (interpreter.get("lighting")){
            if (interpreter.normals){
                this.shape.normals.push(interpreter.normals);
                
                interpreter.normals = null;
            }else{ //calculate default normals.
                var vertices = this.shape.vertices;
                var indices = this.shape.indices;
                var normals = new Float32Array(vertices.length);
                
                for (var i = 0, k = indices.length / 3; i < k; i++){
                    var
                        x1 = vertices.get((indices.get(i * 3 + 0) - vertexOffset) * 3 + 0),
                        y1 = vertices.get((indices.get(i * 3 + 0) - vertexOffset) * 3 + 1),
                        z1 = vertices.get((indices.get(i * 3 + 0) - vertexOffset) * 3 + 2),
                        
                        x2 = vertices.get((indices.get(i * 3 + 1) - vertexOffset) * 3 + 0),
                        y2 = vertices.get((indices.get(i * 3 + 1) - vertexOffset) * 3 + 1),
                        z2 = vertices.get((indices.get(i * 3 + 1) - vertexOffset) * 3 + 2),
                        
                        x3 = vertices.get((indices.get(i * 3 + 2) - vertexOffset) * 3 + 0),
                        y3 = vertices.get((indices.get(i * 3 + 2) - vertexOffset) * 3 + 1),
                        z3 = vertices.get((indices.get(i * 3 + 2) - vertexOffset) * 3 + 2);
                    
                    //deltas
                    var
                        Ux = x2 - x1,
                        Uy = y2 - y1,
                        Uz = z2 - z1,
                        
                        Vx = x3 - x1,
                        Vy = y3 - y1,
                        Vz = z3 - z1;
                    
                    //normals
                    var
                        Nx = (Uy * Vz) - (Uz * Vy),
                        Ny = (Uz * Vx) - (Ux * Vz),
                        Nz = (Ux * Vy) - (Uy * Vx);
                    
                    for (var l = 0; l < 3; l++){
                        var index = indices.get(i * 3 + l) - vertexOffset;
                        
                        normals[index * 3 + 0] = Nx;
                        normals[index * 3 + 1] = Ny;
                        normals[index * 3 + 2] = Nz;
                    }
                }
                
                this.shape.normals.push(normals);
            }
        }
        
        if (shapeAddon){
            //overflow. even WebGL has its limits.
            if (shapeAddon.indices.length + this.shape.indices.length > Tessellator.VERTEX_LIMIT){
                interpreter.model.push(shapeAddon);
                
                //reset vertex pointers to 0.
                this.shape.indices.offset(-vertexOffset);
                interpreter.set("drawCache", this.shape);
            }else{
                shapeAddon.indices.push(this.shape.indices);
                shapeAddon.vertices.push(this.shape.vertices);
                shapeAddon.colors.push(this.shape.colors);
                shapeAddon.normals.push(this.shape.normals);
            }
            
            this.shape.dispose();
        }else{
            interpreter.set("drawCache", this.shape);
        }
    }
    
    interpreter.shape = null;
    return null;
}