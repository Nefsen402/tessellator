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

Tessellator.Initializer.setDefault("color", function () {
    return Tessellator.DEFAULT_COLOR;
});

Tessellator.Initializer.setDefault("color255", function () {
    return Tessellator.DEFAULT_COLOR.clone().multiply(255);
});

Tessellator.Model.prototype.setColor = function (){
    return this.add(new Tessellator.ColorSet(Tessellator.getColor(arguments)));
};

Tessellator.ColorSet = function (color){
    this.type = Tessellator.COLOR;
    
    this.color = color;
};


Tessellator.ColorSet.prototype.init = function (interpreter){
    if (interpreter.shape){
        throw "cannot change color while drawing";
    };
    
    if (interpreter.get("draw") !== Tessellator.COLOR){
        interpreter.flush();
        
        interpreter.set("draw", Tessellator.COLOR);
    };
    
    interpreter.set("textureBounds", null);
    interpreter.set("color", this.color);
    interpreter.set("color255", this.color.clone().multiply(255));
    
    return null;
};

Tessellator.ColorSet.prototype.apply = function (matrix){
    matrix.removeDefinition("USE_TEXTURE");
};