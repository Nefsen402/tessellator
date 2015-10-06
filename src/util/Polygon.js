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

Tessellator.Polygon = function (vertices){
    this.vertices = vertices;
};

Tessellator.Polygon.prototype.getNormal = function (){
    var normal = Tessellator.vec3();
    var poly = this.vertices;
    
    for (var i = 0; i < poly.length; i += 3){
        normal[0] += (poly[i + 1] - poly[(i + 4) % poly.length]) * (poly[i + 2] + poly[(i + 5) % poly.length]);
        normal[1] += (poly[i + 2] - poly[(i + 5) % poly.length]) * (poly[i + 0] + poly[(i + 3) % poly.length]);
        normal[2] += (poly[i + 0] - poly[(i + 3) % poly.length]) * (poly[i + 1] + poly[(i + 4) % poly.length]);
    };
    
    return normal.normalize();
};

Tessellator.Polygon.prototype.convert2D = function (normal){
    if (!normal){
        normal = this.getNormal();
    };
    
    var up = normal.clone().normalize();
    var right, backward;
    
    if (Math.abs(normal[0]) > Math.abs(normal[2])){
        right = up.clone().cross(Tessellator.vec3(0, 0, 1));
    }else{
        right = up.clone().cross(Tessellator.vec3(1, 0, 0));
    };
    right.normalize();
    backward = right.clone().cross(up);
    
    var mat = Tessellator.mat3(
        backward[0], right[0], up[0],
        backward[1], right[1], up[1],
        backward[2], right[2], up[2]
    );
    
    var poly = this.vertices;
    var dPoly = new Float32Array(poly.length / 3 * 2);
    
    for (var i = 0; i < poly.length / 3; i++){
        var v = Tessellator.vec3(poly[i * 3], poly[i * 3 + 1], poly[i * 3 + 2]).multiply(mat);
        
        dPoly[i * 2] = v[0];
        dPoly[i * 2 + 1] = v[1];
    };
    
    this.vertices = dPoly;
};

Tessellator.Polygon.prototype.convertToTriangles = function (off, avl){
    var poly = this.vertices;
    
    off = off || 0;
    
    var indices = new Tessellator.Array(16);
    
    if (!avl){
        avl = new Array(poly.length / 2);
        
        for (var i = 0; i < avl.length; i++){
            avl[i] = i;
        };
    }else if (avl.constructor !== Array){
        var arr = new Array(avl);
        
        for (var i = 0; i < avl.length; i++){
            arr[i] = avl[i];
        };
        
        avl = arr;
    };
    
    main:for (var i = 0; avl.length > 3 && i < avl.length; i++){
        var i0 = avl[(i + 0) % avl.length],
            i1 = avl[(i + 1) % avl.length],
            i2 = avl[(i + 2) % avl.length],
            
            ax = poly[i0 * 2],  ay = poly[i0 * 2 + 1],
            bx = poly[i1 * 2],  by = poly[i1 * 2 + 1],
            cx = poly[i2 * 2],  cy = poly[i2 * 2 + 1];
        
        if ((bx - ax) * (cy - by) - (by - ay) * (cx - bx) >= 0){
            var area = -by * cx + ay * (-bx + cx) + ax * (by - cy) + bx * cy;
            
            for (var ii = 0; ii < avl.length; (ii === i - 1) ? ii += 3 : ii++){
                var p = avl[ii];
                
                var s = (ay * cx - ax * cy + (cy - ay) * poly[p * 2] + (ax - cx) * poly[p * 2 + 1]) / area;
                var t = (ax * by - ay * bx + (ay - by) * poly[p * 2] + (bx - ax) * poly[p * 2 + 1]) / area;
                
                if (s >= 0 && t >= 0 && s + t < 1){
                    continue main;
                };
            };
            
            indices.push(i0 + off, i1 + off, i2 + off);
            avl.splice((i + 1) % avl.length, 1);
            i = -1;
        };
    };
    
    indices.push(avl[0] + off, avl[1] + off, avl[2] + off);
    return indices;
};
