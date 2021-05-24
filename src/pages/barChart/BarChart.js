import * as d3 from "d3";
import React, { useRef, useEffect, useState } from "react";

const duration = 500;
function BarChart({ data, yAxisTitle }) {
  const ref = useRef();
  const margin = {
    top: 60,
    bottom: 100,
    left: 80,
    right: 40,
  };
  // const getWidth = () => {
  //   return this.ref.current.parentElement.offsetWidth;
  // }
  // const getHeight = () => {
  //   return this.ref.current.parentElement.offsetHeight;
  // }
  // const [width] = useState(getWidth());
  // const [height] = useState(getHeight());
  ;


  useEffect(() => {
    window.addEventListener("resize", draw);
    draw()
    return () => window.removeEventListener("resize", draw)
  }, []);

  useEffect(() => {
    draw();
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const draw = () => {
    const node = d3.select(ref.current);

    const bounds = ref.current ? node.node().getBoundingClientRect() : { width: 0, height: 0 };
    const width = Math.abs(bounds.width);
    const height = Math.abs(bounds.height);

    console.log(bounds.width, bounds.height)
    const innerWidth = Math.abs(width - margin.left - margin.right);
    const innerHeight = Math.abs(height - margin.top - margin.bottom);

    node
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.year))
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select(ref.current);
    const chart = svg.select("g");

    chart
      .selectAll(".bar")
      .data(data)
      .join((enter) =>
        enter
          .append("rect")
          .classed("bar", true)
          .attr("y", (d) => yScale(0))
          .attr("height", 0)
      )
      .attr("x", (d) => xScale(d.year))
      .style("fill", (d, i) => colorScale(i))
      .attr("width", (d) => xScale.bandwidth())
      .transition()
      .duration(duration)
      .delay((d, i) => (i * duration) / 10)
      .attr("height", (d) => innerHeight - yScale(d.value))
      .attr("y", (d) => yScale(d.value));

    chart
      .selectAll(".bar-label")
      .data(data)
      .join((enter) =>
        enter
          .append("text")
          .classed("bar-label", true)
          .attr("text-anchor", "middle")
          .attr("dx", 0)
          .attr("y", yScale(0))
          .attr("dy", -6)
          .attr("opacity", 0)
      )
      .attr("x", (d) => xScale(d.year) + xScale.bandwidth() / 2)
      .text((d) => d.value)
      .transition()
      .duration(duration)
      .delay((d, i) => (i * duration) / 10)
      .attr("opacity", 1)
      .attr("y", (d) => yScale(d.value));

    const xAxis = d3.axisBottom().scale(xScale);

    chart
      .selectAll(".x.axis")
      .data([null])
      .join("g")
      .classed("x axis", true)
      .attr("transform", `translate(0,${innerHeight})`)
      .transition()
      .duration(duration)
      .call(xAxis);

    const yAxis = d3.axisLeft().ticks(5).scale(yScale);

    chart
      .selectAll(".y.axis")
      .data([null])
      .join("g")
      .classed("y axis", true)
      .attr("transform", "translate(0,0)")
      .transition()
      .duration(duration)
      .call(yAxis);

    chart
      .selectAll(".x-axis-title")
      .data(["Year"])
      .join("text")
      .classed("x-axis-title", true)
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 60)
      .attr("fill", "#000")
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .text((d) => d);

    chart
      .selectAll(".y-axis-title")
      .data([yAxisTitle])
      .join("text")
      .classed("y-axis-title", true)
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform", `translate(-50, ${innerHeight / 2}) rotate(-90)`)
      .attr("fill", "#000")
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .text((d) => d);
  };

  return (
    <div className="bar-chart-container">
      <svg style={{ width: '100%', height: '100%' }} ref={ref}></svg>
    </div>
  );
}

export default BarChart;