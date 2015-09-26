# Tessellator

Tessellator is a rendering engine for WebGL. It's goal is to make WebGL less verbose and easier to use. Similar to THREE.js, this is supposed to simplfy the process of making a webgl program/game/animation while still having options for vary advanced users.

Here is a basic spinning cube, the most basic of the basic. This one happenes to be animated without setting up a loop. How did I do it? Tessellator adds many class and tries to borrow from GLSL and object oriented pragramming languages so the programmer feels right at home. One thing I added were Vectors like you have in glsl. Calling

```javascript
    Tessellator.vec4(Tessellator.vec2(1), Tessellator.float(5), -7)
```

will create a vector with the values (x, y, z, w) (1, 1, 5, -7). Animation is one of those things that I think other librareis really do poorly on. You need to create a loop (preferably every frame) and you need to make your animation go at the same rate despite the FPS. Unfortunanly most don't want to fool around with that so I added vector tweens. These update based on the system time and never rely on FPS. Here is a vector tween example:

```javascript
   var vec = Tessellator.vec3(); // inits a vec to (0, 0, 0)
   var tween = vec.createTween(); // creates the tween and adds it to the vec
   
   //some of the tween options:
   tween.dir(Tessellator.vec3(0, 10, 0)); //every millisecond the vector will increase its y value by 10
   tween.dir(Tessellator.vec3(0, 10, 0), 1000); //for a second the vector will move 10 units on the y axis
   tween.sin(Tessellater.vec3(0, 0, 1), 10); //the z axis on the vector is going to ossolate at 10hz
   tween.delay(1000); //delay the next tween from happening for a second
```

I have included many classes in this library and some are abstract. That means you can add on. For instance renderers, renderers render the entire scene. Nothing is rendered without a renderer. Sometimes (especially on the big stuff) the default supplied renderers wont cut it so you need to make your own. Tessellator adds ```Tessellator.RendererAbstract``` and using ```Tessellator.extend()``` you can create a new renderer that automatically calls the ```renderRaw``` function in your own renderer provided things were done correctly.


The Tessellator includes practical classes to assist in rendering. The ```Tessellator.RenderLoop``` will automatically render the renderer at the fps that the browser allows (uses ```requestAnimationFrame```) and will fallback to a standard setTimeout loop so browser compatability is not something you sould worry about with the Tessellator.

This speeds things up a lot.

### Example ###

This is a example of the Tessellator in action. It creates a white wire frame cube spinning on a black background.

```html
<html>
    <script src="Tessellator.js" type="text/javascript"></script>
    
    <body style="margin:0px;background:black;">
        <canvas style="width:100%;height:100%;" id="maincanvas"></canvas>
    </body>
    
    <script type="text/javascript">
        var tessellator = new Tessellator("maincanvas"); //creates the main tessellator object and we are linking our canvas to it.
        
        //we want to set up an animation and a very basic and effective solution to movement is vectors and floats.
        var rotation = Tessellator.float(); //creates a float value
        var rotationTween = rotation.createTween(); //creates a tween. This dynamically changes the float value and creates an animation
        rotationTween.dir(Math.PI / 1000); //dir is short for direction. This simply makes adds the value passed add to the float every millisecond
        
        //this is the vector to specify the axis the cube is going to rotate around
        var axis = Tessellator.vec3(0, 1, 0); //initial value is the y axis (x, y, z)
        var axisTween = axis.createTween(); //tweens can also be created for vectors
        axisTween.dir(Tessellator.vec3(0.6, 0.4, 1)); //since we are working with a 3d vector we need to pass a 3d vector to the dir function
        
        //we set up the model now. This is what gets rendered on the screen
        var model = tessellator.createModel(); //creates a model
        model.clear("black"); //clears the rendering target (the screen) to the color black
        model.setView(new Tessellator.PerspectiveView()); //creates a persepective view. You can also set this to a orthographic view.
        model.translate(0, 0, -6); //by defalt things are going to render right at the camera. This moves the objects back.
        
        model.rotate(rotation, axis); //rotates the prism with our vectors with tweens
        
        model.setColor("white"); //sets the color of the objects being created with the model.
        model.drawCube(0, 0, 0, 1); //draws a prism (or as others like to call a wire frame). fillCube will make a solid cube.
        model.finish(); //finish the model. Tell the renderer that this is ready to be rendered.
        
        var renderer = new Tessellator.ModelRenderer(model); //creates a renderer that will render our model
        
        var renderLoop = new Tessellator.RenderLoop(renderer); //creates a render loop. By defaut, this will render as fast as possible
    </script>
</html>
```
