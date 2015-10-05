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

Tessellator.Geometry.registerCustomGeometry(Tessellator.QUAD_STRIP, Tessellator.TRIANGLE, function (g, add, arg){
    var indices = g.indices;
    var vertices = g.positions;
    
    var tb = arg.get("textureBounds");
    
    if (indices.length){
        var newIndices = Tessellator.Array();
        var k = g.indices.combine(Uint32Array);
        
        var off = add ? add.positions.length / 3 : 0;
        
        for (var i = 0; i < k.length; i += 2){
            var
                i0 = k[i + 0],
                i1 = k[i + 1],
                i2 = k[i + 2],
                i3 = k[i + 3];
            
            newIndices.push([
                i0 + off,
                i1 + off,
                i2 + off,
                
                i0 + off,
                i2 + off,
                i3 + off
            ]);
        }
        
        g.indices = newIndices;
        
        if (add && add.positions.length){
            if (add.normals.length){
                g.generateNormals();
            }
        }
    }else{
        var off = add ? add.positions.length / 3 : 0;
        
        for (var i = 0, k = vertices.length / 3; i < k; i += 2){
            g.indices.push([
                0 + i + off,
                1 + i + off,
                2 + i + off,
                
                0 + i + off,
                2 + i + off,
                3 + i + off
            ]);
            
            if (tb){
                var bounds;
                
                if (tb.defaultBounds){
                    bounds = [
                                   0,            0,
                        tb.bounds[0],            0,
                        tb.bounds[0], tb.bounds[1],
                                   0, tb.bounds[1]
                    ];
                }else{
                    bounds = tb.bounds.subarray(i * 2, (i + 4) * 2);
                }
                
                g.colors.push(bounds);
            }
        }
    }
});