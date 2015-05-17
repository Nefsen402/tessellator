projectiles = [];

function addProjectile (projectile){
	projectiles.push(projectile);
	
	renderProjectiles();
}

function renderProjectiles (){
	for (var i = 0; i < projectiles.length; i++){
		var obj = projectiles[i];
		
		if (obj.draw){
			projectiles.draw.add(obj.draw);
		}else{
			obj.draw = projectiles.draw.push();
			obj.move = obj.draw.translate(obj.x, obj.y, obj.z);
			obj.draw.setColor(Math.random(), Math.random(), Math.random(), 1);
			
			obj.draw.disable(Tessellator.LIGHTING);
			obj.draw.fillPrism(0, 0, 0, 0.2);
			obj.draw.enable(Tessellator.LIGHTING);
			
			obj.draw.setPointLight(0, 0, 0, 10);
			projectiles.draw.pop();
		}
	}
	
	projectiles.draw.update();
}

up = false;
down = false;
right = false;
left = false;

rotate = null;
translate = null;

debug = null;
edit = null;

xrotate = 0.005;
yrotate = 0.005;

tessellator.DEFAULT_FONT_SHEET.src = "webgl/font.png";

texture1 = tessellator.loadTexture("webgl/resources/crate.png", Tessellator.TEXTURE_FILTER_NEAREST);
texture2 = tessellator.loadTexture("webgl/resources/crate.png", Tessellator.TEXTURE_FILTER_LINEAR);
texture3 = tessellator.loadTexture("webgl/resources/crate.png", Tessellator.TEXTURE_FILTER_MIPMAP_LINEAR);
texture4 = tessellator.loadTexture("webgl/resources/crate.png", Tessellator.TEXTURE_FILTER_MIPMAP_NEAREST);
texture = texture1;

pixelShader = new Tessellator.PixelShaderRenderer(tessellator.createPixelShader(tessellator.getShaderFromDOM(document.getElementById("shader"))));

pixelShader.parentRenderer = new Tessellator.ModelViewRenderer(tessellator.loadDefaultShaderProgram());

shader0 = pixelShader;
//shader0 = new Tessellator.ModelViewRenderer(tessellator.loadShaderProgramFromCode(Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_VERTEX_SHADER, Tessellator.MODEL_VIEW_FRAGMENT_LIGHTING_FRAGMENT_SHADER));
shader1 = new Tessellator.ModelViewRenderer(tessellator.loadShaderProgramFromCode(Tessellator.MODEL_VIEW_VERTEX_LIGHTING_VERTEX_SHADER, Tessellator.MODEL_VIEW_VERTEX_LIGHTING_FRAGMENT_SHADER));
shader2 = new Tessellator.ModelViewNoLightingRenderer(tessellator.loadShaderProgramFromCode(Tessellator.MODEL_VIEW_VERTEX_SHADER, Tessellator.MODEL_VIEW_FRAGMENT_SHADER));
//shader3 = new Tessellator.DepthMapRenderer(tessellator.loadDefaultShaderProgram());

var startTime = Date.now();
edit = draw();
drawTime = Date.now() - startTime;

loop();

