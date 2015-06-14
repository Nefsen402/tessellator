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
//"use strict";

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
		
		if (contextArgs && contextArgs["renderTD"]){
			delete contextArgs["renderTD"];
			
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
		
		this.extenstions = new Tessellator.Extensions(this);
		
		this.maxUniformSpace = this.GL.getParameter(this.GL.MAX_FRAGMENT_UNIFORM_VECTORS);
		this.maxTextures = this.GL.getParameter(this.GL.MAX_TEXTURE_IMAGE_UNITS);
		
		this.GL.clearColor(0, 0, 0, 0);
		this.GL.clearDepth(1.0);
		this.GL.enable(this.GL.DEPTH_TEST);
		this.GL.enable(this.GL.CULL_FACE);
		this.GL.enable(this.GL.BLEND);
		this.GL.blendFunc(this.GL.SRC_ALPHA, this.GL.ONE_MINUS_SRC_ALPHA);
		this.GL.depthFunc(this.GL.LEQUAL);
		
		this.forceCanvasResize();
		
		//used when textures are referenced through strings. Not recommended.
		this.textureCache = {};
		this.textureIDCache = [];
		this.unusedTextureID = [];
		
		for (var i = 0; i < Tessellator.createHandle.length; i++){
			Tessellator.createHandle[i].call(this);
		}
	}
	
	Tessellator.VERSION = "1a beta";
	
	if (window.module){
		window.module.exports = Tessellator;
	}
	
	Tessellator.prototype.frameBuffer = null;
	
	Tessellator.createHandle = [];
	
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
	
	Tessellator.prototype.getDataURL = function (){
		return this.canvas.toDataURL.apply(this.canvas, arguments);
	}
	
	Tessellator.prototype.preRender = function (){
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
	
	Tessellator.prototype.uncacheTexture = function (texture) {
		this.unusedTextureID.push(texture.id);
		this.textureIDCache[texture.id] = null;
		
		texture.id = -1;
	}
	
	Tessellator.prototype.cacheTexture = function (texture){
		var unused = this.unusedTextureID.pop();
		
		if (unused){
			texture.id = unused;
			this.textureIDCache[texture.id] = texture;
		}else{
			texture.id = this.textureIDCache.length;
			this.textureIDCache.push(texture);
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
			
			Tessellator.copyProto = function (o, o2){
				var newproto = Object.create(o2.prototype);
				
				newproto.super = function (){
					this.super = o2.prototype.super;
					o2.apply(this, arguments);
					
					var instance = {};
					var self = this;
					
					for (var oo in o2.prototype){
						(function (obj){
							instance[obj] = function (){
								self.super = o2.prototype.__proto__;
								o2.prototype[obj].apply(self, arguments);
								self.super = this;
							}
						})(oo);
					}
					
					this.super = instance;
				}
				
				newproto.constructor = o;
				
				o.prototype = newproto;
			}
		})();
		
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
		
		Tessellator.CLONE_ARRAY_FUNC = function (m){
			var cm = new m.constructor(m.length);
			
			for (var i = 0; i < m.length; i++){
				cm[i] = m[i];
			}
			
			return cm;
		}
		
		Tessellator.CLEAR_ARRAY_FUNC = function (m){
			for (var i = 0, k = m.length; i < k; i++){
				m[i] = 0;
			}
			
			return m;
		}
		
		Tessellator.TEXTURE_SELECT_ENUM = [
			Tessellator.TEXTURE0,
			Tessellator.TEXTURE1,
			Tessellator.TEXTURE2,
			Tessellator.TEXTURE3,
			Tessellator.TEXTURE4,
			Tessellator.TEXTURE5,
			Tessellator.TEXTURE6,
			Tessellator.TEXTURE7,
			Tessellator.TEXTURE8,
			Tessellator.TEXTURE9,
			Tessellator.TEXTURE10,
			Tessellator.TEXTURE11,
			Tessellator.TEXTURE12,
			Tessellator.TEXTURE13,
			Tessellator.TEXTURE14,
			Tessellator.TEXTURE15,
			Tessellator.TEXTURE16,
			Tessellator.TEXTURE17,
			Tessellator.TEXTURE18,
			Tessellator.TEXTURE19,
			Tessellator.TEXTURE20,
			Tessellator.TEXTURE21,
			Tessellator.TEXTURE22,
			Tessellator.TEXTURE23,
			Tessellator.TEXTURE24,
			Tessellator.TEXTURE25,
			Tessellator.TEXTURE26,
			Tessellator.TEXTURE27,
			Tessellator.TEXTURE28,
			Tessellator.TEXTURE29,
			Tessellator.TEXTURE30,
			Tessellator.TEXTURE31
		];
		
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
	}
	{ //mat4
		Tessellator.mat4 = function (){
			var array = new Float32Array(16);
			
			var pos = 0;
			
			for (var i = 0, k = arguments.length; i < k; i++){
				var arg = arguments[i];
				
				if (typeof arg != "number"){
					array.set(arg, pos);
					
					if (!arg.length){
						pos += arg.len;
					}else{
						pos += arg.length;
					}
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
			
			array.__proto__ = Tessellator.mat4;
			return array;
		}
		
		Tessellator.mat4.len = 16;
		Tessellator.mat4.constructor = Tessellator.mat4;
		
		Tessellator.mat4.random = function (scale){
			if (scale === undefined){
				scale = 1;
			}
			
			this[ 0] = Math.random() * scale;
			this[ 1] = Math.random() * scale;
			this[ 2] = Math.random() * scale;
			this[ 3] = Math.random() * scale;
			
			this[ 4] = Math.random() * scale;
			this[ 5] = Math.random() * scale;
			this[ 6] = Math.random() * scale;
			this[ 7] = Math.random() * scale;
			
			this[ 8] = Math.random() * scale;
			this[ 9] = Math.random() * scale;
			this[10] = Math.random() * scale;
			this[11] = Math.random() * scale;
			
			this[12] = Math.random() * scale;
			this[13] = Math.random() * scale;
			this[14] = Math.random() * scale;
			this[15] = Math.random() * scale;
			
			return this;
		}
		
		Tessellator.mat4.clone = function (){
			return Tessellator.mat4(this);
		}
		
		Tessellator.mat4.copy = function (copy){
			if (copy.constructor === Tessellator.mat4){
				this[ 0] = copy[ 0];
				this[ 1] = copy[ 1];
				this[ 2] = copy[ 2];
				this[ 3] = copy[ 3];
				
				this[ 4] = copy[ 4];
				this[ 5] = copy[ 5];
				this[ 6] = copy[ 6];
				this[ 7] = copy[ 7];
				
				this[ 8] = copy[ 8];
				this[ 9] = copy[ 9];
				this[10] = copy[10];
				this[11] = copy[11];
				
				this[12] = copy[12];
				this[13] = copy[13];
				this[14] = copy[14];
				this[15] = copy[15];
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
		
		Tessellator.mat4.multiply = function (mat){
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
		
		Tessellator.mat4.transpose = function (){
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
		
		Tessellator.mat4.invert = function (){
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
		
		Tessellator.mat4.adjoint = function(joint) {
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
		
		Tessellator.mat4.translate = function (vec3){
			this[12] += this[ 0] * vec3[0] + this[ 4] * vec3[1] + this[ 8] * vec3[2];
			this[13] += this[ 1] * vec3[0] + this[ 5] * vec3[1] + this[ 9] * vec3[2];
			this[14] += this[ 2] * vec3[0] + this[ 6] * vec3[1] + this[10] * vec3[2];
			this[15] += this[ 3] * vec3[0] + this[ 7] * vec3[1] + this[11] * vec3[2];
			
			return this;
		}
		
		Tessellator.mat4.identity = function (){
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
		
		Tessellator.mat4.scale = function (vec3){
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
		
		Tessellator.mat4.rotate = function (rot, vec3){
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
				s = Math.sin(rot),
				c = Math.cos(rot),
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
		
		Tessellator.mat4.rotateX = function (rad) {
			var s = Math.sin(rad),
				c = Math.cos(rad);
			
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
		
		Tessellator.mat4.rotateY = function (rad) {
			var s = Math.sin(rad),
				c = Math.cos(rad);
			
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
		
		Tessellator.mat4.rotateZ = function (rad) {
			var s = Math.sin(rad),
				c = Math.cos(rad);
			
			
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
		
		Tessellator.mat4.toString = function (){
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
					
					if (!arg.length){
						pos += arg.len;
					}else{
						pos += arg.length;
					}
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
			
			array.__proto__ = Tessellator.mat3;
			return array;
		}
		
		Tessellator.mat3.len = 9;
		Tessellator.mat3.constructor = Tessellator.mat3;
		
		Tessellator.mat3.clone = function (){
			return Tessellator.mat3(this);
		}
		
		Tessellator.mat3.copy = function (copy){
			if (copy.constructor === Tessellator.mat3){
				this[0] = copy[0];
				this[1] = copy[1];
				this[2] = copy[2];
				
				this[3] = copy[3];
				this[4] = copy[4];
				this[5] = copy[5];
				
				this[6] = copy[6];
				this[7] = copy[7];
				this[8] = copy[8];
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
		
		Tessellator.mat3.identity = function (){
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
		
		Tessellator.mat3.adjoint = function(joint) {
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
		
		Tessellator.mat3.transpose = function (){
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
		
		Tessellator.mat3.invert = function (){
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
		
		Tessellator.mat3.normalFromMat4 = function (a) {
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
		
		Tessellator.mat3.toString = function (){
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
					
					if (!arg.length){
						pos += arg.len;
					}else{
						pos += arg.length;
					}
				}else{
					array[pos++] = arg;
				}
			}
			
			if (pos === 1){
				array[3] = array[0];
			}else if (pos !== 0){
				if (pos < array.length){
					throw "too little information";
				}else if (pos > array.length){
					throw "too much information";
				}
			}
			
			array.__proto__ = Tessellator.mat2;
			return array;
		}
		
		Tessellator.mat2.len = 4;
		Tessellator.mat2.constructor = Tessellator.mat2;
		
		Tessellator.mat2.identity = function (scale){
			if (scale === undefined){
				scale = 1;
			}
			
			this[0] = scale;
			this[1] = 0;
			
			this[2] = 0;
			this[3] = scale;
			
			return this;
		}
		
		Tessellator.mat2.copy = function (mat){
			this[0] = mat[0];
			this[1] = mat[1];
			this[2] = mat[2];
			this[3] = mat[3];
			
			return this;
		}
		
		Tessellator.mat2.clone = function (){
			return Tessellator.mat2(this);
		}
		
		Tessellator.mat2.transpose = function (){
			var
				x01 = this[1],
				x10 = this[2];
			
			this[1] = x10;
			this[2] = x01;
			
			return this;
		}
		
		Tessellator.mat2.invert = function (){
			var
				x00 = this[0],
				x01 = this[1],
				x10 = this[2],
				x11 = this[3],
				
				d = x00 * x11 - x01 * x10;
			
			this[0] = x11 / d;
			this[1] = -x01 / d;
			this[2] = -x10 / d;
			this[4] = x00 / d;
		}
		
		Tessellator.mat2.toString = function (){
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
					
					if (!arg.length){
						pos += arg.len;
					}else{
						pos += arg.length;
					}
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
			
			array.__proto__ = Tessellator.vec4;
			
			return array;
		}
		
		Tessellator.vec4.len = 4;
		Tessellator.vec4.constructor = Tessellator.vec4;
		
		Tessellator.vec4.clear = function (){
			this[0] = 0;
			this[1] = 0;
			this[3] = 0;
			this[2] = 0;
		}
		
		Tessellator.vec4.clone = function (){
			return Tessellator.vec4(this);
		}
		
		Tessellator.vec4.copy = function (vec4){
			this[0] = vec4[0];
			this[1] = vec4[1];
			this[2] = vec4[2];
			this[3] = vec4[3];
			
			return this;
		}
		
		Tessellator.vec4.exp = function(vec){
			this[0] = Math.pow(this[0], vec[0]);
			this[1] = Math.pow(this[1], vec[1]);
			this[2] = Math.pow(this[2], vec[2]);
			this[3] = Math.pow(this[3], vec[3]);
			
			return this;
		}
		
		Tessellator.vec4.sqrt = function(){
			this[0] = Math.sqrt(this[0]);
			this[1] = Math.sqrt(this[1]);
			this[2] = Math.sqrt(this[2]);
			this[3] = Math.sqrt(this[3]);
			
			return this;
		}
		
		Tessellator.vec4.inversesqrt = function(){
			this[0] = 1 / Math.sqrt(this[0]);
			this[1] = 1 / Math.sqrt(this[1]);
			this[2] = 1 / Math.sqrt(this[2]);
			this[3] = 1 / Math.sqrt(this[3]);
			
			return this;
		}
		
		Tessellator.vec4.abs = function(){
			this[0] = Math.abs(this[0]);
			this[1] = Math.abs(this[1]);
			this[2] = Math.abs(this[2]);
			this[3] = Math.abs(this[3]);
			
			return this;
		}
		
		Tessellator.vec4.sign = function (){
			this[0] = this[0] < 0 ? 1 : (this[0] > 0 ? -1 : this[0]);
			this[1] = this[1] < 0 ? 1 : (this[1] > 0 ? -1 : this[1]);
			this[2] = this[2] < 0 ? 1 : (this[2] > 0 ? -1 : this[2]);
			this[3] = this[3] < 0 ? 1 : (this[3] > 0 ? -1 : this[3]);
			
			return this;
		}
		
		Tessellator.vec4.step = function (edge){
			if (isNaN(edge)){
				this[0] = this[0] < edge[0] ? 0 : 1;
				this[1] = this[1] < edge[1] ? 0 : 1;
				this[2] = this[2] < edge[2] ? 0 : 1;
				this[3] = this[3] < edge[3] ? 0 : 1;
			}else{
				this[0] = this[0] < edge ? 0 : 1;
				this[1] = this[1] < edge ? 0 : 1;
				this[2] = this[2] < edge ? 0 : 1;
				this[3] = this[3] < edge ? 0 : 1;
			}
			
			return this;
		}
		
		Tessellator.vec4.floor = function (){
			this[0] = Math.floor(this[0]);
			this[1] = Math.floor(this[1]);
			this[2] = Math.floor(this[2]);
			this[3] = Math.floor(this[3]);
			
			return this;
		}
		
		Tessellator.vec4.ceil = function (){
			this[0] = Math.ceil(this[0]);
			this[1] = Math.ceil(this[1]);
			this[2] = Math.ceil(this[2]);
			this[3] = Math.ceil(this[3]);
			
			return this;
		}
		
		Tessellator.vec4.mod = function (vec4){
			this[0] = this[0] % vec4[0];
			this[1] = this[1] % vec4[1];
			this[2] = this[2] % vec4[2];
			this[3] = this[3] % vec4[3];
			
			return this;
		}
		
		Tessellator.vec4.clamp = function (min, max){
			this[0] = this[0] < min[0] ? min[0] : (this[0] > max[0] ? max[0] : this[0]);
			this[1] = this[1] < min[1] ? min[0] : (this[1] > max[0] ? max[0] : this[1]);
			this[2] = this[2] < min[2] ? min[0] : (this[2] > max[0] ? max[0] : this[2]);
			this[3] = this[3] < min[3] ? min[0] : (this[3] > max[0] ? max[0] : this[3]);
			
			return this;
		}
		
		Tessellator.vec4.fract = function (){
			this[0] = this[0] - Math.floor(this[0]);
			this[1] = this[1] - Math.floor(this[1]);
			this[2] = this[2] - Math.floor(this[2]);
			this[3] = this[3] - Math.floor(this[3]);
			
			return this;
		}
		
		Tessellator.vec4.mix = function (vec4, l){
			if (isNaN(l)){
				this[0] = this[0] + l[0] * (vec4[0] - this[0]);
				this[1] = this[1] + l[1] * (vec4[1] - this[1]);
				this[2] = this[2] + l[2] * (vec4[2] - this[2]);
				this[3] = this[3] + l[3] * (vec4[3] - this[3]);
			}else{
				this[0] = this[0] + l * (vec4[0] - this[0]);
				this[1] = this[1] + l * (vec4[1] - this[1]);
				this[2] = this[2] + l * (vec4[2] - this[2]);
				this[3] = this[3] + l * (vec4[3] - this[3]);
			}
			
			return this;
		}
		
		Tessellator.vec4.set = function (x, y, z, w){
			this[0] = x;
			this[1] = y;
			this[2] = z;
			this[3] = w;
			
			return this;
		}
		
		Tessellator.vec4.add = function (vec){
			if (vec.constructor === Tessellator.vec4){
				this[0] += vec[0];
				this[1] += vec[1];
				this[2] += vec[2];
				this[3] += vec[3];
			}else{
				this[0] += vec;
				this[1] += vec;
				this[2] += vec;
				this[3] += vec;
			}
			
			return this;
		}
		
		Tessellator.vec4.subtract = function (vec){
			if (vec.constructor === Tessellator.vec4){
				this[0] -= vec[0];
				this[1] -= vec[1];
				this[2] -= vec[2];
				this[3] -= vec[3];
			}else{
				this[0] -= vec;
				this[1] -= vec;
				this[2] -= vec;
				this[3] -= vec;
			}
			
			return this;
		}
		
		Tessellator.vec4.multiply = function (vec){
			if (vec.constructor === Tessellator.vec4){
				this[0] *= vec[0];
				this[1] *= vec[1];
				this[2] *= vec[2];
				this[3] *= vec[3];
			}else{
				this[0] *= vec;
				this[1] *= vec;
				this[2] *= vec;
				this[3] *= vec;
			}
			
			return this;
		}
		
		Tessellator.vec4.divide = function (vec4){
			if (vec.constructor === Tessellator.vec4){
				this[0] /= vec[0];
				this[1] /= vec[1];
				this[2] /= vec[2];
				this[3] /= vec[3];
			}else{
				this[0] /= vec;
				this[1] /= vec;
				this[2] /= vec;
				this[3] /= vec;
			}
			
			return this;
		}
		
		Tessellator.vec4.scale = function (x){
			this[0] *= x;
			this[1] *= x;
			this[2] *= x;
			this[3] *= x;
			
			return this;
		}
		
		Tessellator.vec4.min = function (vec4){
			this[0] = Math.min(this[0], vec4[0]);
			this[1] = Math.min(this[1], vec4[1]);
			this[2] = Math.min(this[2], vec4[2]);
			this[3] = Math.min(this[3], vec4[3]);
			
			return this;
		}
		
		Tessellator.vec4.max = function (vec4){
			this[0] = Math.max(this[0], vec4[0]);
			this[1] = Math.max(this[1], vec4[1]);
			this[2] = Math.max(this[2], vec4[2]);
			this[3] = Math.max(this[3], vec4[3]);
			
			return this;
		}
		
		Tessellator.vec4.squaredDistance = function (vec4){
			var
				x = vec4[0] - this[0],
				y = vec4[1] - this[1],
				z = vec4[2] - this[2],
				w = vec4[3] - this[3];
			
			return x * x + y * y + z * z + w * w;
		}
		
		Tessellator.vec4.distance = function (vec4){
			return Math.sqrt(this.squaredDistance(vec4));
		}
		
		Tessellator.vec4.dot = function (vec4){
			return this[0] * vec4[0] + this[1] * vec4[1] + this[2] * vec4[2] + this[3] * vec4[3];
		}
		
		Tessellator.vec4.squaredLength = function (){
			return this.dot(this);
		}
		
		Tessellator.vec4.vecLength = function (){
			return Math.sqrt(this.squaredLength());
		}
		
		Tessellator.vec4.normalize = function (){
			var d = this.vecLength();
			this[0] /= d;
			this[1] /= d;
			this[2] /= d;
			this[3] /= d;
			
			return this;
		}
		
		Tessellator.vec4.invert = function (){
			this[0] = 1 / this[0];
			this[1] = 1 / this[1];
			this[2] = 1 / this[2];
			this[3] = 1 / this[3];
			
			return this;
		}
		
		Tessellator.vec4.negate = function (){
			this[0] = -this[0];
			this[1] = -this[1];
			this[2] = -this[2];
			this[3] = -this[3];
			
			return this;
		}
		
		Tessellator.vec4.random = function (scale){
			if (scale === undefined){
				scale = 1;
			}
			
			this[0] = Math.random() * scale;
			this[1] = Math.random() * scale;
			this[2] = Math.random() * scale;
			this[3] = Math.random() * scale;
			
			return this;
		}
		
		Tessellator.vec4.x = function (){
			return this[0];
		}
		
		Tessellator.vec4.y = function (){
			return this[1];
		}
		
		Tessellator.vec4.z = function (){
			return this[2];
		}
		
		Tessellator.vec4.w = function (){
			return this[3];
		}
		
		Tessellator.vec4.toString = function (){
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
					
					if (!arg.length){
						pos += arg.len;
					}else{
						pos += arg.length;
					}
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
			
			array.__proto__ = Tessellator.vec3;
			
			return array;
		}
		
		Tessellator.vec3.len = 3;
		Tessellator.vec3.constructor = Tessellator.vec3;
		
		Tessellator.vec3.clear = function (){
			this[0] = 0;
			this[1] = 0;
			this[3] = 0;
		}
		
		Tessellator.vec3.clone = function (){
			return Tessellator.vec3(this);
		}
		
		Tessellator.vec3.copy = function (vec3){
			this[0] = vec3[0];
			this[1] = vec3[1];
			this[2] = vec3[2];
			
			return this;
		}
		
		Tessellator.vec3.set = function (x, y, z){
			this[0] = x;
			this[1] = y;
			this[2] = z;
			
			return this;
		}
		
		Tessellator.vec3.exp = function(vec){
			this[0] = Math.pow(this[0], vec[0]);
			this[1] = Math.pow(this[1], vec[1]);
			this[2] = Math.pow(this[2], vec[2]);
			
			return this;
		}
		
		Tessellator.vec3.sqrt = function(){
			this[0] = Math.sqrt(this[0]);
			this[1] = Math.sqrt(this[1]);
			this[2] = Math.sqrt(this[2]);
			
			return this;
		}
		
		Tessellator.vec3.inversesqrt = function(){
			this[0] = 1 / Math.sqrt(this[0]);
			this[1] = 1 / Math.sqrt(this[1]);
			this[2] = 1 / Math.sqrt(this[2]);
			
			return this;
		}
		
		Tessellator.vec3.abs = function(){
			this[0] = Math.abs(this[0]);
			this[1] = Math.abs(this[1]);
			this[2] = Math.abs(this[2]);
			
			return this;
		}
		
		Tessellator.vec3.sign = function (){
			this[0] = this[0] < 0 ? 1 : (this[0] > 0 ? -1 : this[0]);
			this[1] = this[1] < 0 ? 1 : (this[1] > 0 ? -1 : this[1]);
			this[2] = this[2] < 0 ? 1 : (this[2] > 0 ? -1 : this[2]);
			
			return this;
		}
		
		Tessellator.vec3.step = function (edge){
			if (isNaN(edge)){
				this[0] = this[0] < edge[0] ? 0 : 1;
				this[1] = this[1] < edge[1] ? 0 : 1;
				this[2] = this[2] < edge[2] ? 0 : 1;
			}else{
				this[0] = this[0] < edge ? 0 : 1;
				this[1] = this[1] < edge ? 0 : 1;
				this[2] = this[2] < edge ? 0 : 1;
			}
			
			return this;
		}
		
		Tessellator.vec3.floor = function (){
			this[0] = Math.floor(this[0]);
			this[1] = Math.floor(this[1]);
			this[2] = Math.floor(this[2]);
			
			return this;
		}
		
		Tessellator.vec3.ceil = function (){
			this[0] = Math.ceil(this[0]);
			this[1] = Math.ceil(this[1]);
			this[2] = Math.ceil(this[2]);
			
			return this;
		}
		
		Tessellator.vec3.mod = function (vec3){
			this[0] = this[0] % vec3[0];
			this[1] = this[1] % vec3[1];
			this[2] = this[2] % vec3[2];
			
			return this;
		}
		
		Tessellator.vec3.clamp = function (min, max){
			this[0] = this[0] < min[0] ? min[0] : (this[0] > max[0] ? max[0] : this[0]);
			this[1] = this[1] < min[1] ? min[0] : (this[1] > max[0] ? max[0] : this[1]);
			this[2] = this[2] < min[2] ? min[0] : (this[2] > max[0] ? max[0] : this[2]);
			
			return this;
		}
		
		Tessellator.vec3.fract = function (){
			this[0] = this[0] - Math.floor(this[0]);
			this[1] = this[1] - Math.floor(this[1]);
			this[2] = this[2] - Math.floor(this[2]);
			
			return this;
		}
		
		Tessellator.vec3.mix = function (vec3, l){
			if (isNaN(l)){
				this[0] = this[0] + l[0] * (vec3[0] - this[0]);
				this[1] = this[1] + l[1] * (vec3[1] - this[1]);
				this[2] = this[2] + l[2] * (vec3[2] - this[2]);
			}else{
				this[0] = this[0] + l * (vec3[0] - this[0]);
				this[1] = this[1] + l * (vec3[1] - this[1]);
				this[2] = this[2] + l * (vec3[2] - this[2]);
			}
			
			return this;
		}
		
		Tessellator.vec3.add = function (vec){
			if (vec.constructor === Tessellator.vec3){
				this[0] += vec[0];
				this[1] += vec[1];
				this[2] += vec[2];
			}else{
				this[0] += vec;
				this[1] += vec;
				this[2] += vec;
			}
			
			return this;
		}
		
		Tessellator.vec3.subtract = function (vec){
			if (vec.constructor === Tessellator.vec3){
				this[0] -= vec[0];
				this[1] -= vec[1];
				this[2] -= vec[2];
			}else{
				this[0] -= vec;
				this[1] -= vec;
				this[2] -= vec;
			}
			
			return this;
		}
		
		Tessellator.vec3.multiply = function (vec){
			if (vec.constructor === Tessellator.vec3){
				this[0] *= vec[0];
				this[1] *= vec[1];
				this[2] *= vec[2];
			}else if (vec.constructor === Tessellator.mat4){
				var
					x = this[0],
					y = this[1],
					z = this[2],
					w = vec[3] * x + vec[7] * y + vec[11] * z + vec[15];
				
				this[0] = (vec[ 0] * x + vec[ 4] * y + vec[ 8] * z + vec[12]) / w;
				this[1] = (vec[ 1] * x + vec[ 5] * y + vec[ 9] * z + vec[13]) / w;
				this[2] = (vec[ 2] * x + vec[ 6] * y + vec[10] * z + vec[14]) / w;
			}else if (vec.constructor === Tessellator.mat3){
				var
					x = this[0],
					y = this[1],
					z = this[2];
				
				this[0] = vec[0] * x + vec[3] * y + vec[6] * z;
				this[1] = vec[1] * x + vec[4] * y + vec[7] * z;
				this[2] = vec[2] * x + vec[5] * y + vec[8] * z;
			}else{
				this[0] *= vec;
				this[1] *= vec;
				this[2] *= vec;
			}
			
			return this;
		}
		
		Tessellator.vec3.divide = function (vec){
			if (vec.constructor === Tessellator.vec3){
				this[0] /= vec[0];
				this[1] /= vec[1];
				this[2] /= vec[2];
			}else{
				this[0] /= vec;
				this[1] /= vec;
				this[2] /= vec;
			}
			
			return this;
		}
		
		Tessellator.vec3.min = function (vec3){
			this[0] = Math.min(this[0], vec3[0]);
			this[1] = Math.min(this[1], vec3[1]);
			this[2] = Math.min(this[2], vec3[2]);
			
			return this;
		}
		
		Tessellator.vec3.max = function (vec3){
			this[0] = Math.max(this[0], vec3[0]);
			this[1] = Math.max(this[1], vec3[1]);
			this[2] = Math.max(this[2], vec3[2]);
			
			return this;
		}
		
		Tessellator.vec3.squaredDistance = function (vec3){
			var
				x = vec3[0] - this[0],
				y = vec3[1] - this[1],
				z = vec3[2] - this[2];
			
			return x * x + y * y + z * z;
		}
		
		Tessellator.vec3.distance = function (vec3){
			return Math.sqrt(this.squaredDistance(vec3));
		}
		
		Tessellator.vec3.dot = function (vec3){
			return this[0] * vec3[0] + this[1] * vec3[1] + this[2] * vec3[2];
		}
		
		Tessellator.vec3.squaredLength = function (){
			return this.dot(this);
		}
		
		Tessellator.vec3.vecLength = function (){
			return Math.sqrt(this.squaredLength());
		}
		
		Tessellator.vec3.normalize = function (){
			var d = this.vecLength();
			this[0] /= d;
			this[1] /= d;
			this[2] /= d;
			
			return this;
		}
		
		Tessellator.vec3.invert = function (){
			this[0] = 1 / this[0];
			this[1] = 1 / this[1];
			this[2] = 1 / this[2];
			
			return this;
		}
		
		Tessellator.vec3.negate = function (){
			this[0] = -this[0];
			this[1] = -this[1];
			this[2] = -this[2];
			
			return this;
		}
		
		Tessellator.vec3.random = function (scale){
			if (scale === undefined){
				scale = 1;
			}
			
			this[0] = Math.random() * scale;
			this[1] = Math.random() * scale;
			this[2] = Math.random() * scale;
			
			return this;
		}
		
		Tessellator.vec3.x = function (x){
			if (x){
				return this[0] = x;
			}else{
				return this[0];
			}
		}
		
		Tessellator.vec3.y = function (y){
			if (y){
				return this[1] = y;
			}else{
				return this[1];
			}
		}
		
		Tessellator.vec3.z = function (z){
			if (z){
				return this[2] = z;
			}else{
				return this[2];
			}
		}
		
		Tessellator.vec3.tween = function (vec3){
			new Tessellator.Tween(this, vec3);
		}
		
		Tessellator.vec3.toString = function (){
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
					
					if (!arg.length){
						pos += arg.len;
					}else{
						pos += arg.length;
					}
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
			
			array.__proto__ = Tessellator.vec2;
			
			return array;
		}
		
		Tessellator.vec2.len = 2;
		Tessellator.vec2.constructor = Tessellator.vec2;
		
		Tessellator.vec2.clear = function (){
			this[0] = 0;
			this[1] = 0;
		}
		
		Tessellator.vec2.clone = function (){
			return Tessellator.vec2(this);
		}
		
		Tessellator.vec2.copy = function (vec2){
			this[0] = vec2[0];
			this[1] = vec2[1];
			
			return this;
		}
		
		Tessellator.vec2.exp = function(vec){
			this[0] = Math.pow(this[0], vec[0]);
			this[1] = Math.pow(this[1], vec[1]);
			
			return this;
		}
		
		Tessellator.vec2.sqrt = function(){
			this[0] = Math.sqrt(this[0]);
			this[1] = Math.sqrt(this[1]);
			
			return this;
		}
		
		Tessellator.vec2.inversesqrt = function(){
			this[0] = 1 / Math.sqrt(this[0]);
			this[1] = 1 / Math.sqrt(this[1]);
			
			return this;
		}
		
		Tessellator.vec2.abs = function(){
			this[0] = Math.abs(this[0]);
			this[1] = Math.abs(this[1]);
			
			return this;
		}
		
		Tessellator.vec2.sign = function (){
			this[0] = this[0] < 0 ? 1 : (this[0] > 0 ? -1 : this[0]);
			this[1] = this[1] < 0 ? 1 : (this[1] > 0 ? -1 : this[1]);
			
			return this;
		}
		
		Tessellator.vec2.step = function (edge){
			if (isNaN(edge)){
				this[0] = this[0] < edge[0] ? 0 : 1;
				this[1] = this[1] < edge[1] ? 0 : 1;
			}else{
				this[0] = this[0] < edge ? 0 : 1;
				this[1] = this[1] < edge ? 0 : 1;
			}
			
			return this;
		}
		
		Tessellator.vec2.floor = function (){
			this[0] = Math.floor(this[0]);
			this[1] = Math.floor(this[1]);
			
			return this;
		}
		
		Tessellator.vec2.ceil = function (){
			this[0] = Math.ceil(this[0]);
			this[1] = Math.ceil(this[1]);
			
			return this;
		}
		
		Tessellator.vec2.mod = function (vec2){
			this[0] = this[0] % vec2[0];
			this[1] = this[1] % vec2[1];
			
			return this;
		}
		
		Tessellator.vec2.clamp = function (min, max){
			this[0] = this[0] < min[0] ? min[0] : (this[0] > max[0] ? max[0] : this[0]);
			this[1] = this[1] < min[1] ? min[0] : (this[1] > max[0] ? max[0] : this[1]);
			
			return this;
		}
		
		Tessellator.vec2.fract = function (){
			this[0] = this[0] - Math.floor(this[0]);
			this[1] = this[1] - Math.floor(this[1]);
			
			return this;
		}
		
		Tessellator.vec2.mix = function (vec2, l){
			if (isNaN(l)){
				this[0] = this[0] + l[0] * (vec2[0] - this[0]);
				this[1] = this[1] + l[1] * (vec2[1] - this[1]);
			}else{
				this[0] = this[0] + l * (vec2[0] - this[0]);
				this[1] = this[1] + l * (vec2[1] - this[1]);
			}
			
			return this;
		}
		
		Tessellator.vec2.set = function (x, y){
			this[0] = x;
			this[1] = y;
			
			return this;
		}
		
		Tessellator.vec2.add = function (vec){
			if (vec.constructor === Tessellator.vec2){
				this[0] += vec[0];
				this[1] += vec[1];
			}else{
				this[0] += vec;
				this[1] += vec;
			}
			
			return this;
		}
		
		Tessellator.vec2.subtract = function (vec){
			if (vec.constructor === Tessellator.vec2){
				this[0] -= vec[0];
				this[1] -= vec[1];
			}else{
				this[0] -= vec;
				this[1] -= vec;
			}
			
			return this;
		}
		
		Tessellator.vec2.multiply = function (vec){
			if (vec.constructor === Tessellator.vec2){
				this[0] *= vec[0];
				this[1] *= vec[1];
			}else{
				this[0] *= vec;
				this[1] *= vec;
			}
			
			return this;
		}
		
		Tessellator.vec2.divide = function (vec){
			if (vec.constructor === Tessellator.vec2){
				this[0] /= vec[0];
				this[1] /= vec[1];
			}else{
				this[0] /= vec;
				this[1] /= vec;
			}
			
			return this;
		}
		
		Tessellator.vec2.min = function (vec2){
			this[0] = Math.min(this[0], vec2[0]);
			this[1] = Math.min(this[1], vec2[1]);
			
			return this;
		}
		
		Tessellator.vec2.max = function (vec2){
			this[0] = Math.max(this[0], vec2[0]);
			this[1] = Math.max(this[1], vec2[1]);
			
			return this;
		}
		
		Tessellator.vec2.squaredDistance = function (vec2){
			var
				x = vec2[0] - this[0],
				y = vec2[1] - this[1];
			
			return x * x + y * y;
		}
		
		Tessellator.vec2.distance = function (vec2){
			return Math.sqrt(this.squaredDistance(vec2));
		}
		
		Tessellator.vec2.dot = function (vec2){
			return this[0] * vec2[0] + this[1] * vec2[1];
		}
		
		Tessellator.vec2.squaredLength = function (){
			return this.dot(this);
		}
		
		Tessellator.vec2.vecLength = function (){
			return Math.sqrt(this.squaredLength());
		}
		
		Tessellator.vec2.normalize = function (){
			var d = this.vecLength();
			this[0] /= d;
			this[1] /= d;
			
			return this;
		}
		
		Tessellator.vec2.invert = function (){
			this[0] = 1 / this[0];
			this[1] = 1 / this[1];
			
			return this;
		}
		
		Tessellator.vec2.negate = function (){
			this[0] = -this[0];
			this[1] = -this[1];
			
			return this;
		}
		
		Tessellator.vec2.lerp = function (vec2, l){
			this[0] = this[0] + l * (vec2[0] - this[0]);
			this[1] = this[1] + l * (vec2[1] - this[1]);
			
			return this;
		}
		
		Tessellator.vec2.random = function (scale){
			if (scale === undefined){
				scale = 1;
			}
			
			this[0] = Math.random() * scale;
			this[1] = Math.random() * scale;
			
			return this;
		}
		
		Tessellator.vec2.aspect = function (){
			return this[0] / this[1];
		}
		
		Tessellator.vec2.x = function (){
			return this[0];
		}
		
		Tessellator.vec2.y = function (){
			return this[1];
		}
		
		Tessellator.vec2.toString = function (){
			return "vec2(" + this[0] + ", " + this[1] + ")";
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
						error = "fragment shader problem: ";
					}else if (this.type === gl.VERTEX_SHADER){
						error = "vertex shader problem: ";
					}
					
					throw error + gl.getShaderInfoLog(this.shader);
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
	{ //
		Tessellator.PixelShader = function (tessellator, type){
			Tessellator.Shader.call(this, tessellator, type);
		}
		
		Tessellator.copyProto(Tessellator.PixelShader, Tessellator.Shader);
		
		Tessellator.PixelShader.prototype.onLink = function (shader){
			//this.renderer = new Tessellator.PixelShaderRenderer(this.tessellator, shader, )
			
			return false;
		}
	}
	{ //program
		Tessellator.Program = function (tessellator){
			this.tessellator = tessellator;
			
			this.linked = [];
			this.shader = this.tessellator.GL.createProgram();
			this.loaded = false;
			
			this.attribs = {};
			this.uniforms = {};
			
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
		
		Tessellator.Program.prototype.enableAttributes = function (){
			for (var obj in this.attribs){
				this.tessellator.GL.enableVertexAttribArray(this.attribs[obj]);
			}
		}
		
		Tessellator.Program.prototype.disableAttributes = function (){
			for (var obj in this.attribs){
				this.tessellator.GL.disableVertexAttribArray(this.attribs[obj]);
			}
		}
		
		Tessellator.Program.prototype.bindOES = function (){
			this.tessellator.extenstions.get("OES_vertex_array_object").bindVertexArrayOES(this.oes);
		}
		
		Tessellator.Program.prototype.unbindOES = function (){
			this.tessellator.extenstions.get("OES_vertex_array_object").bindVertexArrayOES(null);
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
				
				if (this.tessellator.extenstions.get("OES_vertex_array_object")){
					this.enable = this.bindOES;
					this.disable = this.unbindOES;
					
					this.enable();
					this.enableAttributes();
					this.disable();
				}else{
					this.enable = this.enableAttributes;
					this.disable = this.disableAttributes;
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
							preInherit: inherit.preInherit,
							location: gl.getUniformLocation(this.shader, name),
							shader: this,
							size: uniform.size,
							type: uniform.type,
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
		
		Tessellator.Program.prototype.uniform = function (key, value, matrix){
			var u = this.uniforms[key];
			
			if (u){
				u.configure(value, matrix);
				u.initialValue = false;
			}
		}
		
		Tessellator.Program.prototype.unify = function (matrix){
			for (var o in this.uniforms){
				var u = this.uniforms[o];
				
				if (!u.initialValue && u.inherit){
					u.inherit(matrix);
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
				u.configure = value.configure;
				u.preInherit = value.preInherit;
			}else{
				u = {};
				this.uniforms[key] = u;
				
				u.configure = value.configure;
				u.shader = this;
			}
			
			return this;
		}
		
		Tessellator.Program.prototype.dispose = function (){
			for (var i = 0; i < this.linked.length; i++){
				if (this.linked[i].disposable){
					this.linked[i].dispose();
				}
			}
			
			if (this.oes){
				this.tessellator.extenstions.get("OES_vertex_array_object").deleteVertexArrayOES(this.oes);
			}
			
			this.tessellator.GL.deleteProgram(this.shader);
			
			return this;
		}
		
		Tessellator.Program.prototype.init = function () {
			this.tessellator.GL.useProgram(this.shader);
			
			this.enable();
		}
		
		Tessellator.Program.prototype.postInit = function (){
			this.disable();
		}
		
		Tessellator.Program.prototype.set = function (){
			return true;
		}
		
		Tessellator.Program.prototype.postSet = Tessellator.EMPTY_FUNC;
	}
	{ //util
		Tessellator.prototype.loadDefaultShaderProgram = function (){
			return Tessellator.MODEL_VIEW_VERTEX_LIGHTING_SHADER.create(this);
		}

		Tessellator.prototype.loadShaderProgramFromCode = function (vertexShader, fragmentShader){
			return this.loadShaderProgram(this.getShader(vertexShader, this.GL.VERTEX_SHADER), this.getShader(fragmentShader, this.GL.FRAGMENT_SHADER));
		}
		
		Tessellator.prototype.loadShaderProgramFromDOM = function (vertexShader, fragmentShader){
			return this.loadShaderProgram(this.getShaderFromDOM(vertexShader), this.getShaderFromDOM(fragmentShader));
		}


		Tessellator.prototype.loadShaderProgram = function (vertexShader, fragmentShader){
			return new Tessellator.Program(this).link(vertexShader).link(fragmentShader).load();
		}
		
		Tessellator.prototype.createPixelShader = function (shader){
			if (shader.constructor == String){
				return new Tessellator.Program(this).link(this.getShader(Tessellator.PIXEL_SHADER_VERTEX_SHADER, this.GL.VERTEX_SHADER)).link(new Tessellator.Shader(this, Tessellator.FRAGMENT_SHADER).load(shader)).load();
			}else{
				return new Tessellator.Program(this).link(this.getShader(Tessellator.PIXEL_SHADER_VERTEX_SHADER, this.GL.VERTEX_SHADER)).link(shader).load();
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
			this.shader.tessellator.GL.uniform1f(this.location, this.value);
		}
		
		Tessellator.Program.UNIFY_WINDOW = function (){
			this.shader.tessellator.GL.uniform2fv(this.location, this.value);
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
		}
		
		Tessellator.Program.BIND_TEXTURE = function (render){
			if (this.value){
				this.shader.tessellator.GL.activeTexture(Tessellator.TEXTURE_SELECT_ENUM[this.value.index]);
				this.shader.tessellator.GL.uniform1i(this.location, this.value.index);
				
				this.value.bind(render);
			}else{
				this.shader.tessellator.GL.bindTexture(this.shader.tessellator.GL.TEXTURE_2D, null);
			}
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
			this.shader.tessellator.GL.uniformMatrix3fv(this.shader.uniforms.nMatrix.location, false, Tessellator.Program.lightNormalCache.normalFromMat4(this.value));
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
			
			this[Tessellator.SAMPLER_2D] = Tessellator.Program.BIND_TEXTURE;
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
		
		Tessellator.ShaderSetDrawDependant.prototype.set = function (matrix, render, draw){
			for (var i = 0, k = this.drawMode.length; i < k; i++){
				if (draw.drawMode === this.drawMode[i]){
					this.shader = this.shaders[i]
					this.uniforms = this.shader.uniforms;
					this.attribs = this.shader.attribs;
					
					if (this.shader.loaded){
						this.tessellator.GL.useProgram(this.shader.shader);
						
						this.shader.enable();
						
						return true;
					}else{
						return false;
					}
				}
			}
			
			return false;
		}
		
		Tessellator.ShaderSetDrawDependant.prototype.postSet = function (){
			this.shader.disable();
		}
		
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
		
		Tessellator.ShaderSetDrawDependant.prototype.uniform = function (key, value, matrix){
			this.shader.uniform(key, value, matrix);
		}
		
		Tessellator.ShaderSetDrawDependant.prototype.preUnify = function (key, value, matrix){
			this.shader.uniform(key, value, matrix);
		}
	}
	{ //shader preset
		Tessellator.ShaderPreset = function (create){
			this.create = create;
		}
		
		Tessellator.ShaderPreset.prototype.configureDrawDependant = function (svert1, sfrag1, svert2, sfrag2){
			this.create = function (tessellator){
				return new Tessellator.ShaderSetDrawDependant(
					[
						Tessellator.COLOR,
						Tessellator.TEXTURE
					],
					[
						tessellator.loadShaderProgramFromCode(svert1, sfrag1),
						tessellator.loadShaderProgramFromCode(svert2, sfrag2)
					]
				);
			}
			
			return this;
		}
		
		Tessellator.ShaderPreset.prototype.configureStandardPair = function (svert, sfrag){
			this.create = function (tessellator) {
				return tessellator.loadShaderProgramFromCode(svert, sfrag);
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


	Tessellator.prototype.getPointerLock = function (){
		return this.canvas.pointerLockElement ||
			this.canvas.mozPointerLockElement ||
			this.canvas.webkikPointerLockElement;
	}


	Tessellator.prototype.hasPointerLock = function (){
		if (this.getPointerLock() === this.canvas){
			return true;
		}
		
		return false;
	}


	Tessellator.prototype.aquirePointerLock = function (){
		if (this.getPointerLock() && this.getPointerLock() !== this.canvas){
			throw "cannot aquire a mouse lock that is already taken!";
		}
		
		if (this.getPointerLock() !== this.canvas){
			if (this.canvas.requestPointerLock) this.canvas.requestPointerLock();
			else if (this.canvas.mozRequestPointerLock) this.canvas.requestPointerLock();
			else if (this.canvas.webkitRequestPointerLock) this.canvas.requestPointerLock();
		}
	}


	Tessellator.prototype.releasePointerLock = function (){
		if (this.canvas.exitPointerLock) this.canvas.exitPointerLock();
		else if (this.canvas.mozExitPointerLock) this.canvas.mozExitPointerLock();
		else if (this.canvas.webkitExitPointerLock) this.canvas.webkitExitPointerLock();
	}
}
{ //render loop
	Tessellator.prototype.createRenderLoop = function (){
		var args = [this];
		Array.prototype.push.apply(args, arguments);
		
		return Tessellator.new.apply(Tessellator.RenderLoop, args);
	}
	
	Tessellator.RenderLoop = function (){
		this.tessellator = arguments[0];
		
		if (arguments.length === 4){
			this.renderer = arguments[2];
			this.model = arguments[1];
			
			this.maxFPS = arguments[3];
		}else if (arguments.length === 3){
			if (!isNaN(arguments[2])){
				this.renderer = null;
				this.model = arguments[1];
				this.maxFPS = arguments[2];
			}else{
				this.renderer = arguments[1];
				this.model = arguments[2];
				this.maxFPS = null;
			}
		}else if (arguments.length === 2){
			if (arguments[1].type === Tessellator.MODEL){
				this.renderer = null;
				this.model = arguments[1];
				this.maxFPS = null;
			}else{
				this.renderer = arguments[1];
				this.model = null;
				this.maxFPS = null;
			}
		}
		
		this.currentFPS = 0;
		this.predictedFPS = 0;
		this.renderTime = 0;
		this.idleTime = 0;
		
		this.frames = 0;
		this.lastFrames = 0;
		
		this.renderRequested = false;
		this.rendering = false;
		this.renderLoopRunning = false;
		this.disposed = false;
		this.constantRender = true;
		
		var self = this;
		
		this.FPSLoop = function (){
			if (self.disposed){
				return;
			}
			
			var deltaFrames = self.frames - self.lastFrames;
			self.lastFrames = self.frames;
			
			self.currentFPS = deltaFrames;
			
			window.setTimeout(self.FPSLoop, 1000);
		}


		this.frameLoop = function (){
			self.renderLoopRunning = true;
			
			if (self.rendering || self.disposed){
				self.renderLoopRunning = false;
				
				return;
			}else if (self.constantRender){
				self.renderLoopRunning = false;
				window.requestAnimationFrame(self.render);
				
				return;
			}
			
			if (self.renderRequested || self.constantRender){
				self.renderRequested = false;
				self.rendering = true;
				
				window.requestAnimationFrame(self.render);
			}
			
			window.setTimeout(self.frameLoop, Math.floor(1000 / self.maxFPS));
		}
		
		this.render = function (e){
			var now = Date.now();
			
			self.idleTime = now - self.lastRender;
			self.predictedFPS = 1000 / self.idleTime;
			self.lastRender = now;	
			
			self.frames++;
			
			if (self.renderer){
				self.renderer.render(null, self.model);
			}else{
				self.tessellator.renderModel(self.model);
			}
			
			self.renderTime = Date.now() - self.lastRender;
			
			self.rendering = false;
			if (!self.renderLoopRunning){
				if (self.constantRender){
					window.requestAnimationFrame(self.render);
				}else{
					self.frameLoop();
				}
			}
		}
		
		this.FPSLoop();
		this.frameLoop();
	}


	Tessellator.RenderLoop.prototype.dispose = function (){
		this.disposed = true;
	}


	Tessellator.RenderLoop.prototype.setModel = function (model){
		this.model = model;
		
		this.requestRender();
	}


	Tessellator.RenderLoop.prototype.setRenderer = function (renderer){
		this.renderer = renderer;
	}


	Tessellator.RenderLoop.prototype.requestRender = function (){
		this.renderRequested = true;
	}


	Tessellator.RenderLoop.prototype.getFPS = function (){
		return this.currentFPS;
	}


	Tessellator.RenderLoop.prototype.getRenderTime = function () {
		return this.renderTime;
	}


	Tessellator.RenderLoop.prototype.getFrames = function (){
		return this.frames;
	}


	Tessellator.RenderLoop.prototype.getMaxFPS = function (){
		return this.maxFPS;
	}


	Tessellator.RenderLoop.prototype.setMaxFPS = function (maxFPS){
		if (isNaN(this.maxFPS)){
			this.maxFPS = maxFPS;
			
			this.frameLoop();
		}else{
			this.maxFPS = maxFPS;
		}
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
	Tessellator.prototype.renderModel = function (model, renderer){
		if (!renderer){
			if (!this.defaultRenderer){
				this.defaultRenderer = new Tessellator.ModelViewRenderer(model.tessellator.loadDefaultShaderProgram());
			}
			
			renderer = this.defaultRenderer;
		}
		
		renderer.render(null, model);
	}


	Tessellator.RenderMatrix = function (renderer, parent){
		this.uniforms = {};
		this.renderer = renderer;
		this.tessellator = renderer.tessellator;
		this.parent = parent;
		
		if (parent){
			this.copyUniforms(parent.uniforms);
		}else{
			renderer.configure(this);
		}
	}
	
	Tessellator.RenderMatrix.prototype.copyUniforms = function (uniforms){
		for (var o in uniforms){
			this.uniforms[o] = uniforms[o];
		}
	}
	
	Tessellator.RenderMatrix.prototype.isDuplicate = function (key){
		return this.parent && this.parent.uniforms[key] === this.uniforms[key];
	}
	
	Tessellator.RenderMatrix.prototype.set = function (key, value){
		this.uniforms[key] = value;
	}
	
	Tessellator.RenderMatrix.prototype.get = function (key){
		return this.uniforms[key];
	}


	Tessellator.RenderMatrix.prototype.unify = function (){
		var s = this.renderer.shader;
		
		for (var o in this.uniforms){
			s.uniform(o, this.uniforms[o], this);
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
			if (shader.constructor === Tessellator){
				this.tessellator = shader;
			}else{
				this.tessellator = shader.tessellator;
				this.shader = shader;
			}
		}
		
		Tessellator.RendererAbstract.prototype.setShader = function (shader){
			if (shader.tessellator === tessellator){
				this.shader = shader;
			}else{
				throw "incompatible shader";
			}
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
			if (this.uniformSetter){
				this.uniformSetter(matrix);
			}
		}
		
		Tessellator.RendererAbstract.prototype.enableRenderer = function (){
			this.shader.init(this);
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
		
		Tessellator.RendererAbstract.prototype.handleDefault = function (mod, matrix, model){
			if (mod.type === Tessellator.MODEL){
				if (mod.render){
					if (mod.renderer){
						var copy = new Tessellator.RenderMatrix(mod.renderer);
						copy.copyUniforms(matrix.uniforms)
						
						copy.set("mvMatrix", copy.get("mvMatrix").clone());
						
						this.disableRenderer();
						mod.renderer.renderNew(copy, mod);
						this.enableRenderer();
					}else{
						var copy = matrix.copy();
						
						copy.set("mvMatrix", copy.get("mvMatrix").clone());
						
						this.renderRaw(copy, mod);
					}
				}
				
				return true;
			}else if (mod.subtype === Tessellator.VERTEX){
				if (this.shader.set(this, matrix, mod)){
					matrix.unify();
					
					mod.apply(matrix, model);
					
					this.shader.postSet(this, matrix, mod);
				}
				
				return true;
			}
			
			return false;
		}
	}
	{ //model view renderer
		Tessellator.ModelViewRenderer = function (shader){
			this.super(shader);
		}
		
		Tessellator.copyProto(Tessellator.ModelViewRenderer, Tessellator.RendererAbstract);
		
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
							index = this.setLighting(action, matrix.clone(), lighting, index);
						}
					}
				}
				
				return index;
			}
		}
		
		Tessellator.ModelViewRenderer.prototype.configure = function (matrix){
			this.shader.setInheriter("mvMatrix", Tessellator.Program.MV_MATRIX_UNIFY_FUNC);
			this.shader.setInheriter("window", Tessellator.Program.UNIFY_WINDOW);
			
			matrix.set("mvMatrix", Tessellator.mat4());
			matrix.set("window", Tessellator.vec2(this.tessellator.width, this.tessellator.height));
			matrix.set("mask", Tessellator.vec4(1, 1, 1, 1));
			matrix.set("clip", Tessellator.NO_CLIP);
			matrix.set("lights", Tessellator.NO_LIGHT);
			matrix.set("specular", 0);
			
			this.super.configure(matrix);
		}
		
		Tessellator.ModelViewRenderer.prototype.init = function (matrix, model){
			if (model.actions){
				model.finish();
			}else if (!model.render){
				return false;
			}
			
			var lighting = new Float32Array(Tessellator.MODEL_VIEW_LIGHT_UNIFORM_SIZE * 4);
			
			this.setLighting(model, null, lighting);
			
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
		
		Tessellator.copyProto(Tessellator.ModelViewNoLightingRenderer, Tessellator.RendererAbstract);
		
		Tessellator.ModelViewNoLightingRenderer.prototype.configure = function (matrix){
			this.shader.setInheriter("window", Tessellator.Program.UNIFY_WINDOW);
			
			matrix.set("mvMatrix", Tessellator.mat4());
			matrix.set("window", Tessellator.vec2(this.tessellator.width, this.tessellator.height));
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
					}
				}
			}
		}
	}
	{ //depth map renderer
		Tessellator.DepthMapRenderer = function (shader){
			this.super(shader);
		}
		
		Tessellator.copyProto(Tessellator.DepthMapRenderer, Tessellator.RendererAbstract);
		
		Tessellator.DepthMapRenderer.prototype.configure = function (matrix){
			this.shader.setInheriter("window", Tessellator.Program.UNIFY_WINDOW);
			
			matrix.set("mvMatrix", Tessellator.mat4());
			matrix.set("window", Tessellator.vec2(this.tessellator.width, this.tessellator.height));
			
			this.super.configure(matrix);
		}
		
		Tessellator.DepthMapRenderer.prototype.renderRaw = function (renderMatrix, model){
			for (var i = 0, k = model.model.length; i < k; i++){
				var mod = model.model[i];
				
				if (!this.handleDefault(mod, renderMatrix, model)){
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
					}
				}
			}
		}
	}
	{ //full screen renderer
		Tessellator.FullScreenRenderer = function (shader){
			this.super(shader);
			
			{
				var gl = this.tessellator.GL;
				
				this.vertexPos = gl.createBuffer();
				
				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPos);
				gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([
					-1, -1,
					1, -1,
					1, 1,
					-1, 1
				]), gl.STATIC_DRAW);
				
				this.texturePos = gl.createBuffer();
				
				this.indices = gl.createBuffer();
				
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([
					0, 1, 2,
					0, 2, 3,
				]), gl.STATIC_DRAW);
			}
		}
		
		Tessellator.copyProto(Tessellator.FullScreenRenderer, Tessellator.RendererAbstract);
		
		Tessellator.FullScreenRenderer.prototype.renderRaw = function (matrix){
			matrix.unify();
			
			var gl = this.tessellator.GL;
			
			gl.disable(gl.DEPTH_TEST);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPos);
			gl.vertexAttribPointer(this.shader.attribs.position, 2, gl.BYTE, false, 0, 0);
			
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
			
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
			
			gl.enable(gl.DEPTH_TEST);
		}
	}
	{ //full screen texture renderer
		Tessellator.FullScreenTextureRenderer = function (shader, texture){
			this.super(shader);
			
			this.texture = texture;
		}
		
		Tessellator.copyProto(Tessellator.FullScreenTextureRenderer, Tessellator.FullScreenRenderer);
		
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
		
		Tessellator.FullScreenTextureRenderer.prototype.configure = function (matrix){
			this.shader.setInheriter("window", Tessellator.Program.UNIFY_WINDOW);
			
			matrix.set("window", Tessellator.vec2(this.tessellator.width, this.tessellator.height));
			
			this.super.configure(matrix);
		}
		
		Tessellator.FullScreenTextureRenderer.prototype.renderRaw = function (render, arg){
			if (this.texture.autoUpdate){
				this.texture.update(render);
			}
				
			render.set("sampler", this.texture);
			
			this.super.renderRaw(render, arg);
		}
	}
	{ //buffer renderer
		Tessellator.BufferedRenderer = function (shader, renderer, res, bufferAttachments){
			this.super(shader);
			
			this.rendererAttachment = new Tessellator.TextureModel.AttachmentRenderer(renderer);
			this.res = Tessellator.vec2(res || 1);
			this.bufferAttachments = bufferAttachments;
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
		
		Tessellator.BufferedRenderer.prototype.configure = function (matrix){
			this.shader.setInheriter("window", Tessellator.Program.UNIFY_WINDOW);
			
			matrix.set("window", Tessellator.vec2(this.tessellator.width, this.tessellator.height));
			
			this.super.configure(matrix);
		}
		
		Tessellator.BufferedRenderer.prototype.renderRaw = function (render, arg){
			if (!this.buffer){
				this.buffer = new Tessellator.TextureModel(this.tessellator, render.get("window")[0] * this.res[0], render.get("window")[1] * this.res[1], this.bufferAttachments || [
					new Tessellator.TextureModel.AttachmentColor(),
					new Tessellator.TextureModel.AttachmentDepth(),
					this.rendererAttachment
				]);
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
			
			this.tessellator.GL.clear(this.tessellator.GL.COLOR_BUFFER_BIT);
			
			this.super.renderRaw(render, arg);
		}
	}
	{ //pixel shader renderer
		Tessellator.PixelShaderRenderer = function (shader, renderer, resolutionScale){
			this.super(shader, renderer, resolutionScale);
			
			this.startTime = Date.now();
		}
		
		Tessellator.copyProto(Tessellator.PixelShaderRenderer, Tessellator.BufferedRenderer);
		
		Tessellator.PixelShaderRenderer.prototype.configure = function (matrix){
			Tessellator.BufferedRenderer.prototype.configure.call(this, matrix);
			
			matrix.set("time", (Date.now() - this.startTime) / 1000);
			
			this.super.configure(matrix);
		}
	}
	{ //atlas renderer
		Tessellator.AtlasRenderer = function (shader, atlas){
			this.super(shader);
			
			this.atlas = atlas;
		}
		
		Tessellator.copyProto(Tessellator.AtlasRenderer, Tessellator.FullScreenRenderer);
		
		Tessellator.AtlasRenderer.prototype.NO_MASK = Tessellator.vec4(1, 1, 1, 1);
		
		Tessellator.AtlasRenderer.prototype.configure = function (matrix){
			this.shader.setInheriter("window", Tessellator.Program.UNIFY_WINDOW);
			
			matrix.set("atlasDims", Tessellator.vec2(this.atlas.length, this.atlas[0].length));
		}
		
		Tessellator.AtlasRenderer.prototype.renderRaw = function (render, arg){
			this.tessellator.GL.disable(Tessellator.DEPTH_TEST);
			
			for (var x = 0, xk = this.atlas.length; x < xk; x++){
				for (var y = 0, yk = this.atlas[x].length; y < yk; y++){
					var textures = this.atlas[x][y];
					
					if (textures){
						render.set("atlas", Tessellator.vec2(x, y));
						
						for (var i = 0; i < textures.length; i++){
							if (textures[i].mask){
								render.set("mask", textures[i].mask);
							}else{
								render.set("mask", this.NO_MASK);
							}
							
							render.set("sampler", textures[i].texture);
							this.super.renderRaw(render, arg);
						}
					}
				}
			}
			
			this.tessellator.GL.enable(Tessellator.DEPTH_TEST);
		}
	}
}
{ //initializer
	Tessellator.Initializer = function (tessellator, inheritFrom){
		this.tessellator = tessellator;
		
		this.model = [];
		
		this.finished = false;
		this.shape = null;
		
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
		
		this.triangleShape = null;
		this.texturedTriangleShapes = [];
	}
	
	Tessellator.Initializer.prototype.get = function (key){
		return this.attribs[key];
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
{ //model
	{ //model
		Tessellator.prototype.createModel = function (){
			return new Tessellator.Model(this);
		}
		
		Tessellator.prototype.createMatrix = Tessellator.prototype.createModel;
		
		Tessellator.Model = function (tessellator, renderer){
			this.type = Tessellator.MODEL;
			
			this.render = false;
			this.disposable = true;
			this.disposed = false;
			this.renderer = renderer;
			
			this.tessellator = tessellator;
			
			this.matrixStack = [];
		}
		
		Tessellator.Model.prototype.remove = function (obj){
			if (this.model){
				if (isNaN(obj)){
					this.model.splice(obj, 1)
				}else{
					if (obj && this.parent){
						this.parent.remove(this);
					}else{
						this.model.splice(this.model.indexOf(obj), 1);
					}
				}
			}
		}
		
		Tessellator.Model.prototype.apply = function (render){
			if (this.render){
				render.render(this);
			}
		}
		
		Tessellator.Model.prototype.postInit = Tessellator.EMPTY_FUNC;


		Tessellator.Model.prototype.init = function (interpreter){
			interpreter.flush();
		}
		
		Tessellator.Model.prototype.push = function (renderer){
			var matrix = new Tessellator.Model(this.tessellator, renderer);
			
			if (this.matrixStack.length){
				matrix.parent = this.matrixStack[this.matrixStack.length - 1];
			}else{
				matrix.parent = this;
			}
			
			this.add(matrix);
			this.matrixStack.push(matrix);
			
			return matrix;
		}


		Tessellator.Model.prototype.pop = function () {
			if (!this.matrixStack.length){
				throw "cannot pop from a empty matrix stack!";
			}
			
			return this.matrixStack.pop().update();
		}


		Tessellator.Model.prototype.createModel = function() {
			var matrix = new Tessellator.Model(this.tessellator);
			matrix.render = false;
			
			this.add(matrix);
			
			return matrix;
		}
		
		Tessellator.Model.prototype.createMatrix = Tessellator.Model.prototype.createModel;


		Tessellator.Model.prototype.add = function (action){
			if (!action){
				throw "null pointer";
			}
			
			var matrix;
			
			if (this.matrixStack.length){
				matrix = this.matrixStack[this.matrixStack.length - 1];
			}else{
				matrix = this;
			}
			
			if (!matrix.actions){
				matrix.disposeShallow();
				this.disposed = false;
				
				matrix.actions = new Tessellator.Initializer(matrix.tessellator, matrix.parent ? matrix.parent.actions : null);
			}
			
			matrix.actions.push(action);
			return action;
		}


		Tessellator.Model.prototype.finish = function (){
			if (this.matrixStack.length){
				throw "cannot finish a model with items in the matrixStack!";
			}
			
			this.disposed = false;
			
			if (this.actions){
				this.model = this.actions.finish();
				this.actions = null;
				
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
					
					if (mod.type === Tessellator.TEXTURE){
						if (mod.texture && mod.texture.disposable){
							mod.texture.dispose();
						}
					}else if (mod.subtype === Tessellator.VERTEX){
						if (mod.disposable){
							mod.dispose();
						}
					}else if (mod.type === Tessellator.MODEL){
						if (mod.disposable){
							mod.dispose();
						}
					}
				}
				
				this.model = null;
			}
		}


		Tessellator.Model.prototype.disposeShallow = function (){
			this.render = false;
			this.disposed = true;
			
			if (this.model){
				for (var i = 0, k = this.model.length; i < k; i++){
					var mod = this.model[i];
					
					if (mod.type === Tessellator.TEXTURE){
						if (mod.texture && mod.texture.disposable){
							mod.texture.dispose();
						}
					}else if (mod.subtype === Tessellator.VERTEX){
						if (mod.disposable){
							mod.dispose();
						}
					}
				}
				
				this.model = null;
			}
		}


		Tessellator.Model.prototype.createTexture = function (width, height, filter){
			return new Tessellator.TextureModel(this.tessellator, width, height, [
				new Tessellator.TextureModel.AttachmentColor(filter),
				new Tessellator.TextureModel.AttachmentDepth(),
				new Tessellator.TextureModel.AttachmentModel(this)
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
					}else if (this.model[i].constructor === Tessellator.TextureModel){
						count += this.model[i].model.countRenderItems();
					}
					
					count++;
				}
			}
			
			return count;
		}
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


		/*Tessellator.MODEL.prototype.fillTriPrism = function (x1, y1, z1, x2, y2, z2){
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
			if (!quality){
				quality = Math.max(8, radius * 16);
			}
			
			this.start(Tessellator.TRIANGLE_FAN_CCW);
			for (var i = 0; i <= quality; i++){
				if (i === 0){
					this.setVertex(x, y, 0);
					
					{
						var angle = ((i + 1) / quality * (Math.PI * 2));
						
						var xx = Math.sin(angle) * radius;
						var yy = Math.cos(angle) * radius;
						
						this.setVertex(xx + x, yy + y, 0);
					}
				}
				
				{
					var angle = (i / quality * (Math.PI * 2));
					
					var xx = Math.sin(angle) * radius;
					var yy = Math.cos(angle) * radius;
					
					this.setVertex(xx + x, yy + y, 0);
				}
			}
			this.end();
		}


		Tessellator.Model.prototype.fillSphere = function (x, y, z, radius, quality){
			if (!quality){
				quality = Math.max(4, radius * 16);
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
					
					vertices.push(xx * radius + x);
					vertices.push(yy * radius + y);
					vertices.push(zz * radius + z);
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


		Tessellator.Model.prototype.fillRect = function (x, y, width, height){
			this.start(Tessellator.QUAD);
			this.setVertex([
				x, -y - height, 0,
				x + width, -y - height, 0,
				x + width, -y, 0,
				x, -y, 0,
			]);
			this.end();
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
		
		Tessellator.Scale = function (x, y, z){
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
			}else if (arguments.length === 4){
				this.degree = arguments[0];
				
				this.vec = Tessellator.vec3(arguments[1], arguments[2], arguments[3]);
			}else{
				throw "invalid arguments in Tessellator.rotate()";
			}
		}


		Tessellator.Rotate.prototype.apply = function (render){
			var m = render.get("mvMatrix");


			this.set(m);
		}


		Tessellator.Rotate.prototype.set = function (m){
			m.rotate(this.degree, this.vec)
		}


		Tessellator.Rotate.prototype.init = function (interpreter){
			interpreter.flush();
		}
		
		Tessellator.Rotate.prototype.postInit = Tessellator.EMPTY_FUNC;
	}
	{ //clear
		Tessellator.Model.prototype.clear = function (){
			this.add(new Tessellator.Clear());
		}
		
		Tessellator.Clear = function () {
			this.type = Tessellator.CLEAR;
		}


		Tessellator.Clear.prototype.apply = function (render){
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
			return this.add(new Tessellator.Mask(this.getColor.apply(this, arguments)));
		}
		
		Tessellator.Mask = function (){
			this.type = Tessellator.MASK;
			
			if (arguments.length === 4){
				this.mask = Tessellator.vec4(arguments);
			}else if (arguments.length === 1){
				if (arguments[0].constructor === Tessellator.Color){
					this.mask = Tessellator.vec4(
						arguments[0].r,
						arguments[0].g,
						arguments[0].b,
						arguments[0].a
					);
				}else{
					this.mask = Tessellator.vec4(
						arguments[0][0],
						arguments[0][1],
						arguments[0][2],
						arguments[0][3]
					);
				}
			}
		}


		Tessellator.Mask.prototype.init = function (interpreter){
			if (interpreter.get("textureBounds")){
				if (interpreter.shape){
					throw "cannot change mask while shape is being drawn";
				}
				
				if (interpreter.texturedTriangleShapes[interpreter.get("textureBounds").texture.id]){
					interpreter.flushTexture(interpreter.get("textureBounds").texture.id);
				}
				
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


		Tessellator.Mask.prototype.apply = function (render){
			render.set("mask", this.mask);
		}
		
		Tessellator.Mask.prototype.postInit = Tessellator.EMPTY_FUNC;
	}
	{ //color
		Tessellator.Initializer.setDefault("color", function () {
			return Tessellator.DEFAULT_COLOR;
		});
	
		Tessellator.Model.prototype.setColor = function (){
			return this.add(this.getColor.apply(this, arguments));
		}
		
		Tessellator.Model.prototype.getColor = function (){
			var color;
			
			if (arguments.length === 4){
				color = new Tessellator.Color(arguments[0], arguments[1], arguments[2], arguments[3]);
			}else if (arguments.length === 3){
				color = new Tessellator.Color(arguments[0], arguments[1], arguments[2], 1);
			}else if (arguments.length === 2){
				color = new Tessellator.Color(arguments[0], arguments[0], arguments[0], arguments[1]);
			}else if (arguments.length === 1){
				var arg = arguments[0];
				
				if (!isNaN(arg)){
					var red = ((arg >> 16) & 0xFF) / 255;
					var green = ((arg >> 8) & 0xFF) / 255;
					var blue = ((arg >> 0) & 0xFF) / 255;
					
					color = new Tessellator.Color(red, green, blue, 1);
				}else if (arg.constructor === Array){
					color = new Tessellator.Color(arg[0], arg[1], arg[2], arg[3]);
				}else if (arg.constructor === Tessellator.Color){
					color = arg;
				}else if (arg.length === 9 && arg.chatAt(0) === '#'){
					var red = parseInt(arg.substring(1, 3), 16) / 256;
					var green = parseInt(arg.substring(3, 5), 16) / 256;
					var blue = parseInt(arg.substring(5, 7), 16) / 256;
					var alpha = parseInt(arg.substring(7, 9), 16) / 256;
					
					color = new Tessellator.Color(red, green, blue, alpha);
				}else if (arg.length === 7 && arg.charAt(0) === '#'){
					var red = parseInt(arg.substring(1, 3), 16) / 256;
					var green = parseInt(arg.substring(3, 5), 16) / 256;
					var blue = parseInt(arg.substring(5, 7), 16) / 256;
					
					color = new Tessellator.Color(red, green, blue, 1);
				}else if (arg.length === 4 && arg.charAt(0) === '#'){
					var red = parseInt(arg.substring(1, 2), 16) / 16;
					var green = parseInt(arg.substring(2, 3), 16) / 16;
					var blue = parseInt(arg.substring(3, 4), 16) / 16;
					
					color = new Tessellator.Color(red, green, blue, 1);
				}else if (arg.length === 5 && arg.charAt(0) === '#'){
					var red = parseInt(arg.substring(1, 2), 16) / 16;
					var green = parseInt(arg.substring(2, 3), 16) / 16;
					var blue = parseInt(arg.substring(3, 4), 16) / 16;
					var alpha = parseInt(arg.substring(4, 5), 16) / 16;
					
					color = new Tessellator.Color(red, green, blue, alpha);
				}else{
					color = Tessellator.COLORS[arg.toUpperCase()];
				}
			}else{
				throw "too many arguments";
			}
			
			return color;
		}
		
		Tessellator.Color = function (r, g, b, a){
			this.type = Tessellator.COLOR;
			
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a;
		}


		Tessellator.Color.prototype.array = function (){
			if (!this.cachedArray){
				this.cachedArray = [this.r, this.g, this.b, this.a];
			}
			
			return this.cachedArray;
		}


		Tessellator.Color.prototype.init = function (interpreter){
			if (interpreter.shape){
				throw "cannot change color while drawing";
			}
			
			if (interpreter.get("draw") !== Tessellator.COLOR){
				interpreter.flush();
				
				interpreter.set("draw", Tessellator.COLOR);
			}
			
			interpreter.set("textureBounds", null);
			interpreter.set("color", this);
			
			return null;
		}


		Tessellator.Color.prototype.apply = Tessellator.EMPTY_FUNC;
		
		Tessellator.Color.prototype.postInit = Tessellator.EMPTY_FUNC;
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
		Tessellator.Model.prototype.start = function (type, drawType){
			return this.add(new Tessellator.Start(this, type, drawType));
		}
		
		Tessellator.Start = function (model, shapeType, drawType) {
			this.model = model;
			this.type = shapeType;
			this.subtype = Tessellator.VERTEX;
			
			this.drawType = drawType || Tessellator.STATIC;
			
			this.matrix = null;
			
			this.items = 0;
			
			this.disposed = false;
			this.disposable = true;
		}


		Tessellator.Start.prototype.init = function (interpreter){
			if (interpreter.shape !== null){
				throw "cannot start new draw if the old one did not end yet";
			}else if (!this.type){
				throw "nothing to start";
			}
			
			this.drawMode = interpreter.get("draw");
			
			if (this.type === Tessellator.TEXTURE){
				if (interpreter.get("textureBounds")){
					interpreter.get("textureBounds").bounds = null;
				}
			}
			
			interpreter.shape = this;
			return null;
		}
		
		
		Tessellator.Start.prototype.dispose = function (){
			if (this.tessellator && !this.disposed){
				this.tessellator.GL.deleteBuffer(this.vertices);
				this.tessellator.GL.deleteBuffer(this.colors);
				this.tessellator.GL.deleteBuffer(this.normals);
				
				this.tessellator.GL.deleteBuffer(this.vertexIndexes);
				
				this.disposed = true;
			}
		}
		
		Tessellator.Start.prototype.apply = function (render){
			var gl = render.tessellator.GL;
			
			{
				var s = render.renderer.shader.attribs;
				
				if (s.position !== undefined){
					gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
					gl.vertexAttribPointer(s.position, 3, gl.FLOAT, false, 0, 0);
				}
				
				if (s.color !== undefined){
					gl.bindBuffer(gl.ARRAY_BUFFER, this.colors);
					
					if (this.drawMode === Tessellator.COLOR){
						gl.vertexAttribPointer(s.color, 4, gl.UNSIGNED_BYTE, true, 0, 0);
					}else{
						gl.vertexAttribPointer(s.color, 2, gl.FLOAT, false, 0, 0);
					}
				}
				
				if (s.normal !== undefined){
					gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
					gl.vertexAttribPointer(s.normal, 3, gl.FLOAT, false, 0, 0);
				}
			}
			
			if (this.vertexIndexes){
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexes);
				
				if (this.type === Tessellator.TRIANGLE){
					gl.drawElements(gl.TRIANGLES, this.items, gl.UNSIGNED_SHORT, 0);
				}else if (this.type === Tessellator.POINT){
					gl.drawElements(gl.POINT, this.items, gl.UNSIGNED_SHORT, 0);
				}else if (this.type === Tessellator.LINE){
					gl.drawElements(gl.LINES, this.items, gl.UNSIGNED_SHORT, 0);
				}else if (this.type === Tessellator.LINE_STRIP){
					gl.drawElements(gl.LINE_STRIP, this.items, gl.UNSIGNED_SHORT, 0);
				}else if (this.type === Tessellator.LINE_LOOP){
					gl.drawElements(gl.LINE_LOOP, this.items, gl.UNSIGNED_SHORT, 0);
				}
			}else{
				if (this.type === Tessellator.TRIANGLE){
					gl.drawArrays(gl.TRIANGLES, 0, this.items);
				}else if (this.type === Tessellator.POINT){
					gl.drawArrays(gl.POINT, 0, this.items);
				}else if (this.type === Tessellator.LINE){
					gl.drawArrays(gl.LINES, 0, this.items);
				}else if (this.type === Tessellator.LINE_STRIP){
					gl.drawArrays(gl.LINE_STRIP, 0, this.items);
				}else if (this.type === Tessellator.LINE_LOOP){
					gl.drawArrays(gl.LINE_LOOP, 0, this.items);
				}
			}
		}
		
		Tessellator.Start.prototype.postInit = function (interpreter){
			if (interpreter.shape){
				throw "cannot finish a matrix when there are sill objects being drawn!";
			}
			
			//upload everything to GPU
			
			this.end = this.vertices.length / 3;
			this.verticesLength = this.vertices.length;
			this.colorsLength = this.colors.length;
			this.normalsLength = this.normals.length;
			
			if (this.vertexIndexes){
				this.indexLength = this.vertexIndexes.length;
				
				if (this.indexLength < this.items){
					console.error("the requested amount of items to render is too big. Will fall off the buffer")
				}
			}
			
			{
				var gl = interpreter.tessellator.GL;
				
				var draw;
				
				if (this.drawType === Tessellator.DYNAMIC){
					draw = gl.DYNAMIC_DRAW;
				}else{
					draw = gl.STATIC_DRAW;
				}
				
				{
					if (this.vertices.constructor !== Float32Array){
						this.vertices = new Float32Array(this.vertices);
					}
					
					var vertexArray = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, vertexArray);
					gl.bufferData(gl.ARRAY_BUFFER, this.vertices, draw);
					this.vertices = vertexArray;
				}
				
				if (this.drawMode === Tessellator.COLOR){
					if (this.colors.constructor !== Uint8Array){
						this.colors = new Uint8Array(this.colors);
					}
					
					var colorArray = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, colorArray);
					gl.bufferData(gl.ARRAY_BUFFER, this.colors, draw);
					this.colors = colorArray;
				}else{
					if (this.colors.constructor !== Float32Array){
						this.colors = new Float32Array(this.colors);
					}
					
					var colorArray = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, colorArray);
					gl.bufferData(gl.ARRAY_BUFFER, this.colors, draw);
					this.colors = colorArray;
				}
				
				{
					if (this.normals.constructor !== Float32Array){
						this.normals = new Float32Array(this.normals);
					}
					
					var normalArray = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, normalArray);
					gl.bufferData(gl.ARRAY_BUFFER, this.normals, draw);
					this.normals = normalArray;
				}
				
				if (this.vertexIndexes){
					if (this.vertexIndexes.constructor !== Uint16Array){
						this.vertexIndexes = new Uint16Array(this.vertexIndexes);
					}
					
					var indexArray = gl.createBuffer();
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexArray);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexes, draw);
					this.vertexIndexes = indexArray;
				}
			}
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
			
			if (this.drawType === Tessellator.DYNAMIC && end){
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
				
				{
					var gl = this.parent.model.tessellator.GL;
					
					gl.bindBuffer(gl.ARRAY_BUFFER, this.parent.colors);
					gl.bufferSubData(gl.ARRAY_BUFFER, this.start * 4, array);
				}
			}
			
			Tessellator.Start.Subsection.prototype.setVertex = function (){
				var vertices;
				
				if (arguments.length === 1){
					vertices = arguments[0];
				}else{
					vertices = arguments;
				}
				
				if (vertices.constructor !== Float32Array){
					vertices = new Float32Array(vertices);
				}
				
				{
					var gl = this.parent.model.tessellator.GL;
					
					gl.bindBuffer(gl.ARRAY_BUFFER, this.parent.vertices);
					gl.bufferSubData(gl.ARRAY_BUFFER, this.start * 3 * 4, vertices);
				}
			}
		}
	}
	{ //end
		Tessellator.Model.prototype.end = function (indexBuffer){
			return this.add(new Tessellator.End(indexBuffer));
		}
		
		Tessellator.End = function (indicies){
			this.type = Tessellator.END;
			this.indicies = indicies
		}


		Tessellator.End.prototype.init = function (interpreter){
			if (interpreter.shape === null){
				throw "cannot end a draw that had not started yet";
			}
			
			var textureBounds = interpreter.get("textureBounds");
			
			if (interpreter.shape.type === Tessellator.TEXTURE){
				if (textureBounds){
					textureBounds.bounds = interpreter.shape.vertices;
					textureBounds.defaultBounds = false;
				}
			}else if (interpreter.shape.type === Tessellator.NORMAL){
				interpreter.normals = interpreter.shape.vertices;
			}else if (interpreter.shape.type === Tessellator.POINT){
				interpreter.model.push(interpreter.shape);
			}else{
				var vertexIndexes = [];
				
				var vertexOffset = 0;
				var shapeAddon;
				
				if (textureBounds){
					shapeAddon = interpreter.texturedTriangleShapes[textureBounds.texture.id];
				}else{
					shapeAddon = interpreter.triangleShape;
				}
				
				if (shapeAddon){
					vertexOffset = shapeAddon.vertices.length / 3;
				}
				
				if (this.indicies){
					if (interpreter.shape.type !== Tessellator.TRIANGLE){
						throw "vertex buffers only supported with triangles";
					}
					
					vertexIndexes = this.indicies;
					
					for (var i = 0, k = vertexIndexes.length; i < k; i++){
						vertexIndexes[i] += vertexOffset;
					}
					
					if (textureBounds){
						if (textureBounds.defaultBounds){
							var bounds = [];
							
							for (var i = 0, k = interpreter.shape.vertices.length; i < k; i++){
								bounds = [
														  0,                       0,
									textureBounds.bounds[0],                       0,
									textureBounds.bounds[1], textureBounds.bounds[1],
								];
							}
							
							interpreter.shape.colors = bounds;
						}else{
							interpreter.shape.colors = textureBounds.bounds;
						}
					}
				}else if (interpreter.shape.type === Tessellator.LINE){
					if (interpreter.shape.vertices.length % 6 !== 0){
						throw "invalid number of vertices for line draw!";
					}
					
					interpreter.shape.normals = new Float32Array(interpreter.shape.items * 3);
					
					var lineWidth = interpreter.get("lineWidth");
					
					var colors = [];
					var vertices = [];
					
					for (var i = 0, k = interpreter.shape.vertices.length / 3 / 2; i < k; i++){
						var p1x = interpreter.shape.vertices[i * 3 * 2 + 0];
						var p1y = interpreter.shape.vertices[i * 3 * 2 + 1];
						var p1z = interpreter.shape.vertices[i * 3 * 2 + 2];
						
						var p2x = interpreter.shape.vertices[i * 3 * 2 + 3];
						var p2y = interpreter.shape.vertices[i * 3 * 2 + 4];
						var p2z = interpreter.shape.vertices[i * 3 * 2 + 5];
						
						//find the slope then the angle of the line. ignore z dimension
						var angle = Math.atan((p2y - p1y) / (p2x - p1x)) + Math.PI / 2; //rise over run
						
						var sin = Math.sin(angle);
						var cos = Math.cos(angle);
						
						if (p1x > p2x){
							cos = -cos;
							sin = -sin;
						}
						
						Array.prototype.push.apply(vertices, [
							p1x + (lineWidth / 2) * cos, p1y + (lineWidth / 2) * sin, p1z,
							p1x - (lineWidth / 2) * cos, p1y - (lineWidth / 2) * sin, p1z,
							p2x - (lineWidth / 2) * cos, p2y - (lineWidth / 2) * sin, p2z,
							p2x + (lineWidth / 2) * cos, p2y + (lineWidth / 2) * sin, p2z,
						]);
						
						Array.prototype.push.apply(colors, [
							interpreter.shape.colors[i * 4 * 2],
							interpreter.shape.colors[i * 4 * 2 + 1],
							interpreter.shape.colors[i * 4 * 2 + 2],
							interpreter.shape.colors[i * 4 * 2 + 3],
							
							interpreter.shape.colors[i * 4 * 2],
							interpreter.shape.colors[i * 4 * 2 + 1],
							interpreter.shape.colors[i * 4 * 2 + 2],
							interpreter.shape.colors[i * 4 * 2 + 3],
							
							interpreter.shape.colors[i * 4 * 2 + 4],
							interpreter.shape.colors[i * 4 * 2 + 5],
							interpreter.shape.colors[i * 4 * 2 + 6],
							interpreter.shape.colors[i * 4 * 2 + 7],
							
							interpreter.shape.colors[i * 4 * 2 + 4],
							interpreter.shape.colors[i * 4 * 2 + 5],
							interpreter.shape.colors[i * 4 * 2 + 6],
							interpreter.shape.colors[i * 4 * 2 + 7],
						]);
						
						Array.prototype.push.apply(vertexIndexes, [
							0 + i * 4 + vertexOffset,
							1 + i * 4 + vertexOffset,
							2 + i * 4 + vertexOffset,
							
							0 + i * 4 + vertexOffset,
							2 + i * 4 + vertexOffset,
							3 + i * 4 + vertexOffset,
						]);
					}
					
					interpreter.shape.colors = colors;
					interpreter.shape.vertices = vertices;
				}else if (interpreter.shape.type === Tessellator.POLYGON){
				
				}else if (interpreter.shape.type === Tessellator.QUAD){
					var k = interpreter.shape.vertices.length;
					
					var colorOff = interpreter.shape.colors ? interpreter.shape.colors.length / (4 * 4) : 0;
					
					if (k % 12 !== 0){
						throw "invalid number of vertices for quad draw!";
					}else{
						k /= 3 * 4;
					}
					
					for (var i = 0; i < k; i++){
						Array.prototype.push.apply(vertexIndexes, [
							0 + i * 4 + vertexOffset,
							1 + i * 4 + vertexOffset,
							2 + i * 4 + vertexOffset,
							
							0 + i * 4 + vertexOffset,
							2 + i * 4 + vertexOffset,
							3 + i * 4 + vertexOffset,
						]);
						
						if (colorOff <= i && textureBounds){
							var bounds;
							
							if (textureBounds.defaultBounds){
								bounds = [
														  0,                       0,
									textureBounds.bounds[0],                       0,
									textureBounds.bounds[1], textureBounds.bounds[1],
														  0, textureBounds.bounds[1],
								];
							}else{
								bounds = textureBounds.bounds.slice((i - colorOff) * 8, Math.min(textureBounds.bounds.length, (k - colorOff) * 8));
							}
							
							if (interpreter.shape.colors){
								Array.prototype.push.apply(interpreter.shape.colors, bounds)
							}else{
								interpreter.shape.colors = bounds;
							}
							
							if (interpreter.get("mode") == Tessellator.COLOR){
								colorOff = interpreter.shape.colors.length / (4 * 4);
							}else{
								colorOff = interpreter.shape.colors.length / (4 * 2);
							}
						}
					}
				}else if (interpreter.shape.type === Tessellator.TRIANGLE){
					var k = interpreter.shape.vertices.length;
					
					var colorOff = interpreter.shape.colors ? interpreter.shape.colors.length / (4 * 3) : 0;
					
					if (k % 9 !== 0){
						throw "vector length is invalid for triangles!";
					}else{
						k /= 3 * 3;
					}
					
					for (var i = 0; i < k; i++){
						vertexIndexes.push((i * 3) + vertexOffset + 0);
						vertexIndexes.push((i * 3) + vertexOffset + 1);
						vertexIndexes.push((i * 3) + vertexOffset + 2);
						
						if (colorOff <= i && textureBounds){
							var bounds;
							
							if (textureBounds.defaultBounds){
								bounds = [
														  0,                       0,
									textureBounds.bounds[0],                       0,
									textureBounds.bounds[1], textureBounds.bounds[1],
								];
							}else{
								bounds = textureBounds.bounds.slice((i - colorOff) * 6, (k - colorOff) * 6);
							}
							
							if (interpreter.shape.colors){
								Array.prototype.push.apply(interpreter.shape.colors, bounds);
							}else{
								interpreter.shape.colors = bounds;
							}
							
							colorOff = interpreter.shape.colors ? interpreter.shape.colors.length / (4 * 3) : 0;
						}
					}
				}else if (interpreter.shape.type === Tessellator.TRIANGLE_STRIP){
					var k = interpreter.shape.vertices.length / 3;
					
					if (k < 3){
						throw "not enough vertices to draw triangle strip."
					}
					
					if (textureBounds && !textureBounds.defaultBounds && textureBounds.bounds.length / 4 !== k){
						throw "bound texture coordinates length mismatch with vertices length!";
					}
					
					for (var i = 0; i < k; i++){
						if (i < 3){
							vertexIndexes.push(i + vertexOffset);
						}else{
							vertexIndexes.push(vertexIndexes[vertexIndexes.length - 2]);
							vertexIndexes.push(vertexIndexes[vertexIndexes.length - 2]);
							vertexIndexes.push(i                        + vertexOffset);
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
								
								if (interpreter.shape.colors){
									Array.prototype.push.apply(interpreter.shape.colors, bounds);
								}else{
									interpreter.shape.colors = bounds;
								}
							}else if (i >= 3){
								var bounds;
								
								if (textureBounds.defaultBounds){
									bounds = [
										textureBounds.bounds[1], textureBounds.bounds[1], 0, 0,
									];
								}else{
									bounds = textureBounds.bounds.slice(i * 3, (i + 1) * 3);
								}
								
								if (interpreter.shape.colors){
									Array.prototype.push.apply(interpreter.shape.colors, bounds);
								}else{
									interpreter.shape.colors = bounds;
								}
							}
						}
					}
				}else if (interpreter.shape.type === Tessellator.TRIANGLE_FAN_CCW){
					var k = interpreter.shape.vertices.length / 3;
					
					if (k < 3){
						throw "not enough vertices to draw triangle strip."
					}
					
					if (textureBounds && !textureBounds.defaultBounds && textureBounds.bounds.length / 4 !== k){
						throw "bound texture coordinates length mismatch with vertices length!";
					}
					
					for (var i = 0; i < k; i++){
						if (i < 3){
							vertexIndexes.push(i + vertexOffset);
						}else{
							vertexIndexes.push(vertexIndexes[vertexIndexes.length - 1]);
							vertexIndexes.push(vertexIndexes[                       0]);
							vertexIndexes.push(i                        + vertexOffset);
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
								
								if (interpreter.shape.colors){
									Array.prototype.push.apply(interpreter.shape.colors, bounds);
								}else{
									interpreter.shape.colors = bounds;
								}
							}else if (i >= 3){
								var bounds;
								
								if (textureBounds.defaultBounds){
									bounds = [
										textureBounds.bounds[1], textureBounds.bounds[1],
									];
								}else{
									bounds = textureBounds.bounds.slice(i * 3, (i + 1) * 3);
								}
								
								if (interpreter.shape.colors){
									Array.prototype.push.apply(interpreter.shape.colors, bounds);
								}else{
									interpreter.shape.colors = bounds;
								}
							}
						}
					}
				}else if (interpreter.shape.type === Tessellator.TRIANGLE_FAN_CW){
					var k = interpreter.shape.vertices.length / 3;
					
					if (k < 3){
						throw "not enough vertices to draw triangle strip."
					}
					
					if (textureBounds && !textureBounds.defaultBounds && textureBounds.bounds.length / 4 !== k){
						throw "bound texture coordinates length mismatch with vertices length!";
					}
					
					for (var i = 0; i < k; i++){
						if (i < 3){
							vertexIndexes.push(i + vertexOffset);
						}else{
							vertexIndexes.push(vertexIndexes[                       0]);
							vertexIndexes.push(vertexIndexes[vertexIndexes.length - 2]);
							vertexIndexes.push(i                        + vertexOffset);
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
								
								if (interpreter.shape.colors){
									Array.prototype.push.apply(interpreter.shape.colors, bounds);
								}else{
									interpreter.shape.colors = bounds;
								}
							}else if (i >= 3){
								var bounds;
								
								if (textureBounds.defaultBounds){
									bounds = [
										textureBounds.bounds[1], textureBounds.bounds[1],
									];
								}else{
									bounds = textureBounds.bounds.slice(i * 3, (i + 1) * 3);
								}
								
								if (interpreter.shape.colors){
									Array.prototype.push.apply(interpreter.shape.colors, bounds);
								}else{
									interpreter.shape.colors = bounds;
								}
							}
						}
						
						/*if (colorOff <= i && textureBounds){
							var bounds;
							
							if (textureBounds.defaultBounds){
								bounds = [
															   0,                            0, 0, 0,
									textureBounds.bounds[0],                            0, 0, 0,
									textureBounds.bounds[1], textureBounds.bounds[1], 0, 0,
								];
							}else{
								bounds = textureBounds.bounds;
							}
							
							if (interpreter.shape.colors){
								Array.prototype.push.apply(interpreter.shape.colors, bounds);
							}else{
								interpreter.shape.colors = bounds.slice((i - colorOff) * 12, (k - colorOff) * 12);
							}
						}*/
					}
				}
				
				interpreter.shape.vertexIndexes = vertexIndexes;
				interpreter.shape.items = vertexIndexes.length;
				interpreter.shape.type = Tessellator.TRIANGLE;
				
				if (!interpreter.get("lighting")){
					interpreter.shape.normals = [];
					
					for (var i = 0, k = interpreter.shape.vertices.length; i < k; i++){
						interpreter.shape.normals[i] = 0;
					}
				}else if (interpreter.normals){
					interpreter.shape.normals = interpreter.normals;
					
					interpreter.normals = null;
				}else{ //calculate default normals.
					var normals = [];
				
					for (var i = 0, k = interpreter.shape.items / 3; i < k; i++){
						var
							x1 = interpreter.shape.vertices[(interpreter.shape.vertexIndexes[i * 3 + 0] - vertexOffset) * 3 + 0],
							y1 = interpreter.shape.vertices[(interpreter.shape.vertexIndexes[i * 3 + 0] - vertexOffset) * 3 + 1],
							z1 = interpreter.shape.vertices[(interpreter.shape.vertexIndexes[i * 3 + 0] - vertexOffset) * 3 + 2],
							
							x2 = interpreter.shape.vertices[(interpreter.shape.vertexIndexes[i * 3 + 1] - vertexOffset) * 3 + 0],
							y2 = interpreter.shape.vertices[(interpreter.shape.vertexIndexes[i * 3 + 1] - vertexOffset) * 3 + 1],
							z2 = interpreter.shape.vertices[(interpreter.shape.vertexIndexes[i * 3 + 1] - vertexOffset) * 3 + 2],
							
							x3 = interpreter.shape.vertices[(interpreter.shape.vertexIndexes[i * 3 + 2] - vertexOffset) * 3 + 0],
							y3 = interpreter.shape.vertices[(interpreter.shape.vertexIndexes[i * 3 + 2] - vertexOffset) * 3 + 1],
							z3 = interpreter.shape.vertices[(interpreter.shape.vertexIndexes[i * 3 + 2] - vertexOffset) * 3 + 2];
						
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
							var index = interpreter.shape.vertexIndexes[i * 3 + l] - vertexOffset;
							
							if (normals[index * 3 + 0]){
								//calculate average
								
								normals[index * 3 + 0] = (Nx + normals[index * 3 + 0]) / 2;
								normals[index * 3 + 1] = (Ny + normals[index * 3 + 1]) / 2;
								normals[index * 3 + 2] = (Nz + normals[index * 3 + 2]) / 2;
							}else{
								normals[index * 3 + 0] = Nx;
								normals[index * 3 + 1] = Ny;
								normals[index * 3 + 2] = Nz;
							}
						}
					}
					
					interpreter.shape.normals = normals;
				}
				
				if (shapeAddon){
					//overflow. even WebGL has its limits.
					if (shapeAddon.items + interpreter.shape.items > Tessellator.VERTEX_LIMIT){
						interpreter.model.push(shapeAddon);
						
						//reset vertex pointers to 0.
						for (var i = 0; i < interpreter.shape.vertexIndexes.length; i++){
							interpreter.shape.vertexIndexes[i] -= vertexOffset;
						}
						
						shapeAddon = interpreter.shape;
					}else{
						shapeAddon.items += interpreter.shape.items;
						Array.prototype.push.apply(shapeAddon.vertexIndexes, interpreter.shape.vertexIndexes);
						Array.prototype.push.apply(shapeAddon.vertices, interpreter.shape.vertices);
						Array.prototype.push.apply(shapeAddon.colors, interpreter.shape.colors);
						Array.prototype.push.apply(shapeAddon.normals, interpreter.shape.normals);
					}
				}else{
					shapeAddon = interpreter.shape;
				}
				
				if (textureBounds){
					interpreter.texturedTriangleShapes[textureBounds.texture.id] = shapeAddon;
				}else{
					interpreter.triangleShape = shapeAddon;
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
			this.flushNonTexture();
			this.flushTextures();
		}


		Tessellator.Initializer.prototype.flushNonTexture = function (){
			if (this.triangleShape){
				if (this.triangleShape.text){
					this.model.push(new Tessellator.TextureBind(this.fontSheet.texture));
					this.model.push(new Tessellator.Mask(this.triangleShape.text));
				}
				
				this.model.push(this.triangleShape);
				this.triangleShape = null;
			}
		}


		Tessellator.Initializer.prototype.flushTextures = function (){
			for (var textured in this.texturedTriangleShapes){
				this.flushTexture(textured);
			}
		}


		Tessellator.Initializer.prototype.flushTexture = function (textured){
			if (!this.tessellator.textureIDCache[textured]){
				throw "invalid texture";
			}
			
			this.model.push(new Tessellator.TextureBind(this.tessellator.textureIDCache[textured]));
			this.model.push(this.texturedTriangleShapes[textured]);
			
			delete this.texturedTriangleShapes[textured];
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
				if (interpreter.get("textureBounds")){
					if (interpreter.shape.vertices){
						Array.prototype.push.apply(interpreter.shape.vertices, this.vertices);
					}else{
						interpreter.shape.vertices = Array.prototype.slice.call(this.vertices);
					}
				}
			}else if (interpreter.shape.type === Tessellator.NORMAL){
				if (interpreter.shape.vertices){
					Array.prototype.push.apply(interpreter.shape.vertices, this.vertices);
				}else{
					interpreter.shape.vertices = Array.prototype.slice.call(this.vertices);
				}
			}else{
				if (interpreter.get("draw") === Tessellator.COLOR){
					var k = this.vertices.length / 3;
					var c = interpreter.get("color");
				
					for (var i = 0; i < k; i++){
						if (interpreter.shape.colors){
							interpreter.shape.colors.push(
								c.r * 255,
								c.g * 255,
								c.b * 255,
								c.a * 255
							);
						}else{
							interpreter.shape.colors = [
								c.r * 255,
								c.g * 255,
								c.b * 255,
								c.a * 255
							]
						}
					}
				}
				
				var index = 0;
				
				if (interpreter.shape.vertices){
					index = interpreter.shape.vertices.length / 3;
					
					Array.prototype.push.apply(interpreter.shape.vertices, this.vertices);
				}else{
					interpreter.shape.vertices = Array.prototype.slice.call(this.vertices);
				}
				
				if (interpreter.shape.matrix){
					var ver = interpreter.shape.vertices;
					var m = interpreter.shape.matrix;
					
					for (var i = index, k = ver.length / 3; i < k; i++){
						var
							x = ver[i * 3 + 0],
							y = ver[i * 3 + 1],
							z = ver[i * 3 + 2];
						
						ver[i * 3 + 0] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
						ver[i * 3 + 1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
						ver[i * 3 + 2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];
					}
				}
				
				interpreter.shape.items += k;
			}
			
			return null;
		}


		Tessellator.Vertex.prototype.apply = Tessellator.EMPTY_FUNC;
		
		Tessellator.Vertex.prototype.postInit = Tessellator.EMPTY_FUNC;
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
					fontSheet.texture = interpreter.tessellator.loadTexture(fontSheet.src, fontSheet.filter);
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
				this.matrix.setMask(interpreter.get("color").array());
				
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
					this.nearView = arguments[6];
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
				
				if (!left){
					left = 0;
				}
				
				if (!right){
					right = render.get("window")[0];
				}
				
				if (!up){
					up = -render.get("window")[1];
				}
				
				if (!down){
					down = 0;
				}
				
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
			Tessellator.StaticView = function (){
				this.type = Tessellator.VIEW;
			}


			Tessellator.StaticView.prototype.apply = function (render){
				render.get("mvMatrix").identity();
				
				var window = render.get("window");
				
				render.set("pMatrix", Tessellator.mat4(
					2 / window[0], 0, 0, 0,
					0, 2 / window[1], 0, 0,
					0, 0, -2, 0,
					-1, 1, -1, 1
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
				this.set(render.get("mvMatrix"));
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
				this.set(render.get("mvMatrix"));
			}
			
			Tessellator.RadialCamera.prototype.set = function (m){
				//m.rotateX(this.radY);
				//m.rotateY(this.radX);
				//m.rotateZ(this.radZ);
				
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
				this.set(render.get("mvMatrix"));
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
				this.set(render.get("mvMatrix"));
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
			if (!interpreter.get("textureBounds")){
				throw "no texture to apply texture scale to!";
			}
			
			for (var i = 0, k = interpreter.get("textureBounds").bounds.length / 2; i < k; i++){
				interpreter.get("textureBounds").bounds[i * 2] *= this.scaleX;
				interpreter.get("textureBounds").bounds[i * 2 + 1] *= this.scaleY;
			}
			
			return null;
		}
		
		Tessellator.TextureScale.prototype.postInit = Tessellator.EMPTY_FUNC;
		
		Tessellator.TextureScale.prototype.apply = Tessellator.EMPTY_FUNC;
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
			render.tessellators.GL.lineWidth(this.lineWidth);
		}
	}
	{ //texture bind
		Tessellator.Model.prototype.bindTexture = function (texture){
			return this.add(new Tessellator.TextureBind(texture));
		}
		
		Tessellator.TextureBind = function (texture){
			this.type = Tessellator.TEXTURE;
			
			if (!texture){
				throw "null pointer";
			}
			
			this.texture = texture;
		}
		
		Tessellator.TextureBind.prototype.init = function (interpreter){
			if (interpreter.shape){
				throw "cannot bind a new texture if there is a shape currently being drawn.";
			}
			
			if (this.texture && this.texture.constructor === String){
				this.texture = interpreter.tessellator.getTexture(this.texture);
			}
			
			interpreter.set("textureBounds", this);
			
			//this default will stretch the texture over the surface.
			this.bounds = [
				1, 1, 0, 2,
			];
			
			this.defaultBounds = true;
			
			if (interpreter.get("draw") !== Tessellator.TEXTURE){
				interpreter.flush();
				interpreter.set("draw", Tessellator.TEXTURE);
			}
			
			interpreter.set("mask", false);
			
			return null;
		}
		
		Tessellator.TextureBind.prototype.postInit = Tessellator.EMPTY_FUNC;
		
		Tessellator.TextureBind.prototype.apply = function (render, model){
			if (this.texture && this.texture.autoUpdate){
				this.texture.update(render);
			}
			
			render.set("texture", this.texture);
		}
	}
}
{ //textures
	{ //texture image
		Tessellator.prototype.loadTexture = function (src, filter){
			return new Tessellator.TextureImage(this, src, filter);
		}
		
		Tessellator.prototype.getTexture = function (src){
			var texture;
			
			if (this.textureCache[src]){
				texture = this.textureCache[src];
			}else{
				texture = this.loadTexture(src);
				
				this.textureCache[src] = texture;
			}
			
			return texture;
		}
		
		Tessellator.TextureImage = function (tessellator, src, filter){
			this.tessellator = tessellator;
			
			this.texture = this.tessellator.GL.createTexture();
			
			this.filter = filter;
			this.index = 0;
			this.disposable = false;
			this.autoUpdate = false;
			this.loaded = false;
			
			if (src){
				if (src.constructor === String){
					var self = this;
					
					this.image = Tessellator.TextureImage.loadImage(src, function (){
						self.loaded = true;
						self.update();
						
						if (!self.filter){
							self.filter = Tessellator.getAppropriateTextureFilter(self.image.width, self.image.height);
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
							self.update();
							
							if (!self.filter){
								self.filter = Tessellator.getAppropriateTextureFilter(self.image.width, self.image.height);
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
					this.update();
					
					if (!this.filter){
						this.filter = Tessellator.getAppropriateTextureFilter(this.image.width, this.image.height);
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
			
			this.tessellator.cacheTexture(this);
		}
		
		Tessellator.TextureImage.prototype.update = function (){
			var gl = this.tessellator.GL;
			
			gl.bindTexture(gl.TEXTURE_2D, this.texture);


			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
		}
		
		Tessellator.TextureImage.prototype.setDisposable = function (disposable){
			this.disposable = disposable;
			
			return this;
		}
		
		Tessellator.TextureImage.prototype.dispose = function (){
			if (this.texture){
				this.tessellator.GL.deleteTexture(this.texture);
				this.texture = null;
				
				this.tessellator.uncacheTexture(this);
			}
		}
		
		Tessellator.TextureImage.prototype.bind = function (render){
			if (this.id === -1){
				throw "trying to bind invalid texture!";
			}else if (this.loaded){
				render.tessellator.GL.bindTexture(render.tessellator.GL.TEXTURE_2D, this.texture);
			}else{
				render.tessellator.GL.bindTexture(render.tessellator.GL.TEXTURE_2D, null);
			}
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
						onLoad();
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
						this.listeners[i]();
					}
					
					delete this.listeners;
				}
				
				image.setAttribute("crossorigin", "anonymous");
				image.src = src;
				
				Tessellator.TextureImage.imageCache[src] = image;
				//Tessellator.TextureImage.length++;
			}
			
			return image;
		}


		Tessellator.areAllImagesLoaded = function(){
			return Tessellator.TextureImage.length === Tessellator.TextureImage.lengthLoaded;
		}
	}
	{ //texture queue
		Tessellator.TextureQueue = function (){
			this.textures = Array.prototype.slice(arguments);
			
			this.textureIndex = 0;
			this.texture = this.textures[textureIndex];
			
			this.loaded = true;
			this.autoUpdate = false;
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
			}, frequency)
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
		}
	}
	{ //texture video
		Tessellator.prototype.loadVideoTexture = function (src, filter, autoPlay){
			return new Tessellator.TextureVideo(this, src, filter, autoPlay);
		}
		
		Tessellator.TextureVideo = function (tessellator, src, filter, autoPlay){
			this.tessellator = tessellator;
			
			this.texture = this.tessellator.GL.createTexture();
			this.location = src;
			
			this.filter = filter;
			this.index = 0;
			this.timeUpdate = null;
			this.disposable = false;
			this.autoUpdate = true;
			this.autoPlay = autoPlay === undefined ? true : autoPlay;
			this.paused = null;
			this.loaded = false;
			this.checkDraw = true;
			this.volumeLevel = null;
			
			if (src.constructor === String){
				var self = this;
				
				this.video = document.createElement("video");
				
				this.video.src = src;
				this.video.setAttribute("crossorigin", "anonymous");
				this.video.load();
				
				this.video.addEventListener("canplay", function (){
					self.loaded = true;
					self.update();
					
					if (!self.filter){
						self.filter = Tessellator.getAppropriateTextureFilter(self.video.videoWidth, self.video.videoHeight);
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
			}else if (src.tagName.toLowerCase() == "video"){
				this.video = src;
				
				this.video.addEventListener("canplay", function (){
					self.loaded = true;
					self.update();
					
					if (!self.filter){
						self.filter = Tessellator.getAppropriateTextureFilter(self.video.videoWidth, self.video.videoHeight);
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
			}else if (src){
				this.video = src;
				this.loaded = true;
				this.checkDraw = false;
				this.update();
				
				if (!this.filter){
					this.filter = Tessellator.getAppropriateTextureFilter(this.video.videoWidth, this.video.videoHeight);
				}
				
				this.filter(this.tessellator, this.texture, this.image, this);
				
				if (this.listener){
					this.listener(this);
				}
				
				if (this.tessellator.onTextureLoaded){
					this.tessellator.onTextureLoaded(this);
				}
			}
			
			this.tessellator.cacheTexture(this);
		}
		
		Tessellator.TextureVideo.prototype.dispose = function (){
			this.tessellator.GL.deleteTexture(this.texture);
			
			this.tessellator.uncacheTexture(this);
		}
		
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
		
		Tessellator.TextureVideo.prototype.setDisposable = function (disposable){
			this.disposable = disposable;
			
			return this;
		}
		
		Tessellator.TextureVideo.prototype.dispose = function (){
			if (this.texture){
				this.tessellator.GL.deleteTexture(this.texture);
				this.texture = null;
				
				this.tessellator.uncacheTexture(this);
			}
		}
		
		Tessellator.TextureVideo.prototype.bind = function (render){
			if (this.id === -1){
				throw "trying to bind invalid texture!";
			}if (this.loaded){
				render.tessellator.GL.bindTexture(render.tessellator.GL.TEXTURE_2D, this.texture);
			}else{
				render.tessellator.GL.bindTexture(render.tessellator.GL.TEXTURE_2D, null);
			}
		}
	}
	{ //texture model
		Tessellator.TextureModel = function (tessellator, width, height, attachments){
			this.tessellator = tessellator;
			this.width = width;
			this.height = height;
			this.index = 0;
			this.disposable = true;
			this.autoUpdate = true;
			this.attachments = attachments;
			
			if (!this.attachments || this.attachments.constructor !== Array){
				this.attachments = [
					new Tessellator.TextureModel.AttachmentColor(this.attachments),
					new Tessellator.TextureModel.AttachmentDepth()
				];
			}
			
			this.configure();
			
			this.tessellator.cacheTexture(this);
		}
		
		Tessellator.TextureModel.prototype.configure = function (){
			this.disposeShallow();
			this.frameBuffer = this.tessellator.GL.createFramebuffer();
			
			var lastFrameBuffer = this.tessellator.frameBuffer;
			this.tessellator.frameBuffer = this.frameBuffer;
			this.tessellator.GL.bindFramebuffer(this.tessellator.GL.FRAMEBUFFER, this.frameBuffer);
			
			for (var i = 0, k = this.attachments.length; i < k; i++){
				this.attachments[i].configure(this);
			}
			
			this.tessellator.frameBuffer = lastFrameBuffer;
			this.tessellator.GL.bindFramebuffer(this.tessellator.GL.FRAMEBUFFER, lastFrameBuffer);
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
		
		Tessellator.TextureModel.prototype.render = function (renderer, render){
			var lastFrameBuffer = this.tessellator.frameBuffer;
			this.tessellator.frameBuffer = this.frameBuffer;
			this.tessellator.GL.bindFramebuffer(this.tessellator.GL.FRAMEBUFFER, this.frameBuffer);
			
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
			
			this.tessellator.frameBuffer = lastFrameBuffer;
			this.tessellator.GL.bindFramebuffer(this.tessellator.GL.FRAMEBUFFER, lastFrameBuffer);
		}
		
		Tessellator.TextureModel.prototype.disposeShallow = function (){
			if (this.frameBuffer){
				this.tessellator.GL.deleteFramebuffer(this.frameBuffer);
				
				this.frameBuffer = null;
			}
		}
		
		Tessellator.TextureModel.prototype.dispose = function (){
			if (this.frameBuffer){
				this.disposeShallow();
				
				for (var i = 0, k = this.attachments.length; i < k; i++){
					this.attachments[i].dispose(this);
				}
				
				this.tessellator.uncacheTexture(this);
			}
		}
		
		Tessellator.TextureModel.prototype.setSize = function (width, height){
			if (this.width !== width || this.height !== height){
				this.width = width;
				this.height = height;
				
				this.configure();
			}
		}
		
		Tessellator.TextureModel.prototype.setDisposable = function (disposable){
			this.disposable = disposable;
			
			return this;
		}
		
		Tessellator.TextureModel.prototype.bind = function (render){
			if (this.id === -1){
				throw "trying to bind an invalid texture!";
			}else for (var i = 0, k = this.attachments.length; i < k; i++){
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
				Tessellator.TextureModel.AttachmentColor = function (filter){
					this.filter = filter;
				}
				
				Tessellator.TextureModel.AttachmentColor.prototype.configure = function(texture){
					var gl = texture.tessellator.GL;
					
					if (!this.filter){
						this.filter = Tessellator.getAppropriateTextureFilter(texture.width, texture.height);
					}
					
					if (!this.buffer || texture.width !== this.width || texture.height !== this.height){
						this.dispose(texture);
						
						this.buffer = gl.createTexture();
						this.width = texture.width;
						this.height = texture.height;
						this.tessellator = texture.tessellator;
						
						gl.bindTexture(gl.TEXTURE_2D, this.buffer);
						gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
						this.filter(texture.tessellator, this.buffer, texture.frameBuffer, texture);
						gl.bindTexture(gl.TEXTURE_2D, null);
					}
					
					
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.buffer, 0);
				}
				
				Tessellator.TextureModel.AttachmentColor.prototype.bind = function (texture, render){
					texture.tessellator.GL.bindTexture(texture.tessellator.GL.TEXTURE_2D, this.buffer);
				}
				
				Tessellator.TextureModel.AttachmentColor.prototype.render = Tessellator.EMPTY_FUNC;
				
				Tessellator.TextureModel.AttachmentColor.prototype.dispose = function (){
					if (this.buffer){
						this.tessellator.GL.deleteTexture(this.buffer);
						
						this.buffer = null;
					}
				}
			}
			{ //model attachment
				Tessellator.TextureModel.AttachmentModel = function (model){
					this.model = model;
				}
				
				Tessellator.TextureModel.AttachmentModel.prototype.configure = Tessellator.EMPTY_FUNC;
				
				Tessellator.TextureModel.AttachmentModel.prototype.bind = Tessellator.EMPTY_FUNC;
				
				Tessellator.TextureModel.AttachmentModel.prototype.render = function (texture, renderer, render){
					if (this.model){
						var matrix = new Tessellator.RenderMatrix(renderer);
						
						matrix.set("window", Tessellator.vec2(texture.width, texture.height));
						renderer.render(matrix, this.model);
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
					if (this.arg){
						var matrix = new Tessellator.RenderMatrix(this.renderer);
						
						matrix.set("window", Tessellator.vec2(texture.width, texture.height));
						this.renderer.render(matrix, this.arg);
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
			if (arguments.length === 4){
				this.atlas = arguments[3];
			}else if (arguments.length === 5){
				if (isNaN(arguments[3])){
					this.atlas = arguments[3];
					this.filter = arguments[4];
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
				new Tessellator.TextureModel.AttachmentColor(this.filter)
			]);
			
			this.autoUpdate = false;
			this.disposable = false;
			this.updateRequested = false;
			
			this.updateAtlas();
			
			this.renderer = new Tessellator.AtlasRenderer(Tessellator.ATLAS_SHADER.create(this.tessellator), this.atlas);
		}
		
		Tessellator.copyProto(Tessellator.TextureAtlas, Tessellator.TextureModel);
		
		Tessellator.TextureAtlas.prototype.updateAtlas = function (){
			this.updateCache = [];
			this.autoUpdate = false;
			
			for (var x = 0, xk = this.atlas.length; x < xk; x++){
				for (var y = 0, yk = this.atlas[x].length; y < yk; y++){
					var textures = this.atlas[x][y];
					
					if (textures) for (var i = 0; i < textures.length; i++){
						var texture = textures[i].texture;
						
						if (texture.autoUpdate){
							this.autoUpdate = true;
							this.updateRequested = false;
							
							this.updateCache.push(texture);
						}
						
						if (!texture.loaded){
							var self = this;
							
							texture.listener = function (){
								self.requestUpdate();
							}
						}else{
							this.requestUpdate();
						}
					}
				}
			}
		}
		
		Tessellator.TextureAtlas.prototype.requestUpdate = function (){
			if (!this.autoUpdate){
				this.autoUpdate = true;
				this.updateRequested = true;
			}
		}
		
		Tessellator.TextureAtlas.prototype.update = function (render){
			for (var i = 0, k = this.updateCache.length; i < k; i++){
				var texture = this.updateCache[i];
				
				if (texture.autoUpdate){
					texture.update(render);
				}
			}
			
			if (this.updateRequested){
				this.updateRequested = false;
				this.autoUpdate = false;
			}
			
			this.render(this.renderer, render);
		}
		
		Tessellator.TextureAtlas.prototype.set = function (x, y, texture){
			this.atlas[x][y] = [{ texture: texture }];
			
			this.updateAtlas();
		}
		
		Tessellator.TextureAtlas.prototype.get = function (x, y, i){
			return this.atlas[x][y][i || 0].texture;
		}
		
		Tessellator.TextureAtlas.prototype.add = function (x, y, texture){
			if (!this.atlas[x][y]){
				this.atlas[x][y] = [{ texture: texture }];
			}else{
				this.atlas[x][y].push({ texture: texture });
			}
			
			this.updateAtlas();
		}
		
		Tessellator.TextureAtlas.prototype.mask = function (x, y, mask, i){
			this.atlas[x][y][i || 0].mask = mask;
			
			this.updateAtlas();
		}
	}
}
{ //static constants
	Tessellator.Constant = function (name){
		this.name = name;
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
	Tessellator.STATIC = new Tessellator.Constant("static");
	Tessellator.DYNAMIC = new Tessellator.Constant("dynamic");
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


	Tessellator.COLOR_WHITE = new Tessellator.Color(1, 1, 1, 1);
	Tessellator.COLOR_BLACK = new Tessellator.Color(0, 0, 0, 1);
	Tessellator.COLOR_GRAY = new Tessellator.Color(0.5, 0.5, 0.5, 1);
	Tessellator.COLOR_RED = new Tessellator.Color(1, 0, 0, 1);
	Tessellator.COLOR_GREEN = new Tessellator.Color(0, 1, 0, 1);
	Tessellator.COLOR_BLUE = new Tessellator.Color(0, 0, 1, 1);
	Tessellator.COLOR_YELLOW = new Tessellator.Color(1, 1, 0, 1);
	Tessellator.COLOR_CYAN = new Tessellator.Color(0, 1, 1, 1);
	Tessellator.COLOR_MAGENTA = new Tessellator.Color(1, 0, 1, 1);
	Tessellator.COLOR_PINK = new Tessellator.Color(1, 0.7529, 0.796, 1);
	Tessellator.COLOR_LIGHT_PINK = new Tessellator.Color(1, 0.7137, 0.7569, 1);
	Tessellator.COLOR_PURPLE = new Tessellator.Color(0.5, 0, 0.5, 1);
	Tessellator.COLOR_VIOLET = new Tessellator.Color(0.9334, 0.5098, 9.3334, 1);
	Tessellator.COLOR_INDIGO = new Tessellator.Color(0.2941, 0, 0.5098, 1);
	Tessellator.COLOR_NAVY = new Tessellator.Color(0, 0, 0.5, 1);
	Tessellator.COLOR_MAROON = new Tessellator.Color(0.5, 0, 0, 1);
	Tessellator.COLOR_DARK_RED = new Tessellator.Color(0.543, 0, 0, 1);
	Tessellator.COLOR_BROWN = new Tessellator.Color(0.6445, 0.164, 0.164, 1);
	Tessellator.COLOR_FIRE_BRICK = new Tessellator.Color(0.6953, 0.1328, 0.1328, 1);
	Tessellator.COLOR_CRIMSON = new Tessellator.Color(0.8594, 0.0755, 0.2344, 1);
	Tessellator.COLOR_TOMATO = new Tessellator.Color(1, 0.164, 0.164, 1);
	Tessellator.COLOR_CORAL = new Tessellator.Color(1, 0.5, 0.3125, 1);
	Tessellator.COLOR_INDIAN_RED = new Tessellator.Color(0.8008, 0.3594, 0.3594, 1);
	Tessellator.COLOR_AMBER = new Tessellator.Color(1, 0.4921, 0, 1);
	Tessellator.COLOR_CLEAR = new Tessellator.Color(0, 0, 0, 0);


	Tessellator.DEFAULT_COLOR = Tessellator.COLOR_WHITE;
	Tessellator.NO_CLIP = new Float32Array([0, 0, 1, 1]);
	Tessellator.NO_MASK = new Tessellator.Mask(Tessellator.COLOR_WHITE);
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
		
		Tessellator.PIXEL_SHADER_VERTEX_SHADER = "precision lowp float;attribute vec2 position;varying vec2 texturePos;void main(void){texturePos=(position+1.0)/2.0;gl_Position=vec4(position,0.0,1.0);}";
		Tessellator.ATLAS_VERTEX_SHADER = "precision lowp float;attribute vec2 position;uniform vec2 atlasDims;uniform vec2 atlas;varying vec2 texturePos;void main(void){texturePos=(position+1.0)/2.0;gl_Position=vec4((atlas+texturePos)/atlasDims*2.0-1.0,0.0,1.0);}";
		
		Tessellator.PIXEL_SHADER_PASS = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){gl_FragColor=texture2D(sampler,texturePos);}";
		Tessellator.PIXEL_SHADER_BLACK_AND_WHITE = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);float color=(o.x+o.y+o.z)/3.0;gl_FragColor=vec4(color,color,color,o.w);}";
		Tessellator.PIXEL_SHADER_INVERT_COLOR = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(1.0-o.xyz,o.w);}";
		Tessellator.PIXEL_SHADER_FILTER = "precision lowp float;varying vec2 texturePos;uniform vec3 mask;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);float color=(o.x*mask.x+o.y*mask.y+o.z*mask.z)/(mask.x+mask.y+mask.z);gl_FragColor=vec4(vec3(color)*mask, o.w);}";
		Tessellator.PIXEL_SHADER_MASK = "precision lowp float;varying vec2 texturePos;uniform vec4 mask;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=o*mask;}";
		Tessellator.PIXEL_SHADER_RED_FILTER = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(o.x,0,0,o.w);}";
		Tessellator.PIXEL_SHADER_GREEN_FILTER = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(0,o.y,0,o.w);}";
		Tessellator.PIXEL_SHADER_BLUE_FILTER = "precision lowp float;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(0,0,o.z,o.w);}";
		Tessellator.PIXEL_SHADER_QUALITY_FILTER = "precision lowp float;uniform float quality;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 o=texture2D(sampler,texturePos);gl_FragColor=vec4(floor(o.xyz*quality+0.5)/quality,o.w);}";
		
		Tessellator.PIXEL_SHADER_BLUR = new Tessellator.ShaderPreset(function (tessellator, resX, resY){
			return tessellator.createPixelShader("precision highp float;const int resX=" + (resX | 5) + ",resY=" + (resY | 4) + ";uniform float intensity;const float TAU=atan(1.0)*8.0;varying vec2 texturePos;uniform sampler2D sampler;void main(void){vec4 color=texture2D(sampler,texturePos);int index=1;for(int y=1;y<=resY;y++){float len=float(y)/float(resY)*intensity;for(int x=0;x<resX;x++){index++;float rad=float(x)/float(resX)*TAU;color+=texture2D(sampler,texturePos+vec2(sin(rad),cos(rad))*len/16.0);}}gl_FragColor=color/float(index);}");
		});
		
		Tessellator.ATLAS_SHADER = new Tessellator.ShaderPreset().configureStandardPair(
			Tessellator.ATLAS_VERTEX_SHADER,
			Tessellator.PIXEL_SHADER_MASK
			
		);
		
		Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_COLOR = "attribute vec3 position;attribute vec4 color;attribute vec3 normal;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec3 lightNormal;varying vec4 mvPosition;varying vec4 vColor;void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;if(normal.x==0.0&&normal.y==0.0&&normal.z==0.0){lightNormal=vec3(0.0,0.0,0.0);}else{lightNormal=normalize(nMatrix*normal);}vColor=color;}";
		Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_COLOR = "precision mediump float;const int lightCount=32;uniform vec4 clip;uniform vec2 window;uniform float specular;varying vec4 vColor;varying vec3 lightNormal;varying vec4 mvPosition;uniform vec4 lights[lightCount];vec3 getLightMask(void){if(lights[0].x==-1.0){return vec3(1,1,1);}else{vec3 lightMask=vec3(0,0,0);int skip=0;for(int i=0;i<lightCount;i++){if(skip>0){skip--;continue;}vec4 light0=lights[i+0];int type=int(light0.x);vec3 color=light0.yzw;if(type==1){lightMask+=color;skip=0;}else if(type==2){vec3 dir=lights[i+1].xyz;float intensity=max(dot(lightNormal,dir),0.0);lightMask+=color*intensity;skip=1;}else if(type==3){vec3 pos=lights[i+1].xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity;skip=1;}else if(type==4){vec4 light1=lights[i+1];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float specularLight=0.0;if(specular>1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity*((range-length)/range);}skip=1;}else if(type==5){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity;}skip=2;}else if(type==6){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity*((range-length)/range);}skip=2;}else{return lightMask;}}return lightMask;}}void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=vColor;if(mainColor.w==0.0){discard;}else{if(lightNormal.x!=0.0||lightNormal.y!=0.0||lightNormal.z!=0.0){mainColor*=vec4(getLightMask(),1.0);}gl_FragColor=mainColor;}}";
		Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_TEXTURE = "attribute vec3 position;attribute vec2 color;attribute vec3 normal;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec3 lightNormal;varying vec4 mvPosition;varying vec2 vTexture;void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;if(normal.x==0.0&&normal.y==0.0&&normal.z==0.0){lightNormal=vec3(0.0,0.0,0.0);}else{lightNormal=normalize(nMatrix*normal);}vTexture=color;}";
		Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_TEXTURE = "precision mediump float;const int lightCount=32;uniform sampler2D texture;uniform vec4 mask;uniform vec4 clip;uniform vec2 window;uniform float specular;varying vec2 vTexture;varying vec3 lightNormal;varying vec4 mvPosition;uniform vec4 lights[lightCount];vec3 getLightMask(void){if(lights[0].x==-1.0){return vec3(1,1,1);}else{vec3 lightMask=vec3(0,0,0);int skip=0;for(int i=0;i<lightCount;i++){if(skip>0){skip--;continue;}vec4 light0=lights[i+0];int type=int(light0.x);vec3 color=light0.yzw;if(type==1){lightMask+=color;skip=0;}else if(type==2){vec3 dir=lights[i+1].xyz;float intensity=max(dot(lightNormal,dir),0.0);lightMask+=color*intensity;skip=1;}else if(type==3){vec3 pos=lights[i+1].xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity;skip=1;}else if(type==4){vec4 light1=lights[i+1];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float specularLight=0.0;if(specular>1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity*((range-length)/range);}skip=1;}else if(type==5){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity;}skip=2;}else if(type==6){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float specularLight=0.0;if(specular>=1.0){specularLight=pow(max(dot(reflect(-npos,lightNormal),normalize(-mvPosition.xyz)),0.0),specular);}float intensity=max(dot(lightNormal,npos),0.0)+specularLight;lightMask+=color*intensity*((range-length)/range);}skip=2;}else{return lightMask;}}return lightMask;}}void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=texture2D(texture,vTexture)*mask;if(mainColor.w==0.0){discard;}else{if(lightNormal.x!=0.0||lightNormal.y!=0.0||lightNormal.z!=0.0){mainColor.xyz*=getLightMask();}gl_FragColor=mainColor;}}";
		
		Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_SHADER = new Tessellator.ShaderPreset().configureDrawDependant(
			Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_COLOR,
			Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_COLOR,
			Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER_TEXTURE,
			Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER_TEXTURE
		);
		
		Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_COLOR = "attribute vec3 position;attribute vec4 color;attribute vec3 normal;const int lightCount=32;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;vec3 lightNormal;vec4 mvPosition;varying vec4 vColor;uniform vec4 lights[lightCount];vec3 getLightMask(void){if(lights[0].x==-1.0){return vec3(1,1,1);}else{vec3 lightMask=vec3(0,0,0);int skip=0;for(int i=0;i<lightCount;i++){if(skip>0){skip--;continue;}vec4 light0=lights[i+0];int type=int(light0.x);vec3 color=light0.yzw;if(type==1){lightMask+=color;skip=0;}else if(type==2){vec3 dir=lights[i+1].xyz;float intensity=max(dot(lightNormal,dir),0.0);lightMask+=color*intensity;skip=1;}else if(type==3){vec3 pos=lights[i+1].xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity;skip=1;}else if(type==4){vec4 light1=lights[i+1];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity*((range-length)/range);}skip=1;}else if(type==5){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity;}skip=2;}else if(type==6){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity*((range-length)/range);}skip=2;}else{return lightMask;}}return lightMask;}}void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;vColor=color;if(normal!=vec3(0.0,0.0,0.0)){lightNormal=normalize(nMatrix*normal);vColor.rgb*=getLightMask();}}";
		Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_COLOR = "precision mediump float;uniform vec4 clip;uniform vec2 window;varying vec4 vColor;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}if(vColor.w==0.0){discard;}else{gl_FragColor=vColor;}}";
		Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_TEXTURE = "attribute vec3 position;attribute vec2 color;attribute vec3 normal;const int lightCount=32;uniform mat4 mvMatrix;uniform mat4 pMatrix;uniform mat3 nMatrix;varying vec2 vTexture;varying vec3 lightMask;vec3 lightNormal;vec4 mvPosition;uniform vec4 lights[lightCount];vec3 getLightMask(void){if(lights[0].x==-1.0){return vec3(1,1,1);}else{vec3 lightMask=vec3(0,0,0);int skip=0;for(int i=0;i<lightCount;i++){if(skip>0){skip--;continue;}vec4 light0=lights[i+0];int type=int(light0.x);vec3 color=light0.yzw;if(type==1){lightMask+=color;skip=0;}else if(type==2){vec3 dir=lights[i+1].xyz;float intensity=max(dot(lightNormal,dir),0.0);lightMask+=color*intensity;skip=1;}else if(type==3){vec3 pos=lights[i+1].xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity;skip=1;}else if(type==4){vec4 light1=lights[i+1];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);if(range>=length){vec3 npos=dist/length;float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity*((range-length)/range);}skip=1;}else if(type==5){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;vec3 npos=normalize(pos-mvPosition.xyz);vec3 vec=light2.xyz;float size=light2.w;if(dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity;}skip=2;}else if(type==6){vec4 light1=lights[i+1];vec4 light2=lights[i+2];vec3 pos=light1.xyz;float range=light1.w;vec3 dist=pos-mvPosition.xyz;float length=sqrt(dist.x*dist.x+dist.y*dist.y+dist.z*dist.z);vec3 npos=dist/length;vec3 vec=light2.xyz;float size=light2.w;if(range>length&&dot(vec,npos)>size){vec3 look=normalize(-mvPosition.xyz);vec3 reflection=reflect(-npos,lightNormal);float intensity=max(dot(lightNormal,npos),0.0);lightMask+=color*intensity*((range-length)/range);}skip=2;}else{return lightMask;}}return lightMask;}}void main(void){mvPosition=mvMatrix*vec4(position,1.0);gl_Position=pMatrix*mvPosition;if(normal!=vec3(0.0,0.0,0.0)){lightNormal=normalize(nMatrix*normal);lightMask=getLightMask();}else{lightMask=vec3(1.0,1.0,1.0);}vTexture=color;}";
		Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_TEXTURE = "precision mediump float;uniform sampler2D texture;uniform vec4 mask;uniform vec4 clip;uniform vec2 window;varying vec2 vTexture;varying vec3 lightMask;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=texture2D(texture,vTexture)*mask;mainColor.xyz*=lightMask;if(mainColor.w==0.0){discard;}else{gl_FragColor=mainColor;}}";
		
		Tessellator.MODEL_VIEW_VERTEX_LIGHTING_SHADER = new Tessellator.ShaderPreset().configureDrawDependant(
			Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_COLOR,
			Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_COLOR,
			Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER_TEXTURE,
			Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER_TEXTURE
		);
		
		Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR = "attribute vec3 position;attribute vec4 color;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 vColor;void main(void){gl_Position=pMatrix*mvMatrix*vec4(position,1.0);vColor=color;}";
		Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR = "precision mediump float;uniform vec4 clip;uniform vec2 window;varying vec4 vColor;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}if(vColor.w==0.0){discard;}else{gl_FragColor=vColor;}}";
		Tessellator.MODEL_VIEW_VERTEX_SHADER_TEXTURE = "attribute vec3 position;attribute vec2 color;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec2 vTexture;void main(void){gl_Position=pMatrix*mvMatrix*vec4(position,1.0);vTexture=color;}";
		Tessellator.MODEL_VIEW_FRAGMENT_SHADER_TEXTURE = "precision mediump float;uniform sampler2D texture;uniform vec4 mask;uniform vec4 clip;uniform vec2 window;varying vec2 vTexture;void main(void){{float xarea=gl_FragCoord.x/window.x;float yarea=gl_FragCoord.y/window.y;if(xarea<clip.x||yarea<clip.y||clip.x+clip.z<xarea||clip.y+clip.w<yarea){discard;}}vec4 mainColor=texture2D(texture,vTexture)*mask;if(mainColor.w==0.0){discard;}else{gl_FragColor=mainColor;}}";
		
		Tessellator.MODEL_VIEW_SHADER = new Tessellator.ShaderPreset().configureDrawDependant(
			Tessellator.MODEL_VIEW_VERTEX_SHADER_COLOR,
			Tessellator.MODEL_VIEW_FRAGMENT_SHADER_COLOR,
			Tessellator.MODEL_VIEW_VERTEX_SHADER_TEXTURE,
			Tessellator.MODEL_VIEW_FRAGMENT_SHADER_TEXTURE
		);
		
		Tessellator.DEPTH_MAP_VERTEX_SHADER = "attribute vec3 position;attribute vec3 normal;uniform mat4 mvMatrix;uniform mat4 pMatrix;varying vec4 vecp;varying lowp float hasNormal;void main(void){vecp=pMatrix*mvMatrix*vec4(position,1.0);if(normal==vec3(0.0,0.0,0.0)){hasNormal=0.0;}else{hasNormal=1.0;}gl_Position=vecp;}";
		Tessellator.DEPTH_MAP_FRAGMENT_SHADER = "precision lowp float;uniform float nearView;uniform float farView;varying vec4 vecp;varying lowp float hasNormal;void main(void){if(hasNormal>=0.5){float depth=(vecp.z/vecp.w+1.0)/2.0;gl_FragColor=vec4(depth,depth,depth,1);}else{discard;}}";
		
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
			var elem = elems.shift();
			
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
		}
	});
}
