var world = new World();
var w = 960,
    h = 500,
    r = 5,
    scale = 100, // 1 m in physic = 100 pixel in visualization
    timestep = 1/100;
var bodies, joints, v_bodies;
var timer_id;

function init() {
  var mass = 1,
      len = 100/scale,
      I = 1/3*mass*len; // Inertia eines langen Stabes
      //I = 1/2*mass*r*r/scale/scale; // Inertia einer Kreisscheibe

  var N = 3; // number of swinging bars
  var bs = [];
  bs.push(new Body(new Point(w/scale/2, 20/scale), new Point(), mass, 0, 0, I));
  bs[0].dynamic = false;
  world.bodies.push(bs[0]);
  for (var i=0; i<N; i++) {
    bs.push(new Body(new Point(w/scale/2 + (i+0.5)*len, 20/scale + len/2), new Point(), mass, -Math.PI*0.5, 0, I));
    world.bodies.push(bs[i+1]);
    world.joints.push(new Joint(bs[i], new Point(0,len/2), bs[i+1], new Point(0,-len/2)));
  }
    
  show();
  
  // stepA button
  d3.select("body").append("a")
    .text("JointCorr")
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        world.stepA(timestep);
        update();
     });
  // stepB button
  d3.select("body").append("a")
    .text("Integrate")
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        world.stepB(timestep);
        update();
     });
  // stepC button
  d3.select("body").append("a")
    .text("JointVCorr")
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        world.stepC(timestep);
        update();
     });
  
  // play button   
  d3.select("body").append("a")
    .text("Play")
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        if (this.text == "Play") {
          this.innerHTML = "Pause";
          timer_id = setInterval(function() {
            world.step(timestep);
            update();
          }, 1000/30);
        } else {
          this.innerHTML = "Play";
          clearInterval(timer_id);
        }
     });
}

function show() {
  var drag = d3.behavior.drag()
      .on("drag", dragmove);

  var svg = d3.select("body").append("svg")
      .attr("width", w)
      .attr("height", h)

  joints = svg.selectAll("g")
      .data(world.joints)
      .enter().append("g")
      .attr("class", "joint")
  joints.append("line")
      .attr("class", "A")
      .style("stroke-width", 5)
      .style("stroke", "rgba(0,255,0,0.8)");
  joints.append("line")
      .attr("class", "B")
      .style("stroke-width", 5)
      .style("stroke", "blue");
  joints.append("circle")
      .attr("class", "A")
      .attr("fill", "rgba(0,255,0,1)")
      .attr("stroke", "none")
      .attr("r", 4)
  joints.append("circle")
      .attr("class", "B")
      .attr("fill", "rgba(0,0,255,1)")
      .attr("stroke", "none")
      .attr("r", 4)
  joints.append("line")
      .attr("class", "Av")
      .style("stroke-width", 1)
      .style("stroke", "rgba(255,0,0,0.2)");
  joints.append("line")
      .attr("class", "Bv")
      .style("stroke-width", 1)
      .style("stroke", "rgba(255,0,0,0.2)");


  bodies = svg.selectAll("circle.body")
        .data(world.bodies)
        .enter().append("circle")
        .attr("fill", "gray")
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("r", r-2)
        .attr("cx", function(d) { return d.s.x; })
        .attr("cy", function(d) { return d.s.y; })
        .call(drag);

  v_bodies = svg.selectAll("line.v_body")
        .data(world.bodies)
        .enter().append("line")
        .attr("class", "v_body")
        .attr("stroke-width", "1px")
        .attr("stroke", "rgba(255,0,0,0.2)");

  update();
  
  function dragmove(d, i) {
    d.s.x = Math.max(r, Math.min(w - r, d3.event.x))/scale;
    d.s.y = Math.max(r, Math.min(h - r, d3.event.y))/scale;
    update();
  }
}

function update() {
  bodies
    .attr("cx", function(d) { return d.s.x*scale; })
    .attr("cy", function(d) { return d.s.y*scale; })
  v_bodies
    .attr("x1", function(d) { return d.s.x*scale; })
    .attr("y1", function(d) { return d.s.y*scale; })
    .attr("x2", function(d) { return d.s.x*scale + d.v.x*scale*timestep; })
    .attr("y2", function(d) {  return d.s.y*scale + d.v.y*scale*timestep; });
  joints.selectAll("line.Av")
    .attr("x1", function(d) { return d.aInWorld().x*scale; })
    .attr("y1", function(d) { return d.aInWorld().y*scale; })
    .attr("x2", function(d) { return d.aInWorld().x*scale + d.body_a.get_v_at(d.aInWorld()).x*scale*timestep; })
    .attr("y2", function(d) { return d.aInWorld().y*scale + d.body_a.get_v_at(d.aInWorld()).y*scale*timestep; });
   joints.selectAll("line.Bv")
    .attr("x1", function(d) { return d.bInWorld().x*scale; })
    .attr("y1", function(d) { return d.bInWorld().y*scale; })
    .attr("x2", function(d) { return d.bInWorld().x*scale + d.body_b.get_v_at(d.bInWorld()).x*scale*timestep; })
    .attr("y2", function(d) { return d.bInWorld().y*scale + d.body_b.get_v_at(d.bInWorld()).y*scale*timestep; });
  joints.selectAll("line.A")
    .attr("x1", function(d) { return d.body_a.s.x*scale; })
    .attr("y1", function(d) { return d.body_a.s.y*scale; })
    .attr("x2", function(d) { return d.aInWorld().x*scale; })
    .attr("y2", function(d) { return d.aInWorld().y*scale; });
  joints.selectAll("line.B")
    .attr("x1", function(d) { return d.body_b.s.x*scale; })
    .attr("y1", function(d) { return d.body_b.s.y*scale; })
    .attr("x2", function(d) { return d.bInWorld().x*scale; })
    .attr("y2", function(d) { return d.bInWorld().y*scale; });
  joints.selectAll("circle.A")
    .attr("cx", function(d) { return d.aInWorld().x*scale; })
    .attr("cy", function(d) { return d.aInWorld().y*scale; })
  joints.selectAll("circle.B")
    .attr("cx", function(d) { return d.bInWorld().x*scale; })
    .attr("cy", function(d) { return d.bInWorld().y*scale; })
}

/// Values might either be an array (then its values are used to label the
/// buttons) or an integer (then its the number of elements and the buttons are
/// labeled from 1 to values).
/// The values of the buttons (which are passed to the callback function) run
/// from 0 to (number_of_buttons-1) in the integer case or are the array values
/// in the array case.
/// Returns an array of the button <a> elements.
function addButtons(div, values, callback) {
  var use_labels = (typeof(values) !== 'number');
  var l = use_labels ? values.length : values;
  var btns = [];
  for (var i=0; i<l; ++i) {
    var a = document.createElement('a');
    a.className = "button";
    a.innerHTML = use_labels ? values[i] : i+1;
    a.setAttribute('href', '/');
    a.value = use_labels ? values[i] : i;
    a.addEventListener("click", function(event) {
      event.preventDefault();
      callback(event.target.value, event.target);
    }, false);
    div.appendChild(a);
    btns.push(a);
  }
  return btns;
}
