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

Tessellator.prototype.createModelFromObj = function (text, obj){
    if (!text){
        throw "obj model must be given";
    }
    
    var v = new Tessellator.Array();
    var vt = new Tessellator.Array();
    var vn = new Tessellator.Array();
    var vert = new Tessellator.Array();
    var tex = new Tessellator.Array();
    var norm = new Tessellator.Array();
    
    var pos = -1;
    var nextLine;
    
    var unse = 0;
    
    if (!obj){
        obj = new Tessellator.Object(this, Tessellator.TRIANGLE);
    }
    
    do{
        nextLine = text.indexOf("\n", ++pos)
        
        if (nextLine < 0){
            nextLine = text.length;
        }
        
        var s = text.indexOf(" ", pos);
        var type = text.substring(pos, s++).trim();
        
        if (type == "v"){
            var oldPos = s;
            
            while (true){
                if (s >= nextLine){
                    break;
                }else{
                    oldPos = s;
                }
                
                s = Math.min(nextLine, text.indexOf(" ", s));
                
                if (s === -1){
                    s = text.length;
                }
                
                var vv = text.substring(oldPos, s).trim();
                if (vv.length) v.push(parseFloat(vv));
                
                s++;
            }
        }else if (type == "vn"){
            var oldPos = s;
            
            while (true){
                if (s >= nextLine){
                    break;
                }else{
                    oldPos = s;
                }
                
                s = Math.min(nextLine, text.indexOf(" ", s));
                
                if (s === -1){
                    s = text.length;
                }
                
                var vv = text.substring(oldPos, s).trim();
                if (vv.length) vn.push(parseFloat(vv));
                
                s++;
            }
        }else if (type == "vt"){
            var oldPos = s;
            
            while (true){
                if (s >= nextLine){
                    break;
                }else{
                    oldPos = s;
                }
                
                s = Math.min(nextLine, text.indexOf(" ", s));
                
                if (s === -1){
                    s = text.length;
                }
                
                var vv = text.substring(oldPos, s).trim();
                if (vv.length) vt.push(parseFloat(vv));
                
                s++;
            }
        }else if (type == "f"){
            var oldPos = s;
            
            var av = new Tessellator.Array(16);
            
            while (true){
                if (s >= nextLine){
                    break;
                }else{
                    oldPos = s;
                }
                
                s = Math.min(nextLine, text.indexOf(" ", s));
                
                if (s === -1){
                    s = text.length;
                }
                
                var l = text.substring(oldPos, s).split("/");
                
                if (l.length === 3){
                    if (l[1].length){
                        var i1 = parseInt(l[0]) - 1;
                        var i2 = parseInt(l[1]) - 1;
                        var i3 = parseInt(l[2]) - 1;
                        
                        av.push(v.get(i1 * 3), v.get(i1 * 3 + 1), v.get(i1 * 3 + 2));
                        tex.push(vt.get(i2 * 2), vt.get(i2 * 2 + 1));
                        norm.push(vn.get(i3 * 3), vn.get(i3 * 3 + 1), vn.get(i3 * 3 + 2));
                    }else{
                        var i1 = parseInt(l[0]) - 1;
                        var i3 = parseInt(l[2]) - 1;
                        
                        av.push(v.get(i1 * 3), v.get(i1 * 3 + 1), v.get(i1 * 3 + 2));
                        norm.push(vn.get(i3 * 3), vn.get(i3 * 3 + 1), vn.get(i3 * 3 + 2));
                    }
                }else if (l.length === 2){
                    var i1 = parseInt(l[0]) - 1;
                    var i2 = parseInt(l[1]) - 1;
                    
                    av.push(v.get(i1 * 3), v.get(i1 * 3 + 1), v.get(i1 * 3 + 2));
                    tex.push(vt.get(i2 * 2), vt.get(i2 * 2 + 1));
                }else if (length === 1){
                    var i1 = parseInt(l[0]) - 1;
                    
                    av.push(v.get(i1 * 3), v.get(i1 * 3 + 1), v.get(i1 * 3 + 2));
                }
                
                s++;
            }
            
            if (av.length){
                var tri = new Tessellator.Polygon(av.combine());
                tri.convert2D();
                obj.getIndices().push(tri.convertToTriangles(vert.length / 3));
                vert.push(av);
            }
        }
    }while ((pos = nextLine) < text.length);
    
    obj.setAttribute("position", Tessellator.VEC3, vert, Float32Array);
    obj.setAttribute("color", Tessellator.VEC2, tex, Float32Array);
    obj.setAttribute("normal", Tessellator.VEC3, norm, Float32Array);
    obj.upload();
    
    return obj;
};

Tessellator.prototype.loadObjModel = function (url, obj){
    if (!obj){
        obj = new Tessellator.Object(this, Tessellator.TRIANGLE);
    }
    
    var self = this;
    
    Tessellator.getRemoteText(url, function (text){
        self.createModelFromObj(text, obj);
    });
    
    return obj;
};