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

Tessellator.Model.prototype.drawRect = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3];
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x, y, 0,
            x + w, y, 0,
            x, y + h, 0,
            x + w, y + h, 0
        );
        this.end([0, 1, 0, 2, 3, 1, 3, 2]);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3],
            vec = arguments[4];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x, 0, y).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, 0, y).multiply(mat));
        this.setVertex(Tessellator.vec3(x, 0, y + h).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, 0, y + h).multiply(mat));
        this.end([0, 1, 0, 2, 3, 1, 3, 2]);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            h = arguments[4],
            vec = arguments[5];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x, z, y).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, z, y).multiply(mat));
        this.setVertex(Tessellator.vec3(x, z, y + h).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, z, y + h).multiply(mat));
        this.end([0, 1, 0, 2, 3, 1, 3, 2]);
    };
};

Tessellator.Model.prototype.fillRect = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3];
        
        this.start(Tessellator.QUAD);
        this.setVertex(
            x, y, 0,
            x + w, y, 0,
            x + w, y + h, 0,
            x, y + h, 0
        );
        this.end();
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3],
            vec = arguments[4];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, -1, 0));
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(x, 0, y).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, 0, y).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, 0, y + h).multiply(mat));
        this.setVertex(Tessellator.vec3(x, 0, y + h).multiply(mat));
        this.end();
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            h = arguments[4],
            vec = arguments[5];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, -1, 0));
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(x, z, y).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, z, y).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, z, y + h).multiply(mat));
        this.setVertex(Tessellator.vec3(x, z, y + h).multiply(mat));
        this.end();
    };
};

Tessellator.Model.prototype.drawCuboid = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3] / 2;
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x - w, y - w, z - w,
            x + w, y - w, z - w,
            x - w, y + w, z - w,
            x + w, y + w, z - w,
            x - w, y - w, z + w,
            x + w, y - w, z + w,
            x - w, y + w, z + w,
            x + w, y + w, z + w
        );
        this.end([0, 1, 0, 2, 0, 4, 7, 3, 7, 6, 7, 5, 3, 2, 3, 1, 4, 5, 4, 6, 5, 1, 6, 2]);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3] / 2,
            vec = arguments[4];
        
        var mat = Tessellator.mat4().translate(Tessellator.vec3(x, y, z)).align(vec, Tessellator.vec3(0, 1, 0));
        
        x = 0;
        y = 0;
        z = 0;
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x - w, y - w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y - w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y + w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y + w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y - w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y - w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y + w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y + w, z + w).multiply(mat));
        this.end([0, 1, 0, 2, 0, 4, 7, 3, 7, 6, 7, 5, 3, 2, 3, 1, 4, 5, 4, 6, 5, 1, 6, 2]);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5];
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x , y , z ,
            xx, y , z ,
            x , yy, z ,
            xx, yy, z ,
            x , y , zz,
            xx, y , zz,
            x , yy, zz,
            xx, yy, zz
        );
        this.end([0, 1, 0, 2, 0, 4, 7, 3, 7, 6, 7, 5, 3, 2, 3, 1, 4, 5, 4, 6, 5, 1, 6, 2]);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            vec = arguments[6];
        
        var mat = Tessellator.mat4().translate(Tessellator.vec3(x, y, z)).align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x , y , z ).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y , z ).multiply(mat));
        this.setVertex(Tessellator.vec3(x , yy, z ).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, yy, z ).multiply(mat));
        this.setVertex(Tessellator.vec3(x , y , zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y , zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x , yy, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, yy, zz).multiply(mat));
        this.end([0, 1, 0, 2, 0, 4, 7, 3, 7, 6, 7, 5, 3, 2, 3, 1, 4, 5, 4, 6, 5, 1, 6, 2]);
    };
};

Tessellator.Model.prototype.fillCuboid = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3] / 2;
        
        this.start(Tessellator.QUAD);
        this.setVertex(
            x - w, y - w, z + w,
            x + w, y - w, z + w,
            x + w, y + w, z + w,
            x - w, y + w, z + w,
            
            x + w, y - w, z - w,
            x - w, y - w, z - w,
            x - w, y + w, z - w,
            x + w, y + w, z - w,
            
            x - w, y - w, z - w,
            x - w, y - w, z + w,
            x - w, y + w, z + w,
            x - w, y + w, z - w,
            
            x + w, y - w, z + w,
            x + w, y - w, z - w,
            x + w, y + w, z - w,
            x + w, y + w, z + w,
            
            x - w, y + w, z + w,
            x + w, y + w, z + w,
            x + w, y + w, z - w,
            x - w, y + w, z - w,
            
            x - w, y - w, z - w,
            x + w, y - w, z - w,
            x + w, y - w, z + w,
            x - w, y - w, z + w
        );
        this.end();
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3] / 2,
            vec = arguments[4];
        
        var mat = Tessellator.mat4().translate(Tessellator.vec3(x, y, z)).align(vec, Tessellator.vec3(0, 1, 0));
        
        x = 0;
        y = 0;
        z = 0;
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(x - w, y - w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y - w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y + w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y + w, z + w).multiply(mat));
        
        this.setVertex(Tessellator.vec3(x + w, y - w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y - w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y + w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y + w, z - w).multiply(mat));
        
        this.setVertex(Tessellator.vec3(x - w, y - w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y - w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y + w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y + w, z - w).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x + w, y - w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y - w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y + w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y + w, z + w).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x - w, y + w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y + w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y + w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y + w, z - w).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x - w, y - w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y - w, z - w).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w, y - w, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y - w, z + w).multiply(mat));
        this.end();
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5];
        
        this.start(Tessellator.QUAD);
        this.setVertex(
            x, y, zz,
            xx, y, zz,
            xx, yy, zz,
            x, yy, zz,
            
            xx, y, z,
            x, y, z,
            x, yy, z,
            xx, yy, z,
            
            x, y, z,
            x, y, zz,
            x, yy, zz,
            x, yy, z,
            
            xx, y, zz,
            xx, y, z,
            xx, yy, z,
            xx, yy, zz,
            
            x, yy, zz,
            xx, yy, zz,
            xx, yy, z,
            x, yy, z,
            
            x, y, z,
            xx, y, z,
            xx, y, zz,
            x, y, zz
        );
        this.end();
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            vec = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, yy, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, yy, zz).multiply(mat));
        
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, yy, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, yy, z).multiply(mat));
        
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, yy, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, yy, z).multiply(mat));
            
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, yy, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, yy, zz).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x, yy, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, yy, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, yy, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, yy, z).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.end();
    };
};

Tessellator.Model.prototype.fillCube = Tessellator.Model.prototype.fillCuboid;

Tessellator.Model.prototype.drawCube = Tessellator.Model.prototype.drawCuboid;

Tessellator.Model.prototype.drawPrism = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3];
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x - w / 2, y - w / 2, z - w / 2,
            x + w / 2, y - w / 2, z - w / 2,
            x - w / 2, y - w / 2, z + w / 2,
            x + w / 2, y - w / 2, z + w / 2,
            x, y + w / 2, z + w / 2,
            x, y + w / 2, z - w / 2
        );
        this.end([0, 1, 0, 2, 3, 2, 3, 1, 0, 5, 1, 5, 2, 4, 3, 4, 4, 5]);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            vec = arguments[4];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z - w / 2).multiply(mat));
        this.end([0, 1, 0, 2, 3, 2, 3, 1, 0, 5, 1, 5, 2, 4, 3, 4, 4, 5]);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5];
        
        var dx = (x + xx) / 2;
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x , y , z ,
            xx, y , z ,
            x , y , zz,
            xx, y , zz,
            dx, yy, zz,
            dx, yy, z
        );
        this.end([0, 1, 0, 2, 3, 2, 3, 1, 0, 5, 1, 5, 2, 4, 3, 4, 4, 5]);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            vec = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        var dx = (x + xx) / 2;
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, z).multiply(mat));
        this.end([0, 1, 0, 2, 3, 2, 3, 1, 0, 5, 1, 5, 2, 4, 3, 4, 4, 5]);
    };
};

