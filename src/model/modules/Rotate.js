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

Tessellator.Model.prototype.rotate = function (){
    if (arguments.length === 1 && arguments[0].constructor === Tessellator.Rotate){
        return this.add(arguments[0]);
    }else{
        return this.add(Tessellator.new.apply(Tessellator.Rotate, arguments));
    };
};

Tessellator.Model.prototype.rotateDeg = function (){
    var rotate;
    
    if (arguments.length === 1 && arguments[0].constructor === Tessellator.Rotate){
        return this.add(arguments[0]);
    }else{
        arguments[0] *= Math.PI / 180;
        
        return this.add(Tessellator.new.apply(Tessellator.Rotate, arguments));
    };
    
    return this.add(rotate);
};

Tessellator.Rotate = function (){
    this.type = Tessellator.ROTATE;
    
    if (arguments.length === 0){
        this.degree = arguments[0];
        
        this.vec = Tessellator.vec3(0, 0, 0);
    }else if (arguments.length === 1){
        this.degree = arguments[0];
        
        this.vec = Tessellator.vec3(0, 0, 0);
    }else if (arguments.length === 2){
        this.degree = arguments[0];
        
        this.vec = arguments[1];
    }else if (arguments.length === 4){
        this.degree = arguments[0];
        
        this.vec = Tessellator.vec3(arguments[1], arguments[2], arguments[3]);
    }else{
        throw "invalid arguments in Tessellator.rotate()";
    };
    
    if (!this.degree.length){
        this.degree = Tessellator.float(this.degree);
    };
};

Tessellator.Rotate.prototype.apply = function (render){
    var m = render.get("mvMatrix");
    
    this.set(m);
};

Tessellator.Rotate.prototype.applyLighting = function (matrix){
    this.set(matrix);
};

Tessellator.Rotate.prototype.set = function (m){
    m.rotate(this.degree, this.vec);
};


Tessellator.Rotate.prototype.init = function (interpreter){
    interpreter.flush();
};