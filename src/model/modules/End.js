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

Tessellator.Model.prototype.end = function (indices){
    return this.add(new Tessellator.End(indices));
};

Tessellator.End = function (indices){
    this.indices = indices;
};

Tessellator.End.prototype.init = function (interpreter){
    var geometry = interpreter.getr("currentGeometry");
    var cached = interpreter.get("cachedGeometry");
    var extra = interpreter.get("extraGeometry");
    
    if (geometry === extra){
        return;
    };
    
    if (this.indices){
        geometry.indices.push(this.indices);
    };
    
    if (extra){
        geometry.forceAdd(extra);
        
        interpreter.set("extraGeometry", null);
    };
    
    geometry.convert();
    geometry.generateNormals();
    
    {
        var tex = interpreter.get("textureBounds");
        
        if (tex && tex.defaultBounds){
            geometry.generateTextureCoordinates(tex.bounds[0], tex.bounds[1]);
        };
    };
    
    if (cached){
        if (cached.disposed){
            interpreter.set("cachedGeometry", geometry);
        }else if (!cached.add(geometry)){
            interpreter.set("cachedGeometry", geometry);
            
            if (cached){
                cached.createObject(interpreter.tessellator, interpreter.get("draw"), Tessellator.STATIC);
                
                return cached;
            };
        };
    }else{
        interpreter.set("cachedGeometry", geometry)
    };
    
    return null;
};

Tessellator.Initializer.prototype.flush = function (){
    var cache = this.getr("cachedGeometry");
    
    if (cache){
        cache.createObject(this.tessellator, this.get("draw"), Tessellator.STATIC);
        this.model.push(cache);
    };
};