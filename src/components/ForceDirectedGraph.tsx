// components/ForceDirectedGraph.tsx
/* eslint-disable no-param-reassign */
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import * as d3 from 'd3';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';
import { InstagramEmbed } from 'react-social-media-embed';
import { Spotify } from 'react-spotify-embed';
import { Tweet } from 'react-tweet';

const ForceDirectedGraph = ({ data, onExpand, onAddComment }: any) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tracks whether the modal is open
  const [showModal, setShowModal] = useState(false);

  // Tracks if mouse is currently hovering over the D3 area
  const [hovered, setHovered] = useState(false);

  // Stores all the node objects so we can iterate via keyboard (or swipe)
  const [graphNodes, setGraphNodes] = useState<any[]>([]);

  // Which index in graphNodes is currently selected
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // Modal content state
  const [modalContent, setModalContent] = useState<any>({
    content: '',
    id: '',
    image: '',
    title: '',
    author: '',
    group: '',
    comments: [],
  });

  // Utility: given a node object, return a pastel color for the circle/fill
  function getNodeColor(node: any) {
    switch (node.group) {
      case 'main':
        return '#88C0D0'; // pastel blue
      case 'neighbor':
      case 'penPal':
        return '#A3BE8C'; // pastel green
      case 'comment':
        return '#EBCB8B'; // pastel yellow
      case 'parent':
        return '#B48EAD'; // pastel purple
      case 'internalLink':
        return '#D08770'; // pastel orange
      default:
        return '#D8DEE9'; // light gray
    }
  }

  // Open the modal with the specified node data
  const openModal = (
    content: any,
    id: any,
    image: any,
    title: any,
    author: any,
    group: any,
    comments: any,
  ) => {
    setModalContent({ content, id, image, title, author, group, comments });
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => setShowModal(false);

  /**
   * Prevent background scrolling or swiping when modal is open.
   * We do this by setting body overflow: hidden while modal is shown.
   */
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showModal]);

  // Arrow-key navigation: left/right to move through nodes if hovered
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!hovered || graphNodes.length === 0) return;

      if (event.key === 'ArrowRight') {
        setCurrentIndex((prevIndex) => {
          if (prevIndex === null) return 0;
          return (prevIndex + 1) % graphNodes.length;
        });
      } else if (event.key === 'ArrowLeft') {
        setCurrentIndex((prevIndex) => {
          if (prevIndex === null) return graphNodes.length - 1;
          return (prevIndex - 1 + graphNodes.length) % graphNodes.length;
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hovered, graphNodes]);

  // Mobile swipe detection: when modal is open, swiping left/right changes node
  useEffect(() => {
    let startX: number | null = null;

    function handleTouchStart(e: TouchEvent) {
      // Only if the modal is open and screen is mobile sized
      if (!showModal || window.innerWidth >= 768) return;
      if (e.touches.length > 0) {
        startX = e.touches[0]!.clientX;
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      // Only if the modal is open and screen is mobile sized
      if (!showModal || window.innerWidth >= 768) return;
      if (startX === null) return;
      if (e.changedTouches.length > 0) {
        const endX = e.changedTouches[0]!.clientX;
        const deltaX = endX - startX;
        // If swipe is significant in distance
        if (Math.abs(deltaX) > 50) {
          if (deltaX < 0) {
            // Swipe left => same as ArrowRight
            setCurrentIndex((prevIndex) => {
              if (prevIndex === null) return 0;
              return (prevIndex + 1) % graphNodes.length;
            });
          } else {
            // Swipe right => same as ArrowLeft
            setCurrentIndex((prevIndex) => {
              if (prevIndex === null) return graphNodes.length - 1;
              return (prevIndex - 1 + graphNodes.length) % graphNodes.length;
            });
          }
        }
      }
      startX = null;
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [showModal, graphNodes]);

  // Whenever currentIndex changes, open that node's modal
  useEffect(() => {
    if (currentIndex === null) return;
    const selectedNode = graphNodes[currentIndex];
    openModal(
      selectedNode.label,
      selectedNode.id,
      selectedNode.image,
      selectedNode.title,
      selectedNode.author,
      selectedNode.group,
      selectedNode.comments,
    );
  }, [currentIndex, graphNodes]);

  // Add comment
  const handleAddComment = async (comment: string, parent: any) => {
    onAddComment(comment, parent);
  };

  // Utility to parse YouTube ID from URL
  const getYTId = (url: string): string => {
    if (!url) return '';
    if (url.includes('t=')) {
      return url.split('t=')[1]?.split('s')[0]!;
    }
    return url.split('v=')[1]?.split('&')[0]!;
  };

  // Utility to parse Twitter (or X) ID from URL
  const getTwitterId = (url: string): string => {
    if (!url) return '';
    if (url.includes('twitter.com') || /^https:\/\/(www\.)?x\.com/.test(url)) {
      return url.split('/').pop()!;
    }
    return '';
  };

  // Main effect to build/update the D3 force-directed graph
  useEffect(() => {
    if (!data.entry) return;
    if (!svgRef.current) return;
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = containerWidth;

    // Set up the SVG
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Clear any existing content
    svg.selectAll('*').remove();

    // Create arrowhead defs
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

    // Build the list of nodes
    const nodes = [
      {
        id: data.entry,
        label: data.entry,
        group: 'main',
        image: data.image,
        comments: data.comments,
      },
      // Neighbors
      ...data.neighbors.map((n: any) => ({
        id: n.id,
        label: n.data,
        group: 'neighbor',
        similarity: n.similarity,
        image: n.image,
        title: n.title,
        author: n.author,
        comments: n.comments,
      })),
      // Internal links
      ...data.internalLinks.map((link: any, idx: any) => ({
        id: `internalLink-${idx}`,
        label: link.internalLink,
        group: 'internalLink',
        image: link.image,
        title: link.title,
        author: link.author,
      })),
      ...data.internalLinks.flatMap((link: any) =>
        link.penPals.map((penPal: any) => ({
          id: penPal.id,
          label: penPal.data,
          group: 'penPal',
          similarity: penPal.similarity,
          image: penPal.image,
          title: penPal.title,
          author: penPal.author,
        })),
      ),
      // Comments
      ...data.comments.map((comment: any, idx: any) => ({
        id: `comment-${idx}`,
        label: comment.comment,
        group: 'comment',
        image: comment.image,
        title: comment.title,
        author: comment.author,
      })),
      ...data.comments.flatMap((comment: any) =>
        comment.penPals.map((penPal: any) => ({
          id: penPal.id,
          label: penPal.data,
          group: 'penPal',
          similarity: penPal.similarity,
          image: penPal.image,
          title: penPal.title,
          author: penPal.author,
        })),
      ),
      // Expansion
      ...data.expansion.flatMap((expansion: any) => [
        ...expansion.children.map((child: any) => ({
          id: child.id,
          label: child.data,
          group: 'expansionChild',
          image: child.image,
          title: child.title,
          author: child.author,
        })),
      ]),
      // Parents of neighbors and penPals
      ...data.neighbors
        .filter((n: any) => n.parent)
        .map((n: any) => ({
          id: n.parent.id,
          label: n.parent.data,
          group: 'parent',
          comments: n.parent.comments,
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
            comments: penPal.parent.comments,
          })),
      ),
    ];

    // Build the list of links
    const links = [
      // neighbors
      ...data.neighbors.map((n: any) => ({
        source: data.entry,
        target: n.id,
        similarity: n.similarity,
      })),
      // internal links
      ...data.internalLinks.map((_: any, idx: any) => ({
        source: data.entry,
        target: `internalLink-${idx}`,
        similarity: 0.5,
      })),
      // comments
      ...data.comments.map((_: any, idx: any) => ({
        source: data.entry,
        target: `comment-${idx}`,
        similarity: 0.5,
      })),
      // expansion
      ...data.expansion.flatMap((expansion: any) =>
        expansion.children.flatMap((child: any) => ({
          source: expansion.parent,
          target: child.id,
          similarity: child.similarity,
        })),
      ),
      // internalLinks -> penPals
      ...data.internalLinks.flatMap((link: any, idx: any) =>
        link.penPals.map((penPal: any) => ({
          source: `internalLink-${idx}`,
          target: penPal.id,
          similarity: penPal.similarity,
        })),
      ),
      // comments -> penPals
      ...data.comments.flatMap((comment: any, idx: any) =>
        comment.penPals.map((penPal: any) => ({
          source: `comment-${idx}`,
          target: penPal.id,
          similarity: penPal.similarity,
        })),
      ),
      // neighbors -> parent
      ...data.neighbors
        .filter((n: any) => n.parent)
        .map((n: any) => ({
          source: n.id,
          target: n.parent.id,
          similarity: 0.5,
        })),
      // penPals -> parent
      ...data.comments.flatMap((comment: any) =>
        comment.penPals
          .filter((penPal: any) => penPal.parent)
          .map((penPal: any) => ({
            source: penPal.id,
            target: penPal.parent.id,
            similarity: 0.5,
          })),
      ),
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

    // Set up the force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance((d: any) => 150 - (d.similarity || 0) * 80),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('collision', d3.forceCollide().radius(20))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create a group for the entire graph
    const g = svg.append('g');

    // Draw links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#aaa')
      .attr('marker-end', 'url(#arrowhead)');

    // Define drag behavior
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

    // Draw the nodes as circles
    const node = g
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', (d) => getNodeColor(d))
      .on('click', (_, d) =>
        openModal(
          d.label,
          d.id,
          d.image,
          d.title,
          d.author,
          d.group,
          d.comments,
        ),
      )
      .call(drag(simulation) as any);

    // Draw labels
    const labels = g
      .append('g')
      .selectAll('foreignObject')
      .data(nodes)
      .join('foreignObject')
      .attr('width', 150)
      .attr('height', 20)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .html((d) => {
        if (d.image) {
          return `<img src="${d.image}" alt="thumbnail" style="width: 20px; height: 20px;" />`;
        }
        const text =
          d.label.length > 20 ? `${d.label.slice(0, 20)}...` : d.label;
        return `<div style="font-size: 12px;">${text}</div>`;
      });

    // On each tick, update positions
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      labels.attr('x', (d) => d.x).attr('y', (d) => d.y);
    });

    // Enable zooming/panning
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        }),
    );

    // Store these nodes in state so we can cycle through them
    setGraphNodes(nodes);
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', margin: '0 auto' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg ref={svgRef} />

      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        contentLabel="Node Content"
        ariaHideApp={false}
      >
        {/* 
          Wrap the entire modal content in a relative container so we
          can position the index counter at the top-left of the modal content.
        */}
        <div style={{ position: 'relative' }}>
          {/* If we have a currently selected node, show the index in top-left of the modal */}
          {currentIndex !== null &&
            currentIndex >= 0 &&
            currentIndex < graphNodes.length && (
              <div
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '4px',
                  color: getNodeColor(graphNodes[currentIndex]),
                  zIndex: 9999,
                  fontWeight: 'bold',
                  marginBottom: '10px', // A bit of spacing
                }}
              >
                {`< ${currentIndex + 1} / ${graphNodes.length} >`}
              </div>
            )}

          <div className="flex flex-col">
            {modalContent.image && (
              <img
                src={modalContent.image}
                alt="thumbnail"
                style={{ width: '80%' }}
              />
            )}

            {/* YouTube embed */}
            {modalContent.author &&
              modalContent.author.includes('youtube.com') && (
                <LiteYouTubeEmbed
                  id={getYTId(modalContent.author)}
                  title="YouTube video"
                />
              )}

            {/* Twitter/X embed */}
            {modalContent.author &&
              (modalContent.author.includes('twitter.com') ||
                /^https:\/\/(www\.)?x\.com/.test(modalContent.author)) && (
                <Tweet id={getTwitterId(modalContent.author)} />
              )}

            {/* Instagram embed */}
            {modalContent.author &&
              modalContent.author.includes('instagram.com') && (
                <InstagramEmbed url={modalContent.author} />
              )}

            {/* Spotify embed */}
            {modalContent.author &&
              modalContent.author.includes('open.spotify.com') && (
                <Spotify link={modalContent.author} wide />
              )}

            <ReactMarkdown>{modalContent.content}</ReactMarkdown>

            <br />
            {/* Show existing comments (if group !== 'comment') */}
            {modalContent.group !== 'comment' &&
              modalContent.comments &&
              modalContent.comments.map((comment: any) => (
                <div key={comment.id}>
                  <div
                    key={comment.id}
                    className="mx-2 mb-4 flex items-center justify-between"
                  >
                    <div className="grow">
                      <div className="block text-gray-900 no-underline">
                        <div className="relative">
                          <span className="font-normal">{comment.data}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(comment.createdAt).toLocaleString()}
                        {comment.createdAt !== comment.updatedAt && (
                          <>
                            {' '}
                            | Last Updated:{' '}
                            {new Date(comment.updatedAt).toLocaleString()}{' '}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <hr className="my-4" />
                </div>
              ))}

            {/* Input to add comment (if group !== 'comment') */}
            {modalContent.group !== 'comment' && (
              <div>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add a comment..."
                  id={`alias-input-${modalContent.id}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const aliasInput = document.getElementById(
                      `alias-input-${modalContent.id}`,
                    );
                    if (!aliasInput) return;
                    const alias = (aliasInput as HTMLInputElement).value;
                    handleAddComment(alias, modalContent);
                    (aliasInput as HTMLInputElement).value = '';
                    // Add the new comment in real-time to modalContent
                    if (!modalContent.comments) {
                      modalContent.comments = [];
                    }
                    modalContent.comments.push({
                      id: `temp-${Math.random() * 1000} - ${new Date().toISOString()}`,
                      data: alias,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });
                    setModalContent({ ...modalContent });
                  }}
                  className="mb-2 me-2 mt-4 w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300"
                >
                  Add Comment
                </button>
              </div>
            )}

            <p className="text-sm text-gray-500">{modalContent.title}</p>
            <br />

            {/* View Entry link */}
            <Link href={`/dashboard/entry/${modalContent.id}`} className="mt-4">
              View Entry
            </Link>
            <br />

            {/* Expand button to fetch new data and update graph */}
            <button
              onClick={() => {
                onExpand(modalContent.id);
                closeModal();
              }}
              type="button"
            >
              Expand
            </button>

            {/* Close modal button */}
            <button onClick={closeModal} type="button">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForceDirectedGraph;
