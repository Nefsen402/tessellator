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

Tessellator.OrthographicView = function (){
    this.type = Tessellator.VIEW;
    this.args = arguments.length;
    
    if (this.args === 1){
        this.farView = Tessellator.DEFAULT_FAR_VIEW;
        this.nearView = Tessellator.DEFAULT_NEAR_VIEW;
        
        var v = arguments[0];
        
        this.left = -v;
        this.right = v;
        this.up = -v;
        this.down = v;
    }else if (this.args === 2){
        this.right = arguments[0];
        this.up = -arguments[1];
        
        this.farView = Tessellator.DEFAULT_FAR_VIEW;
        this.nearView = Tessellator.DEFAULT_NEAR_VIEW;
    }else if (this.args === 4){
        this.left = arguments[0];
        this.right = arguments[1];
        this.up = arguments[2];
        this.down = arguments[3];
        
        this.farView = Tessellator.DEFAULT_FAR_VIEW;
        this.nearView = Tessellator.DEFAULT_NEAR_VIEW;
    }else if (this.args === 5){
        this.left = arguments[0];
        this.right = arguments[1];
        this.up = arguments[2];
        this.down = arguments[3];
        
        this.farView = arguments[4];
        
        this.nearView = Tessellator.DEFAULT_NEAR_VIEW;
    }else if (this.args === 6){
        this.left = arguments[0];
        this.right = arguments[1];
        this.up = arguments[2];
        this.down = arguments[3];
        
        this.farView = arguments[4];
        this.nearView = arguments[5];
    }else{
        throw "invalid arguments!";
    }
}

Tessellator.OrthographicView.prototype.apply = function (render){
    var
        left = this.left,
        right = this.right,
        up = this.up,
        down = this.down;
    
    if (this.args === 1){
        var window = render.get("window");
        
        if (window[1] > window[0]){
            var aspect = window[1] / window[0];
            
            up *= aspect;
            down *= aspect;
        }else{
            var aspect = window[0] / window[1];
            
            left *= aspect;
            right *= aspect;
        }
    }
    
    render.set("nearView", this.nearView);
    render.set("farView", this.farView);
    
    var
        dx = 1 / (left - right),
        dy = 1 / (up - down),
        dz = 1 / (this.nearView - this.farView);
    
    render.set("pMatrix", Tessellator.mat4(
        -2 * dx, 0, 0, 0,
        0, -2 * dy, 0, 0,
        0, 0, 2 * dz, 0,
        (left + right) * dx, (down + up) * dy, (this.farView + this.nearView) * dz, 1
    ));
}


Tessellator.OrthographicView.prototype.init = function (interpreter){
    interpreter.flush();
}