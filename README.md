# tessellator

Tessellator is a rendering engine for WebGL. It's goal is to make WebGL less verbose. I am attempting to make
this engine have low level access to the webgl rendering context while still being able to write code similar to
what you would have for THREE.js. I have made this possible by making the tessellator creatd many classes
with similar functions so you can make your own.

Some of these classes are:
 - Renderer
   - assign uniforms and attributes
   - render the scene
   - a instance of this is only needed to make once on program execution
 - Model
   - Essentially a wrapper for a array list that contains commands
 - commands
   - called by a init loop that makes sure all resorces go to the gpu (if needed)
   - called by a renderer to render it's content
 - Render Matrix
   - saves and manages all uniforms on cpu
   - any kind of data that is tacked on will prorigate so it can be accessed anywehe
   - potentially many of these will be created every frame
 - Shader
   - wrapper for a shader to be linked to a program
 - Program
   - stores shaders and creates a shader program to be used by renderers

I have made the 'writing like THREE.js' concept by including a
'standard library' that implements all the classes and many of them I have mentiond above.

