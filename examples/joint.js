var world = new World();
var w = 960,
    h = 500,
    r = 15;
var bodies, joints;

function init() {
  var b1, b2;
  world.bodies.push(b1 = new Body(new Point(w/2, 2*r), new Point(), 1, 0, 0, 1));
  world.bodies.push(b2 = new Body(new Point(w/2-50, 100+2*r), new Point(), 1, 0, 0, 1));
  world.joints.push(new Joint(b1, new Point(0,50), b2, new Point(50,-50)));
    
  show();
  setInterval(function() {
    world.step(1/30);
    update();
  }, 1000/30);
}

function show() {
  var drag = d3.behavior.drag()
      .on("drag", dragmove);

  var svg = d3.select("body").append("svg")
      .attr("width", w)
      .attr("height", h)

  joints = svg.selectAll("line.g")
      .data(world.joints)
      .enter().append("g")
      .attr("class", "joint")
  joints.append("line")
      .attr("class", "A")
      .style("stroke-width", 2)
      .style("stroke", "green");
  joints.append("line")
      .attr("class", "B")
      .style("stroke-width", 2)
      .style("stroke", "blue");
  joints.append("circle")
      .attr("class", "A")
      .attr("fill", "rgba(0,255,0,0.5)")
      .attr("stroke", "none")
      .attr("r", 11)
  joints.append("circle")
      .attr("class", "B")
      .attr("fill", "rgba(0,0,255,0.5)")
      .attr("stroke", "none")
      .attr("r", 9)

  bodies = svg.selectAll("circle.body")
        .data(world.bodies)
        .enter().append("circle")
        .attr("fill", "gray")
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("r", r)
        .attr("cx", function(d) { return d.s.x; })
        .attr("cy", function(d) { return d.s.y; })
        .call(drag);
        
  function dragmove(d, i) {
    d.s.x = Math.max(r, Math.min(w - r, d3.event.x));
    d.s.y = Math.max(r, Math.min(h - r, d3.event.y));
    update();
  }
}

function update() {
  bodies
    .attr("cx", function(d) { return d.s.x; })
    .attr("cy", function(d) { return d.s.y; })
  joints.selectAll("line.A")
    .attr("x1", function(d) { return d.ba.s.x; })
    .attr("y1", function(d) { return d.ba.s.y; })
    .attr("x2", function(d) { return d.aInWorld().x; })
    .attr("y2", function(d) { return d.aInWorld().y; });
  joints.selectAll("line.B")
    .attr("x1", function(d) { return d.bb.s.x; })
    .attr("y1", function(d) { return d.bb.s.y; })
    .attr("x2", function(d) { return d.bInWorld().x; })
    .attr("y2", function(d) { return d.bInWorld().y; });
  joints.selectAll("circle.A")
    .attr("cx", function(d) { return d.aInWorld().x; })
    .attr("cy", function(d) { return d.aInWorld().y; })
  joints.selectAll("circle.B")
    .attr("cx", function(d) { return d.bInWorld().x; })
    .attr("cy", function(d) { return d.bInWorld().y; })
}
