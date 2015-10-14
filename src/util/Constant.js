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

{ //webgl 1.0
    Tessellator.DEPTH_BUFFER_BIT =                                 0x00000100;
    Tessellator.STENCIL_BUFFER_BIT =                               0x00000400;
    Tessellator.COLOR_BUFFER_BIT =                                 0x00004000;

    Tessellator.POINTS =                                           0x0000;
    Tessellator.LINES =                                            0x0001;
    Tessellator.LINE_LOOP =                                        0x0002;
    Tessellator.LINE_STRIP =                                       0x0003;
    Tessellator.TRIANGLES =                                        0x0004;
    Tessellator.TRIANGLE_STRIP =                                   0x0005;
    Tessellator.TRIANGLE_FAN =                                     0x0006;

    Tessellator.ZERO =                                             0;
    Tessellator.ONE =                                              1;
    Tessellator.SRC_COLOR =                                        0x0300;
    Tessellator.ONE_MINUS_SRC_COLOR =                              0x0301;
    Tessellator.SRC_ALPHA =                                        0x0302;
    Tessellator.ONE_MINUS_SRC_ALPHA =                              0x0303;
    Tessellator.DST_ALPHA =                                        0x0304;
    Tessellator.ONE_MINUS_DST_ALPHA =                              0x0305;

    Tessellator.DST_COLOR =                                        0x0306;
    Tessellator.ONE_MINUS_DST_COLOR =                              0x0307;
    Tessellator.SRC_ALPHA_SATURATE =                               0x0308;

    Tessellator.FUNC_ADD =                                         0x8006;
    Tessellator.BLEND_EQUATION =                                   0x8009;
    Tessellator.BLEND_EQUATION_RGB =                               0x8009;
    Tessellator.BLEND_EQUATION_ALPHA =                             0x883D;

    Tessellator.FUNC_SUBTRACT =                                    0x800A;
    Tessellator.FUNC_REVERSE_SUBTRACT =                            0x800B;

    Tessellator.BLEND_DST_RGB =                                    0x80C8;
    Tessellator.BLEND_SRC_RGB =                                    0x80C9;
    Tessellator.BLEND_DST_ALPHA =                                  0x80CA;
    Tessellator.BLEND_SRC_ALPHA =                                  0x80CB;
    Tessellator.CONSTANT_COLOR =                                   0x8001;
    Tessellator.ONE_MINUS_CONSTANT_COLOR =                         0x8002;
    Tessellator.CONSTANT_ALPHA =                                   0x8003;
    Tessellator.ONE_MINUS_CONSTANT_ALPHA =                         0x8004;
    Tessellator.BLEND_COLOR =                                      0x8005;

    Tessellator.ARRAY_BUFFER =                                     0x8892;
    Tessellator.ELEMENT_ARRAY_BUFFER =                             0x8893;
    Tessellator.ARRAY_BUFFER_BINDING =                             0x8894;
    Tessellator.ELEMENT_ARRAY_BUFFER_BINDING =                     0x8895;

    Tessellator.STREAM_DRAW =                                      0x88E0;
    Tessellator.STATIC_DRAW =                                      0x88E4;
    Tessellator.DYNAMIC_DRAW =                                     0x88E8;

    Tessellator.BUFFER_SIZE =                                      0x8764;
    Tessellator.BUFFER_USAGE =                                     0x8765;

    Tessellator.CURRENT_VERTEX_ATTRIB =                            0x8626;

    Tessellator.FRONT =                                            0x0404;
    Tessellator.BACK =                                             0x0405;
    Tessellator.FRONT_AND_BACK =                                   0x0408;

    Tessellator.CULL_FACE =                                        0x0B44;
    Tessellator.BLEND =                                            0x0BE2;
    Tessellator.DITHER =                                           0x0BD0;
    Tessellator.STENCIL_TEST =                                     0x0B90;
    Tessellator.DEPTH_TEST =                                       0x0B71;
    Tessellator.SCISSOR_TEST =                                     0x0C11;
    Tessellator.POLYGON_OFFSET_FILL =                              0x8037;
    Tessellator.SAMPLE_ALPHA_TO_COVERAGE =                         0x809E;
    Tessellator.SAMPLE_COVERAGE =                                  0x80A0;

    Tessellator.NO_ERROR =                                         0x0500;
    Tessellator.INVALID_ENUM =                                     0x0500;
    Tessellator.INVALID_VALUE =                                    0x0501;
    Tessellator.INVALID_OPERATION =                                0x0502;
    Tessellator.OUT_OF_MEMORY =                                    0x0505;

    Tessellator.CW =                                               0x0900;
    Tessellator.CCW =                                              0x0901;

    Tessellator.LINE_WIDTH =                                       0x0B21;
    Tessellator.ALIASED_POINT_SIZE_RANGE =                         0x846D;
    Tessellator.ALIASED_LINE_WIDTH_RANGE =                         0x846E;
    Tessellator.CULL_FACE_MODE =                                   0x0B45;
    Tessellator.FRONT_FACE =                                       0x0B46;
    Tessellator.DEPTH_RANGE =                                      0x0B70;
    Tessellator.DEPTH_WRITEMASK =                                  0x0B72;
    Tessellator.DEPTH_CLEAR_VALUE =                                0x0B73;
    Tessellator.DEPTH_FUNC =                                       0x0B74;
    Tessellator.STENCIL_CLEAR_VALUE =                              0x0B91;
    Tessellator.STENCIL_FUNC =                                     0x0B92;
    Tessellator.STENCIL_FAIL =                                     0x0B94;
    Tessellator.STENCIL_PASS_DEPTH_FAIL =                          0x0B95;
    Tessellator.STENCIL_PASS_DEPTH_PASS =                          0x0B96;
    Tessellator.STENCIL_REF =                                      0x0B97;
    Tessellator.STENCIL_VALUE_MASK =                               0x0B93;
    Tessellator.STENCIL_WRITEMASK =                                0x0B98;
    Tessellator.STENCIL_BACK_FUNC =                                0x8800;
    Tessellator.STENCIL_BACK_FAIL =                                0x8801;
    Tessellator.STENCIL_BACK_PASS_DEPTH_FAIL =                     0x8802;
    Tessellator.STENCIL_BACK_PASS_DEPTH_PASS =                     0x8803;
    Tessellator.STENCIL_BACK_REF =                                 0x8CA3;
    Tessellator.STENCIL_BACK_VALUE_MASK =                          0x8CA4;
    Tessellator.STENCIL_BACK_WRITEMASK =                           0x8CA5;
    Tessellator.VIEWPORT =                                         0x0BA2;
    Tessellator.SCISSOR_BOX =                                      0x0C10;

    Tessellator.COLOR_CLEAR_VALUE =                                0x0C22;
    Tessellator.COLOR_WRITEMASK =                                  0x0C23;
    Tessellator.UNPACK_ALIGNMENT =                                 0x0CF5;
    Tessellator.PACK_ALIGNMENT =                                   0x0D05;
    Tessellator.MAX_TEXTURE_SIZE =                                 0x0D33;
    Tessellator.MAX_VIEWPORT_DIMS =                                0x0D3A;
    Tessellator.SUBPIXEL_BITS =                                    0x0D50;
    Tessellator.RED_BITS =                                         0x0D52;
    Tessellator.GREEN_BITS =                                       0x0D53;
    Tessellator.BLUE_BITS =                                        0x0D54;
    Tessellator.ALPHA_BITS =                                       0x0D55;
    Tessellator.DEPTH_BITS =                                       0x0D56;
    Tessellator.STENCIL_BITS =                                     0x0D57;
    Tessellator.POLYGON_OFFSET_UNITS =                             0x2A00;

    Tessellator.POLYGON_OFFSET_FACTOR =                            0x8038;
    Tessellator.TEXTURE_BINDING_2D =                               0x8069;
    Tessellator.SAMPLE_BUFFERS =                                   0x80A8;
    Tessellator.SAMPLES =                                          0x80A9;
    Tessellator.SAMPLE_COVERAGE_VALUE =                            0x80AA;
    Tessellator.SAMPLE_COVERAGE_INVERT =                           0x80AB;

    Tessellator.COMPRESSED_TEXTURE_FORMATS =                       0x86A3;

    Tessellator.DONT_CARE =                                        0x1100;
    Tessellator.FASTEST =                                          0x1101;
    Tessellator.NICEST =                                           0x1102;

    Tessellator.GENERATE_MIPMAP_HINT =                             0x8192;

    Tessellator.BYTE =                                             0x1400;
    Tessellator.UNSIGNED_BYTE =                                    0x1401;
    Tessellator.SHORT =                                            0x1402;
    Tessellator.UNSIGNED_SHORT =                                   0x1403;
    Tessellator.INT =                                              0x1404;
    Tessellator.UNSIGNED_INT =                                     0x1405;
    Tessellator.FLOAT =                                            0x1406;

    Tessellator.DEPTH_COMPONENT =                                  0x1902;
    Tessellator.ALPHA =                                            0x1906;
    Tessellator.RGB =                                              0x1907;
    Tessellator.RGBA =                                             0x1908;
    Tessellator.LUMINANCE =                                        0x1909;
    Tessellator.LUMINANCE_ALPHA =                                  0x190A;

    Tessellator.UNSIGNED_SHORT_4_4_4_4 =                           0x8033;
    Tessellator.UNSIGNED_SHORT_5_5_5_1 =                           0x8034;
    Tessellator.UNSIGNED_SHORT_5_6_5 =                             0x8363;

    Tessellator.FRAGMENT_SHADER =                                  0x8B30;
    Tessellator.VERTEX_SHADER =                                    0x8B31;
    Tessellator.MAX_VERTEX_ATTRIBS =                               0x8869;
    Tessellator.MAX_VERTEX_UNIFORM_VECTORS =                       0x8DFB;
    Tessellator.MAX_VARYING_VECTORS =                              0x8DFC;
    Tessellator.MAX_COMBINED_TEXTURE_IMAGE_UNITS =                 0x8B4D;
    Tessellator.MAX_VERTEX_TEXTURE_IMAGE_UNITS =                   0x8B4C;
    Tessellator.MAX_TEXTURE_IMAGE_UNITS =                          0x8872;
    Tessellator.MAX_FRAGMENT_UNIFORM_VECTORS =                     0x8DFD;
    Tessellator.SHADER_TYPE =                                      0x8B4F;
    Tessellator.DELETE_STATUS =                                    0x8B80;
    Tessellator.LINK_STATUS =                                      0x8B82;
    Tessellator.VALIDATE_STATUS =                                  0x8B83;
    Tessellator.ATTACHED_SHADERS =                                 0x8B85;
    Tessellator.ACTIVE_UNIFORMS =                                  0x8B86;
    Tessellator.ACTIVE_ATTRIBUTES =                                0x8B89;
    Tessellator.SHADING_LANGUAGE_VERSION =                         0x8B8C;
    Tessellator.CURRENT_PROGRAM =                                  0x8B8D;

    Tessellator.NEVER =                                            0x0200;
    Tessellator.LESS =                                             0x0201;
    Tessellator.EQUAL =                                            0x0202;
    Tessellator.LEQUAL =                                           0x0203;
    Tessellator.GREATER =                                          0x0204;
    Tessellator.NOTEQUAL =                                         0x0205;
    Tessellator.GEQUAL =                                           0x0206;
    Tessellator.ALWAYS =                                           0x0207;

    Tessellator.KEEP =                                             0x1E00;
    Tessellator.REPLACE =                                          0x1E01;
    Tessellator.INCR =                                             0x1E02;
    Tessellator.DECR =                                             0x1E03;
    Tessellator.INVERT =                                           0x150A;
    Tessellator.INCR_WRAP =                                        0x8507;
    Tessellator.DECR_WRAP =                                        0x8508;

    Tessellator.VENDOR =                                           0x1F00;
    Tessellator.RENDERER =                                         0x1F01;
    Tessellator.VERSION =                                          0x1F02;

    Tessellator.NEAREST =                                          0x2600;
    Tessellator.LINEAR =                                           0x2601;

    Tessellator.NEAREST_MIPMAP_NEAREST =                           0x2700;
    Tessellator.LINEAR_MIPMAP_NEAREST =                            0x2701;
    Tessellator.NEAREST_MIPMAP_LINEAR =                            0x2702;
    Tessellator.LINEAR_MIPMAP_LINEAR =                             0x2703;

    Tessellator.TEXTURE_MAG_FILTER =                               0x2800;
    Tessellator.TEXTURE_MIN_FILTER =                               0x2801;
    Tessellator.TEXTURE_WRAP_S =                                   0x2802;
    Tessellator.TEXTURE_WRAP_T =                                   0x2803;

    Tessellator.TEXTURE_2D =                                       0x0DE1;
    Tessellator.TEXTURE =                                          0x1702;

    Tessellator.TEXTURE_CUBE_MAP =                                 0x8513;
    Tessellator.TEXTURE_BINDING_CUBE_MAP =                         0x8514;
    Tessellator.TEXTURE_CUBE_MAP_POSITIVE_X =                      0x8515;
    Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_X =                      0x8516;
    Tessellator.TEXTURE_CUBE_MAP_POSITIVE_Y =                      0x8517;
    Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_Y =                      0x8518;
    Tessellator.TEXTURE_CUBE_MAP_POSITIVE_Z =                      0x8519;
    Tessellator.TEXTURE_CUBE_MAP_NEGATIVE_Z =                      0x851A;
    Tessellator.MAX_CUBE_MAP_TEXTURE_SIZE =                        0x851C;

    Tessellator.TEXTURE0 =                                         0x84C0;
    Tessellator.TEXTURE1 =                                         0x84C1;
    Tessellator.TEXTURE2 =                                         0x84C2;
    Tessellator.TEXTURE3 =                                         0x84C3;
    Tessellator.TEXTURE4 =                                         0x84C4;
    Tessellator.TEXTURE5 =                                         0x84C5;
    Tessellator.TEXTURE6 =                                         0x84C6;
    Tessellator.TEXTURE7 =                                         0x84C7;
    Tessellator.TEXTURE8 =                                         0x84C8;
    Tessellator.TEXTURE9 =                                         0x84C9;
    Tessellator.TEXTURE10 =                                        0x84CA;
    Tessellator.TEXTURE11 =                                        0x84CB;
    Tessellator.TEXTURE12 =                                        0x84CC;
    Tessellator.TEXTURE13 =                                        0x84CD;
    Tessellator.TEXTURE14 =                                        0x84CE;
    Tessellator.TEXTURE15 =                                        0x84CF;
    Tessellator.TEXTURE16 =                                        0x84D0;
    Tessellator.TEXTURE17 =                                        0x84D1;
    Tessellator.TEXTURE18 =                                        0x84D2;
    Tessellator.TEXTURE19 =                                        0x84D3;
    Tessellator.TEXTURE20 =                                        0x84D4;
    Tessellator.TEXTURE21 =                                        0x84D5;
    Tessellator.TEXTURE22 =                                        0x84D6;
    Tessellator.TEXTURE23 =                                        0x84D7;
    Tessellator.TEXTURE24 =                                        0x84D8;
    Tessellator.TEXTURE25 =                                        0x84D9;
    Tessellator.TEXTURE26 =                                        0x84DA;
    Tessellator.TEXTURE27 =                                        0x84DB;
    Tessellator.TEXTURE28 =                                        0x84DC;
    Tessellator.TEXTURE29 =                                        0x84DD;
    Tessellator.TEXTURE30 =                                        0x84DE;
    Tessellator.TEXTURE31 =                                        0x84DF;
    Tessellator.ACTIVE_TEXTURE =                                   0x84E0;

    Tessellator.REPEAT =                                           0x2901;
    Tessellator.CLAMP_TO_EDGE =                                    0x812F;
    Tessellator.MIRRORED_REPEAT =                                  0x8370;

    Tessellator.FLOAT_VEC2 =                                       0x8B50;
    Tessellator.FLOAT_VEC3 =                                       0x8B51;
    Tessellator.FLOAT_VEC4 =                                       0x8B52;
    Tessellator.INT_VEC2 =                                         0x8B53;
    Tessellator.INT_VEC3 =                                         0x8B54;
    Tessellator.INT_VEC4 =                                         0x8B55;
    Tessellator.BOOL =                                             0x8B56;
    Tessellator.BOOL_VEC2 =                                        0x8B57;
    Tessellator.BOOL_VEC3 =                                        0x8B58;
    Tessellator.BOOL_VEC4 =                                        0x8B59;
    Tessellator.FLOAT_MAT2 =                                       0x8B5A;
    Tessellator.FLOAT_MAT3 =                                       0x8B5B;
    Tessellator.FLOAT_MAT4 =                                       0x8B5C;
    Tessellator.SAMPLER_2D =                                       0x8B5E;
    Tessellator.SAMPLER_CUBE =                                     0x8B60;

    Tessellator.VERTEX_ATTRIB_ARRAY_ENABLED =                      0x8622;
    Tessellator.VERTEX_ATTRIB_ARRAY_SIZE =                         0x8623;
    Tessellator.VERTEX_ATTRIB_ARRAY_STRIDE =                       0x8624;
    Tessellator.VERTEX_ATTRIB_ARRAY_TYPE =                         0x8625;
    Tessellator.VERTEX_ATTRIB_ARRAY_NORMALIZED =                   0x886A;
    Tessellator.VERTEX_ATTRIB_ARRAY_POINTER =                      0x8645;
    Tessellator.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING =               0x889F;

    Tessellator.IMPLEMENTATION_COLOR_READ_TYPE =                   0x8B9A;
    Tessellator.IMPLEMENTATION_COLOR_READ_FORMAT =                 0x8B9B;

    Tessellator.COMPILE_STATUS =                                   0x8B81;

    Tessellator.LOW_FLOAT =                                        0x8DF0;
    Tessellator.MEDIUM_FLOAT =                                     0x8DF1;
    Tessellator.HIGH_FLOAT =                                       0x8DF2;
    Tessellator.LOW_INT =                                          0x8DF3;
    Tessellator.MEDIUM_INT =                                       0x8DF4;
    Tessellator.HIGH_INT =                                         0x8DF5;

    Tessellator.FRAMEBUFFER =                                      0x8D40;
    Tessellator.RENDERBUFFER =                                     0x8D41;

    Tessellator.RGBA4 =                                            0x8056;
    Tessellator.RGB5_A1 =                                          0x8057;
    Tessellator.RGB565 =                                           0x8D62;
    Tessellator.DEPTH_COMPONENT16 =                                0x81A5;
    Tessellator.STENCIL_INDEX =                                    0x1901;
    Tessellator.STENCIL_INDEX8 =                                   0x8D48;
    Tessellator.DEPTH_STENCIL =                                    0x84F9;

    Tessellator.RENDERBUFFER_WIDTH =                               0x8D42;
    Tessellator.RENDERBUFFER_HEIGHT =                              0x8D43;
    Tessellator.RENDERBUFFER_INTERNAL_FORMAT =                     0x8D44;
    Tessellator.RENDERBUFFER_RED_SIZE =                            0x8D50;
    Tessellator.RENDERBUFFER_GREEN_SIZE =                          0x8D51;
    Tessellator.RENDERBUFFER_BLUE_SIZE =                           0x8D52;
    Tessellator.RENDERBUFFER_ALPHA_SIZE =                          0x8D53;
    Tessellator.RENDERBUFFER_DEPTH_SIZE =                          0x8D54;
    Tessellator.RENDERBUFFER_STENCIL_SIZE =                        0x8D55;

    Tessellator.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE =               0x8CD0;
    Tessellator.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME =               0x8CD1;
    Tessellator.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL =             0x8CD2;
    Tessellator.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE =     0x8CD3;

    Tessellator.COLOR_ATTACHMENT0 =                                0x8CE0;
    Tessellator.DEPTH_ATTACHMENT =                                 0x8D00;
    Tessellator.STENCIL_ATTACHMENT =                               0x8D20;
    Tessellator.DEPTH_STENCIL_ATTACHMENT =                         0x821A;

    Tessellator.NONE =                                             0x8CD5;

    Tessellator.FRAMEBUFFER_COMPLETE =                             0x8CD5;
    Tessellator.FRAMEBUFFER_INCOMPLETE_ATTACHMENT =                0x8CD6;
    Tessellator.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT =        0x8CD7;
    Tessellator.FRAMEBUFFER_INCOMPLETE_DIMENSIONS =                0x8CD9;
    Tessellator.FRAMEBUFFER_UNSUPPORTED =                          0x8CDD;

    Tessellator.FRAMEBUFFER_BINDING =                              0x8CA6;
    Tessellator.RENDERBUFFER_BINDING =                             0x8CA7;
    Tessellator.MAX_RENDERBUFFER_SIZE =                            0x84E8;

    Tessellator.INVALID_FRAMEBUFFER_OPERATION =                    0x0506;

    Tessellator.UNPACK_FLIP_Y_WEBGL =                              0x9240;
    Tessellator.UNPACK_PREMULTIPLY_ALPHA_WEBGL =                   0x9241;
    Tessellator.CONTEXT_LOST_WEBGL =                               0x9242;
    Tessellator.UNPACK_COLORSPACE_CONVERSION_WEBGL =               0x9243;
    Tessellator.BROWSER_DEFAULT_WEBGL =                            0x9244;
};
{ //webgl 2.0
    Tessellator.READ_BUFFER =                                      0x0C02;
    Tessellator.UNPACK_ROW_LENGTH =                                0x0CF2;
    Tessellator.UNPACK_SKIP_ROWS =                                 0x0CF3;
    Tessellator.UNPACK_SKIP_PIXELS =                               0x0CF4;
    Tessellator.PACK_ROW_LENGTH =                                  0x0D02;
    Tessellator.PACK_SKIP_ROWS =                                   0x0D03;
    Tessellator.PACK_SKIP_PIXELS =                                 0x0D04;
    Tessellator.COLOR =                                            0x1800;
    Tessellator.DEPTH =                                            0x1801;
    Tessellator.STENCIL =                                          0x1802;
    Tessellator.RED =                                              0x1903;
    Tessellator.RGB8 =                                             0x8051;
    Tessellator.RGBA8 =                                            0x8058;
    Tessellator.RGB10_A2 =                                         0x8059;
    Tessellator.TEXTURE_BINDING_3D =                               0x806A;
    Tessellator.UNPACK_SKIP_IMAGES =                               0x806D;
    Tessellator.UNPACK_IMAGE_HEIGHT =                              0x806E;
    Tessellator.TEXTURE_3D =                                       0x806F;
    Tessellator.TEXTURE_WRAP_R =                                   0x8072;
    Tessellator.MAX_3D_TEXTURE_SIZE =                              0x8073;
    Tessellator.UNSIGNED_INT_2_10_10_10_REV =                      0x8368;
    Tessellator.MAX_ELEMENTS_VERTICES =                            0x80E8;
    Tessellator.MAX_ELEMENTS_INDICES =                             0x80E9;
    Tessellator.TEXTURE_MIN_LOD =                                  0x813A;
    Tessellator.TEXTURE_MAX_LOD =                                  0x813B;
    Tessellator.TEXTURE_BASE_LEVEL =                               0x813C;
    Tessellator.TEXTURE_MAX_LEVEL =                                0x813D;
    Tessellator.MIN =                                              0x8007;
    Tessellator.MAX =                                              0x8008;
    Tessellator.DEPTH_COMPONENT24 =                                0x81A6;
    Tessellator.MAX_TEXTURE_LOD_BIAS =                             0x84FD;
    Tessellator.TEXTURE_COMPARE_MODE =                             0x884C;
    Tessellator.TEXTURE_COMPARE_FUNC =                             0x884D;
    Tessellator.CURRENT_QUERY =                                    0x8865;
    Tessellator.QUERY_RESULT =                                     0x8866;
    Tessellator.QUERY_RESULT_AVAILABLE =                           0x8867;
    Tessellator.STREAM_READ =                                      0x88E1;
    Tessellator.STREAM_COPY =                                      0x88E2;
    Tessellator.STATIC_READ =                                      0x88E5;
    Tessellator.STATIC_COPY =                                      0x88E6;
    Tessellator.DYNAMIC_READ =                                     0x88E9;
    Tessellator.DYNAMIC_COPY =                                     0x88EA;
    Tessellator.MAX_DRAW_BUFFERS =                                 0x8824;
    Tessellator.DRAW_BUFFER0 =                                     0x8825;
    Tessellator.DRAW_BUFFER1 =                                     0x8826;
    Tessellator.DRAW_BUFFER2 =                                     0x8827;
    Tessellator.DRAW_BUFFER3 =                                     0x8828;
    Tessellator.DRAW_BUFFER4 =                                     0x8829;
    Tessellator.DRAW_BUFFER5 =                                     0x882A;
    Tessellator.DRAW_BUFFER6 =                                     0x882B;
    Tessellator.DRAW_BUFFER7 =                                     0x882C;
    Tessellator.DRAW_BUFFER8 =                                     0x882D;
    Tessellator.DRAW_BUFFER9 =                                     0x882E;
    Tessellator.DRAW_BUFFER10 =                                    0x882F;
    Tessellator.DRAW_BUFFER11 =                                    0x8830;
    Tessellator.DRAW_BUFFER12 =                                    0x8831;
    Tessellator.DRAW_BUFFER13 =                                    0x8832;
    Tessellator.DRAW_BUFFER14 =                                    0x8833;
    Tessellator.DRAW_BUFFER15 =                                    0x8834;
    Tessellator.MAX_FRAGMENT_UNIFORM_COMPONENTS =                  0x8B49;
    Tessellator.MAX_VERTEX_UNIFORM_COMPONENTS =                    0x8B4A;
    Tessellator.SAMPLER_3D =                                       0x8B5F;
    Tessellator.SAMPLER_2D_SHADOW =                                0x8B62;
    Tessellator.FRAGMENT_SHADER_DERIVATIVE_HINT =                  0x8B8B;
    Tessellator.PIXEL_PACK_BUFFER =                                0x88EB;
    Tessellator.PIXEL_UNPACK_BUFFER =                              0x88EC;
    Tessellator.PIXEL_PACK_BUFFER_BINDING =                        0x88ED;
    Tessellator.PIXEL_UNPACK_BUFFER_BINDING =                      0x88EF;
    Tessellator.FLOAT_MAT2x3 =                                     0x8B65;
    Tessellator.FLOAT_MAT2x4 =                                     0x8B66;
    Tessellator.FLOAT_MAT3x2 =                                     0x8B67;
    Tessellator.FLOAT_MAT3x4 =                                     0x8B68;
    Tessellator.FLOAT_MAT4x2 =                                     0x8B69;
    Tessellator.FLOAT_MAT4x3 =                                     0x8B6A;
    Tessellator.SRGB =                                             0x8C40;
    Tessellator.SRGB8 =                                            0x8C41;
    Tessellator.SRGB8_ALPHA8 =                                     0x8C43;
    Tessellator.COMPARE_REF_TO_TEXTURE =                           0x884E;
    Tessellator.RGBA32F =                                          0x8814;
    Tessellator.RGB32F =                                           0x8815;
    Tessellator.RGBA16F =                                          0x881A;
    Tessellator.RGB16F =                                           0x881B;
    Tessellator.VERTEX_ATTRIB_ARRAY_INTEGER =                      0x88FD;
    Tessellator.MAX_ARRAY_TEXTURE_LAYERS =                         0x88FF;
    Tessellator.MIN_PROGRAM_TEXEL_OFFSET =                         0x8904;
    Tessellator.MAX_PROGRAM_TEXEL_OFFSET =                         0x8905;
    Tessellator.MAX_VARYING_COMPONENTS =                           0x8B4B;
    Tessellator.TEXTURE_2D_ARRAY =                                 0x8C1A;
    Tessellator.TEXTURE_BINDING_2D_ARRAY =                         0x8C1D;
    Tessellator.R11F_G11F_B10F =                                   0x8C3A;
    Tessellator.UNSIGNED_INT_10F_11F_11F_REV =                     0x8C3B;
    Tessellator.RGB9_E5 =                                          0x8C3D;
    Tessellator.UNSIGNED_INT_5_9_9_9_REV =                         0x8C3E;
    Tessellator.TRANSFORM_FEEDBACK_BUFFER_MODE =                   0x8C7F;
    Tessellator.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS =       0x8C80;
    Tessellator.TRANSFORM_FEEDBACK_VARYINGS =                      0x8C83;
    Tessellator.TRANSFORM_FEEDBACK_BUFFER_START =                  0x8C84;
    Tessellator.TRANSFORM_FEEDBACK_BUFFER_SIZE =                   0x8C85;
    Tessellator.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN =            0x8C88;
    Tessellator.RASTERIZER_DISCARD =                               0x8C89;
    Tessellator.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS =    0x8C8A;
    Tessellator.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS =          0x8C8B;
    Tessellator.INTERLEAVED_ATTRIBS =                              0x8C8C;
    Tessellator.SEPARATE_ATTRIBS =                                 0x8C8D;
    Tessellator.TRANSFORM_FEEDBACK_BUFFER =                        0x8C8E;
    Tessellator.TRANSFORM_FEEDBACK_BUFFER_BINDING =                0x8C8F;
    Tessellator.RGBA32UI =                                         0x8D70;
    Tessellator.RGB32UI =                                          0x8D71;
    Tessellator.RGBA16UI =                                         0x8D76;
    Tessellator.RGB16UI =                                          0x8D77;
    Tessellator.RGBA8UI =                                          0x8D7C;
    Tessellator.RGB8UI =                                           0x8D7D;
    Tessellator.RGBA32I =                                          0x8D82;
    Tessellator.RGB32I =                                           0x8D83;
    Tessellator.RGBA16I =                                          0x8D88;
    Tessellator.RGB16I =                                           0x8D89;
    Tessellator.RGBA8I =                                           0x8D8E;
    Tessellator.RGB8I =                                            0x8D8F;
    Tessellator.RED_INTEGER =                                      0x8D94;
    Tessellator.RGB_INTEGER =                                      0x8D98;
    Tessellator.RGBA_INTEGER =                                     0x8D99;
    Tessellator.SAMPLER_2D_ARRAY =                                 0x8DC1;
    Tessellator.SAMPLER_2D_ARRAY_SHADOW =                          0x8DC4;
    Tessellator.SAMPLER_CUBE_SHADOW =                              0x8DC5;
    Tessellator.UNSIGNED_INT_VEC2 =                                0x8DC6;
    Tessellator.UNSIGNED_INT_VEC3 =                                0x8DC7;
    Tessellator.UNSIGNED_INT_VEC4 =                                0x8DC8;
    Tessellator.INT_SAMPLER_2D =                                   0x8DCA;
    Tessellator.INT_SAMPLER_3D =                                   0x8DCB;
    Tessellator.INT_SAMPLER_CUBE =                                 0x8DCC;
    Tessellator.INT_SAMPLER_2D_ARRAY =                             0x8DCF;
    Tessellator.UNSIGNED_INT_SAMPLER_2D =                          0x8DD2;
    Tessellator.UNSIGNED_INT_SAMPLER_3D =                          0x8DD3;
    Tessellator.UNSIGNED_INT_SAMPLER_CUBE =                        0x8DD4;
    Tessellator.UNSIGNED_INT_SAMPLER_2D_ARRAY =                    0x8DD7;
    Tessellator.DEPTH_COMPONENT32F =                               0x8CAC;
    Tessellator.DEPTH32F_STENCIL8 =                                0x8CAD;
    Tessellator.FLOAT_32_UNSIGNED_INT_24_8_REV =                   0x8DAD;
    Tessellator.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING =            0x8210;
    Tessellator.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE =            0x8211;
    Tessellator.FRAMEBUFFER_ATTACHMENT_RED_SIZE =                  0x8212;
    Tessellator.FRAMEBUFFER_ATTACHMENT_GREEN_SIZE =                0x8213;
    Tessellator.FRAMEBUFFER_ATTACHMENT_BLUE_SIZE =                 0x8214;
    Tessellator.FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE =                0x8215;
    Tessellator.FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE =                0x8216;
    Tessellator.FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE =              0x8217;
    Tessellator.FRAMEBUFFER_DEFAULT =                              0x8218;
    Tessellator.DEPTH_STENCIL_ATTACHMENT =                         0x821A;
    Tessellator.DEPTH_STENCIL =                                    0x84F9;
    Tessellator.UNSIGNED_INT_24_8 =                                0x84FA;
    Tessellator.DEPTH24_STENCIL8 =                                 0x88F0;
    Tessellator.UNSIGNED_NORMALIZED =                              0x8C17;
    Tessellator.DRAW_FRAMEBUFFER_BINDING =                         0x8CA6;
    Tessellator.READ_FRAMEBUFFER =                                 0x8CA8;
    Tessellator.DRAW_FRAMEBUFFER =                                 0x8CA9;
    Tessellator.READ_FRAMEBUFFER_BINDING =                         0x8CAA;
    Tessellator.RENDERBUFFER_SAMPLES =                             0x8CAB;
    Tessellator.FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER =             0x8CD4;
    Tessellator.MAX_COLOR_ATTACHMENTS =                            0x8CDF;
    Tessellator.COLOR_ATTACHMENT1 =                                0x8CE1;
    Tessellator.COLOR_ATTACHMENT2 =                                0x8CE2;
    Tessellator.COLOR_ATTACHMENT3 =                                0x8CE3;
    Tessellator.COLOR_ATTACHMENT4 =                                0x8CE4;
    Tessellator.COLOR_ATTACHMENT5 =                                0x8CE5;
    Tessellator.COLOR_ATTACHMENT6 =                                0x8CE6;
    Tessellator.COLOR_ATTACHMENT7 =                                0x8CE7;
    Tessellator.COLOR_ATTACHMENT8 =                                0x8CE8;
    Tessellator.COLOR_ATTACHMENT9 =                                0x8CE9;
    Tessellator.COLOR_ATTACHMENT10 =                               0x8CEA;
    Tessellator.COLOR_ATTACHMENT11 =                               0x8CEB;
    Tessellator.COLOR_ATTACHMENT12 =                               0x8CEC;
    Tessellator.COLOR_ATTACHMENT13 =                               0x8CED;
    Tessellator.COLOR_ATTACHMENT14 =                               0x8CEE;
    Tessellator.COLOR_ATTACHMENT15 =                               0x8CEF;
    Tessellator.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE =               0x8D56;
    Tessellator.MAX_SAMPLES =                                      0x8D57;
    Tessellator.HALF_FLOAT =                                       0x140B;
    Tessellator.RG =                                               0x8227;
    Tessellator.RG_INTEGER =                                       0x8228;
    Tessellator.R8 =                                               0x8229;
    Tessellator.RG8 =                                              0x822B;
    Tessellator.R16F =                                             0x822D;
    Tessellator.R32F =                                             0x822E;
    Tessellator.RG16F =                                            0x822F;
    Tessellator.RG32F =                                            0x8230;
    Tessellator.R8I =                                              0x8231;
    Tessellator.R8UI =                                             0x8232;
    Tessellator.R16I =                                             0x8233;
    Tessellator.R16UI =                                            0x8234;
    Tessellator.R32I =                                             0x8235;
    Tessellator.R32UI =                                            0x8236;
    Tessellator.RG8I =                                             0x8237;
    Tessellator.RG8UI =                                            0x8238;
    Tessellator.RG16I =                                            0x8239;
    Tessellator.RG16UI =                                           0x823A;
    Tessellator.RG32I =                                            0x823B;
    Tessellator.RG32UI =                                           0x823C;
    Tessellator.VERTEX_ARRAY_BINDING =                             0x85B5;
    Tessellator.R8_SNORM =                                         0x8F94;
    Tessellator.RG8_SNORM =                                        0x8F95;
    Tessellator.RGB8_SNORM =                                       0x8F96;
    Tessellator.RGBA8_SNORM =                                      0x8F97;
    Tessellator.SIGNED_NORMALIZED =                                0x8F9C;
    Tessellator.COPY_READ_BUFFER =                                 0x8F36;
    Tessellator.COPY_WRITE_BUFFER =                                0x8F37;
    Tessellator.COPY_READ_BUFFER_BINDING =                         0x8F36;
    Tessellator.COPY_WRITE_BUFFER_BINDING =                        0x8F37;
    Tessellator.UNIFORM_BUFFER =                                   0x8A11;
    Tessellator.UNIFORM_BUFFER_BINDING =                           0x8A28;
    Tessellator.UNIFORM_BUFFER_START =                             0x8A29;
    Tessellator.UNIFORM_BUFFER_SIZE =                              0x8A2A;
    Tessellator.MAX_VERTEX_UNIFORM_BLOCKS =                        0x8A2B;
    Tessellator.MAX_FRAGMENT_UNIFORM_BLOCKS =                      0x8A2D;
    Tessellator.MAX_COMBINED_UNIFORM_BLOCKS =                      0x8A2E;
    Tessellator.MAX_UNIFORM_BUFFER_BINDINGS =                      0x8A2F;
    Tessellator.MAX_UNIFORM_BLOCK_SIZE =                           0x8A30;
    Tessellator.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS =           0x8A31;
    Tessellator.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS =         0x8A33;
    Tessellator.UNIFORM_BUFFER_OFFSET_ALIGNMENT =                  0x8A34;
    Tessellator.ACTIVE_UNIFORM_BLOCKS =                            0x8A36;
    Tessellator.UNIFORM_TYPE =                                     0x8A37;
    Tessellator.UNIFORM_SIZE =                                     0x8A38;
    Tessellator.UNIFORM_BLOCK_INDEX =                              0x8A3A;
    Tessellator.UNIFORM_OFFSET =                                   0x8A3B;
    Tessellator.UNIFORM_ARRAY_STRIDE =                             0x8A3C;
    Tessellator.UNIFORM_MATRIX_STRIDE =                            0x8A3D;
    Tessellator.UNIFORM_IS_ROW_MAJOR =                             0x8A3E;
    Tessellator.UNIFORM_BLOCK_BINDING =                            0x8A3F;
    Tessellator.UNIFORM_BLOCK_DATA_SIZE =                          0x8A40;
    Tessellator.UNIFORM_BLOCK_ACTIVE_UNIFORMS =                    0x8A42;
    Tessellator.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES =             0x8A43;
    Tessellator.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER =        0x8A44;
    Tessellator.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER =      0x8A46;
    Tessellator.INVALID_INDEX =                                    0xFFFFFFFF;
    Tessellator.MAX_VERTEX_OUTPUT_COMPONENTS =                     0x9122;
    Tessellator.MAX_FRAGMENT_INPUT_COMPONENTS =                    0x9125;
    Tessellator.MAX_SERVER_WAIT_TIMEOUT =                          0x9111;
    Tessellator.OBJECT_TYPE =                                      0x9112;
    Tessellator.SYNC_CONDITION =                                   0x9113;
    Tessellator.SYNC_STATUS =                                      0x9114;
    Tessellator.SYNC_FLAGS =                                       0x9115;
    Tessellator.SYNC_FENCE =                                       0x9116;
    Tessellator.SYNC_GPU_COMMANDS_COMPLETE =                       0x9117;
    Tessellator.UNSIGNALED =                                       0x9118;
    Tessellator.SIGNALED =                                         0x9119;
    Tessellator.ALREADY_SIGNALED =                                 0x911A;
    Tessellator.TIMEOUT_EXPIRED =                                  0x911B;
    Tessellator.CONDITION_SATISFIED =                              0x911C;
    Tessellator.WAIT_FAILED =                                      0x911D;
    Tessellator.SYNC_FLUSH_COMMANDS_BIT =                          0x00000001;
    Tessellator.VERTEX_ATTRIB_ARRAY_DIVISOR =                      0x88FE;
    Tessellator.ANY_SAMPLES_PASSED =                               0x8C2F;
    Tessellator.ANY_SAMPLES_PASSED_CONSERVATIVE =                  0x8D6A;
    Tessellator.SAMPLER_BINDING =                                  0x8919;
    Tessellator.RGB10_A2UI =                                       0x906F;
    Tessellator.INT_2_10_10_10_REV =                               0x8D9F;
    Tessellator.TRANSFORM_FEEDBACK =                               0x8E22;
    Tessellator.TRANSFORM_FEEDBACK_PAUSED =                        0x8E23;
    Tessellator.TRANSFORM_FEEDBACK_ACTIVE =                        0x8E24;
    Tessellator.TRANSFORM_FEEDBACK_BINDING =                       0x8E25;
    Tessellator.COMPRESSED_R11_EAC =                               0x9270;
    Tessellator.COMPRESSED_SIGNED_R11_EAC =                        0x9271;
    Tessellator.COMPRESSED_RG11_EAC =                              0x9272;
    Tessellator.COMPRESSED_SIGNED_RG11_EAC =                       0x9273;
    Tessellator.COMPRESSED_RGB8_ETC2 =                             0x9274;
    Tessellator.COMPRESSED_SRGB8_ETC2 =                            0x9275;
    Tessellator.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 =         0x9276;
    Tessellator.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 =        0x9277;
    Tessellator.COMPRESSED_RGBA8_ETC2_EAC =                        0x9278;
    Tessellator.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC =                 0x9279;
    Tessellator.TEXTURE_IMMUTABLE_FORMAT =                         0x912F;
    Tessellator.MAX_ELEMENT_INDEX =                                0x8D6B;
    Tessellator.TEXTURE_IMMUTABLE_LEVELS =                         0x82DF;
};
{ //tessellator
    Tessellator.VERTEX =                                           0x00FF0000;
    Tessellator.TRANSLATE =                                        0x00FF0001;
    Tessellator.ROTATE =                                           0x00FF0002;
    Tessellator.SCALE =                                            0x00FF0003;
    Tessellator.START =                                            0x00FF0004;
    Tessellator.END =                                              0x00FF0005;
    Tessellator.OBJECT =                                           0x00FF0006;
    Tessellator.MODEL =                                            0x00FF0007;
    Tessellator.MODEL_FRAGMENT =                                   0x00FF0008;
    Tessellator.TEXTURE_SCALE =                                    0x00FF000A;
    Tessellator.TEXT =                                             0x00FF000C;
    Tessellator.ENABLE =                                           0x00FF000D;
    Tessellator.DISABLE =                                          0x00FF000E;
    Tessellator.MASK =                                             0x00FF000F;
    Tessellator.FONT_SHEET =                                       0x00FF0011;
    Tessellator.VIEW =                                             0x00FF0012;
    Tessellator.CAMERA =                                           0x00FF0013;
    Tessellator.LIGHTING =                                         0x00FF0014;
    Tessellator.FLATTEN =                                          0x00FF001A;
    Tessellator.CLIP =                                             0x00FF001B;
    Tessellator.CLEAR =                                            0x00FF001C;
    Tessellator.ALL =                                              0x00FF001D;
    Tessellator.PIXEL_SHADER =                                     0x00FF001E;
    Tessellator.CHANGED =                                          0x00FF001F;
    Tessellator.BLEND_FUNC =                                       0x00FF0020;
    
    Tessellator.STATIC = Tessellator.STATIC_DRAW;
    Tessellator.DYNAMIC = Tessellator.DYNAMIC_DRAW;
    Tessellator.STREAM = Tessellator.STREAM_DRAW;
    
    Tessellator.VEC2 =                                             0x00FF1000;
    Tessellator.VEC3 =                                             0x00FF1001;
    Tessellator.VEC4 =                                             0x00FF1002;
    
    Tessellator.TRIANGLE = Tessellator.TRIANGLES;
    Tessellator.LINE = Tessellator.LINES;
    Tessellator.POINT = Tessellator.POINTS;
    Tessellator.QUAD =                                             0x00FF2000;
    Tessellator.QUAD_STRIP =                                       0x00FF2001;
    Tessellator.POLYGON =                                          0x00FF2002;
    Tessellator.INDICES =                                          0x00FF2003;
    Tessellator.TEXTURE =                                          0x00FF2004;
    Tessellator.NORMAL =                                           0x00FF2005;
    
    Tessellator.CENTER =                                           0;
    Tessellator.RIGHT =                                            1;
    Tessellator.LEFT =                                             -1;
    Tessellator.TOP =                                              1;
    Tessellator.BOTTOM =                                           -1;
    
    Tessellator.FLOAT32 = Tessellator.FLOAT;
    Tessellator.FLOAT16 =                                          0x8D61;
    
    Tessellator.BLEND_DEFAULT = Tessellator.vec2(Tessellator.SRC_ALPHA, Tessellator.ONE_MINUS_SRC_ALPHA);
    Tessellator.BLEND_INVERT = Tessellator.vec2(Tessellator.ONE_MINUS_DST_COLOR, Tessellator.ZERO);
    
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
    Tessellator.COLOR_SKY = Tessellator.vec4(0.529, 0.8, 0.98, 1);
    Tessellator.COLOR_CLEAR = Tessellator.vec4(0, 0, 0, 0);
    
    Tessellator.DEFAULT_COLOR = Tessellator.COLOR_WHITE;
    Tessellator.NO_CLIP = Tessellator.vec4(0, 0, 1, 1);
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
        "SKY": Tessellator.COLOR_SKY,
    };
};