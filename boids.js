/**
 * Canvas Demo: Boids simulation
 *
 * (c) 2010 G. Nicholas D'Andrea. All Rights Reserved.
 * http://www.gnidan.org/
 *
 * TODO: Fix distance method to incorporate toroidal wrap
 * TODO: Refactor vector stuff entirely
 */

/**
 * Arena class
 *
 * Maintains the state for a particular boids arena
 */
function Arena(canvas, size, maxSpeed)
{
  /**
   * Distance when two boids become neighbors
   */
	this.neighborDistance = 4 * size;

  /**
   * Distance when two boids become too crowded
   */
  this.crowdedDistance = 1.6 * size;
  
  /**
   * <canvas> element
   */
	this.canvas = canvas;

  /**
   * Canvas drawing context
   */
	this.context = canvas.getContext("2d");

  /**
   * Length of each boid
   */
	this.size = size;

  /**
   * Maximum speed for each boid
   */
	this.maxSpeed = maxSpeed;

  /**
   * Array of boids
   */
	this.boids = [];
	
  /**
   * The setInterval return value for the simulation. False if not running
   */
	this.simulation = false;
	
  /**
   * Cruise target to give to Boids to stir up flocking
   */
	this.target = false;

  /**
   * ms per step
   */
  this.portion = 0;
	
  /**
   * Run the simulation at a specified framerate
   *
   * @param framerate float Frames per second
   */
	this.simulate = function(framerate) {
		this.portion = 1 / framerate;
		
		var arena = this;
		// framerate => frames per second
		// interval = 1000 / framerate

		this.simulation = setInterval(function() { arena.step(arena); }, 1000.0 / framerate);
	}
	
  /**
   * Pause the simulation
   */
	this.pause = function()
	{
	  if(this.simulation)
	    clearInterval(this.simulation);
	}
	
  /**
   * Generate a new boid and add it the arena at location (x,y)
   */
	this.newBoid = function(x, y) {
		var b = new Boid(x, y);
		b.crowdedDistance = this.crowdedDistance;
		this.boids.push(b);
		return b;
	}
	
  /**
   * Draw the arena
   */
	this.draw = function() {
    /* First clear everything */
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
    /* Now let's pencil the gridlines */
		this.context.beginPath();
		for (var x = 0.5; x <= this.canvas.width + 0.5; x += this.size) {
		  this.context.moveTo(x, 0);
		  this.context.lineTo(x, this.canvas.height);
		}
		
		for (var y = 0.5; y <= this.canvas.height + 0.5; y += this.size) {
		  this.context.moveTo(0, y);
		  this.context.lineTo(this.canvas.width, y);
		}

    /* And ink them */
		this.context.strokeStyle = "#eee";
		this.context.stroke();		
		
    /* Draw each boid */
		for(var i in this.boids)
		{
			this.boids[i].draw(this.context, this.size);
		}
	}
	
  /**
   * Execute one step of the simulation
   */
	this.step = function(arena) {
    /* Move each boid then draw */
		for(var i in arena.boids)
		{
			var boid = arena.boids[i];
			
      /* Calculate the boid's neighbors based on distance */
			var neighbors = [];
			for(var j in arena.boids)
			{
			  var other = arena.boids[j];
			  
			  if(other != boid && 
          boid.pos.distance(other.pos) <= this.neighborDistance)
        {
          neighbors.push(other);
        }
			}
			
      /* If the boid has neighbors, flock. Otherwise, cruise */
			if(neighbors.length > 0)
			{
			  boid.flock(neighbors);
		  }
			else
			{
			  if(i % 2 == 0)
			    this.target = new Vector2D(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
			    
			  boid.cruise(this.target);
			}
			  
			
      /* dx */
			var distance = arena.size * arena.maxSpeed * arena.portion;
			
			boid.move(distance);
		}
		
    /* Account for toroidal wrap: If a boid flies off-screen, put it back on 
     * the other side! */
		for(var i in arena.boids)
		{
		  var boid  = arena.boids[i];
		  
		  boid.pos.x += arena.canvas.width;
		  boid.pos.y += arena.canvas.height;
		  
		  boid.pos.x %= arena.canvas.width;
			boid.pos.y %= arena.canvas.height;			
		}
		
		arena.draw();
	}
}

/**
 * Boid class
 */
function Boid(x, y)
{
  /**
   * Position vector. Used as a position (x,y) tuple. 
   */
  this.pos   = new Vector2D(x, y);

  /**
   * Velocity vector
   */
  this.vel   = new Vector2D(Math.random() * 2 - 1, Math.random() * 2 - 1);
  
  /**
   * Acceleration vector
   */
  this.acc   = new Vector2D(0,0);
  
  /**
   * Target to aim for when cruising. False if flocking
   */
  this.cruise_target = false;
  
  /**
   * Don't discriminate! Color of the boid (for debugging purposes. Or maybe 
   * to make things psychedelic perhaps. I dunno.)
   */
  this.color = "#000";

  /**
   * Draw the boid
   */
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

	  context.strokeStyle = this.color;
	  context.stroke();
	}
	
  /**
   * Move based on acc/vel.
   *
   * @param distance Limiting distance
   */
	this.move = function(distance) {
	  this.vel.add(this.acc);
	  
	  this.vel.limit(distance);
	  
	  this.pos.add(this.vel);
	  
	}
	
  /**
   * Flocking behavior!
   *
   * @param neighbors The boids homeboys
   */
	this.flock = function(neighbors) {
	  this.acc = new Vector2D(this.vel.x,this.vel.y);
	  
	  this.cruise_target = false;
	  
    /* THREE OBJECTIVES! */

    /* 1. Separate from crowded neighbors
     */
	  this.acc.add(this.separate(neighbors).mult(2));

    /* 2. Align with all neighbors
     */
	  this.acc.add(this.align(neighbors));

    /* 3. Aim for the center of the neighbors
     */
	  this.acc.add(this.center(neighbors));
	}
	
  /**
   * Cruise
   *
   * @param point If the boid doesn't already have a cruise target, assign it 
   * to point
   */
	this.cruise = function(point) {	  
	  if(! this.cruise_target)
	  {
	    this.cruise_target = new Vector2D(point.x, point.y);
    }

    this.acc = this.steer(this.cruise_target); 
	}
	
  /**
   * Separate from crowded boids
   */
	this.separate = function(neighbors) {
	  var sum = new Vector2D(0,0);
	  var count = 0;
	  for(var i in neighbors)
	  {
	    var boid = neighbors[i];
	    
	    var dist = this.pos.distance(boid.pos);
	    
	    if(dist < this.crowdedDistance)
	    {
	      var diff = new Vector2D(this.pos.x, this.pos.y);
  	    diff.sub(boid.pos);

  	    diff.normalize();
  	    diff.mult(dist);

  	    sum.add(diff);
  	    count++;
	    }

	  }
	  if(count > 0)
	    sum.div(neighbors.length);
	  
	  return sum;
	}
	
  /**
   * Align with neighbors
   */
	this.align = function(neighbors) {
	  var sum = new Vector2D(0, 0);
	  
	  for(var i in neighbors)
	  {
	    var boid = neighbors[i];
	    
	    sum.add(boid.vel);
	  }
	  
	  if(neighbors.length > 0)
	    sum.div(neighbors.length);
	  
	  return sum;
	}
	
  /**
   * Steer towards the center of the group
   */
	this.center = function(neighbors) {
	  var center = new Vector2D(0, 0);
	  for(var i in neighbors)
	  {
	    var boid = neighbors[i];
	    center.add(boid.pos);
	  }
	  
	  if(neighbors.length > 0)
	    center.div(neighbors.length);

	  return this.steer(center);
	}
	
  /**
   * Steer. Given a target, limit the turn magnitude in the direction of the 
   * target
   */
	this.steer = function(target) {
	  var copy = new Vector2D(target.x, target.y);
	  
	  copy.sub(this.pos);
	  copy.limit(0.1);
	  
	  return copy;
  }
	
  /**
   * in_front_of
   *
   * @return true if other boid is in front of this boid, considering a line 
   * through the boid perpendicular to its orientation
   */
	this.in_front_of = function(that) {
	  var subv = new Vector2D(that.pos.x, that.pos.y);
	  subv.sub(this.pos);

	  if(subv.theta() > 0 && subv.theta() < Math.PI)
	    return true;
	  else
	    return false;
	}
}

