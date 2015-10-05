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

Tessellator.Geometry.registerCustomGeometry(Tessellator.TRIANGLE, Tessellator.TRIANGLE, function (g, add, arg){
    var tb = arg.get("textureBounds");
    
    if (g.indices.length){
        var k = g.indices.length;
        
        if (add && add.positions.length){
            if (add.normals.length){
                g.generateNormals();
            };
            
            g.indices.offset(add.positions.length / 3);
        };
        
        if (tb){
            for (var i = 0; i < k; i += 3){
                var bounds;
                
                if (textureBounds.defaultBounds){
                    bounds = [
                                   0,            0,
                        tb.bounds[0],            0,
                        tb.bounds[1], tb.bounds[1]
                    ];
                }else{
                    bounds = tb.bounds.subarray(i * 6, (i + 1) * 6);
                };
                
                this.shape.colors.push(bounds);
            };
        };
    }else{
        var k = g.positions.length / 3;
        var off = add ? add.positions.length / 3 : 0;
        
        for (var i = 0; i < k; i += 3){
            g.indices.push([
                i + 0 + off,
                i + 1 + off,
                i + 2 + off
            ]);
            
            if (tb){
                var bounds;
                
                if (textureBounds.defaultBounds){
                    bounds = [
                                   0,            0,
                        tb.bounds[0],            0,
                        tb.bounds[1], tb.bounds[1],
                    ];
                }else{
                    bounds = tb.bounds.subarray(i * 6, (i + 1) * 6);
                };
                
                this.shape.colors.push(bounds);
            };
        };
    };
});

Tessellator.Geometry.registerCustomGeometry(Tessellator.NORMAL, Tessellator.TRIANGLE, function (){});
Tessellator.Geometry.registerCustomGeometry(Tessellator.INDICES, Tessellator.TRIANGLE, function (){});
Tessellator.Geometry.registerCustomGeometry(Tessellator.TEXTURE, Tessellator.TRIANGLE, function (g, add, arg){
    if (!arg.get("textureBounds")){
        g.dispose();
    };
});