function draw(){
	var edit = tessellator.createMatrix();
	
	if (!window.renderLoop){
		renderLoop = tessellator.createRenderLoop(edit, shader0);
	}else{
		renderLoop.setModel(edit);
	}
	
	edit.clear();
	
	if (debug){
		edit.add(debug);
	}else{
		debug = edit.createMatrix();
		debug.disposable = false;
	}
	
	//edit.setView(new Tessellator.OrthographicView(3.5));
	window.camera = edit.setView(new Tessellator.RadialCamera(new Tessellator.PerspectiveView(50 * Math.PI / 180, 30, 0.1)));
	
	edit.push();
	if (!rotate){
		rotate = edit.rotate(0, 1, 0, 0);
		rotate1 = edit.rotate(0, 0, 1, 0);
		rotate2 = edit.rotate(0, 0, 0, 1);
	}
	edit.pop();
	
	//edit.rotate(rotate1);
	
	//edit.setColor(2, 2, 2, 1);
	//edit.setPointLight(-5, 5, 0, 20);
	//edit.setColor(0.75, 0.75, 0.75, 1);
	//edit.setPointLight(5, 5, 0, 20);
	
	//edit.setColor("white");
	//edit.setSpotLight(-7, 0, -6, -1, 0, 0.4, Math.PI / 3.5, 50);
	
	//edit.rotate(rotate1);
	
	//edit.setSpecularReflection(25);
	
	window.lighting = edit.enable(Tessellator.LIGHTING);
	
	edit.setColor(0.1, 0.1, 0.1, 1);
	edit.setAmbientLight();
	
	//edit.setClip(1 / 4, 1 / 4, 1 / 2, 1 / 2);
	
	edit.translate(0, 0, -6);
	
	edit.rotate(25 * Math.PI / 180, 1, 0, 0);
	edit.rotate(25 * Math.PI / 180, 0, -1, 0);
	edit.translate(0, 0, -5);
	
	edit.push();
	if (translate){
		edit.translate(translate);
	}else{
		translate = edit.translate(0, 0, 0);
	}
	
	if (window.rotateAll){
		edit.rotate(rotateAll);
	}else{
		rotateAll = edit.rotate(0, 0, 1, 0);
	}
	
	edit.push();
	edit.push();
	
	edit.rotate(Math.PI / 2, -1, 0, 0);
	edit.translate(0, 0, -2);
	//edit.scale(10);
	
	projectiles = [];
	projectiles.draw = edit.createMatrix();
	
	for (var i = 0, k = Math.random() * 2 + 4; i < k; i++){
		projectiles.push({
			x: Math.random() * 20 - 10,
			y: Math.random() * 20 - 10,
			z: Math.random() * 5 + 0.1,
			speed: 0,
		});
	}
	
	renderProjectiles();
	
	edit.setColor("white");
	edit.setSpotLight(-7, -7, 1, -0.75, -1, 0, 0.7, 20);
	//edit.setDirectionalLight(0, 1, 0.7);
	//edit.setPointLight(0, 0, 0.1, 10);
	
	edit.setColor(0.5, 0.5, 0.5, 1);
	edit.fillGrid(-10, -10, 20, 20, 20, 20);
	
	edit.setColor(0.7, 0.7, 0.7, 1);
	edit.fillInverseGrid(-10, -10, 20, 20, 20, 20);
	
	edit.pop();
	
	edit.rotate(rotate);
	edit.rotate(rotate1);
	edit.rotate(rotate2);
	
	//edit.add(this.createGunModel());
	//edit.fillCilinder(0, 0, 0, 2, 1, 60);
	
	if (!this.teapot){
		this.teapot = tessellator.createMatrix();
		
		this.teapot.disposable = false;
		
		this.teapot.clear();
		this.teapot.setView(new Tessellator.PerspectiveView());
		
		//this.teapot.setColor("white");
		//this.teapot.setPointLight(10, 0, -5);
		
		this.teapot.translate(0, 0, -5);
		this.teapot.teapotRotate1 = this.teapot.rotate(0, 0, 1, 0);
		this.teapot.teapotRotate2 = this.teapot.rotate(0, 1, 0, 0);
		
		this.teapot.setSpecularReflection(10);
		this.teapot.scale(0.1);
		this.teapot.bindTexture("galvanized.jpg");
		
		tessellator.loadJSONModel("webgl/Teapot.json", this.teapot);
		
		this.teapot.texture = this.teapot.createTexture(512, 512);
		this.teapot.texture.disposable = false;
	}
	
	/*edit.setLineWidth(0.1);
	edit.drawRect(-1, -1, 2, 2);
	edit.drawLine(0, 1, 0, -1);
	edit.drawLine(1, 0, -1, 0);
	edit.drawLine(1, 1, -1, -1);
	edit.drawLine(1, -1, -1, 1);*/
	edit.pop();
	
	edit.push();
	if (rotate){
		edit.rotate(rotate);
		edit.rotate(rotate1);
		edit.rotate(rotate2);
	}else{
		rotate = edit.rotate(0, 1, 0, 0);
		rotate1 = edit.rotate(0, 0, 1, 0);
		rotate2 = edit.rotate(0, 0, 0, 1);
	}
	
	//edit.setColor("white");
	
	if (!window.earthTexture){
		edit.bindTexture(window.earthTexture = tessellator.loadTexture("earth.png", Tessellator.TEXTURE_FILTER_LINEAR_CLAMP));
	}else{
		edit.bindTexture(window.earthTexture);
	}
	
	edit.fillSphere(0, 0, 0, 1, 10);
	//edit.fillFlange(0, 0, 0, 2, 1, 2);
	
	edit.pop();
	
	edit.translate(2.5, 0, 0);
	
	testing = edit.push();
	edit.rotate(rotate);
	edit.rotate(rotate1);
	edit.rotate(rotate2);
	
	edit.bindTexture(this.teapot.texture);
	edit.fillPrism(0, 0, 0, 2);
	
	edit.bindTexture(texture);
	edit.fillPrism(0, 0, 0, 2);
	
	//edit.setColor("white");
	//edit.drawPrism(0, 0, 0, 2);
	edit.pop();
	
	edit.translate(-5, 0, 0);
	edit.rotate(rotate);
	edit.rotate(rotate1);
	edit.rotate(rotate2);
	
	//edit.bindTexture("webgl/resources/dirt.jpg");
	
	edit.setColor("yellow");
	edit.start(Tessellator.TRIANGLE);
	edit.setVertex(
		0, 1, 0,
		-1, -1, 1,
		1, -1, 1,
		
		0, 1, 0,
		1, -1, -1,
		-1, -1, -1
	);
	edit.end();
	edit.setColor("cyan");
	edit.start(Tessellator.TRIANGLE);
	edit.setVertex(
		0, 1, 0,
		-1, -1, -1,
		-1, -1, 1,
		
		0, 1, 0,
		1, -1, 1,
		1, -1, -1
	);
	
	edit.end();
	edit.setColor("magenta");
	edit.start(Tessellator.QUAD);
	edit.setVertex(
		-1, -1, -1,
		1, -1, -1,
		1, -1, 1,
		-1, -1, 1
	);
	edit.end();
	
	edit.pop();
	
	
	edit.update();
	console.log(edit);
	
	return edit;
}

