// components/ForceDirectedGraph.js
/* eslint-disable no-param-reassign */

import * as d3 from 'd3';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';

const ForceDirectedGraph = ({ data }: any) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [modalContent, setModalContent] = useState({ content: '', id: '' });
  const [showModal, setShowModal] = useState(false);

  const openModal = (content: any, id: any) => {
    setModalContent({ content, id });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  useEffect(() => {
    if (!svgRef.current) return;
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = containerWidth;

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll('*').remove();

    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#aaa');

    // Process nodes and links
    const nodes = [
      { id: data.entry, label: data.entry, group: 'main', image: data.image },
      ...data.neighbors.map((n: any) => ({
        id: n.id,
        label: n.data,
        group: 'neighbor',
        similarity: n.similarity,
        image: n.image,
      })),
      // Add internal links as nodes with 'internalLink' group
      ...data.internalLinks.map((link: any, idx: any) => ({
        id: `internalLink-${idx}`,
        label: link.internalLink,
        group: 'internalLink',
        image: link.image,
      })),
      ...data.internalLinks.flatMap((link: any) =>
        link.penPals.map((penPal: any) => ({
          id: penPal.id,
          label: penPal.data,
          group: 'penPal',
          similarity: penPal.similarity,
          image: penPal.image,
        })),
      ),
      ...data.comments.map((comment: any, idx: any) => ({
        id: `comment-${idx}`,
        label: comment.comment,
        group: 'comment',
        image: comment.image,
      })),
      ...data.comments.flatMap((comment: any) =>
        comment.penPals.map((penPal: any) => ({
          id: penPal.id,
          label: penPal.data,
          group: 'penPal',
          similarity: penPal.similarity,
          image: penPal.image,
        })),
      ),
      // Add parents of neighbors and penpals
      ...data.neighbors
        .filter((n: any) => n.parent)
        .map((n: any) => ({
          id: n.parent.id,
          label: n.parent.data,
          group: 'parent',
        })),
      ...data.internalLinks.flatMap((link: any) =>
        link.penPals
          .filter((penPal: any) => penPal.parent)
          .map((penPal: any) => ({
            id: penPal.parent.id,
            label: penPal.parent.data,
            group: 'parent',
          })),
      ),
      ...data.comments.flatMap((comment: any) =>
        comment.penPals
          .filter((penPal: any) => penPal.parent)
          .map((penPal: any) => ({
            id: penPal.parent.id,
            label: penPal.parent.data,
            group: 'parent',
          })),
      ),
    ];

    console.log('nodes:', nodes);

    function drag(sSimulation: any) {
      return d3
        .drag()
        .on('start', (event, d: any) => {
          if (!event.active) sSimulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) sSimulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }
    const links = [
      ...data.neighbors.map((n: any) => ({
        source: data.entry,
        target: n.id,
        similarity: n.similarity,
      })),
      ...data.internalLinks.map((_: any, idx: any) => ({
        source: data.entry,
        target: `internalLink-${idx}`,
        similarity: 0.5,
      })),
      ...data.comments.map((_: any, idx: any) => ({
        source: data.entry,
        target: `comment-${idx}`,
        similarity: 0.5,
      })),
      ...data.internalLinks.flatMap((link: any, idx: any) =>
        link.penPals.map((penPal: any) => ({
          source: `internalLink-${idx}`,
          target: penPal.id,
          similarity: penPal.similarity,
        })),
      ),
      ...data.comments.flatMap((comment: any, idx: any) =>
        comment.penPals.map((penPal: any) => ({
          source: `comment-${idx}`,
          target: penPal.id,
          similarity: penPal.similarity,
        })),
      ),
      // Link neighbors and penpals to their parents
      ...data.neighbors
        .filter((n: any) => n.parent)
        .map((n: any) => ({
          source: n.id,
          target: n.parent.id,
          similarity: 0.5,
        })),
      ...data.comments.flatMap((comment: any) =>
        comment.penPals
          .filter((penPal: any) => penPal.parent)
          .map((penPal: any) => ({
            source: penPal.id,
            target: penPal.parent.id,
            similarity: 0.5,
          })),
      ),
      // Link internal links to pen pals
      ...data.internalLinks.flatMap((link: any) =>
        link.penPals
          .filter((penPal: any) => penPal.parent)
          .map((penPal: any) => ({
            source: penPal.id,
            target: penPal.parent.id,
            similarity: 0.5,
          })),
      ),
    ];

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance((d: any) => 100 - (d.similarity || 0) * 80),
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const g = svg.append('g');

    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#aaa')
      .attr('marker-end', 'url(#arrowhead)');

    const node = g
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', (d) => {
        if (d.group === 'main') return 'blue';
        if (d.group === 'neighbor' || d.group === 'penPal') return 'green';
        if (d.group === 'comment') return 'yellow';
        if (d.group === 'parent') return 'purple';
        if (d.group === 'internalLink') return 'brown'; // Internal links as brown nodes
        return 'gray';
      })
      .on('click', (_, d) => openModal(d.label, d.id))
      .call(drag(simulation) as any);

    const labels = g
      .append('g')
      .selectAll('foreignObject')
      .data(nodes)
      .join('foreignObject')
      .attr('width', 150) // Adjust width to fit text
      .attr('height', 20) // Adjust height to fit text
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .html((d) => {
        if (d.image) {
          return `<img src="${d.image}" alt="thumbnail" style="width: 20px; height: 20px;" />`;
        }
        return `<div style="font-size: 12px;">${d.label.length > 20 ? `${d.label.slice(0, 20)}...` : d.label}</div>`;
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      labels.attr('x', (d) => d.x).attr('y', (d) => d.y);
    });

    // Correct type casting for SVG zoom
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        }),
    );
  }, [data]);

  return (
    <div ref={containerRef} style={{ width: '100%', margin: '0 auto' }}>
      <svg ref={svgRef} />
      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        contentLabel="Node Content"
        ariaHideApp={false}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
      >
        <p>{modalContent.content}</p>
        <Link href={`/dashboard/entry/${modalContent.id}`} className="mt-4">
          View Entry
        </Link>
        <button onClick={closeModal} type="button">
          Close
        </button>
      </Modal>
    </div>
  );
};

export default ForceDirectedGraph;
