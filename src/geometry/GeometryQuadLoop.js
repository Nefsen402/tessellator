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

Tessellator.Geometry.registerCustomGeometry(Tessellator.QUAD_LOOP, Tessellator.TRIANGLE, function (g){
    if (g.indices.length){
        var newIndices = new Tessellator.Array();
        var k = g.indices.combine(Uint16Array);
        
        for (var i = 0; i < k.length - 2; i += 2){
            var i0 = k[i + 0],
                i1 = k[i + 1],
                i2 = k[(i + 2) % (k + 2)],
                i3 = k[(i + 3) % (k + 2)];
            
            g.indices.push([
                i1,
                i0,
                i2,
                
                i1,
                i2,
                i3
            ]);
        };
        
        g.indices = newIndices;
    }else{
        for (var i = 0, k = g.positions.length / 3 - 2; i <= k; i += 2){
            g.indices.push([
                1 + i,
                0 + i,
                (2 + i) % (k + 2),
                
                1 + i,
                (2 + i) % (k + 2),
                (3 + i) % (k + 2)
            ]);
        };
    };
});