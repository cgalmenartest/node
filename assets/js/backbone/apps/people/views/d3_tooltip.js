// D3 Tooltip
// from http://bl.ocks.org/rveciana/5181105

var d3 = require('d3');

var D3_ToolTip = {

  add: function (accessor) {
    return function (selection) {
      var tooltipDiv;
      var bodyNode = d3.select('body').node();
      selection.on("mouseover", function (d, i) {
        // Clean up lost tooltips
        d3.select('body').selectAll('div.d3_tooltip').remove();
        // Append tooltip
        tooltipDiv = d3.select('body').append('div').attr('class', 'd3_tooltip');
        var absoluteMousePos = d3.mouse(bodyNode);
        tooltipDiv.style('left', (absoluteMousePos[0] + 10) + 'px')
          .style('top', (absoluteMousePos[1] - 15) + 'px')
          .style('position', 'absolute')
          .style('z-index', 100001);
        // Add text using the accessor function
        var tooltipText = accessor(d, i) || '';
        // Crop text arbitrarily
        tooltipDiv.style('width', function (d, i) {
          return (tooltipText.length > 80) ? '300px' : null;
        }).html(tooltipText);
      })
        .on('mousemove', function (d, i) {
          // Move tooltip
          var absoluteMousePos = d3.mouse(bodyNode);
          tooltipDiv.style('left', (absoluteMousePos[0] + 10) + 'px')
            .style('top', (absoluteMousePos[1] - 15) + 'px');
          var tooltipText = accessor(d, i) || '';
          tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function (d, i) {
          // Remove tooltip
          tooltipDiv.remove();
        });
    };
  }

};

module.exports = D3_ToolTip;
