(function($) {
  var margin = {top: 80, right: 80, bottom: 80, left: 80},
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

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
    var timeElapsed = 0;

    var stops = data.filter(function(d, i){
      if(d.Sound || d.Sound == 0 ){
        return true;
      }
      if (i == data.length - 1) {
        return true;
      }
      return false;
    });

    // Compute the minimum and maximum date, and the maximum price.
    x.domain([dates[0], dates[dates.length - 1]]);
    y.domain([AUTOTUNE.y_axis.minval, AUTOTUNE.y_axis.maxval]).nice();

    var widthScale = d3.time.scale().range([100, 0]).domain(d3.extent(dates));

    var audioPlayer = document.getElementById('audioPlayer');

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


    var tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('display', 'none');

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
      .style('display', 'none')

    /* Optionally add a guideline */
    var guideline = svg.append('line')
      .attr('stroke', '#333')
      .attr('stroke-width', 0)
      .attr('class', 'guide')
      .attr('x1', 1)
      .attr('y1', 1)
      .attr('x2', 1)
      .attr('y2', height)

    // Plot stopping points
    svg
      .selectAll('.dot')
      .data(stops)
      .enter()
    .append('circle')
      .classed('dot', true)
      .attr('cx', function(d) {
        return x(new Date(d.x_axis));
      })
      .attr('cy', function(d) {
        return y(d.y1)
      })
      .attr('r', 8)
      .attr('stroke', '#38EDF5')
      .attr('stroke-width', 3)
      .style('fill', '#EAEAEA')

      .on('mouseenter', function(d) {
        d3.select(this).style('fill', '#38EDF5')
        tooltip
          .style('display', 'block')
          .transition()
            .duration(200)
            .style('opacity', 1);
        tooltip
          .style('left', (d3.event.pageX + 8) + 'px')
          .style('top', (d3.event.pageY + 8) + 'px')
          .html(d.Text);
      })
      .on('mouseleave', function(d) {
        tooltip
          .transition()
            .duration(200)
            .style('opacity', 0)
            .style('display', 'none');
        d3.select(this).style('fill', '#EAEAEA')
      });

    d3.select('#nextbtn').on('click', function(e){
      if(stopIndex == -1){
        $(this).text('Next');
      }
      var thisStop = getNextStop();
      var widthpc= widthScale(new Date(thisStop.x_axis))/100;
      var duration = getDuration();

      d3.select('rect.curtain')
        .transition()
        .duration(duration)
        .ease('linear')
        .attr('width', width * widthpc + 'px');

      playAudioForSeconds(duration);
    });

  var getNextStop = function(){
    stopIndex++;
    if(stops[stopIndex]){
      return stops[stopIndex];
    }
    return data[data.length - 1];
  }

  var getDuration = function(){
    if(stops[stopIndex]){
      return (stops[stopIndex].Sound*1000) - timeElapsed;
    }
    else {
      return (audioPlayer.duration*1000) - timeElapsed;
    }
  }

  var playAudioForSeconds = function(duration){
    audioPlayer.play();
    setTimeout(function(){
      audioPlayer.pause();
      timeElapsed += duration;
    }, duration + 100);
  }
})($);