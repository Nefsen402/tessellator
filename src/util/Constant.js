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

Tessellator.Constant = function (name, value){
    this.name = name;
    this.gl = value;
    
    Tessellator.Constant.VALUES[name] = this;
    Tessellator.Constant.VALUE_NAME[value] = name;
    Tessellator.Constant.NAME_VALUE[name] = value;
}

Tessellator.Constant.prototype.toString = function () {
    return this.name;
}

Tessellator.Constant.prototype.getValue = function () {
    return this.value;
}

Tessellator.Constant.VALUES = {};
Tessellator.Constant.NAME_VALUE = {};
Tessellator.Constant.VALUE_NAME = {};

Tessellator.Constant.create = function (name, value){
    var gl = Tessellator.Constant.VALUES[name];
    
    if (gl){
        gl.value = value;
        
        return gl;
    }else{
        var c = new Tessellator.Constant(name);
        c.value = value;
        
        return c;
    }
}

{ //webgl 1.0
    Tessellator.DEPTH_BUFFER_BIT = new Tessellator.Constant("DEPTH_BUFFER_BIT",  0x00000100);
    Tessellator.STENCIL_BUFFER_BIT = new Tessellator.Constant("STENCIL_BUFFER_BIT",  0x00000400);
    Tessellator.COLOR_BUFFER_BIT = new Tessellator.Constant("COLOR_BUFFER_BIT",  0x00004000);

    Tessellator.POINTS = new Tessellator.Constant("POINTS",  0x0000);
    Tessellator.LINES = new Tessellator.Constant("LINES",  0x0001);
    Tessellator.LINE_LOOP = new Tessellator.Constant("LINE_LOOP",  0x0002);
    Tessellator.LINE_STRIP = new Tessellator.Constant("LINE_STRIP",  0x0003);
    Tessellator.TRIANGLES = new Tessellator.Constant("TRIANGLES",  0x0004);
    Tessellator.TRIANGLE_STRIP = new Tessellator.Constant("TRIANGLE_STRIP",  0x0005);
    Tessellator.TRIANGLE_FAN = new Tessellator.Constant("TRIANGLE_FAN",  0x0006);

    Tessellator.ZERO = new Tessellator.Constant("ZERO",  0);
    Tessellator.ONE = new Tessellator.Constant("ONE",  1);
    Tessellator.SRC_COLOR = new Tessellator.Constant("SRC_COLOR",  0x0300);
    Tessellator.ONE_MINUS_SRC_COLOR = new Tessellator.Constant("ONE_MINUS_SRC_COLOR",  0x0301);
    Tessellator.SRC_ALPHA = new Tessellator.Constant("SRC_ALPHA",  0x0302);
    Tessellator.ONE_MINUS_SRC_ALPHA = new Tessellator.Constant("ONE_MINUS_SRC_ALPHA",  0x0303);
    Tessellator.DST_ALPHA = new Tessellator.Constant("DST_ALPHA",  0x0304);
    Tessellator.ONE_MINUS_DST_ALPHA = new Tessellator.Constant("ONE_MINUS_DST_ALPHA",  0x0305);

    Tessellator.DST_COLOR = new Tessellator.Constant("DST_COLOR",  0x0306);
    Tessellator.ONE_MINUS_DST_COLOR = new Tessellator.Constant("ONE_MINUS_DST_COLOR",  0x0307);
    Tessellator.SRC_ALPHA_SATURATE = new Tessellator.Constant("SRC_ALPHA_SATURATE",  0x0308);

    Tessellator.FUNC_ADD = new Tessellator.Constant("FUNC_ADD",  0x8006);
    Tessellator.BLEND_EQUATION = new Tessellator.Constant("BLEND_EQUATION",  0x8009);
    Tessellator.BLEND_EQUATION_RGB = new Tessellator.Constant("BLEND_EQUATION_RGB",  0x8009);
    Tessellator.BLEND_EQUATION_ALPHA = new Tessellator.Constant("BLEND_EQUATION_ALPHA",  0x883D);

    Tessellator.FUNC_SUBTRACT = new Tessellator.Constant("FUNC_SUBTRACT",  0x800A);
    Tessellator.FUNC_REVERSE_SUBTRACT = new Tessellator.Constant("FUNC_REVERSE_SUBTRACT",  0x800B);

    Tessellator.BLEND_DST_RGB = new Tessellator.Constant("BLEND_DST_RGB",  0x80C8);
    Tessellator.BLEND_SRC_RGB = new Tessellator.Constant("BLEND_SRC_RGB",  0x80C9);
    Tessellator.BLEND_DST_ALPHA = new Tessellator.Constant("BLEND_DST_ALPHA",  0x80CA);
    Tessellator.BLEND_SRC_ALPHA = new Tessellator.Constant("BLEND_SRC_ALPHA",  0x80CB);
    Tessellator.CONSTANT_COLOR = new Tessellator.Constant("CONSTANT_COLOR",  0x8001);
    Tessellator.ONE_MINUS_CONSTANT_COLOR = new Tessellator.Constant("ONE_MINUS_CONSTANT_COLOR",  0x8002);
    Tessellator.CONSTANT_ALPHA = new Tessellator.Constant("CONSTANT_ALPHA",  0x8003);
    Tessellator.ONE_MINUS_CONSTANT_ALPHA = new Tessellator.Constant("ONE_MINUS_CONSTANT_ALPHA",  0x8004);
    Tessellator.BLEND_COLOR = new Tessellator.Constant("BLEND_COLOR",  0x8005);

    Tessellator.ARRAY_BUFFER = new Tessellator.Constant("ARRAY_BUFFER",  0x8892);
    Tessellator.ELEMENT_ARRAY_BUFFER = new Tessellator.Constant("ELEMENT_ARRAY_BUFFER",  0x8893);
    Tessellator.ARRAY_BUFFER_BINDING = new Tessellator.Constant("ARRAY_BUFFER_BINDING",  0x8894);
    Tessellator.ELEMENT_ARRAY_BUFFER_BINDING = new Tessellator.Constant("ELEMENT_ARRAY_BUFFER_BINDING",  0x8895);

    Tessellator.STREAM_DRAW = new Tessellator.Constant("STREAM_DRAW",  0x88E0);
    Tessellator.STATIC_DRAW = new Tessellator.Constant("STATIC_DRAW",  0x88E4);
    Tessellator.DYNAMIC_DRAW = new Tessellator.Constant("DYNAMIC_DRAW",  0x88E8);

    Tessellator.BUFFER_SIZE = new Tessellator.Constant("BUFFER_SIZE",  0x8764);
    Tessellator.BUFFER_USAGE = new Tessellator.Constant("BUFFER_USAGE",  0x8765);

    Tessellator.CURRENT_VERTEX_ATTRIB = new Tessellator.Constant("CURRENT_VERTEX_ATTRIB",  0x8626);

    Tessellator.FRONT = new Tessellator.Constant("FRONT",  0x0404);
    Tessellator.BACK = new Tessellator.Constant("BACK",  0x0405);
    Tessellator.FRONT_AND_BACK = new Tessellator.Constant("FRONT_AND_BACK",  0x0408);

    Tessellator.CULL_FACE = new Tessellator.Constant("CULL_FACE",  0x0B44);
    Tessellator.BLEND = new Tessellator.Constant("BLEND",  0x0BE2);
    Tessellator.DITHER = new Tessellator.Constant("DITHER",  0x0BD0);
    Tessellator.STENCIL_TEST = new Tessellator.Constant("STENCIL_TEST",  0x0B90);
    Tessellator.DEPTH_TEST = new Tessellator.Constant("DEPTH_TEST",  0x0B71);
    Tessellator.SCISSOR_TEST = new Tessellator.Constant("SCISSOR_TEST",  0x0C11);
    Tessellator.POLYGON_OFFSET_FILL = new Tessellator.Constant("POLYGON_OFFSET_FILL",  0x8037);
    Tessellator.SAMPLE_ALPHA_TO_COVERAGE = new Tessellator.Constant("SAMPLE_ALPHA_TO_COVERAGE",  0x809E);
    Tessellator.SAMPLE_COVERAGE = new Tessellator.Constant("SAMPLE_COVERAGE",  0x80A0);

    Tessellator.NO_ERROR = new Tessellator.Constant("NO_ERROR",  0);
    Tessellator.INVALID_ENUM = new Tessellator.Constant("INVALID_ENUM",  0x0500);
    Tessellator.INVALID_VALUE = new Tessellator.Constant("INVALID_VALUE",  0x0501);
    Tessellator.INVALID_OPERATION = new Tessellator.Constant("INVALID_OPERATION",  0x0502);
    Tessellator.OUT_OF_MEMORY = new Tessellator.Constant("OUT_OF_MEMORY",  0x0505);

    Tessellator.CW = new Tessellator.Constant("CW",  0x0900);
    Tessellator.CCW = new Tessellator.Constant("CCW",  0x0901);

    Tessellator.LINE_WIDTH = new Tessellator.Constant("LINE_WIDTH",  0x0B21);
    Tessellator.ALIASED_POINT_SIZE_RANGE = new Tessellator.Constant("ALIASED_POINT_SIZE_RANGE",  0x846D);
    Tessellator.ALIASED_LINE_WIDTH_RANGE = new Tessellator.Constant("ALIASED_LINE_WIDTH_RANGE",  0x846E);
    Tessellator.CULL_FACE_MODE = new Tessellator.Constant("CULL_FACE_MODE",  0x0B45);
    Tessellator.FRONT_FACE = new Tessellator.Constant("FRONT_FACE",  0x0B46);
    Tessellator.DEPTH_RANGE = new Tessellator.Constant("DEPTH_RANGE",  0x0B70);
    Tessellator.DEPTH_WRITEMASK = new Tessellator.Constant("DEPTH_WRITEMASK",  0x0B72);
    Tessellator.DEPTH_CLEAR_VALUE = new Tessellator.Constant("DEPTH_CLEAR_VALUE",  0x0B73);
    Tessellator.DEPTH_FUNC = new Tessellator.Constant("DEPTH_FUNC",  0x0B74);
    Tessellator.STENCIL_CLEAR_VALUE = new Tessellator.Constant("STENCIL_CLEAR_VALUE",  0x0B91);
    Tessellator.STENCIL_FUNC = new Tessellator.Constant("STENCIL_FUNC",  0x0B92);
    Tessellator.STENCIL_FAIL = new Tessellator.Constant("STENCIL_FAIL",  0x0B94);
    Tessellator.STENCIL_PASS_DEPTH_FAIL = new Tessellator.Constant("STENCIL_PASS_DEPTH_FAIL",  0x0B95);
    Tessellator.STENCIL_PASS_DEPTH_PASS = new Tessellator.Constant("STENCIL_PASS_DEPTH_PASS",  0x0B96);
    Tessellator.STENCIL_REF = new Tessellator.Constant("STENCIL_REF",  0x0B97);
    Tessellator.STENCIL_VALUE_MASK = new Tessellator.Constant("STENCIL_VALUE_MASK",  0x0B93);
    Tessellator.STENCIL_WRITEMASK = new Tessellator.Constant("STENCIL_WRITEMASK",  0x0B98);
    Tessellator.STENCIL_BACK_FUNC = new Tessellator.Constant("STENCIL_BACK_FUNC",  0x8800);
    Tessellator.STENCIL_BACK_FAIL = new Tessellator.Constant("STENCIL_BACK_FAIL",  0x8801);
    Tessellator.STENCIL_BACK_PASS_DEPTH_FAIL = new Tessellator.Constant("STENCIL_BACK_PASS_DEPTH_FAIL",  0x8802);
    Tessellator.STENCIL_BACK_PASS_DEPTH_PASS = new Tessellator.Constant("STENCIL_BACK_PASS_DEPTH_PASS",  0x8803);
    Tessellator.STENCIL_BACK_REF = new Tessellator.Constant("STENCIL_BACK_REF",  0x8CA3);
    Tessellator.STENCIL_BACK_VALUE_MASK = new Tessellator.Constant("STENCIL_BACK_VALUE_MASK",  0x8CA4);
    Tessellator.STENCIL_BACK_WRITEMASK = new Tessellator.Constant("STENCIL_BACK_WRITEMASK",  0x8CA5);
    Tessellator.VIEWPORT = new Tessellator.Constant("VIEWPORT",  0x0BA2);
    Tessellator.SCISSOR_BOX = new Tessellator.Constant("SCISSOR_BOX",  0x0C10);

    Tessellator.COLOR_CLEAR_VALUE = new Tessellator.Constant("COLOR_CLEAR_VALUE",  0x0C22);
    Tessellator.COLOR_WRITEMASK = new Tessellator.Constant("COLOR_WRITEMASK",  0x0C23);
    Tessellator.UNPACK_ALIGNMENT = new Tessellator.Constant("UNPACK_ALIGNMENT",  0x0CF5);
    Tessellator.PACK_ALIGNMENT = new Tessellator.Constant("PACK_ALIGNMENT",  0x0D05);
    Tessellator.MAX_TEXTURE_SIZE = new Tessellator.Constant("MAX_TEXTURE_SIZE",  0x0D33);
    Tessellator.MAX_VIEWPORT_DIMS = new Tessellator.Constant("MAX_VIEWPORT_DIMS",  0x0D3A);
    Tessellator.SUBPIXEL_BITS = new Tessellator.Constant("SUBPIXEL_BITS",  0x0D50);
    Tessellator.RED_BITS = new Tessellator.Constant("RED_BITS",  0x0D52);
    Tessellator.GREEN_BITS = new Tessellator.Constant("GREEN_BITS",  0x0D53);
    Tessellator.BLUE_BITS = new Tessellator.Constant("BLUE_BITS",  0x0D54);
    Tessellator.ALPHA_BITS = new Tessellator.Constant("ALPHA_BITS",  0x0D55);
    Tessellator.DEPTH_BITS = new Tessellator.Constant("DEPTH_BITS",  0x0D56);
    Tessellator.STENCIL_BITS = new Tessellator.Constant("STENCIL_BITS",  0x0D57);
    Tessellator.POLYGON_OFFSET_UNITS = new Tessellator.Constant("POLYGON_OFFSET_UNITS",  0x2A00);

    Tessellator.POLYGON_OFFSET_FACTOR = new Tessellator.Constant("POLYGON_OFFSET_FACTOR",  0x8038);
    Tessellator.TEXTURE_BINDING_2D = new Tessellator.Constant("TEXTURE_BINDING_2D",  0x8069);
    Tessellator.SAMPLE_BUFFERS = new Tessellator.Constant("SAMPLE_BUFFERS",  0x80A8);
    Tessellator.SAMPLES = new Tessellator.Constant("SAMPLES",  0x80A9);
    Tessellator.SAMPLE_COVERAGE_VALUE = new Tessellator.Constant("SAMPLE_COVERAGE_VALUE",  0x80AA);
    Tessellator.SAMPLE_COVERAGE_INVERT = new Tessellator.Constant("SAMPLE_COVERAGE_INVERT",  0x80AB);

    Tessellator.COMPRESSED_TEXTURE_FORMATS = new Tessellator.Constant("COMPRESSED_TEXTURE_FORMATS",  0x86A3);

    Tessellator.DONT_CARE = new Tessellator.Constant("DONT_CARE",  0x1100);
    Tessellator.FASTEST = new Tessellator.Constant("FASTEST",  0x1101);
    Tessellator.NICEST = new Tessellator.Constant("NICEST",  0x1102);

    Tessellator.GENERATE_MIPMAP_HINT = new Tessellator.Constant("GENERATE_MIPMAP_HINT",  0x8192);

    Tessellator.BYTE = new Tessellator.Constant("BYTE",  0x1400);
    Tessellator.UNSIGNED_BYTE = new Tessellator.Constant("UNSIGNED_BYTE",  0x1401);
    Tessellator.SHORT = new Tessellator.Constant("SHORT",  0x1402);
    Tessellator.UNSIGNED_SHORT = new Tessellator.Constant("UNSIGNED_SHORT",  0x1403);
    Tessellator.INT = new Tessellator.Constant("INT",  0x1404);
    Tessellator.UNSIGNED_INT = new Tessellator.Constant("UNSIGNED_INT",  0x1405);
    Tessellator.FLOAT = new Tessellator.Constant("FLOAT",  0x1406);

    Tessellator.DEPTH_COMPONENT = new Tessellator.Constant("DEPTH_COMPONENT",  0x1902);
    Tessellator.ALPHA = new Tessellator.Constant("ALPHA",  0x1906);
    Tessellator.RGB = new Tessellator.Constant("RGB",  0x1907);
    Tessellator.RGBA = new Tessellator.Constant("RGBA",  0x1908);
    Tessellator.LUMINANCE = new Tessellator.Constant("LUMINANCE",  0x1909);
    Tessellator.LUMINANCE_ALPHA = new Tessellator.Constant("LUMINANCE_ALPHA",  0x190A);

    Tessellator.UNSIGNED_SHORT_4_4_4_4 = new Tessellator.Constant("UNSIGNED_SHORT_4_4_4_4",  0x8033);
    Tessellator.UNSIGNED_SHORT_5_5_5_1 = new Tessellator.Constant("UNSIGNED_SHORT_5_5_5_1",  0x8034);
    Tessellator.UNSIGNED_SHORT_5_6_5 = new Tessellator.Constant("UNSIGNED_SHORT_5_6_5",  0x8363);

    Tessellator.FRAGMENT_SHADER = new Tessellator.Constant("FRAGMENT_SHADER",  0x8B30);
    Tessellator.VERTEX_SHADER = new Tessellator.Constant("VERTEX_SHADER",  0x8B31);
    Tessellator.MAX_VERTEX_ATTRIBS = new Tessellator.Constant("MAX_VERTEX_ATTRIBS",  0x8869);
    Tessellator.MAX_VERTEX_UNIFORM_VECTORS = new Tessellator.Constant("MAX_VERTEX_UNIFORM_VECTORS",  0x8DFB);
    Tessellator.MAX_VARYING_VECTORS = new Tessellator.Constant("MAX_VARYING_VECTORS",  0x8DFC);
    Tessellator.MAX_COMBINED_TEXTURE_IMAGE_UNITS = new Tessellator.Constant("MAX_COMBINED_TEXTURE_IMAGE_UNITS",  0x8B4D);
    Tessellator.MAX_VERTEX_TEXTURE_IMAGE_UNITS = new Tessellator.Constant("MAX_VERTEX_TEXTURE_IMAGE_UNITS",  0x8B4C);
    Tessellator.MAX_TEXTURE_IMAGE_UNITS = new Tessellator.Constant("MAX_TEXTURE_IMAGE_UNITS",  0x8872);
    Tessellator.MAX_FRAGMENT_UNIFORM_VECTORS = new Tessellator.Constant("MAX_FRAGMENT_UNIFORM_VECTORS",  0x8DFD);
    Tessellator.SHADER_TYPE = new Tessellator.Constant("SHADER_TYPE",  0x8B4F);
    Tessellator.DELETE_STATUS = new Tessellator.Constant("DELETE_STATUS",  0x8B80);
    Tessellator.LINK_STATUS = new Tessellator.Constant("LINK_STATUS",  0x8B82);
    Tessellator.VALIDATE_STATUS = new Tessellator.Constant("VALIDATE_STATUS",  0x8B83);
    Tessellator.ATTACHED_SHADERS = new Tessellator.Constant("ATTACHED_SHADERS",  0x8B85);
    Tessellator.ACTIVE_UNIFORMS = new Tessellator.Constant("ACTIVE_UNIFORMS",  0x8B86);
    Tessellator.ACTIVE_ATTRIBUTES = new Tessellator.Constant("ACTIVE_ATTRIBUTES",  0x8B89);
    Tessellator.SHADING_LANGUAGE_VERSION = new Tessellator.Constant("SHADING_LANGUAGE_VERSION",  0x8B8C);
    Tessellator.CURRENT_PROGRAM = new Tessellator.Constant("CURRENT_PROGRAM",  0x8B8D);

    Tessellator.NEVER = new Tessellator.Constant("NEVER",  0x0200);
    Tessellator.LESS = new Tessellator.Constant("LESS",  0x0201);
    Tessellator.EQUAL = new Tessellator.Constant("EQUAL",  0x0202);
    Tessellator.LEQUAL = new Tessellator.Constant("LEQUAL",  0x0203);
    Tessellator.GREATER = new Tessellator.Constant("GREATER",  0x0204);
    Tessellator.NOTEQUAL = new Tessellator.Constant("NOTEQUAL",  0x0205);
    Tessellator.GEQUAL = new Tessellator.Constant("GEQUAL",  0x0206);
    Tessellator.ALWAYS = new Tessellator.Constant("ALWAYS",  0x0207);

    Tessellator.KEEP = new Tessellator.Constant("KEEP",  0x1E00);
    Tessellator.REPLACE = new Tessellator.Constant("REPLACE",  0x1E01);
    Tessellator.INCR = new Tessellator.Constant("INCR",  0x1E02);
    Tessellator.DECR = new Tessellator.Constant("DECR",  0x1E03);
    Tessellator.INVERT = new Tessellator.Constant("INVERT",  0x150A);
    Tessellator.INCR_WRAP = new Tessellator.Constant("INCR_WRAP",  0x8507);
    Tessellator.DECR_WRAP = new Tessellator.Constant("DECR_WRAP",  0x8508);

    Tessellator.VENDOR = new Tessellator.Constant("VENDOR",  0x1F00);
    Tessellator.RENDERER = new Tessellator.Constant("RENDERER",  0x1F01);
    Tessellator.VERSION = new Tessellator.Constant("VERSION",  0x1F02);

    Tessellator.NEAREST = new Tessellator.Constant("NEAREST",  0x2600);
    Tessellator.LINEAR = new Tessellator.Constant("LINEAR",  0x2601);

    Tessellator.NEAREST_MIPMAP_NEAREST = new Tessellator.Constant("NEAREST_MIPMAP_NEAREST",  0x2700);
    Tessellator.LINEAR_MIPMAP_NEAREST = new Tessellator.Constant("LINEAR_MIPMAP_NEAREST",  0x2701);
    Tessellator.NEAREST_MIPMAP_LINEAR = new Tessellator.Constant("NEAREST_MIPMAP_LINEAR",  0x2702);
    Tessellator.LINEAR_MIPMAP_LINEAR = new Tessellator.Constant("LINEAR_MIPMAP_LINEAR",  0x2703);

    Tessellator.TEXTURE_MAG_FILTER = new Tessellator.Constant("TEXTURE_MAG_FILTER",  0x2800);
    Tessellator.TEXTURE_MIN_FILTER = new Tessellator.Constant("TEXTURE_MIN_FILTER",  0x2801);
    Tessellator.TEXTURE_WRAP_S = new Tessellator.Constant("TEXTURE_WRAP_S",  0x2802);
    Tessellator.TEXTURE_WRAP_T = new Tessellator.Constant("TEXTURE_WRAP_T",  0x2803);

    Tessellator.TEXTURE_2D = new Tessellator.Constant("TEXTURE_2D",  0x0DE1);
    Tessellator.TEXTURE = new Tessellator.Constant("TEXTURE",  0x1702);

    Tessellator.TEXTURE_CUBE_MAP = new Tessellator.Constant("TEXTURE_CUBE_MAP",  0x8513);
    Tessellator.TEXTURE_BINDING_CUBE_MAP = new Tessellator.Constant("TEXTURE_BINDING_CUBE_MAP",  0x8514);
    Tessellator.TEXTURE_CUBE_MAP_POSITIVE_X = new Tessellator.Constant("TEXTURE_CUBE_MAP_POSITIVE_X",  0x8515);
    Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_X = new Tessellator.Constant("TEXTURE_CUBE_MAP_NEGATIVE_X",  0x8516);
    Tessellator.TEXTURE_CUBE_MAP_POSITIVE_Y = new Tessellator.Constant("TEXTURE_CUBE_MAP_POSITIVE_Y",  0x8517);
    Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_Y = new Tessellator.Constant("TEXTURE_CUBE_MAP_NEGATIVE_Y",  0x8518);
    Tessellator.TEXTURE_CUBE_MAP_POSITIVE_Z = new Tessellator.Constant("TEXTURE_CUBE_MAP_POSITIVE_Z",  0x8519);
    Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_Z = new Tessellator.Constant("TEXTURE_CUBE_MAP_NEGATIVE_Z",  0x851A);
    Tessellator.MAX_CUBE_MAP_TEXTURE_SIZE = new Tessellator.Constant("MAX_CUBE_MAP_TEXTURE_SIZE",  0x851C);

    Tessellator.TEXTURE0 = new Tessellator.Constant("TEXTURE0",  0x84C0);
    Tessellator.TEXTURE1 = new Tessellator.Constant("TEXTURE1",  0x84C1);
    Tessellator.TEXTURE2 = new Tessellator.Constant("TEXTURE2",  0x84C2);
    Tessellator.TEXTURE3 = new Tessellator.Constant("TEXTURE3",  0x84C3);
    Tessellator.TEXTURE4 = new Tessellator.Constant("TEXTURE4",  0x84C4);
    Tessellator.TEXTURE5 = new Tessellator.Constant("TEXTURE5",  0x84C5);
    Tessellator.TEXTURE6 = new Tessellator.Constant("TEXTURE6",  0x84C6);
    Tessellator.TEXTURE7 = new Tessellator.Constant("TEXTURE7",  0x84C7);
    Tessellator.TEXTURE8 = new Tessellator.Constant("TEXTURE8",  0x84C8);
    Tessellator.TEXTURE9 = new Tessellator.Constant("TEXTURE9",  0x84C9);
    Tessellator.TEXTURE10 = new Tessellator.Constant("TEXTURE10",  0x84CA);
    Tessellator.TEXTURE11 = new Tessellator.Constant("TEXTURE11",  0x84CB);
    Tessellator.TEXTURE12 = new Tessellator.Constant("TEXTURE12",  0x84CC);
    Tessellator.TEXTURE13 = new Tessellator.Constant("TEXTURE13",  0x84CD);
    Tessellator.TEXTURE14 = new Tessellator.Constant("TEXTURE14",  0x84CE);
    Tessellator.TEXTURE15 = new Tessellator.Constant("TEXTURE15",  0x84CF);
    Tessellator.TEXTURE16 = new Tessellator.Constant("TEXTURE16",  0x84D0);
    Tessellator.TEXTURE17 = new Tessellator.Constant("TEXTURE17",  0x84D1);
    Tessellator.TEXTURE18 = new Tessellator.Constant("TEXTURE18",  0x84D2);
    Tessellator.TEXTURE19 = new Tessellator.Constant("TEXTURE19",  0x84D3);
    Tessellator.TEXTURE20 = new Tessellator.Constant("TEXTURE20",  0x84D4);
    Tessellator.TEXTURE21 = new Tessellator.Constant("TEXTURE21",  0x84D5);
    Tessellator.TEXTURE22 = new Tessellator.Constant("TEXTURE22",  0x84D6);
    Tessellator.TEXTURE23 = new Tessellator.Constant("TEXTURE23",  0x84D7);
    Tessellator.TEXTURE24 = new Tessellator.Constant("TEXTURE24",  0x84D8);
    Tessellator.TEXTURE25 = new Tessellator.Constant("TEXTURE25",  0x84D9);
    Tessellator.TEXTURE26 = new Tessellator.Constant("TEXTURE26",  0x84DA);
    Tessellator.TEXTURE27 = new Tessellator.Constant("TEXTURE27",  0x84DB);
    Tessellator.TEXTURE28 = new Tessellator.Constant("TEXTURE28",  0x84DC);
    Tessellator.TEXTURE29 = new Tessellator.Constant("TEXTURE29",  0x84DD);
    Tessellator.TEXTURE30 = new Tessellator.Constant("TEXTURE30",  0x84DE);
    Tessellator.TEXTURE31 = new Tessellator.Constant("TEXTURE31",  0x84DF);
    Tessellator.ACTIVE_TEXTURE = new Tessellator.Constant("ACTIVE_TEXTURE",  0x84E0);

    Tessellator.REPEAT = new Tessellator.Constant("REPEAT",  0x2901);
    Tessellator.CLAMP_TO_EDGE = new Tessellator.Constant("CLAMP_TO_EDGE",  0x812F);
    Tessellator.MIRRORED_REPEAT = new Tessellator.Constant("MIRRORED_REPEAT",  0x8370);

    Tessellator.FLOAT_VEC2 = new Tessellator.Constant("FLOAT_VEC2",  0x8B50);
    Tessellator.FLOAT_VEC3 = new Tessellator.Constant("FLOAT_VEC3",  0x8B51);
    Tessellator.FLOAT_VEC4 = new Tessellator.Constant("FLOAT_VEC4",  0x8B52);
    Tessellator.INT_VEC2 = new Tessellator.Constant("INT_VEC2",  0x8B53);
    Tessellator.INT_VEC3 = new Tessellator.Constant("INT_VEC3",  0x8B54);
    Tessellator.INT_VEC4 = new Tessellator.Constant("INT_VEC4",  0x8B55);
    Tessellator.BOOL = new Tessellator.Constant("BOOL",  0x8B56);
    Tessellator.BOOL_VEC2 = new Tessellator.Constant("BOOL_VEC2",  0x8B57);
    Tessellator.BOOL_VEC3 = new Tessellator.Constant("BOOL_VEC3",  0x8B58);
    Tessellator.BOOL_VEC4 = new Tessellator.Constant("BOOL_VEC4",  0x8B59);
    Tessellator.FLOAT_MAT2 = new Tessellator.Constant("FLOAT_MAT2",  0x8B5A);
    Tessellator.FLOAT_MAT3 = new Tessellator.Constant("FLOAT_MAT3",  0x8B5B);
    Tessellator.FLOAT_MAT4 = new Tessellator.Constant("FLOAT_MAT4",  0x8B5C);
    Tessellator.SAMPLER_2D = new Tessellator.Constant("SAMPLER_2D",  0x8B5E);
    Tessellator.SAMPLER_CUBE = new Tessellator.Constant("SAMPLER_CUBE",  0x8B60);

    Tessellator.VERTEX_ATTRIB_ARRAY_ENABLED = new Tessellator.Constant("VERTEX_ATTRIB_ARRAY_ENABLED",  0x8622);
    Tessellator.VERTEX_ATTRIB_ARRAY_SIZE = new Tessellator.Constant("VERTEX_ATTRIB_ARRAY_SIZE",  0x8623);
    Tessellator.VERTEX_ATTRIB_ARRAY_STRIDE = new Tessellator.Constant("VERTEX_ATTRIB_ARRAY_STRIDE",  0x8624);
    Tessellator.VERTEX_ATTRIB_ARRAY_TYPE = new Tessellator.Constant("VERTEX_ATTRIB_ARRAY_TYPE",  0x8625);
    Tessellator.VERTEX_ATTRIB_ARRAY_NORMALIZED = new Tessellator.Constant("VERTEX_ATTRIB_ARRAY_NORMALIZED",  0x886A);
    Tessellator.VERTEX_ATTRIB_ARRAY_POINTER = new Tessellator.Constant("VERTEX_ATTRIB_ARRAY_POINTER",  0x8645);
    Tessellator.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = new Tessellator.Constant("VERTEX_ATTRIB_ARRAY_BUFFER_BINDING",  0x889F);

    Tessellator.IMPLEMENTATION_COLOR_READ_TYPE = new Tessellator.Constant("IMPLEMENTATION_COLOR_READ_TYPE",  0x8B9A);
    Tessellator.IMPLEMENTATION_COLOR_READ_FORMAT = new Tessellator.Constant("IMPLEMENTATION_COLOR_READ_FORMAT",  0x8B9B);

    Tessellator.COMPILE_STATUS = new Tessellator.Constant("COMPILE_STATUS",  0x8B81);

    Tessellator.LOW_FLOAT = new Tessellator.Constant("LOW_FLOAT",  0x8DF0);
    Tessellator.MEDIUM_FLOAT = new Tessellator.Constant("MEDIUM_FLOAT",  0x8DF1);
    Tessellator.HIGH_FLOAT = new Tessellator.Constant("HIGH_FLOAT",  0x8DF2);
    Tessellator.LOW_INT = new Tessellator.Constant("LOW_INT",  0x8DF3);
    Tessellator.MEDIUM_INT = new Tessellator.Constant("MEDIUM_INT",  0x8DF4);
    Tessellator.HIGH_INT = new Tessellator.Constant("HIGH_INT",  0x8DF5);

    Tessellator.FRAMEBUFFER = new Tessellator.Constant("FRAMEBUFFER",  0x8D40);
    Tessellator.RENDERBUFFER = new Tessellator.Constant("RENDERBUFFER",  0x8D41);

    Tessellator.RGBA4 = new Tessellator.Constant("RGBA4",  0x8056);
    Tessellator.RGB5_A1 = new Tessellator.Constant("RGB5_A1",  0x8057);
    Tessellator.RGB565 = new Tessellator.Constant("RGB565",  0x8D62);
    Tessellator.DEPTH_COMPONENT16 = new Tessellator.Constant("DEPTH_COMPONENT16",  0x81A5);
    Tessellator.STENCIL_INDEX = new Tessellator.Constant("STENCIL_INDEX",  0x1901);
    Tessellator.STENCIL_INDEX8 = new Tessellator.Constant("STENCIL_INDEX8",  0x8D48);
    Tessellator.DEPTH_STENCIL = new Tessellator.Constant("DEPTH_STENCIL",  0x84F9);

    Tessellator.RENDERBUFFER_WIDTH = new Tessellator.Constant("RENDERBUFFER_WIDTH",  0x8D42);
    Tessellator.RENDERBUFFER_HEIGHT = new Tessellator.Constant("RENDERBUFFER_HEIGHT",  0x8D43);
    Tessellator.RENDERBUFFER_INTERNAL_FORMAT = new Tessellator.Constant("RENDERBUFFER_INTERNAL_FORMAT",  0x8D44);
    Tessellator.RENDERBUFFER_RED_SIZE = new Tessellator.Constant("RENDERBUFFER_RED_SIZE",  0x8D50);
    Tessellator.RENDERBUFFER_GREEN_SIZE = new Tessellator.Constant("RENDERBUFFER_GREEN_SIZE",  0x8D51);
    Tessellator.RENDERBUFFER_BLUE_SIZE = new Tessellator.Constant("RENDERBUFFER_BLUE_SIZE",  0x8D52);
    Tessellator.RENDERBUFFER_ALPHA_SIZE = new Tessellator.Constant("RENDERBUFFER_ALPHA_SIZE",  0x8D53);
    Tessellator.RENDERBUFFER_DEPTH_SIZE = new Tessellator.Constant("RENDERBUFFER_DEPTH_SIZE",  0x8D54);
    Tessellator.RENDERBUFFER_STENCIL_SIZE = new Tessellator.Constant("RENDERBUFFER_STENCIL_SIZE",  0x8D55);

    Tessellator.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE",  0x8CD0);
    Tessellator.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_OBJECT_NAME",  0x8CD1);
    Tessellator.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL",  0x8CD2);
    Tessellator.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE",  0x8CD3);

    Tessellator.COLOR_ATTACHMENT0 = new Tessellator.Constant("COLOR_ATTACHMENT0",  0x8CE0);
    Tessellator.DEPTH_ATTACHMENT = new Tessellator.Constant("DEPTH_ATTACHMENT",  0x8D00);
    Tessellator.STENCIL_ATTACHMENT = new Tessellator.Constant("STENCIL_ATTACHMENT",  0x8D20);
    Tessellator.DEPTH_STENCIL_ATTACHMENT = new Tessellator.Constant("DEPTH_STENCIL_ATTACHMENT",  0x821A);

    Tessellator.NONE = new Tessellator.Constant("NONE",  0);

    Tessellator.FRAMEBUFFER_COMPLETE = new Tessellator.Constant("FRAMEBUFFER_COMPLETE",  0x8CD5);
    Tessellator.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = new Tessellator.Constant("FRAMEBUFFER_INCOMPLETE_ATTACHMENT",  0x8CD6);
    Tessellator.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = new Tessellator.Constant("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT",  0x8CD7);
    Tessellator.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = new Tessellator.Constant("FRAMEBUFFER_INCOMPLETE_DIMENSIONS",  0x8CD9);
    Tessellator.FRAMEBUFFER_UNSUPPORTED = new Tessellator.Constant("FRAMEBUFFER_UNSUPPORTED",  0x8CDD);

    Tessellator.FRAMEBUFFER_BINDING = new Tessellator.Constant("FRAMEBUFFER_BINDING",  0x8CA6);
    Tessellator.RENDERBUFFER_BINDING = new Tessellator.Constant("RENDERBUFFER_BINDING",  0x8CA7);
    Tessellator.MAX_RENDERBUFFER_SIZE = new Tessellator.Constant("MAX_RENDERBUFFER_SIZE",  0x84E8);

    Tessellator.INVALID_FRAMEBUFFER_OPERATION = new Tessellator.Constant("INVALID_FRAMEBUFFER_OPERATION",  0x0506);

    Tessellator.UNPACK_FLIP_Y_WEBGL = new Tessellator.Constant("UNPACK_FLIP_Y_WEBGL",  0x9240);
    Tessellator.UNPACK_PREMULTIPLY_ALPHA_WEBGL = new Tessellator.Constant("UNPACK_PREMULTIPLY_ALPHA_WEBGL",  0x9241);
    Tessellator.CONTEXT_LOST_WEBGL = new Tessellator.Constant("CONTEXT_LOST_WEBGL",  0x9242);
    Tessellator.UNPACK_COLORSPACE_CONVERSION_WEBGL = new Tessellator.Constant("UNPACK_COLORSPACE_CONVERSION_WEBGL",  0x9243);
    Tessellator.BROWSER_DEFAULT_WEBGL = new Tessellator.Constant("BROWSER_DEFAULT_WEBGL",  0x9244);
}
{ //webgl 2.0
    Tessellator.READ_BUFFER = new Tessellator.Constant("READ_BUFFER",  0x0C02);
    Tessellator.UNPACK_ROW_LENGTH = new Tessellator.Constant("UNPACK_ROW_LENGTH",  0x0CF2);
    Tessellator.UNPACK_SKIP_ROWS = new Tessellator.Constant("UNPACK_SKIP_ROWS",  0x0CF3);
    Tessellator.UNPACK_SKIP_PIXELS = new Tessellator.Constant("UNPACK_SKIP_PIXELS",  0x0CF4);
    Tessellator.PACK_ROW_LENGTH = new Tessellator.Constant("PACK_ROW_LENGTH",  0x0D02);
    Tessellator.PACK_SKIP_ROWS = new Tessellator.Constant("PACK_SKIP_ROWS",  0x0D03);
    Tessellator.PACK_SKIP_PIXELS = new Tessellator.Constant("PACK_SKIP_PIXELS",  0x0D04);
    Tessellator.COLOR = new Tessellator.Constant("COLOR",  0x1800);
    Tessellator.DEPTH = new Tessellator.Constant("DEPTH",  0x1801);
    Tessellator.STENCIL = new Tessellator.Constant("STENCIL",  0x1802);
    Tessellator.RED = new Tessellator.Constant("RED",  0x1903);
    Tessellator.RGB8 = new Tessellator.Constant("RGB8",  0x8051);
    Tessellator.RGBA8 = new Tessellator.Constant("RGBA8",  0x8058);
    Tessellator.RGB10_A2 = new Tessellator.Constant("RGB10_A2",  0x8059);
    Tessellator.TEXTURE_BINDING_3D = new Tessellator.Constant("TEXTURE_BINDING_3D",  0x806A);
    Tessellator.UNPACK_SKIP_IMAGES = new Tessellator.Constant("UNPACK_SKIP_IMAGES",  0x806D);
    Tessellator.UNPACK_IMAGE_HEIGHT = new Tessellator.Constant("UNPACK_IMAGE_HEIGHT",  0x806E);
    Tessellator.TEXTURE_3D = new Tessellator.Constant("TEXTURE_3D",  0x806F);
    Tessellator.TEXTURE_WRAP_R = new Tessellator.Constant("TEXTURE_WRAP_R",  0x8072);
    Tessellator.MAX_3D_TEXTURE_SIZE = new Tessellator.Constant("MAX_3D_TEXTURE_SIZE",  0x8073);
    Tessellator.UNSIGNED_INT_2_10_10_10_REV = new Tessellator.Constant("UNSIGNED_INT_2_10_10_10_REV",  0x8368);
    Tessellator.MAX_ELEMENTS_VERTICES = new Tessellator.Constant("MAX_ELEMENTS_VERTICES",  0x80E8);
    Tessellator.MAX_ELEMENTS_INDICES = new Tessellator.Constant("MAX_ELEMENTS_INDICES",  0x80E9);
    Tessellator.TEXTURE_MIN_LOD = new Tessellator.Constant("TEXTURE_MIN_LOD",  0x813A);
    Tessellator.TEXTURE_MAX_LOD = new Tessellator.Constant("TEXTURE_MAX_LOD",  0x813B);
    Tessellator.TEXTURE_BASE_LEVEL = new Tessellator.Constant("TEXTURE_BASE_LEVEL",  0x813C);
    Tessellator.TEXTURE_MAX_LEVEL = new Tessellator.Constant("TEXTURE_MAX_LEVEL",  0x813D);
    Tessellator.MIN = new Tessellator.Constant("MIN",  0x8007);
    Tessellator.MAX = new Tessellator.Constant("MAX",  0x8008);
    Tessellator.DEPTH_COMPONENT24 = new Tessellator.Constant("DEPTH_COMPONENT24",  0x81A6);
    Tessellator.MAX_TEXTURE_LOD_BIAS = new Tessellator.Constant("MAX_TEXTURE_LOD_BIAS",  0x84FD);
    Tessellator.TEXTURE_COMPARE_MODE = new Tessellator.Constant("TEXTURE_COMPARE_MODE",  0x884C);
    Tessellator.TEXTURE_COMPARE_FUNC = new Tessellator.Constant("TEXTURE_COMPARE_FUNC",  0x884D);
    Tessellator.CURRENT_QUERY = new Tessellator.Constant("CURRENT_QUERY",  0x8865);
    Tessellator.QUERY_RESULT = new Tessellator.Constant("QUERY_RESULT",  0x8866);
    Tessellator.QUERY_RESULT_AVAILABLE = new Tessellator.Constant("QUERY_RESULT_AVAILABLE",  0x8867);
    Tessellator.STREAM_READ = new Tessellator.Constant("STREAM_READ",  0x88E1);
    Tessellator.STREAM_COPY = new Tessellator.Constant("STREAM_COPY",  0x88E2);
    Tessellator.STATIC_READ = new Tessellator.Constant("STATIC_READ",  0x88E5);
    Tessellator.STATIC_COPY = new Tessellator.Constant("STATIC_COPY",  0x88E6);
    Tessellator.DYNAMIC_READ = new Tessellator.Constant("DYNAMIC_READ",  0x88E9);
    Tessellator.DYNAMIC_COPY = new Tessellator.Constant("DYNAMIC_COPY",  0x88EA);
    Tessellator.MAX_DRAW_BUFFERS = new Tessellator.Constant("MAX_DRAW_BUFFERS",  0x8824);
    Tessellator.DRAW_BUFFER0 = new Tessellator.Constant("DRAW_BUFFER0",  0x8825);
    Tessellator.DRAW_BUFFER1 = new Tessellator.Constant("DRAW_BUFFER1",  0x8826);
    Tessellator.DRAW_BUFFER2 = new Tessellator.Constant("DRAW_BUFFER2",  0x8827);
    Tessellator.DRAW_BUFFER3 = new Tessellator.Constant("DRAW_BUFFER3",  0x8828);
    Tessellator.DRAW_BUFFER4 = new Tessellator.Constant("DRAW_BUFFER4",  0x8829);
    Tessellator.DRAW_BUFFER5 = new Tessellator.Constant("DRAW_BUFFER5",  0x882A);
    Tessellator.DRAW_BUFFER6 = new Tessellator.Constant("DRAW_BUFFER6",  0x882B);
    Tessellator.DRAW_BUFFER7 = new Tessellator.Constant("DRAW_BUFFER7",  0x882C);
    Tessellator.DRAW_BUFFER8 = new Tessellator.Constant("DRAW_BUFFER8",  0x882D);
    Tessellator.DRAW_BUFFER9 = new Tessellator.Constant("DRAW_BUFFER9",  0x882E);
    Tessellator.DRAW_BUFFER10 = new Tessellator.Constant("DRAW_BUFFER10",  0x882F);
    Tessellator.DRAW_BUFFER11 = new Tessellator.Constant("DRAW_BUFFER11",  0x8830);
    Tessellator.DRAW_BUFFER12 = new Tessellator.Constant("DRAW_BUFFER12",  0x8831);
    Tessellator.DRAW_BUFFER13 = new Tessellator.Constant("DRAW_BUFFER13",  0x8832);
    Tessellator.DRAW_BUFFER14 = new Tessellator.Constant("DRAW_BUFFER14",  0x8833);
    Tessellator.DRAW_BUFFER15 = new Tessellator.Constant("DRAW_BUFFER15",  0x8834);
    Tessellator.MAX_FRAGMENT_UNIFORM_COMPONENTS = new Tessellator.Constant("MAX_FRAGMENT_UNIFORM_COMPONENTS",  0x8B49);
    Tessellator.MAX_VERTEX_UNIFORM_COMPONENTS = new Tessellator.Constant("MAX_VERTEX_UNIFORM_COMPONENTS",  0x8B4A);
    Tessellator.SAMPLER_3D = new Tessellator.Constant("SAMPLER_3D",  0x8B5F);
    Tessellator.SAMPLER_2D_SHADOW = new Tessellator.Constant("SAMPLER_2D_SHADOW",  0x8B62);
    Tessellator.FRAGMENT_SHADER_DERIVATIVE_HINT = new Tessellator.Constant("FRAGMENT_SHADER_DERIVATIVE_HINT",  0x8B8B);
    Tessellator.PIXEL_PACK_BUFFER = new Tessellator.Constant("PIXEL_PACK_BUFFER",  0x88EB);
    Tessellator.PIXEL_UNPACK_BUFFER = new Tessellator.Constant("PIXEL_UNPACK_BUFFER",  0x88EC);
    Tessellator.PIXEL_PACK_BUFFER_BINDING = new Tessellator.Constant("PIXEL_PACK_BUFFER_BINDING",  0x88ED);
    Tessellator.PIXEL_UNPACK_BUFFER_BINDING = new Tessellator.Constant("PIXEL_UNPACK_BUFFER_BINDING",  0x88EF);
    Tessellator.FLOAT_MAT2x3 = new Tessellator.Constant("FLOAT_MAT2x3",  0x8B65);
    Tessellator.FLOAT_MAT2x4 = new Tessellator.Constant("FLOAT_MAT2x4",  0x8B66);
    Tessellator.FLOAT_MAT3x2 = new Tessellator.Constant("FLOAT_MAT3x2",  0x8B67);
    Tessellator.FLOAT_MAT3x4 = new Tessellator.Constant("FLOAT_MAT3x4",  0x8B68);
    Tessellator.FLOAT_MAT4x2 = new Tessellator.Constant("FLOAT_MAT4x2",  0x8B69);
    Tessellator.FLOAT_MAT4x3 = new Tessellator.Constant("FLOAT_MAT4x3",  0x8B6A);
    Tessellator.SRGB = new Tessellator.Constant("SRGB",  0x8C40);
    Tessellator.SRGB8 = new Tessellator.Constant("SRGB8",  0x8C41);
    Tessellator.SRGB8_ALPHA8 = new Tessellator.Constant("SRGB8_ALPHA8",  0x8C43);
    Tessellator.COMPARE_REF_TO_TEXTURE = new Tessellator.Constant("COMPARE_REF_TO_TEXTURE",  0x884E);
    Tessellator.RGBA32F = new Tessellator.Constant("RGBA32F",  0x8814);
    Tessellator.RGB32F = new Tessellator.Constant("RGB32F",  0x8815);
    Tessellator.RGBA16F = new Tessellator.Constant("RGBA16F",  0x881A);
    Tessellator.RGB16F = new Tessellator.Constant("RGB16F",  0x881B);
    Tessellator.VERTEX_ATTRIB_ARRAY_INTEGER = new Tessellator.Constant("VERTEX_ATTRIB_ARRAY_INTEGER",  0x88FD);
    Tessellator.MAX_ARRAY_TEXTURE_LAYERS = new Tessellator.Constant("MAX_ARRAY_TEXTURE_LAYERS",  0x88FF);
    Tessellator.MIN_PROGRAM_TEXEL_OFFSET = new Tessellator.Constant("MIN_PROGRAM_TEXEL_OFFSET",  0x8904);
    Tessellator.MAX_PROGRAM_TEXEL_OFFSET = new Tessellator.Constant("MAX_PROGRAM_TEXEL_OFFSET",  0x8905);
    Tessellator.MAX_VARYING_COMPONENTS = new Tessellator.Constant("MAX_VARYING_COMPONENTS",  0x8B4B);
    Tessellator.TEXTURE_2D_ARRAY = new Tessellator.Constant("TEXTURE_2D_ARRAY",  0x8C1A);
    Tessellator.TEXTURE_BINDING_2D_ARRAY = new Tessellator.Constant("TEXTURE_BINDING_2D_ARRAY",  0x8C1D);
    Tessellator.R11F_G11F_B10F = new Tessellator.Constant("R11F_G11F_B10F",  0x8C3A);
    Tessellator.UNSIGNED_INT_10F_11F_11F_REV = new Tessellator.Constant("UNSIGNED_INT_10F_11F_11F_REV",  0x8C3B);
    Tessellator.RGB9_E5 = new Tessellator.Constant("RGB9_E5",  0x8C3D);
    Tessellator.UNSIGNED_INT_5_9_9_9_REV = new Tessellator.Constant("UNSIGNED_INT_5_9_9_9_REV",  0x8C3E);
    Tessellator.TRANSFORM_FEEDBACK_BUFFER_MODE = new Tessellator.Constant("TRANSFORM_FEEDBACK_BUFFER_MODE",  0x8C7F);
    Tessellator.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS = new Tessellator.Constant("MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS",  0x8C80);
    Tessellator.TRANSFORM_FEEDBACK_VARYINGS = new Tessellator.Constant("TRANSFORM_FEEDBACK_VARYINGS",  0x8C83);
    Tessellator.TRANSFORM_FEEDBACK_BUFFER_START = new Tessellator.Constant("TRANSFORM_FEEDBACK_BUFFER_START",  0x8C84);
    Tessellator.TRANSFORM_FEEDBACK_BUFFER_SIZE = new Tessellator.Constant("TRANSFORM_FEEDBACK_BUFFER_SIZE",  0x8C85);
    Tessellator.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = new Tessellator.Constant("TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN",  0x8C88);
    Tessellator.RASTERIZER_DISCARD = new Tessellator.Constant("RASTERIZER_DISCARD",  0x8C89);
    Tessellator.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS = new Tessellator.Constant("MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS",  0x8C8A);
    Tessellator.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS = new Tessellator.Constant("MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS",  0x8C8B);
    Tessellator.INTERLEAVED_ATTRIBS = new Tessellator.Constant("INTERLEAVED_ATTRIBS",  0x8C8C);
    Tessellator.SEPARATE_ATTRIBS = new Tessellator.Constant("SEPARATE_ATTRIBS",  0x8C8D);
    Tessellator.TRANSFORM_FEEDBACK_BUFFER = new Tessellator.Constant("TRANSFORM_FEEDBACK_BUFFER",  0x8C8E);
    Tessellator.TRANSFORM_FEEDBACK_BUFFER_BINDING = new Tessellator.Constant("TRANSFORM_FEEDBACK_BUFFER_BINDING",  0x8C8F);
    Tessellator.RGBA32UI = new Tessellator.Constant("RGBA32UI",  0x8D70);
    Tessellator.RGB32UI = new Tessellator.Constant("RGB32UI",  0x8D71);
    Tessellator.RGBA16UI = new Tessellator.Constant("RGBA16UI",  0x8D76);
    Tessellator.RGB16UI = new Tessellator.Constant("RGB16UI",  0x8D77);
    Tessellator.RGBA8UI = new Tessellator.Constant("RGBA8UI",  0x8D7C);
    Tessellator.RGB8UI = new Tessellator.Constant("RGB8UI",  0x8D7D);
    Tessellator.RGBA32I = new Tessellator.Constant("RGBA32I",  0x8D82);
    Tessellator.RGB32I = new Tessellator.Constant("RGB32I",  0x8D83);
    Tessellator.RGBA16I = new Tessellator.Constant("RGBA16I",  0x8D88);
    Tessellator.RGB16I = new Tessellator.Constant("RGB16I",  0x8D89);
    Tessellator.RGBA8I = new Tessellator.Constant("RGBA8I",  0x8D8E);
    Tessellator.RGB8I = new Tessellator.Constant("RGB8I",  0x8D8F);
    Tessellator.RED_INTEGER = new Tessellator.Constant("RED_INTEGER",  0x8D94);
    Tessellator.RGB_INTEGER = new Tessellator.Constant("RGB_INTEGER",  0x8D98);
    Tessellator.RGBA_INTEGER = new Tessellator.Constant("RGBA_INTEGER",  0x8D99);
    Tessellator.SAMPLER_2D_ARRAY = new Tessellator.Constant("SAMPLER_2D_ARRAY",  0x8DC1);
    Tessellator.SAMPLER_2D_ARRAY_SHADOW = new Tessellator.Constant("SAMPLER_2D_ARRAY_SHADOW",  0x8DC4);
    Tessellator.SAMPLER_CUBE_SHADOW = new Tessellator.Constant("SAMPLER_CUBE_SHADOW",  0x8DC5);
    Tessellator.UNSIGNED_INT_VEC2 = new Tessellator.Constant("UNSIGNED_INT_VEC2",  0x8DC6);
    Tessellator.UNSIGNED_INT_VEC3 = new Tessellator.Constant("UNSIGNED_INT_VEC3",  0x8DC7);
    Tessellator.UNSIGNED_INT_VEC4 = new Tessellator.Constant("UNSIGNED_INT_VEC4",  0x8DC8);
    Tessellator.INT_SAMPLER_2D = new Tessellator.Constant("INT_SAMPLER_2D",  0x8DCA);
    Tessellator.INT_SAMPLER_3D = new Tessellator.Constant("INT_SAMPLER_3D",  0x8DCB);
    Tessellator.INT_SAMPLER_CUBE = new Tessellator.Constant("INT_SAMPLER_CUBE",  0x8DCC);
    Tessellator.INT_SAMPLER_2D_ARRAY = new Tessellator.Constant("INT_SAMPLER_2D_ARRAY",  0x8DCF);
    Tessellator.UNSIGNED_INT_SAMPLER_2D = new Tessellator.Constant("UNSIGNED_INT_SAMPLER_2D",  0x8DD2);
    Tessellator.UNSIGNED_INT_SAMPLER_3D = new Tessellator.Constant("UNSIGNED_INT_SAMPLER_3D",  0x8DD3);
    Tessellator.UNSIGNED_INT_SAMPLER_CUBE = new Tessellator.Constant("UNSIGNED_INT_SAMPLER_CUBE",  0x8DD4);
    Tessellator.UNSIGNED_INT_SAMPLER_2D_ARRAY = new Tessellator.Constant("UNSIGNED_INT_SAMPLER_2D_ARRAY",  0x8DD7);
    Tessellator.DEPTH_COMPONENT32F = new Tessellator.Constant("DEPTH_COMPONENT32F",  0x8CAC);
    Tessellator.DEPTH32F_STENCIL8 = new Tessellator.Constant("DEPTH32F_STENCIL8",  0x8CAD);
    Tessellator.FLOAT_32_UNSIGNED_INT_24_8_REV = new Tessellator.Constant("FLOAT_32_UNSIGNED_INT_24_8_REV",  0x8DAD);
    Tessellator.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING",  0x8210);
    Tessellator.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE",  0x8211);
    Tessellator.FRAMEBUFFER_ATTACHMENT_RED_SIZE = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_RED_SIZE",  0x8212);
    Tessellator.FRAMEBUFFER_ATTACHMENT_GREEN_SIZE = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_GREEN_SIZE",  0x8213);
    Tessellator.FRAMEBUFFER_ATTACHMENT_BLUE_SIZE = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_BLUE_SIZE",  0x8214);
    Tessellator.FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE",  0x8215);
    Tessellator.FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE",  0x8216);
    Tessellator.FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE",  0x8217);
    Tessellator.FRAMEBUFFER_DEFAULT = new Tessellator.Constant("FRAMEBUFFER_DEFAULT",  0x8218);
    Tessellator.DEPTH_STENCIL_ATTACHMENT = new Tessellator.Constant("DEPTH_STENCIL_ATTACHMENT",  0x821A);
    Tessellator.DEPTH_STENCIL = new Tessellator.Constant("DEPTH_STENCIL",  0x84F9);
    Tessellator.UNSIGNED_INT_24_8 = new Tessellator.Constant("UNSIGNED_INT_24_8",  0x84FA);
    Tessellator.DEPTH24_STENCIL8 = new Tessellator.Constant("DEPTH24_STENCIL8",  0x88F0);
    Tessellator.UNSIGNED_NORMALIZED = new Tessellator.Constant("UNSIGNED_NORMALIZED",  0x8C17);
    Tessellator.DRAW_FRAMEBUFFER_BINDING = new Tessellator.Constant("DRAW_FRAMEBUFFER_BINDING",  0x8CA6);
    Tessellator.READ_FRAMEBUFFER = new Tessellator.Constant("READ_FRAMEBUFFER",  0x8CA8);
    Tessellator.DRAW_FRAMEBUFFER = new Tessellator.Constant("DRAW_FRAMEBUFFER",  0x8CA9);
    Tessellator.READ_FRAMEBUFFER_BINDING = new Tessellator.Constant("READ_FRAMEBUFFER_BINDING",  0x8CAA);
    Tessellator.RENDERBUFFER_SAMPLES = new Tessellator.Constant("RENDERBUFFER_SAMPLES",  0x8CAB);
    Tessellator.FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER = new Tessellator.Constant("FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER",  0x8CD4);
    Tessellator.MAX_COLOR_ATTACHMENTS = new Tessellator.Constant("MAX_COLOR_ATTACHMENTS",  0x8CDF);
    Tessellator.COLOR_ATTACHMENT1 = new Tessellator.Constant("COLOR_ATTACHMENT1",  0x8CE1);
    Tessellator.COLOR_ATTACHMENT2 = new Tessellator.Constant("COLOR_ATTACHMENT2",  0x8CE2);
    Tessellator.COLOR_ATTACHMENT3 = new Tessellator.Constant("COLOR_ATTACHMENT3",  0x8CE3);
    Tessellator.COLOR_ATTACHMENT4 = new Tessellator.Constant("COLOR_ATTACHMENT4",  0x8CE4);
    Tessellator.COLOR_ATTACHMENT5 = new Tessellator.Constant("COLOR_ATTACHMENT5",  0x8CE5);
    Tessellator.COLOR_ATTACHMENT6 = new Tessellator.Constant("COLOR_ATTACHMENT6",  0x8CE6);
    Tessellator.COLOR_ATTACHMENT7 = new Tessellator.Constant("COLOR_ATTACHMENT7",  0x8CE7);
    Tessellator.COLOR_ATTACHMENT8 = new Tessellator.Constant("COLOR_ATTACHMENT8",  0x8CE8);
    Tessellator.COLOR_ATTACHMENT9 = new Tessellator.Constant("COLOR_ATTACHMENT9",  0x8CE9);
    Tessellator.COLOR_ATTACHMENT10 = new Tessellator.Constant("COLOR_ATTACHMENT10",  0x8CEA);
    Tessellator.COLOR_ATTACHMENT11 = new Tessellator.Constant("COLOR_ATTACHMENT11",  0x8CEB);
    Tessellator.COLOR_ATTACHMENT12 = new Tessellator.Constant("COLOR_ATTACHMENT12",  0x8CEC);
    Tessellator.COLOR_ATTACHMENT13 = new Tessellator.Constant("COLOR_ATTACHMENT13",  0x8CED);
    Tessellator.COLOR_ATTACHMENT14 = new Tessellator.Constant("COLOR_ATTACHMENT14",  0x8CEE);
    Tessellator.COLOR_ATTACHMENT15 = new Tessellator.Constant("COLOR_ATTACHMENT15",  0x8CEF);
    Tessellator.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE = new Tessellator.Constant("FRAMEBUFFER_INCOMPLETE_MULTISAMPLE",  0x8D56);
    Tessellator.MAX_SAMPLES = new Tessellator.Constant("MAX_SAMPLES",  0x8D57);
    Tessellator.HALF_FLOAT = new Tessellator.Constant("HALF_FLOAT",  0x140B);
    Tessellator.RG = new Tessellator.Constant("RG",  0x8227);
    Tessellator.RG_INTEGER = new Tessellator.Constant("RG_INTEGER",  0x8228);
    Tessellator.R8 = new Tessellator.Constant("R8",  0x8229);
    Tessellator.RG8 = new Tessellator.Constant("RG8",  0x822B);
    Tessellator.R16F = new Tessellator.Constant("R16F",  0x822D);
    Tessellator.R32F = new Tessellator.Constant("R32F",  0x822E);
    Tessellator.RG16F = new Tessellator.Constant("RG16F",  0x822F);
    Tessellator.RG32F = new Tessellator.Constant("RG32F",  0x8230);
    Tessellator.R8I = new Tessellator.Constant("R8I",  0x8231);
    Tessellator.R8UI = new Tessellator.Constant("R8UI",  0x8232);
    Tessellator.R16I = new Tessellator.Constant("R16I",  0x8233);
    Tessellator.R16UI = new Tessellator.Constant("R16UI",  0x8234);
    Tessellator.R32I = new Tessellator.Constant("R32I",  0x8235);
    Tessellator.R32UI = new Tessellator.Constant("R32UI",  0x8236);
    Tessellator.RG8I = new Tessellator.Constant("RG8I",  0x8237);
    Tessellator.RG8UI = new Tessellator.Constant("RG8UI",  0x8238);
    Tessellator.RG16I = new Tessellator.Constant("RG16I",  0x8239);
    Tessellator.RG16UI = new Tessellator.Constant("RG16UI",  0x823A);
    Tessellator.RG32I = new Tessellator.Constant("RG32I",  0x823B);
    Tessellator.RG32UI = new Tessellator.Constant("RG32UI",  0x823C);
    Tessellator.VERTEX_ARRAY_BINDING = new Tessellator.Constant("VERTEX_ARRAY_BINDING",  0x85B5);
    Tessellator.R8_SNORM = new Tessellator.Constant("R8_SNORM",  0x8F94);
    Tessellator.RG8_SNORM = new Tessellator.Constant("RG8_SNORM",  0x8F95);
    Tessellator.RGB8_SNORM = new Tessellator.Constant("RGB8_SNORM",  0x8F96);
    Tessellator.RGBA8_SNORM = new Tessellator.Constant("RGBA8_SNORM",  0x8F97);
    Tessellator.SIGNED_NORMALIZED = new Tessellator.Constant("SIGNED_NORMALIZED",  0x8F9C);
    Tessellator.COPY_READ_BUFFER = new Tessellator.Constant("COPY_READ_BUFFER",  0x8F36);
    Tessellator.COPY_WRITE_BUFFER = new Tessellator.Constant("COPY_WRITE_BUFFER",  0x8F37);
    Tessellator.COPY_READ_BUFFER_BINDING = new Tessellator.Constant("COPY_READ_BUFFER_BINDING",  0x8F36);
    Tessellator.COPY_WRITE_BUFFER_BINDING = new Tessellator.Constant("COPY_WRITE_BUFFER_BINDING",  0x8F37);
    Tessellator.UNIFORM_BUFFER = new Tessellator.Constant("UNIFORM_BUFFER",  0x8A11);
    Tessellator.UNIFORM_BUFFER_BINDING = new Tessellator.Constant("UNIFORM_BUFFER_BINDING",  0x8A28);
    Tessellator.UNIFORM_BUFFER_START = new Tessellator.Constant("UNIFORM_BUFFER_START",  0x8A29);
    Tessellator.UNIFORM_BUFFER_SIZE = new Tessellator.Constant("UNIFORM_BUFFER_SIZE",  0x8A2A);
    Tessellator.MAX_VERTEX_UNIFORM_BLOCKS = new Tessellator.Constant("MAX_VERTEX_UNIFORM_BLOCKS",  0x8A2B);
    Tessellator.MAX_FRAGMENT_UNIFORM_BLOCKS = new Tessellator.Constant("MAX_FRAGMENT_UNIFORM_BLOCKS",  0x8A2D);
    Tessellator.MAX_COMBINED_UNIFORM_BLOCKS = new Tessellator.Constant("MAX_COMBINED_UNIFORM_BLOCKS",  0x8A2E);
    Tessellator.MAX_UNIFORM_BUFFER_BINDINGS = new Tessellator.Constant("MAX_UNIFORM_BUFFER_BINDINGS",  0x8A2F);
    Tessellator.MAX_UNIFORM_BLOCK_SIZE = new Tessellator.Constant("MAX_UNIFORM_BLOCK_SIZE",  0x8A30);
    Tessellator.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS = new Tessellator.Constant("MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS",  0x8A31);
    Tessellator.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS = new Tessellator.Constant("MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS",  0x8A33);
    Tessellator.UNIFORM_BUFFER_OFFSET_ALIGNMENT = new Tessellator.Constant("UNIFORM_BUFFER_OFFSET_ALIGNMENT",  0x8A34);
    Tessellator.ACTIVE_UNIFORM_BLOCKS = new Tessellator.Constant("ACTIVE_UNIFORM_BLOCKS",  0x8A36);
    Tessellator.UNIFORM_TYPE = new Tessellator.Constant("UNIFORM_TYPE",  0x8A37);
    Tessellator.UNIFORM_SIZE = new Tessellator.Constant("UNIFORM_SIZE",  0x8A38);
    Tessellator.UNIFORM_BLOCK_INDEX = new Tessellator.Constant("UNIFORM_BLOCK_INDEX",  0x8A3A);
    Tessellator.UNIFORM_OFFSET = new Tessellator.Constant("UNIFORM_OFFSET",  0x8A3B);
    Tessellator.UNIFORM_ARRAY_STRIDE = new Tessellator.Constant("UNIFORM_ARRAY_STRIDE",  0x8A3C);
    Tessellator.UNIFORM_MATRIX_STRIDE = new Tessellator.Constant("UNIFORM_MATRIX_STRIDE",  0x8A3D);
    Tessellator.UNIFORM_IS_ROW_MAJOR = new Tessellator.Constant("UNIFORM_IS_ROW_MAJOR",  0x8A3E);
    Tessellator.UNIFORM_BLOCK_BINDING = new Tessellator.Constant("UNIFORM_BLOCK_BINDING",  0x8A3F);
    Tessellator.UNIFORM_BLOCK_DATA_SIZE = new Tessellator.Constant("UNIFORM_BLOCK_DATA_SIZE",  0x8A40);
    Tessellator.UNIFORM_BLOCK_ACTIVE_UNIFORMS = new Tessellator.Constant("UNIFORM_BLOCK_ACTIVE_UNIFORMS",  0x8A42);
    Tessellator.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES = new Tessellator.Constant("UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES",  0x8A43);
    Tessellator.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER = new Tessellator.Constant("UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER",  0x8A44);
    Tessellator.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = new Tessellator.Constant("UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER",  0x8A46);
    Tessellator.INVALID_INDEX = new Tessellator.Constant("INVALID_INDEX",  0xFFFFFFFF);
    Tessellator.MAX_VERTEX_OUTPUT_COMPONENTS = new Tessellator.Constant("MAX_VERTEX_OUTPUT_COMPONENTS",  0x9122);
    Tessellator.MAX_FRAGMENT_INPUT_COMPONENTS = new Tessellator.Constant("MAX_FRAGMENT_INPUT_COMPONENTS",  0x9125);
    Tessellator.MAX_SERVER_WAIT_TIMEOUT = new Tessellator.Constant("MAX_SERVER_WAIT_TIMEOUT",  0x9111);
    Tessellator.OBJECT_TYPE = new Tessellator.Constant("OBJECT_TYPE",  0x9112);
    Tessellator.SYNC_CONDITION = new Tessellator.Constant("SYNC_CONDITION",  0x9113);
    Tessellator.SYNC_STATUS = new Tessellator.Constant("SYNC_STATUS",  0x9114);
    Tessellator.SYNC_FLAGS = new Tessellator.Constant("SYNC_FLAGS",  0x9115);
    Tessellator.SYNC_FENCE = new Tessellator.Constant("SYNC_FENCE",  0x9116);
    Tessellator.SYNC_GPU_COMMANDS_COMPLETE = new Tessellator.Constant("SYNC_GPU_COMMANDS_COMPLETE",  0x9117);
    Tessellator.UNSIGNALED = new Tessellator.Constant("UNSIGNALED",  0x9118);
    Tessellator.SIGNALED = new Tessellator.Constant("SIGNALED",  0x9119);
    Tessellator.ALREADY_SIGNALED = new Tessellator.Constant("ALREADY_SIGNALED",  0x911A);
    Tessellator.TIMEOUT_EXPIRED = new Tessellator.Constant("TIMEOUT_EXPIRED",  0x911B);
    Tessellator.CONDITION_SATISFIED = new Tessellator.Constant("CONDITION_SATISFIED",  0x911C);
    Tessellator.WAIT_FAILED = new Tessellator.Constant("WAIT_FAILED",  0x911D);
    Tessellator.SYNC_FLUSH_COMMANDS_BIT = new Tessellator.Constant("SYNC_FLUSH_COMMANDS_BIT",  0x00000001);
    Tessellator.VERTEX_ATTRIB_ARRAY_DIVISOR = new Tessellator.Constant("VERTEX_ATTRIB_ARRAY_DIVISOR",  0x88FE);
    Tessellator.ANY_SAMPLES_PASSED = new Tessellator.Constant("ANY_SAMPLES_PASSED",  0x8C2F);
    Tessellator.ANY_SAMPLES_PASSED_CONSERVATIVE = new Tessellator.Constant("ANY_SAMPLES_PASSED_CONSERVATIVE",  0x8D6A);
    Tessellator.SAMPLER_BINDING = new Tessellator.Constant("SAMPLER_BINDING",  0x8919);
    Tessellator.RGB10_A2UI = new Tessellator.Constant("RGB10_A2UI",  0x906F);
    Tessellator.INT_2_10_10_10_REV = new Tessellator.Constant("INT_2_10_10_10_REV",  0x8D9F);
    Tessellator.TRANSFORM_FEEDBACK = new Tessellator.Constant("TRANSFORM_FEEDBACK",  0x8E22);
    Tessellator.TRANSFORM_FEEDBACK_PAUSED = new Tessellator.Constant("TRANSFORM_FEEDBACK_PAUSED",  0x8E23);
    Tessellator.TRANSFORM_FEEDBACK_ACTIVE = new Tessellator.Constant("TRANSFORM_FEEDBACK_ACTIVE",  0x8E24);
    Tessellator.TRANSFORM_FEEDBACK_BINDING = new Tessellator.Constant("TRANSFORM_FEEDBACK_BINDING",  0x8E25);
    Tessellator.COMPRESSED_R11_EAC = new Tessellator.Constant("COMPRESSED_R11_EAC",  0x9270);
    Tessellator.COMPRESSED_SIGNED_R11_EAC = new Tessellator.Constant("COMPRESSED_SIGNED_R11_EAC",  0x9271);
    Tessellator.COMPRESSED_RG11_EAC = new Tessellator.Constant("COMPRESSED_RG11_EAC",  0x9272);
    Tessellator.COMPRESSED_SIGNED_RG11_EAC = new Tessellator.Constant("COMPRESSED_SIGNED_RG11_EAC",  0x9273);
    Tessellator.COMPRESSED_RGB8_ETC2 = new Tessellator.Constant("COMPRESSED_RGB8_ETC2",  0x9274);
    Tessellator.COMPRESSED_SRGB8_ETC2 = new Tessellator.Constant("COMPRESSED_SRGB8_ETC2",  0x9275);
    Tessellator.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = new Tessellator.Constant("COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2",  0x9276);
    Tessellator.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = new Tessellator.Constant("COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2",  0x9277);
    Tessellator.COMPRESSED_RGBA8_ETC2_EAC = new Tessellator.Constant("COMPRESSED_RGBA8_ETC2_EAC",  0x9278);
    Tessellator.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = new Tessellator.Constant("COMPRESSED_SRGB8_ALPHA8_ETC2_EAC",  0x9279);
    Tessellator.TEXTURE_IMMUTABLE_FORMAT = new Tessellator.Constant("TEXTURE_IMMUTABLE_FORMAT",  0x912F);
    Tessellator.MAX_ELEMENT_INDEX = new Tessellator.Constant("MAX_ELEMENT_INDEX",  0x8D6B);
    Tessellator.TEXTURE_IMMUTABLE_LEVELS = new Tessellator.Constant("TEXTURE_IMMUTABLE_LEVELS",  0x82DF);
}
{ //tessellator
    Tessellator.COLOR = Tessellator.Constant.create("COLOR");
    Tessellator.VERTEX = Tessellator.Constant.create("VERTEX");
    Tessellator.TRANSLATE = Tessellator.Constant.create("TRANSLATE");
    Tessellator.ROTATE = Tessellator.Constant.create("ROTATE");
    Tessellator.SCALE = Tessellator.Constant.create("SCALE");
    Tessellator.START = Tessellator.Constant.create("START");
    Tessellator.END = Tessellator.Constant.create("END");
    Tessellator.OBJECT = Tessellator.Constant.create("OBJECT");
    Tessellator.MODEL = Tessellator.Constant.create("MODEL");
    Tessellator.MODEL_FRAGMENT = Tessellator.Constant.create("MODEL_FRAGMENT");
    Tessellator.TEXTURE = Tessellator.Constant.create("TEXTURE");
    Tessellator.TEXTURE_SCALE = Tessellator.Constant.create("TEXTURE_SCALE");
    Tessellator.NORMAL = Tessellator.Constant.create("NORMAL");
    Tessellator.TEXT = Tessellator.Constant.create("TEXT");
    Tessellator.ENABLE = Tessellator.Constant.create("ENABLE");
    Tessellator.DISABLE = Tessellator.Constant.create("DISABLE");
    Tessellator.MASK = Tessellator.Constant.create("MASK");
    Tessellator.FLUSH = Tessellator.Constant.create("FLUSH");
    Tessellator.FONT_SHEET = Tessellator.Constant.create("FONT_SHEET");
    Tessellator.VIEW = Tessellator.Constant.create("VIEW");
    Tessellator.CAMERA = Tessellator.Constant.create("CAMERA");
    Tessellator.LIGHTING = Tessellator.Constant.create("LIGHTING");
    Tessellator.LIGHTING_AMBIENT = Tessellator.Constant.create("LIGHTING_AMBIENT");
    Tessellator.LIGHTING_DIRECTIONAL = Tessellator.Constant.create("LIGHTING_DIRECTIONAL");
    Tessellator.LIGHTING_POINT = Tessellator.Constant.create("LIGHTING_POINT");
    Tessellator.LIGHTING_SPECULAR = Tessellator.Constant.create("LIGHTING_SPECULAR");
    Tessellator.LIGHTING_SPOT = Tessellator.Constant.create("LIGHTING_SPOT");
    Tessellator.LINE_WIDTH = Tessellator.Constant.create("LINE_WIDTH");
    Tessellator.FLATTEN = Tessellator.Constant.create("FLATTEN");
    Tessellator.CLIP = Tessellator.Constant.create("CLIP");
    Tessellator.CLEAR = Tessellator.Constant.create("CLEAR");
    Tessellator.ALL = Tessellator.Constant.create("ALL");
    Tessellator.PIXEL_SHADER = Tessellator.Constant.create("PIXEL_SHADER");
    Tessellator.CHANGED = Tessellator.Constant.create("CHANGED");
    Tessellator.BLEND_FUNC = Tessellator.Constant.create("BLEND_FUNC");
    Tessellator.INDICES = Tessellator.Constant.create("INDICES");
    
    Tessellator.PUSH = Tessellator.Constant.create("PUSH");
    Tessellator.POP = Tessellator.Constant.create("PUSH");
    Tessellator.RESET = Tessellator.Constant.create("PUSH");
    
    Tessellator.STATIC = Tessellator.Constant.create("STATIC_DRAW");
    Tessellator.DYNAMIC = Tessellator.Constant.create("DYNAMIC_DRAW");
    Tessellator.STREAM = Tessellator.Constant.create("STREAM_DRAW");
    
    Tessellator.FLOAT = Tessellator.Constant.create("FLOAT", 1);
    Tessellator.VEC2 = Tessellator.Constant.create("VEC2", 2);
    Tessellator.VEC3 = Tessellator.Constant.create("VEC3", 3);
    Tessellator.VEC4 = Tessellator.Constant.create("VEC4", 4);
    
    Tessellator.TRIANGLE = Tessellator.Constant.create("TRIANGLES");
    Tessellator.TRIANGLE_STRIP = Tessellator.Constant.create("TRIANGLE_STRIP");
    Tessellator.TRIANGLE_FAN_CW = Tessellator.Constant.create("TRIANGLE_FAN_CW");
    Tessellator.TRIANGLE_FAN_CCW = Tessellator.Constant.create("TRIANGLE_FAN_CCW");
    Tessellator.LINE = Tessellator.Constant.create("LINES");
    Tessellator.LINE_STRIP = Tessellator.Constant.create("LINE_STRIP");
    Tessellator.LINE_LOOP = Tessellator.Constant.create("LINE_LOOP");
    Tessellator.POINT = Tessellator.Constant.create("POINTS");
    Tessellator.QUAD = Tessellator.Constant.create("QUAD");
    Tessellator.POLYGON = Tessellator.Constant.create("POLYGON");
    
    Tessellator.CENTER = Tessellator.Constant.create("CENTER", 0);
    Tessellator.RIGHT = Tessellator.Constant.create("RIGHT", 1);
    Tessellator.LEFT = Tessellator.Constant.create("LEFT", -1);
    Tessellator.TOP = Tessellator.Constant.create("TOP", 1);
    Tessellator.BOTTOM = Tessellator.Constant.create("BOTTOM", -1);
    
    Tessellator.BLEND_DEFAULT = [Tessellator.SRC_ALPHA, Tessellator.ONE_MINUS_SRC_ALPHA];
    Tessellator.BLEND_INVERT = [Tessellator.ONE_MINUS_DST_COLOR, Tessellator.ZERO];
    
    Tessellator.COLOR_WHITE = Tessellator.vec4(1, 1, 1, 1);
    Tessellator.COLOR_BLACK = Tessellator.vec4(0, 0, 0, 1);
    Tessellator.COLOR_GRAY = Tessellator.vec4(0.5, 0.5, 0.5, 1);
	Tessellator.COLOR_LIGHT_GRAY = Tessellator.vec4(0.75, 0.75, 0.75, 1);
	Tessellator.COLOR_DARK_GRAY = Tessellator.vec4(0.25, 0.25, 0.25, 1);
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
    
    Tessellator.FLOAT32 = Tessellator.Constant.create("FLOAT");
    Tessellator.FLOAT16 = new Tessellator.Constant("HALF_FLOAT_OES", 0x8D61);

    Tessellator.DEFAULT_COLOR = Tessellator.COLOR_WHITE;
    Tessellator.NO_CLIP = new Float32Array([0, 0, 1, 1]);
    Tessellator.NO_MASK = Tessellator.COLOR_WHITE;
    
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
        "LIGHT GRAY": Tessellator.COLOR_LIGHT_GRAY,
        "DARK GRAY": Tessellator.COLOR_DARK_GRAY,
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
}