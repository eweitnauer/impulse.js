/// Simulates a chain of sticks connected by ball joints.

// physics parameters
var world = new World(new Point(0,10), 1, 1);
var N = 30,           // number of connected sticks (+ 1 that is fixed)
    len = 1,          // object length is 1 m
    mass = 1,         // object mass is 1 kg
    I = 1/3*mass*len, // inertia of object (langer Stab)
    timestep = 1/100, // simulation timestep: 10 ms
    timer_id = null;

// visualization parameters
var w = 960,    // visualization width in pixels
    h = 600,    // visualization height in pixels
    r = 5,      // radius of joint visualization in pixels
    scale = 15, // 1 m in physic = 100 pixel in visualization
    body_vis, joint_vis; // d3 selections holding the svg visualizations
    
function init() {
  var bs = [];
  bs.push(new Body(new Point(w/scale/2, len), new Point(), mass, 0, 0, I));
  bs[0].dynamic = false;
  world.bodies.push(bs[0]);
  for (var i=0; i<N; i++) {
    bs.push(new Body(new Point(w/scale/2 + (i+0.5)*len, len + len/2), new Point(), mass, -Math.PI*0.5, 0, I));
    world.bodies.push(bs[i+1]);
    world.joints.push(new Joint(bs[i], new Point(0,len/2), bs[i+1], new Point(0,-len/2)));
  }
  
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
          world.step(timestep);
          update();
        } else if (this.text == "Play") {
          this.innerHTML = "Pause";
          timer_id = setInterval(function() {
            world.step(timestep);
            update();
          }, 1000/100);
        } else if (this.text == "Pause") {
          this.innerHTML = "Play";
          clearInterval(timer_id);
        } else if (this.text == "Stop Movement") {
          world.stopMovement();
          update();
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
        .data(world.bodies)
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
      .data(world.joints)
      .enter().append("circle")
      .attr("class", "joint")
      .attr("fill", "gray")
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr("r", r-2);

  update();
  
  function dragmove(d, i) {
    d.s.x = Math.max(r, Math.min(w - r, d3.event.x))/scale;
    d.s.y = Math.max(r, Math.min(h - r, d3.event.y))/scale;
    update();
  }
}

function update() {
  body_vis
    .attr("transform", function(d) {
      return 'translate(' + d.s.x*scale + ',' + d.s.y*scale +
             ') rotate(' + 180/Math.PI*d.r + ")" })
             
  joint_vis
    .attr("cx", function(d) { return d.aInWorld().x*scale; })
    .attr("cy", function(d) { return d.aInWorld().y*scale; })
}