Tessellator.Model.prototype.fillPrism = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3];
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(
            x + w / 2, y - w / 2, z - w / 2,
            x - w / 2, y - w / 2, z - w / 2,
            x, y + w / 2, z - w / 2,
            
            x - w / 2, y - w / 2, z + w / 2,
            x + w / 2, y - w / 2, z + w / 2,
            x, y + w / 2, z + w / 2
        );
        this.end();
        
        this.start(Tessellator.QUAD);
        this.setVertex(
            x + w / 2, y - w / 2, z + w / 2,
            x - w / 2, y - w / 2, z + w / 2,
            x - w / 2, y - w / 2, z - w / 2,
            x + w / 2, y - w / 2, z - w / 2,
            
            x + w / 2, y - w / 2, z + w / 2,
            x + w / 2, y - w / 2, z - w / 2,
            x, y + w / 2, z - w / 2,
            x, y + w / 2, z + w / 2,
            
            x - w / 2, y - w / 2, z - w / 2,
            x - w / 2, y - w / 2, z + w / 2,
            x, y + w / 2, z + w / 2,
            x, y + w / 2, z - w / 2
        );
        this.end();
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            vec = arguments[4];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z + w / 2).multiply(mat));
        this.end();
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z - w / 2).multiply(mat));
        this.end();
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5];
        
        var dx = (x + xx) / 2;
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(
            xx, y, z,
            x, y, z,
            dx, yy, z,
            
            x, y, zz,
            xx, y, zz,
            dx, yy, zz
        );
        this.end();
        
        this.start(Tessellator.QUAD);
        this.setVertex(
            xx, y, zz,
            x, y, zz,
            x, y, z,
            xx, y, z,
            
            xx, y, zz,
            xx, y, z,
            dx, yy, z,
            dx, yy, zz,
            
            x, y, z,
            x, y, zz,
            dx, yy, zz,
            dx, yy, z
        );
        this.end();
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            vec = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        var dx = (x + xx) / 2;
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, zz).multiply(mat));
        this.end();
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, z).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, z).multiply(mat));
        this.end();
    };
};

Tessellator.Model.prototype.drawTetrahedron = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3];
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x - w / 2, y - w / 2, z - w / 2,
            x + w / 2, y - w / 2, z - w / 2,
            x - w / 2, y - w / 2, z + w / 2,
            x + w / 2, y - w / 2, z + w / 2,
            x, y + w / 2, z
        );
        this.end([0, 1, 0, 2, 3, 1, 3, 2, 0, 4, 1, 4, 2, 4, 3, 4]);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            vec = arguments[4];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z).multiply(mat));
        this.end([0, 1, 0, 2, 3, 1, 3, 2, 0, 4, 1, 4, 2, 4, 3, 4]);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5];
        
        var dx = (x + xx) / 2,
            dz = (z + zz) / 2;
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x , y, z ,
            xx, y, z ,
            x , y, zz,
            xx, y, zz,
            dx, yy, dz
        );
        this.end([0, 1, 0, 2, 3, 1, 3, 2, 0, 4, 1, 4, 2, 4, 3, 4]);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            vec = arguments[6];
        
        var dx = (x + xx) / 2,
            dz = (z + zz) / 2;
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x , y, z ).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z ).multiply(mat));
        this.setVertex(Tessellator.vec3(x , y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, dz).multiply(mat));
        this.end([0, 1, 0, 2, 3, 1, 3, 2, 0, 4, 1, 4, 2, 4, 3, 4]);
    };
};

Tessellator.Model.prototype.fillTetrahedron = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3];
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(
            x + w / 2, y - w / 2, z - w / 2,
            x - w / 2, y - w / 2, z - w / 2,
            x, y + w / 2, z,
            
            x - w / 2, y - w / 2, z - w / 2,
            x - w / 2, y - w / 2, z + w / 2,
            x, y + w / 2, z,
            
            x + w / 2, y - w / 2, z + w / 2,
            x + w / 2, y - w / 2, z - w / 2,
            x, y + w / 2, z,
            
            x - w / 2, y - w / 2, z + w / 2,
            x + w / 2, y - w / 2, z + w / 2,
            x, y + w / 2, z
        );
        this.end();
        
        this.start(Tessellator.QUAD);
        this.setVertex(
            x + w / 2, y - w / 2, z + w / 2,
            x - w / 2, y - w / 2, z + w / 2,
            x - w / 2, y - w / 2, z - w / 2,
            x + w / 2, y - w / 2, z - w / 2
        );
        this.end();
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            vec = arguments[4];
        
        var mat = Tessellator.mat3().rotateVec(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z).multiply(mat));
        
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z).multiply(mat));
        
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z).multiply(mat));
        
        this.setVertex(Tessellator.vec3(x - w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y - w / 2, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w / 2, z).multiply(mat));
        this.end();
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(x + w / 2, y, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y, z + w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w / 2, y, z - w / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + w / 2, y, z - w / 2).multiply(mat));
        this.end();
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5];
        
        var dx = (x + xx) / 2,
            dz = (z + zz) / 2;
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(
            xx, y, z,
            x , y, z,
            dx, yy, dz,
            
            x, y, z ,
            x, y, zz,
            dx, yy, dz,
            
            xx, y, zz,
            xx, y, z ,
            dx, yy, dz,
            
            x , y, zz,
            xx, y, zz,
            dx, yy, dz
        );
        this.end();
        
        this.start(Tessellator.QUAD);
        this.setVertex(
            xx, y, zz,
            x , y, zz,
            x , y, z ,
            xx, y, z 
        );
        this.end();
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            vec = arguments[6];
        
        var dx = (x + xx) / 2,
            dz = (z + zz) / 2;
        
        var mat = Tessellator.mat3().rotateVec(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, dz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, dz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, dz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, dz).multiply(mat));
        this.end();
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x , y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x , y, z ).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z ).multiply(mat));
        this.end();
    };
};

Tessellator.Model.prototype.drawPyramid = Tessellator.Model.prototype.drawTetrahedron;

Tessellator.Model.prototype.fillPyramid = Tessellator.Model.prototype.fillPyramid;

Tessellator.Model.prototype.drawHalfTetrahedron = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            wx = arguments[3],
            wy = arguments[4];
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x - wx / 2, y - wx / 2, z - wx / 2,
            x + wx / 2, y - wx / 2, z - wx / 2,
            x - wx / 2, y - wx / 2, z + wx / 2,
            x + wx / 2, y - wx / 2, z + wx / 2,
            x - wy / 2, y + wy / 2, z - wy / 2,
            x + wy / 2, y + wy / 2, z - wy / 2,
            x - wy / 2, y + wy / 2, z + wy / 2,
            x + wy / 2, y + wy / 2, z + wy / 2
        );
        this.end([0, 1, 0, 2, 0, 4, 7, 3, 7, 6, 7, 5, 3, 2, 3, 1, 4, 5, 4, 6, 5, 1, 6, 2]);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            wx = arguments[3],
            wy = arguments[4],
            vec = arguments[5];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x - wx / 2, y - wx / 2, z - wx / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wx / 2, y - wx / 2, z - wx / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wx / 2, y - wx / 2, z + wx / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wx / 2, y - wx / 2, z + wx / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wy / 2, y + wy / 2, z - wy / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wy / 2, y + wy / 2, z - wy / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wy / 2, y + wy / 2, z + wy / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wy / 2, y + wy / 2, z + wy / 2).multiply(mat));
        this.end([0, 1, 0, 2, 0, 4, 7, 3, 7, 6, 7, 5, 3, 2, 3, 1, 4, 5, 4, 6, 5, 1, 6, 2]);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            cut = arguments[6];
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x , y, z ,
            xx, y, z ,
            x , y, zz,
            xx, y, zz,
            
            x  + cut * (xx - x) / 2, yy, z  + cut * (zz - z) / 2,
            xx - cut * (xx - x) / 2, yy, z  + cut * (zz - z) / 2,
            x  + cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2,
            xx - cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2
        );
        this.end([0, 1, 0, 2, 0, 4, 7, 3, 7, 6, 7, 5, 3, 2, 3, 1, 4, 5, 4, 6, 5, 1, 6, 2]);
    }else if (arguments.length === 8){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            cut = arguments[6],
            vec = arguments[7];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x , y, z ).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z ).multiply(mat));
        this.setVertex(Tessellator.vec3(x , y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x  + cut * (xx - x) / 2, yy, z  + cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(xx - cut * (xx - x) / 2, yy, z  + cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x  + cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(xx - cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2).multiply(mat));
        this.end([0, 1, 0, 2, 0, 4, 7, 3, 7, 6, 7, 5, 3, 2, 3, 1, 4, 5, 4, 6, 5, 1, 6, 2]);
    };
};

