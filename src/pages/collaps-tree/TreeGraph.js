import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function TreeGraph({ data }) {
    const ref = useRef(null)
    const width = 400;
    const height = 350;
    const dx = 10;
    const dy = width / 6;

    const margin = { top: 0, right: 50, bottom: 0, left: 50 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const diagonal = d3.linkHorizontal().
        x(d => d.y).y(d => d.x);

    const tree = d3.tree()
        .size([200, 200]);

    useEffect(() => {
        var root = d3.hierarchy(data);
        root.x0 = 119;
        root.y0 = 0;

        root.descendants().forEach((d, i) => {
            d.id = i;
            d._children = d.children;
            if (d.depth && d.data.name.length !== 7) {
                d.children = null
            }
        })

        const svg = d3.select(ref.current)
            .attr("viewBox", [0, 0, 400, 300])
            .style('font', "10px sans-serif")
            .style("user-select", 'none');

        const gLink = svg.append("g")
            .attr('fill', 'none')
            .attr('stroke', '#555')
            .attr('stroke-opacity', 0.4)
            .attr('stroke-width', 1.5)
        // .attr('width',width)
        // .attr('height', height)

        const gNode = svg.append('g')
            .attr('cursor', 'pointer')
            .attr("pointer-events", 'all')
        // .attr('width', width)
        // .attr('height', height)

        // svg.call(d3.zoom().on('zoom', (event) => {
        //     gNode.attr('transform', event.transform)
        // }))
        function update(event, source) {
            const duration = event && event.altKey ? 2500 : 250;
            const nodes = root.descendants().reverse();
            const links = root.links();

            tree(root);

            let left = root;
            let right = root;

            root.eachBefore(node => {
                if (node.x < left.x) {
                    left = node
                }
                if (node.y < right.x) {
                    right = node
                }
            })


            const transition = svg.transition()
                .duration(duration)
                .attr("viewBox", [0, 0, width - 50, height - 50])
                .tween('resize', window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

            const node = gNode.selectAll('g')
                .data(nodes, d => d.id);

            const nodeEnter = node.enter().append('g')
                .attr('transform', d => `translate(${d.x0},${d.y0})`)
                .attr('fill-opacity', 0)
                .on('click', (event, d) => {
                    d.children = d.children ? null : d._children;
                    update(event, d)
                })
            nodeEnter.append('circle')
                .attr('r', 2)
                .attr('fill', d => d._children ? '#555' : '#999')
                .attr('stroke-width', 10)

            nodeEnter.append("text")
                .attr('dy', "0.31em")
                .attr("x", d => d._children ? -6 : 6)
                .attr('text-anchor', d => d._children ? "end" : "start")
                .text(d => d.data.name)
                // .clone(true).lower()
                // .attr('stroke-linejoin', 'round')
                // .attr('stroke-width', 2)
                // .attr('stroke', 'white')
                .attr('font-size', d => 0.5 + 'em');

            const nodeUpdate = node.merge(nodeEnter).transition(transition)
                .attr('transform', d => `translate(${d.y},${d.x})`)
                .attr('fill-opacity', 1)
                .attr('stroke-opacity', 1);

            const nodeExit = node.exit().transition(transition).remove()
                .attr('transform', d => `translate(${source.y},${source.x})`)
                .attr('fill-opacity', 0)
                .attr('stroke-opacity', 0)

            const link = gLink.selectAll('path')
                .data(links, d => d.target.id);

            const linkEnter = link.enter().append('path')
                .attr('d', d => {
                    const o = { x: source.x0, y: source.y0 };
                    return diagonal({ source: o, target: o });
                });

            link.merge(linkEnter).transition(transition)
                .attr("d", diagonal);

            link.exit().transition(transition).remove()
                .attr("d", d => {
                    const o = { x: source.x, y: source.y };
                    return diagonal({ source: o, target: o })
                })

            root.eachBefore(d => {
                d.x0 = d.x;
                d.y0 = d.y
            })

        }
        update(null, root)
    }, [data])
    return (
        <div>
            <svg ref={ref}></svg>
        </div>
    )
}
