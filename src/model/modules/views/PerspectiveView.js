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

Tessellator.PerspectiveView = function (){
    this.type = Tessellator.VIEW;
    
    if (arguments.length === 0){
        this.FOV = Tessellator.DEFAULT_FOV;
        this.farView = Tessellator.DEFAULT_FAR_VIEW;
        this.nearView = Tessellator.DEFAULT_NEAR_VIEW;
    }else if (arguments.length === 1){
        this.FOV = arguments[0];
        
        this.farView = Tessellator.DEFAULT_FAR_VIEW;
        this.nearView = Tessellator.DEFAULT_NEAR_VIEW;
    }else if (arguments.length === 2){
        this.FOV = arguments[0];
        this.farView = arguments[1];
        
        this.nearView = Tessellator.DEFAULT_NEAR_VIEW;
    }else if (arguments.length === 3){
        this.FOV = arguments[0];
        this.farView = arguments[1];
        this.nearView = arguments[2];
    }else if (arguments.length === 4){
        this.FOV = arguments[0];
        this.farView = arguments[1];
        this.nearView = arguments[2];
        this.aspectRatio = arguments[3];
    }else{
        throw "too many arguments!";
    };
    
    if (!isNaN(this.FOV)){
        this.FOV = Tessellator.float(this.FOV);
    };
    
    if (this.farView < this.nearView){
        console.error("The perspective far view is shorter then the near view. This is probably not intentional. " + this.farView + ":" + this.nearView);
    };
};

Tessellator.PerspectiveView.prototype.apply = function (render){
    var aspectRatio = this.aspectRatio;
    
    render.set("viewBounds", Tessellator.vec2(this.nearView, this.farView));
    
    if (!aspectRatio){
        aspectRatio = render.get("window").aspect();
    };
    
    var f = 1 / Math.tan(this.FOV.x / 2),
        nf = this.nearView - this.farView;
    
    render.set("pMatrix", Tessellator.mat4(
        f / aspectRatio, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (this.farView + this.nearView) / nf, -1,
        0, 0, (2 * this.farView * this.nearView) / nf, 0
    ));
};
            
Tessellator.PerspectiveView.prototype.init = function (interpreter){
    interpreter.flush();
};