Tessellator.Model.prototype.fillHalfTetrahedron = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            wx = arguments[3] / 2,
            wy = arguments[4] / 2;
        
        this.start(Tessellator.QUAD);
        this.setVertex(
            x - wx, y - wx, z + wx,
            x + wx, y - wx, z + wx,
            x + wy, y + wy, z + wy,
            x - wy, y + wy, z + wy,
            
            x + wx, y - wx, z - wx,
            x - wx, y - wx, z - wx,
            x - wy, y + wy, z - wy,
            x + wy, y + wy, z - wy,
            
            x - wx, y - wx, z - wx,
            x - wx, y - wx, z + wx,
            x - wy, y + wy, z + wy,
            x - wy, y + wy, z - wy,
            
            x + wx, y - wx, z + wx,
            x + wx, y - wx, z - wx,
            x + wy, y + wy, z - wy,
            x + wy, y + wy, z + wy,
            
            x - wy, y + wy, z + wy,
            x + wy, y + wy, z + wy,
            x + wy, y + wy, z - wy,
            x - wy, y + wy, z - wy,
            
            x - wx, y - wx, z - wx,
            x + wx, y - wx, z - wx,
            x + wx, y - wx, z + wx,
            x - wx, y - wx, z + wx
        );
        this.end();
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            wx = arguments[3] / 2,
            wy = arguments[4] / 2,
            vec = arguments[5];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(x - wx, y - wx, z + wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wx, y - wx, z + wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wy, y + wy, z + wy).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wy, y + wy, z + wy).multiply(mat));
        
        this.setVertex(Tessellator.vec3(x + wx, y - wx, z - wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wx, y - wx, z - wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wy, y + wy, z - wy).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wy, y + wy, z - wy).multiply(mat));
        
        this.setVertex(Tessellator.vec3(x - wx, y - wx, z - wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wx, y - wx, z + wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wy, y + wy, z + wy).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wy, y + wy, z - wy).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x + wx, y - wx, z + wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wx, y - wx, z - wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wy, y + wy, z - wy).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wy, y + wy, z + wy).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x - wy, y + wy, z + wy).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wy, y + wy, z + wy).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wy, y + wy, z - wy).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wy, y + wy, z - wy).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x - wx, y - wx, z - wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wx, y - wx, z - wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x + wx, y - wx, z + wx).multiply(mat));
        this.setVertex(Tessellator.vec3(x - wx, y - wx, z + wx).multiply(mat));
        this.end();
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            cut = arguments[6];
        
        this.start(Tessellator.QUAD);
        this.setVertex(
            x, y, zz,
            xx, y, zz,
            xx - cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2,
            x + cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2,
            
            xx, y, z,
            x, y, z,
            x + cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2,
            xx - cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2,
            
            x, y, z,
            x, y, zz,
            x + cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2,
            x + cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2,
            
            xx, y, zz,
            xx, y, z,
            xx - cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2,
            xx - cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2,
            
            x + cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2,
            xx - cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2,
            xx - cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2,
            x + cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2,
            
            x, y, z,
            xx, y, z,
            xx, y, zz,
            x, y, zz
        );
        this.end();
    }else if (arguments.length === 8){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            cut = arguments[6],
            vec = arguments[7];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.QUAD);
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx - cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2).multiply(mat));
        
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x + cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(xx - cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2).multiply(mat));
        
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x + cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2).multiply(mat));
            
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx - cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(xx - cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x + cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(xx - cut * (xx - x) / 2, yy, zz - cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(xx - cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2).multiply(mat));
        this.setVertex(Tessellator.vec3(x + cut * (xx - x) / 2, yy, z + cut * (zz - z) / 2).multiply(mat));
            
        this.setVertex(Tessellator.vec3(x, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(xx, y, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, zz).multiply(mat));
        this.end();
    };
};

Tessellator.Model.prototype.drawHalfPyramid = Tessellator.Model.prototype.drawHalfTetrahedron;

Tessellator.Model.prototype.fillHalfPyramid = Tessellator.Model.prototype.fillHalfTetrahedron;

Tessellator.Model.prototype.drawSphere = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            q = Math.max(8, Math.ceil(r * 8));
        
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                vertices.push(xx * r + x);
                vertices.push(yy * r + y);
                vertices.push(zz * r + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U + 1);
                vertexBuffer.push(V);
                
                vertexBuffer.push(U);
                vertexBuffer.push(V + 1);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            q = arguments[4];
        
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                vertices.push(xx * r + x);
                vertices.push(yy * r + y);
                vertices.push(zz * r + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U + 1);
                vertexBuffer.push(V);
                
                vertexBuffer.push(U);
                vertexBuffer.push(V + 1);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            rz = arguments[5],
            q = arguments[6];
        
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                vertices.push(xx * rx + x);
                vertices.push(yy * ry + y);
                vertices.push(zz * rz + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U + 1);
                vertexBuffer.push(V);
                
                vertexBuffer.push(U);
                vertexBuffer.push(V + 1);
            };
        };
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    };
};

Tessellator.Model.prototype.fillSphere = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            q = Math.max(8, Math.ceil(r * 8));
        
        var normals = [];
        var texture = [];
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                normals.push(xx);
                normals.push(yy);
                normals.push(zz);
                
                texture.push(ii / (q * 2));
                texture.push(1 - (i / q));
                
                vertices.push(xx * r + x);
                vertices.push(yy * r + y);
                vertices.push(zz * r + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U);
                vertexBuffer.push(V);
                vertexBuffer.push(U + 1);
                
                vertexBuffer.push(V);
                vertexBuffer.push(V + 1);
                vertexBuffer.push(U + 1);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(normals);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(texture);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            q = arguments[4];
        
        var normals = [];
        var texture = [];
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                normals.push(xx);
                normals.push(yy);
                normals.push(zz);
                
                texture.push(ii / (q * 2));
                texture.push(1 - (i / q));
                
                vertices.push(xx * r + x);
                vertices.push(yy * r + y);
                vertices.push(zz * r + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U);
                vertexBuffer.push(V);
                vertexBuffer.push(U + 1);
                
                vertexBuffer.push(V);
                vertexBuffer.push(V + 1);
                vertexBuffer.push(U + 1);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(normals);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(texture);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            rz = arguments[5],
            q = arguments[6];
        
        var normals = [];
        var texture = [];
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                normals.push(xx);
                normals.push(yy);
                normals.push(zz);
                
                texture.push(ii / (q * 2));
                texture.push(1 - (i / q));
                
                vertices.push(xx * rx + x);
                vertices.push(yy * ry + y);
                vertices.push(zz * rz + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U);
                vertexBuffer.push(V);
                vertexBuffer.push(U + 1);
                
                vertexBuffer.push(V);
                vertexBuffer.push(V + 1);
                vertexBuffer.push(U + 1);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(normals);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(texture);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    };
};

Tessellator.Model.prototype.drawHemisphere = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            q = Math.max(8, Math.ceil(r * 8));
        
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q / 2);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                vertices.push(xx * r + x);
                vertices.push(yy * r + y);
                vertices.push(zz * r + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U + 1);
                vertexBuffer.push(V);
                
                vertexBuffer.push(U);
                vertexBuffer.push(V + 1);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            q = arguments[4];
        
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q / 2);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                vertices.push(xx * r + x);
                vertices.push(yy * r + y);
                vertices.push(zz * r + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U + 1);
                vertexBuffer.push(V);
                
                vertexBuffer.push(U);
                vertexBuffer.push(V + 1);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            rz = arguments[5],
            q = arguments[6];
        
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q / 2);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                vertices.push(xx * rx + x);
                vertices.push(yy * ry + y);
                vertices.push(zz * rz + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U + 1);
                vertexBuffer.push(V);
                
                vertexBuffer.push(U);
                vertexBuffer.push(V + 1);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 8){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            rz = arguments[5],
            vec = arguments[6],
            q = arguments[7];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var vertices = new Tessellator.Array();
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q / 2);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                vertices.push(Tessellator.vec3(xx * rx + x, yy * ry + y, zz * rz + z).multiply(mat));
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U + 1);
                vertexBuffer.push(V);
                
                vertexBuffer.push(U);
                vertexBuffer.push(V + 1);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    };
};

