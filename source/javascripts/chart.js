(function($) {
  var margin = {top: 80, right: 80, bottom: 80, left: 80},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  var parse = d3.time.format("%d/%m/%Y").parse

  // Scales and axes. Note the inverted domain for the y-scale: bigger is up!
  var x = d3.time.scale().range([0, width]),
      y = d3.scale.linear().range([height, 0]),
      xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true),
      yAxis = d3.svg.axis().scale(y).ticks(4).orient("left");

  // An area generator, for the light fill.
  var area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d) { return x(parse(d.x_axis)); })
      .y0(height)
      .y1(function(d) { return y(d.y1); });

  // A line generator, for the dark stroke.
  var line = d3.svg.line()
      .interpolate("monotone")
      .x(function(d) { return x(new Date(d.x_axis)); })
      .y(function(d) { return y(d.y1); });

  var data = chart_data;

    // Filter to one symbol; the S&P 500.
    var dates = data.map(function(d){
     return new Date(d.x_axis);
    });

    var values = data.map(function(d){
     return d.y1;
    });

    var stopIndex = -1;

    var stops = data.filter(function(d){
      if(d.Sound){
        return true;
      } 
      return false;
    });

    // Compute the minimum and maximum date, and the maximum price.
    x.domain(d3.extent(dates));
    y.domain([50,70]).nice();

    var widthScale = d3.time.scale().range([100, 0]).domain(d3.extent(dates));

    // Add an SVG element with the desired dimensions and margin.
    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Add the clip path.
    svg.append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    // Add the x-axis.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the y-axis.
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);


    var colors = d3.scale.category10();

    svg.append('path')
          .attr('class', 'line')
          .attr('clip-path', 'url(#clip)')
          .attr('d', line(data));

    /* Add 'curtain' rectangle to hide entire graph */
    var curtain = svg.append('rect')
      .attr('x', -1 * width)
      .attr('y', -1 * height)
      .attr('height', height)
      .attr('width', width)
      .attr('class', 'curtain')
      .attr('transform', 'rotate(180)')
      .style('fill', '#ffffff')

    /* Optionally add a guideline */
    var guideline = svg.append('line')
      .attr('stroke', '#333')
      .attr('stroke-width', 0)
      .attr('class', 'guide')
      .attr('x1', 1)
      .attr('y1', 1)
      .attr('x2', 1)
      .attr('y2', height)

    /* Create a shared transition for anything we're animating */
    var transition = svg.transition()
      .delay(750)
      .duration(3000)
      .ease('linear')
      .each('end', function() {
        // d3.select('line.guide')
        //   .transition()
        //   .style('opacity', 0)
        //   .remove()
      });

    // t.select('rect.curtain')
    //   .attr('width', 0);
    // t.select('line.guide')
    //   .attr('transform', 'translate(' + width + ', 0)')

    d3.select("#show_guideline").on("change", function(e) {
      guideline.attr('stroke-width', this.checked ? 1 : 0);
      curtain.attr("opacity", this.checked ? 0.75 : 1);
    });

    d3.select('#nextbtn').on('click', function(e){
      if(stopIndex == -1){
        this.text = 'Next';
      }
      var thisStop = getNextStop();
      var widthpc= widthScale(new Date(thisStop.x_axis))/100;
      
      d3.select('rect.curtain')
        .transition()
        .delay(750)
        .duration()
        .ease('linear')
        .attr('width', width * widthpc );
    });

  // Parse dates and numbers. We assume values are sorted by date.
  function type(d) {
    d.date = parse(d.date);
    d.price = +d.price;
    return d;
  }

  var getNextStop = function(){
    stopIndex++;
    return stops[stopIndex];
  }

  var getDuration = function(){
    if(stops[stopIndex + 1]){
      return stops[stopIndex + 1]*1000;
    }
    else {
      return 10; 
    }
  }
})($);