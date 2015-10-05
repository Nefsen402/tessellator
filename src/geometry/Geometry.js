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

Tessellator.Geometry = function (type, arg){
    this.positions = new Tessellator.FragmentedArray();
    this.colors = new Tessellator.FragmentedArray();
    this.normals = new Tessellator.FragmentedArray();
    this.indices = new Tessellator.FragmentedArray();
    
    this.type = type || Tessellator.TRIGANGLE;
    this.conversionArg = arg;
    this.disposed = false;
}

Tessellator.Geometry.prototype.createObject = function (tessellator, drawMode, save){
    if (this.object){
        return this.object;
    }
    
    save = save || Tessellator.STATIC;
    
    this.convert();
    this.object = new Tessellator.Object(tessellator, this.type);
    this.object.drawMode = drawMode;
    
    this.object.getIndices().push(this.indices);
    this.object.setAttribute("position", Tessellator.VEC3, this.positions, Float32Array, false, save);
    
    if (this.normals.length){
        this.object.setAttribute("normal", Tessellator.VEC3, this.normals, Float32Array, false, save);
    }
    
    if (drawMode === Tessellator.TEXTURE){
        this.object.setAttribute("color", Tessellator.VEC2, this.colors, Float32Array, false, save);
    }else{
        this.object.setAttribute("color", Tessellator.VEC4, this.colors, Uint8Array, true, save);
    }
    
    this.object.upload();
    
    this.positions = null;
    this.colors = null;
    this.normals = null;
    this.indices = null;
    this.conversionArg = null;
    
    return this.object;
}

Tessellator.Geometry.prototype.getObject = function (){
    return this.object;
}

Tessellator.Geometry.prototype.dispose = function (){
    if (!this.disposed){
        if (this.object){
            this.object.dispose();
        }else{
            this.positions = null;
            this.colors = null;
            this.normals = null;
            this.indices = null;
        }
        
        this.disposed = true;
    }
}

//for models
Tessellator.Geometry.prototype.apply = function (matrix){
    if (this.object){
        this.object.render(matrix);
    }
}

Tessellator.Geometry.prototype.addPositions = function (pos){
    if (!this.matrix){
        this.positions.push(pos);
    }else for (var i = 0; i < pos.length; i += 3){
        this.positions.push(Tessellator.vec3(pos[i], pos[i + 1], pos[i + 2]).multipy(this.matrix))
    }
}

Tessellator.Geometry.prototype.generateNormals = function (){
    this.convert();
    
    if (this.normals.isEmpty() && this.type === Tessellator.TRIANGLE){
        var normals = new Float32Array(this.positions.length);
        
        for (var i = 0; i < this.indices.length; i += 3){
            var
                ia = this.indices.get(i + 0),
                ib = this.indices.get(i + 1),
                ic = this.indices.get(i + 2);
            
            var
                x1 = this.positions.get(ia * 3 + 0),
                y1 = this.positions.get(ia * 3 + 1),
                z1 = this.positions.get(ia * 3 + 2),
                
                x2 = this.positions.get(ib * 3 + 0),
                y2 = this.positions.get(ib * 3 + 1),
                z2 = this.positions.get(ib * 3 + 2),
                
                x3 = this.positions.get(ic * 3 + 0),
                y3 = this.positions.get(ic * 3 + 1),
                z3 = this.positions.get(ic * 3 + 2);
            
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
            
            normals[ia * 3 + 0] = Nx;
            normals[ia * 3 + 1] = Ny;
            normals[ia * 3 + 2] = Nz;
                
            normals[ib * 3 + 0] = Nx;
            normals[ib * 3 + 1] = Ny;
            normals[ib * 3 + 2] = Nz;
                
            normals[ic * 3 + 0] = Nx;
            normals[ic * 3 + 1] = Ny;
            normals[ic * 3 + 2] = Nz;
        }
        
        this.normals.push(normals);
    }
}

Tessellator.Geometry.prototype.translate = function (vec){
    if (!this.matrix){
        this.matrix = Tessellator.mat4();
    }
    
    this.matrix.translate(vec);
}

Tessellator.Geometry.prototype.rotate = function (r, vec){
    if (!this.matrix){
        this.matrix = Tessellator.mat4();
    }
    
    this.matrix.rotate(r, vec);
}

Tessellator.Geometry.prototype.scale = function (vec){
    if (!this.matrix){
        this.matrix = Tessellator.mat4();
    }
    
    this.matrix.scale(vec);
}

Tessellator.Geometry.prototype.align = function (vec, up){
    if (!this.matrix){
        this.matrix = Tessellator.mat4();
    }
    
    if (!up){
        this.matrix.align(vec, Tessellator.vec3(0, 1, 0));
    }else{
        this.matrix.align(vec, up);
    }
}

Tessellator.Geometry.prototype.canConvertTo = function (to){
    var g = Tessellator.Geometry.CUSTOM_GEOMETRY_REGISTER;
    
    for (var i = 0; i <= g.length; i++){
        if (i === g.length) return false;
        
        var converter = g[i];
        
        if (converter[0] === this.type && converter[1] === to){
            return true;
        }
    }

    return false;
}

Tessellator.Geometry.prototype.convert = function (adding){
    var g = Tessellator.Geometry.CUSTOM_GEOMETRY_REGISTER;
    
    for (var i = 0; i < g.length; i++){
        var converter = g[i];
        
        if (converter[0] === this.type){
            this.type = converter[1];
            
            converter[2](this, adding, this.conversionArg);
            
            return true;
        }
    }

    return false;
}

Tessellator.Geometry.prototype.add = function (newGeometry, arg){
    if (newGeometry.canConvertTo(this.type)){
        newGeometry.convert(this);
        
        if (!newGeometry.disposed){
            this.positions.push(newGeometry.positions);
            this.colors.push(newGeometry.colors);
            this.normals.push(newGeometry.normals);
            this.indices.push(newGeometry.indices);
        }
        
        return true;
    }
    
    return false;
}

Tessellator.Geometry.registerCustomGeometry = function (from, to, editor){
    var g = Tessellator.Geometry.CUSTOM_GEOMETRY_REGISTER;
    
    for (var i = 0; i < g.length; i++){
        if (g[i][0] === from && g[i][1] === to){
            g[i][2] = editor;
            
            return;
        }
    }
    
    g.push([from, to, editor]);
}

Tessellator.Geometry.CUSTOM_GEOMETRY_REGISTER = [];