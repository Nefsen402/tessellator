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