Tessellator.Model.prototype.fillHemisphere = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            q = Math.max(8, Math.ceil(r * 8));
        
        var normals = [];
        var texture = [];
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q / 2);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                normals.push(xx);
                normals.push(yy);
                normals.push(zz);
                
                texture.push(ii / (q * 2));
                texture.push(1 - (i / q));
                
                vertices.push(xx * r + x);
                vertices.push(yy * r + y);
                vertices.push(zz * r + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U);
                vertexBuffer.push(V);
                vertexBuffer.push(U + 1);
                
                vertexBuffer.push(V);
                vertexBuffer.push(V + 1);
                vertexBuffer.push(U + 1);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(normals);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(texture);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            q = arguments[4];
        
        var normals = [];
        var texture = [];
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q / 2);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                normals.push(xx);
                normals.push(yy);
                normals.push(zz);
                
                texture.push(ii / (q * 2));
                texture.push(1 - (i / q));
                
                vertices.push(xx * r + x);
                vertices.push(yy * r + y);
                vertices.push(zz * r + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U);
                vertexBuffer.push(V);
                vertexBuffer.push(U + 1);
                
                vertexBuffer.push(V);
                vertexBuffer.push(V + 1);
                vertexBuffer.push(U + 1);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(normals);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(texture);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            rz = arguments[5],
            q = arguments[6];
        
        var normals = [];
        var texture = [];
        var vertices = [];
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q / 2);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                normals.push(xx);
                normals.push(yy);
                normals.push(zz);
                
                texture.push(ii / (q * 2));
                texture.push(1 - (i / q));
                
                vertices.push(xx * rx + x);
                vertices.push(yy * ry + y);
                vertices.push(zz * rz + z);
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U);
                vertexBuffer.push(V);
                vertexBuffer.push(U + 1);
                
                vertexBuffer.push(V);
                vertexBuffer.push(V + 1);
                vertexBuffer.push(U + 1);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(normals);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(texture);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    }else if (arguments.length === 8){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            rz = arguments[5],
            vec = arguments[6],
            q = arguments[7];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var normals = new Tessellator.Array();
        var texture = [];
        var vertices = new Tessellator.Array();
        
        for (var i = 0; i <= q; i++){
            var angleY = Math.PI * (i / q / 2);
            
            var sinY = Math.sin(angleY);
            var cosY = Math.cos(angleY);
            
            for (var ii = 0; ii <= q * 2; ii++){
                var angleX = -(Math.PI * 2) * (ii / (q * 2));
                
                var sinX = Math.sin(angleX);
                var cosX = Math.cos(angleX);
                
                var xx = cosX * sinY,
                    yy = cosY,
                    zz = sinX * sinY;
                
                normals.push(Tessellator.vec3(xx, yy, zz).multiply(mat));
                
                texture.push(ii / (q * 2));
                texture.push(1 - (i / q));
                
                vertices.push(Tessellator.vec3(xx * rx + x, yy * ry + y, zz * rz + z).multiply(mat));
            };
        };
        
        var vertexBuffer = [];
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii < q * 2; ii++){
                var U = (i * (q * 2 + 1)) + ii;
                var V = U + q * 2 + 1;
                
                vertexBuffer.push(U);
                vertexBuffer.push(V);
                vertexBuffer.push(U + 1);
                
                vertexBuffer.push(V);
                vertexBuffer.push(V + 1);
                vertexBuffer.push(U + 1);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(normals);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(texture);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vertices);
        this.end(vertexBuffer);
    };
};

Tessellator.Model.prototype.drawHalfSphere = Tessellator.Model.prototype.drawHemisphere;

Tessellator.Model.prototype.fillHalfSphere = Tessellator.Model.prototype.fillHemisphere;

Tessellator.Model.prototype.drawGrid = function (){
    if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3],
            sx = arguments[4],
            sy = arguments[5];
        
        this.start(Tessellator.LINE);
        
        for (var i = 0; i <= sx; i++){
            this.setVertex(
                x + w * i / sx, y, 0,
                x + w * i / sx, y + h, 0
            );
        };
        
        for (var i = 0; i <= sy; i++){
            this.setVertex(
                x, y + h * i / sy, 0,
                x + w, y + h * i / sy, 0
            );
        };
        
        this.end();
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3],
            sx = arguments[4],
            sy = arguments[5],
            vec = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, -1, 0));
        
        this.start(Tessellator.LINE);
        
        for (var i = 0; i <= sx; i++){
            this.setVertex(Tessellator.vec3(x + w * i / sx, 0, y).multiply(mat));
            this.setVertex(Tessellator.vec3(x + w * i / sx, 0, y + h).multiply(mat));
        };
        
        for (var i = 0; i <= sy; i++){
            this.setVertex(Tessellator.vec3(x, 0, y + h * i / sy).multiply(mat));
            this.setVertex(Tessellator.vec3(x + w, 0, y + h * i / sy).multiply(mat));
        };
        
        this.end();
    }else if (arguments.length === 8){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            h = arguments[4],
            sx = arguments[5],
            sy = arguments[6],
            vec = arguments[7];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, -1, 0));
        
        this.start(Tessellator.LINE);
        
        for (var i = 0; i <= sx; i++){
            this.setVertex(Tessellator.vec3(x + w * i / sx, z, y).multiply(mat));
            this.setVertex(Tessellator.vec3(x + w * i / sx, z, y + h).multiply(mat));
        };
        
        for (var i = 0; i <= sy; i++){
            this.setVertex(Tessellator.vec3(x, z, y + h * i / sy).multiply(mat));
            this.setVertex(Tessellator.vec3(x + w, z, y + h * i / sy).multiply(mat));
        };
        
        this.end();
    };
};

Tessellator.Model.prototype.fillGrid = function (){
    if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3],
            sx = arguments[4],
            sy = arguments[5];
        
        this.start(Tessellator.QUAD);
        for (var i = 0; i <= sx; i++){
            for (var ii = 0; ii <= sy; ii++){
                if ((i + ii) % 2 === 0){
                    this.setVertex(
                        x + w * i / sx, y + h * ii / sy, 0,
                        x + w * (i + 1) / sx, y + h * ii / sy, 0,
                        x + w * (i + 1) / sx, y + h * (ii + 1) / sy, 0,
                        x + w * i / sx, y + h * (ii + 1) / sy, 0
                    );
                };
            };
        };
        this.end();
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3],
            sx = arguments[4],
            sy = arguments[5],
            vec = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, -1, 0));
        
        this.start(Tessellator.QUAD);
        for (var i = 0; i <= sx; i++){
            for (var ii = 0; ii <= sy; ii++){
                if ((i + ii) % 2 === 0){
                    this.setVertex(Tessellator.vec3(x + w * i / sx, 0, y + h * ii / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * (i + 1) / sx, 0, y + h * ii / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * (i + 1) / sx, 0, y + h * (ii + 1) / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * i / sx, 0, y + h * (ii + 1) / sy).multiply(mat));
                };
            };
        };
        this.end();
    }else if (arguments.length === 8){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            h = arguments[4],
            sx = arguments[5],
            sy = arguments[6],
            vec = arguments[7];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, -1, 0));
        
        this.start(Tessellator.QUAD);
        for (var i = 0; i <= sx; i++){
            for (var ii = 0; ii <= sy; ii++){
                if ((i + ii) % 2 === 0){
                    this.setVertex(Tessellator.vec3(x + w * i / sx, z, y + h * ii / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * (i + 1) / sx, z, y + h * ii / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * (i + 1) / sx, z, y + h * (ii + 1) / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * i / sx, z, y + h * (ii + 1) / sy).multiply(mat));
                };
            };
        };
        this.end();
    };
};

