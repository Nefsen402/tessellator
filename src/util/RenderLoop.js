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

Tessellator.prototype.createRenderLoop = function (){
    return Tessellator.new.apply(Tessellator.RenderLoop, arguments);
};

Tessellator.RenderLoop = function (){
    if (arguments.length === 1 && arguments[0].constructor === Tessellator.RenderLoop.Item){
        this.item = arguments[0];
    }else{
        this.item = null;
            
        if (arguments.length > 0){
            this.item = Tessellator.new.apply(Tessellator.RenderLoop.Item, arguments);
        };
    };
    
    this.animate = Tessellator.getVendorIndependent(window, "requestanimationframe");
    
    if (!this.animate){
        this.usingFallback = true;
        this.setFPS(60);
        
        this.animate = function (callback){
            callback();
        };
        
        console.warn("Using a fall back render loop. Rendering at 60fps");
    };
    
    var self = this;
    
    this.renderLoop = function (currTime){
        if (self.item){
            var time = self.item.render(currTime);
            
            if (time <= 0){
                self.animationFrame = self.animate.call(window, self.renderLoop);
                self.fpswait = undefined;
            }else{
                self.animationFrame = null;
                
                self.fpswait = window.setTimeout(function (){
                    self.fpswait = undefined;
                    self.animationFrame = self.animate.call(window, self.renderLoop);
                }, time);
            };
        };
    };
    
    this.start();
};

Tessellator.RenderLoop.prototype.stop = function (){
    if (this.fpswait !== undefined){
        window.clearTimeout(this.fpswait);
    };
    
    if (this.animationFrame !== undefined){
        if (!this.usingFallback) {
            Tessellator.getVendorIndependent(window, "cancelanimationframe")(this.animationFrame);
        };
        
        this.animationFrame = undefined;
    };
    
    this.item.fps = 0;
    this.item.averageFps = 0;
};

Tessellator.RenderLoop.prototype.start = function (){
    this.item.lastFrame = Tessellator.now();
    this.item.expectedWait = 0;
    
    if (this.animationFrame === undefined){
        this.animationFrame = this.animate.call(window, this.renderLoop);
    };
};

Tessellator.RenderLoop.prototype.getFPS = function (){
    return this.item.fps;
};

Tessellator.RenderLoop.prototype.getAverageFPS = function (){
    return this.item.averageFps;
};

Tessellator.RenderLoop.prototype.setFPS = function (fps){
    if (this.usingFallback && !fps){
        throw "cannot unlock fps while fallback is being used!";
    };
    
    this.item.setFPS(fps);
};

Tessellator.RenderLoop.prototype.getRenderTime = function (){
    return this.item.renderTime;
};

Tessellator.RenderLoop.prototype.setRenderer = function (renderer){
    this.item.renderer = renderer;
};

Tessellator.RenderLoop.prototype.getRenderer = function (){
    return this.item.renderer;
};

Tessellator.RenderLoop.prototype.renderArg = function (arg){
    this.item.setRenderArg(arg);
};

Tessellator.RenderLoop.Item = function (renderer, renderArg){
    this.frames = 0;
    this.avSample = Tessellator.vec3();
    
    this.expectedWait = 0;
    
    this.fps = 0;
    this.averageFps = 0;
    this.savedTime = 0;
    
    this.renderer = arguments[0];
    this.renderArg = arguments[1];
};

Tessellator.RenderLoop.Item.prototype.setFPS = function (fps){
    this.savedTime = 0;
    this.maxFPS = fps && !isNaN(fps) ? Tessellator.float(fps) : fps;
};

Tessellator.RenderLoop.Item.prototype.setRenderArg = function (arg){
    this.renderArg = arg;
};

Tessellator.RenderLoop.Item.prototype.render = function (){
    var time = Tessellator.now();
    var ta = time - this.lastFrame;
    this.lastFrame = time;
    
    this.fps = 1000 / ta || 0;
    this.frames++;
    
    if (this.avSample[1] >= 32){
        this.avSample[2] = this.avSample[0] / 32;
        this.avSample[0] = 0;
        this.avSample[1] = 0;
    };
    
    this.avSample[0] += this.fps;
    var det = ++this.avSample[1] / 32;
    this.averageFps = this.avSample[0] / this.avSample[1] * det + (1-det) * this.avSample[2];
    
    this.renderer.render(null, this.renderArg);
    
    if (this.maxFPS){
        this.savedTime += 1000 / this.maxFPS.x + this.expectedWait - ta;
        
        var comp = Math.max(0, Math.round(this.savedTime));
        
        this.savedTime -= comp;
        
        this.expectedWait = comp;
        return comp;
    }else{
        return 0;
    };
};