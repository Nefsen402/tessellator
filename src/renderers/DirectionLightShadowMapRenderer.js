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

Tessellator.DirectionalLightingShadowMapRenderer = function (shader, x, y, z, light){
    this.super(shader);
    
    this.x = x;
    this.y = y;
    this.z = z;
    this.light = light;
};

Tessellator.extend(Tessellator.DirectionalLightingShadowMapRenderer, Tessellator.ModelRenderer);

Tessellator.DirectionalLightingShadowMapRenderer.prototype.renderRaw = function (matrix, obj){
    var dx = 1 / (this.x * -2),
        dy = 1 / (this.y * -2),
        dz = 1 / (this.z / 10 - this.z * 2);
    
    matrix.set("pMatrix", Tessellator.mat4(
        -2 * dx, 0, 0, 0,
        0, -2 * dy, 0, 0,
        0, 0, 2 * dz, 0,
        0, 0, (this.z * 2 + this.z / 10) * dz, 1
    ));
    
    var mvmat = matrix.get("mvMatrix");
    mvmat.translate(Tessellator.vec3(0, 0, (this.z * 2 + this.z / 10) / -2));
    mvmat.rotateVec(this.light.vec, Tessellator.vec3(0, 1, 0));
    //console.log(mvmat);
    
    this.super.renderRaw(matrix, obj);
};