Tessellator.Model.prototype.fillInverseGrid = function (){
    if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3],
            sx = arguments[4],
            sy = arguments[5];
        
        this.start(Tessellator.QUAD);
        for (var i = 0; i <= sx; i++){
            for (var ii = 0; ii <= sy; ii++){
                if ((i + ii) % 2 === 1){
                    this.setVertex(
                        x + w * i / sx, y + h * ii / sy, 0,
                        x + w * (i + 1) / sx, y + h * ii / sy, 0,
                        x + w * (i + 1) / sx, y + h * (ii + 1) / sy, 0,
                        x + w * i / sx, y + h * (ii + 1) / sy, 0
                    );
                };
            };
        };
        this.end();
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            h = arguments[3],
            sx = arguments[4],
            sy = arguments[5],
            vec = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, -1, 0));
        
        this.start(Tessellator.QUAD);
        for (var i = 0; i <= sx; i++){
            for (var ii = 0; ii <= sy; ii++){
                if ((i + ii) % 2 === 1){
                    this.setVertex(Tessellator.vec3(x + w * i / sx, 0, y + h * ii / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * (i + 1) / sx, 0, y + h * ii / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * (i + 1) / sx, 0, y + h * (ii + 1) / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * i / sx, 0, y + h * (ii + 1) / sy).multiply(mat));
                };
            };
        };
        this.end();
    }else if (arguments.length === 8){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            h = arguments[4],
            sx = arguments[5],
            sy = arguments[6],
            vec = arguments[7];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, -1, 0));
        
        this.start(Tessellator.QUAD);
        for (var i = 0; i <= sx; i++){
            for (var ii = 0; ii <= sy; ii++){
                if ((i + ii) % 2 === 1){
                    this.setVertex(Tessellator.vec3(x + w * i / sx, z, y + h * ii / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * (i + 1) / sx, z, y + h * ii / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * (i + 1) / sx, z, y + h * (ii + 1) / sy).multiply(mat));
                    this.setVertex(Tessellator.vec3(x + w * i / sx, z, y + h * (ii + 1) / sy).multiply(mat));
                };
            };
        };
        this.end();
    };
};

Tessellator.Model.prototype.drawCross = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3] / 2;
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x + w, y, z,
            x - w, y, z,
            x, y + w, z,
            x, y - w, z,
            x, y, z + w,
            x, y, z - w
        );
        this.end();
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3] / 2,
            vec = arguments[4];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(x + w, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x - w, y, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y + w, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y - w, z).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, z + w).multiply(mat));
        this.setVertex(Tessellator.vec3(x, y, z - w).multiply(mat));
        this.end();
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5];
        
        var dx = (x + xx) / 2,
            dy = (y + yy) / 2,
            dz = (z + zz) / 2;
        
        this.start(Tessellator.LINE);
        this.setVertex(
            xx, dy, dz,
            x , dy, dz,
            dx, yy, dz,
            dx, y , dz,
            dx, dy, zz,
            dx, dy, z 
        );
        this.end();
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5],
            vec = arguments[6];
        
        var dx = (x + xx) / 2,
            dy = (y + yy) / 2,
            dz = (z + zz) / 2;
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        this.start(Tessellator.LINE);
        this.setVertex(Tessellator.vec3(xx, dy, dz).multiply(mat));
        this.setVertex(Tessellator.vec3(x, dy, dz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, yy, dz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, y, dz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, dy, zz).multiply(mat));
        this.setVertex(Tessellator.vec3(dx, dy, z).multiply(mat));
        this.end();
    };
};

Tessellator.Model.prototype.drawLine = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            xx = arguments[2],
            yy = arguments[3];
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x, y, 0,
            xx, yy, 0
        );
        this.end();
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            xx = arguments[3],
            yy = arguments[4],
            zz = arguments[5];
        
        this.start(Tessellator.LINE);
        this.setVertex(
            x, y, z,
            xx, yy, zz
        );
        this.end();
    };
};

Tessellator.Model.prototype.drawOval = function (){
    if (arguments.length === 3){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            q = Math.max(8, Math.ceil(w * 8));
        
        
        var indices = [];
        
        this.start(Tessellator.LINE);
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            this.setVertex(x + s * w, y + c * w, 0);
            
            indices.push(i, (i + 1) % q);
        };
        this.end(indices);
    }else if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            q = Math.max(8, Math.ceil(w * 8));
        
        
        var indices = [];
        
        this.start(Tessellator.LINE);
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            this.setVertex(x + s * w, y + c * w, z);
            
            indices.push(i, (i + 1) % q);
        };
        this.end(indices);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            q = arguments[4];
        
        
        var indices = [];
        
        this.start(Tessellator.LINE);
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            this.setVertex(x + s * w, y + c * w, z);
            
            indices.push(i, (i + 1) % q);
        };
        this.end(indices);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            vec = arguments[4],
            q = arguments[5];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var indices = [];
        
        this.start(Tessellator.LINE);
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            this.setVertex(Tessellator.vec3(x + s * w, y, z + c * w).multiply(mat));
            
            indices.push(i, (i + 1) % q);
        };
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var indices = [];
        
        this.start(Tessellator.LINE);
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            this.setVertex(Tessellator.vec3(x + s * rx, y, z + c * ry).multiply(mat));
            
            indices.push(i, (i + 1) % q);
        };
        this.end(indices);
    };
};

Tessellator.Model.prototype.fillOval = function (){
    if (arguments.length === 3){
        var x = arguments[0],
            y = arguments[1],
            w = arguments[2],
            q = Math.max(8, Math.ceil(w * 8));
        
        
        var indices = [];
        var ver = [x, y, 0];
        var tex = [.5, .5];
        
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(x + s * w, y + c * w, 0);
            tex.push(s / 2 + .5, c / 2 + .5);
            
            if (i + 1 === q){
                indices.push(0, i + 1, 1);
            }else{
                indices.push(0, i + 1, i + 2);
            };
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            q = Math.max(8, Math.ceil(w * 8));
        
        
        var indices = [];
        var ver = [x, y, z];
        var tex = [.5, .5];
        
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * -2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(x + s * w, y + c * w, z);
            tex.push(s / 2 + .5, c / 2 + .5);
            
            if (i + 1 === q){
                indices.push(0, i + 1, 1);
            }else{
                indices.push(0, i + 1, i + 2);
            };
        };
        
        this.setVertex(Tessellator.TEXTURE, tex);
        this.setVertex(Tessellator.INDICES, indices);
        this.setVertex(Tessellator.TRIANGLE, ver);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            q = arguments[4];
        
        
        var indices = [];
        var ver = [x, y, z];
        var tex = [.5, .5];
        
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * -2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(x + s * w, y + c * w, z);
            tex.push(s / 2 + .5, c / 2 + .5);
            
            if (i + 1 === q){
                indices.push(0, i + 1, 1);
            }else{
                indices.push(0, i + 1, i + 2);
            };
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w = arguments[3],
            vec = arguments[4],
            q = arguments[5];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var indices = [];
        var ver = new Tessellator.Array(Tessellator.vec3(x, y, z).multiply(mat));
        var tex = [.5, .5];
        
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * -2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(Tessellator.vec3(x + s * w, y, z + c * w).multiply(mat));
            tex.push(s / 2 + .5, c / 2 + .5);
            
            if (i + 1 === q){
                indices.push(0, i + 1, 1);
            }else{
                indices.push(0, i + 1, i + 2);
            };
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var indices = [];
        var ver = new Tessellator.Array([x, y, z]);
        var tex = [.5, .5];
        
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * -2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(Tessellator.vec3(x + s * rx, y, z + c * ry).multiply(mat));
            tex.push(s / 2 + .5, c / 2 + .5);
            
            if (i + 1 === q){
                indices.push(0, i + 1, 1);
            }else{
                indices.push(0, i + 1, i + 2);
            };
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    };
};

