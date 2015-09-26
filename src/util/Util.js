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
            var level = o2.prototype;
            
            for (var oo in o2.prototype){
                (function (obj){
                    instance[obj] = function (){
                        var cache = level;
                        level = cache.__proto__;
                        
                        var value = cache[obj].apply(self, arguments);
                        level = cache;
                        
                        return value;
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

Tessellator.prototype.glConst = function (c){
    if (c.constructor === Array){
        for (var i = 0; i < c.length; i++){
            c[i] = this.glConst(c[i]);
        }
        
        return c;
    }else if (c.constructor === Tessellator.Constant){
        return c.gl;
    }else{
        return c;
    }
}

Tessellator.prototype.tessConst = function (c){
    return Tessellator.Constant.VALUE_NAME[c];
}

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
        for (var i = 0; i < Tessellator.VENDORS.length && !c; i++){
            c = this.tessellator.GL.getExtension(Tessellator.VENDORS[i] + key);
        }
        
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
        }else if (arg.constructor === Tessellator.float){
            color = Tessellator.vec4(arg, arg, arg, 1);
        }else if (arg.constructor === Array){
            if (arg.length === 4){
                color = Tessellator.vec4(arg);
            }else if (arg.length === 3){
                color = Tessellator.vec4(arg, 1);
            }else if (arg.length === 2){
                color = Tessellator.vec4(arg[0], arg[0], arg[0], arg[1]);
            }else if (arg.length === 1){
                color = Tessellator.vec4(arg, arg, arg, 1);
            }else{
                color = Tessellator.vec4();
            }
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

Tessellator.getVendorIndependent = function (object, name){
    for (var o in object){
        var oo = o.toLowerCase();
        
        for (var i = 0; i < Tessellator.VENDORS.length; i++){
            if (oo == Tessellator.VENDORS[i] + name){
                return object[o];
            }
        }
    }
}

Tessellator.prototype.getPointerLock = function (){
    return Tessellator.getVendorIndependent(document, "pointerlockelement");
}

Tessellator.prototype.hasPointerLock = function (){
    return this.pointerLock;
}

Tessellator.prototype.aquirePointerLock = function (){
    if (this.getPointerLock() !== this.canvas){
        Tessellator.getVendorIndependent(this.canvas, "requestpointerlock").call(this.canvas);
        
        this.pointerLock = {
            event: (function (tessellator) {
                return function (e){
                    if (!e || tessellator.getPointerLock() !== tessellator.canvas){
                        document.removeEventListener("pointerlockchange", tessellator.pointerLock.event);
                        document.removeEventListener("mozpointerlockchange", tessellator.pointerLock.event);
                        document.removeEventListener("webkitpointerlockchange", tessellator.pointerLock.event);
                        
                        Tessellator.getVendorIndependent(document, "exitpointerlock").call(document);
                        
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
    if (Tessellator.getVendorIndependent(document, "fullscreenelement") !== tessellator.canvas){
        Tessellator.getVendorIndependent(this.canvas, "requestfullscreen").call(this.canvas);
        
        this.fullscreen = {
            style: this.canvas.style.cssText,
            event: (function (tessellator){
                return function (e){
                    if (!e || Tessellator.getVendorIndependent(document, "fullscreenelement") !== tessellator.canvas){
                        tessellator.canvas.style.cssText = tessellator.fullscreen.style;
                        tessellator.forceCanvasResize();
                        
                        tessellator.canvas.removeEventListener("fullscreenchange", tessellator.fullscreen.event);
                        tessellator.canvas.removeEventListener("webkitfullscreenchange", tessellator.fullscreen.event);
                        tessellator.canvas.removeEventListener("mozfullscreenchange", tessellator.fullscreen.event);
                        
                        Tessellator.getVendorIndependent(document, "exitfullscreen").call(document);
                        
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