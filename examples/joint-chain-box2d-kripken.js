/// Simulates a chain of sticks connected by ball joints.
/// Uses the kripken Box2D.js code.
/// NOT WORKING AT THE MOMENT. Error: assertion I>0.0 failed.

// physics parameters

var world = new Box2D.b2World(new Box2D.b2Vec2(0, 10), true);
var N = 3,           // number of connected sticks (+ 1 that is fixed)
    len = 1,          // object length is 1 m
    mass = 1,         // object mass is 1 kg
    I = 1/3*mass*len, // inertia of object (langer Stab)
    timestep = 1/100, // simulation timestep: 10 ms
    timer_id = null,
    bodies = [],
    joints = [],
    initial_energy = 0;

// visualization parameters
var w = 960,    // visualization width in pixels
    h = 600,    // visualization height in pixels
    r = 5,      // radius of joint visualization in pixels
    scale = 50,  // 1 m in physic = x pixel in visualization
    body_vis, joint_vis; // d3 selections holding the svg visualizations

function init() {
  world.SetWarmStarting(true);
  
  function createBody(x, y, rot, dynamic) {
    var bodyDef = new Box2D.b2BodyDef();
    bodyDef.set_position(new Box2D.b2Vec2(x, y));
    bodyDef.set_angle(rot);
    bodyDef.set_type(dynamic ? Box2D.b2_dynamicBody : Box2D.b2_staticBody);
    var body = world.CreateBody(bodyDef);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(len/2, len/2/10);
    var fixtureDef = new Box2D.b2FixtureDef();
    fixtureDef.set_restitution(0.1);
    fixtureDef.set_density(mass/(len*len/10));
    fixtureDef.set_friction(0.5);
    fixtureDef.set_shape(shape);
    fixtureDef.get_filter().set_groupIndex(-1); // don't let them collide with each other
    body.CreateFixture(fixtureDef);
    return body;
  }
  
  function createJoint(bodyA, bodyB, x, y) {
    var jointDef = new Box2D.b2RevoluteJointDef();
    jointDef.Initialize(bodyA, bodyB, new Box2D.b2Vec2(x,y));
    return world.CreateJoint(jointDef);
  }
  
  bodies.push(createBody(w/scale/2, len, 0, false));
  for (var i=0; i<N; i++) {
    bodies.push(createBody(w/scale/2 + (i+0.5)*len, len + len/2, -Math.PI*0.5, true));
    //joints.push(createJoint(bodies[i], bodies[i+1], w/scale/2 + i*len, len + len/2));
  }
  
  initial_energy = getTotalEnergy();
  
  initVisualization();
  addButtons();
}

function addButtons() {
  // step button
  d3.select("body").append("div").selectAll("a.button")
    .data(["Play", "Step", "Stop Movement"])
    .enter().append("a")
    .text(function(d) { return d; })
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        if (this.text == "Step") {
          world.Step(timestep, 10, 10);
          update();
        } else if (this.text == "Play") {
          this.innerHTML = "Pause";
          timer_id = setInterval(function() {
            world.Step(timestep, 10, 10);
            update();
          }, 1000/100);
        } else if (this.text == "Pause") {
          this.innerHTML = "Play";
          clearInterval(timer_id);
        } else if (this.text == "Stop Movement") {
          //world.stopMovement();
          //update();
        }
     });
}

function initVisualization() {
  var colors = d3.scale.category10();
  var drag = d3.behavior.drag()
      .on("drag", dragmove);

  var svg = d3.select("body").append("svg")
      .attr("width", w)
      .attr("height", h)
    
  svg.append("rect")
    .attr("x", 0).attr("y", 0).attr("width", w).attr("height", h)
    .attr("fill", "rgb(250,250,255)")

  body_vis = svg.selectAll("g.body")
        .data(bodies)
        .enter().append("g")
        .attr("class", "body")

  body_vis.call(drag);
  
  body_vis.append("rect")
        .attr("x", -4)
        .attr("y", -len/2*scale-r)
        .attr("width", 8)
        .attr("height", len*scale+2*r)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("stroke", function(d,i) { return colors(i); })
        .attr("fill", function(d,i) { return d3.hsl(colors(i)).brighter() } )
        .attr("stroke-width", "3px")
  
  joint_vis = svg.selectAll("circle.joint")
      .data(joints)
      .enter().append("circle")
      .attr("class", "joint")
      .attr("fill", "gray")
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr("r", r-2);

  update();
  
  function dragmove(d, i) {
    d.GetTransform().set_p(new Box2D.b2Vec2(
      Math.max(r, Math.min(w - r, d3.event.x))/scale,
      Math.max(r, Math.min(h - r, d3.event.y))/scale));
                                   
    update();
  }
}

function update() {
  body_vis
    .attr("transform", function(d) {
      return 'translate(' + d.GetPosition().get_x()*scale + ',' + d.GetPosition().get_y()*scale +
             ') rotate(' + 180/Math.PI*d.GetAngle() + ")" })
             
  joint_vis
    .attr("cx", function(d) { return d.GetAnchorA().get_x()*scale; })
    .attr("cy", function(d) { return d.GetAnchorA().get_y()*scale; });
    
  console.log("Total Energy Loss: ", -getTotalEnergy()+initial_energy);
}

function getTotalEnergy() {
  var sum = 0;
  for (var i=0; i<bodies.length; i++) sum += getEnergy(bodies[i]);
  return sum;
}

function getEnergy(body) {
  var v = body.GetLinearVelocity().Length();
  var kin = 0.5*(body.GetMass())*v*v
            + 0.5*(body.GetInertia())*body.GetAngularVelocity();
  var pot = -(body.GetMass())*10*body.GetPosition().y;
  return  kin + pot;
}