Tessellator.Model.prototype.fillDisk = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            w1 = arguments[2],
            w2 = arguments[3],
            q = Math.max(8, Math.ceil(Math.max(w1, w2) * 8));
        
        var ver = [];
        var tex = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * w1, y + c * w1, 0,
                x + s * w2, y + c * w2, 0);
            tex.push(a, 0, a, 1);
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.QUAD_STRIP);
        this.setVertex(ver);
        this.end();
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w1 = arguments[3],
            w2 = arguments[4],
            q = Math.max(8, Math.ceil(w * 8));
        
        
        var ver = [];
        var tex = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * w1, y + c * w1, z,
                x + s * w2, y + c * w2, z);
            tex.push(a, 0, a, 1);
        };
        
        this.setVertex(Tessellator.TEXTURE, tex);
        this.setVertex(Tessellator.QUAD_STRIP, ver);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w1 = arguments[3],
            w2 = arguments[4],
            q = arguments[5];
        
        var ver = [];
        var tex = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * w1, y + c * w1, z,
                x + s * w2, y + c * w2, z);
            tex.push(a, 0, a, 1);
        };
        
        this.setVertex(Tessellator.TEXTURE, tex);
        this.setVertex(Tessellator.QUAD_STRIP, ver);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w1 = arguments[3],
            w2 = arguments[4],
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var ver = new Tessellator.Array();
        var tex = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                Tessellator.vec3(x + s * w1, y, z + c * w1).multiply(mat),
                Tessellator.vec3(x + s * w2, y, z + c * w2).multiply(mat));
            tex.push(a, 0, a, 1);
        };
        
        this.setVertex(Tessellator.TEXTURE, tex);
        this.setVertex(Tessellator.QUAD_STRIP, ver);
    }else if (arguments.length === 9){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r1x = arguments[3],
            r1y = arguments[4],
            r2x = arguments[5],
            r2y = arguments[6],
            vec = arguments[7],
            q = arguments[8];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var ver = new Tessellator.Array();
        var tex = [];
        
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                Tessellator.vec3(x + s * r1x, y, z + c * r1y).multiply(mat),
                Tessellator.vec3(x + s * r2x, y, z + c * r2y).multiply(mat));
                
            tex.push(s / 2 + .5, c / 2 + .5);
        };
        
        this.setVertex(Tessellator.TEXTURE, tex);
        this.setVertex(Tessellator.QUAD_STRIP, ver);
    };
};

Tessellator.Model.prototype.drawDisk = function (){
    if (arguments.length === 4){
        var x = arguments[0],
            y = arguments[1],
            w1 = arguments[2],
            w2 = arguments[3],
            q = Math.max(8, Math.ceil(Math.max(w1, w2) * 8));
        
        var ver = [];
        var indices = [];
        
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * w1, y + c * w1, 0,
                x + s * w2, y + c * w2, 0);
            
            var ii = i * 2;
            indices.push(ii + 0, ii + 1, ii + 0, (ii + 2) % (q * 2), ii + 1, (ii + 3) % (q * 2));
        };
        
        this.setVertex(Tessellator.INDICES, indices);
        this.setVertex(Tessellator.LINE, ver);
    }else if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w1 = arguments[3],
            w2 = arguments[4],
            q = Math.max(8, Math.ceil(w * 8));
        
        
        var ver = [];
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * w1, y + c * w1, z,
                x + s * w2, y + c * w2, z);
            
            indices.push(ii + 0, ii + 1, ii + 0, (ii + 2) % (q * 2), ii + 1, (ii + 3) % (q * 2));
        };
        
        this.setVertex(Tessellator.INDICES, indices);
        this.setVertex(Tessellator.QUAD_STRIP, ver);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w1 = arguments[3],
            w2 = arguments[4],
            q = arguments[5];
        
        var ver = [];
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * w1, y + c * w1, z,
                x + s * w2, y + c * w2, z);
            
            indices.push(ii + 0, ii + 1, ii + 0, (ii + 2) % (q * 2), ii + 1, (ii + 3) % (q * 2));
        };
        
        this.setVertex(Tessellator.INDICES, indices);
        this.setVertex(Tessellator.QUAD_STRIP, ver);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            w1 = arguments[3],
            w2 = arguments[4],
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var ver = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                Tessellator.vec3(x + s * w1, y, z + c * w1).multiply(mat),
                Tessellator.vec3(x + s * w2, y, z + c * w2).multiply(mat));
            
            indices.push(ii + 0, ii + 1, ii + 0, (ii + 2) % (q * 2), ii + 1, (ii + 3) % (q * 2));
        };
        
        this.setVertex(Tessellator.INDICES, indices);
        this.setVertex(Tessellator.QUAD_STRIP, ver);
    }else if (arguments.length === 9){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r1x = arguments[3],
            r1y = arguments[4],
            r2x = arguments[5],
            r2y = arguments[6],
            vec = arguments[7],
            q = arguments[8];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var ver = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                Tessellator.vec3(x + s * r1x, y, z + c * r1y).multiply(mat),
                Tessellator.vec3(x + s * r2x, y, z + c * r2y).multiply(mat));
                
            indices.push(ii + 0, ii + 1, ii + 0, (ii + 2) % (q * 2), ii + 1, (ii + 3) % (q * 2));
        };
        
        this.setVertex(Tessellator.INDICES, indices);
        this.setVertex(Tessellator.QUAD_STRIP, ver);
    };
};

Tessellator.Model.prototype.drawCircle = Tessellator.Model.prototype.drawOval;

Tessellator.Model.prototype.fillCircle = Tessellator.Model.prototype.fillOval;

Tessellator.Model.prototype.drawCilinder = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            q = Math.max(8, Math.ceil(r * 8));
        
        var ver = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * r, y - h, z + c * r,
                x + s * r, y + h, z + c * r
            );
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii, ii + 1, ii, ii + 2, ii + 1, ii + 3);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            q = arguments[5];
        
        var ver = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * r, y - h, z + c * r,
                x + s * r, y + h, z + c * r
            );
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii, ii + 1, ii, ii + 2, ii + 1, ii + 3);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var ver = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                Tessellator.vec3(x + s * r, y - h, z + c * r).multiply(mat),
                Tessellator.vec3(x + s * r, y + h, z + c * r).multiply(mat)
            );
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii, ii + 1, ii, ii + 2, ii + 1, ii + 3);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(ver);
        this.end(indices);
    };
};

Tessellator.Model.prototype.fillCilinder = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            q = Math.max(8, Math.ceil(r * 8));
        
        var sine = Tessellator.sign(r * h);
        
        var ver = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var norm = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            norm.push(s * sine, 0, c * sine, s * sine, 0, c * sine);
            ver.push(
                x + s * r, y - h, z + c * r,
                x + s * r, y + h, z + c * r
            );
            tex.push(i / q, 0, i / q, 1);
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii + 1, ii, ii + 2, ii + 3, ii + 1, ii + 2);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(norm);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            q = arguments[5];
        
        var sine = Tessellator.sign(r * h);
        
        var ver = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var norm = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            norm.push(s * sine, 0, c * sine, s * sine, 0, c * sine);
            ver.push(
                x + s * r, y - h, z + c * r,
                x + s * r, y + h, z + c * r
            );
            tex.push(i / q, 0, i / q, 1);
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii + 1, ii, ii + 2, ii + 3, ii + 1, ii + 2);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(norm);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var sine = Tessellator.sign(r * h);
        
        var ver = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var norm = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            norm.push(Tessellator.vec3(s * sine, 0, c * sine).multiply(mat), Tessellator.vec3(s * sine, 0, c * sine).multiply(mat));
            
            ver.push(
                Tessellator.vec3(x + s * r, y - h, z + c * r).multiply(mat),
                Tessellator.vec3(x + s * r, y + h, z + c * r).multiply(mat)
            );
            
            tex.push(i / q, 0, i / q, 1);
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii + 1, ii, ii + 2, ii + 3, ii + 1, ii + 2);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(norm);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    };
};

Tessellator.Model.prototype.drawFullCilinder = Tessellator.Model.prototype.drawCilinder;

Tessellator.Model.prototype.fillFullCilinder = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4],
            q = Math.max(8, Math.ceil(r * 8));
        
        this.fillCilinder(x, y, z, r, h, q);
        this.fillCircle(x, y - h / 2, z, r, Tessellator.vec3(0, -1, 0), q);
        this.fillCircle(x, y - h / 2, z, r, Tessellator.vec3(0, 1, 0), q);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4],
            q = arguments[5];
        
        this.fillCilinder(x, y, z, r, h, q);
        this.fillCircle(x, y - h / 2, z, r, Tessellator.vec3(0, -1, 0), q);
        this.fillCircle(x, y - h / 2, z, r, Tessellator.vec3(0, 1, 0), q);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4],
            vec = arguments[5],
            q = arguments[6];
        
        this.fillCilinder(x, y, z, r, h, vec, q);
        this.fillOval(x, y - h / 2, z, r, vec.clone().negate(), q);
        this.fillOval(x, y - h / 2, z, r, vec, q);
    };
};