/**
 * 2D Vector class
 */
function Vector2D(x, y)
{
  this.x = x;
  this.y = y;
  
  /**
   * Magnitude
   */
  this.r = function() {
    return Math.sqrt( this.x * this.x + this.y * this.y);
  }
  
  /**
   * Orientation
   */
  this.theta = function() {
    var angle = Math.atan2(-this.y, this.x);
    return -angle;
  }
  
  /**
   * Add another vector to this one
   */
  this.add = function(that) {
    this.x += that.x;
    this.y += that.y;
    return this;
  }
  
  /**
   * Subtract another vector from this one
   */
  this.sub = function(that) {
    this.x -= that.x;
    this.y -= that.y;
    return this;
  }
  
  /**
   * Multiply this vector by some scalar
   */
  this.mult = function(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }
  
  /**
   * Divide this vector by some scalar
   */
  this.div = function(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }
  
  /**
   * Normalize this vector to have magnitude of 1
   */
  this.normalize = function() {
    if(this.r() > 0)
      this.div(this.r());
    return this;
  }
  
  /**
   * If this vector's magnitude is greater than max, set the magnitude to max
   */
  this.limit = function(max) {
    var r = this.r();
    if(r > max)
    {
      this.normalize();
      this.mult(max);
    }
    return this;
  }
  
  /**
   * Distance to another vector
   */
  this.distance = function(that) {
    var dx = this.x - that.x;
    var dy = this.y - that.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
}
