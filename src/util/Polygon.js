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
    }
    
    return normal.normalize();
};

Tessellator.Polygon.prototype.convert2D = function (normal){
    if (!normal){
        normal = this.getNormal();
    }
    
    var up = normal.clone().normalize();
    var right, backward;
    
    if (Math.abs(normal[0]) > Math.abs(normal[2])){
        right = up.cross(Tessellator.vec3(0, 0, 1));
    }else{
        right = up.cross(Tessellator.vec3(1, 0, 0));
    }
    right.normalize();
    backward = right.clone().cross(up);
    
    var mat = Tessellator.mat4(
        right[0], up[0], backward[0], 0,
        right[1], up[1], backward[1], 0,
        right[2], up[2], backward[2], 0,
        0, 0, 0, 1
    );
    
    var poly = this.vertices;
    var dPoly = new Float32Array(poly.length / 3 * 2);
    
    for (var i = 0; i < poly.length / 3; i++){
        var v = Tessellator.vec4(poly[i * 3], poly[i * 3 + 1], poly[i * 3 + 2], 1);
        v.multiply(mat);
        
        dPoly[i * 2] = v[0];
        dPoly[i * 2 + 1] = v[1];
    }
    
    this.vertices = dPoly;
};

Tessellator.Polygon.prototype.convertToTriangles = function (off){
    var poly = this.vertices;
    var points = poly.length / 2;
    
    off = off || 0;
    
    if (points <= 2){
        throw "not a complete polygon";
    }
    
    var indices = new Tessellator.Array(16);
    
    var avl = new Array(points);
    for (var i = 0; i < points; i++){
        avl[i] = i;
    }
    
    for (var i = 0; i < 3 * avl.length || avl.length >= 6; i++){
        var
            i0 = avl[(i + 0) % avl.length],
            i1 = avl[(i + 1) % avl.length],
            i2 = avl[(i + 2) % avl.length],
            
            ax = poly[i0 * 2],  ay = poly[i0 * 2 + 1],
            bx = poly[i1 * 2],  by = poly[i1 * 2 + 1],
            cx = poly[i2 * 2],  cy = poly[i2 * 2 + 1];
        
        if ((ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0){
            for (var ii = 0; ii < avl.length; (ii === i - 1) ? ii += 3 : ii++){
                var
                    p = avl[ii],
                
                    v0x = cx              - ax,
                    v0y = cy              - ay,
                    v1x = bx              - ax,
                    v1y = by              - ay,
                    v2x = poly[p * 2 + 0] - ax,
                    v2y = poly[p * 2 + 1] - ay,
                
                    dot00 = v0x * v0x + v0y * v0y,
                    dot01 = v0x * v1x + v0y * v1y,
                    dot02 = v0x * v2x + v0y * v2y,
                    dot11 = v1x * v1x + v1y * v1y,
                    dot12 = v1x * v2x + v1y * v2y;
                
                var d = dot00 * dot11 - dot01 * dot01;
                var u = (dot11 * dot02 - dot01 * dot12) / d;
                var v = (dot00 * dot12 - dot01 * dot02) / d;
                
                if (u >= 0 && v >= 0 && u + v < 1){
                    break;
                }
            }
            
            indices.push(i0 + off, i1 + off, i2 + off);
            avl.splice((i + 1) % avl.length, 1);
            i = -1;
        }
    }
    
    indices.push(avl[0] + off, avl[1] + off, avl[2] + off);
    return indices;
};