Tessellator.Model.prototype.drawCone = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            q = Math.max(8, Math.ceil(r * 8));
        
        var ver = new Tessellator.Array([x, y + h, z]);
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(x + s * r, y - h, z + c * r);
            
            if (i !== q){
                indices.push(i, i + 1, 0, i);
            }else{
                indices.push(i, 1, 0, i);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            q = arguments[5];
        
        var ver = new Tessellator.Array([x, y + h, z]);
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(x + s * r, y - h, z + c * r);
            
            if (i !== q){
                indices.push(i, i + 1, 0, i);
            }else{
                indices.push(i, 1, 0, i);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var ver = new Tessellator.Array(Tessellator.vec3(x, y + h, z).multiply(mat));
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(Tessellator.vec3(x + s * r, y - h, z + c * r).multiply(mat));
            
            if (i !== q){
                indices.push(i, i + 1, 0, i);
            }else{
                indices.push(i, 1, 0, i);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(ver);
        this.end(indices);
    };
};

Tessellator.Model.prototype.fillCone = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            q = Math.max(8, Math.ceil(r * 8));
        
        var ver = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var norm = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            norm.push(s, 0, c, s, 0, c);
            ver.push(
                x + s * r, y - h, z + c * r,
                x, y + h, z
            );
            tex.push(i / q, 0, i / q, 1);
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii + 1, ii, ii + 2, ii + 3, ii + 1, ii + 2);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(norm);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            q = arguments[5];
        
        var ver = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var norm = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            norm.push(s, 0, c, s, 0, c);
            ver.push(
                x + s * r, y - h, z + c * r,
                x, y + h, z
            );
            tex.push(i / q, 0, i / q, 1);
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii + 1, ii, ii + 2, ii + 3, ii + 1, ii + 2);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(norm);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            h = arguments[4] / 2,
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var ver = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var norm = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            norm.push(s, 0, c, s, 0, c);
            ver.push(
                Tessellator.vec3(x + s * r, y - h, z + c * r).multiply(mat),
                Tessellator.vec3(x, y + h, z).multiply(mat)
            );
            tex.push(i / q, 0, i / q, 1);
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii + 1, ii, ii + 2, ii + 3, ii + 1, ii + 2);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(norm);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    };
};

Tessellator.Model.prototype.drawHalfCone = function (){
    if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            h = arguments[5] / 2,
            q = Math.max(8, Math.ceil(Math.max(rx, ry) * 8));
        
        var ver = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * rx, y - h, z + c * rx,
                x + s * ry, y + h, z + c * ry
            );
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii, ii + 1, ii, ii + 2, ii + 1, ii + 3);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            h = arguments[5] / 2,
            q = arguments[6];
        
        var ver = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                x + s * rx, y - h, z + c * rx,
                x + s * ry, y + h, z + c * ry
            );
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii, ii + 1, ii, ii + 2, ii + 1, ii + 3);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 8){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            h = arguments[5] / 2,
            vec = arguments[6],
            q = arguments[7];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var ver = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            ver.push(
                Tessellator.vec3(x + s * rx, y - h, z + c * rx).multiply(mat),
                Tessellator.vec3(x + s * ry, y + h, z + c * ry).multiply(mat)
            );
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii, ii + 1, ii, ii + 2, ii + 1, ii + 3);
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(ver);
        this.end(indices);
    };
};

Tessellator.Model.prototype.fillHalfCone = function (){
    if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            h = arguments[5] / 2,
            q = Math.max(8, Math.ceil(Math.max(rx, ry) * 8));
        
        var ver = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var norm = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            norm.push(s, 0, c, s, 0, c);
            ver.push(
                x + s * rx, y - h, z + c * rx,
                x + s * ry, y + h, z + c * ry
            );
            tex.push(i / q, 0, i / q, 1);
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii + 1, ii, ii + 2, ii + 3, ii + 1, ii + 2);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(norm);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            h = arguments[5] / 2,
            q = arguments[6];
        
        var ver = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var norm = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            norm.push(s, 0, c, s, 0, c);
            ver.push(
                x + s * rx, y - h, z + c * rx,
                x + s * ry, y + h, z + c * ry
            );
            tex.push(i / q, 0, i / q, 1);
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii + 1, ii, ii + 2, ii + 3, ii + 1, ii + 2);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(norm);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    }else if (arguments.length === 8){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            rx = arguments[3],
            ry = arguments[4],
            h = arguments[5] / 2,
            vec = arguments[6],
            q = arguments[7];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 1, 0));
        
        var ver = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var norm = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i <= q; i++){
            var a = i / q * Math.PI * 2,
                s = Math.sin(a),
                c = Math.cos(a);
            
            norm.push(s, 0, c, s, 0, c);
            ver.push(
                Tessellator.vec3(x + s * rx, y - h, z + c * rx).multiply(mat),
                Tessellator.vec3(x + s * ry, y + h, z + c * ry).multiply(mat)
            );
            tex.push(i / q, 0, i / q, 1);
            
            var ii = i * 2;
            
            if (i !== q){
                indices.push(ii + 1, ii, ii + 2, ii + 3, ii + 1, ii + 2);
            };
        };
        
        this.start(Tessellator.NORMAL);
        this.setVertex(norm);
        this.end();
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(ver);
        this.end(indices);
    };
};

Tessellator.Model.prototype.drawTorus = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            s = arguments[4],
            q = Math.max(32, r * s * 32);
        
        var vec = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii <= q; ii++){
                for (var k = 1; k >= 0; k--){
                    var ss = (i + k) % q + .5,
                        tt = ii % q,
                        
                        sss = Math.sin(ss / q * Math.PI * 2),
                        ssc = Math.cos(ss / q * Math.PI * 2),
                        
                        tts = Math.sin(tt / q * Math.PI * 2),
                        ttc = Math.cos(tt / q * Math.PI * 2);
                    
                    vec.push(
                        x + (1 + ssc * s) * ttc * r,
                        y + (1 + ssc * s) * tts * r,
                        z + sss * s * r
                    );
                };
                
                if (ii < q){
                    var iii = ii * 2 + i * (q + 1) * 2;
                    
                    indices.push(iii, iii + 1, iii, iii + 2, iii + 3, iii + 2, iii + 3, iii + 1);
                };
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(vec);
        this.end(indices);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            s = arguments[4],
            q = arguments[5];
        
        var vec = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii <= q; ii++){
                for (var k = 1; k >= 0; k--){
                    var ss = (i + k) % q + .5,
                        tt = ii % q,
                        
                        sss = Math.sin(ss / q * Math.PI * 2),
                        ssc = Math.cos(ss / q * Math.PI * 2),
                        
                        tts = Math.sin(tt / q * Math.PI * 2),
                        ttc = Math.cos(tt / q * Math.PI * 2);
                    
                    vec.push(
                        x + (1 + ssc * s) * ttc * r,
                        y + (1 + ssc * s) * tts * r,
                        z + sss * s * r
                    );
                };
                
                if (ii < q){
                    var iii = ii * 2 + i * (q + 1) * 2;
                    
                    indices.push(iii, iii + 1, iii, iii + 2, iii + 3, iii + 2, iii + 3, iii + 1);
                };
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(vec);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            s = arguments[4],
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 0, 1));
        
        var vec = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii <= q; ii++){
                for (var k = 1; k >= 0; k--){
                    var ss = (i + k) % q + .5,
                        tt = ii % q,
                        
                        sss = Math.sin(ss / q * Math.PI * 2),
                        ssc = Math.cos(ss / q * Math.PI * 2),
                        
                        tts = Math.sin(tt / q * Math.PI * 2),
                        ttc = Math.cos(tt / q * Math.PI * 2);
                    
                    vec.push(Tessellator.vec3(
                        x + (1 + ssc * s) * ttc * r,
                        y + (1 + ssc * s) * tts * r,
                        z + sss * s * r).multiply(mat)
                    );
                };
                
                if (ii < q){
                    var iii = ii * 2 + i * (q + 1) * 2;
                    
                    indices.push(iii, iii + 1, iii, iii + 2, iii + 3, iii + 2, iii + 3, iii + 1);
                };
            };
        };
        
        this.start(Tessellator.LINE);
        this.setVertex(vec);
        this.end(indices);
    };
};

