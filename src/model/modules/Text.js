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

Tessellator.DEFAULT_FONT_SHEET = {
    src: "font.png",
    width: 16,
    height: 16,
    
    filter: Tessellator.TEXTURE_FILTER_LINEAR_CLAMP,
    
    //If this was not block text, this table would be used.
    //every value is from 1 to 0.
    widthTable: null,
};

Tessellator.createHandle.push(function () {
    this.DEFAULT_FONT_SHEET = {};
    
    for (var attrib in Tessellator.DEFAULT_FONT_SHEET){
        this.DEFAULT_FONT_SHEET[attrib] = Tessellator.DEFAULT_FONT_SHEET[attrib];
    };
});

Tessellator.Initializer.setDefault("fontSheet", function (interpreter) {
    return interpreter.tessellator.DEFAULT_FONT_SHEET;
});

Tessellator.Model.prototype.drawText = function (text, x, y){
    return this.add (new Tessellator.Text(this, text, x, y));
};

Tessellator.Text = function (matrix, text, x, y){
    this.type = Tessellator.TEXT;
    
    this.matrix = matrix;
    this.text = text;
    this.x = x;
    this.y = y;
};


Tessellator.Text.prototype.init = function (interpreter){
    if (this.text.length > 0){
        var fontSheet = interpreter.get("fontSheet");
        
        if (!fontSheet.texture){
            fontSheet.texture = interpreter.tessellator.createTexture(fontSheet.src, fontSheet.filter);
            fontSheet.texture.disposable = false;
        };
        
        var vertexTable = [];
        var textureCoordTable = [];
        var normals = [];
        
        var xOrigin = 0;
        var yOrigin = 0;
        
        if (this.x !== undefined && this.y !== undefined){
            xOrigin = this.x;
            yOrigin = this.y;
        };
        
        var xOffset = xOrigin;
        var yOffset = yOrigin;
        
        main:for (var i = 0, k = 0, l = this.text.length; i + k < l; i++){
            var j;
            
            w:while (true){
                j = i + k;
                
                if (i + k < l - 1){
                    if ((this.text.charAt(j) === '\r' && this.text.charAt(j + 1) === '\n') ||
                        (this.text.charAt(j) === '\n' && this.text.charAt(j + 1) === '\r')){
                        yOffset++;
                        xOffset = -i + xOrigin;
                        
                        k += 2;
                    }else if (this.text.charAt(j) === '\n' ||
                              this.text.charAt(j) === '\r'){
                        yOffset++;
                        xOffset = -i;
                        
                        k++;
                    }else{
                        break w;
                    };
                }else if (this.text.charAt(j) === '\n' ||
                          this.text.charAt(j) === '\r'){
                    break main;
                }else{
                    break w;
                };
            };
            
            var code = this.text.charCodeAt(j);
            
            var charWidth = 1;
            
            if (fontSheet.widthTable){
                charWidth = fontSheet.widthTable[code];
            };
            
            if (this.text.charAt(j) === ' '){
                k++;
                xOffset += charWidth;
                
                code = this.text.charCodeAt(j + 1);
                
                if (fontSheet.widthTable){
                    charWidth = fontSheet.widthTable[code];
                };
            };
            
            var cX = code % fontSheet.width;
            var cY = fontSheet.height - Math.floor(code / fontSheet.height);
            
            Array.prototype.push.apply(textureCoordTable, [
                1 / fontSheet.width * cX,
                1 / fontSheet.height * (cY - 1),
                1 / fontSheet.width * (cX + charWidth),
                1 / fontSheet.height * (cY - 1),
                1 / fontSheet.width * (cX + charWidth),
                1 / fontSheet.height * cY,
                1 / fontSheet.width * cX,
                1 / fontSheet.height * cY,
            ]);
            
            
            Array.prototype.push.apply(vertexTable, [
                          + xOffset, -1 - yOffset, 0,
                charWidth + xOffset, -1 - yOffset, 0,
                charWidth + xOffset,    - yOffset, 0,
                          + xOffset,    - yOffset, 0,
            ]);
            
            if (!interpreter.lightingEnabled){
                Array.prototype.push.apply (normals, [
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0,
                ]);
            }else{
                Array.prototype.push.apply (normals, [
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1,
                    0, 0, -1,
                ]);
            };
            
            xOffset += charWidth;
        };
        
        this.matrix.bindTexture(fontSheet.texture);
        this.matrix.setMask(interpreter.get("color"));
        
        this.matrix.start(Tessellator.TEXTURE);
        this.matrix.setVertex(textureCoordTable);
        this.matrix.end(textureCoordTable);
        
        this.matrix.start(Tessellator.NORMAL);
        this.matrix.setVertex(normals);
        this.matrix.end();
        
        this.matrix.start(Tessellator.QUAD);
        this.matrix.setVertex(vertexTable);
        this.matrix.end();
    };
    
    return null;
};