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

interface ForceDirectedGraphProps {
  data: any;
  onExpand: (id: string) => void;
  onAddComment: (comment: string, parent: any) => void;
}

const ForceDirectedGraph: React.FC<ForceDirectedGraphProps> = ({
  data,
  onExpand,
  onAddComment,
}) => {
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
    matchedCommentId: '',
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
      case 'internalLink':
        return '#D08770'; // pastel orange
      case 'expansionChild':
        return '#FFA500'; // pastel-ish orange
      default:
        return '#D8DEE9'; // light gray
    }
  }

  // Open the modal
  const openModal = (
    content: any,
    id: any,
    image: any,
    title: any,
    author: any,
    group: any,
    comments: any,
    matchedCommentId: any,
  ) => {
    setModalContent({
      content,
      id,
      image,
      title,
      author,
      group,
      comments,
      matchedCommentId,
    });
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => setShowModal(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showModal]);

  // Keyboard navigation with arrow-left/right
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

  // Mobile swipe detection: change nodes if modal is open
  useEffect(() => {
    let startX: number | null = null;

    function handleTouchStart(e: TouchEvent) {
      if (!showModal || window.innerWidth >= 768) return;
      if (e.touches.length > 0) {
        startX = e.touches[0]!.clientX;
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (!showModal || window.innerWidth >= 768) return;
      if (startX === null) return;
      if (e.changedTouches.length > 0) {
        const endX = e.changedTouches[0]!.clientX;
        const deltaX = endX - startX;
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
      selectedNode.matchedCommentId,
    );
  }, [currentIndex, graphNodes]);

  // Add comment
  const handleAddComment = async (comment: string, parent: any) => {
    onAddComment(comment, parent);
  };

  // Utility to parse YouTube ID
  const getYTId = (url: string): string => {
    if (!url) return '';
    if (url.includes('t=')) {
      return url.split('t=')[1]?.split('s')[0]!;
    }
    return url.split('v=')[1]?.split('&')[0]!;
  };

  // Utility to parse Twitter (or X) ID
  const getTwitterId = (url: string): string => {
    if (!url) return '';
    if (url.includes('twitter.com') || /^https:\/\/(www\.)?x\.com/.test(url)) {
      return url.split('/').pop()!;
    }
    return '';
  };

  // ----------------------------------------------------------------------------
  // NOTE: Helper function:
  //       "If an item has a parent, return the parent object. Otherwise return the item."
  //
  //       We'll use this to ensure we show the parent's data in the graph (not the child).
  //       You can adapt this for neighbors, penPals, or comments as needed.
  // ----------------------------------------------------------------------------
  function getParentOrSelf(item: any, defaultGroup: string) {
    if (item.parent) {
      // Return the parent's data in place of the child's
      console.log('item.parent:', item.id);
      return {
        id: item.parent.id,
        label: item.parent.data,
        group: defaultGroup, // or 'parent', or however you want to label them
        image: item.image,
        title: item.parent.title,
        author: item.parent.author,
        comments: item.parent.comments,
        matchedCommentId: item.id,
        similarity: item.similarity,
      };
    }
    // If there's no parent, just return the item
    return {
      id: item.id,
      label: item.data,
      group: defaultGroup,
      image: item.image,
      title: item.title,
      author: item.author,
      comments: item.comments,
      similarity: item.similarity,
    };
  }

  // ----------------------------------------------------------------------------
  // Main effect to build/update the D3 force-directed graph
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!data.entry) return;
    if (!svgRef.current) return;
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = containerWidth;

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Clear existing content
    svg.selectAll('*').remove();

    // Arrowhead
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

    // ----------------------------------------------------------------------------
    // Build rawNodes
    // ----------------------------------------------------------------------------
    const rawNodes = [
      // main node
      {
        id: data.entry,
        label: data.entry,
        group: 'main',
        image: data.image,
        comments: data.comments,
      },

      // neighbors => either the neighbor itself or its parent
      ...data.neighbors.map((n: any) => getParentOrSelf(n, 'neighbor')),

      // internal links
      ...data.internalLinks.map((link: any, idx: number) => ({
        id: `internalLink-${idx}`,
        label: link.internalLink,
        group: 'internalLink',
        image: link.image,
        title: link.title,
        author: link.author,
      })),

      // penPals from internalLinks => parent or self
      ...data.internalLinks.flatMap((link: any) =>
        link.penPals.map((penPal: any) => getParentOrSelf(penPal, 'penPal')),
      ),

      // comments => keep them as nodes (or adapt if you want the parent's node)
      ...data.comments.map((comment: any, idx: number) => ({
        id: `comment-${idx}`,
        label: comment.comment,
        group: 'comment',
        image: comment.image,
        title: comment.title,
        author: comment.author,
        comments: comment.penPals,
      })),

      // penPals from comments => parent or self
      ...data.comments.flatMap((comment: any) =>
        comment.penPals.map((penPal: any) => getParentOrSelf(penPal, 'penPal')),
      ),

      // expansions
      ...data.expansion.flatMap((expansion: any) =>
        expansion.children.map((child: any) => ({
          id: child.id,
          label: child.data,
          group: 'expansionChild',
          image: child.image,
          title: child.title,
          author: child.author,
          comments: child.comments,
          similarity: child.similarity,
        })),
      ),

      // ----------------------------------------------------------------------------
      // NOTE: We skip the explicit "parents of neighbors/penPals" blocks,
      //       because we've already returned the parent (if it exists) via getParentOrSelf.
      // ----------------------------------------------------------------------------
    ];

    // Deduplicate
    const uniqueNodes = Array.from(
      new Map(rawNodes.map((node) => [node.id, node])).values(),
    );

    // ----------------------------------------------------------------------------
    // Build links
    // Whenever an item had a parent, we “link to the parent” rather than the item’s ID.
    // For example, if neighbor n has a parent, we link source => n.parent.id, not n.id.
    // ----------------------------------------------------------------------------
    const rawLinks = [
      // neighbors
      ...data.neighbors.map((n: any) => ({
        source: data.entry,
        target: n.parent ? n.parent.id : n.id, // link to parent if it exists
        similarity: n.similarity,
      })),

      // internal links => still link from main entry
      ...data.internalLinks.map((_: any, idx: number) => ({
        source: data.entry,
        target: `internalLink-${idx}`,
        similarity: 0.5,
      })),

      // comments => link from entry to each comment node
      ...data.comments.map((_: any, idx: number) => ({
        source: data.entry,
        target: `comment-${idx}`,
        similarity: 0.5,
      })),

      // expansions
      ...data.expansion.flatMap((expansion: any) =>
        expansion.children.map((child: any) => ({
          source: expansion.parent,
          target: child.id,
          similarity: child.similarity,
        })),
      ),

      // internalLinks -> penPals
      ...data.internalLinks.flatMap((link: any, idx: number) =>
        link.penPals.map((penPal: any) => ({
          source: `internalLink-${idx}`,
          target: penPal.parent ? penPal.parent.id : penPal.id, // link to parent if it exists
          similarity: penPal.similarity,
        })),
      ),

      // comments -> penPals
      ...data.comments.flatMap((comment: any, idx: number) =>
        comment.penPals.map((penPal: any) => ({
          source: `comment-${idx}`,
          target: penPal.parent ? penPal.parent.id : penPal.id,
          similarity: penPal.similarity,
        })),
      ),

      // We skip the old "neighbors -> parent" and "penPals -> parent"
      // because we've already replaced references to the child with the parent's ID above.
    ];

    // Deduplicate links
    const linkSet = new Set<string>();
    const uniqueLinks: any[] = [];
    for (const l of rawLinks) {
      const linkKey = `${l.source}--${l.target}`;
      if (!linkSet.has(linkKey)) {
        linkSet.add(linkKey);
        uniqueLinks.push(l);
      }
    }

    // Force simulation
    const simulation = d3
      .forceSimulation(uniqueNodes)
      .force(
        'link',
        d3
          .forceLink(uniqueLinks)
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
      .data(uniqueLinks)
      .join('line')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#aaa')
      .attr('marker-end', 'url(#arrowhead)');

    // Drag behavior
    function drag(sim: any) {
      return d3
        .drag<SVGCircleElement, any>()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }

    // Draw the nodes as circles
    const node = g
      .append('g')
      .selectAll('circle')
      .data(uniqueNodes)
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
          d.matchedCommentId,
        ),
      )
      .call(drag(simulation as any) as any);

    // Draw labels
    const labels = g
      .append('g')
      .selectAll('foreignObject')
      .data(uniqueNodes)
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

    // Store nodes so we can cycle through them
    setGraphNodes(uniqueNodes);
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
        <div style={{ position: 'relative' }}>
          {/* Node index at top-left of modal */}
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
                  marginBottom: '10px',
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

            {/* YouTube */}
            {modalContent.author &&
              modalContent.author.includes('youtube.com') && (
                <LiteYouTubeEmbed
                  id={getYTId(modalContent.author)}
                  title="YouTube video"
                />
              )}

            {/* Twitter */}
            {modalContent.author &&
              (modalContent.author.includes('twitter.com') ||
                /^https:\/\/(www\.)?x\.com/.test(modalContent.author)) && (
                <Tweet id={getTwitterId(modalContent.author)} />
              )}

            {/* Instagram */}
            {modalContent.author &&
              modalContent.author.includes('instagram.com') && (
                <InstagramEmbed url={modalContent.author} />
              )}

            {/* Spotify */}
            {modalContent.author &&
              modalContent.author.includes('open.spotify.com') && (
                <Spotify link={modalContent.author} wide />
              )}

            {/* Main content */}
            <ReactMarkdown>{modalContent.content}</ReactMarkdown>

            <br />

            {/* Show comments if group != 'comment' */}
            {modalContent.group !== 'comment' &&
              modalContent.comments &&
              modalContent.comments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="mx-2 mb-4 flex items-center justify-between"
                >
                  <div className="grow">
                    <div className="block text-gray-900 no-underline">
                      <div className="relative">
                        <span
                          style={{
                            fontWeight:
                              comment.id === modalContent.matchedCommentId
                                ? 'bold'
                                : 'normal',
                          }}
                        >
                          {comment.data}
                        </span>
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
                    // Real-time add to modalContent
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

            {/* Expand button */}
            <button
              onClick={() => {
                onExpand(modalContent.id);
                closeModal();
              }}
              type="button"
            >
              Expand
            </button>

            {/* Close modal */}
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
