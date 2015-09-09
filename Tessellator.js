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
 * This is a interface created by Alex Orzechowski. This allows easier
 * access to the power of WebGL without needing any knowledge in WebGL.
 * All while retaining low-level access to the underlying API.
 * 
 * Currently in beta stage. Changes can and will be made to the core mechanic
 * making this not backwards compatible.
 * 
 * Github: https://github.com/Need4Speed402/tessellator
 */


//strict mode can be used with this.
"use strict";

{ //tessellator constructor
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
            
            self.width = self.originWidth * self.resolutionScale;
            self.height = self.originHeight * self.resolutionScale;
            
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
        
        this.resolutionScale = 1;
        this.width = 0;
        this.height = 0;
        
        this.extensions = new Tessellator.Extensions(this);
        
        this.maxUniformSpace = this.GL.getParameter(this.GL.MAX_FRAGMENT_UNIFORM_VECTORS);
        this.maxTextures = this.GL.getParameter(this.GL.MAX_TEXTURE_IMAGE_UNITS);
        this.maxAttributes = this.GL.getParameter(this.GL.MAX_VERTEX_ATTRIBS);
        
        this.GL.clearDepth(1.0);
        this.GL.enable(this.GL.DEPTH_TEST);
        this.GL.enable(this.GL.CULL_FACE);
        this.GL.enable(this.GL.BLEND);
        this.GL.blendFunc(Tessellator.BLEND_DEFAULT[0], Tessellator.BLEND_DEFAULT[1]);
        this.GL.depthFunc(this.GL.LEQUAL);
        
        this.forceCanvasResize();
        
        //used when textures are referenced through strings. Not recommended.
        this.textureCache = {};
        this.unusedTextureID = [];
        
        this.frame = 0;
        
        this.contextID = Tessellator.contexts;
        Tessellator.contexts++;
        
        this.resources = [];
        
        this.resources.remove = function (resource){
            this.splice(this.indexOf(resource), 1);
        }
        
        for (var i = 0; i < Tessellator.createHandle.length; i++){
            Tessellator.createHandle[i].call(this);
        }
    }
    
    Tessellator.VERSION = "4b beta";
    
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
        this.resolutionScale = scale;
        
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
}
{ //function constants / helper classes
    for (var o in WebGLRenderingContext.prototype){
        if (o.toUpperCase() == o){
            var obj = WebGLRenderingContext.prototype[o];
            
            Tessellator[o] = obj;
        }
    }
    
    { //util
        (function () {
            var Factory = function (constructor, args) {
                return constructor.apply(this, args);
            }


            Tessellator.new = function() {
                Factory.prototype = this.prototype;
                return new Factory(this, arguments);
            }
            
            Tessellator.extend = function (o, o2){
                var newproto = Object.create(o2.prototype);
                
                newproto.super = function (){
                    this.super = o2.prototype.super;
                    o2.apply(this, arguments);
                    
                    var instance = {};
                    var self = this;
                    var level = newproto;
                    
                    for (var oo in o2.prototype){
                        (function (obj){
                            instance[obj] = function (){
                                level.__proto__.SUPER_WILDCARD = level;
                                level = level.__proto__;
                                
                                level[obj].apply(self, arguments);
                                
                                level = level.SUPER_WILDCARD;
                            }
                        })(oo);
                    }
                    
                    this.super = instance;
                }
                
                newproto.constructor = o;
                
                o.prototype = newproto;
            }
        })();
        
        Tessellator.copyProto = Tessellator.extend;
        
        Tessellator.Extensions = function (tessellator){
            this.extensions = {};
            this.tessellator = tessellator;
            
            var avaliable = tessellator.GL.getSupportedExtensions();
            
            for (var i = 0; i < avaliable.length; i++){
                this.extensions[avaliable[i]] = undefined;
            }
        }
        
        Tessellator.Extensions.prototype.get = function (key){
            var c = this.extensions[key];
            
            if (c === undefined){
                c = this.tessellator.GL.getExtension(key) || this.tessellator.GL.getExtension("MOS_" + key) || this.tessellator.GL.getExtension("WEBKIT_" + key);
                
                if (!c){
                    c = undefined;
                }
                
                this.extensions[key] = c;
            }
            
            return c;
        }
        
        Tessellator.EMPTY_FUNC = function () {}
        
        Tessellator.getSourceText = function(elem, notify){
            if (!elem){
                return;
            }
            
            if (elem.getAttribute("src")){
                return Tessellator.getRemoteText(elem.getAttribute("src"), notify);
            }else{
                var code = [];
                
                for (var i = 0; i < elem.childNodes.length; i++){
                    if (elem.childNodes[i].nodeType === elem.childNodes[i].TEXT_NODE){
                        code.push(elem.childNodes[i].textContent);
                    }
                }
                
                if (notify){
                    notify(code.join(""));
                }else{
                    return code.join("");
                }
            }
        }
        
        Tessellator.getRemoteText = function(src, notify){
            if (!src){
                return;
            }
            
            var request = new XMLHttpRequest();
            
            if (notify){
                request.open("GET", src, true);
                
                request.onreadystatechange = function () {
                    if (request.readyState === 4){
                        if (request.status < 200 || request.status >= 300){
                            console.error("Unable to load resource: " + src + ", server responded with: " + request.status + " (" + request.statusText + ")");
                        }else{
                            notify(request.responseText);
                        }
                    }
                }
                
                request.send();
            }else{
                request.open("GET", src, false);
                request.send();
                
                return request.responseText;
            }
        }
        
        Tessellator.getFirstDomFromType = function (dom, type){
            for (var i = 0, k = dom.childNodes.length; i < k; i++){
                if (type.constructor === Array){
                    for (var ii = 0, kk = type.length; ii < kk; ii++){
                        if (dom.childNodes[i].type === type[ii]){
                            return dom.childNodes[i];
                        }
                    }
                }else if (dom.childNodes[i].type === type){
                    return dom.childNodes[i];
                }
            }
        }
        
        Tessellator.getColor = function (data){
            var color;
            
            if (data.length === 0){
                color = Tessellator.vec4();
            }else if (data.length === 4){
                color = Tessellator.vec4(data[0], data[1], data[2], data[3]);
            }else if (data.length === 3){
                color = Tessellator.vec4(data[0], data[1], data[2], 1);
            }else if (data.length === 2){
                color = Tessellator.vec4(data[0], data[0], data[0], data[1]);
            }else if (data.length === 1){
                var arg = data[0];
                
                if (!isNaN(arg)){
                    var red = ((arg >> 16) & 0xFF) / 255;
                    var green = ((arg >> 8) & 0xFF) / 255;
                    var blue = ((arg >> 0) & 0xFF) / 255;
                    
                    color = Tessellator.vec4(red, green, blue, 1);
                }else if (arg.constructor === Tessellator.vec4){
                    color = arg;
                }else if (arg.constructor === Tessellator.vec3){
                    color = Tessellator.vec4(arg, 1);
                }else if (arg.constructor === Array){
                    color = Tessellator.vec4(arg);
                }else if (arg.constructor === Tessellator.Color){
                    color = arg;
                }else if (arg.length === 9 && arg.chatAt(0) === '#'){
                    var red = parseInt(arg.substring(1, 3), 16) / 256;
                    var green = parseInt(arg.substring(3, 5), 16) / 256;
                    var blue = parseInt(arg.substring(5, 7), 16) / 256;
                    var alpha = parseInt(arg.substring(7, 9), 16) / 256;
                    
                    color = Tessellator.vec4(red, green, blue, alpha);
                }else if (arg.length === 7 && arg.charAt(0) === '#'){
                    var red = parseInt(arg.substring(1, 3), 16) / 256;
                    var green = parseInt(arg.substring(3, 5), 16) / 256;
                    var blue = parseInt(arg.substring(5, 7), 16) / 256;
                    
                    color = Tessellator.vec4(red, green, blue, 1);
                }else if (arg.length === 4 && arg.charAt(0) === '#'){
                    var red = parseInt(arg.substring(1, 2), 16) / 16;
                    var green = parseInt(arg.substring(2, 3), 16) / 16;
                    var blue = parseInt(arg.substring(3, 4), 16) / 16;
                    
                    color = Tessellator.vec4(red, green, blue, 1);
                }else if (arg.length === 5 && arg.charAt(0) === '#'){
                    var red = parseInt(arg.substring(1, 2), 16) / 16;
                    var green = parseInt(arg.substring(2, 3), 16) / 16;
                    var blue = parseInt(arg.substring(3, 4), 16) / 16;
                    var alpha = parseInt(arg.substring(4, 5), 16) / 16;
                    
                    color = Tessellator.vec4(red, green, blue, alpha);
                }else{
                    color = Tessellator.COLORS[arg.toUpperCase()];
                }
            }else{
                throw "too many arguments: " + data.length;
            }
            
            return color;
        }
    }
    { //mat4
        Tessellator.mat4 = function (){
            var array = new Float32Array(16);
            
            var pos = 0;
            
            for (var i = 0, k = arguments.length; i < k; i++){
                var arg = arguments[i];
                
                if (typeof arg != "number"){
                    array.set(arg, pos);
                    pos += arg.length;
                }else{
                    array[pos++] = arg;
                }
            }
            
            if (pos === 1){
                array[5] = array[0];
                array[10] = array[0];
                array[15] = array[0];
            }else if (pos !== 0){
                if (pos < array.length){
                    throw "too little information";
                }else if (pos > array.length){
                    throw "too much information";
                }
            }
            
            array.__proto__ = Tessellator.mat4.prototype;
            
            return array;
        }
        
        Tessellator.mat4.prototype = Object.create(Float32Array.prototype);
        Tessellator.mat4.prototype.constructor = Tessellator.mat4;
        
        Tessellator.mat4.prototype.random = function (scale){
            if (scale === undefined){
                scale = Tessellator.float(1);
            }else if (scale.tween){
                scale.tween.update();
            }
            
            this[ 0] = Math.random() * scale[0];
            this[ 1] = Math.random() * scale[0];
            this[ 2] = Math.random() * scale[0];
            this[ 3] = Math.random() * scale[0];
            
            this[ 4] = Math.random() * scale[0];
            this[ 5] = Math.random() * scale[0];
            this[ 6] = Math.random() * scale[0];
            this[ 7] = Math.random() * scale[0];
            
            this[ 8] = Math.random() * scale[0];
            this[ 9] = Math.random() * scale[0];
            this[10] = Math.random() * scale[0];
            this[11] = Math.random() * scale[0];
            
            this[12] = Math.random() * scale[0];
            this[13] = Math.random() * scale[0];
            this[14] = Math.random() * scale[0];
            this[15] = Math.random() * scale[0];
            
            return this;
        }
        
        Tessellator.mat4.prototype.clone = function (){
            return Tessellator.mat4(this);
        }
        
        Tessellator.mat4.prototype.copy = function (copy){
            if (copy.constructor === Tessellator.mat4){
                this.set(copy);
            }else if (copy.constructor === Tessellator.mat3){
                this[ 0] = copy[0];
                this[ 1] = copy[1];
                this[ 2] = copy[2];
                this[ 3] = 0;
                
                this[ 4] = copy[3];
                this[ 5] = copy[4];
                this[ 6] = copy[5];
                this[ 7] = 0;
                
                this[ 8] = copy[6];
                this[ 9] = copy[7];
                this[10] = copy[8];
                this[11] = 0;
                
                this[12] = 0;
                this[13] = 0;
                this[14] = 0;
                this[15] = 1;
            }else if (copy.constructor === Tessellator.mat2){
                this[ 0] = copy[0];
                this[ 1] = copy[1];
                this[ 2] = 0;
                this[ 3] = 0;
                
                this[ 4] = copy[2];
                this[ 5] = copy[3];
                this[ 6] = 0;
                this[ 7] = 0;
                
                this[ 8] = 0;
                this[ 9] = 0;
                this[10] = 1;
                this[11] = 0;
                
                this[12] = 0;
                this[13] = 0;
                this[14] = 0;
                this[15] = 1;
            }else{
                throw "invalid arguments";
            }
            
            return this;
        }
        
        Tessellator.mat4.prototype.multiply = function (mat){
            if (mat.constructor === Tessellator.mat4){
                var
                    x00 = this[ 0],
                    x01 = this[ 1],
                    x02 = this[ 2],
                    x03 = this[ 3],
                    x10 = this[ 4],
                    x11 = this[ 5],
                    x12 = this[ 6],
                    x13 = this[ 7],
                    x20 = this[ 8],
                    x21 = this[ 9],
                    x22 = this[10],
                    x23 = this[11],
                    x30 = this[12],
                    x31 = this[13],
                    x32 = this[14],
                    x33 = this[15],
                    
                    y00 = mat[ 0],
                    y01 = mat[ 1],
                    y02 = mat[ 2],
                    y03 = mat[ 3],
                    y10 = mat[ 4],
                    y11 = mat[ 5],
                    y12 = mat[ 6],
                    y13 = mat[ 7],
                    y20 = mat[ 8],
                    y21 = mat[ 9],
                    y22 = mat[10],
                    y23 = mat[11],
                    y30 = mat[12],
                    y31 = mat[13],
                    y32 = mat[14],
                    y33 = mat[15];
                
                this[ 0] = y00 * x00 + y01 * x10 + y02 * x20 + y03 * x30;
                this[ 1] = y00 * x01 + y01 * x11 + y02 * x21 + y03 * x31;
                this[ 2] = y00 * x02 + y01 * x12 + y02 * x22 + y03 * x32;
                this[ 3] = y00 * x03 + y01 * x13 + y02 * x23 + y03 * x33;
                
                this[ 4] = y10 * x00 + y11 * x10 + y12 * x20 + y13 * x30;
                this[ 5] = y10 * x01 + y11 * x11 + y12 * x21 + y13 * x31;
                this[ 6] = y10 * x02 + y11 * x12 + y12 * x22 + y13 * x32;
                this[ 7] = y10 * x03 + y11 * x13 + y12 * x23 + y13 * x33;
                
                this[ 8] = y20 * x00 + y21 * x10 + y22 * x20 + y23 * x30;
                this[ 9] = y20 * x01 + y21 * x11 + y22 * x21 + y23 * x31;
                this[10] = y20 * x02 + y21 * x12 + y22 * x22 + y23 * x32;
                this[11] = y20 * x03 + y21 * x13 + y22 * x23 + y23 * x33;
                
                this[12] = y30 * x00 + y31 * x10 + y32 * x20 + y33 * x30;
                this[13] = y30 * x01 + y31 * x11 + y32 * x21 + y33 * x31;
                this[14] = y30 * x02 + y31 * x12 + y32 * x22 + y33 * x32;
                this[15] = y30 * x03 + y31 * x13 + y32 * x23 + y33 * x33;
            }else if (mat.constructor === Tessellator.mat3){
                var
                    x00 = this[ 0],
                    x01 = this[ 1],
                    x02 = this[ 2],
                    x03 = this[ 3],
                    x10 = this[ 4],
                    x11 = this[ 5],
                    x12 = this[ 6],
                    x13 = this[ 7],
                    x20 = this[ 8],
                    x21 = this[ 9],
                    x22 = this[10],
                    x23 = this[11],
                    
                    y00 = mat[0],
                    y01 = mat[1],
                    y02 = mat[2],
                    
                    y10 = mat[3],
                    y11 = mat[4],
                    y12 = mat[5],
                    
                    y20 = mat[6],
                    y21 = mat[7],
                    y22 = mat[8];
                
                this[ 0] = y00 * x00 + y01 * x10 + y02 * x20;
                this[ 1] = y00 * x01 + y01 * x11 + y02 * x21;
                this[ 2] = y00 * x02 + y01 * x12 + y02 * x22;
                this[ 3] = y00 * x03 + y01 * x13 + y02 * x23;
                
                this[ 4] = y10 * x00 + y11 * x10 + y12 * x20;
                this[ 5] = y10 * x01 + y11 * x11 + y12 * x21;
                this[ 6] = y10 * x02 + y11 * x12 + y12 * x22;
                this[ 7] = y10 * x03 + y11 * x13 + y12 * x23;
                
                this[ 8] = y20 * x00 + y21 * x10 + y22 * x20;
                this[ 9] = y20 * x01 + y21 * x11 + y22 * x21;
                this[10] = y20 * x02 + y21 * x12 + y22 * x22;
                this[11] = y20 * x03 + y21 * x13 + y22 * x23;
            }else if (mat.constructor === Tessellator.mat2){
                var
                    x00 = this[ 0],
                    x01 = this[ 1],
                    x02 = this[ 2],
                    x03 = this[ 3],
                    x10 = this[ 4],
                    x11 = this[ 5],
                    x12 = this[ 6],
                    x13 = this[ 7],
                    
                    y00 = mat3[0],
                    y01 = mat3[1],
                    
                    y10 = mat3[2],
                    y11 = mat3[3];
                
                this[ 0] = y00 * x00 + y01 * x10;
                this[ 1] = y00 * x01 + y01 * x11;
                this[ 2] = y00 * x02 + y01 * x12;
                this[ 3] = y00 * x03 + y01 * x13;
                
                this[ 4] = y10 * x00 + y11 * x10;
                this[ 5] = y10 * x01 + y11 * x11;
                this[ 6] = y10 * x02 + y11 * x12;
                this[ 7] = y10 * x03 + y11 * x13;
            }else{
                throw "invalid arguments";
            }
            
            return this;
        }
        
        Tessellator.mat4.prototype.transpose = function (){
            var
                x01 = this[ 1],
                x02 = this[ 2],
                x03 = this[ 3],
                
                x10 = this[ 4],
                x12 = this[ 6],
                x13 = this[ 7],
                
                x20 = this[ 8],
                x21 = this[ 9],
                x23 = this[11],
                
                x30 = this[12],
                x31 = this[13],
                x32 = this[14];
            
            this[ 1] = x10;
            this[ 2] = x20;
            this[ 3] = x30;
            
            this[ 4] = x01;
            this[ 6] = x21;
            this[ 7] = x31;
            
            this[ 8] = x02;
            this[ 9] = x12;
            this[11] = x32;
            
            this[12] = x03;
            this[13] = x13;
            this[14] = x23;
            
            return this;
        }
        
        Tessellator.mat4.prototype.invert = function (){
            var
                x00 = this[ 0],
                x01 = this[ 1],
                x02 = this[ 2],
                x03 = this[ 3],
                x10 = this[ 4],
                x11 = this[ 5],
                x12 = this[ 6],
                x13 = this[ 7],
                x20 = this[ 8],
                x21 = this[ 9],
                x22 = this[10],
                x23 = this[11],
                x30 = this[12],
                x31 = this[13],
                x32 = this[14],
                x33 = this[15];
            
            var
                y00 = x00 * x11 - x01 * x10,
                y01 = x00 * x12 - x02 * x10,
                y02 = x00 * x13 - x03 * x10,
                y03 = x01 * x12 - x02 * x11,
                y04 = x01 * x13 - x03 * x11,
                y05 = x02 * x13 - x03 * x12,
                y06 = x20 * x31 - x21 * x30,
                y07 = x20 * x32 - x22 * x30,
                y08 = x20 * x33 - x23 * x30,
                y09 = x21 * x32 - x22 * x31,
                y10 = x21 * x33 - x23 * x31,
                y11 = x22 * x33 - x23 * x32;
            
            var d = y00 * y11 - y01 * y10 + y02 * y09 + y03 * y08 - y04 * y07 + y05 * y06;
            
            this[ 0] = (x11 * y11 - x12 * y10 + x13 * y09) / d;
            this[ 1] = (x02 * y10 - x01 * y11 - x03 * y09) / d;
            this[ 2] = (x31 * y05 - x32 * y04 + x33 * y03) / d;
            this[ 3] = (x22 * y04 - x21 * y05 - x23 * y03) / d;
            this[ 4] = (x12 * y08 - x10 * y11 - x13 * y07) / d;
            this[ 5] = (x00 * y11 - x02 * y08 + x03 * y07) / d;
            this[ 6] = (x32 * y02 - x30 * y05 - x33 * y01) / d;
            this[ 7] = (x20 * y05 - x22 * y02 + x23 * y01) / d;
            this[ 8] = (x10 * y10 - x11 * y08 + x13 * y06) / d;
            this[ 9] = (x01 * y08 - x00 * y10 - x03 * y06) / d;
            this[10] = (x30 * y04 - x31 * y02 + x33 * y00) / d;
            this[11] = (x21 * y02 - x20 * y04 - x23 * y00) / d;
            this[12] = (x11 * y07 - x10 * y09 - x12 * y06) / d;
            this[13] = (x00 * y09 - x01 * y07 + x02 * y06) / d;
            this[14] = (x31 * y01 - x30 * y03 - x32 * y00) / d;
            this[15] = (x20 * y03 - x21 * y01 + x22 * y00) / d;
            
            return this;
        }
        
        Tessellator.mat4.prototype.adjoint = function(joint) {
            var
                a00 = joint[ 0],
                a01 = joint[ 1],
                a02 = joint[ 2],
                a03 = joint[ 3],
                a10 = joint[ 4],
                a11 = joint[ 5],
                a12 = joint[ 6],
                a13 = joint[ 7],
                a20 = joint[ 8],
                a21 = joint[ 9],
                a22 = joint[10],
                a23 = joint[11],
                a30 = joint[12],
                a31 = joint[13],
                a32 = joint[14],
                a33 = joint[15];


            this[ 0] =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
            this[ 1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
            this[ 2] =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
            this[ 3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
            this[ 4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
            this[ 5] =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
            this[ 6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
            this[ 7] =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
            this[ 8] =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
            this[ 9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
            this[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
            this[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
            this[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
            this[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
            this[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
            this[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
            
            return this;
        }
        
        Tessellator.mat4.prototype.translate = function (vec3){
            if (vec3.tween){
                vec3.tween.update();
            }
            
            this[12] += this[ 0] * vec3[0] + this[ 4] * vec3[1] + this[ 8] * vec3[2];
            this[13] += this[ 1] * vec3[0] + this[ 5] * vec3[1] + this[ 9] * vec3[2];
            this[14] += this[ 2] * vec3[0] + this[ 6] * vec3[1] + this[10] * vec3[2];
            this[15] += this[ 3] * vec3[0] + this[ 7] * vec3[1] + this[11] * vec3[2];
            
            return this;
        }
        
        Tessellator.mat4.prototype.identity = function (){
            this[ 0] = 1;
            this[ 1] = 0;
            this[ 2] = 0;
            this[ 3] = 0;
            
            this[ 4] = 0;
            this[ 5] = 1;
            this[ 6] = 0;
            this[ 7] = 0;
            
            this[ 8] = 0;
            this[ 9] = 0;
            this[10] = 1;
            this[11] = 0;
            
            this[12] = 0;
            this[13] = 0;
            this[14] = 0;
            this[15] = 1;
            
            return this;
        }
        
        Tessellator.mat4.prototype.scale = function (vec3){
            if (vec3.tween){
                vec3.tween.update();
            }
            
            this[ 0] *= vec3[0];
            this[ 1] *= vec3[0];
            this[ 2] *= vec3[0];
            this[ 3] *= vec3[0];
            
            this[ 4] *= vec3[1];
            this[ 5] *= vec3[1];
            this[ 6] *= vec3[1];
            this[ 7] *= vec3[1];
            
            this[ 8] *= vec3[2];
            this[ 9] *= vec3[2];
            this[10] *= vec3[2];
            this[11] *= vec3[2];
            
            return this;
        }
        
        Tessellator.mat4.prototype.rotate = function (rot, vec3){
            if (rot.tween){
                rot.tween.update();
            }
            
            if (vec3.tween){
                vec3.tween.update();
            }
            
            //normalize
            var
                x = vec3[0],
                y = vec3[1],
                z = vec3[2],
                
                l = Math.sqrt(x * x + y * y + z * z);
            x /= l;
            y /= l;
            z /= l;
            
            var
                s = Math.sin(rot[0]),
                c = Math.cos(rot[0]),
                t = 1 - c,
                
                a00 = this[ 0],
                a01 = this[ 1],
                a02 = this[ 2],
                a03 = this[ 3],
                
                a10 = this[ 4],
                a11 = this[ 5],
                a12 = this[ 6],
                a13 = this[ 7],
                
                a20 = this[ 8],
                a21 = this[ 9],
                a22 = this[10],
                a23 = this[11],
                
                b00 = x * x * t + c,
                b01 = y * x * t + z * s,
                b02 = z * x * t - y * s,
                
                b10 = x * y * t - z * s,
                b11 = y * y * t + c,
                b12 = z * y * t + x * s,
                
                b20 = x * z * t + y * s,
                b21 = y * z * t - x * s,
                b22 = z * z * t + c;
            
            this[ 0] = a00 * b00 + a10 * b01 + a20 * b02;
            this[ 1] = a01 * b00 + a11 * b01 + a21 * b02;
            this[ 2] = a02 * b00 + a12 * b01 + a22 * b02;
            this[ 3] = a03 * b00 + a13 * b01 + a23 * b02;
            this[ 4] = a00 * b10 + a10 * b11 + a20 * b12;
            this[ 5] = a01 * b10 + a11 * b11 + a21 * b12;
            this[ 6] = a02 * b10 + a12 * b11 + a22 * b12;
            this[ 7] = a03 * b10 + a13 * b11 + a23 * b12;
            this[ 8] = a00 * b20 + a10 * b21 + a20 * b22;
            this[ 9] = a01 * b20 + a11 * b21 + a21 * b22;
            this[10] = a02 * b20 + a12 * b21 + a22 * b22;
            this[11] = a03 * b20 + a13 * b21 + a23 * b22;
            
            return this;
        }
        
        Tessellator.mat4.prototype.rotateX = function (rad) {
            if (rad.tween){
                rad.tween.update();
            }
            
            var s = Math.sin(rad[0]),
                c = Math.cos(rad[0]);
            
            var
                x10 = this[4],
                x11 = this[5],
                x12 = this[6],
                x13 = this[7];
            
            this[ 4] = this[ 4] * c + this[ 8] * s;
            this[ 5] = this[ 5] * c + this[ 9] * s;
            this[ 6] = this[ 6] * c + this[10] * s;
            this[ 7] = this[ 7] * c + this[11] * s;
            this[ 8] = this[ 8] * c - x10 * s;
            this[ 9] = this[ 9] * c - x11 * s;
            this[10] = this[10] * c - x12 * s;
            this[11] = this[11] * c - x13 * s;
            
            return this;
        }
        
        Tessellator.mat4.prototype.rotateY = function (rad) {
            if (rad.tween){
                rad.tween.update();
            }
            
            var s = Math.sin(rad[0]),
                c = Math.cos(rad[0]);
            
            //cache values
            var
                x00 = this[0],
                x01 = this[1],
                x02 = this[2],
                x03 = this[3];
            
            this[ 0] = x00 * c - this[ 8] * s;
            this[ 1] = x01 * c - this[ 9] * s;
            this[ 2] = x02 * c - this[10] * s;
            this[ 3] = x03 * c - this[11] * s;
            this[ 8] = x00 * s + this[ 8] * c;
            this[ 9] = x01 * s + this[ 9] * c;
            this[10] = x02 * s + this[10] * c;
            this[11] = x03 * s + this[11] * c;
            
            return this;
        }
        
        Tessellator.mat4.prototype.rotateZ = function (rad) {
            if (rad.tween){
                rad.tween.update();
            }
            
            var s = Math.sin(rad[0]),
                c = Math.cos(rad[0]);
            
            //cache values
            var
                x00 = this[0],
                x01 = this[1],
                x02 = this[2],
                x03 = this[3];
            
            this[0] = this[0] * c + this[4] * s;
            this[1] = this[1] * c + this[5] * s;
            this[2] = this[2] * c + this[6] * s;
            this[3] = this[3] * c + this[7] * s;
            this[4] = this[4] * c - x00 * s;
            this[5] = this[5] * c - x01 * s;
            this[6] = this[6] * c - x02 * s;
            this[7] = this[7] * c - x03 * s;
            
            return this;
        }
        
        Tessellator.mat4.prototype.toString = function (){
            var str = ["mat4("];
            
            for (var i = 0; i < 15; i++){
                str.push(this[i], ", ");
            }
            
            str.push(this[15], ")");
            
            return str.join("");
        }
    }
    { //mat3
        Tessellator.mat3 = function (){
            var array = new Float32Array(9);
            var pos = 0;
            
            for (var i = 0, k = arguments.length; i < k; i++){
                var arg = arguments[i];
                
                if (isNaN(arg)){
                    array.set(arg, pos);
                    pos += arg.length;
                }else{
                    array[pos++] = arg;
                }
            }
            
            if (pos === 1){
                array[4] = array[0];
                array[8] = array[0];
            }else if (pos !== 0){
                if (pos < array.length){
                    throw "too little information";
                }else if (pos > array.length){
                    throw "too much information";
                }
            }
            
            array.__proto__ = Tessellator.mat3.prototype;
            return array;
        }
        
        Tessellator.mat3.prototype = Object.create(Float32Array.prototype);
        Tessellator.mat3.prototype.constructor = Tessellator.mat3;
        
        Tessellator.mat3.prototype.clone = function (){
            return Tessellator.mat3(this);
        }
        
        Tessellator.mat3.prototype.copy = function (copy){
            if (copy.constructor === Tessellator.mat3){
                this.set(copy);
            }else if (copy.constructor === Tessellator.mat4){
                this[0] = copy[ 0];
                this[1] = copy[ 1];
                this[2] = copy[ 2];
                
                this[3] = copy[ 4];
                this[4] = copy[ 5];
                this[5] = copy[ 6];
                
                this[6] = copy[ 8];
                this[7] = copy[ 9];
                this[8] = copy[10];
            }else if (copy.constructor === Tessellator.mat2){
                this[0] = copy[0];
                this[1] = copy[1];
                this[2] = 0;
                
                this[3] = copy[2];
                this[4] = copy[3];
                this[5] = 0;
                
                this[6] = 0;
                this[7] = 0;
                this[8] = 1;
            }else{
                throw "invalid arguments";
            }
            
            return this;
        }
        
        Tessellator.mat3.prototype.identity = function (){
            this[0] = 1;
            this[1] = 0;
            this[2] = 0;
            
            this[3] = 0;
            this[4] = 1;
            this[5] = 0;
            
            this[6] = 0;
            this[7] = 0;
            this[8] = 1;
            
            return this;
        }
        
        Tessellator.mat3.prototype.adjoint = function (joint) {
            var
                a00 = joint[0],
                a01 = joint[1],
                a02 = joint[2],
                a10 = joint[3],
                a11 = joint[4],
                a12 = joint[5],
                a20 = joint[6],
                a21 = joint[7],
                a22 = joint[8];


            this[0] = (a11 * a22 - a12 * a21);
            this[1] = (a02 * a21 - a01 * a22);
            this[2] = (a01 * a12 - a02 * a11);
            this[3] = (a12 * a20 - a10 * a22);
            this[4] = (a00 * a22 - a02 * a20);
            this[5] = (a02 * a10 - a00 * a12);
            this[6] = (a10 * a21 - a11 * a20);
            this[7] = (a01 * a20 - a00 * a21);
            this[8] = (a00 * a11 - a01 * a10);
            
            return this;
        }
        
        Tessellator.mat3.prototype.transpose = function (){
            var
                m01 = this[1],
                m02 = this[2],
                
                m10 = this[3],
                m12 = this[5],
                
                m20 = this[6],
                m21 = this[7];
            
            this[1] = m10;
            this[2] = m20;
            
            this[3] = m01;
            this[5] = m21;
            
            this[6] = m02;
            this[7] = m12;
        }
        
        Tessellator.mat3.prototype.invert = function (){
            var
                a00 = this[0],
                a01 = this[1],
                a02 = this[2],
                
                a10 = this[3],
                a11 = this[4],
                a12 = this[5],
                
                a20 = this[6],
                a21 = this[7],
                a22 = this[8];
            
            var
                b01 = a22 * a11 - a12 * a21,
                b11 = -a22 * a10 + a12 * a20,
                b21 = a21 * a10 - a11 * a20;


            var det = a00 * b01 + a01 * b11 + a02 * b21;


            this[0] = b01                      / det;
            this[1] = (-a22 * a01 + a02 * a21) / det;
            this[2] = (a12 * a01 - a02 * a11)  / det;
            this[3] = b11                      / det;
            this[4] = (a22 * a00 - a02 * a20)  / det;
            this[5] = (-a12 * a00 + a02 * a10) / det;
            this[6] = b21                      / det;
            this[7] = (-a21 * a00 + a01 * a20) / det;
            this[8] = (a11 * a00 - a01 * a10)  / det;
        }
        
        Tessellator.mat3.prototype.normalFromMat4 = function (a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
                a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
                a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
                a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],


                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32,


                // Calculate the determinant
                det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;


            this[0] = (a11 * b11 - a12 * b10 + a13 * b09) / det;
            this[1] = (a12 * b08 - a10 * b11 - a13 * b07) / det;
            this[2] = (a10 * b10 - a11 * b08 + a13 * b06) / det;


            this[3] = (a02 * b10 - a01 * b11 - a03 * b09) / det;
            this[4] = (a00 * b11 - a02 * b08 + a03 * b07) / det;
            this[5] = (a01 * b08 - a00 * b10 - a03 * b06) / det;


            this[6] = (a31 * b05 - a32 * b04 + a33 * b03) / det;
            this[7] = (a32 * b02 - a30 * b05 - a33 * b01) / det;
            this[8] = (a30 * b04 - a31 * b02 + a33 * b00) / det;


            return this;
        }
        
        Tessellator.mat3.prototype.multiply = function (mat){
            var a00 = this[0], a01 = this[1], a02 = this[2],
                a10 = this[3], a11 = this[4], a12 = this[5],
                a20 = this[6], a21 = this[7], a22 = this[8],

                b00 = mat[0], b01 = mat[1], b02 = mat[2],
                b10 = mat[3], b11 = mat[4], b12 = mat[5],
                b20 = mat[6], b21 = mat[7], b22 = mat[8];

            this[0] = b00 * a00 + b01 * a10 + b02 * a20;
            this[1] = b00 * a01 + b01 * a11 + b02 * a21;
            this[2] = b00 * a02 + b01 * a12 + b02 * a22;

            this[3] = b10 * a00 + b11 * a10 + b12 * a20;
            this[4] = b10 * a01 + b11 * a11 + b12 * a21;
            this[5] = b10 * a02 + b11 * a12 + b12 * a22;

            this[6] = b20 * a00 + b21 * a10 + b22 * a20;
            this[7] = b20 * a01 + b21 * a11 + b22 * a21;
            this[8] = b20 * a02 + b21 * a12 + b22 * a22;
            
            return this;
        }
        
        Tessellator.mat3.prototype.translate = function (vec){
            if (vec.tween){
                vec.tween.update();
            }
            
            this[6] += vec[0] * this[0] + vec[1] * this[3];
            this[7] += vec[0] * this[1] + vec[1] * this[4];
            this[8] += vec[0] * this[2] + vec[1] * this[5];
            
            return this;
        }
        
        Tessellator.mat3.prototype.scale = function (vec){
            if (vec.tween){
                vec.tween.update();
            }
            
            this[0] *= vec[0];
            this[1] *= vec[0];
            this[2] *= vec[0];
            
            this[3] *= vec[1];
            this[4] *= vec[1];
            this[5] *= vec[1];
            
            return this;
        }
        
        Tessellator.mat3.rotate = function (rad){
            if (rad.tween){
                rad.tween.update()
            }
            
            var
                s = Math.sin(rad[0]),
                c = Math.cos(rad[0]),
                
                a00 = this[0], a01 = this[1], a02 = this[2],
                a10 = this[3], a11 = this[4], a12 = this[5];
            
            this[0] = c * a00 + s * a10;
            this[1] = c * a01 + s * a11;
            this[2] = c * a02 + s * a12;

            this[3] = c * a10 - s * a00;
            this[4] = c * a11 - s * a01;
            this[5] = c * a12 - s * a02;
            
            return this;
        }
        
        Tessellator.mat3.prototype.toString = function (){
            var str = ["mat3("];
            
            for (var i = 0; i < 8; i++){
                str.push(this[i], ", ");
            }
            
            str.push(this[8], ")");
            
            return str.join("");
        }
    }
    { //mat2
        Tessellator.mat2 = function (){
            var array = new Float32Array(4);
            var pos = 0;
            
            for (var i = 0, k = arguments.length; i < k; i++){
                var arg = arguments[i];
                
                if (isNaN(arg)){
                    array.set(arg, pos);
                    pos += arg.length;
                }else{
                    array[pos++] = arg;
                }
            }
            
            if (pos === 0){
                array[0] = 1;
                array[3] = 1;
            }else if (pos === 1){
                array[3] = array[0];
            }else{
                if (pos < array.length){
                    throw "too little information";
                }else if (pos > array.length){
                    throw "too much information";
                }
            }
            
            array.__proto__ = Tessellator.mat2.prototype;
            return array;
        }
        
        Tessellator.mat2.prototype = Object.create(Float32Array.prototype);
        Tessellator.mat2.prototype.constructor = Tessellator.mat2;
        
        Tessellator.mat2.prototype.identity = function (scale){
            if (scale === undefined){
                scale = 1;
            }else if (scale.tween){
                scale.tween.update();
            }
            
            this[0] = scale[0];
            this[1] = 0;
            
            this[2] = 0;
            this[3] = scale[0];
            
            return this;
        }
        
        Tessellator.mat2.prototype.invert = function (){
            var
                a0 = this[0],
                a1 = this[1],
                a2 = this[2],
                a3 = this[3],
                
                det = a0 * a3 - a2 * a1;
            
            this[0] =  a3 / det;
            this[1] = -a1 / det;
            this[2] = -a2 / det;
            this[2] =  a0 / det;
            
            return this;
        }
        
        Tessellator.mat2.prototype.determinant = function (){
            return this[0] * this[3] - this[2] * this[1];
        }
        
        Tessellator.mat2.prototype.adjoint = function (){
            var a0 = this[0];
            this[0] =  this[3];
            this[1] = -this[1];
            this[2] = -this[2];
            this[3] = a0;
            
            return this;
        }
        
        Tessellator.mat2.prototype.multiply = function (mat){
            var
                a0 = this[0],
                a1 = this[1],
                a2 = this[2],
                a3 = this[3],
                
                b0 = mat[0],
                b1 = mat[1],
                b2 = mat[2],
                b3 = mat[3];
            
            this[0] = a0 * b0 + a2 * b1;
            this[1] = a1 * b0 + a3 * b1;
            this[2] = a0 * b2 + a2 * b3;
            this[3] = a1 * b2 + a3 * b3;
    
            return this;
        }
        
        Tessellator.mat2.prototype.rotate = function (deg){
            if (deg.tween){
                deg.tween.update();
            }
            
            var
                a0 = this[0],
                a1 = this[1],
                a2 = this[2],
                a3 = this[3],
                
                s = Math.sin(deg[0]),
                c = Math.cos(deg[0]);
            
            this[0] = a0 *  c + a2 * s;
            this[1] = a1 *  c + a3 * s;
            this[2] = a0 * -s + a2 * c;
            this[3] = a1 * -s + a3 * c;
            
            return this;
        }
        
        Tessellator.mat2.prototype.scale = function (s){
            if (s.tween){
                s.tween.update();
            }
            
            this[0] *= s[0];
            this[1] *= s[0];
            this[2] *= s[0];
            this[3] *= s[0];
            
            return this;
        }
        
        Tessellator.mat2.prototype.copy = function (mat){
            this.set(mat);
            
            return this;
        }
        
        Tessellator.mat2.prototype.clone = function (){
            return Tessellator.mat2(this);
        }
        
        Tessellator.mat2.prototype.transpose = function (){
            var
                x01 = this[1],
                x10 = this[2];
            
            this[1] = x10;
            this[2] = x01;
            
            return this;
        }
        
        Tessellator.mat2.prototype.toString = function (){
            return "mat2(" + this[0] + ", " + this[1] + ", " + this[2] + ", " + this[3] + ")";
        }
    }
    { //vec4
        Tessellator.vec4 = function (){
            var array = new Float32Array(4);
            var pos = 0;
            
            for (var i = 0, k = arguments.length; i < k; i++){
                var arg = arguments[i];
                
                if (isNaN(arg)){
                    array.set(arg, pos);
                    pos += arg.length;
                }else{
                    array[pos++] = arg;
                }
            }
            
            if (pos === 1){
                array[1] = array[0];
                array[2] = array[0];
                array[3] = array[0];
            }else if (pos !== 0){
                if (pos < array.length){
                    throw "too little information";
                }else if (pos > array.length){
                    throw "too much information";
                }
            }
            
            array.__proto__ = Tessellator.vec4.prototype;
            
            return array;
        }
        
        Tessellator.vec4.prototype = Object.create(Float32Array.prototype);
        Tessellator.vec4.prototype.constructor = Tessellator.vec4;
        
        Tessellator.vec4.prototype.clear = function (){
            this[0] = 0;
            this[1] = 0;
            this[3] = 0;
            this[2] = 0;
        }
        
        Tessellator.vec4.prototype.clone = function (){
            return Tessellator.vec4(this);
        }
        
        Tessellator.vec4.prototype.copy = function (vec4){
            if (vec4.tween){
                vec4.tween.update();
            }
            
            this.set(vec4)
            
            return this;
        }
        
        Tessellator.vec4.prototype.exp = function(vec){
            if (this.tween) this.tween.update();
            
            if (vec.tween){
                vec.tween.update();
            }
            
            this[0] = Math.pow(this[0], vec[0]);
            this[1] = Math.pow(this[1], vec[1]);
            this[2] = Math.pow(this[2], vec[2]);
            this[3] = Math.pow(this[3], vec[3]);
            
            return this;
        }
        
        Tessellator.vec4.prototype.sqrt = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.sqrt(this[0]);
            this[1] = Math.sqrt(this[1]);
            this[2] = Math.sqrt(this[2]);
            this[3] = Math.sqrt(this[3]);
            
            return this;
        }
        
        Tessellator.vec4.prototype.inversesqrt = function (){
            if (this.tween) this.tween.update();
            
            this[0] = 1 / Math.sqrt(this[0]);
            this[1] = 1 / Math.sqrt(this[1]);
            this[2] = 1 / Math.sqrt(this[2]);
            this[3] = 1 / Math.sqrt(this[3]);
            
            return this;
        }
        
        Tessellator.vec4.prototype.abs = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.abs(this[0]);
            this[1] = Math.abs(this[1]);
            this[2] = Math.abs(this[2]);
            this[3] = Math.abs(this[3]);
            
            return this;
        }
        
        Tessellator.vec4.prototype.sign = function (){
            if (this.tween) this.tween.update();
            
            this[0] = this[0] < 0 ? 1 : (this[0] > 0 ? -1 : this[0]);
            this[1] = this[1] < 0 ? 1 : (this[1] > 0 ? -1 : this[1]);
            this[2] = this[2] < 0 ? 1 : (this[2] > 0 ? -1 : this[2]);
            this[3] = this[3] < 0 ? 1 : (this[3] > 0 ? -1 : this[3]);
            
            return this;
        }
        
        Tessellator.vec4.prototype.step = function (edge){
            if (this.tween) this.tween.update();
            
            if (edge.tween){
                edge.tween.update();
            }
            
            if (edge.length === 4){
                this[0] = this[0] < edge[0] ? 0 : 1;
                this[1] = this[1] < edge[1] ? 0 : 1;
                this[2] = this[2] < edge[2] ? 0 : 1;
                this[3] = this[3] < edge[3] ? 0 : 1;
            }else{
                this[0] = this[0] < edge[0] ? 0 : 1;
                this[1] = this[1] < edge[0] ? 0 : 1;
                this[2] = this[2] < edge[0] ? 0 : 1;
                this[3] = this[3] < edge[0] ? 0 : 1;
            }
            
            return this;
        }
        
        Tessellator.vec4.prototype.floor = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.floor(this[0]);
            this[1] = Math.floor(this[1]);
            this[2] = Math.floor(this[2]);
            this[3] = Math.floor(this[3]);
            
            return this;
        }
        
        Tessellator.vec4.prototype.ceil = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.ceil(this[0]);
            this[1] = Math.ceil(this[1]);
            this[2] = Math.ceil(this[2]);
            this[3] = Math.ceil(this[3]);
            
            return this;
        }
        
        Tessellator.vec4.prototype.mod = function (vec){
            if (this.tween) this.tween.update();
            
            if (vec.tween){
                vec.tween.update();
            }
            
            if (vec.length === 4){
                this[0] = this[0] % vec[0];
                this[1] = this[1] % vec[1];
                this[2] = this[2] % vec[2];
                this[3] = this[3] % vec[3];
            }else{
                this[0] = this[0] % vec[0];
                this[1] = this[1] % vec[0];
                this[2] = this[2] % vec[0];
                this[3] = this[3] % vec[0];
            }
            
            return this;
        }
        
        Tessellator.vec4.prototype.clamp = function (min, max){
            if (this.tween) this.tween.update();
            
            if (min.tween){
                min.tween.update();
            }
            
            if (max.tween){
                max.tween.update();
            }
            
            this[0] = this[0] < min[0] ? min[0] : (this[0] > max[0] ? max[0] : this[0]);
            this[1] = this[1] < min[1] ? min[0] : (this[1] > max[0] ? max[0] : this[1]);
            this[2] = this[2] < min[2] ? min[0] : (this[2] > max[0] ? max[0] : this[2]);
            this[3] = this[3] < min[3] ? min[0] : (this[3] > max[0] ? max[0] : this[3]);
            
            return this;
        }
        
        Tessellator.vec4.prototype.fract = function (){
            if (this.tween) this.tween.update();
            
            this[0] = this[0] - Math.floor(this[0]);
            this[1] = this[1] - Math.floor(this[1]);
            this[2] = this[2] - Math.floor(this[2]);
            this[3] = this[3] - Math.floor(this[3]);
            
            return this;
        }
        
        Tessellator.vec4.prototype.mix = function (vec4, l){
            if (this.tween) this.tween.update();
            
            if (vec4.tween){
                vec4.tween.update();
            }
            
            if (l.tween){
                l.tween.update();
            }
            
            if (l.length === 4){
                this[0] = this[0] + l[0] * (vec4[0] - this[0]);
                this[1] = this[1] + l[1] * (vec4[1] - this[1]);
                this[2] = this[2] + l[2] * (vec4[2] - this[2]);
                this[3] = this[3] + l[3] * (vec4[3] - this[3]);
            }else{
                this[0] = this[0] + l[0] * (vec4[0] - this[0]);
                this[1] = this[1] + l[0] * (vec4[1] - this[1]);
                this[2] = this[2] + l[0] * (vec4[2] - this[2]);
                this[3] = this[3] + l[0] * (vec4[3] - this[3]);
            }
            
            return this;
        }
        
        Tessellator.vec4.prototype.add = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 4){
                    this[0] += vec[0];
                    this[1] += vec[1];
                    this[2] += vec[2];
                    this[3] += vec[3];
                }else{
                    this[0] += vec[0];
                    this[1] += vec[0];
                    this[2] += vec[0];
                    this[3] += vec[0];
                }
            }else{
                this[0] += arguments[0];
                this[1] += arguments[1];
                this[2] += arguments[2];
                this[3] += arguments[3];
            }
            
            return this;
        }
        
        Tessellator.vec4.prototype.subtract = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 4){
                    this[0] -= vec[0];
                    this[1] -= vec[1];
                    this[2] -= vec[2];
                    this[3] -= vec[3];
                }else{
                    this[0] -= vec[0];
                    this[1] -= vec[0];
                    this[2] -= vec[0];
                    this[3] -= vec[0];
                }
            }else{
                this[0] -= arguments[0];
                this[1] -= arguments[1];
                this[2] -= arguments[2];
                this[3] -= arguments[3];
            }
            
            return this;
        }
        
        Tessellator.vec4.prototype.multiply = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0];
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 4){
                    this[0] *= vec[0];
                    this[1] *= vec[1];
                    this[2] *= vec[2];
                    this[3] *= vec[3];
                }else{
                    this[0] *= vec[0];
                    this[1] *= vec[0];
                    this[2] *= vec[0];
                    this[3] *= vec[0];
                }
            }else{
                this[0] *= arguments[0];
                this[1] *= arguments[1];
                this[2] *= arguments[2];
                this[3] *= arguments[3];
            }
            
            return this;
        }
        
        Tessellator.vec4.prototype.divide = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 4){
                    this[0] /= vec[0];
                    this[1] /= vec[1];
                    this[2] /= vec[2];
                    this[3] /= vec[3];
                }else{
                    this[0] /= vec[0];
                    this[1] /= vec[0];
                    this[2] /= vec[0];
                    this[3] /= vec[0];
                }
            }else{
                this[0] /= arguments[0];
                this[1] /= arguments[1];
                this[2] /= arguments[2];
                this[3] /= arguments[3];
            }
            
            return this;
        }
        
        Tessellator.vec4.prototype.scale = function (x){
            if (this.tween) this.tween.update();
            
            if (x.tween){
                x.tween.update();
            }
            
            this[0] *= x[0];
            this[1] *= x[0];
            this[2] *= x[0];
            this[3] *= x[0];
            
            return this;
        }
        
        Tessellator.vec4.prototype.min = function (vec){
            if (this.tween) this.tween.update();
            
            if (vec.tween){
                vec.tween.update();
            }
            
            if (vec.length === 4){
                this[0] = Math.min(this[0], vec[0]);
                this[1] = Math.min(this[1], vec[1]);
                this[2] = Math.min(this[2], vec[2]);
                this[3] = Math.min(this[3], vec[3]);
            }else{
                this[0] = Math.min(this[0], vec[0]);
                this[1] = Math.min(this[1], vec[0]);
                this[2] = Math.min(this[2], vec[0]);
                this[3] = Math.min(this[3], vec[0]);
            }
            
            return this;
        }
        
        Tessellator.vec4.prototype.max = function (vec){
            if (this.tween) this.tween.update();
            
            if (vec.tween){
                vec.tween.update();
            }
            
            if (vec.length === 4){
                this[0] = Math.max(this[0], vec[0]);
                this[1] = Math.max(this[1], vec[1]);
                this[2] = Math.max(this[2], vec[2]);
                this[3] = Math.max(this[3], vec[3]);
            }else{
                this[0] = Math.max(this[0], vec[0]);
                this[1] = Math.max(this[1], vec[0]);
                this[2] = Math.max(this[2], vec[0]);
                this[3] = Math.max(this[3], vec[0]);
            }
            
            return this;
        }
        
        Tessellator.vec4.prototype.squaredDistance = function (vec4){
            if (this.tween) this.tween.update();
            
            if (vec4.tween){
                vec4.tween.update();
            }
            
            var
                x = vec4[0] - this[0],
                y = vec4[1] - this[1],
                z = vec4[2] - this[2],
                w = vec4[3] - this[3];
            
            return Tessellator.float(x * x + y * y + z * z + w * w);
        }
        
        Tessellator.vec4.prototype.distance = function (vec4){
            return Tessellator.float(Math.sqrt(this.squaredDistance(vec4)));
        }
        
        Tessellator.vec4.prototype.dot = function (vec4){
            if (this.tween) this.tween.update();
            
            if (vec4.tween){
                vec4.tween.update();
            }
            
            return Tessellator.float(this[0] * vec4[0] + this[1] * vec4[1] + this[2] * vec4[2] + this[3] * vec4[3]);
        }
        
        Tessellator.vec4.prototype.squaredLength = function (){
            return this.dot(this);
        }
        
        Tessellator.vec4.prototype.len = function (){
            return this.squaredLength().sqrt();
        }
        
        Tessellator.vec4.prototype.normalize = function (){
            if (this.tween) this.tween.update();
            
            var d = this.len();
            this[0] /= d[0];
            this[1] /= d[0];
            this[2] /= d[0];
            this[3] /= d[0];
            
            return this;
        }
        
        Tessellator.vec4.prototype.invert = function (){
            if (this.tween) this.tween.update();
            
            this[0] = 1 / this[0];
            this[1] = 1 / this[1];
            this[2] = 1 / this[2];
            this[3] = 1 / this[3];
            
            return this;
        }
        
        Tessellator.vec4.prototype.negate = function (){
            if (this.tween) this.tween.update();
            
            this[0] = -this[0];
            this[1] = -this[1];
            this[2] = -this[2];
            this[3] = -this[3];
            
            return this;
        }
        
        Tessellator.vec4.prototype.random = function (scale){
            if (this.tween) this.tween.update();
            
            if (scale === undefined){
                scale = Tessellator.float(1);
            }else if (scale.tween){
                scale.tween.update();
            }
            
            this[0] = Math.random() * scale[0];
            this[1] = Math.random() * scale[0];
            this[2] = Math.random() * scale[0];
            this[3] = Math.random() * scale[0];
            
            return this;
        }
        
        Tessellator.vec4.prototype.x = function (){
            if (this.tween) this.tween.update();
            
            return this[0];
        }
        
        Tessellator.vec4.prototype.y = function (){
            if (this.tween) this.tween.update();
            
            return this[1];
        }
        
        Tessellator.vec4.prototype.z = function (){
            if (this.tween) this.tween.update();
            
            return this[2];
        }
        
        Tessellator.vec4.prototype.w = function (){
            if (this.tween) this.tween.update();
            
            return this[3];
        }
        
        Tessellator.vec4.prototype.createTween = function (){
            return this.tween = new Tessellator.Tween(this);
        }
        
        Tessellator.vec4.prototype.toString = function (){
            return "vec4(" + this[0] + ", " + this[1] + ", " + this[2] + ", " + this[3] + ")";
        }
    }
    { //vec3
        Tessellator.vec3 = function (){
            var array = new Float32Array(3);
            var pos = 0;
            
            for (var i = 0, k = arguments.length; i < k; i++){
                var arg = arguments[i];
                
                if (isNaN(arg)){
                    array.set(arg, pos);
                    pos += arg.length;
                }else{
                    array[pos++] = arg;
                }
            }
            
            if (pos === 1){
                array[1] = array[0];
                array[2] = array[0];
            }else if (pos !== 0){
                if (pos < array.length){
                    throw "too little information";
                }else if (pos > array.length){
                    throw "too much information";
                }
            }
            
            array.__proto__ = Tessellator.vec3.prototype;
            
            return array;
        }
        
        Tessellator.vec3.prototype = Object.create(Float32Array.prototype);
        Tessellator.vec3.prototype.constructor = Tessellator.vec3;
        
        Tessellator.vec3.prototype.clear = function (){
            this[0] = 0;
            this[1] = 0;
            this[3] = 0;
        }
        
        Tessellator.vec3.prototype.clone = function (){
            return Tessellator.vec3(this);
        }
        
        Tessellator.vec3.prototype.copy = function (vec3){
            if (vec3.tween){
                vec3.tween.update();
            }
            
            this.set(vec3);
            
            return this;
        }
        
        Tessellator.vec3.prototype.exp = function(vec){
            if (vec.tween){
                vec.tween.update();
            }
            
            this[0] = Math.pow(this[0], vec[0]);
            this[1] = Math.pow(this[1], vec[1]);
            this[2] = Math.pow(this[2], vec[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.sqrt = function(){
            if (this.tween) this.tween.update();
            
            this[0] = Math.sqrt(this[0]);
            this[1] = Math.sqrt(this[1]);
            this[2] = Math.sqrt(this[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.inversesqrt = function(){
            if (this.tween) this.tween.update();
            
            this[0] = 1 / Math.sqrt(this[0]);
            this[1] = 1 / Math.sqrt(this[1]);
            this[2] = 1 / Math.sqrt(this[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.abs = function(){
            if (this.tween) this.tween.update();
            
            this[0] = Math.abs(this[0]);
            this[1] = Math.abs(this[1]);
            this[2] = Math.abs(this[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.sign = function (){
            if (this.tween) this.tween.update();
            
            this[0] = this[0] < 0 ? 1 : (this[0] > 0 ? -1 : this[0]);
            this[1] = this[1] < 0 ? 1 : (this[1] > 0 ? -1 : this[1]);
            this[2] = this[2] < 0 ? 1 : (this[2] > 0 ? -1 : this[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.step = function (edge){
            if (this.tween) this.tween.update();
            
            if (edge.tween){
                edge.tween.update();
            }
            
            if (edge.length === 3){
                this[0] = this[0] < edge[0] ? 0 : 1;
                this[1] = this[1] < edge[1] ? 0 : 1;
                this[2] = this[2] < edge[2] ? 0 : 1;
            }else{
                this[0] = this[0] < edge[0] ? 0 : 1;
                this[1] = this[1] < edge[0] ? 0 : 1;
                this[2] = this[2] < edge[0] ? 0 : 1;
            }
            
            return this;
        }
        
        Tessellator.vec3.prototype.floor = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.floor(this[0]);
            this[1] = Math.floor(this[1]);
            this[2] = Math.floor(this[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.round = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.round(this[0]);
            this[1] = Math.round(this[1]);
            this[2] = Math.round(this[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.ceil = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.ceil(this[0]);
            this[1] = Math.ceil(this[1]);
            this[2] = Math.ceil(this[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.mod = function (vec){
            if (this.tween) this.tween.update();
            
            if (vec.tween){
                vec.tween.update();
            }
            
            if (vec.length === 3){
                this[0] = this[0] % vec[0];
                this[1] = this[1] % vec[1];
                this[2] = this[2] % vec[2];
            }else{
                this[0] = this[0] % vec[0];
                this[1] = this[1] % vec[0];
                this[2] = this[2] % vec[0];
            }
            
            return this;
        }
        
        Tessellator.vec3.prototype.clamp = function (min, max){
            if (this.tween) this.tween.update();
            
            if (min.tween){
                min.tween.update();
            }
            
            if (max.tween){
                max.tween.update();
            }
            
            this[0] = this[0] < min[0] ? min[0] : (this[0] > max[0] ? max[0] : this[0]);
            this[1] = this[1] < min[1] ? min[0] : (this[1] > max[0] ? max[0] : this[1]);
            this[2] = this[2] < min[2] ? min[0] : (this[2] > max[0] ? max[0] : this[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.fract = function (){
            if (this.tween) this.tween.update();
            
            this[0] = this[0] - Math.floor(this[0]);
            this[1] = this[1] - Math.floor(this[1]);
            this[2] = this[2] - Math.floor(this[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.mix = function (vec3, l){
            if (this.tween) this.tween.update();
            
            if (vec3.tween){
                vec3.tween.update();
            }
            
            if (l.length === 3){
                this[0] = this[0] + l[0] * (vec3[0] - this[0]);
                this[1] = this[1] + l[1] * (vec3[1] - this[1]);
                this[2] = this[2] + l[2] * (vec3[2] - this[2]);
            }else{
                this[0] = this[0] + l[0] * (vec3[0] - this[0]);
                this[1] = this[1] + l[0] * (vec3[1] - this[1]);
                this[2] = this[2] + l[0] * (vec3[2] - this[2]);
            }
            
            return this;
        }
        
        Tessellator.vec3.prototype.add = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 3){
                    this[0] += vec[0];
                    this[1] += vec[1];
                    this[2] += vec[2];
                }else{
                    this[0] += vec[0]
                    this[1] += vec[0]
                    this[2] += vec[0]
                }
            }else{
                this[0] += arguments[0];
                this[1] += arguments[1];
                this[2] += arguments[2];
            }
            
            return this;
        }
        
        Tessellator.vec3.prototype.subtract = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 3){
                    this[0] -= vec[0];
                    this[1] -= vec[1];
                    this[2] -= vec[2];
                }else{
                    this[0] -= vec[0];
                    this[1] -= vec[0];
                    this[2] -= vec[0];
                }
            }else{
                this[0] -= arguments[0];
                this[1] -= arguments[1];
                this[2] -= arguments[2];
            }
            
            return this;
        }
        
        Tessellator.vec3.prototype.multiply = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 3){
                    this[0] *= vec[0];
                    this[1] *= vec[1];
                    this[2] *= vec[2];
                }else if (vec.length === 4){
                    var
                        x = this[0],
                        y = this[1],
                        z = this[2],
                        w = vec[3] * x + vec[7] * y + vec[11] * z + vec[15];
                    
                    this[0] = (vec[ 0] * x + vec[ 4] * y + vec[ 8] * z + vec[12]) / w;
                    this[1] = (vec[ 1] * x + vec[ 5] * y + vec[ 9] * z + vec[13]) / w;
                    this[2] = (vec[ 2] * x + vec[ 6] * y + vec[10] * z + vec[14]) / w;
                }else if (vec.length === 9){
                    var
                        x = this[0],
                        y = this[1],
                        z = this[2];
                    
                    this[0] = vec[0] * x + vec[3] * y + vec[6] * z;
                    this[1] = vec[1] * x + vec[4] * y + vec[7] * z;
                    this[2] = vec[2] * x + vec[5] * y + vec[8] * z;
                }else{
                    this[0] *= vec[0];
                    this[1] *= vec[0];
                    this[2] *= vec[0];
                }
            }else{
                this[0] *= arguments[0];
                this[1] *= arguments[1];
                this[2] *= arguments[2];
            }
            
            return this;
        }
        
        Tessellator.vec3.prototype.divide = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 3){
                    this[0] /= vec[0];
                    this[1] /= vec[1];
                    this[2] /= vec[2];
                }else{
                    this[0] /= vec[0];
                    this[1] /= vec[0];
                    this[2] /= vec[0];
                }
            }else{
                this[0] /= arguments[0];
                this[1] /= arguments[1];
                this[2] /= arguments[2];
            }
            
            return this;
        }
        
        Tessellator.vec3.prototype.min = function (vec3){
            if (this.tween) this.tween.update();
            
            if (vec3.tween){
                vec3.tween.update();
            }
            
            this[0] = Math.min(this[0], vec3[0]);
            this[1] = Math.min(this[1], vec3[1]);
            this[2] = Math.min(this[2], vec3[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.max = function (vec3){
            if (this.tween) this.tween.update();
            
            if (vec3.tween){
                vec3.tween.update();
            }
            
            this[0] = Math.max(this[0], vec3[0]);
            this[1] = Math.max(this[1], vec3[1]);
            this[2] = Math.max(this[2], vec3[2]);
            
            return this;
        }
        
        Tessellator.vec3.prototype.squaredDistance = function (vec3){
            if (this.tween) this.tween.update();
            
            var
                x = vec3[0] - this[0],
                y = vec3[1] - this[1],
                z = vec3[2] - this[2];
            
            return Tessellator.float(x * x + y * y + z * z);
        }
        
        Tessellator.vec3.prototype.distance = function (vec3){
            return this.squaredDistance(vec3).sqrt();
        }
        
        Tessellator.vec3.prototype.dot = function (vec3){
            if (this.tween) this.tween.update();
            
            return Tessellator.float(this[0] * vec3[0] + this[1] * vec3[1] + this[2] * vec3[2]);
        }
        
        Tessellator.vec3.prototype.squaredLength = function (){
            return this.dot(this);
        }
        
        Tessellator.vec3.prototype.len = function (){
            return Math.sqrt(this.squaredLength());
        }
        
        Tessellator.vec3.prototype.normalize = function (){
            if (this.tween) this.tween.update();
            
            var d = this.len();
            
            if (d > 0.0001){
                this[0] /= d;
                this[1] /= d;
                this[2] /= d;
            }
            
            return this;
        }
        
        Tessellator.vec3.prototype.invert = function (){
            if (this.tween) this.tween.update();
            
            this[0] = 1 / this[0];
            this[1] = 1 / this[1];
            this[2] = 1 / this[2];
            
            return this;
        }
        
        Tessellator.vec3.prototype.negate = function (){
            if (this.tween) this.tween.update();
            
            this[0] = -this[0];
            this[1] = -this[1];
            this[2] = -this[2];
            
            return this;
        }
        
        Tessellator.vec3.prototype.random = function (scale){
            if (scale === undefined){
                scale = Tessellator.float(1);
            }else if (scale.tween){
                scale.tween.update();
            }
            
            this[0] = Math.random() * scale[0];
            this[1] = Math.random() * scale[0];
            this[2] = Math.random() * scale[0];
            
            return this;
        }
        
        Tessellator.vec3.prototype.x = function (x){
            if (this.tween) this.tween.update();
            
            if (x){
                return this[0] = x;
            }else{
                return this[0];
            }
        }
        
        Tessellator.vec3.prototype.y = function (y){
            if (this.tween) this.tween.update();
            
            if (y){
                return this[1] = y;
            }else{
                return this[1];
            }
        }
        
        Tessellator.vec3.prototype.z = function (z){
            if (this.tween) this.tween.update();
            
            if (z){
                return this[2] = z;
            }else{
                return this[2];
            }
        }
        
        Tessellator.vec3.prototype.createTween = function (){
            return this.tween = new Tessellator.Tween(this);
        }
        
        Tessellator.vec3.prototype.toString = function (){
            return "vec3(" + this[0] + ", " + this[1] + ", " + this[2] + ")";
        }
    }
    { //vec2
        Tessellator.vec2 = function (){
            var array = new Float32Array(2);
            var pos = 0;
            
            for (var i = 0, k = arguments.length; i < k; i++){
                var arg = arguments[i];
                
                if (isNaN(arg)){
                    array.set(arg, pos);
                    pos += arg.length;
                }else{
                    array[pos++] = arg;
                }
            }
            
            if (pos === 1){
                array[1] = array[0];
            }else if (pos !== 0){
                if (pos < array.length){
                    throw "too little information";
                }else if (pos > array.length){
                    throw "too much information";
                }
            }
            
            array.__proto__ = Tessellator.vec2.prototype;
            
            return array;
        }
        
        Tessellator.vec2.prototype = Object.create(Float32Array.prototype);
        Tessellator.vec2.prototype.constructor = Tessellator.vec2;
        
        Tessellator.vec2.prototype.clear = function (){
            this[0] = 0;
            this[1] = 0;
        }
        
        Tessellator.vec2.prototype.clone = function (){
            return Tessellator.vec2(this);
        }
        
        Tessellator.vec2.prototype.copy = function (vec2){
            if (vec2.tween){
                vec2.tween.update();
            }
            
            this.set(vec2);
            
            return this;
        }
        
        Tessellator.vec2.prototype.exp = function(vec){
            if (this.tween) this.tween.update();
            
            this[0] = Math.pow(this[0], vec[0]);
            this[1] = Math.pow(this[1], vec[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.sqrt = function(){
            if (this.tween) this.tween.update();
            
            this[0] = Math.sqrt(this[0]);
            this[1] = Math.sqrt(this[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.inversesqrt = function(){
            if (this.tween) this.tween.update();
            
            this[0] = 1 / Math.sqrt(this[0]);
            this[1] = 1 / Math.sqrt(this[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.abs = function(){
            if (this.tween) this.tween.update();
            
            this[0] = Math.abs(this[0]);
            this[1] = Math.abs(this[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.sign = function (){
            if (this.tween) this.tween.update();
            
            this[0] = this[0] < 0 ? 1 : (this[0] > 0 ? -1 : this[0]);
            this[1] = this[1] < 0 ? 1 : (this[1] > 0 ? -1 : this[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.step = function (edge){
            if (this.tween) this.tween.update();
            
            if (edge.tween){
                edge.tween.update();
            }
            
            if (edge.length === 2){
                this[0] = this[0] < edge[0] ? 0 : 1;
                this[1] = this[1] < edge[1] ? 0 : 1;
            }else{
                this[0] = this[0] < edge[0] ? 0 : 1;
                this[1] = this[1] < edge[0] ? 0 : 1;
            }
            
            return this;
        }
        
        Tessellator.vec2.prototype.floor = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.floor(this[0]);
            this[1] = Math.floor(this[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.ceil = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.ceil(this[0]);
            this[1] = Math.ceil(this[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.mod = function (vec2){
            if (this.tween) this.tween.update();
            
            this[0] = this[0] % vec2[0];
            this[1] = this[1] % vec2[1];
            
            return this;
        }
        
        Tessellator.vec2.prototype.clamp = function (min, max){
            if (this.tween) this.tween.update();
            
            if (min.tween){
                min.tween.update();
            }
            
            if (max.tween){
                max.tween.update();
            }
            
            this[0] = this[0] < min[0] ? min[0] : (this[0] > max[0] ? max[0] : this[0]);
            this[1] = this[1] < min[1] ? min[0] : (this[1] > max[0] ? max[0] : this[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.fract = function (){
            if (this.tween) this.tween.update();
            
            this[0] = this[0] - Math.floor(this[0]);
            this[1] = this[1] - Math.floor(this[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.mix = function (vec2, l){
            if (this.tween) this.tween.update();
            
            if (vec2.tween){
                vec2.tween.update();
            }
            
            if (l.tween){
                l.tween.update();
            }
            
            if (l.length === 2){
                this[0] = this[0] + l[0] * (vec2[0] - this[0]);
                this[1] = this[1] + l[1] * (vec2[1] - this[1]);
            }else{
                this[0] = this[0] + l * (vec2[0] - this[0]);
                this[1] = this[1] + l * (vec2[1] - this[1]);
            }
            
            return this;
        }
        
        Tessellator.vec2.prototype.add = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 2){
                    this[0] += vec[0];
                    this[1] += vec[1];
                }else{
                    this[0] += vec;
                    this[1] += vec;
                }
            }else{
                this[0] += arguments[0];
                this[1] += arguments[1];
            }
            
            return this;
        }
        
        Tessellator.vec2.prototype.subtract = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 2){
                    this[0] -= vec[0];
                    this[1] -= vec[1];
                }else{
                    this[0] -= vec;
                    this[1] -= vec;
                }
            }else{
                this[0] -= arguments[0];
                this[1] -= arguments[1];
            }
            
            return this;
        }
        
        Tessellator.vec2.prototype.multiply = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 2){
                    this[0] *= vec[0];
                    this[1] *= vec[1];
                }else{
                    this[0] *= vec;
                    this[1] *= vec;
                }
            }else{
                this[0] *= arguments[0];
                this[1] *= arguments[1];
            }
            
            return this;
        }
        
        Tessellator.vec2.prototype.divide = function (){
            if (this.tween) this.tween.update();
            
            if (arguments.length === 1){
                var vec = arguments[0]
                
                if (vec.tween){
                    vec.tween.update();
                }
                
                if (vec.length === 2){
                    this[0] /= vec[0];
                    this[1] /= vec[1];
                }else{
                    this[0] /= vec;
                    this[1] /= vec;
                }
            }else{
                this[0] /= arguments[0];
                this[1] /= arguments[1];
            }
            
            return this;
        }
        
        Tessellator.vec2.prototype.min = function (vec2){
            if (this.tween) this.tween.update();
            
            if (vec2.tween){
                vec2.tween.update();
            }
            
            this[0] = Math.min(this[0], vec2[0]);
            this[1] = Math.min(this[1], vec2[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.max = function (vec2){
            if (this.tween) this.tween.update();
            
            if (vec2.tween){
                vec2.tween.update();
            }
            
            this[0] = Math.max(this[0], vec2[0]);
            this[1] = Math.max(this[1], vec2[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.squaredDistance = function (vec2){
            if (this.tween) this.tween.update();
            
            if (vec2.tween){
                vec2.tween.update();
            }
            
            var
                x = vec2[0] - this[0],
                y = vec2[1] - this[1];
            
            return Tessellator.float(x * x + y * y);
        }
        
        Tessellator.vec2.prototype.distance = function (vec2){
            return Math.sqrt(this.squaredDistance(vec2));
        }
        
        Tessellator.vec2.prototype.dot = function (vec2){
            if (this.tween) this.tween.update();
            
            if (vec2.tween){
                vec2.tween.update();
            }
            
            return Tessellator.float(this[0] * vec2[0] + this[1] * vec2[1]);
        }
        
        Tessellator.vec2.prototype.squaredLength = function (){
            return this.dot(this);
        }
        
        Tessellator.vec2.prototype.len = function (){
            return this.squaredLength().sqrt();
        }
        
        Tessellator.vec2.prototype.normalize = function (){
            var d = this.len();
            this[0] /= d[0];
            this[1] /= d[0];
            
            return this;
        }
        
        Tessellator.vec2.prototype.invert = function (){
            if (this.tween) this.tween.update();
            
            this[0] = 1 / this[0];
            this[1] = 1 / this[1];
            
            return this;
        }
        
        Tessellator.vec2.prototype.negate = function (){
            if (this.tween) this.tween.update();
            
            this[0] = -this[0];
            this[1] = -this[1];
            
            return this;
        }
        
        Tessellator.vec2.prototype.lerp = function (vec2, l){
            if (this.tween) this.tween.update();
            
            if (vec2.tween){
                vec2.tween.update();
            }
            
            this[0] = this[0] + l[0] * (vec2[0] - this[0]);
            this[1] = this[1] + l[0] * (vec2[1] - this[1]);
            
            return this;
        }
        
        Tessellator.vec2.prototype.random = function (scale){
            if (scale === undefined){
                scale = Tessellator.float(1);
            }else if (scale.tween){
                scale.tween.update();
            }
            
            this[0] = Math.random() * scale[0];
            this[1] = Math.random() * scale[0];
            
            return this;
        }
        
        Tessellator.vec2.prototype.aspect = function (){
            if (this.tween) this.tween.update();
            
            return this[0] / this[1];
        }
        
        Tessellator.vec2.prototype.x = function (){
            if (this.tween) this.tween.update();
            
            return this[0];
        }
        
        Tessellator.vec2.prototype.y = function (){
            if (this.tween) this.tween.update();
            
            return this[1];
        }
        
        Tessellator.vec2.prototype.createTween = function (){
            return this.tween = new Tessellator.Tween(this);
        }
        
        Tessellator.vec2.prototype.toString = function (){
            return "vec2(" + this[0] + ", " + this[1] + ")";
        }
    }
    { //float
        Tessellator.float = function (){
            var array = new Float32Array(1);
            
            if (arguments.length === 0){
                array[0] = 0;
            }else if (arguments.length === 1){
                if (arguments[0].length){
                    if (arguments[0].length === 1){
                        array[0] = arguments[0][0];
                    }else{
                        throw "too much information";
                    }
                }else{
                    array[0] = arguments[0];
                }
            }else{
                throw "too much information";
            }
            
            array.__proto__ = Tessellator.float.prototype;
            
            return array;
        }
        
        Tessellator.float.prototype = Object.create(Float32Array.prototype);
        Tessellator.float.prototype.constructor = Tessellator.float;
        
        Tessellator.float.prototype.clear = function (){
            this[0] = 0;
            
            return this;
        }
        
        Tessellator.float.prototype.clone = function (){
            return Tessellator.float(this);
        }
        
        Tessellator.float.prototype.copy = function (float){
            if (this.tween) this.tween.update();
            if (float.tween) float.tween.update();
            
            this[0] = float[0];
        }
        
        Tessellator.float.prototype.multiply = function (float){
            if (this.tween) this.tween.update();
            if (float.tween) float.tween.update();
            
            this[0] *= float[0];
            
            return this;
        }
        
        Tessellator.float.prototype.add = function (float){
            if (this.tween) this.tween.update();
            if (float.tween) float.tween.update();
            
            this[0] += float[0];
            
            return this;
        }
        
        Tessellator.float.prototype.subtract = function (float) {
            if (this.tween) this.tween.update();
            if (float.tween) float.tween.update();
            
            this[0] -= float[0];
            
            return this;
        }
        
        Tessellator.float.prototype.divide = function (float) {
            if (this.tween) this.tween.update();
            if (float.tween) float.tween.update();
            
            this[0] /= float[0];
            
            return this;
        }
        
        Tessellator.float.prototype.sqrt = function (){
            if (this.tween) this.tween.update();
            
            this[0] = Math.sqrt(this[0]);
            
            return this;
        }
        
        Tessellator.float.prototype.createTween = function (){
            return this.tween = new Tessellator.Tween(this);
        }
        
        Tessellator.float.prototype.toString = function (){
            return "float(" + this[0] + ")";
        }
    }
    { //tween
        Tessellator.Tween = function (vec){
            this.vec = vec;
            
            this.directives = [];
            this.directiveStartTime = null;
            this.loopDirectives = false;
            
            this.updated = false;
        }
        
        Tessellator.Tween.prototype.add = function (e){
            this.directives.push(e);
            
            if (this.directives.length === 1){
                this.directiveStartTime = Date.now();
                this.ovec = this.vec.clone();
            }
        }
        
        Tessellator.Tween.prototype.loop = function (flag){
            this.loopDirectives = flag === undefined ? true : flag;
            
            return this;
        }
        
        Tessellator.Tween.prototype.update = function (){
            if (this.ovec){
                var time = Date.now();
                
                while (this.directives.length){
                    this.updated = true;
                    
                    var st = this.directives[0](this, time - this.directiveStartTime);
                    
                    if (st >= 0){
                        var e = this.directives.splice(0, 1)[0];
                        
                        if (this.loopDirectives){
                            this.add(e);
                        }
                        
                        if (this.directives.length){
                            this.ovec = this.vec.clone();
                            this.directiveStartTime = time - st;
                        }
                    }else{
                        break;
                    }
                }
            }
        }
        
        Tessellator.Tween.prototype.dir = function (vec, time){
            time = time || 0;
            
            if (time === 0){
                this.add(function (tween, t){
                    for (var i = 0; i < tween.vec.length; i++){
                        tween.vec[i] = tween.ovec[i] + t * vec[i];
                    }
                    
                    return -1;
                });
            }else{
                this.add(function (tween, t){
                    for (var i = 0; i < tween.vec.length; i++){
                        tween.vec[i] = tween.ovec[i] + Math.min(t / time, 1) * vec[i];
                    }
                    
                    return t - time;
                });
            }
            
            return this;
        }
        
        Tessellator.Tween.prototype.to = function (pos, rate){
            rate = rate || 0;
            
            if (!isNaN(rate)){
                rate = Tessellator.float(rate);
            }
            
            this.add(function (tween, t){
                var vec = pos.clone().subtract(tween.ovec).divide(rate);
                
                for (var i = 0; i < tween.vec.length; i++){
                    tween.vec[i] = tween.ovec[i] + Math.min(t, rate[0]) * vec[i];
                }
                
                return t - rate[0];
            });
            
            return this;
        }
        
        Tessellator.Tween.prototype.set = function (pos){
            this.add(function (tween){
                tween.vec.set(pos);
                
                return 0;
            });
            
            return this;
        }
        
        Tessellator.Tween.prototype.delay = function (time){
            this.add(function (tween, t){
                return t - time;
            });
            
            return this;
        }
    }
}
{ //shader program
    { //shader
        Tessellator.Shader = function (tessellator, type){
            this.tessellator = tessellator;
            
            if (type){
                this.create(type);
            }
            
            this.loaded = false;
            this.disposable - true;
        }
        
        Tessellator.Shader.prototype.loadDOM = function (dom){
            if (!dom){
                return;
            }else if (dom.constructor === String){
                dom = document.getElementById(dom);
            }
            
            
            if (!this.shader){
                var type;
                
                if (dom.type == "shader/fragment" || dom.type == "shader/pixel"){
                    type = this.tessellator.GL.FRAGMENT_SHADER;
                }else if (dom.type == "shader/vertex"){
                    type = this.tessellator.GL.VERTEX_SHADER;
                }else{
                    throw "unknown shader: " + dom.type;
                }
                
                this.create(type);
            }
            
            var self = this;
            
            Tessellator.getSourceText(dom, function (source){
                self.load(source);
            });
            
            return this;
        }
        
        Tessellator.Shader.prototype.loadRemote = function (src){
            var self = this;
            
            Tessellator.getRemoteText(src, function (source){
                self.load(source);
            });
            
            return this;
        }
        
        Tessellator.Shader.prototype.load = function (source){
            if (!source){
                throw "no source!";
            }else if (!this.shader){
                throw "no shader!";
            }
            
            {
                var gl = this.tessellator.GL;
                
                gl.shaderSource(this.shader, source);
                gl.compileShader(this.shader);
                
                if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
                    var error;
                    
                    if (this.type === gl.FRAGMENT_SHADER){
                        error = "fragment shader problem";
                    }else if (this.type === gl.VERTEX_SHADER){
                        error = "vertex shader problem";
                    }
                    
                    var t = [];
                    t.type = error;
                    
                    t.toString = function (){
                        var s = [];
                        
                        s.push(this.type + ":");
                        
                        for (var i = 0; i < this.length; i++){
                            s.push(this[i].raw);
                        }
                        
                        return s.join("\n");
                    }
                    
                    var info = gl.getShaderInfoLog(this.shader);
                    var lines = info.split("\n");
                    
                    for (var i = 0; i < lines.length; i++){
                        if (!lines[i].trim().length){
                            continue;
                        }
                        
                        var ii = lines[i].indexOf(":");
                        
                        if (ii > 0){
                            var o = {
                                raw: lines[i]
                            };
                            
                            var m = 0;
                            
                            o.type = lines[i].substring(0, ii);
                            
                            var iii = lines[i].indexOf(":", ii + 1);
                            
                            if (iii > 0){
                                var c = parseInt(lines[i].substring(ii + 1, iii).trim());
                                var iv = lines[i].indexOf(":", iii + 1);
                                
                                if (iv > 0){
                                    var l = parseInt(lines[i].substring(iii + 1, iv).trim());
                                    
                                    o.line = l;
                                    o.char = c;
                                    
                                    m = iv + 1;
                                }else{
                                    o.line = l;
                                    
                                    m = iii + 1;
                                }
                            }else{
                                m = ii + 1;
                            }
                            
                            o.info = lines[i].substring(m);
                            
                            t.push(o);
                        }else{
                            t.push({
                                type: "unknown",
                                info: lines[i]
                            });
                        }
                    }
                    
                    throw t;
                }
            }
            
            this.loaded = true;
            
            if (this.listener){
                this.listener(this);
            }
            
            return this;
        }
        
        Tessellator.Shader.prototype.create = function (type){
            if (this.shader){
                throw "shader is already initialized!";
            }else{
                this.type = type;
                this.loaded = false;
                
                this.shader = this.tessellator.GL.createShader(type);
            }
            
            return this;
        }
        
        Tessellator.Shader.prototype.dispose = function (){
            if (this.shader){
                this.tessellator.GL.deleteShader(this.shader);
            }
        }
        
        Tessellator.Shader.prototype.onLink = Tessellator.EMPTY_FUNC;
        
        Tessellator.Shader.prototype.onProgramLoad = Tessellator.EMPTY_FUNC;
    }
    { //program
        Tessellator.Program = function (tessellator){
            this.tessellator = tessellator;
            
            this.linked = [];
            this.shader = this.tessellator.GL.createProgram();
            this.loaded = false;
            this.active = false;
            
            this.attribs = {};
            this.uniforms = {};
            this.uedits = 0;
            
            this.disposable = false;
        }
        
        Tessellator.Program.prototype.link = function (shader){
            this.linked.push(shader);
            
            if (shader.loaded){
                var res = shader.onLink(this);
                
                if (res === undefined || res){
                    this.tessellator.GL.attachShader(this.shader, shader.shader);
                }
            }else{
                var self = this;
                
                shader.listener = function (shader){
                    var res = shader.onLink(self);
                
                    if (res === undefined || res){
                        self.tessellator.GL.attachShader(self.shader, shader.shader);
                    }
                    
                    if (self.listener){
                        self.listener(shader);
                    }
                }
            }
            
            return this;
        }
        
        Tessellator.Program.prototype.load = function (){
            var ready = true;
            
            for (var i = 0; i < this.linked.length; i++){
                if (!this.linked[i].loaded){
                    ready = false;
                    break;
                }
            }
            
            if (!ready){
                var self = this;
                
                this.listener = self.load;
            }else{
                var gl = this.tessellator.GL;
                
                for (var i = 0; i < this.linked.length; i++){
                    this.linked[i].onProgramLoad(this);
                }
                
                gl.linkProgram(this.shader);
                
                if (!gl.getProgramParameter(this.shader, gl.LINK_STATUS)){
                    var error = gl.getProgramInfoLog(this.shader);
                    
                    throw "unable to load shader program: " + error;
                }
                
                {
                    var attribs = gl.getProgramParameter(this.shader, gl.ACTIVE_ATTRIBUTES);
                    
                    this.attributeCount = attribs;
                    
                    for (var i = 0; i < attribs; i++){
                        var attrib = gl.getActiveAttrib(this.shader, i);
                        
                        this.attribs[attrib.name] = i;
                    }
                }
                
                {
                    var uniforms = gl.getProgramParameter(this.shader, gl.ACTIVE_UNIFORMS);
                    
                    this.uniformCount = uniforms;
                    this.uniformSpace = 0;
                    
                    for (var i = 0; i < uniforms; i++){
                        var uniform = gl.getActiveUniform(this.shader, i);
                        
                        if (uniform.type === gl.FLOAT_MAT4){
                            this.uniformSpace += uniform.size * 4;
                        }else if (uniform.type === gl.FLOAT_MAT3){
                            this.uniformSpace += uniform.size * 3;
                        }else if (uniform.type === gl.FLOAT_MAT2){
                            this.uniformSpace += uniform.size * 2;
                        }else{
                            this.uniformSpace += uniform.size;
                        }
                        
                        var name;
                        
                        if (uniform.size > 1){
                            name = uniform.name.substring(0, uniform.name.length - 3);
                        }else{
                            name = uniform.name;
                        }
                        
                        var inherit = Tessellator.Program.DEFAULT_UNIFORM_INHERITER[uniform.type]
                        
                        this.uniforms[name] = {
                            name: name,
                            value: null,
                            initialValue: true,
                            inherit: inherit,
                            configure: inherit.configure,
                            map: inherit.map,
                            startMap: inherit.startMap,
                            location: gl.getUniformLocation(this.shader, name),
                            shader: this,
                            size: uniform.size,
                            type: uniform.type,
                            edits: 0,
                        };
                        
                    }
                    
                    if (this.uniformSpace > this.tessellator.maxUniformSpace){
                        console.error("The amount of uniforms exceeded the maximum! There may be problems!");
                    }
                }
                
                this.loaded = true;
            }
            
            return this;
        }
        
        Tessellator.Program.prototype.hasUniform = function (key){
            return key in this.uniforms;
        }
        
        Tessellator.Program.prototype.uniform = function (key, value, matrix){
            var u = this.uniforms[key];
            
            if (u){
                u.configure(value, matrix);
                u.initialValue = false;
                u.edits++;
            }
        }
        
        Tessellator.Program.prototype.preUnify = function (matrix){
            for (var o in this.uniforms){
                var u = this.uniforms[o];
                
                if (u.startMap){
                    u.startMap(matrix);
                }
            }
        }
        
        Tessellator.Program.prototype.unify = function (matrix){
            for (var o in this.uniforms){
                var u = this.uniforms[o];
                
                if (u.map){
                    u.map(matrix);
                }
                
                if (!u.initialValue && u.inherit && u.edits !== u.lastUnify){
                    u.inherit(matrix);
                    
                    u.lastUnify = u.edits;
                    this.uedits++;
                }
            }
        }
        
        Tessellator.Program.prototype.setInheriter = function (key, value){
            if (!value.configure){
                value.configure = Tessellator.Program.DEFAULT_CONFIG;
            }
            
            var u = this.uniforms[key];
            
            if (u){
                u.inherit = value;
                u.configure = u.inherit.configure;
                u.map = u.inherit.map;
                u.startMap = u.inherit.startMap;
                
                if (u.edits === undefined){
                    u.edits = 0;
                }
            }else{
                u = {
                    configure: value.configure,
                    shader: this
                };
                
                this.uniforms[key] = u;
            }
            
            return this;
        }
        
        Tessellator.Program.prototype.dispose = function (){
            for (var i = 0; i < this.linked.length; i++){
                if (this.linked[i].disposable){
                    this.linked[i].dispose();
                }
            }
            
            this.tessellator.GL.deleteProgram(this.shader);
            
            return this;
        }
        
        Tessellator.Program.prototype.bind = function (){
            if (this.tessellator.shader !== this){
                if (this.tessellator.shader){
                    this.tessellator.shader.replaced(this);
                }
                
                this.tessellator.shader = this;
                this.tessellator.GL.useProgram(this.shader);
                
                return true;
            }
            
            return false;
        }
        
        Tessellator.Program.prototype.init = function () {
            return true;
        }
        
        Tessellator.Program.prototype.postInit = function (){}
        
        Tessellator.Program.prototype.set = function (){
            return true;
        }
        
        Tessellator.Program.prototype.postSet = function (){}
        
        Tessellator.Program.prototype.replaced = function (){}
    }
    { //util
        Tessellator.prototype.loadDefaultShaderProgram = function (){
            return Tessellator.MODEL_VIEW_VERTEX_LIGHTING_SHADER.create(this);
        }

        Tessellator.prototype.createShaderProgram = function (vertexShader, fragmentShader){
            if (vertexShader.constructor !== Tessellator.Shader){
                var shader = new Tessellator.Shader(this, Tessellator.VERTEX_SHADER);
                
                if (vertexShader.constructor === String){
                    if (vertexShader.indexOf(".glsl", vertexShader.length - 5) !== -1){
                        shader.loadRemote(vertexShader);
                    }else{
                        shader.load(vertexShader);
                    }
                }else{
                    shader.loadDOM(vertexShader);
                }
                
                vertexShader = shader;
            }
            
            if (fragmentShader.constructor !== Tessellator.Shader){
                var shader = new Tessellator.Shader(this, Tessellator.FRAGMENT_SHADER);
                
                if (fragmentShader.constructor === String){
                    if (fragmentShader.indexOf(".glsl", fragmentShader.length - 5) !== -1){
                        shader.loadRemote(fragmentShader);
                    }else{
                        shader.load(fragmentShader);
                    }
                }else{
                    shader.loadDOM(fragmentShader);
                }
                
                fragmentShader = shader;
            }
            
            return new Tessellator.Program(this).link(vertexShader).link(fragmentShader).load();
        }
        
        Tessellator.prototype.loadShaderProgram = Tessellator.prototype.createShaderProgram;
        Tessellator.prototype.loadShaderProgramFromCode = Tessellator.prototype.createShaderProgram;
        Tessellator.prototype.loadShaderProgramFromDOM = Tessellator.prototype.createShaderProgram;
        
        Tessellator.prototype.createPixelShader = function (shader){
            if (shader.constructor === String){
                return new Tessellator.Program(this).link(this.getShader(Tessellator.PIXEL_SHADER_VERTEX_SHADER, this.GL.VERTEX_SHADER)).link(new Tessellator.Shader(this, Tessellator.FRAGMENT_SHADER).load(shader)).load();
            }else if (shader.constructor === Tessellator.Shader){
                return new Tessellator.Program(this).link(this.getShader(Tessellator.PIXEL_SHADER_VERTEX_SHADER, this.GL.VERTEX_SHADER)).link(shader).load();
            }else{
                return new Tessellator.Program(this).link(this.getShader(Tessellator.PIXEL_SHADER_VERTEX_SHADER, this.GL.VERTEX_SHADER)).link(new Tessellator.Shader(this, Tessellator.FRAGMENT_SHADER).loadDOM(shader)).load();
            }
        }
        
        Tessellator.prototype.getShaderFromDOM = function (dom){
            return new Tessellator.Shader(this).loadDOM(dom);
        }


        Tessellator.prototype.getShader = function (shaderSource, type){
            return new Tessellator.Shader(this, type).load(shaderSource);
        }
        
        Tessellator.prototype.createBypassShader = function (){
            return this.createPixelShader(tessellator.getShader(Tessellator.PIXEL_SHADER_PASS, Tessellator.FRAGMENT_SHADER));
        }
    }
    { //uniforms
        Tessellator.Program.I1_UNIFY_FUNC = function (){
            this.shader.tessellator.GL.uniform1i(this.location, this.value);
        }
        
        Tessellator.Program.F1_UNIFY_FUNC = function (){
            var value;
            
            if (this.value.length){
                value = this.value[0];
            }else{
                value = this.value;
            }
            
            this.shader.tessellator.GL.uniform1f(this.location, value);
        }
        
        Tessellator.Program.UNIFY_WINDOW = function (){
            if (this.location){
                this.shader.tessellator.GL.uniform2fv(this.location, this.value);
            }
        }
        
        Tessellator.Program.UNIFY_WINDOW.configure = function (value){
            this.value = value;
            
            this.shader.tessellator.GL.viewport(0, 0, value[0], value[1]);
        }
        
        Tessellator.Program.F1V_UNIFY_FUNC = function (){
            this.shader.tessellator.GL.uniform1fv(this.location, this.value);
        }
        
        Tessellator.Program.F2V_UNIFY_FUNC = function (){
            this.shader.tessellator.GL.uniform2fv(this.location, this.value);
        }
        
        Tessellator.Program.F3V_UNIFY_FUNC = function (){
            this.shader.tessellator.GL.uniform3fv(this.location, this.value);
        }
        
        Tessellator.Program.F4V_UNIFY_FUNC = function (){
            this.shader.tessellator.GL.uniform4fv(this.location, this.value);
        }
        
        Tessellator.Program.MAT4_UNIFY_FUNC = function (){
            this.shader.tessellator.GL.uniformMatrix4fv(this.location, false, this.value);
        }
        
        Tessellator.Program.MAT3_UNIFY_FUNC = function (){
            this.shader.tessellator.GL.uniformMatrix3fv(this.location, false, this.value);
        }
        
        Tessellator.Program.MAT2_UNIFY_FUNC = function (){
            this.shader.tessellator.GL.uniformMatrix2fv(this.location, false, this.value);
        };
        
        Tessellator.Program.BIND_TEXTURE_2D = function (render){
            var gl = this.shader.tessellator.GL;
            
            gl.activeTexture(gl.TEXTURE0 + Tessellator.Program.textureUnit);
            gl.uniform1i(this.location, Tessellator.Program.textureUnit);
            
            if (this.value){
                this.value.bind(render);
            }else{
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        }
        
        Tessellator.Program.BIND_TEXTURE_2D.map = function (matrix){
            Tessellator.Program.textureUnit++;
        }
        
        Tessellator.Program.BIND_TEXTURE_2D.startMap = function (matrix){
            if (this.value && this.inherit && this.value.autoUpdate && this.value.lastFrameUpdate !== this.shader.tessellator.frame){
                this.value.lastFrameUpdate = this.shader.tessellator.frame;
                
                this.value.update(matrix);
            }
            
            Tessellator.Program.textureUnit = -1;
        }
        
        Tessellator.Program.BIND_TEXTURE_CUBE = function (render){
            var gl = this.shader.tessellator.GL;
            
            gl.activeTexture(gl.TEXTURE0 + Tessellator.Program.textureUnit);
            gl.uniform1i(this.location, Tessellator.Program.textureUnit);
            
            if (this.value){
                this.value.bind(render);
            }else{
                gl.bindTexture(gl.TEXTURE_CUBE, null);
            }
        }
        
        Tessellator.Program.BIND_TEXTURE_CUBE.map = function (matrix){
            Tessellator.Program.textureUnit++;
        }
        
        Tessellator.Program.BIND_TEXTURE_CUBE.startMap = function (matrix){
            if (this.value && this.inherit && this.value.autoUpdate && this.value.lastFrameUpdate !== this.shader.tessellator.frame){
                this.value.lastFrameUpdate = this.shader.tessellator.frame;
                
                this.value.update(matrix);
            }
            
            Tessellator.Program.textureUnit = -1;
        }
        
        Tessellator.Program.BLEND_FUNC = function (){
            this.shader.tessellator.GL.blendFunc(this.value[0], this.value[1]);
        }
        
        Tessellator.Program.DEPTH_MASK = function (){
            this.shader.tessellator.GL.depthMask(this.value);
        }
        
        Tessellator.Program.ENABLE_FUNC = function (){
            if (this.enable){
                this.shader.tessellator.GL.enable(this.value);
            }else{
                this.shader.tessellator.GL.disable(this.value);
            }
        }
        
        Tessellator.Program.MV_MATRIX_UNIFY_FUNC = function (){
            this.shader.tessellator.GL.uniformMatrix4fv(this.location, false, this.value);
            
            if (this.shader.uniforms.nMatrix){
                this.shader.tessellator.GL.uniformMatrix3fv(this.shader.uniforms.nMatrix.location, false, Tessellator.Program.lightNormalCache.normalFromMat4(this.value));
            }
        }
        
        Tessellator.Program.lightNormalCache = Tessellator.mat3();
        
        Tessellator.Program.DEFAULT_CONFIG = function (value){
            this.value = value;
        }
        
        Tessellator.Program.DEFAULT_UNIFORM_INHERITER = {};
        
        (function (){
            this[Tessellator.FLOAT_MAT4] = Tessellator.Program.MAT4_UNIFY_FUNC;
            this[Tessellator.FLOAT_MAT3] = Tessellator.Program.MAT3_UNIFY_FUNC;
            this[Tessellator.FLOAT_MAT2] = Tessellator.Program.MAT2_UNIFY_FUNC;
            
            this[Tessellator.FLOAT_VEC4] = Tessellator.Program.F4V_UNIFY_FUNC;
            this[Tessellator.INT_VEC4] = Tessellator.Program.F4V_UNIFY_FUNC;
            this[Tessellator.BOOL_VEC4] = Tessellator.Program.F4V_UNIFY_FUNC;
            
            this[Tessellator.FLOAT_VEC3] = Tessellator.Program.F3V_UNIFY_FUNC;
            this[Tessellator.INT_VEC3] = Tessellator.Program.F3V_UNIFY_FUNC;
            this[Tessellator.BOOL_VEC3] = Tessellator.Program.F3V_UNIFY_FUNC;
            
            this[Tessellator.FLOAT_VEC2] = Tessellator.Program.F2V_UNIFY_FUNC;
            this[Tessellator.INT_VEC2] = Tessellator.Program.F2V_UNIFY_FUNC;
            this[Tessellator.BOOL_VEC2] = Tessellator.Program.F2V_UNIFY_FUNC;
            
            this[Tessellator.FLOAT] = Tessellator.Program.F1_UNIFY_FUNC;
            this[Tessellator.INT] = Tessellator.Program.I1_UNIFY_FUNC;
            
            this[Tessellator.SAMPLER_2D] = Tessellator.Program.BIND_TEXTURE_2D;
            this[Tessellator.SAMPLER_CUBE] = Tessellator.Program.BIND_TEXTURE_CUBE;
        }).call (Tessellator.Program.DEFAULT_UNIFORM_INHERITER);
        
        for (var o in Tessellator.Program.DEFAULT_UNIFORM_INHERITER){
            if (!Tessellator.Program.DEFAULT_UNIFORM_INHERITER[o].configure){
                Tessellator.Program.DEFAULT_UNIFORM_INHERITER[o].configure = Tessellator.Program.DEFAULT_CONFIG;
            }
        }
    }
    { //shader set DrawDependant
        Tessellator.ShaderSetDrawDependant = function (drawMode, shaders){
            this.drawMode = drawMode;
            this.shaders = shaders;
            this.loaded = true;
            
            for (var i = 0, k = this.shaders.length; i < k; i++){
                if (this.tessellator){
                    if (this.tessellator !== this.shaders[i].tessellator){
                        throw "not uniform tessellator!";
                    }
                }else{
                    this.tessellator = this.shaders[i].tessellator;
                }
            }
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.init = function (){
            if (this.shader){
                this.shader.init();
            }
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.postInit = function (){
            if (this.shader){
                this.shader.postInit();
            }
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.hasUniform = function (key){
            if (this.shader){
                return this.shader.hasUniform(key);
            }else{
                return this.shaders[0].hasUniform(key);
            } 
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.set = function (matrix, render, draw){
            for (var i = 0, k = this.drawMode.length; i < k; i++){
                if (draw.drawMode === this.drawMode[i]){
                    this.shader = this.shaders[i]
                    this.uniforms = this.shader.uniforms;
                    this.attribs = this.shader.attribs;
                    
                    if (this.shader.loaded){
                        return true;
                    }else{
                        return false;
                    }
                }
            }
            
            return false;
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.postSet = function (){}
        
        Tessellator.ShaderSetDrawDependant.prototype.setInheriter = function (key, value){
            for (var i = 0, k = this.shaders.length; i < k; i++){
                this.shaders[i].setInheriter(key, value);
            }
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.dispose = function (key, value){
            for (var i = 0, k = this.shaders.length; i < k; i++){
                this.shaders[i].dispose();
            }
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.unify = function (matrix){
            this.shader.unify(matrix);
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.preUnify = function (matrix){
            this.shader.preUnify(matrix);
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.uniform = function (key, value, matrix){
            this.shader.uniform(key, value, matrix);
        }
        
        Tessellator.ShaderSetDrawDependant.prototype.bind = function (){
            return this.shader.bind();
        }
    }
    { //shader preset
        Tessellator.ShaderPreset = function (create){
            this.create = create;
        }
        
        Tessellator.ShaderPreset.prototype.configureDrawDependant = function (svert1, sfrag1, svert2, sfrag2, svert3, sfrag3){
            this.create = function (tessellator){
                return new Tessellator.ShaderSetDrawDependant(
                    [
                        Tessellator.COLOR,
                        Tessellator.TEXTURE,
                        Tessellator.LINE
                    ],
                    [
                        tessellator.createShaderProgram(svert1, sfrag1),
                        tessellator.createShaderProgram(svert2, sfrag2),
                        tessellator.createShaderProgram(svert3, sfrag3),
                    ]
                );
            }
            
            return this;
        }
        
        Tessellator.ShaderPreset.prototype.configureStandardPair = function (svert, sfrag){
            this.create = function (tessellator) {
                return tessellator.createShaderProgram(svert, sfrag);
            }
            
            return this;
        }
    }
}
{ //creation
    Tessellator.prototype.createModelFromJSON = function (json, model){
        if (!json){
            throw "json model must be given";
        }
        
        if (!model){
            model = this.createModel();
        }
        
        model.start(Tessellator.NORMAL);
        model.setVertex(json.vertexNormals);
        model.end();
        
        model.start(Tessellator.TEXTURE);
        model.setVertex(json.vertexTextureCoords);
        model.end();
        
        model.start(Tessellator.TRIANGLE);
        model.setVertex(json.vertexPositions);
        model.end(json.indices);
        
        return model.update();
    }
    
    Tessellator.prototype.create3DTextureModel = function (texture, width, height, depth){
        var model = this.createModel();
        
        var builder = function(){
            model.bindTexture(texture);
            model.depthMask(0);
            
            model.start(Tessellator.TEXTURE);
            model.setVertex(
                0, 0,
                1, 0,
                1, 1,
                0, 1,
                
                1, 0,
                0, 0,
                0, 1,
                1, 1
            );
            
            for (var x = 0; x < texture.width; x++){
                var c = x / texture.width;
                
                model.setVertex([
                    c, 0,
                    c - 1 / texture.width, 0,
                    c - 1 / texture.width, 1,
                    c, 1,
                    
                    c, 0,
                    c + 1 / texture.width, 0,
                    c + 1 / texture.width, 1,
                    c, 1
                ]);
            }
            
            for (var y = 0; y < texture.height; y++){
                var c = y / texture.height;
                
                model.setVertex([
                    0, c,
                    0, c - 1 / texture.width,
                    1, c - 1 / texture.width,
                    1, c,
                    
                    0, c,
                    0, c + 1 / texture.width,
                    1, c + 1 / texture.width,
                    1, c
                ]);
            }
            
            model.end();
            model.start(Tessellator.QUAD);
            model.setVertex(
                0, 0, 0,
                width, 0, 0,
                width, height, 0,
                0, height, 0,
                
                width, 0, -depth,
                0, 0, -depth,
                0, height, -depth,
                width, height, -depth
            );
            
            for (var x = 0; x < texture.width; x++){
                var c = x / texture.width * width;
                
                model.setVertex(
                    c, 0, 0,
                    c, 0, -depth,
                    c, height, -depth,
                    c, height, 0,
                    
                    c, 0, -depth,
                    c, 0, 0,
                    c, height, 0,
                    c, height, -depth
                );
            }
            
            for (var y = 0; y < texture.height; y++){
                var c = y / texture.height * height;
                
                model.setVertex(
                    0, c, -depth,
                    0, c, 0,
                    width, c, 0,
                    width, c, -depth,
                    
                    0, c, 0,
                    0, c, -depth,
                    width, c, -depth,
                    width, c, 0
                );
            }
            
            model.end();
            model.finish();
        }
        
        texture.addListener(builder);
        
        return model;
    }
    
    Tessellator.prototype.loadJSONModel = function (url, model){
        var request = new XMLHttpRequest();
        request.open("GET", url);
        
        if (!model){
            model = this.createMpdel();
        }
        
        request.onreadystatechange = function () {
            if (request.readyState === 4){
                if (request.status < 200 || request.status >= 300){
                    console.error("Unable to load resource: " + url + ", server responded with: " + request.status + " (" + request.statusText + ")");
                }else{
                    model.tessellator.createModelFromJSON(JSON.parse(request.responseText), model);
                }
            }
        }
        
        request.send();
        
        return model;
    }
    
    Tessellator.prototype.getObjectAttribBySuffix = function (object, suffix){
        for (var o in object){
            if (o.toLowerCase().indexOf(suffix, o.length - suffix.length) !== -1){
                return object[o];
            }
        }
    }
    
    Tessellator.prototype.getPointerLock = function (){
        return this.getObjectAttribBySuffix(document, "pointerlockelement");
    }
    
    Tessellator.prototype.hasPointerLock = function (){
        return this.pointerLock;
    }
    
    Tessellator.prototype.aquirePointerLock = function (){
        if (this.getPointerLock() !== this.canvas){
            this.getObjectAttribBySuffix(this.canvas, "requestpointerlock").call(this.canvas);
            
            this.pointerLock = {
                event: (function (tessellator) {
                    return function (e){
                        if (!e || tessellator.getPointerLock() !== tessellator.canvas){
                            document.removeEventListener("pointerlockchange", tessellator.pointerLock.event);
                            document.removeEventListener("mozpointerlockchange", tessellator.pointerLock.event);
                            document.removeEventListener("webkitpointerlockchange", tessellator.pointerLock.event);
                            
                            tessellator.getObjectAttribBySuffix(document, "exitpointerlock").call(document);
                            
                            tessellator.pointerLock = null;
                        }
                    }
                })(this),
            }
            
            document.addEventListener("pointerlockchange", this.pointerLock.event);
            document.addEventListener("mozpointerlockchange", this.pointerLock.event);
            document.addEventListener("webkitpointerlockchange", this.pointerLock.event);
        }
    }
    
    Tessellator.prototype.releasePointerLock = function (){
        if (this.pointerLock){
            this.pointerLock.event();
        }
    }
    
    Tessellator.prototype.requestFullscreen = function (){
        if (tessellator.getObjectAttribBySuffix(document, "fullscreenelement") !== tessellator.canvas){
            this.getObjectAttribBySuffix(this.canvas, "requestfullscreen").call(this.canvas);
            
            this.fullscreen = {
                style: this.canvas.style.cssText,
                event: (function (tessellator){
                    return function (e){
                        if (!e || tessellator.getObjectAttribBySuffix(document, "fullscreenelement") !== tessellator.canvas){
                            tessellator.canvas.style.cssText = tessellator.fullscreen.style;
                            tessellator.forceCanvasResize();
                            
                            tessellator.canvas.removeEventListener("fullscreenchange", tessellator.fullscreen.event);
                            tessellator.canvas.removeEventListener("webkitfullscreenchange", tessellator.fullscreen.event);
                            tessellator.canvas.removeEventListener("mozfullscreenchange", tessellator.fullscreen.event);
                            
                            tessellator.getObjectAttribBySuffix(document, "exitfullscreen").call(document);
                            
                            tessellator.fullscreen = null;
                        }
                    }
                })(this),
            }
            
            this.canvas.style.cssText = "width:100%;height:100%;display:block;top:0px;left:0px;";
            
            this.forceCanvasResize();
            
            this.canvas.addEventListener("fullscreenchange", this.fullscreen.event);
            this.canvas.addEventListener("webkitfullscreenchange", this.fullscreen.event);
            this.canvas.addEventListener("mozfullscreenchange", this.fullscreen.event);
        }
    }
    
    Tessellator.prototype.isFullscreen = function (){
        return this.fullscreen;
    }
    
    Tessellator.prototype.exitFullscreen = function (){
        if (this.fullscreen){
            this.fullscreen.event();
        }
    }
}
{ //render loop
    Tessellator.prototype.createRenderLoop = function (){
        return Tessellator.new.apply(Tessellator.RenderLoop, arguments);
    }
    
    Tessellator.RenderLoop = function (){
        if (arguments.length === 1 && arguments[0].constructor === Tessellator.RenderLoop.Item){
            this.item = arguments[0];
        }else{
            this.item = null;
                
            if (arguments.length > 0){
                this.item = Tessellator.new.apply(Tessellator.RenderLoop.Item, arguments);
            }
        }
        
        var self = this;
        
        this.renderLoop = function (){
            if (self.item){
                if (self.item.render()){
                    window.requestAnimationFrame(self.renderLoop);
                }
            }
        }
        
        this.eventLoop = function (){
            if (self.item){
                self.item.event();
            }
        }
        
        window.setInterval(this.eventLoop, 1000);
        window.requestAnimationFrame(this.renderLoop);
    }
    
    Tessellator.RenderLoop.prototype.getFPS = function (){
        return this.item.fps;
    }
    
    Tessellator.RenderLoop.prototype.getRenderTime = function (){
        return this.item.renderTime;
    }
    
    Tessellator.RenderLoop.prototype.setRenderer = function (renderer){
        this.item.renderer = renderer;
    }
    
    Tessellator.RenderLoop.prototype.setModel = function (model){
        this.item.model = model;
    }
    
    Tessellator.RenderLoop.Item = function (){
        this.frames = 0;
        this.lastSample = 0;
        
        if (arguments.length === 1){
            if (arguments[0].type === Tessellator.MODEL){
                this.model = arguments[0];
            }else{
                this.renderer = arguments[0];
            }
            
        }else if (arguments.length === 2){
            this.renderer = arguments[0];
            this.model = arguments[1];
        }else if (arguments.length === 3){
            this.renderer = arguments[0];
            this.model = arguments[1];
            this.maxFPS = arguments[2];
        }
        
        if (this.maxFPS){
            var self = this;
            
            window.setInterval(function (){
                window.requestAnimationFrame(function (){
                    self.render();
                });
            }, 1000 / this.maxFPS);
        }
    }
    
    Tessellator.RenderLoop.Item.prototype.render = function (){
        this.frames++;
        this.lastRender = Date.now();
        
        if (this.renderer){
            this.renderer.render(null, this.model);
        }else{
            this.model.renderModel();
        }
        
        this.renderTime = Date.now() - this.lastRender;
        
        return !this.maxFPS;
    }
    
    Tessellator.RenderLoop.Item.prototype.event = function (){
        this.fps = this.frames - this.lastSample;
        
        this.lastSample = this.frames;
    }
}
{ //render queue
    Tessellator.RenderQueue = function (){
        this.queue = [];
        
        for (var i = 0; i < arguments.length; i++){
            this.queue.push({
                render: arguments[i],
            });
        }
    }


    Tessellator.RenderQueue.add = function (renderer, arg){
        this.queue.push({
            render: renderer,
            arg: arg,
        });
    }


    Tessellator.RenderQueue.remove = function (renderer){
        for (var i = 0, k = this.queue.length; i < k; i++){
            if (this.queue[i].render == renderer){
                this.queue.splice(i, i + 1);
                
                return true;
            }
        }
        
        return false;
    }


    Tessellator.RenderQueue.removeModel = function (arg){
        for (var i = 0, k = this.queue.length; i < k; i++){
            if (this.queue[i].arg === arg){
                this.queue.splice(i, i + 1);
                
                return true;
            }
        }
        
        return false;
    }


    Tessellator.RenderQueue.clear = function (){
        this.queue = [];
    }


    Tessellator.RenderQueue.prototype.render = function (){
        for (var i = 0, k = this.queue.length; i < k; i++){
            this.queue[i].render.render(null, this.queue[i].arg);
        }
    }
}
{ //render matrix
    Tessellator.RenderMatrix = function (renderer, parent){
        this.uniforms = {};
        this.renderer = renderer;
        this.tessellator = renderer.tessellator;
        this.parent = parent;
        
        if (parent){
            this.copyUniforms(parent);
        }else{
            this.changes = {};
            this.index = 0;
            
            renderer.configure(this);
        }
    }
    
    Tessellator.RenderMatrix.prototype.copyUniforms = function (parent){
        for (var o in parent.uniforms){
            this.uniforms[o] = parent.uniforms[o];
        }
        
        this.changes = parent.changes;
        this.index = parent.index + 1;
    }
    
    Tessellator.RenderMatrix.prototype.dirty = function (item){
        if (item){
            this.changes[item] = -1;
        }else for (var o in this.changes){
            this.changes[o] = -1;
        }
    }
    
    Tessellator.RenderMatrix.prototype.exists = function (key){
        return this.renderer.shader.hasUniform(key);
    }
    
    Tessellator.RenderMatrix.prototype.set = function (key, value){
        this.dirty(key);
        
        return this.uniforms[key] = value;
    }
    
    //new set. will not set if there is already a value
    Tessellator.RenderMatrix.prototype.setn = function (key, value){
        if (!this.uniforms[key]){
            this.dirty(key);
            
            return this.uniforms[key] = value;
        }
    }
    
    Tessellator.RenderMatrix.prototype.get = function (key){
        this.dirty(key);
        
        return this.uniforms[key];
    }
    
    //sneaky get. does not set the value dirty
    Tessellator.RenderMatrix.prototype.gets = function (key){
        return this.uniforms[key];
    }

    Tessellator.RenderMatrix.prototype.unify = function (){
        var s = this.renderer.shader;
        var c = false;
        
        for (var o in this.uniforms){
            if (this.changes[o] < 0 || this.changes[o] > this.index){
                s.uniform(o, this.uniforms[o], this);
                
                this.changes[o] = this.index;
                
                c = true;
            }
        }
        
        if (c){
            s.unify(this);
        }
    }
    
    Tessellator.RenderMatrix.prototype.unifyAll = function (){
        var s = this.renderer.shader;
        
        for (var o in this.uniforms){
            s.uniform(o, this.uniforms[o], this);
            
            this.changes[o] = this.index;
        }
        
        s.unify(this);
    }
    
    Tessellator.RenderMatrix.prototype.has = function (key){
        if (this.uniforms[key] !== undefined){
            return true;
        }else{
            return false;
        }
    }


    Tessellator.RenderMatrix.prototype.copy = function () {
        return new Tessellator.RenderMatrix(this.renderer, this);
    }
}
{ //renderers
    { //abstract renderer
        Tessellator.RendererAbstract = function (shader){
            if (!shader){
                this.tessellator = null;
            }else if (shader.constructor === Tessellator){
                this.tessellator = shader;
            }else{
                this.tessellator = shader.tessellator;
                this.shader = shader;
            }
            
            this.startTime = Date.now();
        }
        
        Tessellator.RendererAbstract.prototype.setShader = function (shader){
            if (!this.tessellator || shader.tessellator === this.tessellator){
                this.tessellator = shader.tessellator;
                this.shader = shader;
            }else{
                throw "incompatible shader";
            }
            
            return this;
        }
        
        Tessellator.RendererAbstract.prototype.render = function (matrix, arg){
            if (!matrix){
                this.preRender();
                this.renderNew(new Tessellator.RenderMatrix(this), arg);
                this.postRender();
            }else{
                this.renderNew(matrix, arg);
            }
        }
        
        Tessellator.RendererAbstract.prototype.setUniformSetter = function (setter){
            this.uniformSetter = setter;
            
            return this;
        }
        
        Tessellator.RendererAbstract.prototype.renderNew = function (matrix, arg){
            if (arguments.length === 1){
                arg = matrix;
                matrix = new Tessellator.RenderMatrix(this);
            }
            
            if (!this.shader){
                return;
            }else if (!this.shader.loaded){
                return;
            }
            
            if (this.init(matrix, arg) !== false){
                this.enableRenderer();
                this.renderRaw(matrix, arg);
                this.disableRenderer();
            }
        }
        
        Tessellator.RendererAbstract.prototype.init = Tessellator.EMPTY_FUNC;
        
        Tessellator.RendererAbstract.prototype.configure = function (matrix){
            if (this.shader){
                this.shader.setInheriter("blendFunc", Tessellator.Program.BLEND_FUNC);
                this.shader.setInheriter("depthMask", Tessellator.Program.DEPTH_MASK);
                this.shader.setInheriter("window", Tessellator.Program.UNIFY_WINDOW);
                
                matrix.setn("window", Tessellator.vec2(this.tessellator.width, this.tessellator.height));
                matrix.setn("time", (Date.now() - this.startTime) / 1000);
                matrix.setn("blendFunc", Tessellator.BLEND_DEFAULT);
                matrix.setn("depthMask", 1);
                
                if (this.uniformSetter){
                    this.uniformSetter(matrix);
                }
            }
        }
        
        Tessellator.RendererAbstract.prototype.enableRenderer = function (){
            this.shader.init(this)
        }
        
        Tessellator.RendererAbstract.prototype.disableRenderer = function (){
            this.shader.postInit(this);
        }
        
        Tessellator.RendererAbstract.prototype.preRender = function (){
            this.tessellator.preRender();
        }
        
        Tessellator.RendererAbstract.prototype.postRender = function (){
            this.tessellator.postRender();
        }
        
        Tessellator.RendererAbstract.prototype.renderRaw = function (){
            throw "abstract function not extended";
        }
    }
    { //model base renderer
        Tessellator.ModelBaseRenderer = function (shader){
            this.super(shader);
        }
        
        Tessellator.extend(Tessellator.ModelBaseRenderer, Tessellator.RendererAbstract);
        
        Tessellator.ModelBaseRenderer.prototype.handleDefault = function (mod, matrix, model){
            if (mod.type === Tessellator.MODEL){
                if (mod.render){
                    var thing = this.matrixCache.pop();
                    thing = thing ? thing.copy(matrix.get("mvMatrix")) : matrix.get("mvMatrix").clone();
                    
                    if (mod.renderer){
                        var copy = new Tessellator.RenderMatrix(mod.renderer);
                        copy.copyUniforms(matrix);
                        copy.set("mvMatrix", thing);
                        copy.dirty();
                        
                        this.disableRenderer();
                        mod.renderer.renderNew(copy, mod);
                        this.enableRenderer();
                    }else{
                        var copy = matrix.copy();
                        
                        copy.set("mvMatrix", thing);
                        
                        this.renderRaw(copy, mod);
                    }
                    
                    this.matrixCache.push(thing);
                }
                
                return true;
            }else if (mod.type === Tessellator.MODEL_FRAGMENT){
                if (mod.render){
                    this.renderRaw(matrix, mod);
                }
                
                return true;
            }else if (mod.subtype === Tessellator.VERTEX){
                mod.apply(matrix, model);
                
                return true;
            }
            
            return false;
        }
        
        Tessellator.ModelBaseRenderer.prototype.matrixCache = [];
    }
    { //model view renderer
        Tessellator.ModelViewRenderer = function (shader){
            this.super(shader);
        }
        
        Tessellator.copyProto(Tessellator.ModelViewRenderer, Tessellator.ModelBaseRenderer);
        
        Tessellator.ModelViewRenderer.prototype.setLighting = function (model, matrix, lighting, index){
            if (!matrix){
                matrix = Tessellator.mat4();
                
                return this.setLighting(model, matrix, lighting, 0);
            }else{
                for (var i = 0, k = model.model.length; i < k; i++){
                    var action = model.model[i];
                    
                    if (action.subtype === Tessellator.CAMERA){
                        matrix.identity();
                        
                        var thing = [ action ];
                        
                        while (thing[thing.length - 1].view){
                            thing.push(thing[thing.length - 1].view);
                        }
                        
                        for (var ii = thing.length - 1; ii >= 0; ii--){
                            if (thing[ii].subtype === Tessellator.CAMERA){
                                thing[ii].set(matrix);
                            }
                        }
                    }else if (action.type === Tessellator.VIEW){
                        matrix.identity();
                    }else if (action.type === Tessellator.TRANSLATE){
                        action.set(matrix);
                    }else if (action.type === Tessellator.ROTATE){
                        action.set(matrix);
                    }else if (action.type === Tessellator.SCALE){
                        action.set(matrix);
                    }else if (action.subtype === Tessellator.LIGHTING){
                        index += action.set(lighting, index, matrix) * 4;
                        
                        if (this.lightIndex >= Tessellator.MODEL_VIEW_LIGHT_UNIFORM_SIZE){
                            console.error("too many lights!");
                        }
                    }else if (action.type === Tessellator.MODEL){
                        if (action.render){
                            var thing = this.matrixCache.pop();
                            
                            thing = thing ? thing.copy(matrix) : matrix.clone();
                            
                            index = this.setLighting(action, thing, lighting, index);
                            
                            this.matrixCache.push(thing);
                        }
                    }
                }
                
                return index;
            }
        }
        
        Tessellator.ModelViewRenderer.prototype.configure = function (matrix){
            this.shader.setInheriter("mvMatrix", Tessellator.Program.MV_MATRIX_UNIFY_FUNC);
            
            matrix.set("mvMatrix", Tessellator.mat4());
            matrix.set("mask", Tessellator.vec4(1, 1, 1, 1));
            matrix.set("clip", Tessellator.NO_CLIP);
            matrix.set("lights", Tessellator.NO_LIGHT);
            matrix.set("specular", 0);
            
            this.super.configure(matrix);
        }
        
        Tessellator.ModelViewRenderer.prototype.init = function (matrix, model){
            if (!model.render){
                return false;
            }
            
            var lighting = new Float32Array(Tessellator.MODEL_VIEW_LIGHT_UNIFORM_SIZE * 4);
            
            this.setLighting(model, matrix.get("pMatrix") ? matrix.get("pMatrix").clone().multiply(matrix.get("mvMatrix")) : null, lighting, 0);
            
            matrix.set("lighting", lighting);
        }


        Tessellator.ModelViewRenderer.prototype.renderRaw = function (renderMatrix, model){
            for (var i = 0, k = model.model.length; i < k; i++){
                var mod = model.model[i];
                
                if (!this.handleDefault(mod, renderMatrix, model)){
                    mod.apply(renderMatrix, model);
                }
            }
        }
    }
    { //no lighting model view renderer
        Tessellator.ModelViewNoLightingRenderer = function (shader){
            this.super(shader);
        }
        
        Tessellator.copyProto(Tessellator.ModelViewNoLightingRenderer, Tessellator.ModelBaseRenderer);
        
        Tessellator.ModelViewNoLightingRenderer.prototype.configure = function (matrix){
            matrix.set("mvMatrix", Tessellator.mat4());
            matrix.set("mask", Tessellator.vec4(1, 1, 1, 1));
            matrix.set("clip", Tessellator.NO_CLIP);
            
            this.super.configure(matrix);
        }
        
        Tessellator.ModelViewNoLightingRenderer.prototype.init = function (matrix, model){
            if (!model.render){
                return false;
            }
        }
        
        Tessellator.ModelViewNoLightingRenderer.prototype.renderRaw = function (renderMatrix, model){
            for (var i = 0, k = model.model.length; i < k; i++){
                var mod = model.model[i];
                
                if (!this.handleDefault(mod, renderMatrix, model)){
                    if (mod.type === Tessellator.CLEAR){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.VIEW){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.ENABLE){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.DISABLE){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.CLIP){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.TRANSLATE){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.ROTATE){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.SCALE){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.MASK){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.TEXTURE){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.BLEND_FUNC){
                        mod.apply(renderMatrix, model);
                    }
                }
            }
        }
    }
    { //depth map renderer
        Tessellator.DepthMapRenderer = function (shader){
            this.super(shader);
        }
        
        Tessellator.copyProto(Tessellator.DepthMapRenderer, Tessellator.ModelBaseRenderer);
        
        Tessellator.DepthMapRenderer.prototype.configure = function (matrix){
            matrix.set("mvMatrix", Tessellator.mat4());
            
            this.super.configure(matrix);
        }
        
        Tessellator.DepthMapRenderer.prototype.renderRaw = function (renderMatrix, model){
            for (var i = 0, k = model.model.length; i < k; i++){
                var mod = model.model[i];
                
                if (mod.type === Tessellator.MODEL){
                    if (mod.render){
                        var copy = renderMatrix.copy();
                        
                        copy.set("mvMatrix", copy.get("mvMatrix").clone());
                        
                        this.renderRaw(copy, mod);
                    }
                }else if (!this.handleDefault(mod, renderMatrix, model)){
                    if (mod.type === Tessellator.CLEAR){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.VIEW){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.TRANSLATE){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.ROTATE){
                        mod.apply(renderMatrix, model);
                    }else if (mod.type === Tessellator.SCALE){
                        mod.apply(renderMatrix, model);
                    }else if (mod.constructor === Tessellator.ObjectDrawer){
                        mod.apply(renderMatrix, model);
                    }
                }
            }
        }
    }
    { //full screen renderer
        Tessellator.FullScreenRenderer = function (shader){
            this.super(shader);
            
            this.object = new Tessellator.Object(this.tessellator, Tessellator.TRIANGLE);
            
            this.object.setAttribute("position", Tessellator.VEC2, new Tessellator.Array([
                -1, -1,
                1, -1,
                1, 1,
                -1, 1
            ]), Int8Array);
            
            this.object.resetIndices(Uint8Array);
            
            this.object.getIndices().push([
                0, 1, 2,
                0, 2, 3
            ]);
            
            this.object.upload();
            this.object.useOES();
        }
        
        Tessellator.copyProto(Tessellator.FullScreenRenderer, Tessellator.RendererAbstract);
        
        Tessellator.FullScreenRenderer.prototype.setAspect = function(aspect){
            this.aspect = aspect;
            
            return this;
        }
        
        Tessellator.FullScreenRenderer.prototype.renderRaw = function (matrix){
            if (this.aspect){
                var g = !isNaN(this.aspect);
                
                if (!g){
                    if (!isNaN(this.aspect.getAspect())){
                        g = this.aspect.getAspect();
                    }
                }else{
                    g = this.aspect;
                }
                
                if (g){
                    var window = matrix.get("window");
                    var currentAspect = window[0] / window[1];
                    
                    matrix.set("aspect", Tessellator.vec2(
                        Math.min(0, g / currentAspect - 1), 
                        Math.min(0, currentAspect / g - 1)
                    ));
                }else{
                    matrix.set("aspect", Tessellator.vec2());
                }
            }else{
                matrix.set("aspect", Tessellator.vec2());
            }
            
            var gl = this.tessellator.GL;
            
            gl.disable(gl.DEPTH_TEST);
            
            this.object.render(matrix);
            
            gl.enable(gl.DEPTH_TEST);
        }
    }
    { //full screen texture renderer
        Tessellator.FullScreenTextureRenderer = function (shader){
            this.super(shader);
            
            if (arguments.length > 1){
                this.textures = Array.prototype.slice.call(arguments, 1, arguments.length);
            }
        }
        
        Tessellator.copyProto(Tessellator.FullScreenTextureRenderer, Tessellator.FullScreenRenderer);
        
        Tessellator.FullScreenTextureRenderer.prototype.setTextures = function (textures){
            this.textures = textures;
            
            return this;
        }
        
        Tessellator.FullScreenTextureRenderer.prototype.setResolutionScale = function (res){
            if (isNaN(res)){
                this.res = res;
            }else{
                this.res = Tessellator.vec2(res);
            }
        }
        
        Tessellator.FullScreenTextureRenderer.prototype.setRenderer = function (renderer){
            this.rendererAttachment.renderer = renderer;
        }
        
        Tessellator.FullScreenTextureRenderer.prototype.renderRaw = function (render, arg){
            if (this.textures){
                for (var i = 0; i < this.textures.length; i++){
                    if (i === 0){
                        render.set("sampler", this.textures[0]);
                    }else{
                        render.set("sampler" + (i + 1).toString(), this.textures[i]);
                    }
                }
                
                this.super.renderRaw(render, arg);
            }
        }
    }
    { //buffer renderer
        Tessellator.BufferedRenderer = function (shader, renderer, res, bufferAttachments){
            if (shader.constructor === String){
                shader = renderer.tessellator.createPixelShader(shader);
            }else if (shader.constructor === Tessellator){
                shader = shader.createPixelShader(Tessellator.PIXEL_SHADER_PASS);
            }else if (shader.constructor !== Tessellator.Program){
                bufferAttachments = res;
                res = renderer;
                renderer = shader;
                
                shader = shader.tessellator.createPixelShader(Tessellator.PIXEL_SHADER_PASS);
            }
            
            this.super(shader);
            
            this.rendererAttachment = new Tessellator.TextureModel.AttachmentRenderer(renderer);
            this.res = Tessellator.vec2(res || 1);
            this.bufferAttachments = bufferAttachments;
            
            if (this.bufferAttachments){
                this.bufferAttachments.push(this.rendererAttachment);
            }else{
                this.bufferAttachments = [
                    new Tessellator.TextureModel.AttachmentColor(),
                    this.rendererAttachment
                ]
            }
        }
        
        Tessellator.copyProto(Tessellator.BufferedRenderer, Tessellator.FullScreenRenderer);
        
        Tessellator.BufferedRenderer.prototype.setResolutionScale = function (res){
            if (isNaN(res)){
                this.res = res;
            }else{
                this.res = Tessellator.vec2(res);
            }
        }
        
        Tessellator.BufferedRenderer.prototype.setRenderer = function (renderer){
            this.rendererAttachment.renderer = renderer;
        }
        
        Tessellator.BufferedRenderer.prototype.renderRaw = function (render, arg){
            if (this.rendererAttachment.renderer){
                if (!this.buffer){
                    this.buffer = new Tessellator.TextureModel(this.tessellator, render.get("window")[0] * this.res[0], render.get("window")[1] * this.res[1], this.bufferAttachments);
                    
                    this.buffer.autoUpdate = false;
                }else if (
                    this.buffer.width !== render.get("window")[0] * this.res[0] ||
                    this.buffer.height !== render.get("window")[1] * this.res[0]
                ){
                    this.buffer.setSize(
                        render.get("window")[0] * this.res[0],
                        render.get("window")[1] * this.res[1]
                    );
                }
                
                this.rendererAttachment.arg = arg;
                
                this.buffer.update(render);
                render.set("sampler", this.buffer);
                
                this.tessellator.GL.disable(this.tessellator.GL.BLEND);
                
                this.super.renderRaw(render, arg);
                
                this.tessellator.GL.enable(this.tessellator.GL.BLEND);
            }
        }
        
        Tessellator.BufferedRenderer.prototype.renderObject = function (){
            this.tessellator.GL.disable(this.tessellator.GL.BLEND);
            
            this.super.renderRaw(render, arg);
            
            this.tessellator.GL.enable(this.tessellator.GL.BLEND);
        }
    }
    { //fill renderer
        Tessellator.FillRenderer = function (renderer){
            this.color = Tessellator.getColor(Array.prototype.slice.call(arguments, 1, arguments.length));
            this.renderer = renderer;
            
            this.super(renderer.tessellator.createPixelShader(Tessellator.PIXEL_SHADER_COLOR));
        }
        
        Tessellator.extend(Tessellator.FillRenderer, Tessellator.FullScreenRenderer);
        
        Tessellator.FillRenderer.prototype.renderRaw = function (render, arg){
            render.set("color", this.color);
            
            this.super.renderRaw(render);
            
            var newrender = new Tessellator.RenderMatrix(this.renderer);
            newrender.set("window", render.gets("window"));
            
            this.renderer.renderNew(newrender, arg);
        }
    }
    { //pixel shader renderer
        Tessellator.PixelShaderRenderer = Tessellator.BufferedRenderer;
    }
    { //atlas renderer
        Tessellator.AtlasRenderer = function (tessellator){
            this.super(Tessellator.ATLAS_SHADER.create(tessellator));
        }
        
        Tessellator.copyProto(Tessellator.AtlasRenderer, Tessellator.FullScreenRenderer);
        
        Tessellator.AtlasRenderer.prototype.NO_MASK = Tessellator.vec4(1, 1, 1, 1);
        
        Tessellator.AtlasRenderer.prototype.renderRaw = function (render, atlas){
            var gl = this.tessellator.GL;
            
            gl.blendFunc(Tessellator.SRC_ALPHA, Tessellator.ONE_MINUS_SRC_ALPHA);
            gl.disable(gl.BLEND);
            
            render.set("atlasDims", Tessellator.vec2(atlas.atlas.length, atlas.atlas[0].length));
            
            for (var i = 0; i < atlas.updateCache.length; i++){
                var textures = atlas.updateCache[i];
                var ii;
                
                render.set("atlas", textures.pos);
                
                for (ii = 0; ii < textures.length; ii++){
                    var texture = textures[ii];
                    
                    if (texture.mask){
                        render.set("mask", texture.mask);
                    }else{
                        render.set("mask", this.NO_MASK);
                    }
                    
                    if (ii > 0){
                        gl.enable(gl.BLEND);
                    }
                    
                    render.set("sampler", texture.texture);
                    this.super.renderRaw(render);
                }
                
                if (ii > 1){
                    gl.disable(gl.BLEND);
                }
                
                if (textures.remove){
                    textures.updating = false;
                    
                    atlas.updateCache.splice(i, 1);
                    i -= 1;
                }
            }
            
            gl.enable(gl.BLEND);
        }
    }
    { //atlas animation renderer
        Tessellator.AtlasAnimationRenderer = function (shader){
            this.super(shader);
            
            this.buffer = new Tessellator.Array(new Float32Array(8));
            
            this.object.setAttribute("textureCoord", Tessellator.VEC2, this.buffer, Float32Array, false, Tessellator.DYNAMIC);
            this.object.upload();
        }
        
        Tessellator.copyProto(Tessellator.AtlasAnimationRenderer, Tessellator.FullScreenRenderer);
        
        Tessellator.AtlasAnimationRenderer.prototype.renderRaw = function (render, texture){
            render.set("sampler", texture.src);
            
            var gl = this.tessellator.GL;
            
            var frame = texture.frame;
            var frames = texture.frames;
            
            if (texture.src.width === texture.size){
                this.buffer.set(0, 0);
                this.buffer.set(2, 1);
                this.buffer.set(4, 1);
                this.buffer.set(6, 0);
                
                this.buffer.set(1, frame / frames);
                this.buffer.set(3, frame / frames);
                this.buffer.set(5, (frame + 1) / frames);
                this.buffer.set(7, (frame + 1) / frames);
            }else{
                this.buffer.set(1, 0);
                this.buffer.set(3, 1);
                this.buffer.set(5, 1);
                this.buffer.set(7, 0);
                
                this.buffer.set(0, frame / frames);
                this.buffer.set(2, frame / frames);
                this.buffer.set(4, (frame + 1) / frames);
                this.buffer.set(6, (frame + 1) / frames);
            }
            
            this.object.setAttributeData("textureCoord", this.buffer);
            
            gl.disable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
            
            this.object.render(render);
            
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
        }
    }
}
{ //initializer
    Tessellator.Initializer = function (tessellator, inheritFrom){
        this.tessellator = tessellator;
        
        this.model = [];
        this.finished = false;
        
        this.attribs = {};
        
        if (inheritFrom){
            for (var o in inheritFrom.attribs){
                this.attribs[o] = inheritFrom.attribs[o];
            }
        }else{
            for (var o in Tessellator.Initializer.defaults){
                this.attribs[o] = Tessellator.Initializer.defaults[o](this);
            }
        }
    }
    
    Tessellator.Initializer.prototype.get = function (key){
        return this.attribs[key];
    }
    
    Tessellator.Initializer.prototype.getr = function (key){
        var value = this.attribs[key];
        this.attribs[key] = null;
        
        return value;
    }
    
    Tessellator.Initializer.prototype.getd = function (key, def){
        var value = this.attribs[key];
        
        if (!value){
            value = def;
            
            this.attribs[key] = value;
        }
        
        return value;
    }
    
    Tessellator.Initializer.prototype.set = function (key, value){
        return this.attribs[key] = value;
    }
    
    Tessellator.Initializer.defaults = {};
    
    Tessellator.Initializer.setDefault = function (key, value){
        Tessellator.Initializer.defaults[key] = value;
    }
    
    Tessellator.Initializer.prototype.push = function (action){
        var push = action.init(this);
        
        if (push !== null){
            if (push){
                this.model.push(push);
            }else{
                this.model.push(action);
            }
        }
        
        return push;
    }


    Tessellator.Initializer.prototype.finish = function (){
        this.flush();
        
        for (var i = 0; i < this.model.length; i++){
            this.model[i].postInit(this);
        }
        
        return this.model;
    }
}
{ //fragmented array
    Tessellator.FragmentedArray = function (size){
        this.length = 0;
        
        if (isNaN(size) && arguments.length){
            this.incrementSize = 8;
            
            this.elements = arguments.length;
            this.buffer = new Array(this.elements);
            
            for (var i = 0; i < this.elements; i++){
                this.buffer = arguments[i];
                this.length += arguments[i];
            }
        }else{
            this.incrementSize = size || 8;
            this.buffer = null;
            this.elements = 0;
        }
    }
    
    Tessellator.FragmentedArray.prototype.clear = function (){
        this.length = 0;
        this.buffer = null;
        this.elements = 0;
    }
    
    Tessellator.FragmentedArray.prototype.instance = function (value, copies){
        var a = new Float32Array(copies);
        
        for (var i = 0; i < a.length; a++){
            a[i] = value;
        }
        
        this.push(a);
    }
    
    Tessellator.FragmentedArray.prototype.removeElement = function (index){
        this.length -= this.buffer[index].length;
        for (var i = index; i < this.elements; i++){
            this.buffer[i] = this.buffer[i + 1];
        }
        
        this.elements--;
    }
    
    Tessellator.FragmentedArray.prototype.push = function (arg){
        if (!this.buffer){
            this.buffer = new Array(this.incrementSize);
        }else if (this.buffer.length === this.elements){
            this.buffer.length += this.incrementSize;
        }
        
        this.buffer[this.elements] = arg;
        
        this.length += arg.length;
        this.elements++;
    }
    
    Tessellator.FragmentedArray.prototype.offset = function (off){
        for (var i = 0; i < this.elements; i++){
            var e = this.buffer[i];
            
            for (var ii = 0; ii < e.length; ii++){
                e[ii] += off;
            }
        }
    }
    
    Tessellator.FragmentedArray.prototype.get = function (index){
        if (index < 0 || index > this.length){
            throw "index is out of range to access fragmented array";
        }
        
        var i, pos = this.length;
        
        for (i = this.elements - 1; pos > index; i--){
            pos -= this.buffer[i].length;
        }
        
        var e = this.buffer[i + 1];
        
        if (e.constructor === Tessellator.FragmentedArray){
            return e.get(index - pos);
        }else{
            return e[index - pos];
        }
    }
    
    Tessellator.FragmentedArray.prototype.set = function (index, value){
        var i, pos = this.length;
        
        for (i = this.elements - 1; pos > index; i--){
            pos -= this.buffer[i].length;
        }
        
        var e = this.buffer[i + 1];
        
        if (e.constructor === Tessellator.FragmentedArray){
            return e.set(index - pos, value);
        }else{
            return e[index - pos] = value;
        }
    }
    
    Tessellator.FragmentedArray.prototype.write = function (array, pos){
        for (var i = 0; i < this.elements; i++){
            var e = this.buffer[i];
            
            if (e.constructor === Tessellator.FragmentedArray){
                e.write(array, pos);
            }else{
                array.set(e, pos);
            }
            
            pos += e.length;
        }
    }
    
    Tessellator.FragmentedArray.prototype.compress = function (){
        this.buffer = [ this.combine() ];
        this.elements = 1;
    }
    
    Tessellator.FragmentedArray.prototype.combine = function (func){
        var arr = new (func || Float32Array)(this.length);
        
        this.write(arr, 0);
        
        return arr;
    }
}
{ //array
    Tessellator.Array = function (buffer){
        this.buffer = buffer || [];
        this.length = this.buffer.length;
    }
    
    Tessellator.Array.clear = function (){
        this.buffer = [];
        this.length = 0;
    }
    
    Tessellator.Array.prototype.instance = function (value, copies){
        var a = new Float32Array(copies);
        
        for (var i = 0; i < a.length; a++){
            a[i] = value;
        }
        
        this.push(a);
    }
    
    Tessellator.Array.prototype.push = function (arg){
        if (arg.constructor === Tessellator.Array){
            this.buffer.push.apply(this.buffer, arg.buffer);
        }else{
            this.buffer.push.apply(this.buffer, arg);
        }
        
        this.length += arg.length;
    }
    
    Tessellator.Array.prototype.offset = function (off){
        for (var i = 0; i < this.length; i++){
            this.buffer[i] += off;
        }
    }
    
    Tessellator.Array.prototype.get = function (index){
        return this.buffer[index];
    }
    
    Tessellator.Array.prototype.set = function (index, value){
        this.buffer[index] = value;
    }
    
    Tessellator.Array.prototype.write = function (array, pos){
        array.set(this.buffer, pos);
    }
    
    Tessellator.Array.prototype.compress = function (){
        this.buffer = [ this.combine() ];
        this.elements = 1;
    }
    
    Tessellator.Array.prototype.combine = function (func){
        if (this.buffer.constructor === func){
            return this.buffer;
        }
        
        var arr = new (func || Float32Array)(this.length);
        
        this.write(arr, 0);
        
        return arr;
    }
}
{ //model
    { //model
        Tessellator.prototype.renderModel = function (model, renderer){
            model.renderModel(renderer);
        }
        
        Tessellator.prototype.createModel = function (renderer){
            return new Tessellator.Model(this, renderer);
        }
        
        Tessellator.prototype.createMatrix = Tessellator.prototype.createModel;
        
        Tessellator.Model = function (tessellator, renderer){
            this.type = Tessellator.MODEL;
            
            this.render = false;
            this.disposable = true;
            this.disposed = false;
            this.renderer = renderer;
            
            this.tessellator = tessellator;
            
            this.matrixStack = [ this ];
        }
        
        Tessellator.Model.prototype.renderModel = function (renderer){
            if (!renderer){
                if (this.renderer){
                    renderer = this.renderer;
                }else{
                    if (!this.tessellator.defaultRenderer){
                        this.tessellator.defaultRenderer = new Tessellator.ModelViewRenderer(this.tessellator.loadDefaultShaderProgram());
                    }
                    
                    renderer = this.tessellator.defaultRenderer;
                }
            }
            
            renderer.render(null, this);
        }
        
        Tessellator.Model.prototype.remove = function (obj){
            if (this.model){
                if (!isNaN(obj)){
                    this.model.splice(obj, 1)
                }else{
                    if (!obj && this.parent){
                        this.parent.remove(this);
                    }else{
                        this.model.splice(this.model.indexOf(obj), 1);
                    }
                }
            }
        }
        
        Tessellator.Model.prototype.apply = Tessellator.EMPTY_FUNC;
        Tessellator.Model.prototype.postInit = Tessellator.EMPTY_FUNC;

        Tessellator.Model.prototype.init = function (interpreter){
            interpreter.flush();
        }
        
        Tessellator.Model.prototype.push = function (renderer){
            var matrix = new Tessellator.Model(this.tessellator, renderer);
            matrix.parent = this.matrixStack[this.matrixStack.length - 1];
            
            this.add(matrix);
            this.matrixStack.push(matrix);
            
            return matrix;
        }


        Tessellator.Model.prototype.pop = function () {
            if (this.matrixStack.length <= 1){
                throw "cannot pop from a empty matrix stack!";
            }
            
            return this.matrixStack.pop().update();
        }


        Tessellator.Model.prototype.createModel = function (renderer) {
            var matrix = new Tessellator.Model(this.tessellator, renderer);
            matrix.parent = this;
            
            this.add(matrix);
            
            return matrix;
        }
        
        Tessellator.Model.prototype.createMatrix = Tessellator.Model.prototype.createModel;
        
        Tessellator.Model.prototype.configureDrawing = function (){
            var matrix = this.matrixStack[this.matrixStack.length - 1];
            
            if (!matrix.isDrawing()){
                matrix.disposeShallow();
                this.disposed = false;
                
                matrix.actions = new Tessellator.Initializer(matrix.tessellator, matrix.parent ? matrix.parent.actions : null);
            }
        }
        
        Tessellator.Model.prototype.add = function (action){
            if (!action){
                throw "null pointer";
            }
            
            this.configureDrawing();
            
            this.matrixStack[this.matrixStack.length - 1].actions.push(action);
            return action;
        }
        
        Tessellator.Model.prototype.isDrawing = function (){
            return this.actions && this.actions.constructor === Tessellator.Initializer;
        }
        
        Tessellator.Model.prototype.finish = function (){
            if (this.matrixStack.length > 1){
                throw "cannot finish a model with items in the matrixStack!";
            }
            
            this.disposed = false;
            
            if (this.isDrawing()){
                this.model = this.actions.finish();
                this.actions = {
                    attribs: this.actions.attribs
                };
                
                this.render = true;
            }else{
                this.model = null;
                
                this.render = false;
            }
            
            return this;
        }
        
        //for compatibility
        Tessellator.Model.prototype.update = Tessellator.Model.prototype.finish;


        Tessellator.Model.prototype.dispose = function (){
            this.render = false;
            
            if (this.model){
                this.disposed = true;
                
                for (var i = 0, k = this.model.length; i < k; i++){
                    var mod = this.model[i];
                    
                    if (mod.disposable){
                        mod.dispose();
                    }
                }
                
                this.model = null;
            }
            
            this.remove();
        }


        Tessellator.Model.prototype.disposeShallow = function (){
            this.render = false;
            this.disposed = true;
            
            if (this.model){
                for (var i = 0, k = this.model.length; i < k; i++){
                    var mod = this.model[i];
                    
                    if (mod.type !== Tessellator.MODEL && mod.type !== Tessellator.MODEL_FRAGMENT){
                        if (mod.disposable){
                            if (mod.disposable){
                                mod.dispose();
                            }
                        }
                    }
                }
                
                this.model = null;
            }
            
            this.remove();
        }


        Tessellator.Model.prototype.createTexture = function (width, height, filter, renderer){
            return new Tessellator.TextureModel(this.tessellator, width, height, [
                new Tessellator.TextureModel.AttachmentColor(filter),
                new Tessellator.TextureModel.AttachmentDepth(),
                new Tessellator.TextureModel.AttachmentModel(this, renderer)
            ]);
        }


        Tessellator.Model.prototype.countRenderItems = function (){
            var count = 0;
            
            if (this.model){
                for (var i = 0, k = this.model.length; i < k; i++){
                    if (this.model[i].type === Tessellator.MODEL){
                        if (this.model[i].render){
                            count += this.model[i].countRenderItems();
                        }
                    }
                    
                    count++;
                }
            }
            
            return count;
        }
    }
    { //model fragment
        Tessellator.Model.prototype.createFragment = function (){
            var model;
            
            if (this.matrixStack.length){
                model = this.matrixStack[this.matrixStack.length - 1];
            }else{
                model = this;
            }
            
            return this.add(new Tessellator.Model.Fragment(model));
        }
        
        Tessellator.Model.Fragment = function (model){
            this.super(model.tessellator, model.renderer);
            
            this.parent = model;
            this.type = Tessellator.MODEL_FRAGMENT;
        }
        
        Tessellator.copyProto(Tessellator.Model.Fragment, Tessellator.Model);
    }
    { //draw helper methods
        Tessellator.Model.prototype.drawRect = function (x, y, width, height){
            this.start(Tessellator.LINE);
            this.setVertex ([
                x, -y, 0,
                x + width, -y, 0,
                
                x, -y - height, 0,
                x + width, -y - height, 0,
                
                x, -y, 0,
                x, -y - height, 0,
                
                x + width, -y, 0,
                x + width, -y - height, 0,
            ]);
            this.end();
        }


        /*Tessellator.Model.prototype.fillTriPrism = function (x1, y1, z1, x2, y2, z2){
            var deltaX = x2 - x1;
            var deltaY = y2 - y1;
            var deltaZ = z2 - z1;
            
            this.start(Tessellator.TRIANGLE);
            this.setVertex([
                
            ]);
            this.end();
            this.start(Tessellator.QUAD);
            this.setVertex([
                x1, y2, z1,
                x2, y2, z1,
                x2, y2, z2,
                x1, y2, z1,
            ]);
            this.end();
        }*/


        Tessellator.Model.prototype.fillCilinder = function (x, y, z, height, radius, quality){
            if (!quality){
                quality = Math.max(8, radius * 16);
            }
            
            this.start(Tessellator.TRIANGLE_FAN_CW);
            for (var i = 0; i <= quality; i++){
                if (i === 0){
                    this.setVertex(x, y + height / 2, 0);
                    
                    {
                        var angle = (i / quality * (Math.PI * 2));
                        
                        var xx = Math.sin(angle) * radius;
                        var zz = Math.cos(angle) * radius;
                        
                        this.setVertex(xx + x, y + height / 2, zz + z);
                    }
                }
                
                {
                    var angle = ((i + 1) / quality * (Math.PI * 2));
                    
                    var xx = Math.sin(angle) * radius;
                    var zz = Math.cos(angle) * radius;
                    
                    this.setVertex(xx + x, y + height / 2, zz + z);
                }
            }
            this.end();
            
            this.start(Tessellator.TRIANGLE_FAN_CCW);
            for (var i = 0; i <= quality; i++){
                if (i === 0){
                    this.setVertex(x, y - height / 2, 0);
                    
                    {
                        var angle = ((i + 1) / quality * (Math.PI * 2));
                        
                        var xx = Math.sin(angle) * radius;
                        var zz = Math.cos(angle) * radius;
                        
                        this.setVertex(xx + x, y - height / 2, zz + z);
                    }
                }
                
                {
                    var angle = (i / quality * (Math.PI * 2));
                    
                    var xx = Math.sin(angle) * radius;
                    var zz = Math.cos(angle) * radius;
                    
                    this.setVertex(xx + x, y - height / 2, zz + z);
                }
            }
            this.end();
            
            var quads = [];
            var normals = [];
            var texCoords = [];
            
            for (var i = 0; i < quality; i++){
                {
                    var angle = ((i + 1) / quality * (Math.PI * 2));
                    
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    
                    var xx = sin * radius;
                    var zz = cos * radius;
                    
                    quads.push(xx + x);
                    quads.push(y + height / 2);
                    quads.push(zz);
                    
                    texCoords.push((i + 1) / quality);
                    texCoords.push(1);
                    
                    normals.push(sin);
                    normals.push(0);
                    normals.push(cos);
                }
                
                {
                    var angle = (i / quality * (Math.PI * 2));
                    
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    
                    var xx = sin * radius;
                    var zz = cos * radius;
                    
                    quads.push(xx + x);
                    quads.push(y + height / 2);
                    quads.push(zz);
                    
                    texCoords.push(i / quality);
                    texCoords.push(1);
                    
                    normals.push(sin);
                    normals.push(0);
                    normals.push(cos);
                }
                
                {
                    var angle = (i / quality * (Math.PI * 2));
                    
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    
                    var xx = sin * radius;
                    var zz = cos * radius;
                    
                    quads.push(xx + x);
                    quads.push(y - height / 2);
                    quads.push(zz);
                    
                    texCoords.push(i / quality);
                    texCoords.push(0);
                    
                    normals.push(sin);
                    normals.push(0);
                    normals.push(cos);
                }
                
                {
                    var angle = ((i + 1) / quality * (Math.PI * 2));
                    
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    
                    var xx = sin * radius;
                    var zz = cos * radius;
                    
                    quads.push(xx + x);
                    quads.push(y - height / 2);
                    quads.push(zz);
                    
                    texCoords.push((i + 1) / quality);
                    texCoords.push(0);
                    
                    normals.push(sin);
                    normals.push(0);
                    normals.push(cos);
                }
            }
            
            this.start(Tessellator.NORMAL);
            this.setVertex(normals);
            this.end();
            
            this.start(Tessellator.TEXTURE);
            this.setVertex(texCoords);
            this.end();
            
            this.start(Tessellator.QUAD);
            this.setVertex(quads);
            this.end();
        }


        Tessellator.Model.prototype.fillFlange = function (x, y, z, height, radius0, radius1, quality){
            if (!quality){
                quality = Math.max(8, Math.max(radius0, radius1) * 8);
            }
            
            var quads = [];
            var normals = [];
            var texCoords = [];
            
            for (var i = 0; i < quality; i++){
                {
                    var angle = ((i + 1) / quality * (Math.PI * 2));
                    
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    
                    var xx = sin * radius0;
                    var zz = cos * radius0;
                    
                    quads.push(xx + x);
                    quads.push(y + height / 2);
                    quads.push(zz);
                    
                    texCoords.push((i + 1) / quality);
                    texCoords.push(1);
                    
                    normals.push(sin);
                    normals.push(0);
                    normals.push(cos);
                }
                
                {
                    var angle = (i / quality * (Math.PI * 2));
                    
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    
                    var xx = sin * radius0;
                    var zz = cos * radius0;
                    
                    quads.push(xx + x);
                    quads.push(y + height / 2);
                    quads.push(zz);
                    
                    texCoords.push(i / quality);
                    texCoords.push(1);
                    
                    normals.push(sin);
                    normals.push(0);
                    normals.push(cos);
                }
                
                {
                    var angle = (i / quality * (Math.PI * 2));
                    
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    
                    var xx = sin * radius1;
                    var zz = cos * radius1;
                    
                    quads.push(xx + x);
                    quads.push(y - height / 2);
                    quads.push(zz);
                    
                    texCoords.push(i / quality);
                    texCoords.push(0);
                    
                    normals.push(sin);
                    normals.push(0);
                    normals.push(cos);
                }
                
                {
                    var angle = ((i + 1) / quality * (Math.PI * 2));
                    
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    
                    var xx = sin * radius1;
                    var zz = cos * radius1;
                    
                    quads.push(xx + x);
                    quads.push(y - height / 2);
                    quads.push(zz);
                    
                    texCoords.push((i + 1) / quality);
                    texCoords.push(0);
                    
                    normals.push(sin);
                    normals.push(0);
                    normals.push(cos);
                }
            }
            
            this.start(Tessellator.NORMAL);
            this.setVertex(normals);
            this.end();
            
            this.start(Tessellator.TEXTURE);
            this.setVertex(texCoords);
            this.end();
            
            this.start(Tessellator.QUAD);
            this.setVertex(quads);
            this.end();
        }


        Tessellator.Model.prototype.fillInverseCilinder = function (x, y, z, height, radius, quality){
            if (!quality){
                quality = Math.max(8, radius * 16);
            }
            
            this.start(Tessellator.QUAD);
            for (var i = 0; i < quality; i++){
                {
                    var angle = (i / quality * (Math.PI * 2));
                    
                    var xx = Math.sin(angle) * radius;
                    var zz = Math.cos(angle) * radius;
                    
                    this.setVertex(xx + x, y + height / 2, zz);
                }
                
                {
                    var angle = ((i + 1) / quality * (Math.PI * 2));
                    
                    var xx = Math.sin(angle) * radius;
                    var zz = Math.cos(angle) * radius;
                    
                    this.setVertex(xx + x, y + height / 2, zz);
                }
                
                {
                    var angle = ((i + 1) / quality * (Math.PI * 2));
                    
                    var xx = Math.sin(angle) * radius;
                    var zz = Math.cos(angle) * radius;
                    
                    this.setVertex(xx + x, y - height / 2, zz);
                }
                
                {
                    var angle = (i / quality * (Math.PI * 2));
                    
                    var xx = Math.sin(angle) * radius;
                    var zz = Math.cos(angle) * radius;
                    
                    this.setVertex(xx + x, y - height / 2, zz);
                }
            }
            this.end();
        }
        
        Tessellator.Model.prototype.fillCircle = function (x, y, radius, quality){
            return this.fillOval(x, y, radius, radius, quality);
        }
        
        Tessellator.Model.prototype.fillOval = function (x, y, xx, yy, quality){
            if (!quality){
                quality = Math.max(8, Math.max(xx, yy) * 16);
            }
            
            this.start(Tessellator.TRIANGLE_FAN_CCW);
            for (var i = 0; i <= quality; i++){
                if (i === 0){
                    this.setVertex(x, y, 0);
                    
                    {
                        var angle = ((i + 1) / quality * (Math.PI * 2));
                        
                        var xx = Math.sin(angle) * xx;
                        var yy = Math.cos(angle) * yy;
                        
                        this.setVertex(xx + x, yy + y, 0);
                    }
                }
                
                {
                    var angle = (i / quality * (Math.PI * 2));
                    
                    var xx = Math.sin(angle) * xx;
                    var yy = Math.cos(angle) * yy;
                    
                    this.setVertex(xx + x, yy + y, 0);
                }
            }
            this.end();
        }


        Tessellator.Model.prototype.fillSphere = function (){
            if (arguments.length === 5){
                var
                    x = arguments[0],
                    y = arguments[1],
                    z = arguments[2],
                    rx = arguments[3],
                    ry = arguments[3],
                    rz = arguments[3],
                    quality = arguments[4];
            }else if (arguments.length === 7){
                var
                    x = arguments[0],
                    y = arguments[1],
                    z = arguments[2],
                    rx = arguments[3],
                    ry = arguments[4],
                    rz = arguments[5],
                    quality = arguments[6];
            }
            
            if (!quality){
                quality = Math.max(4, Math.max(rx, Math.max(ry, rz)) * 16);
            }
            
            var normals = [];
            var texture = [];
            var vertices = [];
            
            for (var i = 0; i <= quality; i++){
                var angleY = Math.PI * (i / quality);
                
                var sinY = Math.sin(angleY);
                var cosY = Math.cos(angleY);
                
                for (var ii = 0; ii <= quality * 2; ii++){
                    var angleX = -(Math.PI * 2) * (ii / (quality * 2));
                    
                    var sinX = Math.sin(angleX);
                    var cosX = Math.cos(angleX);
                    
                    var
                        xx = cosX * sinY,
                        yy = cosY,
                        zz = sinX * sinY;
                    
                    normals.push(xx);
                    normals.push(yy);
                    normals.push(zz);
                    
                    texture.push(ii / (quality * 2));
                    texture.push(1 - (i / quality));
                    
                    vertices.push(xx * rx + x);
                    vertices.push(yy * ry + y);
                    vertices.push(zz * rz + z);
                }
            }
            
            var vertexBuffer = [];
            for (var i = 0; i < quality; i++){
                for (var ii = 0; ii < quality * 2; ii++){
                    var U = (i * (quality * 2 + 1)) + ii;
                    var V = U + quality * 2 + 1;
                    
                    vertexBuffer.push(U);
                    vertexBuffer.push(V);
                    vertexBuffer.push(U + 1);
                    
                    vertexBuffer.push(V);
                    vertexBuffer.push(V + 1);
                    vertexBuffer.push(U + 1);
                }
            }
            
            this.start(Tessellator.NORMAL);
            this.setVertex(normals);
            this.end();
            
            this.start(Tessellator.TEXTURE);
            this.setVertex(texture);
            this.end();
            
            this.start(Tessellator.TRIANGLE);
            this.setVertex(vertices);
            this.end(vertexBuffer);
        }


        Tessellator.Model.prototype.fillPrism = function (){
            if (arguments.length === 6){
                var
                    x1 = arguments[0],
                    y1 = arguments[1],
                    z1 = arguments[2],
                    x2 = arguments[3],
                    y2 = arguments[4],
                    z2 = arguments[5];
                
                this.start(Tessellator.QUAD);
                this.setVertex([
                    x2, y1, z1,
                    x1, y1, z1,
                    x1, y2, z1,
                    x2, y2, z1,
                    
                    x1, y1, z2,
                    x2, y1, z2,
                    x2, y2, z2,
                    x1, y2, z2,
                    
                    x1, y1, z1,
                    x1, y1, z2,
                    x1, y2, z2,
                    x1, y2, z1,
                    
                    x2, y1, z2,
                    x2, y1, z1,
                    x2, y2, z1,
                    x2, y2, z2,
                    
                    x2, y1, z1,
                    x2, y1, z2,
                    x1, y1, z2,
                    x1, y1, z1,
                    
                    x1, y2, z1,
                    x1, y2, z2,
                    x2, y2, z2,
                    x2, y2, z1,
                ]);
                this.end();
            }else if(arguments.length === 4){
                var
                    x = arguments[0],
                    y = arguments[1],
                    z = arguments[2],
                    width = arguments[3];
                
                this.start(Tessellator.QUAD);
                this.setVertex(
                    x + width / 2, y - width / 2, z - width / 2,
                    x - width / 2, y - width / 2, z - width / 2,
                    x - width / 2, y + width / 2, z - width / 2,
                    x + width / 2, y + width / 2, z - width / 2,
                    
                    x - width / 2, y - width / 2, z + width / 2,
                    x + width / 2, y - width / 2, z + width / 2,
                    x + width / 2, y + width / 2, z + width / 2,
                    x - width / 2, y + width / 2, z + width / 2,
                    
                    x - width / 2, y - width / 2, z - width / 2,
                    x - width / 2, y - width / 2, z + width / 2,
                    x - width / 2, y + width / 2, z + width / 2,
                    x - width / 2, y + width / 2, z - width / 2,
                    
                    x + width / 2, y - width / 2, z + width / 2,
                    x + width / 2, y - width / 2, z - width / 2,
                    x + width / 2, y + width / 2, z - width / 2,
                    x + width / 2, y + width / 2, z + width / 2,
                    
                    x + width / 2, y - width / 2, z - width / 2,
                    x + width / 2, y - width / 2, z + width / 2,
                    x - width / 2, y - width / 2, z + width / 2,
                    x - width / 2, y - width / 2, z - width / 2,
                    
                    x - width / 2, y + width / 2, z - width / 2,
                    x - width / 2, y + width / 2, z + width / 2,
                    x + width / 2, y + width / 2, z + width / 2,
                    x + width / 2, y + width / 2, z - width / 2
                );
                this.end();
            }
        }


        Tessellator.Model.prototype.drawPrism = function (){
            if (arguments.length === 6){
                var
                    x1 = arguments[0],
                    y1 = arguments[1],
                    z1 = arguments[2],
                    x2 = arguments[3],
                    y2 = arguments[4],
                    z2 = arguments[5];
            
                this.start(Tessellator.LINE);
                this.setVertex([
                    x1, y1, z1,
                    x2, y1, z1,
                    
                    x1, y2, z1,
                    x2, y2, z1,
                    
                    x1, y1, z2,
                    x2, y1, z2,
                    
                    x1, y2, z2,
                    x2, y2, z2,
                    
                    x1, y1, z1,
                    x1, y2, z1,
                    
                    x2, y1, z1,
                    x2, y2, z1,
                    
                    x1, y1, z2,
                    x1, y2, z2,
                    
                    x2, y1, z2,
                    x2, y2, z2,
                    
                    x1, y1, z1,
                    x1, y1, z2,
                    
                    x1, y2, z1,
                    x1, y2, z2,
                    
                    x2, y1, z1,
                    x2, y1, z2,
                    
                    x2, y2, z1,
                    x2, y2, z2,
                ]);
                this.end();
            }else if (arguments.length === 4){
                var
                    x = arguments[0],
                    y = arguments[1],
                    z = arguments[2],
                    width = arguments[3];
                
                this.start(Tessellator.LINE);
                this.setVertex([
                    x - width / 2, y - width / 2, z - width / 2,
                    x + width / 2, y - width / 2, z - width / 2,
                    
                    x - width / 2, y + width / 2, z - width / 2,
                    x + width / 2, y + width / 2, z - width / 2,
                    
                    x - width / 2, y - width / 2, z + width / 2,
                    x + width / 2, y - width / 2, z + width / 2,
                    
                    x - width / 2, y + width / 2, z + width / 2,
                    x + width / 2, y + width / 2, z + width / 2,
                    
                    x - width / 2, y - width / 2, z - width / 2,
                    x - width / 2, y + width / 2, z - width / 2,
                    
                    x + width / 2, y - width / 2, z - width / 2,
                    x + width / 2, y + width / 2, z - width / 2,
                    
                    x - width / 2, y - width / 2, z + width / 2,
                    x - width / 2, y + width / 2, z + width / 2,
                    
                    x + width / 2, y - width / 2, z + width / 2,
                    x + width / 2, y + width / 2, z + width / 2,
                    
                    x - width / 2, y - width / 2, z - width / 2,
                    x - width / 2, y - width / 2, z + width / 2,
                    
                    x - width / 2, y + width / 2, z - width / 2,
                    x - width / 2, y + width / 2, z + width / 2,
                    
                    x + width / 2, y - width / 2, z - width / 2,
                    x + width / 2, y - width / 2, z + width / 2,
                    
                    x + width / 2, y + width / 2, z - width / 2,
                    x + width / 2, y + width / 2, z + width / 2,
                ]);
                this.end();
            }
        }


        Tessellator.Model.prototype.fillRect = function (){
            if (arguments.length === 4){
                var
                    x = arguments[0],
                    y = arguments[1],
                    width = arguments[2],
                    height = arguments[3];
                
                this.start(Tessellator.QUAD);
                this.setVertex([
                    x, -y - height, 0,
                    x + width, -y - height, 0,
                    x + width, -y, 0,
                    x, -y, 0,
                ]);
                this.end();
            }else if (arguments.length === 5){
                var
                    x = arguments[0],
                    y = arguments[1],
                    z = arguments[2],
                    width = arguments[3],
                    height = arguments[4];
                
                this.start(Tessellator.QUAD);
                this.setVertex([
                    x, -y - height, z,
                    x + width, -y - height, z,
                    x + width, -y, z,
                    x, -y, z,
                ]);
                this.end();
            }
        }


        Tessellator.Model.prototype.fullGrid = function (){
            if (arguments.length === 6){
                var
                    x = arguments[0],
                    y = arguments[1],
                    width = arguments[2],
                    height = arguments[3],
                    segX = arguments[4],
                    segY = arguments[5];
                
                this.start(Tessellator.QUAD);
                for (var xx = 0; xx < segX; xx++){
                    for (var yy = 0; yy < segY; yy++){
                        this.setVertex([
                            x + (xx / segX) * width      , -y - ((yy + 1) / segY) * height, 0,
                            x + ((xx + 1) / segX) * width, -y - ((yy + 1) / segY) * height, 0,
                            x + ((xx + 1) / segX) * width, -y - (yy / segY) * height,       0,
                            x + (xx / segX) * width      , -y - (yy / segY) * height,       0,
                        ]);
                    }
                }
                this.end();
            }else if (arguments.length === 8){
                var
                    x = arguments[0],
                    y = arguments[1],
                    width = arguments[2],
                    height = arguments[3],
                    segX = arguments[4],
                    segY = arguments[5],
                    tw = arguments[6],
                    th = arguments[7];
                
                var vertices = [];
                var texture = [];
                
                for (var xx = 0; xx < segX; xx++){
                    for (var yy = 0; yy < segY; yy++){
                        Array.prototype.push.apply(texture, [
                            (xx % tw) / tw, ((yy % th) + 1) / th,
                            ((xx % tw) + 1) / tw, ((yy % th) + 1) / th,
                            ((xx % tw) + 1) / tw, (yy % th) / th,
                            (xx % tw) / tw, (yy % th) / th,
                        ]);
                        
                        Array.prototype.push.apply(vertices, [
                            x + (xx / segX) * width      , -y - ((yy + 1) / segY) * height, 0,
                            x + ((xx + 1) / segX) * width, -y - ((yy + 1) / segY) * height, 0,
                            x + ((xx + 1) / segX) * width, -y - (yy / segY) * height,       0,
                            x + (xx / segX) * width      , -y - (yy / segY) * height,       0,
                        ]);
                    }
                }
                
                this.start(Tessellator.TEXTURE);
                this.setVertex(texture);
                this.end();
                
                this.start(Tessellator.QUAD);
                this.setVertex(vertices);
                this.end();
            }
        }


        Tessellator.Model.prototype.fillGrid = function (x, y, width, height, segX, segY){
            this.start(Tessellator.QUAD);
            
            if (!segX){
                segX = width;
            }
            
            if (!segY){
                segY = height;
            }
            
            for (var xx = 0; xx < segX; xx++){
                for (var yy = 0; yy < segY; yy++){
                    if (((xx + yy) % 2) === 1){
                        continue;
                    }
                    
                    this.setVertex([
                        x + (xx / segX) * width      , -y - ((yy + 1) / segY) * height, 0,
                        x + ((xx + 1) / segX) * width, -y - ((yy + 1) / segY) * height, 0,
                        x + ((xx + 1) / segX) * width, -y - (yy / segY) * height,       0,
                        x + (xx / segX) * width      , -y - (yy / segY) * height,       0,
                    ]);
                }
            }
            this.end();
        }


        Tessellator.Model.prototype.fillInverseGrid = function (x, y, width, height, segX, segY){
            this.start(Tessellator.QUAD);
            for (var xx = 0; xx < segX; xx++){
                for (var yy = 0; yy < segY; yy++){
                    if (((xx + yy) % 2) === 0){
                        continue;
                    }
                    
                    this.setVertex([
                        x + (xx / segX) * width      , -y - ((yy + 1) / segY) * height, 0,
                        x + ((xx + 1) / segX) * width, -y - ((yy + 1) / segY) * height, 0,
                        x + ((xx + 1) / segX) * width, -y - (yy / segY) * height,       0,
                        x + (xx / segX) * width      , -y - (yy / segY) * height,       0,
                    ]);
                }
            }
            this.end();
        }


        Tessellator.Model.prototype.drawLine = function (x1, y1, x2, y2){
            this.start(Tessellator.LINE);
            this.setVertex([
                x1, -y1, 0,
                x2, -y2, 0,
            ]);
            this.end();
        }
    }
    { //translate
        Tessellator.Model.prototype.translate = function(){
            if (arguments.length === 1 && arguments[0].constructor === Tessellator.Translate){
                return this.add(arguments[0]);
            }else{
                return this.add(Tessellator.new.apply(Tessellator.Translate, arguments));
            }
        }
        
        Tessellator.Translate = function (){
            this.type = Tessellator.TRANSLATE;
            
            if (arguments.length === 0){
                this.pos = Tessellator.vec3(0, 0, 0);
            }else if (arguments.length === 1){
                if (!isNaN(arguments[0])){
                    this.pos = Tessellator.vec3(arguments[0], arguments[0], arguments[0]);
                }else{
                    this.pos = arguments[0];
                }
            }else if (arguments.length === 2){
                this.pos = Tessellator.vec3(arguments[0], arguments[1], 0);
            }else if (arguments.length === 3){
                this.pos = Tessellator.vec3(arguments[0], arguments[1], arguments[2]);
            }else{
                throw "invalid arguments in Tessellator.Translate()";
            }
        }
        
        Tessellator.Translate.prototype.apply = function (render){
            var m = render.get("mvMatrix");
            
            this.set(m);
        }
        
        Tessellator.Translate.prototype.set = function (m){
            m.translate(this.pos);
        }
        
        Tessellator.Translate.prototype.init = function (interpreter){
            interpreter.flush();
        }
        
        Tessellator.Translate.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //scale
        Tessellator.Model.prototype.scale = function (){
            if (arguments.length === 1 && arguments[0].constructor === Tessellator.Scale){
                return this.add(arguments[0]);
            }else{
                return this.add(Tessellator.new.apply(Tessellator.Scale, arguments));
            }
        }
        
        Tessellator.Scale = function (){
            this.type = Tessellator.SCALE;
            
            var scale;
            
            if (arguments.length === 0){
                this.coords = Tessellator.vec3(0, 0, 0);
            }else if (arguments.length === 1){
                this.coords = Tessellator.vec3(arguments[0], arguments[0], arguments[0]);
            }else if (arguments.length === 2){
                this.coords = Tessellator.vec3(arguments[0], arguments[1], 0);
            }else if (arguments.length === 3){
                this.coords = Tessellator.vec3(arguments);
            }else{
                throw "invalid arguments in Tessellator.scale()";
            }
        }


        Tessellator.Scale.prototype.apply = function (render){
            var m = render.get("mvMatrix");
            
            this.set(m);
        }


        Tessellator.Scale.prototype.set = function (m){
            m.scale(this.coords);
        }


        Tessellator.Scale.prototype.init = function (interpreter){
            interpreter.flush();
        }
        
        Tessellator.Scale.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //rotate
        Tessellator.Model.prototype.rotate = function (){
            if (arguments.length === 1 && arguments[0].constructor === Tessellator.Rotate){
                return this.add(arguments[0]);
            }else{
                return this.add(Tessellator.new.apply(Tessellator.Rotate, arguments));
            }
        }
        
        Tessellator.Model.prototype.rotateDeg = function (){
            var rotate;
            
            if (arguments.length === 1 && arguments[0].constructor === Tessellator.Rotate){
                return this.add(arguments[0]);
            }else{
                arguments[0] *= Math.PI / 180;
                
                return this.add(Tessellator.new.apply(Tessellator.Rotate, arguments));
            }
            
            return this.add(rotate);
        }
        
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
            }
            
            if (!this.degree.length){
                this.degree = Tessellator.float(this.degree);
            }
        }


        Tessellator.Rotate.prototype.apply = function (render){
            var m = render.get("mvMatrix");
            
            this.set(m);
        }


        Tessellator.Rotate.prototype.set = function (m){
            m.rotate(this.degree, this.vec);
        }


        Tessellator.Rotate.prototype.init = function (interpreter){
            interpreter.flush();
        }
        
        Tessellator.Rotate.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //clear
        Tessellator.Model.prototype.clear = function (){
            this.add(new Tessellator.Clear(Tessellator.getColor(arguments)));
        }
        
        Tessellator.Clear = function (color) {
            this.type = Tessellator.CLEAR;
            
            this.color = color;
        }

        Tessellator.Clear.prototype.apply = function (render){
            if (this.color){
                render.tessellator.GL.clearColor(this.color[0], this.color[1], this.color[2], this.color[3]);
            }else{
                render.tessellator.GL.clearColor(0, 0, 0, 0);
            }
            
            render.tessellator.GL.clear(render.tessellator.GL.COLOR_BUFFER_BIT | render.tessellator.GL.DEPTH_BUFFER_BIT);
        }

        Tessellator.Clear.prototype.init = function (interpreter){
            interpreter.flush();
        }
        
        Tessellator.Clear.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //enable
        Tessellator.Model.prototype.enable = function (e){
            return this.add(new Tessellator.Enable(e));
        }
        
        Tessellator.Enable = function (arg){
            this.type = Tessellator.ENABLE;
            this.arg = arg;
        }


        Tessellator.Enable.prototype.apply = function (render){
            if (this.arg === Tessellator.LIGHTING){
                render.set("lights", render.get("lighting"));
            }else{
                render.tessellator.GL.enable(this.arg);
            }
        }


        Tessellator.Enable.prototype.init = function (interpreter){
            if (this.arg === Tessellator.NORMAL){
                interpreter.set("lighting", true);
                
                return null;
            }else if (this.arg === Tessellator.COLOR){
                interpreter.set("colorAttribEnabled", true);
                
                return null;
            }else{
                interpreter.flush();
            }
        }
        
        Tessellator.Enable.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //disable
        Tessellator.Model.prototype.disable = function (e){
            return this.add(new Tessellator.Disable(e));
        }
        
        Tessellator.Disable = function (arg){
            this.type = Tessellator.DISABLE;
            this.arg = arg;
        }


        Tessellator.Disable.prototype.apply = function (render){
            if (this.arg === Tessellator.LIGHTING){
                render.set("lights", Tessellator.NO_LIGHT);
            }else{
                render.tessellator.GL.disable(this.arg);
            }
        }


        Tessellator.Disable.prototype.init = function (interpreter){
            if (this.arg === Tessellator.NORMAL){
                interpreter.set("lighting", false);
                
                return null;
            }else if (this.arg === Tessellator.COLOR){
                interpreter.set("colorAttribEnabled", false);
                
                return null;
            }else{
                interpreter.flush();
            }
        }
        
        Tessellator.Disable.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //mask
        Tessellator.Initializer.setDefault("mask", function () {
            return false;
        });
        
        Tessellator.Model.prototype.setMask = function (){
            return this.add(new Tessellator.MaskSet(Tessellator.getColor(arguments)));
        }
        
        Tessellator.MaskSet = function (color){
            this.type = Tessellator.MASK;
            
            this.mask = color;
        }


        Tessellator.MaskSet.prototype.init = function (interpreter){
            if (interpreter.get("draw") === Tessellator.TEXTURE){
                if (interpreter.shape){
                    throw "cannot change mask while shape is being drawn";
                }
                
                interpreter.flush();
                
                interpreter.set("mask", true);
            }else{
                interpreter.set("color", new Tessellator.Color(
                    interpreter.get("color").r * this.mask[0],
                    interpreter.get("color").g * this.mask[1],
                    interpreter.get("color").b * this.mask[2],
                    interpreter.get("color").a * this.mask[3]
                ));
                
                return null;
            }
        }


        Tessellator.MaskSet.prototype.apply = function (render){
            render.set("mask", this.mask);
        }
        
        Tessellator.MaskSet.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //color
        Tessellator.Initializer.setDefault("color", function () {
            return Tessellator.DEFAULT_COLOR;
        });
    
        Tessellator.Model.prototype.setColor = function (){
            return this.add(new Tessellator.ColorSet(Tessellator.getColor(arguments)));
        }
        
        Tessellator.ColorSet = function (color){
            this.type = Tessellator.COLOR;
            
            this.color = color.clone().multiply(Tessellator.float(255));
        }


        Tessellator.ColorSet.prototype.init = function (interpreter){
            if (interpreter.shape){
                throw "cannot change color while drawing";
            }
            
            if (interpreter.get("draw") !== Tessellator.COLOR){
                interpreter.flush();
                
                interpreter.set("draw", Tessellator.COLOR);
            }
            
            interpreter.set("textureBounds", null);
            interpreter.set("color", this.color);
            
            return null;
        }


        Tessellator.ColorSet.prototype.apply = Tessellator.EMPTY_FUNC;
        
        Tessellator.ColorSet.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //clip
        Tessellator.Model.prototype.setClip = function (x, y, width, height){
            return this.add(new Tessellator.Clip(x, y, width, height));
        }
        
        Tessellator.Clip = function (x, y, w, h){
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            
            this.clip = new Float32Array(4);
            this.clip[0] = x;
            this.clip[1] = y;
            this.clip[2] = w;
            this.clip[3] = h;
        }


        Tessellator.Clip.prototype.init = function (interpreter){
            interpreter.flush();
        }
        
        Tessellator.Clip.prototype.postInit = Tessellator.EMPTY_FUNC;
        
        Tessellator.Clip.prototype.apply = function (render){
            render.set("clip", this.clip);
        }
    }
    { //start
        Tessellator.Initializer.setDefault("colorAttribEnabled", function (){
            return true;
        });
        
        Tessellator.Model.prototype.start = function (type, drawType){
            return this.add(new Tessellator.Start(this.tessellator, type, drawType));
        }
        
        Tessellator.Start = function (tessellator, shapeType, drawType) {
            this.type = shapeType;
            this.subtype = Tessellator.VERTEX;
            
            this.drawType = drawType || Tessellator.STATIC;
            
            this.matrix = null;
            
            this.vertices = new Tessellator.FragmentedArray();
            this.normals = new Tessellator.FragmentedArray();
            this.colors = new Tessellator.FragmentedArray();
            
            this.object = new Tessellator.Object(tessellator);
            this.indices = this.object.getIndices();
            
            this.disposable = true;
        }
        
        Tessellator.Start.prototype.compress = function (){
            this.vertices.compress();
            this.indices.compress();
            this.normals.compress();
            this.colors.compress();
        }
        
        Tessellator.Start.prototype.init = function (interpreter){
            if (interpreter.shape){
                throw "cannot start new draw if the old one did not end yet";
            }else if (!this.type){
                throw "nothing to start";
            }
            
            if (this.type === Tessellator.LINE){
                interpreter.flush();
                interpreter.set("draw", Tessellator.LINE);
            }
            
            this.drawMode = interpreter.get("draw");
            
            interpreter.shape = this;
            return null;
        }
        
        
        Tessellator.Start.prototype.dispose = function (){
            this.object.dispose();
        }
        
        Tessellator.Start.prototype.apply = function (render){
            this.object.render(render);
        }
        
        Tessellator.Start.prototype.postInit = function (interpreter){
            if (interpreter.shape){
                throw "cannot finish a matrix when there are sill objects being drawn!";
            }
            
            this.object.setType(this.type);
            this.object.drawMode = this.drawMode;
            
            this.object.setAttribute("position", Tessellator.VEC3, this.vertices, Float32Array, false, this.drawType);
            if (this.normals.length) this.object.setAttribute("normal", Tessellator.VEC3, this.normals, Float32Array, false, this.drawType);
            
            if (this.drawMode === Tessellator.TEXTURE){
                this.object.setAttribute("color", Tessellator.VEC2, this.colors, Float32Array, false, this.drawType);
            }else{
               this.object.setAttribute("color", Tessellator.VEC4, this.colors, Uint8Array, true, this.drawType);
            }
            
            //upload everything to GPU
            this.end = this.vertices.length / 3;
            this.object.upload();
            this.object.useOES();
            
            this.vertices = null;
            this.indices = null;
            this.normals = null;
            this.colors = null;
        }
        
        Tessellator.Start.prototype.translate = function (x, y, z){
            if (!this.matrix){
                this.matrix = Tessellator.mat4().identity();
            }
            
            this.matrix.translate(Tessellator.vec3(x, y, z));
        }
        
        Tessellator.Start.prototype.scale = function (x, y, z){
            if (!this.matrix){
                this.matrix = Tessellator.mat4().identity();
            }
            
            this.matrix.scale(Tessellator.vec3(x, y, z));
        }
        
        Tessellator.Start.prototype.rotate = function (deg, x, y, z){
            if (!this.matrix){
                this.matrix = Tessellator.mat4().identity();
            }
            
            this.matrix.rotate(deg, Tessellator.vec3(x, y, z));
        }
        
        Tessellator.Start.prototype.setVertex = function (){
            Tessellator.Model.prototype.setVertex.apply(this.model, arguments);
        }
        
        Tessellator.Start.prototype.end = function (){
            Tessellator.Model.prototype.end.apply(this.model, arguments);
        }
        
        Tessellator.Start.prototype.getSubsection = function (start, end){
            if (!end){
                end = this.end;
            }
            
            if (end){
                return new Tessellator.Start.Subsection(this, start, end);
            }else{
                throw "cannot get subsection of incompatible type";
            }
        }
        
        { //subsection
            Tessellator.Start.Subsection = function (parent, start, end){
                this.parent = parent;
                this.start = start;
                this.end = end;
            }
            
            Tessellator.Start.Subsection.prototype.getSubsection = function (start, end){
                return new Tessellator.Start.Subsection(this.parent, this.start + start, this.start + end)
            }
            
            Tessellator.Start.Subsection.prototype.setColor = function (){
                var delta = this.end - this.start;
                var color = this.parent.model.getColor.apply(this.parent.matrix, arguments);
                
                var array = new Uint8Array(delta * 4);
                
                for (var i = 0; i < delta; i++){
                    array[i * 4 + 0] = color.r * 255;
                    array[i * 4 + 1] = color.g * 255;
                    array[i * 4 + 2] = color.b * 255;
                    array[i * 4 + 3] = color.a * 255;
                }
                
                this.parent.object.setAttributeData("color", new Tessellator.Array(array), this.start * 4);
            }
            
            Tessellator.Start.Subsection.prototype.setVertex = function (){
                var vertices;
                
                if (arguments.length === 1){
                    vertices = arguments[0];
                }else{
                    vertices = arguments;
                }
                
                if (vertices.constructor !== Float32Array){
                    vertices = new Tessellator.Array(new Float32Array(vertices));
                }
                
                this.parent.object.setAttributeData("position", vertices, this.start * 3);
            }
        }
    }
    { //end
        Tessellator.Model.prototype.end = function (indices){
            return this.add(new Tessellator.End(indices));
        }
        
        Tessellator.End = function (indices){
            this.type = Tessellator.END;
            this.indices = indices;
        }
        
        Tessellator.End.prototype.init = function (interpreter){
            this.shape = interpreter.shape;
            
            if (!this.shape){
                throw "cannot end a draw that had not started yet";
            }else if (!this.shape.vertices.length){
                this.shape = null;
                return null;
            }
            
            var textureBounds = null;
            
            if (interpreter.get("colorAttribEnabled")){
                textureBounds = interpreter.get("textureBounds");
            }
            
            if (this.shape.type === Tessellator.TEXTURE){
                if (textureBounds){
                    textureBounds.bounds = this.shape.vertices.combine();
                    textureBounds.defaultBounds = false;
                }
            }else if (this.shape.type === Tessellator.NORMAL){
                interpreter.normals = this.shape.vertices;
            }else if (this.shape.type === Tessellator.POINT){
                interpreter.flush();
                
                interpreter.model.push(this.shape);
            }else if (this.shape.type === Tessellator.LINE){
                interpreter.flush();
                
                interpreter.model.push(this.shape);
            }else{
                var vertexIndexes = this.shape.indices;
                
                var vertexOffset = 0;
                var shapeAddon = interpreter.get("drawCache");
                
                if (shapeAddon){
                    vertexOffset = shapeAddon.vertices.length / 3;
                }
                
                if (this.indices){
                    if (this.shape.type !== Tessellator.TRIANGLE){
                        throw "vertex buffers only supported with triangles";
                    }
                    
                    vertexIndexes.push(this.indices);
                    vertexIndexes.offset(vertexOffset);
                    
                    if (textureBounds){
                        if (textureBounds.defaultBounds){
                            var bounds = [
                                                      0,                       0,
                                textureBounds.bounds[0],                       0,
                                textureBounds.bounds[1], textureBounds.bounds[1],
                            ];
                            
                            for (var i = 0, k = this.shape.vertices.length; i < k; i++){
                                this.shape.colors.push(bounds);
                            }
                        }else{
                            this.shape.colors.push(textureBounds.bounds);
                        }
                    }
                }else if (this.shape.type === Tessellator.POLYGON){
                
                }else if (this.shape.type === Tessellator.QUAD){
                    var k = this.shape.vertices.length;
                    
                    var colorOff = this.shape.colors ? this.shape.colors.length / (4 * 4) : 0;
                    var calculateBounds = false;
                    
                    if (k % 12 !== 0){
                        throw "invalid number of vertices for quad draw!";
                    }else{
                        k /= 3 * 4;
                    }
                    
                    if (textureBounds){
                        if (!textureBounds.defaultBounds && this.shape.vertices.length / 3 === textureBounds.bounds.length / 2){
                            this.shape.colors.push(textureBounds.bounds);
                        }else{
                            calculateBounds = true;
                        }
                    }
                    
                    for (var i = 0; i < k; i++){
                        vertexIndexes.push([
                            0 + i * 4 + vertexOffset,
                            1 + i * 4 + vertexOffset,
                            2 + i * 4 + vertexOffset,
                            
                            0 + i * 4 + vertexOffset,
                            2 + i * 4 + vertexOffset,
                            3 + i * 4 + vertexOffset,
                        ]);
                        
                        if (colorOff <= i && calculateBounds){
                            var bounds;
                            
                            if (textureBounds.defaultBounds){
                                bounds = [
                                                          0,                       0,
                                    textureBounds.bounds[0],                       0,
                                    textureBounds.bounds[0], textureBounds.bounds[1],
                                                          0, textureBounds.bounds[1],
                                ];
                            }else{
                                bounds = textureBounds.bounds.subarray((i - colorOff) * 8, Math.min(textureBounds.bounds.length, (k - colorOff) * 8));
                            }
                            
                            this.shape.colors.push(bounds);
                            
                            if (interpreter.get("mode") === Tessellator.COLOR){
                                colorOff = this.shape.colors.length / (4 * 4);
                            }else{
                                colorOff = this.shape.colors.length / (4 * 2);
                            }
                        }
                    }
                }else if (this.shape.type === Tessellator.TRIANGLE){
                    var k = this.shape.vertices.length;
                    
                    var colorOff = this.shape.colors.length / (4 * 3);
                    
                    if (k % 9 !== 0){
                        throw "vector length is invalid for triangles!";
                    }else{
                        k /= 3 * 3;
                    }
                    
                    for (var i = 0; i < k; i++){
                        vertexIndexes.push([
                            (i * 3) + vertexOffset + 0,
                            (i * 3) + vertexOffset + 1,
                            (i * 3) + vertexOffset + 2
                        ]);
                        
                        if (colorOff <= i && textureBounds){
                            var bounds;
                            
                            if (textureBounds.defaultBounds){
                                bounds = [
                                                          0,                       0,
                                    textureBounds.bounds[0],                       0,
                                    textureBounds.bounds[1], textureBounds.bounds[1],
                                ];
                            }else{
                                bounds = textureBounds.bounds.subarray((i - colorOff) * 6, (k - colorOff) * 6);
                            }
                            
                            this.shape.colors.push(bounds);
                            
                            colorOff = this.shape.colors.size / (4 * 3);
                        }
                    }
                }else if (this.shape.type === Tessellator.TRIANGLE_STRIP){
                    var k = this.shape.vertices.length / 3;
                    
                    if (k < 3){
                        throw "not enough vertices to draw triangle strip."
                    }
                    
                    if (textureBounds && !textureBounds.defaultBounds && textureBounds.bounds.length / 4 !== k){
                        throw "bound texture coordinates length mismatch with vertices length!";
                    }
                    
                    var indices = [];
                    
                    for (var i = 0; i < k; i++){
                        if (i < 3){
                            indices.push(i + vertexOffset);
                        }else{
                            indices.push(indices[indices.length - 2]);
                            indices.push(indices[indices.length - 2]);
                            indices.push(i                        + vertexOffset);
                        }
                        
                        if (textureBounds){
                            var colorBoundsIndex = (i * 3) % textureBounds.length;
                            
                            if (i === 2){
                                var bounds;
                                
                                if (textureBounds.defaultBounds){
                                    bounds = [
                                                              0,                       0,
                                        textureBounds.bounds[0],                       0,
                                        textureBounds.bounds[1], textureBounds.bounds[1],
                                    ];
                                }else{
                                    bounds = textureBounds.bounds.subarray(0, i * 3);
                                }
                                
                                this.shape.colors.push(bounds);
                            }else if (i >= 3){
                                var bounds;
                                
                                if (textureBounds.defaultBounds){
                                    bounds = [
                                        textureBounds.bounds[1], textureBounds.bounds[1], 0, 0,
                                    ];
                                }else{
                                    bounds = textureBounds.bounds.subarray(i * 3, (i + 1) * 3);
                                }
                                
                                this.shape.colors.push(bounds);
                            }
                        }
                    }
                    
                    vertexIndexes.push(indices);
                }else if (this.shape.type === Tessellator.TRIANGLE_FAN_CCW){
                    var k = this.shape.vertices.length / 3;
                    
                    if (k < 3){
                        throw "not enough vertices to draw triangle strip."
                    }
                    
                    if (textureBounds && !textureBounds.defaultBounds && textureBounds.bounds.length / 4 !== k){
                        throw "bound texture coordinates length mismatch with vertices length!";
                    }
                    
                    var indices = [];
                    
                    for (var i = 0; i < k; i++){
                        if (i < 3){
                            indices.push(i + vertexOffset);
                        }else{
                            indices.push(indices[indices.length - 1]);
                            indices.push(indices[                 0]);
                            indices.push(i            + vertexOffset);
                        }
                        
                        if (textureBounds){
                            var colorBoundsIndex = (i * 3) % textureBounds.length;
                            
                            if (i === 2){
                                var bounds;
                                
                                if (textureBounds.defaultBounds){
                                    bounds = [
                                                              0,                       0,
                                        textureBounds.bounds[0],                       0,
                                        textureBounds.bounds[1], textureBounds.bounds[1],
                                    ];
                                }else{
                                    bounds = textureBounds.bounds.subarray(0, i * 3);
                                }
                                
                                this.shape.colors.push(bounds);
                            }else if (i >= 3){
                                var bounds;
                                
                                if (textureBounds.defaultBounds){
                                    bounds = [
                                        textureBounds.bounds[1], textureBounds.bounds[1],
                                    ];
                                }else{
                                    bounds = textureBounds.bounds.subarray(i * 3, (i + 1) * 3);
                                }
                                
                                this.shape.colors.push(bounds);
                            }
                        }
                    }
                    
                    vertexIndexes.push(indices);
                }else if (this.shape.type === Tessellator.TRIANGLE_FAN_CW){
                    var k = this.shape.vertices.length / 3;
                    
                    if (k < 3){
                        throw "not enough vertices to draw triangle strip."
                    }
                    
                    if (textureBounds && !textureBounds.defaultBounds && textureBounds.bounds.length / 4 !== k){
                        throw "bound texture coordinates length mismatch with vertices length!";
                    }
                    
                    var indices = [];
                    
                    for (var i = 0; i < k; i++){
                        if (i < 3){
                            indices.push(i + vertexOffset);
                        }else{
                            indices.push(indices[                 0]);
                            indices.push(indices[indices.length - 2]);
                            indices.push(i            + vertexOffset);
                        }
                        
                        if (textureBounds){
                            var colorBoundsIndex = (i * 3) % textureBounds.length;
                            
                            if (i === 2){
                                var bounds;
                                
                                if (textureBounds.defaultBounds){
                                    bounds = [
                                                              0,                       0,
                                        textureBounds.bounds[0],                       0,
                                        textureBounds.bounds[1], textureBounds.bounds[1],
                                    ];
                                }else{
                                    bounds = textureBounds.bounds.slice(0, i * 3);
                                }
                                
                                this.shape.colors.push(bounds);
                            }else if (i >= 3){
                                var bounds;
                                
                                if (textureBounds.defaultBounds){
                                    bounds = [
                                        textureBounds.bounds[1], textureBounds.bounds[1],
                                    ];
                                }else{
                                    bounds = textureBounds.bounds.slice(i * 3, (i + 1) * 3);
                                }
                                
                                this.shape.colors.push(bounds);
                            }
                        }
                    }
                    
                    vertexIndexes.push(indices);
                }
                
                this.shape.type = Tessellator.TRIANGLE;
                
                if (interpreter.get("lighting")){
                    if (interpreter.normals){
                        this.shape.normals.push(interpreter.normals);
                        
                        interpreter.normals = null;
                    }else{ //calculate default normals.
                        var vertices = this.shape.vertices;
                        var indices = this.shape.indices;
                        var normals = new Float32Array(vertices.length);
                        
                        for (var i = 0, k = indices.length / 3; i < k; i++){
                            var
                                x1 = vertices.get((indices.get(i * 3 + 0) - vertexOffset) * 3 + 0),
                                y1 = vertices.get((indices.get(i * 3 + 0) - vertexOffset) * 3 + 1),
                                z1 = vertices.get((indices.get(i * 3 + 0) - vertexOffset) * 3 + 2),
                                
                                x2 = vertices.get((indices.get(i * 3 + 1) - vertexOffset) * 3 + 0),
                                y2 = vertices.get((indices.get(i * 3 + 1) - vertexOffset) * 3 + 1),
                                z2 = vertices.get((indices.get(i * 3 + 1) - vertexOffset) * 3 + 2),
                                
                                x3 = vertices.get((indices.get(i * 3 + 2) - vertexOffset) * 3 + 0),
                                y3 = vertices.get((indices.get(i * 3 + 2) - vertexOffset) * 3 + 1),
                                z3 = vertices.get((indices.get(i * 3 + 2) - vertexOffset) * 3 + 2);
                            
                            //deltas
                            var
                                Ux = x2 - x1,
                                Uy = y2 - y1,
                                Uz = z2 - z1,
                                
                                Vx = x3 - x1,
                                Vy = y3 - y1,
                                Vz = z3 - z1;
                            
                            //normals
                            var
                                Nx = (Uy * Vz) - (Uz * Vy),
                                Ny = (Uz * Vx) - (Ux * Vz),
                                Nz = (Ux * Vy) - (Uy * Vx);
                            
                            for (var l = 0; l < 3; l++){
                                var index = indices.get(i * 3 + l) - vertexOffset;
                                
                                normals[index * 3 + 0] = Nx;
                                normals[index * 3 + 1] = Ny;
                                normals[index * 3 + 2] = Nz;
                            }
                        }
                        
                        this.shape.normals.push(normals);
                    }
                }
                
                if (shapeAddon){
                    //overflow. even WebGL has its limits.
                    if (shapeAddon.indices.length + this.shape.indices.length > Tessellator.VERTEX_LIMIT){
                        interpreter.model.push(shapeAddon);
                        
                        //reset vertex pointers to 0.
                        this.shape.indices.offset(-vertexOffset);
                        interpreter.set("drawCache", this.shape);
                    }else{
                        shapeAddon.indices.push(this.shape.indices);
                        shapeAddon.vertices.push(this.shape.vertices);
                        shapeAddon.colors.push(this.shape.colors);
                        shapeAddon.normals.push(this.shape.normals);
                    }
                    
                    this.shape.dispose();
                }else{
                    interpreter.set("drawCache", this.shape);
                }
            }
            
            interpreter.shape = null;
            return null;
        }


        Tessellator.End.prototype.apply = Tessellator.EMPTY_FUNC;
        
        Tessellator.End.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //vertex
        Tessellator.Initializer.setDefault ("draw", function (){
            return Tessellator.COLOR;
        });
        
        Tessellator.Initializer.prototype.flush = function (){
            if (this.get("drawCache")){
                var cache = this.getr("drawCache");
                
                this.model.push(cache);
                
                return cache;
            }
            
            return null;
        }
        
        Tessellator.Model.prototype.setVertex = function(){
            if (arguments.length === 1){
                return this.add(new Tessellator.Vertex(arguments[0]));
            }else{
                return this.add(new Tessellator.Vertex(arguments));
            }
        }
        
        Tessellator.Vertex = function (vertices){
            this.type = Tessellator.VERTEX;
            
            this.vertices = vertices;
        }


        Tessellator.Vertex.prototype.init = function (interpreter){
            if (interpreter.shape === null){
                throw "cannot add vertices to a non existing shape";
            }
            
            if (interpreter.shape.type === Tessellator.TEXTURE){
                if (this.vertices.length){
                    interpreter.shape.vertices.push(this.vertices);
                }
            }else if (interpreter.shape.type === Tessellator.NORMAL){
                if (this.vertices.length){
                    interpreter.shape.vertices.push(this.vertices);
                }
            }else{
                if (this.vertices.length){
                    if (interpreter.get("colorAttribEnabled") && interpreter.get("draw") !== Tessellator.TEXTURE){
                        var k = this.vertices.length / 3;
                        var c = interpreter.get("color");
                        
                        for (var i = 0; i < k; i++){
                            interpreter.shape.colors.push(c);
                        }
                    }
                    
                    if (interpreter.shape.matrix){
                        var ver = this.vertices;
                        var m = interpreter.shape.matrix;
                        
                        for (var i = 0, k = ver.length / 3; i < k; i++){
                            var
                                x = ver[i * 3 + 0],
                                y = ver[i * 3 + 1],
                                z = ver[i * 3 + 2];
                            
                            ver[i * 3 + 0] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
                            ver[i * 3 + 1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
                            ver[i * 3 + 2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];
                        }
                    }
                
                    interpreter.shape.vertices.push(this.vertices);
                    interpreter.shape.items += k;
                }
            }
            
            return null;
        }


        Tessellator.Vertex.prototype.apply = Tessellator.EMPTY_FUNC;
        
        Tessellator.Vertex.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //draw object
        Tessellator.Model.prototype.drawObject = function (object){
            return this.add(new Tessellator.ObjectDrawer(object));
        }
        
        Tessellator.ObjectDrawer = function (object){
            this.object = object;
            
            this.disposable = true;
        }
        
        Tessellator.ObjectDrawer.prototype.init = Tessellator.EMPTY_FUNC;
        Tessellator.ObjectDrawer.prototype.postInit = Tessellator.EMPTY_FUNC;
        
        Tessellator.ObjectDrawer.prototype.apply = function (matrix){
            this.object.render(matrix);
        }
        
        Tessellator.ObjectDrawer.prototype.dispose = function (){
            if (this.object.disposable){
                this.object.dispose();
            }
        }
    }
    { //text
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
            }
        });
        
        Tessellator.Initializer.setDefault("fontSheet", function (interpreter) {
            return interpreter.tessellator.DEFAULT_FONT_SHEET;
        });
        
        Tessellator.Model.prototype.drawText = function (text, x, y){
            return this.add (new Tessellator.Text(this, text, x, y));
        }
        
        Tessellator.Text = function (matrix, text, x, y){
            this.type = Tessellator.TEXT;
            
            this.matrix = matrix;
            this.text = text;
            this.x = x;
            this.y = y;
        }


        Tessellator.Text.prototype.init = function (interpreter){
            if (this.text.length > 0){
                var fontSheet = interpreter.get("fontSheet");
                
                if (!fontSheet.texture){
                    fontSheet.texture = interpreter.tessellator.createTexture(fontSheet.src, fontSheet.filter);
                    fontSheet.texture.disposable = false;
                }
                
                var vertexTable = [];
                var textureCoordTable = [];
                var normals = [];
                
                var xOrigin = 0;
                var yOrigin = 0;
                
                if (this.x !== undefined && this.y !== undefined){
                    xOrigin = this.x;
                    yOrigin = this.y;
                }
                
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
                            }
                        }else if (this.text.charAt(j) === '\n' ||
                                  this.text.charAt(j) === '\r'){
                            break main;
                        }else{
                            break w;
                        }
                    }
                    
                    var code = this.text.charCodeAt(j);
                    
                    var charWidth = 1;
                    
                    if (fontSheet.widthTable){
                        charWidth = fontSheet.widthTable[code];
                    }
                    
                    if (this.text.charAt(j) === ' '){
                        k++;
                        xOffset += charWidth;
                        
                        code = this.text.charCodeAt(j + 1);
                        
                        if (fontSheet.widthTable){
                            charWidth = fontSheet.widthTable[code];
                        }
                    }
                    
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
                    }
                    
                    xOffset += charWidth;
                }
                
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
            }
            
            return null;
        }


        Tessellator.Text.prototype.apply = Tessellator.EMPTY_FUNC;
        
        Tessellator.Text.prototype.postInit = Tessellator.EMPTY_FUNC;
    }
    { //views
        Tessellator.Model.prototype.setView = Tessellator.Model.prototype.add;
        
        { //perspective view
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
                }
            }


            Tessellator.PerspectiveView.prototype.apply = function (render){
                var aspectRatio = this.aspectRatio;
                
                render.set("nearView", this.nearView);
                render.set("farView", this.farView);
                
                if (!aspectRatio){
                    aspectRatio = render.get("window").aspect();
                }
                
                render.get("mvMatrix").identity();
                
                var
                    f = 1 / Math.tan(this.FOV / 2),
                    nf = this.nearView - this.farView;
                
                render.set("pMatrix", Tessellator.mat4(
                    f / aspectRatio, 0, 0, 0,
                    0, f, 0, 0,
                    0, 0, (this.farView + this.nearView) / nf, -1,
                    0, 0, (2 * this.farView * this.nearView) / nf, 0
                ));
            }


            Tessellator.PerspectiveView.prototype.init = function (interpreter){
                interpreter.flush();
            }
            
            Tessellator.PerspectiveView.prototype.postInit = Tessellator.EMPTY_FUNC;
        }
        { //orthographic view
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
                
                render.get("mvMatrix").identity();
                
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
            
            Tessellator.OrthographicView.prototype.postInit = Tessellator.EMPTY_FUNC;
        }
        { //static view
            Tessellator.StaticView = function (x, y){
                this.type = Tessellator.VIEW;
                
                this.x = x || Tessellator.LEFT;
                this.y = y || Tessellator.TOP;
            }
            
            Tessellator.StaticView.X_LOOKUP = {
                "left": -1,
                "center": 0,
                "right": 1
            }
            
            Tessellator.StaticView.Y_LOOKUP = {
                "top": 1,
                "center": 0,
                "bottom": -1
            }
            
            Tessellator.StaticView.prototype.apply = function (render){
                render.get("mvMatrix").identity();
                
                var window = render.get("window");
                
                var yoff, xoff;
                
                if (isNaN(this.x)){
                    xoff = Tessellator.StaticView.X_LOOKUP[this.x.toString().toLowerCase()];
                }else{
                    xoff = this.x;
                }
                
                if (isNaN(this.y)){
                    yoff = Tessellator.StaticView.Y_LOOKUP[this.y.toString().toLowerCase()];
                }else{
                    yoff = this.y;
                }
                
                render.set("pMatrix", Tessellator.mat4(
                    2 / window[0], 0, 0, 0,
                    0, 2 / window[1], 0, 0,
                    0, 0, 0, 0,
                    xoff, yoff, -1, 1
                ));
            }
            
            Tessellator.StaticView.prototype.init = function (interpreter){
                interpreter.flush();
            }
            
            Tessellator.StaticView.prototype.postInit = Tessellator.EMPTY_FUNC;
        }
        { //clip space
            Tessellator.ClipSpaceView = function (){
                this.type = Tessellator.VIEW;
            }

            Tessellator.ClipSpaceView.prototype.apply = function (render){
                render.get("mvMatrix").identity();
                
                render.set("pMatrix", Tessellator.mat4().identity());
            }
            
            Tessellator.ClipSpaceView.prototype.init = function (interpreter){
                interpreter.flush();
            }
            
            Tessellator.ClipSpaceView.prototype.postInit = Tessellator.EMPTY_FUNC;
        }
    }
    { //cameras
        { //standard camera
            Tessellator.Camera = function (view){
                this.type = Tessellator.VIEW;
                this.subtype = Tessellator.CAMERA;
                
                this.view = view;
            }
            
            Tessellator.Camera.prototype.apply = function (render){
                this.view.apply(render);
            }
            
            Tessellator.Camera.prototype.init = function (interpreter){
                this.view.init(interpreter);
            }
            
            Tessellator.Camera.prototype.postInit = function (interpreter){
                this.view.postInit(renderer);
            }
        }
        { //translation camera
            Tessellator.TranslationCamera = function (view, x, y, z){
                this.type = Tessellator.VIEW;
                this.subtype = Tessellator.CAMERA;
                
                this.view = view;
                
                if (arguments.length === 2){
                    this.pos = x;
                }else{
                    this.pos = Tessellator.vec3(x, y, z);
                }
            }
            
            Tessellator.TranslationCamera.prototype.apply = function (render){
                this.view.apply(render);
                
                this.set(render.exists("mvMatrix") ? render.get("mvMatrix") : render.get("pMatrix"));
            }
            
            Tessellator.TranslationCamera.prototype.set = function (m){
                m.translate(this.pos.clone().negate());
            }
            
            Tessellator.TranslationCamera.prototype.init = function (interpreter){
                this.view.init(interpreter);
            }
            
            Tessellator.TranslationCamera.prototype.postInit = function (interpreter){
                this.view.postInit(interpreter);
            }
        }
        { //directional camera
            Tessellator.DirectionalCamera = function (view, vx, vy, vz, ux, uy, uz){
                this.type = Tessellator.VIEW;
                this.subtype = Tessellator.CAMERA;
                this.view = view;
                
                this.vx = vx === undefined ?  0 : vx;
                this.vy = vy === undefined ?  0 : vy;
                this.vz = vz === undefined ? -1 : vz;
                
                this.ux = ux === undefined ? 0 : ux;
                this.uy = uy === undefined ? 1 : uy;
                this.uz = uz === undefined ? 0 : uz;
            }
            
            Tessellator.DirectionalCamera.prototype.apply = function (render){
                this.view.apply(render);
                this.set(render.get("mvMatrix"));
            }
            
            Tessellator.DirectionalCamera.prototype.set = function (m){
                {
                    var b = Math.sqrt(this.vx * this.vx + this.vy * this.vy + this.vz * this.vz);
                    var zx = this.vx / b;
                    var zy = this.vy / b;
                    var zz = -this.vz / b;
                }
                
                {
                    var xx = this.uy * zz - this.uz * zy;
                    var xy = this.uz * zx - this.ux * zz;
                    var xz = this.ux * zy - this.uy * zx;
                    
                    var b = Math.sqrt(xx * xx + xy * xy + xz * xz);
                    xx /= b;
                    xy /= b;
                    xz /= b;
                }
                
                {
                    var yx = zy * xz - zz * xy;
                    var yy = zz * xx - zx * xz;
                    var yz = zx * xy - zy * xx;
                    
                    var b = Math.sqrt(yx * yx + yy * yy + yz * yz);
                    yx /= b;
                    yy /= b;
                    yz /= b;
                }
                
                m.multiply(Tessellator.mat3(
                    xx, yx, zx,
                    xy, yy, zy,
                    xz, yz, zz
                ));
            }
            
            Tessellator.DirectionalCamera.prototype.init = function (interpreter){
                this.view.init(interpreter)
            }
            
            Tessellator.DirectionalCamera.prototype.postInit = function (interpreter){
                this.view.postInit(interpreter);
            }
        }
        { //radial camera
            Tessellator.RadialCamera = function (view, radX, radY, radZ){
                this.type = Tessellator.VIEW;
                this.subtype = Tessellator.CAMERA;
                this.view = view;
                
                this.radX = radX === undefined ? 0 : radX; //yaw
                this.radY = radY === undefined ? 0 : radY; //pitch
                this.radZ = radZ === undefined ? 0 : radZ; //roll
            }
            
            Tessellator.RadialCamera.prototype.apply = function (render){
                this.view.apply(render);
                
                this.set(render.exists("mvMatrix") ? render.get("mvMatrix") : render.get("pMatrix"));
            }
            
            Tessellator.RadialCamera.prototype.set = function (m){
                var
                    sx = Math.sin(this.radX),
                    sy = Math.sin(this.radY),
                    sz = Math.sin(this.radZ),
                    cx = Math.cos(this.radX),
                    cy = Math.cos(this.radY),
                    cz = Math.cos(this.radZ);
                
                {
                    var
                        vx = cy * -sx,
                        vy = sy,
                        vz = cy * cx;
                    
                    var b = Math.sqrt(vx * vx + vy * vy + vz * vz);
                    var zx = vx / b;
                    var zy = vy / b;
                    var zz = vz / b;
                    
                }
                
                {
                    var
                        ux = sz,
                        uy = cz,
                        uz = 0;
                    
                    var xx = uy * zz - uz * zy;
                    var xy = uz * zx - ux * zz;
                    var xz = ux * zy - uy * zx;
                    
                    var b = Math.sqrt(xx * xx + xy * xy + xz * xz);
                    xx /= b;
                    xy /= b;
                    xz /= b;
                }
                
                {
                    var yx = zy * xz - zz * xy;
                    var yy = zz * xx - zx * xz;
                    var yz = zx * xy - zy * xx;
                    
                    var b = Math.sqrt(yx * yx + yy * yy + yz * yz);
                    yx /= b;
                    yy /= b;
                    yz /= b;
                }
                
                m.multiply(Tessellator.mat3(
                    xx, yx, zx,
                    xy, yy, zy,
                    xz, yz, zz
                ));
            }
            
            Tessellator.RadialCamera.prototype.init = function (interpreter){
                this.view.init(interpreter)
            }
            
            Tessellator.RadialCamera.prototype.postInit = function (interpreter){
                this.view.postInit(interpreter);
            }
        }
        { //point tracking camera
            Tessellator.PointTrackingCamera = function (view, px, py, pz, ux, uy, uz){
                this.type = Tessellator.VIEW;
                this.subtype = Tessellator.CAMERA;
                this.view = view;
                
                this.px = px === undefined ? 0 : px;
                this.py = py === undefined ? 0 : py;
                this.pz = pz === undefined ? 0 : pz;
                
                this.ux = ux === undefined ? 0 : ux;
                this.uy = uy === undefined ? 1 : uy;
                this.uz = uz === undefined ? 0 : uz;
            }
            
            Tessellator.PointTrackingCamera.prototype.apply = function (render){
                this.view.apply(render);
                
                this.set(render.exists("mvMatrix") ? render.get("mvMatrix") : render.get("pMatrix"));
            }
            
            Tessellator.PointTrackingCamera.prototype.set = function (m){
                {
                    var
                        vx = this.px + this.x,
                        vy = this.py + this.y,
                        vz = this.pz + this.z;
                    
                    var b = Math.sqrt(vx * vx + vy * vy + vz * vz);
                    var zx = vx / b;
                    var zy = vy / b;
                    var zz = vz / b;
                }
                
                {
                    var xx = this.uy * zz - this.uz * zy;
                    var xy = this.uz * zx - this.ux * zz;
                    var xz = this.ux * zy - this.uy * zx;
                    
                    var b = Math.sqrt(xx * xx + xy * xy + xz * xz);
                    xx /= b;
                    xy /= b;
                    xz /= b;
                }
                
                {
                    var yx = zy * xz - zz * xy;
                    var yy = zz * xx - zx * xz;
                    var yz = zx * xy - zy * xx;
                    
                    var b = Math.sqrt(yx * yx + yy * yy + yz * yz);
                    yx /= b;
                    yy /= b;
                    yz /= b;
                }
                
                m.multiply(Tessellator.mat3(
                    xx, yx, zx,
                    xy, yy, zy,
                    xz, yz, zz
                ));
            }
            
            Tessellator.PointTrackingCamera.prototype.init = function (interpreter){
                this.view.init(interpreter)
            }
            
            Tessellator.PointTrackingCamera.prototype.postInit = function (interpreter){
                this.view.postInit(interpreter);
            }
        }
        { //radial tracking camera
            Tessellator.RadialTrackingCamera = function (view, px, py, pz, radius, radX, radY, radZ){
                this.type = Tessellator.VIEW;
                this.subtype = Tessellator.CAMERA;
                this.view = view;
                
                this.px = px === undefined ? 0 : px;
                this.py = py === undefined ? 0 : py;
                this.pz = pz === undefined ? 0 : pz;
                
                this.radius = radius === undefined ? 0 : radius;
                this.radX = radX === undefined ? 0 : radX; //yaw
                this.radY = radY === undefined ? 0 : radY; //pitch
                this.radZ = radZ === undefined ? 0 : radZ; //roll
            }
            
            Tessellator.RadialTrackingCamera.prototype.apply = function (render){
                this.view.apply(render);
                
                this.set(render.exists("mvMatrix") ? render.get("mvMatrix") : render.get("pMatrix"));
            }
            
            Tessellator.RadialTrackingCamera.prototype.set = function (m){
                var
                    sx = Math.sin(this.radX),
                    sy = Math.sin(this.radY),
                    sz = Math.sin(this.radZ),
                    cx = Math.cos(this.radX),
                    cy = Math.cos(this.radY),
                    cz = Math.cos(this.radZ);
                
                var
                    x = this.px + this.radius * sx * cy,
                    y = this.py + this.radius * sy * cx,
                    z = this.pz + this.radius * cx * cy;
                
                {
                    var
                        vx = this.px + x,
                        vy = this.py + y,
                        vz = this.pz + z;
                    
                    var b = Math.sqrt(vx * vx + vy * vy + vz * vz);
                    var zx = vx / b;
                    var zy = vy / b;
                    var zz = vz / b;
                    
                }
                
                {
                    var
                        ux = sz + sx,
                        uy = cz * cy * cx,
                        uz = 0;
                    
                    var xx = uy * zz - uz * zy;
                    var xy = uz * zx - ux * zz;
                    var xz = ux * zy - uy * zx;
                    
                    var b = Math.sqrt(xx * xx + xy * xy + xz * xz);
                    xx /= b;
                    xy /= b;
                    xz /= b;
                }
                
                {
                    var yx = zy * xz - zz * xy;
                    var yy = zz * xx - zx * xz;
                    var yz = zx * xy - zy * xx;
                    
                    var b = Math.sqrt(yx * yx + yy * yy + yz * yz);
                    yx /= b;
                    yy /= b;
                    yz /= b;
                }
                
                m.multiply(Tessellator.mat3(
                    xx, yx, zx,
                    xy, yy, zy,
                    xz, yz, zz
                ));
                
                m.translate(-x, -y, -z);
            }
            
            Tessellator.RadialTrackingCamera.prototype.init = function (interpreter){
                this.view.init(interpreter)
            }
            
            Tessellator.RadialTrackingCamera.prototype.postInit = function (interpreter){
                this.view.postInit(interpreter);
            }
        }
    }
    { //lighting
        Tessellator.Initializer.setDefault("lighting", function () {
            return true;
        });
        
        { //ambient lighting
            Tessellator.Model.prototype.setAmbientLight = function (){
                return this.add(new Tessellator.AmbientLight());
            }
            
            Tessellator.AmbientLight = function (){
                this.type = Tessellator.LIGHTING_AMBIENT;
                this.subtype = Tessellator.LIGHTING;
            }


            Tessellator.AmbientLight.prototype.set = function (lighting, index, matrix){
                lighting[0 + index] = 1;
                lighting[1 + index] = this.r;
                lighting[2 + index] = this.g;
                lighting[3 + index] = this.b;
                
                return 1;
            }


            Tessellator.AmbientLight.prototype.apply = Tessellator.EMPTY_FUNC;


            Tessellator.AmbientLight.prototype.init = function (interpreter){
                var color = interpreter.get("color");
                this.r = color.r * color.a;
                this.g = color.g * color.a;
                this.b = color.b * color.a;
            }
            
            Tessellator.AmbientLight.prototype.postInit = Tessellator.EMPTY_FUNC;
        }
        { //specular lighting
            Tessellator.Model.prototype.setSpecularReflection = function (reflection){
                this.add(new Tessellator.SpecularLight(reflection));
            }
            
            Tessellator.SpecularLight = function (intensity){
                this.type = Tessellator.LIGHTING_SPECULAR;
                this.subtype = Tessellator.LIGHTING;
                
                this.intensity = intensity;
            }
            
            Tessellator.SpecularLight.prototype.init = function (interpreter){
                interpreter.flush();
            }
            
            Tessellator.SpecularLight.prototype.set = Tessellator.EMPTY_FUNC;
            Tessellator.SpecularLight.prototype.postInit = Tessellator.EMPTY_FUNC;
            
            Tessellator.SpecularLight.prototype.apply = function (render){
                render.set("specular", this.intensity);
            }
        }
        { //point lighting
            Tessellator.Model.prototype.setPointLight = function (x, y, z, range){
                return this.add(new Tessellator.PointLight(x, y, z, range));
            }
            
            Tessellator.PointLight = function (x, y, z, range){
                this.type = Tessellator.LIGHTING_POINT;
                this.subtype = Tessellator.LIGHTING;
                
                this.x = x;
                this.y = y;
                this.z = z;
                this.range = range;
            }
            
            Tessellator.PointLight.prototype.set = function (lighting, index, matrix){
                if (this.range){
                    lighting[0 + index] = 4;
                    lighting[1 + index] = this.r;
                    lighting[2 + index] = this.g;
                    lighting[3 + index] = this.b;
                    
                    {
                        //calculate scale values
                        var
                            sx = matrix[ 0] * this.x + matrix[ 4] * this.y + matrix[ 8] * this.z,
                            sy = matrix[ 1] * this.x + matrix[ 5] * this.y + matrix[ 9] * this.z,
                            sz = matrix[ 2] * this.x + matrix[ 6] * this.y + matrix[10] * this.z;
                        
                        //calculate translated values
                        var
                            tx = sx + matrix[12],
                            ty = sy + matrix[13],
                            tz = sz + matrix[14];
                        
                        lighting[4 + index] = tx;
                        lighting[5 + index] = ty;
                        lighting[6 + index] = tz;
                    }
                    
                    lighting[7 + index] = this.range;
                }else{
                    lighting[0 + index] = 3;
                    lighting[1 + index] = this.r;
                    lighting[2 + index] = this.g;
                    lighting[3 + index] = this.b;
                    
                    {
                        //calculate scale values
                        var
                            sx = matrix[ 0] * this.x + matrix[ 4] * this.y + matrix[ 8] * this.z,
                            sy = matrix[ 1] * this.x + matrix[ 5] * this.y + matrix[ 9] * this.z,
                            sz = matrix[ 2] * this.x + matrix[ 6] * this.y + matrix[10] * this.z;
                        
                        //calculate translated values
                        var
                            tx = sx + matrix[12],
                            ty = sy + matrix[13],
                            tz = sz + matrix[14];
                        
                        lighting[4 + index] = tx;
                        lighting[5 + index] = ty;
                        lighting[6 + index] = tz;
                    }
                }
                
                return 2;
            }
            
            Tessellator.PointLight.prototype.apply = Tessellator.EMPTY_FUNC;


            Tessellator.PointLight.prototype.init = function (interpreter){
                var color = interpreter.get("color");
                this.r = color.r * color.a;
                this.g = color.g * color.a;
                this.b = color.b * color.a;
            }
            
            Tessellator.PointLight.prototype.postInit = Tessellator.EMPTY_FUNC;
        }
        { //spot lighting
            Tessellator.Model.prototype.setSpotLight = function (x, y, z, vx, vy, vz, angle, range){
                return this.add(new Tessellator.SpotLight(x, y, z, vx, vy, vz, angle, range));
            }
            
            Tessellator.SpotLight = function (x, y, z, vx, vy, vz, angle, range){
                this.type = Tessellator.LIGHTING_SPOT;
                this.subtype = Tessellator.LIGHTING;
                
                this.x = x;
                this.y = y;
                this.z = z;
                this.vx = vx;
                this.vy = vy;
                this.vz = vz;
                this.angle = angle;
                this.range = range;
            }
            
            Tessellator.SpotLight.prototype.set = function (lighting, index, matrix){
                if (!this.range){
                    lighting[0 + index] = 5;
                    lighting[1 + index] = this.r;
                    lighting[2 + index] = this.g;
                    lighting[3 + index] = this.b;
                    
                    //calculate translated values
                    lighting[4 + index] = matrix[ 0] * this.x + matrix[ 4] * this.y + matrix[ 8] * this.z + matrix[12];
                    lighting[5 + index] = matrix[ 1] * this.x + matrix[ 5] * this.y + matrix[ 9] * this.z + matrix[13];
                    lighting[6 + index] = matrix[ 2] * this.x + matrix[ 6] * this.y + matrix[10] * this.z + matrix[14];
                    
                    //adjust vector to follow matrix rotations
                    {
                        var
                            tx = matrix[ 0] * this.vx + matrix[ 4] * this.vy + matrix[ 8] * this.vz,
                            ty = matrix[ 1] * this.vx + matrix[ 5] * this.vy + matrix[ 9] * this.vz,
                            tz = matrix[ 2] * this.vx + matrix[ 6] * this.vy + matrix[10] * this.vz;
                        
                        //normalize
                        var l = Math.sqrt(tx * tx + ty * ty + tz * tz);
                        tx /= l;
                        ty /= l;
                        tz /= l;
                        
                        lighting[8  + index] = tx;
                        lighting[9  + index] = ty;
                        lighting[10 + index] = tz;
                    }
                    
                    lighting[11 + index] = this.angle;
                }else{
                    lighting[0 + index] = 6;
                    lighting[1 + index] = this.r;
                    lighting[2 + index] = this.g;
                    lighting[3 + index] = this.b;
                    
                    //adjust position to follow matrix
                    {
                        //calculate scale values
                        var
                            sx = matrix[ 0] * this.x + matrix[ 4] * this.y + matrix[ 8] * this.z,
                            sy = matrix[ 1] * this.x + matrix[ 5] * this.y + matrix[ 9] * this.z,
                            sz = matrix[ 2] * this.x + matrix[ 6] * this.y + matrix[10] * this.z;
                        
                        //calculate translated values
                        var
                            tx = sx + matrix[12],
                            ty = sy + matrix[13],
                            tz = sz + matrix[14];
                        
                        lighting[4 + index] = tx;
                        lighting[5 + index] = ty;
                        lighting[6 + index] = tz;
                    }
                    
                    lighting[7 + index] = this.range;
                    
                    //adjust vector to follow matrix rotations
                    {
                        var
                            tx = (matrix[ 0] * this.vx + matrix[ 4] * this.vy + matrix[ 8] * this.vz),
                            ty = (matrix[ 1] * this.vx + matrix[ 5] * this.vy + matrix[ 9] * this.vz),
                            tz = (matrix[ 2] * this.vx + matrix[ 6] * this.vy + matrix[10] * this.vz);
                        
                        //normalize
                        var l = Math.sqrt(tx * tx + ty * ty + tz * tz);
                        tx /= l;
                        ty /= l;
                        tz /= l;
                        
                        lighting[8  + index] = tx;
                        lighting[9  + index] = ty;
                        lighting[10 + index] = tz;
                    }
                    
                    lighting[11 + index] = this.angle;
                }
                
                return 3;
            }
            
            Tessellator.SpotLight.prototype.apply = Tessellator.EMPTY_FUNC;


            Tessellator.SpotLight.prototype.init = function (interpreter){
                var color = interpreter.get("color");
                this.r = color.r * color.a;
                this.g = color.g * color.a;
                this.b = color.b * color.a;
            }
            
            Tessellator.SpotLight.prototype.postInit = Tessellator.EMPTY_FUNC;
        }
        { //direction lighting
            Tessellator.Model.prototype.setDirectionalLight = function (x, y, z){
                return this.add(new Tessellator.DirectionalLight(x, y, z));
            }
            
            Tessellator.DirectionalLight = function (x, y, z){
                this.type = Tessellator.LIGHTING_DIRECTIONAL;
                this.subtype = Tessellator.LIGHTING;
                
                this.x = x;
                this.y = y;
                this.z = z;
            }
            
            Tessellator.DirectionalLight.prototype.set = function (lighting, index, matrix){
                lighting[0 + index] = 2;
                lighting[1 + index] = this.r;
                lighting[2 + index] = this.g;
                lighting[3 + index] = this.b;
                
                //adjust vector to follow matrix rotations
                {
                    var
                        tx = (matrix[ 0] * this.x + matrix[ 4] * this.y + matrix[ 8] * this.z),
                        ty = (matrix[ 1] * this.x + matrix[ 5] * this.y + matrix[ 9] * this.z),
                        tz = (matrix[ 2] * this.x + matrix[ 6] * this.y + matrix[10] * this.z);
                    
                    //normalize
                    var l = Math.sqrt(tx * tx + ty * ty + tz * tz);
                    tx /= l;
                    ty /= l;
                    tz /= l;
                    
                    lighting[4 + index] = tx;
                    lighting[5 + index] = ty;
                    lighting[6 + index] = tz;
                }
                
                return 2;
            }
            
            Tessellator.DirectionalLight.prototype.apply = Tessellator.EMPTY_FUNC;


            Tessellator.DirectionalLight.prototype.init = function (interpreter){
                var color = interpreter.get("color");
                this.r = color.r * color.a;
                this.g = color.g * color.a;
                this.b = color.b * color.a;
            }
            
            Tessellator.DirectionalLight.prototype.postInit = Tessellator.EMPTY_FUNC;
        }
    }
    { //font sheet
        Tessellator.Model.prototype.setFontSheet = function (fontSheet){
            return this.add (new Tessellator.FontSheet(fontSheet));
        }
        
        Tessellator.FontSheet = function (fontSheet){
            this.type = Tessellator.FONT_SHEET;
            
            this.fontSheet = fontSheet;
        }
        
        Tessellator.FontSheet.prototype.init = function (interpreter){
            interpreter.set("fontSheet", this.fontSheet);
            
            return null;
        }
        
        Tessellator.FontSheet.prototype.postInit = Tessellator.EMPTY_FUNC;
        
        Tessellator.FontSheet.prototype.apply = Tessellator.EMPTY_FUNC;
    }
    { //texture scale
        Tessellator.Model.prototype.setTextureScale = function (){
            if (arguments.length == 1){
                return this.add(new Tessellator.TextureScale(arguments[0], arguments[0]));
            }else{
                return this.add(new Tessellator.TextureScale(arguments[0], arguments[1]));
            }
        }
        
        Tessellator.TextureScale = function (scaleX, scaleY) {
            this.type = Tessellator.TEXTURE_SCALE;
            
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }
        
        Tessellator.TextureScale.prototype.init = function (interpreter){
            if (interpreter.get("textureBounds") && interpreter.get("textureBounds").bounds){
                for (var i = 0, k = interpreter.get("textureBounds").bounds.length / 2; i < k; i++){
                    interpreter.get("textureBounds").bounds[i * 2] *= this.scaleX;
                    interpreter.get("textureBounds").bounds[i * 2 + 1] *= this.scaleY;
                }
            }
            
            return null;
        }
        
        Tessellator.TextureScale.prototype.postInit = Tessellator.EMPTY_FUNC;
        
        Tessellator.TextureScale.prototype.apply = Tessellator.EMPTY_FUNC;
    }
    { //texture translate
        Tessellator.Model.prototype.setTextureTranslation = function (){
            if (arguments.length == 1){
                return this.add(new Tessellator.TextureTranslate(arguments[0], arguments[0]));
            }else{
                return this.add(new Tessellator.TextureTranslate(arguments[0], arguments[1]));
            }
        }
        
        Tessellator.TextureTranslate = function (x, y) {
            this.type = Tessellator.TEXTURE_SCALE;
            
            this.x = x;
            this.y = y;
        }
        
        Tessellator.TextureTranslate.prototype.init = function (interpreter){
            if (interpreter.get("textureBounds") && interpreter.get("textureBounds").bounds){
                for (var i = 0, k = interpreter.get("textureBounds").bounds.length / 2; i < k; i++){
                    interpreter.get("textureBounds").bounds[i * 2] += this.x;
                    interpreter.get("textureBounds").bounds[i * 2 + 1] += this.y;
                }
            }
            
            return null;
        }
        
        Tessellator.TextureTranslate.prototype.postInit = Tessellator.EMPTY_FUNC;
        
        Tessellator.TextureTranslate.prototype.apply = Tessellator.EMPTY_FUNC;
    }
    { //line width
        Tessellator.Initializer.setDefault("lineWidth", function () {
            return 1;
        });
    
        Tessellator.Model.prototype.setLineWidth = function (width){
            return this.add (new Tessellator.LineWidth(width));
        }
        
        Tessellator.LineWidth = function (lineWidth){
            this.type = Tessellator.LINE_WIDTH;
            
            this.lineWidth = lineWidth;
        }
        
        Tessellator.LineWidth.prototype.init = function (interpreter){
            //interpreter.set("lineWidth", this.lineWidth);
            
            //return null;
        }
        
        Tessellator.LineWidth.prototype.postInit = Tessellator.EMPTY_FUNC;
        
        Tessellator.LineWidth.prototype.apply = function (render){
            render.tessellator.GL.lineWidth(this.lineWidth);
        }
    }
    { //texture bind
        Tessellator.Model.prototype.bindTexture = function (texture){
            return this.add(new Tessellator.TextureBind(texture));
        }
        
        Tessellator.TextureBind = function (texture){
            this.type = Tessellator.TEXTURE;
            this.texture = texture;
            
            this.disposable = true;
        }
        
        Tessellator.TextureBind.prototype.dispose = function (){
            if (this.texture && this.texture.disposable){
                this.texture.dispose();
            }
        }
        
        Tessellator.TextureBind.prototype.init = function (interpreter){
            if (interpreter.shape){
                throw "cannot bind a new texture if there is a shape currently being drawn.";
            }
            
            if (this.texture.constructor === String){
                this.texture = interpreter.tessellator.getTexture(this.texture);
            }
            
            interpreter.set("textureBounds", this);
            
            //this default will stretch the texture over the surface.
            this.bounds = [
                1, 1
            ];
            
            this.defaultBounds = true;
            
            interpreter.flush();
            interpreter.set("draw", Tessellator.TEXTURE);
            
            interpreter.set("mask", false);
        }
        
        Tessellator.TextureBind.prototype.postInit = Tessellator.EMPTY_FUNC;
        
        Tessellator.TextureBind.prototype.apply = function (render, model){
            render.set("texture", this.texture);
        }
    }
    { //blend func
        Tessellator.Model.prototype.blendFunc = function (){
            return this.add(Tessellator.new.apply(Tessellator.BlendFunc, arguments));
        }
    
        Tessellator.BlendFunc = function (){
            this.type = Tessellator.BLEND_FUNC;
            
            if (arguments.length === 1){
                this.func = arguments[0];
            }else{
                this.func = Tessellator.vec2(arguments);
            }
        }
        
        Tessellator.BlendFunc.prototype.init = function (init){
            init.flush();
        }
        
        Tessellator.BlendFunc.prototype.postInit = Tessellator.EMPTY_FUNC;
        
        Tessellator.BlendFunc.prototype.apply = function (render){
            render.set("blendFunc", this.func);
        }
    }
    { //depth mask
        Tessellator.Model.prototype.depthMask = function (){
            return this.add(Tessellator.new.apply(Tessellator.DepthMask, arguments));
        }
    
        Tessellator.DepthMask = function (mask){
            this.type = Tessellator.BLEND_FUNC;
            
            this.mask = mask;
        }
        
        Tessellator.DepthMask.prototype.init = function (init){
            init.flush();
        }
        
        Tessellator.DepthMask.prototype.postInit = Tessellator.EMPTY_FUNC;
        
        Tessellator.DepthMask.prototype.apply = function (render){
            render.set("depthMask", this.mask);
        }
    }
}
{ //object
    Tessellator.prototype.createObject = function (){
        return Tessellator.new.apply(Tessellator.Object, [this].concat(arguments));
    }
    
    Tessellator.Object = function (tessellator, type){
        tessellator.resources.push(this);
        
        this.attribs = {};
        this.attribCount = 0;
        
        this.tessellator = tessellator;
        this.type = type;
        
        this.disposed = false;
        this.disposable = true;
        
        this.resetIndices();
    }
    
    Tessellator.Object.prototype.resetIndices = function (type){
        if (this.indices){
            this.indices.buffer.dispose(this.tessellator);
        }
        
        this.indices = {
            name: "indices",
            buffer: new Tessellator.Object.Buffer(new Tessellator.FragmentedArray(), type || Uint16Array, Tessellator.INDEX_DATA, Tessellator.STATIC)
        }
    }
    
    Tessellator.Object.prototype.getValue = function (name){
        var o = this.attribs[name];
        
        if (o){
            return o.buffer.value;
        }
    }
    
    Tessellator.Object.prototype.getIndices = function (){
        return this.indices.buffer.value;
    }
    
    Tessellator.Object.prototype.setType = function (type){
        this.type = type;
    }
    
    Tessellator.Object.prototype.setAttribute = function (){
        if (arguments[2].constructor === Tessellator.Object.Buffer){
            var name = arguments[0];
            
            this.attribCount += this.attribs[name] ? 0 : 1;
        
            if (this.attribCount > this.tessellator.maxAttributes){
                throw "the maximum amount of bound attributes was exceeded: " + this.tessellator.maxAttributes;
            }
            
            if (this.attribs[name]){
                this.attribs[name].buffer.dispose(this.tessellator);
            }
            
            this.attribs[name] = {
                name: name,
                dataSize: arguments[1],
                buffer: arguments[2],
                normalize: arguments[3] || false,
                stride: arguments[4] || arguments[1].value,
                offset: arguments[5] || 0,
            }
        }else{
            var
                name = arguments[0],
                size = arguments[1], 
                value = arguments[2], 
                arrayType = arguments[3], 
                normalize = arguments[4], 
                type = arguments[5], 
                stride = arguments[6], 
                offset = arguments[7];
            
            this.setAttribute(name, size, new Tessellator.Object.Buffer(value, arrayType, Tessellator.BUFFER_DATA, type), normalize, stride, offset);
        }
    }
    
    Tessellator.Object.prototype.setAttributeData = function (name, value, off){
        off = off || 0;
        var attrib = this.attribs[name];
        
        if (!attrib){
            throw "that attribute does not exist!";
        }
        
        attrib.buffer.subData(tessellator, value, off);
    }
    
    Tessellator.Object.prototype.upload = function (){
        if (this.oes){
            this.oes.shader = null;
        }
        
        if (this.indices && !this.indices.buffer.uploaded){
            if (this.indices.buffer.getLength()){
                this.indices.buffer.upload(this.tessellator);
                
                this.items = this.indices.buffer.getLength();
            }else{
                this.indices = null;
                
                for (var o in this.attribs){
                    this.items = this.attribs[o].buffer.getLength() / this.attribs[o].dataSize.value;
                    
                    break;
                }
            }
        }
        
        for (var o in this.attribs){
            this.attribs[o].buffer.upload(this.tessellator);
        }
    }
    
    Tessellator.Object.prototype.bindAttributes = function (shader){
        var gl = this.tessellator.GL;
        
        var bound = null;
        
        for (var o in this.attribs){
            if (shader.attribs[o] !== undefined){
                var oo = this.attribs[o];
                
                if (oo.buffer.uploaded){
                    if (bound !== oo.buffer){
                        bound = oo.buffer;
                        
                        gl.bindBuffer(gl[Tessellator.Object.bufferTypes[oo.buffer.type.name]], bound.value);
                    }
                    
                    gl.enableVertexAttribArray(shader.attribs[o]);
                    gl.vertexAttribPointer(shader.attribs[o], oo.dataSize.value, gl[Tessellator.Object.dataTypes[oo.buffer.dataType.name]], oo.normalize, oo.stride * Tessellator.Object.dataTypeSizes[oo.buffer.dataType.name], oo.offset * Tessellator.Object.dataTypeSizes[oo.buffer.dataType.name]);
                    
                    if (oo.divisor !== undefined && this.instancinginstance){
                        this.instancinginstance.vertexAttribDivisorANGLE(shader.attribs[o], oo.divisor);
                    }
                }
            }
        }
        
        if (this.indices){
            gl.bindBuffer(gl[Tessellator.Object.bufferTypes[this.indices.buffer.type.name]], this.indices.buffer.value);
        }
    }
    
    Tessellator.Object.prototype.disableAttributes = function (shader){
        for (var o in shader.attribs){
            var oo = this.attribs[o];
            
            if (oo){
                this.tessellator.GL.disableVertexAttribArray(shader.attribs[o]);
                
                if (oo.divisor !== undefined && this.instancinginstance){
                    this.instancinginstance.vertexAttribDivisorANGLE(shader.attribs[o], 0);
                }
            }
        }
    }
    
    Tessellator.Object.prototype.useOES = function (){
        if (!this.oesinsance){
            this.oesinsance = this.tessellator.extensions.get("OES_vertex_array_object");
                
            if (this.oesinsance){
                this.oes = {
                    instance: this.oesinsance.createVertexArrayOES()
                }
            }
        }
        
        return this.oesinsance;
    }
    
    Tessellator.Object.prototype.useInstancing = function (){
        if (!this.instancinginstance){
            this.instancinginstance = this.tessellator.extensions.get("ANGLE_instanced_arrays");
        }
        
        var self = this;
        
        return function (name, divisor){
            divisor = divisor === undefined ? 1 : divisor
            
            var o = self.attribs[name];
            
            o.divisor = divisor;
            self.instances = o.buffer.getLength() / o.dataSize.value * divisor;
        }
    }
    
    Tessellator.Object.prototype.render = function (shader){
        if (!this.items){
            return;
        }
        
        if (shader.constructor === Tessellator.RenderMatrix){
            var matrix = shader;
            shader = shader.renderer.shader;
            
            if (!shader.set(matrix.renderer, matrix, this)){
                return;
            }
                
            shader.preUnify(matrix);
            
            if (shader.bind()){
                matrix.unifyAll();
            }else{
                matrix.unify();
            }
        }
        
        if (this.oes){
            this.oesinsance.bindVertexArrayOES(this.oes.instance);
            
            if (this.oes.shader !== shader){
                if (this.oes.shader){
                    this.disableAttributes(this.oes.shader);
                }
                
                this.oes.shader = shader;
                
                this.bindAttributes(shader);
            }
        }else{
            this.bindAttributes(shader);
        }
        
        var gl = this.tessellator.GL;
        
        if (this.instancinginstance && this.instances){
            if (this.indices){
                this.instancinginstance.drawElementsInstancedANGLE(gl[Tessellator.Object.drawTypes[this.type.name]], this.items, gl[Tessellator.Object.dataTypes[this.indices.buffer.dataType.name]], 0, this.instances);
            }else{
                this.instancinginstance.drawArraysInstancedANGLE(gl[Tessellator.Object.drawTypes[this.type.name]], 0, this.items, this.instances);
            }
        }else{
            if (this.indices){
                gl.drawElements(gl[Tessellator.Object.drawTypes[this.type.name]], this.items, gl[Tessellator.Object.dataTypes[this.indices.buffer.dataType.name]], 0);
            }else{
                gl.drawArrays(gl[Tessellator.Object.drawTypes[this.type.name]], 0, this.items);
            }
        }
        
        if (this.oes){
            this.oesinsance.bindVertexArrayOES(null);
        }else{
            this.disableAttributes(shader);
        }
        
        if (matrix){
            shader.postSet(matrix.renderer, matrix, this);
        }
    }
    
    Tessellator.Object.prototype.dispose = function (){
        if (!this.disposed){
            for (var o in this.attribs){
                this.attribs[o].buffer.dispose(this.tessellator);
            }
            
            if (this.indices){
                this.indices.buffer.dispose(this.tessellator);
            }
            
            if (this.oes){
                this.oesinsance.deleteVertexArrayOES(this.oes.instance);
            }
            
            this.tessellator.resources.remove(this);
            this.disposed = true;
        }
    }
    
    Tessellator.Object.Buffer = function (value, dataType, type, readHint){
        this.value = value;
        this.dataType = dataType || Float32Array;
        this.type = type || Tessellator.BUFFER_DATA;
        this.readHint = readHint || Tessellator.STATIC;
        
        this.uploaded = false;
    }
    
    Tessellator.Object.Buffer.prototype.getLength = function (){
        return this.uploaded ? this.length : this.value.length;
    }
    
    Tessellator.Object.Buffer.prototype.subData = function (tessellator, value, off){
        if (off < 0){
            throw "offset is under 0";
        }else if (this.getLength() < value.length){
            throw "attributes can not increase in size: " + this.getLength() + " < " + value.length;
        }
        
        if (!this.uploaded){
            if (off !== 0){
                var c = this.value.combine(this.dataType);
                c.set(value.combine(this.dataType), off);
                
                this.value = new Tessellator.Array(c);
            }
        }else{
            var gl = tessellator.GL;
            
            gl.bindBuffer(gl[Tessellator.Object.bufferTypes[this.type.name]], this.value);
            gl.bufferSubData(gl[Tessellator.Object.bufferTypes[this.type.name]], off * Tessellator.Object.dataTypeSizes[this.dataType.name], value.combine(this.dataType));
        }
    }
    
    Tessellator.Object.Buffer.prototype.upload = function (tessellator){
        var gl = tessellator.GL;
        
        if (!this.uploaded && this.value.length){ 
            var buf = gl.createBuffer();
            gl.bindBuffer(gl[Tessellator.Object.bufferTypes[this.type.name]], buf);
            gl.bufferData(gl[Tessellator.Object.bufferTypes[this.type.name]], this.value.combine(this.dataType), gl[Tessellator.Object.readMethod[this.readHint.name]]);
            
            this.length = this.value.length;
            this.uploaded = true;
            this.value = buf;
        }
    }
    
    Tessellator.Object.Buffer.prototype.dispose = function (tessellator){
        if (this.uploaded && this.value){
            tessellator.GL.deleteBuffer(this.value);
            
            this.value = null;
        }
    }
    
    Tessellator.Object.dataTypes = {
        "Int8Array": "BYTE",
        "Uint8Array": "UNSIGNED_BYTE",
        "Int16Array": "SHORT",
        "Uint16Array": "UNSIGNED_SHORT",
        "Int32Array": "INT",
        "Uint32Array": "UNSIGNED_INT",
        "Int64Array": "LONG",
        "Uint64Array": "UNSIGNED_LONG",
        "Float32Array": "FLOAT",
        "Float64Array": "DOUBLE",
    };
    
    Tessellator.Object.dataTypeSizes = {
        "Int8Array": 1,
        "Uint8Array": 1,
        "Int16Array": 2,
        "Uint16Array": 2,
        "Int32Array": 4,
        "Uint32Array": 4,
        "Int64Array": 8,
        "Uint64Array": 8,
        "Float32Array": 4,
        "Float64Array": 8,
    };
    
    Tessellator.Object.bufferTypes = {
        "indexData": "ELEMENT_ARRAY_BUFFER",
        "bufferData": "ARRAY_BUFFER",
    };
    
    Tessellator.Object.readMethod = {
        "static": "STATIC_DRAW",
        "dynamic": "DYNAMIC_DRAW",
        "stream": "STATIC_DRAW",
    };
    
    Tessellator.Object.drawTypes = {
        "triangle": "TRIANGLES",
        "line": "LINES",
        "point": "POINTS",
        "lineStrip": "LINE_STRIP",
        "lineLoop": "LINE_LOOP",
    };
}
{ //textures
    { //texture
        Tessellator.Texture = function (tessellator){
            tessellator.resources.push(this);
            
            this.tessellator = tessellator;
            this.listeners = [];
            this.disposable = false;
            this.disposed = false;
            this.autoUpdate = false;
            this.loaded = false;
            
            this.width = 0;
            this.height = 0;
        }
        
        Tessellator.Texture.prototype.getAspect = function (){
            if (this.width < 0 || this.height < 0){
                return undefined;
            }
            
            return this.width / this.height;
        }
        
        Tessellator.Texture.prototype.listener = function (){
            for (var i = 0; i < this.listeners.length; i++){
                this.listeners[i](this);
            }
            
            this.listeners = null;
        }
        
        Tessellator.Texture.prototype.addListener = function (func){
            if (!this.loaded){
                this.listeners.push(func);
            }else{
                func(this);
            }
        }
        
        Tessellator.Texture.prototype.isLoaded = function (){
            return this.loaded;
        }
        
        Tessellator.Texture.prototype.setDisposable = function (disposable){
            this.disposable = disposable;
            
            return this;
        }
        
        Tessellator.Texture.prototype.update = function (){
            
        }
        
        Tessellator.Texture.prototype.dispose = function (){
            if (this.texture){
                if (this.tessellator.boundTexture === this.texture){
                    this.tessellator.boundTexture = null;
                    this.tessellator.GL.bindTexture(this.tessellator.GL.TEXTURE_2D, null);
                }
                
                this.tessellator.GL.deleteTexture(this.texture);
                
                this.tessellator.resources.remove(this);
                this.disposed = true;
                this.texture = null;
            }
        }
        
        Tessellator.Texture.prototype.bind = function (render){
            var bind;
            
            if (this.loaded){
                bind = this.texture;
            }else{
                bind = null;
            }
            
            this.tessellator.GL.bindTexture(this.tessellator.GL.TEXTURE_2D, bind);
        }
    }
    { //texture image
        Tessellator.prototype.loadTexture = function (src, filter){
            return new Tessellator.TextureImage(this, src, filter);
        }
        
        Tessellator.prototype.createTexture = Tessellator.prototype.loadTexture;
        
        Tessellator.prototype.getTexture = function (src){
            var texture;
            
            if (this.textureCache[src]){
                texture = this.textureCache[src];
            }else{
                texture = this.createTexture(src);
                
                this.textureCache[src] = texture;
            }
            
            return texture;
        }
        
        Tessellator.TextureImage = function (tessellator, src, filter){
            this.super (tessellator);
            this.texture = this.tessellator.GL.createTexture();
            
            if (src){
                if (src.constructor === String){
                    var self = this;
                    
                    Tessellator.TextureImage.loadImage(src, function (image){
                        self.image = image;
                        
                        self.loaded = true;
                        self.width = self.image.width;
                        self.height = self.image.height;
                        
                        self.update();
                        
                        if (!self.filter){
                            self.filter = Tessellator.getAppropriateTextureFilter(self.width, self.height);
                        }
                        
                        self.filter(self.tessellator, self.texture, self.image, self);
                        
                        if (self.listener){
                            self.listener(self);
                        }
                        
                        if (self.tessellator.onTextureLoaded){
                            self.tessellator.onTextureLoaded(self);
                        }
                    });
                }else if (src.tagName && src.tagName.toLowerCase() == "img"){
                    if (src.loaded){
                        this.loaded = true;
                        this.image = src;
                        this.width = this.image.width;
                        this.height = this.image.height;
                        
                        this.update();
                        
                        if (!this.filter){
                            this.filter = Tessellator.getAppropriateTextureFilter(this.image.width, this.image.height);
                        }
                        
                        this.filter(this.tessellator, this.texture, this.image, this);
                        
                        if (self.listener){
                            self.listener(self);
                        }
                        
                        if (self.tessellator.onTextureLoaded){
                            self.tessellator.onTextureLoaded(this);
                        }
                    }else{
                        this.image = src;
                        var self = this;
                        
                        this.image.listeners.push(function (){
                            self.loaded = true;
                            self.width = self.image.width;
                            self.height = self.image.height;
                            
                            self.update();
                            
                            if (!self.filter){
                                self.filter = Tessellator.getAppropriateTextureFilter(self.width, self.height);
                            }
                            
                            self.filter(self.tessellator, self.texture, self.image, self);
                            
                            if (self.listener){
                                self.listener(self);
                            }
                            
                            if (self.tessellator.onTextureLoaded){
                                self.tessellator.onTextureLoaded(self);
                            }
                        });
                    }
                }else{
                    this.image = src;
                    this.loaded = true;
                    this.width = this.image.width;
                    this.height = this.image.height;
                    
                    this.update();
                    
                    if (!this.filter){
                        this.filter = Tessellator.getAppropriateTextureFilter(this.width, this.height);
                    }
                    
                    this.filter(this.tessellator, this.texture, this.image, this);
                    
                    if (this.listener){
                        this.listener(this);
                    }
                    
                    if (this.tessellator.onTextureLoaded){
                        this.tessellator.onTextureLoaded(this);
                    }
                }
            }
        }
        
        Tessellator.copyProto(Tessellator.TextureImage, Tessellator.Texture);
        
        Tessellator.TextureImage.prototype.update = function (){
            var gl = this.tessellator.GL;
            
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        }
        
        Tessellator.TextureImage.imageCache = {};
        Tessellator.TextureImage.lengthLoaded = 0;
        
        Tessellator.TextureImage.loadImage = function (src, onLoad){
            var image;
            
            if (Tessellator.TextureImage.imageCache[src]){
                image = Tessellator.TextureImage.imageCache[src];
                
                if (onLoad){
                    if (!image.loaded){
                        image.listeners.push(onLoad);
                    }else{
                        onLoad(image);
                    }
                }
            }else{
                image = document.createElement("img");
                image.loaded = false;
                
                if (onLoad){
                    image.listeners = [
                        onLoad
                    ];
                }else{
                    image.listeners = [];
                }
                
                image.onload = function (){
                    this.loaded = true;
                    Tessellator.TextureImage.lengthLoaded++;
                    
                    for (var i = 0, k = this.listeners.length; i < k; i++){
                        this.listeners[i](this);
                    }
                    
                    delete this.listeners;
                }
                
                image.crossOrigin='';
                image.src = src;
                
                Tessellator.TextureImage.imageCache[src] = image;
            }
            
            return image;
        }
    }
    { //texture queue
        Tessellator.prototype.createTextureQueue = function (){
            return Tessellator.new.apply(Tessellator.TextureQueue, arguments);
        }
        
        Tessellator.TextureQueue = function (){
            this.textures = Array.prototype.slice.call(arguments);
            
            this.textureIndex = 0;
            this.texture = this.textures[this.textureIndex];
            
            this.loaded = true;
            this.autoUpdate = false;
        }
        
        Tessellator.TextureQueue.prototype.frame = function (frame){
            this.textureIndex = frame;
            this.texture = this.textures[frame];
            
            this.autoUpdate = this.texture.autoUpdate;
            this.loaded = this.texture.loaded;
            
            if (!this.texture.loaded){
                var self = this;
                
                this.texture.addListener(function (){
                    self.listener();
                });
                
                this.addListener(function (){
                    if (self.textureIndex === frame){
                        self.loaded = true;
                    }
                })
            }
        }
        
        Tessellator.TextureQueue.prototype.nextTexture = function (){
            if (this.textureIndex = this.textures.length - 1){
                this.textureIndex = 0;
                this.texture = this.textures[0];
            }else{
                this.texture = this.textures[++this.textureIndex];
            }
        }
        
        Tessellator.TextureQueue.prototype.play = function (frequency){
            var self = this;
            
            this.interval = window.setInterval(function (){
                self.nextTexture();
            }, frequency);
        }
        
        Tessellator.TextureQueue.prototype.stop = function (){
            if (this.interval){
                window.clearInterval(this.interval);
                
                delete this.interval;
            }
        }
        
        Tessellator.TextureQueue.prototype.update = function (render){
            this.texture.update(render);
        }
        
        Tessellator.TextureQueue.prototype.bind = function (render){
            this.texture.bind(render);
        }
        
        Tessellator.TextureQueue.prototype.dispose = function (){
            this.stop();
            
            for (var i = 0, k = this.textures.length; i < k; i++){
                this.textures[i].dispose();
            }
            
            this.tessellator.resources.remove(this);
        }
    }
    { //texture video
        Tessellator.prototype.createVideoTexture = function (src, filter, autoPlay){
            return new Tessellator.TextureVideo(this, src, filter, autoPlay);
        }
        
        Tessellator.prototype.loadVideoTexture = Tessellator.prototype.createVideoTexture;
        
        Tessellator.TextureVideo = function (tessellator, src, filter, autoPlay){
            this.super(tessellator);
            
            this.texture = this.tessellator.GL.createTexture();
            this.location = src;
            
            this.filter = filter;
            this.index = 0;
            this.timeUpdate = null;
            this.autoPlay = autoPlay === undefined ? true : autoPlay;
            this.paused = null;
            this.checkDraw = true;
            this.volumeLevel = null;
            this.autoUpdate = true;
            
            if (src.constructor === String){
                var self = this;
                
                this.video = document.createElement("video");
                
                this.video.src = src;
                this.video.setAttribute("crossorigin", "anonymous");
                this.video.load();
                
                this.video.addEventListener("canplay", function (){
                    self.loaded = true;
                    self.width = self.video.videoWidth;
                    self.height = self.video.videoHeight;
                    
                    self.update();
                    
                    if (!self.filter){
                        self.filter = Tessellator.getAppropriateTextureFilter(self.width, self.height);
                    }
                    
                    self.filter(self.tessellator, self.texture, self.video, self);
                    
                    if (self.listener){
                        self.listener(self);
                    }
                    
                    if (self.tessellator.onTextureLoaded){
                        self.tessellator.onTextureLoaded(self);
                    }
                    
                    if (self.autoPlay){
                        self.looping(true);
                        
                        if (!self.volumeLevel){
                            self.mute();
                        }
                        
                        if (self.paused === null){
                            self.play();
                        }
                    }
                });
            }else if (src && src.tagName.toLowerCase() == "video"){
                this.video = src;
                
                this.video.addEventListener("canplay", function (){
                    self.loaded = true;
                    self.width = self.video.videoWidth;
                    self.height = self.video.videoHeight;
                    
                    self.update();
                    
                    if (!self.filter){
                        self.filter = Tessellator.getAppropriateTextureFilter(self.width, self.height);
                    }
                    
                    self.filter(self.tessellator, self.texture, self.video, self);
                    
                    if (self.listener){
                        self.listener(self);
                    }
                    
                    if (self.tessellator.onTextureLoaded){
                        self.tessellator.onTextureLoaded(self);
                    }
                    
                    if (self.autoPlay){
                        self.looping(true);
                        
                        if (!self.volumeLevel){
                            self.mute();
                        }
                        
                        if (self.paused === null){
                            self.play();
                        }
                    }
                });
            }else if (src && src.tagName.toLowerCase() == "canvas"){
                this.video = src;
                this.loaded = true;
                this.checkDraw = false;
                this.width = this.video.width;
                this.height = this.video.height;
                
                this.update();
                
                if (!this.filter){
                    this.filter = Tessellator.getAppropriateTextureFilter(this.width, this.height);
                }
                
                this.filter(this.tessellator, this.texture, this.image, this);
                
                if (this.listener){
                    this.listener(this);
                }
                
                if (this.tessellator.onTextureLoaded){
                    this.tessellator.onTextureLoaded(this);
                }
            }else if (src){
                this.video = src;
                this.loaded = true;
                this.checkDraw = false;
                this.width = this.video.videoWidth;
                this.height = this.video.videoHeight;
                
                this.update();
                
                if (!this.filter){
                    this.filter = Tessellator.getAppropriateTextureFilter(this.width, this.height);
                }
                
                this.filter(this.tessellator, this.texture, this.image, this);
                
                if (this.listener){
                    this.listener(this);
                }
                
                if (this.tessellator.onTextureLoaded){
                    this.tessellator.onTextureLoaded(this);
                }
            }
        }
        
        Tessellator.copyProto(Tessellator.TextureVideo, Tessellator.Texture);
        
        Tessellator.TextureVideo.prototype.play = function (){
            this.paused = false;
            
            if (this.loaded){
                this.video.play();
            }
        }
        
        Tessellator.TextureVideo.prototype.pause = function (){
            this.paused = true;
            
            if (this.loaded){
                this.video.pause();
            }
        }
        
        Tessellator.TextureVideo.prototype.toogle = function (){
            if (this.paused){
                this.play();
            }else{
                this.pause();
            }
        }
        
        Tessellator.TextureVideo.prototype.loop = function (){
            return this.video.loop;
        }
        
        Tessellator.TextureVideo.prototype.looping = function (loop){
            this.video.loop = loop;
        }
        
        Tessellator.TextureVideo.prototype.mute = function (){
            this.video.volume = 0;
        }
        
        Tessellator.TextureVideo.prototype.volume = function (level){
            this.volumeLevel = level;
            this.unmute();
        }
        
        Tessellator.TextureVideo.prototype.unmute = function (){
            if (!this.volumeLevel){
                this.volumeLevel = 1;
            }
            
            this.video.volume = this.volumeLevel;
        }
        
        Tessellator.TextureVideo.prototype.update = function (){
            if (!this.checkDraw || (this.loaded && this.timeUpdate != this.video.currentTime)){
                var gl = this.tessellator.GL;
                
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
                
                this.timeUpdate = this.video.currentTime;
            }
        }
    }
    { //texture model
        Tessellator.prototype.frameBuffer = {
            bindFramebuffer: function (last){
                last.tessellator.GL.bindFramebuffer(last.tessellator.GL.FRAMEBUFFER, null);
                last.tessellator.frameBuffer = Tessellator.prototype.frameBuffer;
                
                if (last.buffers){
                    //last.buffers.ext.drawBuffersWEBGL([]);
                }
            }
        };
        
        Tessellator.TextureModel = function (tessellator, width, height, attachments){
            this.super (tessellator);
            this.width = width;
            this.height = height;
            
            this.disposable = true;
            this.autoUpdate = true;
            this.loaded = true;
            
            this.attachments = attachments;
            
            if (!this.attachments || this.attachments.constructor !== Array){
                this.attachments = [
                    new Tessellator.TextureModel.AttachmentColor(this.attachments),
                    new Tessellator.TextureModel.AttachmentDepth()
                ];
            }
            
            this.configure();
        }
        
        Tessellator.copyProto(Tessellator.TextureModel, Tessellator.Texture);
        
        Tessellator.TextureModel.prototype.configure = function (){
            this.disposeShallow();
            this.frameBuffer = this.tessellator.GL.createFramebuffer();
            
            var lastFrameBuffer = this.tessellator.frameBuffer;
            this.bindFramebuffer();
            
            if (this.tessellator.extensions.get("WEBGL_draw_buffers")){
                this.buffers = [];
                this.buffers.ext = this.tessellator.extensions.get("WEBGL_draw_buffers");
            }
            
            for (var i = 0, k = this.attachments.length; i < k; i++){
                this.attachments[i].configure(this);
            }
            
            lastFrameBuffer.bindFramebuffer(this);
        }
        
        Tessellator.TextureModel.prototype.update = function (render){
            if (render){
                render.renderer.disableRenderer(render);
                
                this.render(this.renderer || render.renderer, render);
                
                render.renderer.enableRenderer(render);
            }else{
                this.render(this.renderer);
            }
        }
        
        Tessellator.TextureModel.prototype.render = function (){
            var renderer, render;
            
            if (arguments.length === 1){
                render = arguments[0];
            }else if (arguments.length === 2){
                renderer = arguments[0];
                render = arguments[1];
            }else if (arguments.length !== 0){
                throw "invalid arguments!";
            }
            
            var lastFrameBuffer = this.tessellator.frameBuffer;
            this.bindFramebuffer();
            
            var override = false;
            
            for (var i = 0, k = this.attachments.length; i < k; i++){
                if (this.attachments[i].render(this, renderer, render)){
                    override = true;
                }
            }
            
            if (!override){
                var matrix = new Tessellator.RenderMatrix(renderer);
                matrix.set("window", Tessellator.vec2(this.width, this.height));
                renderer.render(matrix);
            }
            
            lastFrameBuffer.bindFramebuffer(this);
        }
        
        Tessellator.TextureModel.prototype.bindFramebuffer = function (last){
            this.tessellator.GL.bindFramebuffer(this.tessellator.GL.FRAMEBUFFER, this.frameBuffer);
            this.tessellator.frameBuffer = this;
            
            if (this.buffers){
                this.buffers.ext.drawBuffersWEBGL(this.buffers);
            }
        }
        
        Tessellator.TextureModel.prototype.disposeShallow = function (){
            if (this.frameBuffer){
                this.tessellator.GL.deleteFramebuffer(this.frameBuffer);
                
                this.tessellator.resources.remove(this);
                this.frameBuffer = null;
            }
        }
        
        Tessellator.TextureModel.prototype.dispose = function (){
            if (this.frameBuffer){
                this.disposeShallow();
                
                for (var i = 0, k = this.attachments.length; i < k; i++){
                    this.attachments[i].dispose(this);
                }
            }
        }
        
        Tessellator.TextureModel.prototype.setSize = function (width, height){
            if (this.width !== width || this.height !== height){
                this.width = width;
                this.height = height;
                
                this.configure();
            }
        }
        
        Tessellator.TextureModel.prototype.bind = function (render){
            for (var i = 0, k = this.attachments.length; i < k; i++){
                this.attachments[i].bind(this, render);
            }
        }
        
        Tessellator.TextureModel.prototype.getAttachment = function (c) {
            for (var i = 0, k = this.attachments.length; i < k; i++){
                if (this.attachments[i].constructor === c){
                    return this.attachments[i];
                }
            }
            
            return null;
        }
        
        { //attachments
            { //depth attachment
                Tessellator.TextureModel.AttachmentDepth = function (){}
                
                Tessellator.TextureModel.AttachmentDepth.prototype.configure = function (texture){
                    var gl = texture.tessellator.GL;
                    
                    if (!this.buffers || this.width !== texture.width || this.height != texture.height){
                        this.dispose(texture);
                        
                        this.buffer = gl.createRenderbuffer();
                        this.width = texture.width;
                        this.height = texture.height;
                        this.tessellator = texture.tessellator;
                        
                        gl.bindRenderbuffer(gl.RENDERBUFFER, this.buffer);
                        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
                        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
                    }
                    
                    
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.buffer);
                }
                
                Tessellator.TextureModel.AttachmentDepth.prototype.bind = Tessellator.EMPTY_FUNC;
                Tessellator.TextureModel.AttachmentDepth.prototype.render = Tessellator.EMPTY_FUNC;
                
                Tessellator.TextureModel.AttachmentDepth.prototype.dispose = function (){
                    if (this.buffer){
                        this.tessellator.GL.deleteRenderbuffer(this.buffer);
                        
                        this.buffer = null;
                    }
                }
            }
            { //color attachment
                Tessellator.TextureModel.AttachmentColor = function (filter, index, quality, channels){
                    this.filter = filter;
                    this.index = index || 0;
                    this.quality = quality;
                    this.channels = channels || Tessellator.RGBA;
                }
                
                Tessellator.copyProto(Tessellator.TextureModel.AttachmentColor, Tessellator.Texture);
                
                Tessellator.TextureModel.AttachmentColor.prototype.configure = function (texture){
                    if (this.tessellator && this.tessellator !== texture.tessellator){
                        throw "cannot mix resources between multiple contexts";
                    }
                    
                    if (!this.tessellator){
                        this.super(texture.tessellator);
                    }
                    
                    this.loaded = true;
                    
                    var gl = texture.tessellator.GL;
                    
                    if (!this.filter){
                        this.filter = Tessellator.getAppropriateTextureFilter(texture.width, texture.height);
                    }
                    
                    if (!this.texture || texture.width !== this.width || texture.height !== this.height){
                        this.dispose();
                        
                        this.texture = gl.createTexture();
                        this.width = texture.width;
                        this.height = texture.height;
                        
                        if (!this.quality){
                            this.quality = gl.UNSIGNED_BYTE;
                        }else if (this.quality === Tessellator.FLOAT){
                            this.quality = gl.FLOAT;
                            this.tessellator.extensions.get("OES_texture_float");
                        }
                        
                        gl.bindTexture(gl.TEXTURE_2D, this.texture);
                        gl.texImage2D(gl.TEXTURE_2D, 0, this.channels, this.width, this.height, 0, this.channels, this.quality, null);
                        this.filter(texture.tessellator, this.texture, texture.frameBuffer, texture);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    }
                    
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + this.index, gl.TEXTURE_2D, this.texture, 0);
                    
                    if (texture.buffers){
                        texture.buffers.push(gl.COLOR_ATTACHMENT0 + this.index);
                    }
                }
                
                Tessellator.TextureModel.AttachmentColor.prototype.render = Tessellator.EMPTY_FUNC;
            }
            { //model attachment
                Tessellator.TextureModel.AttachmentModel = function (model, renderer){
                    this.model = model;
                    this.renderer = renderer;
                }
                
                Tessellator.TextureModel.AttachmentModel.prototype.configure = Tessellator.EMPTY_FUNC;
                
                Tessellator.TextureModel.AttachmentModel.prototype.bind = Tessellator.EMPTY_FUNC;
                
                Tessellator.TextureModel.AttachmentModel.prototype.render = function (texture, renderer, render){
                    if (this.model){
                        var renderer = this.renderer ? this.renderer : renderer;
                        
                        var matrix = new Tessellator.RenderMatrix(renderer);
                        
                        matrix.set("window", Tessellator.vec2(texture.width, texture.height));
                        renderer.render(matrix, this.model);
                        
                        if (render){
                            render.dirty();
                        }
                    }
                    
                    return true;
                }
                
                Tessellator.TextureModel.AttachmentModel.setModel = function (model){
                    this.model = model;
                }
                
                Tessellator.TextureModel.AttachmentModel.prototype.dispose = function (){
                    if (this.model && this.model.disposable){
                        this.model.dispose();
                        
                        this.model = null;
                    }
                }
            }
            { //renderer attachment
                Tessellator.TextureModel.AttachmentRenderer = function (renderer, arg){
                    this.renderer = renderer;
                    this.arg = arg;
                }
                
                Tessellator.TextureModel.AttachmentRenderer.prototype.configure = Tessellator.EMPTY_FUNC;
                
                Tessellator.TextureModel.AttachmentRenderer.prototype.bind = Tessellator.EMPTY_FUNC;
                
                Tessellator.TextureModel.AttachmentRenderer.prototype.render = function (texture, renderer, render){
                    var matrix = new Tessellator.RenderMatrix(this.renderer);
                    
                    matrix.set("window", Tessellator.vec2(texture.width, texture.height));
                    
                    this.renderer.render(matrix, this.arg);
                    
                    if (render){
                        render.dirty();
                    }
                    
                    return true;
                }
                
                Tessellator.TextureModel.AttachmentRenderer.prototype.dispose = function (){}
            }
        }
    }
    { //texture filters
        Tessellator.TEXTURE_FILTER_NEAREST = function (tessellator, texture, image){
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_MAG_FILTER, tessellator.GL.NEAREST);
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_MIN_FILTER, tessellator.GL.NEAREST);
        }
        
        Tessellator.TEXTURE_FILTER_LINEAR = function (tessellator, texture, image){
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_MAG_FILTER, tessellator.GL.LINEAR);
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_MIN_FILTER, tessellator.GL.LINEAR);
        }
        
        Tessellator.TEXTURE_FILTER_MIPMAP_NEAREST = function (tessellator, texture, image){
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_MAG_FILTER, tessellator.GL.NEAREST);
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_MIN_FILTER, tessellator.GL.LINEAR_MIPMAP_NEAREST);
            tessellator.GL.generateMipmap(tessellator.GL.TEXTURE_2D);
        }
        
        Tessellator.TEXTURE_FILTER_MIPMAP_LINEAR = function (tessellator, texture, image){
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_MAG_FILTER, tessellator.GL.LINEAR);
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_MIN_FILTER, tessellator.GL.LINEAR_MIPMAP_NEAREST);
            tessellator.GL.generateMipmap(tessellator.GL.TEXTURE_2D);
        }
        
        Tessellator.TEXTURE_FILTER_LINEAR_CLAMP = function (tessellator, texture, image){
            Tessellator.TEXTURE_FILTER_LINEAR(tessellator, texture, image);
            
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_WRAP_S, tessellator.GL.CLAMP_TO_EDGE);
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_WRAP_T, tessellator.GL.CLAMP_TO_EDGE);
        }
        
        Tessellator.TEXTURE_FILTER_NEAREST_CLAMP = function (tessellator, texture, image){
            Tessellator.TEXTURE_FILTER_NEAREST(tessellator, texture, image);
            
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_WRAP_S, tessellator.GL.CLAMP_TO_EDGE);
            tessellator.GL.texParameteri(tessellator.GL.TEXTURE_2D, tessellator.GL.TEXTURE_WRAP_T, tessellator.GL.CLAMP_TO_EDGE);
        }
        
        Tessellator.DEFAULT_TEXTURE_FILTER = Tessellator.TEXTURE_FILTER_NEAREST;
        Tessellator.DEFAULT_CLAMP_TEXTURE_FILTER = Tessellator.TEXTURE_FILTER_NEAREST_CLAMP;
        
        Tessellator.getAppropriateTextureFilter = function (width, height){
            if (width && height && (width & (width - 1)) === 0 && (height & (height - 1)) === 0){
                return Tessellator.DEFAULT_TEXTURE_FILTER;
            }else{
                return Tessellator.DEFAULT_CLAMP_TEXTURE_FILTER;
            }
        }
    }
    { //texture atlas
        Tessellator.prototype.createTextureAtlas = function (){
            return Tessellator.new.apply(Tessellator.TextureAtlas, [this].concat(Array.prototype.slice.call(arguments)));
        }
        
        Tessellator.TextureAtlas = function (tessellator, width, height){
            if (!tessellator.textureAtlasRenderer){
                tessellator.textureAtlasRenderer = new Tessellator.AtlasRenderer(tessellator);
            }
            
            if (arguments.length === 4){
                this.atlas = arguments[3];
                
                this.updateAtlas();
            }else if (arguments.length === 5){
                if (isNaN(arguments[3])){
                    this.atlas = arguments[3];
                    this.filter = arguments[4];
                    
                    this.updateAtlas();
                }else{
                    var
                        segX = arguments[3],
                        segY = arguments[4];
                    
                    this.atlas = new Array(segX);
                    for (var i = 0; i < segX; i++){
                        this.atlas[i] = new Array(segY);
                    }
                }
            }else if (arguments.length === 6){
                var
                    segX = arguments[3],
                    segY = arguments[4];
                
                this.filter = arguments[5];
                
                this.atlas = new Array(segX);
                for (var i = 0; i < segX; i++){
                    this.atlas[i] = new Array(segY);
                }
            }else{
                throw "invalid arguments";
            }
            
            this.super(tessellator, width, height, [
                new Tessellator.TextureModel.AttachmentColor(this.filter),
                new Tessellator.TextureModel.AttachmentRenderer(tessellator.textureAtlasRenderer, this),
            ]);
            
            this.autoUpdate = false;
            this.disposable = false;
            this.updateRequested = false;
            this.updateCache = [];
        }
        
        Tessellator.copyProto(Tessellator.TextureAtlas, Tessellator.TextureModel);
        
        Tessellator.TextureAtlas.prototype.updateAtlas = function (textures){
            if (textures){
                var self = this;
                
                if (!textures.updating){
                    textures.updating = true;
                    
                    var func = function (){
                        for (var i = 0; i < textures.length; i++){
                            if (!textures[i].texture.loaded){
                                textures[i].texture.addListener(func);
                                
                                return;
                            }
                        }
                        
                        if (!self.autoUpdate){
                            self.autoUpdate = true;
                            self.updateRequested = true;
                        }
                        
                        self.updateCache.push(textures);
                    }
                    
                    func();
                }
            }else{
                this.autoUpdate = false;
                
                for (var x = 0, xk = this.atlas.length; x < xk; x++){
                    for (var y = 0, yk = this.atlas[x].length; y < yk; y++){
                        if (this.atlas[x][y]) this.updateAtlas(this.atlas[x][y]);
                    }
                }
            }
        }
        
        Tessellator.TextureAtlas.prototype.update = function (render){
            this.autoUpdate = false;
            
            for (var i = 0, k = this.updateCache.length; i < k; i++){
                var textures = this.updateCache[i];
                
                textures.remove = true;
                
                for (var ii = 0; ii < textures.length; ii++){
                    var texture = textures[ii];
                    
                    if (texture.texture.autoUpdate){
                        texture.texture.update(render);
                        
                        textures.remove = false;
                        this.autoUpdate = true;
                    }
                }
            }
            
            this.render(render);
        }
        
        Tessellator.TextureAtlas.prototype.set = function (x, y, texture){
            this.atlas[x][y] = [{
                texture: texture
            }];
            
            this.atlas[x][y].pos = Tessellator.vec2(x, y);
            
            this.updateAtlas(this.atlas[x][y]);
        }
        
        Tessellator.TextureAtlas.prototype.get = function (x, y, i){
            return this.atlas[x][y][i || 0].texture;
        }
        
        Tessellator.TextureAtlas.prototype.add = function (x, y, texture){
            if (!this.atlas[x][y]){
                this.set.apply(this, arguments);
            }else{
                this.atlas[x][y].push({
                    texture: texture
                });
                
                this.updateAtlas(this.atlas[x][y]);
            }
        }
        
        Tessellator.TextureAtlas.prototype.mask = function (x, y, mask, i){
            this.atlas[x][y][i || 0].mask = mask;
            
            this.updateAtlas(this.atlas[x][y]);
        }
    }
    { //texture atlas animation
        Tessellator.prototype.createTextureAtlasAnimation = function (){
            return Tessellator.new.apply(Tessellator.TextureAtlasAnimation, [this].concat(Array.prototype.slice.call(arguments)));
        }
        
        Tessellator.TextureAtlasAnimation = function (tessellator, src, animationRate, animation){
            if (!src){
                throw "no source!";
            }
            
            this.tessellator = tessellator;
            
            this.src = src;
            this.animationRate = animationRate || 1;
            this.animation = animation;
            this.time = 0;
            this.size = 1;
            
            this.autoUpdate = true;
            this.loaded = false;
            
            if (src.loaded){
                this.loaded = true;
                
                this.size = Math.min(src.width, src.height);
                
                if (src.width % this.size !== 0 || src.height & this.size !== 0){
                    throw "texture not uniform size";
                }
                
                this.frames = Math.max(src.width / this.size, src.height / this.size);
                
                if (this.listener){
                    this.listener(this);
                }
            }else{
                var self = this;
                
                src.addListener(function (){
                    self.loaded = true;
                    
                    self.size = Math.min(src.width, src.height);
                    
                    if (src.width % self.size !== 0 || src.height & self.size !== 0){
                        throw "texture not uniform size";
                    }
                    
                    self.frames = Math.max(src.width / self.size, src.height / self.size);
                    
                    self.setSize(self.size, self.size);
                    
                    if (self.listener){
                        self.listener(self);
                    }
                });
            }
            
            if (!this.tessellator.shaderTextureAtlasAnimation){
                this.tessellator.shaderTextureAtlasAnimation = new Tessellator.AtlasAnimationRenderer(Tessellator.ATLAS_SHADER_ANIMATION.create(this.tessellator));
            }
            
            this.super(tessellator, this.size, this.size, [
                new Tessellator.TextureModel.AttachmentColor(),
                new Tessellator.TextureModel.AttachmentRenderer(this.tessellator.shaderTextureAtlasAnimation, this)
            ]);
        }
        
        Tessellator.copyProto(Tessellator.TextureAtlasAnimation, Tessellator.TextureModel);
        
        Tessellator.TextureAtlasAnimation.prototype.update = function (render){
            if (this.frames){
                var frame;
                
                if (this.animation){
                    frame = this.animation[Math.floor(this.time / this.animationRate) % this.animation.length];
                }else{
                    frame = Math.floor(this.time / this.animationRate) % this.frames;
                }
                
                if (frame !== this.frame){
                    this.frame = frame;
                    
                    this.render();
                }
                
                this.time++;
            }
        }
    }
    { //texture drawable
        Tessellator.prototype.createTextureDrawable = function (width, height, fliter){
            return new Tessellator.TextureDrawable(this, width, height, fliter)
        }
        
        Tessellator.TextureDrawable = function (tessellator, width, height, filter){
            this.super(tessellator);
            
            this.width = width;
            this.height = height;
            this.fliter = filter;
            this.loaded = true;
            this.autoUpdate = false;
            this.color = [1, 1, 1];
            
            if (!this.filter){
                this.filter = Tessellator.getAppropriateTextureFilter(this.width, this.height);
            }
            
            this.data = new Uint8Array(this.width * this.height * 3);
            this.texture = this.tessellator.GL.createTexture();
            
            this.update();
            this.filter(this.tessellator, this.texture, null, this);
        }
        
        Tessellator.copyProto(Tessellator.TextureDrawable, Tessellator.Texture);
        
        Tessellator.TextureDrawable.prototype.update = function (){
            var gl = this.tessellator.GL;
            
            gl.bindTexture (gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, this.data);
            
            this.autoUpdate = false;
        }
        
        Tessellator.TextureDrawable.prototype.draw = function (arr, x, y, w, h){
            for (var yy = 0; yy < h; yy++){
                this.data.set(arr.subarray((h - yy - 1) * w * 3, (h - yy) * w * 3), ((this.height - (yy + y) - 1) * this.width + x) * 3);
            }
            
            this.requestUpdate();
        }
        
        Tessellator.TextureDrawable.prototype.requestUpdate = function (){
            this.autoUpdate = true;
        }
        
        Tessellator.TextureDrawable.prototype.setColor = function (r, g, b){
            this.color = [(r * 255) | 0, (g * 255) | 0, (b * 255) | 0];
        }
        
        Tessellator.TextureDrawable.prototype.setPixel = function (x, y){
            if (x >= 0 && y >= 0 && x < this.width && y < this.height){
                this.data.set(this.color, ((this.height - y - 1) * this.width + x) * 3);
                
                this.requestUpdate();
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
    }
    { //texture solid
        Tessellator.prototype.createTextureSolid = function (){
            return new Tessellator.TextureSolid(this, Tessellator.getColor(arguments))
        }
        
        Tessellator.TextureSolid = function (tessellator, color){
            this.super(tessellator);
            
            this.width = 1;
            this.height = 1;
            this.loaded = true;
            
            this.texture = this.tessellator.GL.createTexture();
            this.data = new Uint8Array(4);
            
            for (var i = 0; i < this.data.length; i++){
                this.data[i] = (color[i] * 255) | 0;
            }
            
            var gl = this.tessellator.GL;
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            Tessellator.TEXTURE_FILTER_NEAREST(this.tessellator, this.texture, null, this);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
        }
        
        Tessellator.copyProto(Tessellator.TextureSolid, Tessellator.Texture);
        
        Tessellator.TextureSolid.prototype.dispose = function (){
            if (this.texture){
                this.tessellator.GL.deleteTexture(this.texture);
                
                this.texture = null;
            }
        }
        
        Tessellator.TextureSolid.prototype.bind = function (){
            if (this.texture){
                this.tessellator.GL.bindTexture(this.tessellator.GL.TEXTURE_2D, this.texture);
            }
        }
    }
}
{ //static constants
    Tessellator.Constant = function (name, value){
        this.name = name;
        this.value = value;
    }
    
    Tessellator.Constant.prototype.toString = function () {
        return this.name;
    }
    
    Tessellator.COLOR = new Tessellator.Constant("color");
    Tessellator.VERTEX = new Tessellator.Constant("vertex");
    Tessellator.TRANSLATE = new Tessellator.Constant("translate");
    Tessellator.ROTATE = new Tessellator.Constant("rotate");
    Tessellator.SCALE = new Tessellator.Constant("scale");
    Tessellator.START = new Tessellator.Constant("start");
    Tessellator.END = new Tessellator.Constant("end");
    Tessellator.MODEL = new Tessellator.Constant("model");
    Tessellator.MODEL_FRAGMENT = new Tessellator.Constant("modelFragment");
    Tessellator.TEXTURE = new Tessellator.Constant("texture");
    Tessellator.TEXTURE_SCALE = new Tessellator.Constant("textureScale");
    Tessellator.NORMAL = new Tessellator.Constant("normal");
    Tessellator.TEXT = new Tessellator.Constant("text");
    Tessellator.ENABLE = new Tessellator.Constant("enable");
    Tessellator.DISABLE = new Tessellator.Constant("disable");
    Tessellator.MASK = new Tessellator.Constant("mask");
    Tessellator.FLUSH = new Tessellator.Constant("flush");
    Tessellator.FONT_SHEET = new Tessellator.Constant("fontSheet");
    Tessellator.VIEW = new Tessellator.Constant("view");
    Tessellator.CAMERA = new Tessellator.Constant("camera");
    Tessellator.LIGHTING = new Tessellator.Constant("lighting");
    Tessellator.LIGHTING_AMBIENT = new Tessellator.Constant("lightingAmbeint");
    Tessellator.LIGHTING_DIRECTIONAL = new Tessellator.Constant("directionalLighting");
    Tessellator.LIGHTING_POINT = new Tessellator.Constant("lightingPoint");
    Tessellator.LIGHTING_SPECULAR = new Tessellator.Constant("lightingSpecular");
    Tessellator.LIGHTING_SPOT = new Tessellator.Constant("lightingSpot");
    Tessellator.LINE_WIDTH = new Tessellator.Constant("lineWidth");
    Tessellator.FLATTEN = new Tessellator.Constant("flatten");
    Tessellator.CLIP = new Tessellator.Constant("clip");
    Tessellator.CLEAR = new Tessellator.Constant("clear");
    Tessellator.ALL = new Tessellator.Constant("all");
    Tessellator.PIXEL_SHADER = new Tessellator.Constant("pixelShader");
    Tessellator.CHANGED = new Tessellator.Constant("changed");
    Tessellator.BLEND_FUNC = new Tessellator.Constant("blend");
    
    Tessellator.STATIC = new Tessellator.Constant("static");
    Tessellator.DYNAMIC = new Tessellator.Constant("dynamic");
    Tessellator.STREAM = new Tessellator.Constant("stream");
    
    Tessellator.FLOAT = new Tessellator.Constant("float", 1);
    Tessellator.VEC2 = new Tessellator.Constant("vec2", 2);
    Tessellator.VEC3 = new Tessellator.Constant("vec3", 3);
    Tessellator.VEC4 = new Tessellator.Constant("vec4", 4);
    
    Tessellator.INDEX_DATA = new Tessellator.Constant("indexData");
    Tessellator.BUFFER_DATA = new Tessellator.Constant("bufferData");
    
    Tessellator.TRIANGLE = new Tessellator.Constant("triangle");
    Tessellator.TRIANGLE_STRIP = new Tessellator.Constant("triangleStrip");
    Tessellator.TRIANGLE_FAN_CW = new Tessellator.Constant("triangleFanCW");
    Tessellator.TRIANGLE_FAN_CCW = new Tessellator.Constant("triangleFanCCW");
    Tessellator.LINE = new Tessellator.Constant("line");
    Tessellator.LINE_STRIP = new Tessellator.Constant("lineStrip");
    Tessellator.LINE_LOOP = new Tessellator.Constant("lineLoop");
    Tessellator.POINT = new Tessellator.Constant("point");
    Tessellator.QUAD = new Tessellator.Constant("quad");
    Tessellator.POLYGON = new Tessellator.Constant("polygon");
    
    Tessellator.CENTER = new Tessellator.Constant("center");
    Tessellator.RIGHT = new Tessellator.Constant("right");
    Tessellator.LEFT = new Tessellator.Constant("left");
    Tessellator.TOP = new Tessellator.Constant("top");
    Tessellator.BOTTOM = new Tessellator.Constant("bottom");
    
    Tessellator.BLEND_DEFAULT = Tessellator.vec2(Tessellator.SRC_ALPHA, Tessellator.ONE_MINUS_SRC_ALPHA);
    Tessellator.BLEND_INVERT = Tessellator.vec2(Tessellator.ONE_MINUS_DST_COLOR, Tessellator.ZERO);
    
    Tessellator.COLOR_WHITE = Tessellator.vec4(1, 1, 1, 1);
    Tessellator.COLOR_BLACK = Tessellator.vec4(0, 0, 0, 1);
    Tessellator.COLOR_GRAY = Tessellator.vec4(0.5, 0.5, 0.5, 1);
    Tessellator.COLOR_RED = Tessellator.vec4(1, 0, 0, 1);
    Tessellator.COLOR_GREEN = Tessellator.vec4(0, 1, 0, 1);
    Tessellator.COLOR_BLUE = Tessellator.vec4(0, 0, 1, 1);
    Tessellator.COLOR_YELLOW = Tessellator.vec4(1, 1, 0, 1);
    Tessellator.COLOR_CYAN = Tessellator.vec4(0, 1, 1, 1);
    Tessellator.COLOR_MAGENTA = Tessellator.vec4(1, 0, 1, 1);
    Tessellator.COLOR_PINK = Tessellator.vec4(1, 0.7529, 0.796, 1);
    Tessellator.COLOR_LIGHT_PINK = Tessellator.vec4(1, 0.7137, 0.7569, 1);
    Tessellator.COLOR_PURPLE = Tessellator.vec4(0.5, 0, 0.5, 1);
    Tessellator.COLOR_VIOLET = Tessellator.vec4(0.9334, 0.5098, 9.3334, 1);
    Tessellator.COLOR_INDIGO = Tessellator.vec4(0.2941, 0, 0.5098, 1);
    Tessellator.COLOR_NAVY = Tessellator.vec4(0, 0, 0.5, 1);
    Tessellator.COLOR_MAROON = Tessellator.vec4(0.5, 0, 0, 1);
    Tessellator.COLOR_DARK_RED = Tessellator.vec4(0.543, 0, 0, 1);
    Tessellator.COLOR_BROWN = Tessellator.vec4(0.6445, 0.164, 0.164, 1);
    Tessellator.COLOR_FIRE_BRICK = Tessellator.vec4(0.6953, 0.1328, 0.1328, 1);
    Tessellator.COLOR_CRIMSON = Tessellator.vec4(0.8594, 0.0755, 0.2344, 1);
    Tessellator.COLOR_TOMATO = Tessellator.vec4(1, 0.164, 0.164, 1);
    Tessellator.COLOR_CORAL = Tessellator.vec4(1, 0.5, 0.3125, 1);
    Tessellator.COLOR_INDIAN_RED = Tessellator.vec4(0.8008, 0.3594, 0.3594, 1);
    Tessellator.COLOR_AMBER = Tessellator.vec4(1, 0.4921, 0, 1);
    Tessellator.COLOR_CLEAR = Tessellator.vec4(0, 0, 0, 0);


    Tessellator.DEFAULT_COLOR = Tessellator.COLOR_WHITE;
    Tessellator.NO_CLIP = new Float32Array([0, 0, 1, 1]);
    Tessellator.NO_MASK = Tessellator.COLOR_WHITE;
    Tessellator.NO_LIGHT = new Float32Array([
        -1, 0, 0, 0,
    ]);
    
    Tessellator.DEFAULT_FAR_VIEW = 100;
    Tessellator.DEFAULT_NEAR_VIEW = 0.01;
    Tessellator.DEFAULT_FOV = Math.PI / 4;
    
    Tessellator.VERTEX_LIMIT = Math.pow(2, 16);
    
    Tessellator.COLORS = {
        "WHITE": Tessellator.COLOR_WHITE,
        "BLACK": Tessellator.COLOR_BLACK,
        "RED": Tessellator.COLOR_RED,
        "DARK RED": Tessellator.COLOR_DARK_RED,
        "GREEN": Tessellator.COLOR_GREEN,
        "BLUE": Tessellator.COLOR_BLUE,
        "GRAY": Tessellator.COLOR_GRAY,
        "YELLOW": Tessellator.COLOR_YELLOW,
        "CYAN": Tessellator.COLOR_CYAN,
        "MAGENTA": Tessellator.COLOR_MAGENTA,
        "BROWN": Tessellator.COLOR_BROWN,
        "NAVY": Tessellator.COLOR_NAVY,
        "MAROON": Tessellator.COLOR_MAROON,
        "FIRE BRICK": Tessellator.COLOR_FIRE_BRICK,
        "CRIMSON": Tessellator.COLOR_CRIMSON,
        "TOMATO": Tessellator.COLOR_TOMATO,
        "CORAL": Tessellator.COLOR_CORAL,
        "INDIAN RED": Tessellator.COLOR_INDIAN_RED,
        "PINK": Tessellator.COLOR_PINK,
        "LIGHT PINK": Tessellator.LIGHT_PINK,
        "PURPLE": Tessellator.COLOR_PURPLE,
        "INDIGO": Tessellator.COLOR_INDIGO,
        "VIOLET": Tessellator.COLOR_VIOLET,
        "AMBER": Tessellator.COLOR_AMBER,
        "CLEAR": Tessellator.COLOR_CLEAR,
    };
    
    { //shader program
        Tessellator.MODEL_VIEW_LIGHT_UNIFORM_SIZE = 32;
        
        Tessellator.PIXEL_SHADER_VERTEX_SHADER = "precision lowp float;attribute vec2 position;uniform vec2 aspect;varying vec2 texturePos;void main(void){texturePos=(position+1.0)/2.0;gl_Position=vec4(position*(aspect+1.),0.0,1.0);}";
        Tessellator.ATLAS_ANIMATION_VERTEX_SHADER = "precision lowp float;attribute vec2 position;attribute vec2 textureCoord;varying vec2 texturePos;void main(void){texturePos=textureCoord;gl_Position=vec4(position,0.0,1.0);}";
        Tessellator.ATLAS_VERTEX_SHADER = "precision lowp float;attribute vec2 position;uniform vec2 atlasDims;uniform vec2 atlas;varying vec2 texturePos;void main(void){texturePos=(position+1.0)/2.0;gl_Position=vec4((atlas+texturePos)/atlasDims*2.0-1.0,0.0,1.0);}";
        
        Tessellator.PIXEL_SHADER_BLACK = "precision lowp float;varying vec2 texturePos;void main(void){gl_FragColor=vec4(0,0,0,1);}";
        Tessellator.PIXEL_SHADER_WHITE = "precision lowp float;varying vec2 texturePos;void main(void){gl_FragColor=vec4(1,1,1,1);}";
        Tessellator.PIXEL_SHADER_COLOR = "precision lowp float;uniform vec4 color;varying vec2 texturePos;void main(void){gl_FragColor=color;}";
        Tessellator.PIXEL_SHADER_PASS = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,texturePos);}";
        Tessellator.PIXEL_SHADER_RGB = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=vec4(texture2D(sampler,texturePos).xyz,1);}";
        Tessellator.PIXEL_SHADER_FLIP_X = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,vec2(1.-texturePos.x,texturePos.y));}";
        Tessellator.PIXEL_SHADER_FLIP_Y = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,vec2(texturePos.x,1.-texturePos.y));}";
        Tessellator.PIXEL_SHADER_BLACK_AND_WHITE = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);float color=(o.x+o.y+o.z)/3.0;gl_FragColor=vec4(color,color,color,o.w);}";
        Tessellator.PIXEL_SHADER_INVERT_COLOR = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(1.0-o.xyz,o.w);}";
        Tessellator.PIXEL_SHADER_FILTER = "precision lowp float;varying vec2 texturePos;uniform vec3 mask;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);float color=(o.x*mask.x+o.y*mask.y+o.z*mask.z)/(mask.x+mask.y+mask.z);gl_FragColor=vec4(vec3(color)*mask, o.w);}";
        Tessellator.PIXEL_SHADER_MASK = "precision lowp float;varying vec2 texturePos;uniform vec4 mask;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=o*mask;}";
        Tessellator.PIXEL_SHADER_RED_FILTER = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(o.x,0,0,o.w);}";
        Tessellator.PIXEL_SHADER_GREEN_FILTER = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(0,o.y,0,o.w);}";
        Tessellator.PIXEL_SHADER_BLUE_FILTER = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(0,0,o.z,o.w);}";
        Tessellator.PIXEL_SHADER_QUALITY_FILTER = "precision lowp float;uniform float quality;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(floor(o.xyz*quality+0.5)/quality,o.w);}";
        Tessellator.PIXEL_SHADER_NOISE = "precision lowp float;uniform sampler2D sampler;uniform float time,intensity;uniform vec2 window;varying vec2 texturePos;float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}float rand(float m){return tan(rand(vec2(gl_FragCoord.x/window.x*cos(time)*3.243,gl_FragCoord.y/window.y/tan(time*5.9273)*.918)*m));}void main(void){vec4 c=texture2D(sampler,texturePos);gl_FragColor=c+(vec4(rand(1.+c.z),rand(1.72+c.x),rand(.829+c.y),1)*2.-1.)*intensity;}";
        Tessellator.PIXEL_SHADER_TRANSLATE = "precision lowp float;varying vec2 texturePos;uniform mat2 translate;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,(texturePos*2.-1.)*translate/2.+.5);}";
        
        Tessellator.PIXEL_SHADER_BLEND = "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){gl_FragColor=texture2D(sampler,texturePos)*(1.-weight)+texture2D(sampler2,texturePos)*weight;}";
        Tessellator.PIXEL_SHADER_SLIDE = "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){vec2 pos=texturePos;pos.x+=weight;if(pos.x<1.){gl_FragColor=texture2D(sampler,pos);}else{gl_FragColor=texture2D(sampler2,vec2(texturePos.x-(1.-weight),texturePos.y));}}";
        Tessellator.PIXEL_SHADER_SLIDE_IN = "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){gl_FragColor=texture2D(sampler,texturePos);if(texturePos.x+weight>1.){gl_FragColor=texture2D(sampler2,vec2(texturePos.x-(1.-weight),texturePos.y));}}";
        Tessellator.PIXEL_SHADER_SLICE_IN = "precision lowp float;varying vec2 texturePos;uniform float weight;uniform sampler2D sampler,sampler2;uniform vec2 window;void main(void){gl_FragColor=texture2D(sampler,texturePos);bool dir=int(mod(gl_FragCoord.y/window.y*8.,2.))==0;if(dir?texturePos.x-weight<0.:texturePos.x+weight>1.){gl_FragColor=texture2D(sampler2,vec2(dir?texturePos.x+(1.-weight):texturePos.x-(1.-weight),texturePos.y));}}";
        Tessellator.PIXEL_SHADER_RADIAL = "precision lowp float;varying vec2 texturePos;uniform vec2 window;uniform float weight;uniform sampler2D sampler,sampler2;void main(void){vec2 cube=(gl_FragCoord.xy/window*2.-1.);if(length(cube)>weight*sqrt(2.)){gl_FragColor=texture2D(sampler,texturePos);}else{gl_FragColor=texture2D(sampler2, texturePos);}}";
        
        Tessellator.PIXEL_SHADER_BLUR = new Tessellator.ShaderPreset(function (tessellator, resX, resY){
            return tessellator.createPixelShader("precision highp float;const int resX=" + (resX | 5) + ",resY=" + (resY | 4) + ";uniform float intensity;const float TAU=atan(1.0)*8.0;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 color=texture2D(sampler,texturePos);int index=1;for(int y=1;y<=resY;y++){float len=float(y)/float(resY)*intensity;for(int x=0;x<resX;x++){index++;float rad=float(x)/float(resX)*TAU;color+=texture2D(sampler,texturePos+vec2(sin(rad),cos(rad))*len/16.0);}}gl_FragColor=color/float(index);}");
        });
        
        Tessellator.ATLAS_SHADER = new Tessellator.ShaderPreset().configureStandardPair(
            Tessellator.ATLAS_VERTEX_SHADER,
            Tessellator.PIXEL_SHADER_MASK
            
        );
        
        Tessellator.ATLAS_SHADER_ANIMATION = new Tessellator.ShaderPreset().configureStandardPair(
            Tessellator.ATLAS_ANIMATION_VERTEX_SHADER,
            Tessellator.PIXEL_SHADER_PASS
        );
        
        Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_COLOR = "attribute vec3 position;attribute vec4 color;attribute vec3 normal;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec3 lightNormal;varying vec4 mvPosition;varying vec4 vColor;void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;lightNormal=normalize(nMatrix*normal);vColor=color;}";
        Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_COLOR = "precision mediump float;const int lightCount=32;uniform vec4 clip;uniform vec2 window;uniform float specular;varying vec4 vColor;varying vec3 lightNormal;varying vec4 mvPosition;uniform vec4 lights[lightCount];vec3 getLightMask(void){if(lights[0].x==-1.0){return vec3(1,1,1);}else{vec3 lightMask=vec3(0,0,0);int skip=0;for(int i=0;i<lightCount;i++){if(skip>0){skip--;continue;}vec4 light0=lights[i+0];int type=int(light0.x);vec3 color=light0.yzw;if(type==1){lightMask+=color;skip=0;}else if(type==2){vec3 dir=lights[i+1].xyz;float intensity=max(dot(lightNormal,dir),0.0);lightMask+=color*intensity;skip=1;}else if(type==3){vec3 pos=lights[i+1].xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity;skip=1;}else if(type==4){vec4 light1=lights[i+1];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float specularLight=0.0;if(specular>1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity*((range-length)/range);}skip=1;}else if(type==5){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity;}skip=2;}else if(type==6){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity*((range-length)/range);}skip=2;}else{return lightMask;}}return lightMask;}}void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=vColor;if(mainColor.w==0.0){discard;}else{if(lightNormal.x!=0.0||lightNormal.y!=0.0||lightNormal.z!=0.0){mainColor*=vec4(getLightMask(),1.0);}gl_FragColor=mainColor;}}";
        Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_TEXTURE = "attribute vec3 position;attribute vec2 color;attribute vec3 normal;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec3 lightNormal;varying vec4 mvPosition;varying vec2 vTexture;void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;lightNormal=normalize(nMatrix*normal);vTexture=color;}";
        Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_TEXTURE = "precision mediump float;const int lightCount=32;uniform sampler2D texture;uniform vec4 mask;uniform vec4 clip;uniform vec2 window;uniform float specular;varying vec2 vTexture;varying vec3 lightNormal;varying vec4 mvPosition;uniform vec4 lights[lightCount];vec3 getLightMask(void){if(lights[0].x==-1.0){return vec3(1,1,1);}else{vec3 lightMask=vec3(0,0,0);int skip=0;for(int i=0;i<lightCount;i++){if(skip>0){skip--;continue;}vec4 light0=lights[i+0];int type=int(light0.x);vec3 color=light0.yzw;if(type==1){lightMask+=color;skip=0;}else if(type==2){vec3 dir=lights[i+1].xyz;float intensity=max(dot(lightNormal,dir),0.0);lightMask+=color*intensity;skip=1;}else if(type==3){vec3 pos=lights[i+1].xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity;skip=1;}else if(type==4){vec4 light1=lights[i+1];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float specularLight=0.0;if(specular>1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity*((range-length)/range);}skip=1;}else if(type==5){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity;}skip=2;}else if(type==6){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity*((range-length)/range);}skip=2;}else{return lightMask;}}return lightMask;}}void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=texture2D(texture,vTexture)*mask;if(mainColor.w==0.0){discard;}else{if(lightNormal.x!=0.0||lightNormal.y!=0.0||lightNormal.z!=0.0){mainColor.xyz*=getLightMask();}gl_FragColor=mainColor;}}";
        
        Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_COLOR = "attribute vec3 position;attribute vec4 color;attribute vec3 normal;const int lightCount=32;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;vec3 lightNormal;vec4 mvPosition;varying vec4 vColor;uniform vec4 lights[lightCount];vec3 getLightMask(void){if(lights[0].x==-1.0){return vec3(1,1,1);}else{vec3 lightMask=vec3(0,0,0);int skip=0;for(int i=0;i<lightCount;i++){if(skip>0){skip--;continue;}vec4 light0=lights[i+0];int type=int(light0.x);vec3 color=light0.yzw;if(type==1){lightMask+=color;skip=0;}else if(type==2){vec3 dir=lights[i+1].xyz;float intensity=max(dot(lightNormal,dir),0.0);lightMask+=color*intensity;skip=1;}else if(type==3){vec3 pos=lights[i+1].xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity;skip=1;}else if(type==4){vec4 light1=lights[i+1];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity*((range-length)/range);}skip=1;}else if(type==5){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity;}skip=2;}else if(type==6){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity*((range-length)/range);}skip=2;}else{return lightMask;}}return lightMask;}}void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;vColor=color;lightNormal=normalize(nMatrix*normal);vColor.rgb*=getLightMask();}";
        Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_COLOR = "precision mediump float;uniform vec4 clip;uniform vec2 window;varying vec4 vColor;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}if(vColor.w==0.0){discard;}else{gl_FragColor=vColor;}}";
        Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_TEXTURE = "attribute vec3 position;attribute vec2 color;attribute vec3 normal;const int lightCount=32;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec2 vTexture;varying vec3 lightMask;vec3 lightNormal;vec4 mvPosition;uniform vec4 lights[lightCount];vec3 getLightMask(void){if(lights[0].x==-1.0){return vec3(1,1,1);}else{vec3 lightMask=vec3(0,0,0);int skip=0;for(int i=0;i<lightCount;i++){if(skip>0){skip--;continue;}vec4 light0=lights[i+0];int type=int(light0.x);vec3 color=light0.yzw;if(type==1){lightMask+=color;skip=0;}else if(type==2){vec3 dir=lights[i+1].xyz;float intensity=max(dot(lightNormal,dir),0.0);lightMask+=color*intensity;skip=1;}else if(type==3){vec3 pos=lights[i+1].xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity;skip=1;}else if(type==4){vec4 light1=lights[i+1];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity*((range-length)/range);}skip=1;}else if(type==5){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity;}skip=2;}else if(type==6){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity*((range-length)/range);}skip=2;}else{return lightMask;}}return lightMask;}}void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;lightNormal=normalize(nMatrix*normal);lightMask=getLightMask();vTexture=color;}";
        Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_TEXTURE = "precision mediump float;uniform sampler2D texture;uniform vec4 mask;uniform vec4 clip;uniform vec2 window;varying vec2 vTexture;varying vec3 lightMask;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=texture2D(texture,vTexture)*mask;mainColor.xyz*=lightMask;if(mainColor.w==0.0){discard;}else{gl_FragColor=mainColor;}}";
        
        Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR = "attribute vec3 position;attribute vec4 color;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 vColor;void main(void){gl_Position=pMatrix*mvMatrix*vec4(position,1.0);vColor=color;}";
        Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR = "precision mediump float;uniform vec4 clip;uniform vec2 window;varying vec4 vColor;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}if(vColor.w==0.0){discard;}else{gl_FragColor=vColor;}}";
        Tessellator.MODEL_VIEW_VERTEX_SHADER_TEXTURE = "attribute vec3 position;attribute vec2 color;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec2 vTexture;void main(void){gl_Position=pMatrix*mvMatrix*vec4(position,1.0);vTexture=color;}";
        Tessellator.MODEL_VIEW_FRAGMENT_SHADER_TEXTURE = "precision mediump float;uniform sampler2D texture;uniform vec4 mask;uniform vec4 clip;uniform vec2 window;varying vec2 vTexture;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=texture2D(texture,vTexture)*mask;if(mainColor.w==0.0){discard;}else{gl_FragColor=mainColor;}}";
        
        Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_SHADER = new Tessellator.ShaderPreset().configureDrawDependant(
            Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_COLOR,
            Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_COLOR,
            Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_TEXTURE,
            Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_TEXTURE,
            Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR,
            Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR
        );
        
        Tessellator.MODEL_VIEW_VERTEX_LIGHTING_SHADER = new Tessellator.ShaderPreset().configureDrawDependant(
            Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_COLOR,
            Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_COLOR,
            Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_TEXTURE,
            Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_TEXTURE,
            Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR,
            Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR
        );
        
        Tessellator.MODEL_VIEW_SHADER = new Tessellator.ShaderPreset().configureDrawDependant(
            Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR,
            Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR,
            Tessellator.MODEL_VIEW_VERTEX_SHADER_TEXTURE,
            Tessellator.MODEL_VIEW_FRAGMENT_SHADER_TEXTURE,
            Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR,
            Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR
        );
        
        Tessellator.DEPTH_MAP_VERTEX_SHADER = "attribute vec3 position;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 vecp;varying lowp float hasNormal;void main(void){vecp=pMatrix*mvMatrix*vec4(position,1.0);gl_Position=vecp;}";
        Tessellator.DEPTH_MAP_FRAGMENT_SHADER = "precision lowp float;varying vec4 vecp;void main(void){float depth=(vecp.z/vecp.w+1.0)/2.0;gl_FragColor=vec4(depth,depth,depth,1);}";
        
        Tessellator.DEPTH_MAP_SHADER = new Tessellator.ShaderPreset().configureStandardPair(
            Tessellator.DEPTH_MAP_VERTEX_SHADER,
            Tessellator.DEPTH_MAP_FRAGMENT_SHADER
        );
    }
}
{ //tessellator elements
    if (document.registerElement){
        document.registerElement("tessellator-webgl");
    }
    
    window.addEventListener("load", function () {
        var elems = Array.prototype.slice.call(document.getElementsByTagName("tessellator-webgl"));
        
        while (elems.length){
            (function (elem){
                var canvas = document.createElement("canvas");
                canvas.style.display = "block";
                
                var context;
                
                if (elem.getAttribute("args")){
                    context = "{" + elem.getAttribute("args").replace(/'/g, '"') + "}";
                    context = JSON.parse(context);
                }
                
                if (!canvas.style.width && !canvas.style.height){
                    canvas.style.width = "100%";
                    canvas.style.height = "100%";
                }
                
                {
                    var styleStr = elem.getAttribute("style");
                    
                    if (styleStr){
                        styleStr = styleStr.split(";");
                        
                        for (var ii = 0, kk = styleStr.length; ii < kk; ii++){
                            var index = styleStr[ii].indexOf(":");
                            
                            if (index > 0){
                                canvas.style[styleStr[ii].substring(0, index)] = styleStr[ii].substring(index + 1);
                            }
                        }
                    }
                }
                
                var js = ["(function (tessellator){"];
                
                var loader = function (){
                    while (elem.childNodes.length){
                        var node = elem.removeChild(elem.childNodes[0]);
                        
                        if (node.nodeType === node.TEXT_NODE){
                            js.push(node.textContent);
                        }else if (node.type === "run"){
                            Tessellator.getSourceText(node, function (text){
                                js.push(text);
                                
                                loader();
                            });
                            
                            return;
                        }else{
                            canvas.appendChild(node);
                        }
                    }
                    
                    js.push("})(window.WILDCARD_TESSELLATOR_OBJ);");
                    elem.parentNode.replaceChild(canvas, elem);
                    
                    window.WILDCARD_TESSELLATOR_OBJ = new Tessellator(canvas, context);
                    window.eval(js.join(""));
                    delete window.WILDCARD_TESSELLATOR_OBJ;
                }
                
                loader();
            })(elems.shift());
        }
    });
}
