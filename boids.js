function Arena(canvas, size, maxSpeed)
{
	this.neighborDistance = 2 * size;
  
	// speed is in boid lengths per second
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.size = size;
	this.maxSpeed = maxSpeed;
	this.objects = [];
	
	this.simulate = function(framerate) {
		this.portion = 1 / framerate;
		
		var arena = this;
		// framerate => frames per second
		// interval = 1000 / framerate

		setInterval(function() { arena.step(arena); }, 1000.0 / framerate);
	}
	
	this.newBoid = function(x, y) {
		var b = new Boid(x, y);
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
			var boid = arena.objects[i];
			
			var neighbors = [];
			for(var j in arena.objects)
			{
			  var other = arena.objects[j];
			  
			  if(other != boid && boid.pos.distance(other.pos) < this.neighborDistance)
			      neighbors.push(other);
			}
			
			if(neighbors.length > 0)
			  boid.flock(neighbors);
			
			var distance = arena.size * arena.maxSpeed * arena.portion;
			
			boid.move(distance);
			
		}
		
		for(var i in arena.objects)
		{
		  var boid  = arena.objects[i];
		  
		  boid.pos.x += arena.canvas.width;
		  boid.pos.y += arena.canvas.height;
		  
		  boid.pos.x %= arena.canvas.width;
			boid.pos.y %= arena.canvas.height;			
		}
		
		arena.draw();
	}
}

function Boid(x, y)
{   
  this.pos   = new Vector2D(x, y);
  this.vel   = new Vector2D(Math.random() * 2 - 1, Math.random() * 2 - 1);
  this.acc   = new Vector2D(0,0);

	this.draw =	function(context, length) {	 
	  var width = 3/4 * length;
	  context.beginPath();
	  
	  var centerX = this.pos.x;
	  var centerY = this.pos.y;
	  var theta   = this.vel.theta();

	  var frontX = centerX + (length / 2) * Math.cos(theta);
	  var frontY = centerY + (length / 2) * Math.sin(theta);

	  var rearX = frontX - 2 * (frontX - centerX);
	  var rearY = frontY - 2 * (frontY - centerY);

	  var dentX = frontX - 1.75 * (frontX - centerX);
	  var dentY = frontY - 1.75 * (frontY - centerY);

	  var rightX = rearX + (width / 2) * Math.cos(theta + Math.PI / 2);
	  var rightY = rearY + (width / 2) * Math.sin(theta + Math.PI / 2);

	  var leftX = rearX - (width / 2) * Math.cos(theta + Math.PI / 2);
	  var leftY = rearY - (width / 2) * Math.sin(theta + Math.PI / 2);

	  context.moveTo(frontX, frontY);
	  context.lineTo(rightX, rightY);
	  context.lineTo(dentX, dentY);
	  context.lineTo(leftX, leftY);
	  context.lineTo(frontX, frontY);

	  context.strokeStyle = "#000";
	  context.stroke();
	}
	
	this.move = function(distance) {
	  this.vel.add(this.acc);
	  
	  this.vel.limit(distance);
	  
	  this.pos.add(this.vel);
	  
	  this.acc = new Vector2D(0,0);
	}
	
	this.flock = function(neighbors) {
	  this.acc.add(this.separate(neighbors));
	  this.acc.add(this.align(neighbors).mult(2));
	  this.acc.add(this.center(neighbors));
	}
	
	this.separate = function(neighbors) {
	  var sum = new Vector2D(0,0);
	  
	  for(i in neighbors)
	  {
	    var boid = neighbors[i];
	    var dist = this.pos.distance(boid.pos);
	    
	    var diff = new Vector2D(this.pos.x, this.pos.y);
	    diff.sub(boid.pos);
	    
	    diff.normalize();
	    
	    sum.add(diff);
	  }
	  
	  sum.div(neighbors.length);
	  
	  return sum;
	}
	
	this.align = function(neighbors) {
	  var sum = new Vector2D(0, 0);
	  
	  for(i in neighbors)
	  {
	    var boid = neighbors[i];
	    
	    sum.add(boid.vel);
	  }
	  
	  sum.div(neighbors.length);
	  
	  return sum;
	}
	
	this.center = function(neighbors) {
	  var sum = new Vector2D(0, 0);
	  for(i in neighbors)
	  {
	    var boid = neighbors[i];
	    sum.add(boid.pos);
	  }
	  
	  sum.div(neighbors.length);
	  
	  return this.steer(sum);
	}
	
	this.steer = function(target) {
	  target.sub(this.pos);
	  target.sub(this.vel);
	  target.limit(0.01);
	  
	  return target;
	}
}

function Vector2D(x, y)
{
  this.x = x;
  this.y = y;
  
  this.r = function() {
    return Math.sqrt( this.x * this.x + this.y * this.y);
  }
  
  this.theta = function() {
    var angle = Math.atan2(-this.y, this.x);
    return -angle;
  }
  
  this.add = function(that) {
    this.x += that.x;
    this.y += that.y;
    return this;
  }
  
  this.sub = function(that) {
    this.x -= that.x;
    this.y -= that.y;
    return this;
  }
  
  this.mult = function(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }
  
  this.div = function(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }
  
  this.normalize = function() {
    if(this.r() > 0)
      this.div(this.r());
    return this;
  }
  
  this.limit = function(max) {
    var r = this.r();
    if(r > max)
    {
      this.normalize();
      this.mult(max);
    }
    return this;
  }
  
  this.distance = function(that) {
    var dx = this.x - that.x;
    var dy = this.y - that.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
}