function createGunModel (){
	var model = tessellator.createMatrix();
	
	model.rotate(Math.PI / 2, 0, 0, 1);
	model.fillSphere(0, 0, 0, 0.5, 20);
	
	model.start(Tessellator.QUAD);
	model.setVertex([
		0.15, -0.1, 0.1,
		
	])
	model.end();
	
	return model.update();
}

function loop (){
	if (up){
		yrotate -= 0.0002;
	}
	
	if (down){
		yrotate += 0.0002;
	}
	
	if (left){
		xrotate -= 0.0002;
	}
	
	if (right){
		xrotate += 0.0002;
	}
	
	for (var i = 0; i < projectiles.length; i++){
		var obj = projectiles[i];
		
		if (obj.speed != 0){
			var sin = Math.sin(obj.angle);
			var cos = Math.cos(obj.angle);
			
			obj.y += obj.speed * cos;
			obj.x += obj.speed * sin;
			
			if (obj.x > 20 || obj.y > 20){
				projectiles.splice(i, i + 1);
				i--;
				obj.draw.dispose();
				
				continue;
			}
			
			obj.move.x = obj.x;
			obj.move.y = obj.y;
		}
	}
	
	rotate.degree += yrotate;
	rotate1.degree += xrotate;
	this.teapot.teapotRotate1.degree += -yrotate;
	this.teapot.teapotRotate2.degree += -xrotate;
	
	/*{
		debug.setView(new Tessellator.StaticView());
		
		debug.disable(Tessellator.NORMAL);
		debug.scale(20 * tessellator.resolutionScale, 20 * tessellator.resolutionScale);
		
		debug.drawText("Screen size: " + tessellator.width + "x" + tessellator.height);
		debug.drawText("FPS: " + renderLoop.getFPS(), 0, 1);
		debug.drawText("Render time: " + renderLoop.getRenderTime(), 0, 2);
		debug.drawText("Draw time: " + drawTime, 0, 3);
		debug.drawText("Rot: " + xrotate.toFixed(4) + "/" + yrotate.toFixed(4), 0, 4);
		debug.drawText("Render Items: " + edit.countRenderItems(), 0, 5);
		
		debug.enable(Tessellator.NORMAL)
		debug.update();
	}*/
	
	setTimeout(loop, 10);
}

