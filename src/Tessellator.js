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


//strict mode can be used with this.
"use strict";

var Tessellator = function (canvas){
    if (!canvas){
        canvas = document.createElement("canvas");
        
        canvas.style.width = "100%";
        canvas.style.height = "100%";
    }else if (canvas.constructor === String){
        canvas = document.getElementById(canvas);
    }
    
    this.canvas = canvas;
    
    var contextArgs;
    
    if (arguments.length === 2){
        contextArgs = arguments[1];
    }else{
        contextArgs = Array.prototype.slice.call(arguments, 1);
    }
    
    if (contextArgs && contextArgs.renderTD){
        delete contextArgs.renderTD;
        
        this.renderCanvas = document.createElement("canvas");
        this.TD = this.canvas.getContext("2d");
    }else{
        this.renderCanvas = this.canvas;
    }
    
    try{
        var contexts;
        
        if (contextArgs && contextArgs.context){
            contexts = contextArgs.context;
            delete contextArgs.context;
        }else{
            contexts = [
                "webgl",
                "experimental-webgl"
            ];
        }
        
        if (contexts.length <= 0){
            throw "no contexts provided";
        }
        
        var context = null;
        
        for (var i = 0, k = contexts.length; i < k; i++){
            context = this.renderCanvas.getContext(contexts[i], contextArgs);
            
            if (context){
                this.context = contexts[i];
                break;
            }
        }
        
        if (context){
            this.GL = context;
        }else{
            var error = ["No contexts avaliable for "];
            
            for (var i = 0, k = contexts.length; i < k; i++){
                if (i === 0){
                    error.push(contexts[i]);
                }else if (i === k - 1){
                    error.push(" or ", contexts[i]);
                }else{
                    error.push(", ", contexts[i]);
                }
            }
            
            throw error.join("");
        }
        
        if (this.context == "experimental-webgl"){
            console.debug("Experimental webGL is being used!");
        }
    }catch (e){
        this.GL = null;
        
        throw "Failed to initialize Tessellator: " + e;
    }
    
    var self = this;
    
    this.forceCanvasResize = function (){
        self.originWidth = canvas.clientWidth;
        self.originHeight = canvas.clientHeight;
        
        self.width = Math.floor(self.originWidth * self.resolutionScale.x);
        self.height = Math.floor(self.originHeight * self.resolutionScale.y);
        
        if (self.renderCanvas){
            canvas.setAttribute("width", self.originWidth);
            canvas.setAttribute("height", self.originHeight);
            
            self.renderCanvas.setAttribute("width", self.width);
            self.renderCanvas.setAttribute("height", self.height);
        }else{
            canvas.setAttribute("width", self.width);
            canvas.setAttribute("height", self.height);
        }
        
        if (self.onresize){
            self.onresize(self.width, self.height);
        }
    }
    
    this.canvasResize = function () {
        if (canvas.clientWidth !== self.originWidth || canvas.clientHeight !== self.originHeight){
            self.forceCanvasResize();
        }
    }
    
    window.addEventListener("resize", this.canvasResize);
    
    this.resolutionScale = Tessellator.vec2(1);
    this.width = 0;
    this.height = 0;
    
    this.extensions = new Tessellator.Extensions(this);
    
    this.maxUniformSpace = this.GL.getParameter(this.GL.MAX_FRAGMENT_UNIFORM_VECTORS);
    this.maxTextures = this.GL.getParameter(this.GL.MAX_TEXTURE_IMAGE_UNITS);
    this.maxAttributes = this.GL.getParameter(this.GL.MAX_VERTEX_ATTRIBS);
    
    this.GL.blendFunc(Tessellator.BLEND_DEFAULT[0], Tessellator.BLEND_DEFAULT[1]);
    
    this.forceCanvasResize();
    
    //used when textures are referenced through strings. Not recommended.
    this.textureCache = {};
    this.unusedTextureID = [];
    
    this.frame = 0;
    
    this.contextID = Tessellator.contexts;
    Tessellator.contexts++;
    
    this.resources = [];
    this.resources.total = 0;
    
    this.resources.remove = function (resource){
        this.splice(this.indexOf(resource), 1);
    }
    
    this.resources.push = function (resource){
        resource.RESOURCE_TRACK = this.total++;
        
        this[this.length] = resource;
    }
    
    
    for (var i = 0; i < Tessellator.createHandle.length; i++){
        Tessellator.createHandle[i].call(this);
    }
}

Tessellator.VERSION = "5g beta";

Tessellator.VENDORS = [
    "",
    "WEBKIT_",
    "MOZ_",
    "O_",
    "MS_",
    "webkit",
    "moz",
    "o",
    "ms"
];

if (window.module){
    window.module.exports = Tessellator;
}

Tessellator.prototype.frameBuffer = null;
Tessellator.prototype.boundTexture = null;

Tessellator.contexts = 0;
Tessellator.createHandle = [];

Tessellator.prototype.dispose = function (){
   while (this.resources.length){
       this.resources[this.resources.length - 1].dispose();
   }
}

Tessellator.prototype.setResolutionScale = function (scale){
    if (scale.constructor === Tessellator.vec2){
        this.resolutionScale = scale;
    }else{
        this.resolutionScale = Tessellator.vec2(scale);
    }
    
    this.forceCanvasResize();
}

Tessellator.prototype.printLowLevelAccess = function (func){
    var self = this;
    
    if (func){
        var origional = this.GL[func];
        
        this.GL[func] = function (){
            var str = "GL " + func + ": [";
            
            for (var i = 0; i < arguments.length; i++){
                if (i == 0){
                    str += arguments[i];
                }else{
                    str += ", " + arguments[i];
                }
            }
            
            str += "]";
            
            console.debug(str);
            return origional.apply(self.GL, arguments);
        }
    }else{
        for (var o in this.GL){
            if (typeof(this.GL[o]) == "function"){
                this.printLowLevelAccess(o);
            }
        }
    }
}

Tessellator.prototype.countLowLevelAccess = function (func){
    this.gledits = 0;
    
    var self = this;
    
    if (func){
        var origional = this.GL[func];
        
        this.GL[func] = function (){
            self.gledits++;
            
            return origional.apply(self.GL, arguments);
        }
    }else{
        for (var o in this.GL){
            if (typeof(this.GL[o]) == "function"){
                this.countLowLevelAccess(o);
            }
        }
    }
}

Tessellator.prototype.getDataURL = function (){
    return this.canvas.toDataURL.apply(this.canvas, arguments);
}

Tessellator.prototype.preRender = function (){
    this.frame++;
    
    this.canvasResize();
    
    if (this.TD){
        this.TD.clearRect(0, 0, this.originWidth, this.originHeight);
    }
}

Tessellator.prototype.postRender = function (){
    if (this.TD){
        this.TD.drawImage(this.renderCanvas, 0, 0, this.originWidth, this.originHeight, 0, 0, this.width, this.height);
    }
}

Tessellator.prototype.super_preRender = Tessellator.prototype.preRender;
Tessellator.prototype.super_postRender = Tessellator.prototype.postRender;