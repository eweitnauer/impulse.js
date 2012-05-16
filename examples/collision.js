/// Written by Erik Weitnauer, 2012.
/// Simulates a chain of sticks connected by ball joints.

// simulation parameters
var params = {
  N: {value: 10, range: [0,50], label: "circles", type: 'number'}
 ,radius: {value: 0.5, postfix: " m", type: 'fixed', label:"radius"}
 ,mass: {value: 1, postfix: " kg", type: 'fixed'}
 ,inertia: {value: 0.125, postfix: " kg*m^2", type: 'fixed'}
 ,timestep: {value: 10, values: [1, 5, 10, 20, 40, 100], postfix:" ms", type: 'number'}
}

var world = new World(new Point(0,0)); world.gravity_mode = 'radial';
var timer_id;

// visualization parameters
var w = 960,    // visualization width in pixels
    h = 580,    // visualization height in pixels
    r = 0.2,    // radius of joint visualization in meter
    scale = 50; // 1 m in physic = x pixel in visualization

/// called on page load
function init() {
  initVisualization();
  
  addSimulationControls(play, pause, step, stop_movement);
  
  addParamControls("#sliders", params, update_params);  
}

/// appends svg element and global g for transformation
function initVisualization() {
  var svg = d3.select("#simulation")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
}

function play() {
  timer_id = setInterval(function() {
    world.step(params.timestep.value/1000);
    update();
  }, params.timestep.value);
}

function pause() {
  clearInterval(timer_id);
}

function step() {
  world.step(params.timestep.value/1000);
  update();
}

function stop_movement() {
  world.stopMovement();
  update();
}

var param_array = create_param_array(params);

var colors = d3.scale.category10();

function update_params() {
  // apply parameter values to the simulation
  // body count should be N+1 (the 1 is the static body at the top)
  var N = params.N.value;
  var N_changed = world.bodies.length != N;
  while (world.bodies.length < N) addBody();
  if (world.bodies.length > N) {
    world.bodies.splice(N);
  }
  if (N_changed) updateN();
    
  // mass, inertia
  world.bodies.forEach(function(body) {
    body.inv_m = 1/params.mass.value;
    body.inv_I = 1/params.inertia.value;  
  });
  
  update();
}

/// Adds one circle.
function addBody() {
  world.bodies.push(new Body(new Point(Math.random()*w-w/2, Math.random()*h-h/2).scale(1/scale),
                    new Point(0,0), params.mass.value, 0, 0, params.inertia.value));
}

function dragmove(d, i) {
  d.s.x += d3.event.dx/scale;
  d.s.y += d3.event.dy/scale;
  update();
}

var drag_body = d3.behavior.drag()
  .on("drag", dragmove)
  .on("dragstart", function(d) { d.was_dynamic = d.dynamic; d.dynamic = false; update();})
  .on("dragend", function(d) {d.dynamic = d.was_dynamic; update();})

var bs, js;

function updateN() {
  bs = d3.select("svg").selectAll("circle.body").data(world.bodies);
  var N = params.N.value;
  
  bs.exit().remove();

  bs.enter().append("circle")
    .on("click", function(d,i) { d.dynamic = !d.dynamic; update(); })
    .attr("class", "body")
    .call(drag_body);
  
  bs.attr("r", params.radius.value*scale)
    .attr("stroke-width", 2)
    .attr("fill", "black")
    .attr("fill-opacity", 0)
}

function update() {
  var N = params.N.value;
  
  bs.attr("cx", function(d) { return scale*d.s.x+w/2})
    .attr("cy", function(d) { return scale*d.s.y+h/2})
    .attr("stroke", function(d,i) { return d.dynamic ? "#eee" : "#666" })
}
