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

Tessellator.prototype.createTextureDrawable = function (width, height, fliter){
    return new Tessellator.TextureDrawable(this, width, height, fliter)
}

Tessellator.TextureDrawable = function (tessellator, width, height, filter){
    this.super(tessellator, width, height, Tessellator.RGB, Tessellator.UNSIGNED_BYTE, null, filter);
    
    this.color = Tessellator.vec3(255);
}

Tessellator.copyProto(Tessellator.TextureDrawable, Tessellator.TextureData);

Tessellator.TextureDrawable.prototype.draw = function (arr, x, y, w, h){
    for (var yy = 0; yy < h; yy++){
        this.data.set(arr.subarray((h - yy - 1) * w * 3, (h - yy) * w * 3), ((this.height - (yy + y) - 1) * this.width + x) * 3);
    }
    
    this.update();
}

Tessellator.TextureDrawable.prototype.setColor = function (){
    this.color = Tessellator.getColor(arguments).multiply(255).xyz;
}

Tessellator.TextureDrawable.prototype.setPixel = function (x, y){
    if (x >= 0 && y >= 0 && x < this.width && y < this.height){
        this.data.set(this.color, ((this.height - y - 1) * this.width + x) * 3);
        
        this.update();
    }
}

Tessellator.TextureDrawable.prototype.getPixel = function (x, y){
    if (x >= 0 && y >= 0 && x < this.width && y < this.height){
        var s = ((this.height - y - 1) * this.width + x) * 3;
        
        return this.data.subarray(s, s + 3);
    }
}

Tessellator.TextureDrawable.prototype.fillRect = function (x, y, w, h){
    for (var xx = x; xx < x + w; xx++){
        for (var yy = y; yy < y + h; yy++){
            this.setPixel(xx, yy);
        }
    }
}

Tessellator.TextureDrawable.prototype.fillOval = function (x, y, w, h){
    for (var xx = x; xx < x + w; xx++){
        for (var yy = y; yy < y + h; yy++){
            var xxx = (xx - x) / w * 2 - 1;
            var yyy = (yy - y) / h * 2 - 1;
            
            if (Math.sqrt(xxx * xxx + yyy * yyy) < 1){
                this.setPixel(xx, yy);
            }
        }
    }
}

Tessellator.TextureDrawable.prototype.drawRect = function (x, y, w, h){
    this.drawLine(x, y, x + w, y);
    this.drawLine(x, y, x, y + h);
    this.drawLine(x + w, y, x + w, y + h);
    this.drawLine(x, y + h, x + w, y + h);
}

//TODO OPTIMIZATIONS
Tessellator.TextureDrawable.prototype.drawOval = function (x, y, w, h){
    var dude = function (xx, yy){
        var xxx = (xx - x) / w * 2 - 1;
        var yyy = (yy - y) / h * 2 - 1;
        
        return Math.sqrt(xxx * xxx + yyy * yyy) < 1;
    }
    
    for (var xx = x; xx < x + w; xx++){
        for (var yy = y; yy < y + h; yy++){
            if (dude(xx, yy) && (!dude(xx - 1, yy) || !dude(xx + 1, yy) || !dude(xx, yy - 1) || !dude(xx, yy + 1))){
                this.setPixel(xx, yy);
            }
        }
    }
}

Tessellator.TextureDrawable.prototype.drawLine = function (x0, y0, x1, y1){
    var
        dx = x1 - x0,
        dy = y1 - y0;
    
    if (dx === 0){
        if (dy < 0){
            dy = -dy;
            y1 = y0;
            y0 = y1 - dy;
        }
        
        for (var y = y0; y <= y1; y++){
            this.setPixel(x0, y);
        }
    }else{
        if (dx < 0){
            dx = -dx;
            x1 = x0;
            x0 = x1 - dx;
            
            dy = -dy;
            y1 = y0;
            y0 = y1 - dy;
        }
        
        var
            e = 0,
            de = Math.abs(dy / dx),
            y = y0;
        
        for (var x = x0; x <= x1; x++){
            this.setPixel(x, y);
            
            e += de;
            
            while (e >= .5){
                this.setPixel(x, y);
                y += y1 - y0 > 0 ? 1 : -1;
                e -= 1;
            }
        }
    }
}