Tessellator.Model.prototype.fillTorus = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            s = arguments[4],
            q = Math.max(32, r * s * 32);
        
        var vec = new Tessellator.Array();
        var nor = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii <= q; ii++){
                for (var k = 1; k >= 0; k--){
                    var ss = (i + k) % q + .5,
                        tt = ii % q,
                        
                        sss = Math.sin(ss / q * Math.PI * 2),
                        ssc = Math.cos(ss / q * Math.PI * 2),
                        
                        tts = Math.sin(tt / q * Math.PI * 2),
                        ttc = Math.cos(tt / q * Math.PI * 2);
                    
                    nor.push(ssc * ttc, ssc * tts, sss);
                    
                    vec.push(
                        x + (1 + ssc * s) * ttc * r,
                        y + (1 + ssc * s) * tts * r,
                        z + sss * s * r
                    );
                    
                    tex.push(
                        (i + k) / q,
                        tt / q
                    );
                };
                
                if (ii < q){
                    var iii = ii * 2 + i * (q + 1) * 2;
                    
                    indices.push(iii + 1, iii + 3, iii + 2, iii + 1, iii + 2, iii);
                };
            };
        };
        
        this.setVertex(Tessellator.TEXTURE, tex);
        this.setVertex(Tessellator.NORMAL, nor);
        this.setVertex(Tessellator.INDICES, indices);
        this.setVertex(Tessellator.TRIANGLE, vec);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            s = arguments[4],
            q = arguments[5];
        
        var vec = new Tessellator.Array();
        var nor = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii <= q; ii++){
                for (var k = 1; k >= 0; k--){
                    var ss = (i + k) % q + .5,
                        tt = ii % q,
                        
                        sss = Math.sin(ss / q * Math.PI * 2),
                        ssc = Math.cos(ss / q * Math.PI * 2),
                        
                        tts = Math.sin(tt / q * Math.PI * 2),
                        ttc = Math.cos(tt / q * Math.PI * 2);
                    
                    nor.push(ssc * ttc, ssc * tts, sss);
                    
                    vec.push(
                        x + (1 + ssc * s) * ttc * r,
                        y + (1 + ssc * s) * tts * r,
                        z + sss * s * r
                    );
                    
                    tex.push(
                        (i + k) / q,
                        tt / q
                    );
                };
                
                if (ii < q){
                    var iii = ii * 2 + i * (q + 1) * 2;
                    
                    indices.push(iii + 1, iii + 3, iii + 2, iii + 1, iii + 2, iii);
                };
            };
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.NORMAL);
        this.setVertex(nor);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vec);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            s = arguments[4],
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 0, 1));
        
        var vec = new Tessellator.Array();
        var nor = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii <= q; ii++){
                for (var k = 1; k >= 0; k--){
                    var ss = (i + k) % q + .5,
                        tt = ii % q,
                        
                        sss = Math.sin(ss / q * Math.PI * 2),
                        ssc = Math.cos(ss / q * Math.PI * 2),
                        
                        tts = Math.sin(tt / q * Math.PI * 2),
                        ttc = Math.cos(tt / q * Math.PI * 2);
                    
                    nor.push(Tessellator.vec3(ssc * ttc, ssc * tts, sss).multiply(mat));
                    
                    vec.push(Tessellator.vec3(
                        x + (1 + ssc * s) * ttc * r,
                        y + (1 + ssc * s) * tts * r,
                        z + sss * s * r).multiply(mat)
                    );
                    
                    tex.push(
                        (i + k) / q,
                        tt / q
                    );
                };
                
                if (ii < q){
                    var iii = ii * 2 + i * (q + 1) * 2;
                    
                    indices.push(iii + 1, iii + 3, iii + 2, iii + 1, iii + 2, iii);
                };
            };
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.NORMAL);
        this.setVertex(nor);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vec);
        this.end(indices);
    };
};

Tessellator.Model.prototype.drawInverseTorus = Tessellator.Model.prototype.drawTorus;

Tessellator.Model.prototype.fillInverseTorus = function (){
    if (arguments.length === 5){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            s = arguments[4],
            q = Math.max(32, r * s * 32);
        
        var vec = new Tessellator.Array();
        var nor = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii <= q; ii++){
                for (var k = 1; k >= 0; k--){
                    var ss = (i + k) % q + .5,
                        tt = ii % q,
                        
                        sss = Math.sin(ss / q * Math.PI * 2),
                        ssc = Math.cos(ss / q * Math.PI * 2),
                        
                        tts = Math.sin(tt / q * Math.PI * 2),
                        ttc = Math.cos(tt / q * Math.PI * 2);
                    
                    nor.push(-ssc * ttc, -ssc * tts, -sss);
                    
                    vec.push(
                        x + (1 + ssc * s) * ttc * r,
                        y + (1 + ssc * s) * tts * r,
                        z + sss * s * r
                    );
                    
                    tex.push(
                        (i + k) / q,
                        tt / q
                    );
                };
                
                if (ii < q){
                    var iii = ii * 2 + i * (q + 1) * 2;
                    
                    indices.push(iii + 3, iii + 1, iii + 2, iii + 2, iii + 1, iii);
                };
            };
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.NORMAL);
        this.setVertex(nor);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vec);
        this.end(indices);
    }else if (arguments.length === 6){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            s = arguments[4],
            q = arguments[5];
        
        var vec = new Tessellator.Array();
        var nor = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii <= q; ii++){
                for (var k = 1; k >= 0; k--){
                    var ss = (i + k) % q + .5,
                        tt = ii % q,
                        
                        sss = Math.sin(ss / q * Math.PI * 2),
                        ssc = Math.cos(ss / q * Math.PI * 2),
                        
                        tts = Math.sin(tt / q * Math.PI * 2),
                        ttc = Math.cos(tt / q * Math.PI * 2);
                    
                    nor.push(-ssc * ttc, -ssc * tts, -sss);
                    
                    vec.push(
                        x + (1 + ssc * s) * ttc * r,
                        y + (1 + ssc * s) * tts * r,
                        z + sss * s * r
                    );
                    
                    tex.push(
                        (i + k) / q,
                        tt / q
                    );
                };
                
                if (ii < q){
                    var iii = ii * 2 + i * (q + 1) * 2;
                    
                    indices.push(iii + 3, iii + 1, iii + 2, iii + 2, iii + 1, iii);
                };
            };
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.NORMAL);
        this.setVertex(nor);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vec);
        this.end(indices);
    }else if (arguments.length === 7){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2],
            r = arguments[3],
            s = arguments[4],
            vec = arguments[5],
            q = arguments[6];
        
        var mat = Tessellator.mat3().align(vec, Tessellator.vec3(0, 0, 1));
        
        var vec = new Tessellator.Array();
        var nor = new Tessellator.Array();
        var tex = new Tessellator.Array();
        var indices = [];
        
        for (var i = 0; i < q; i++){
            for (var ii = 0; ii <= q; ii++){
                for (var k = 1; k >= 0; k--){
                    var ss = (i + k) % q + .5,
                        tt = ii % q,
                        
                        sss = Math.sin(ss / q * Math.PI * 2),
                        ssc = Math.cos(ss / q * Math.PI * 2),
                        
                        tts = Math.sin(tt / q * Math.PI * 2),
                        ttc = Math.cos(tt / q * Math.PI * 2);
                    
                    nor.push(Tessellator.vec3(-ssc * ttc, -ssc * tts, -sss).multiply(mat));
                    
                    vec.push(Tessellator.vec3(
                        x + (1 + ssc * s) * ttc * r,
                        y + (1 + ssc * s) * tts * r,
                        z + sss * s * r).multiply(mat)
                    );
                    
                    tex.push(
                        (i + k) / q,
                        tt / q
                    );
                };
                
                if (ii < q){
                    var iii = ii * 2 + i * (q + 1) * 2;
                    
                    indices.push(iii + 3, iii + 1, iii + 2, iii + 2, iii + 1, iii);
                };
            };
        };
        
        this.start(Tessellator.TEXTURE);
        this.setVertex(tex);
        this.end();
        
        this.start(Tessellator.NORMAL);
        this.setVertex(nor);
        this.end();
        
        this.start(Tessellator.TRIANGLE);
        this.setVertex(vec);
        this.end(indices);
    };
};

Tessellator.Model.prototype.plotPoint = function (){
    if (arguments.length === 2){
        var x = arguments[0],
            y = arguments[1];
        
        this.start(Tessellator.POINT);
        this.setVertex(x, y, 0);
        this.end();
    }else if (arguments.length === 3){
        var x = arguments[0],
            y = arguments[1],
            z = arguments[2];
        
        this.start(Tessellator.POINT);
        this.setVertex(x, y, z);
        this.end();
    };
};