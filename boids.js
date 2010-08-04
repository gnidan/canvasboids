function Arena(canvas, size, speed)
{
	// speed is in boid lengths per second
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.size = size;
	this.speed = speed;
	this.objects = [];
	
	this.simulate = function(framerate) {
		this.portion = 1 / framerate;
		
		var arena = this;
		// framerate => frames per second
		// interval = 1000 / framerate

		setInterval(function() { arena.step(arena); }, 1000.0 / framerate);
	}
	
	this.newBoid = function(centerX, centerY, theta) {
		var b = new Boid(centerX, centerY, theta);
		this.objects.push(b);
		return b;
	}
	
	this.draw = function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.context.beginPath();
		for (var x = 0.5; x <= this.canvas.width + 0.5; x += this.size) {
		  this.context.moveTo(x, 0);
		  this.context.lineTo(x, this.canvas.height);
		}
		
		for (var y = 0.5; y <= this.canvas.height + 0.5; y += this.size) {
		  this.context.moveTo(0, y);
		  this.context.lineTo(this.canvas.width, y);
		}
		this.context.strokeStyle = "#eee";
		this.context.stroke();		
		
		for(var i in this.objects)
		{
			this.objects[i].draw(this.context, this.size);
		}
	}
	
	this.step = function(arena) {
		// move all objects then draw

		for(var i in arena.objects)
		{
			arena.objects[i].move( this.size * this.speed * this.portion );
			arena.objects[i].rotate(Math.PI * 2 / 180);
			
		}
		
		arena.draw();
	}
}

function Boid(centerX, centerY, theta)
{
	this.centerX = centerX;
	this.centerY = centerY;
	this.theta = theta;
	
	this.draw =	function(context, length) {
	  var width = 3/4 * length;
	  context.beginPath();

	  frontX = this.centerX + (length / 2) * Math.cos(this.theta);
	  frontY = this.centerY + (length / 2) * Math.sin(this.theta);

	  rearX = frontX - 2 * (frontX - this.centerX);
	  rearY = frontY - 2 * (frontY - this.centerY);

	  dentX = frontX - 1.75 * (frontX - this.centerX);
	  dentY = frontY - 1.75 * (frontY - this.centerY);

	  rightX = rearX + (width / 2) * Math.cos(this.theta + Math.PI / 2);
	  rightY = rearY + (width / 2) * Math.sin(this.theta + Math.PI / 2);

	  leftX = rearX - (width / 2) * Math.cos(this.theta + Math.PI / 2);
	  leftY = rearY - (width / 2) * Math.sin(this.theta + Math.PI / 2);

	  context.moveTo(frontX, frontY);
	  context.lineTo(rightX, rightY);
	  context.lineTo(dentX, dentY);
	  context.lineTo(leftX, leftY);
	  context.lineTo(frontX, frontY);

	  context.strokeStyle = "#000";
	  context.stroke();
	}
	
	this.move = function (distance) {
		this.centerX += distance * Math.cos(this.theta);
		this.centerY += distance * Math.sin(this.theta);
	}
	
	this.rotate = function(theta) {
		this.theta += theta;
	}
}