tessellator.postRender = function (){
	this.super_postRender();
	
	this.TD.font = "12pt serif";
	this.TD.fillStyle = "white";
	this.TD.fillText("Screen size: " + tessellator.width + "x" + tessellator.height, 0, 14);
	this.TD.fillText("FPS: " + renderLoop.getFPS(), 0, 28);
	this.TD.fillText("Render time: " + renderLoop.getRenderTime(), 0, 42);
	this.TD.fillText("Draw time: " + drawTime, 0, 56);
	this.TD.fillText("Rot: " + xrotate.toFixed(4) + "/" + yrotate.toFixed(4), 0, 70);
	this.TD.fillText("Render Items: " + edit.countRenderItems(), 0, 84);
}

document.onkeydown = function (e){
	if (e.keyCode == 38){
		//up
		
		up = true;
	}else if (e.keyCode == 40){
		//down
		
		down = true;
	}else if (e.keyCode == 37){
		//left
		
		left = true;
	}else if (e.keyCode == 39){
		//right
		
		right = true;
	}else if (e.keyCode == 70){
		//letter f
		
		if (texture == texture1){
			texture = texture2;
		}else if (texture == texture2){
			texture = texture3;
		}else if (texture == texture3){
			texture = texture4;
		}else if (texture == texture4){
			texture = texture1;
		}
		
		var startTime = new Date().getTime();
		edit.dispose();
		edit = draw();
		drawTime = new Date().getTime() - startTime;
		//bindTexture.texture = texture;
	}else if (e.keyCode == 81){
		translate.z += 0.1;
	}else if (e.keyCode == 87){
		translate.z -= 0.1;
	}else if (e.keyCode == 65){
		rotateAll.degree -= 0.01;
	}else if (e.keyCode == 83){
		rotateAll.degree += 0.01;
	}else if (e.keyCode == 90){
		addProjectile({
			speed: 0.3,
			x: -5,
			y: -10,
			z: 0.5,
			angle: Math.PI / 8,
		});
	}else if (e.keyCode == 69){
		if (renderLoop.renderer == shader0){
			renderLoop.setRenderer(shader1);
		}else if (renderLoop.renderer == shader1){
			renderLoop.setRenderer(shader2);
		}else if (renderLoop.renderer == shader2){
			renderLoop.setRenderer(shader3);
		}else{
			renderLoop.setRenderer(shader0);
		}
	}else if (e.keyCode == 88){
		if (window.lighting.type == Tessellator.ENABLE){
			window.lighting.type = Tessellator.DISABLE;
		}else{
			window.lighting.type = Tessellator.ENABLE;
		}
	}else if (e.keyCode == 67){
		if (window.camera.view.constructor == Tessellator.OrthographicView){
			window.camera.view = new Tessellator.PerspectiveView(45 * Math.PI / 180, 100, 0.1);
		}else{
			window.camera.view = new Tessellator.OrthographicView(3.5);
		}
	}else if (e.keyCode == 73){
		console.log (tessellator.getDataURL().replace("image/png", "image/octet-stream"));
		document.location = tessellator.getDataURL().replace("image/png", "image/octet-stream");
	}
}

document.onkeyup = function (e){
	if (e.keyCode == 38){
		//up
		
		up = false;
	}else if (e.keyCode == 40){
		//down
		
		down = false;
	}else if (e.keyCode == 37){
		//left
		
		left = false;
	}else if (e.keyCode == 39){
		//right
		
		right = false;
	}
}

document.onmousemove = function (e){
	if (window.mouseDown){
		camera.radX -= (window.lastMouseX - e.x) / 600;
		camera.radY -= (window.lastMouseY - e.y) / 600;
	}
	
	window.lastMouseX = e.x;
	window.lastMouseY = e.y;
}

document.onmousedown = function (e){
	window.mouseDown = true;
}

document.onmouseup = function (e){
	window.mouseDown = false;
}
