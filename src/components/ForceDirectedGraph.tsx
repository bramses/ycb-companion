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
  isGraphLoading: boolean;
}

const ForceDirectedGraph: React.FC<ForceDirectedGraphProps> = ({
  data,
  onExpand,
  onAddComment,
  isGraphLoading,
}) => {
  console.log('fdata:', data);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // minimap ref
  const miniMapRef = useRef<SVGSVGElement | null>(null);

  // modal open/close
  const [showModal, setShowModal] = useState(false);

  // hovered over main graph
  const [hovered, setHovered] = useState(false);

  // all node objects
  const [graphNodes, setGraphNodes] = useState<any[]>([]);

  // which index is currently selected
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // modal content
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

  // utility for pastel color
  function getNodeColor(node: any) {
    switch (node.group) {
      case 'main':
        return '#88C0D0';
      case 'neighbor':
      case 'penPal':
        return '#A3BE8C';
      case 'comment':
        return '#EBCB8B';
      case 'internalLink':
        return '#D08770';
      case 'expansionChild':
        return '#FFA500';
      default:
        return '#D8DEE9';
    }
  }

  // open/close modal
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
  const closeModal = () => setShowModal(false);

  // disable background scroll when modal is open
  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [showModal]);

  // keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!hovered || graphNodes.length === 0) return;

      // arrow navigation
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

      // space bar => expand selected node && user is not writing a comment in the input field
      if (
        event.key === ' ' &&
        currentIndex !== null &&
        currentIndex > 0 &&
        showModal &&
        document.activeElement &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        !document.activeElement.id.includes('alias-input')
      ) {
        event.preventDefault();
        if (currentIndex !== null) {
          const selectedNode = graphNodes[currentIndex];
          if (selectedNode) {
            onExpand(selectedNode.id);
          }
        }
      }



      // triple tap on mobile => expand

      // escape => close modal
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      }

      // c => focus on comment input
      // if (event.key === 'c') {
      //   event.preventDefault();
      //   const commentInput = document.getElementById(
      //     `alias-input-${modalContent.id}`,
      //   );
      //   if (commentInput) {
      //     commentInput.focus();
      //   }
      // }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hovered, graphNodes, currentIndex, onExpand]);

  // mobile swipe
  useEffect(() => {
    let startX: number | null = null;
    function handleTouchStart(e: TouchEvent) {
      if (!showModal || window.innerWidth >= 768) return;
      if (e.touches.length > 0) startX = e.touches[0]!.clientX;
    }
    function handleTouchEnd(e: TouchEvent) {
      if (!showModal || window.innerWidth >= 768) return;
      if (startX === null) return;
      if (e.changedTouches.length > 0) {
        const endX = e.changedTouches[0]!.clientX;
        const deltaX = endX - startX;
        if (Math.abs(deltaX) > 50) {
          if (deltaX < 0) {
            // swipe left => arrowRight
            setCurrentIndex((prevIndex) => {
              if (prevIndex === null) return 0;
              return (prevIndex + 1) % graphNodes.length;
            });
          } else {
            // swipe right => arrowLeft
            setCurrentIndex((prevIndex) => {
              if (prevIndex === null) return graphNodes.length - 1;
              return (prevIndex - 1 + graphNodes.length) % graphNodes.length;
            });
          }
        }
      }
      startX = null;
    }

    let tapCount = 0;
    let tapTimeout: NodeJS.Timeout | null = null;

    function handleTripleTap(e: TouchEvent) {
      if (!hovered || graphNodes.length === 0) return;

      if (e.touches.length > 1) return;

      tapCount += 1;

      if (tapCount === 3) {
        tapCount = 0;
        if (currentIndex !== null) {
          const selectedNode = graphNodes[currentIndex];
          if (selectedNode) {
            onExpand(selectedNode.id);
          }
        }
      }

      if (tapTimeout) clearTimeout(tapTimeout);
      tapTimeout = setTimeout(() => {
        tapCount = 0;
      }, 300); // reset tap count after 300ms
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchend', handleTripleTap, { passive: false });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchend', handleTripleTap);
    };
  }, [showModal, graphNodes]);

  // open selected node's modal on index change
  useEffect(() => {
    if (currentIndex === null) return;
    const selectedNode = graphNodes[currentIndex];
    if (!selectedNode) return;
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

  // add comment
  const handleAddComment = async (comment: string, parent: any) => {
    if (!comment) return;
    if (comment.trim() === '') return;
    onAddComment(comment, parent);
  };

  // parse youtube
  const getYTId = (url: string): string => {
    if (!url) return '';
    if (url.includes('t=')) {
      return url.split('t=')[1]?.split('s')[0]!;
    }
    return url.split('v=')[1]?.split('&')[0]!;
  };

  // parse twitter
  const getTwitterId = (url: string): string => {
    if (!url) return '';
    if (url.includes('twitter.com') || /^https:\/\/(www\.)?x\.com/.test(url)) {
      return url.split('/').pop()!;
    }
    return '';
  };

  // pick parent or self
  function getParentOrSelf(item: any, defaultGroup: string) {
    if (item.parent) {
      return {
        id: item.parent.id,
        label: item.parent.data,
        group: defaultGroup,
        image: item.image,
        title: item.parent.title,
        author: item.parent.author,
        comments: item.parent.comments,
        matchedCommentId: item.id,
        similarity: item.similarity,
      };
    }
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

  // main effect: build the d3
  useEffect(() => {
    if (!data.entry) return;
    if (!data.entry.data) return;
    if (!svgRef.current) return;
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = containerWidth;

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // clear old
    svg.selectAll('*').remove();

    // arrowhead
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

    console.log('data id', data.entry.id);
    console.log('data data', data.entry.data);
    // build rawNodes
    const rawNodes = [
      {
        id: data.entry.id,
        label: data.entry.data,
        group: 'main',
        image: data.image,
        comments: data.comments,
      },
      ...data.neighbors.map((n: any) => getParentOrSelf(n, 'neighbor')),
      ...data.internalLinks.map((link: any, idx: number) => ({
        id: `internalLink-${idx}`,
        label: link.internalLink,
        group: 'internalLink',
        image: link.image,
        title: link.title,
        author: link.author,
      })),
      ...data.internalLinks.flatMap((link: any) =>
        link.penPals.map((penPal: any) => getParentOrSelf(penPal, 'penPal')),
      ),
      ...data.comments.map((comment: any) => ({
        id: comment.id,
        label: comment.comment,
        group: 'comment',
        image: comment.image,
        title: comment.title,
        author: comment.author,
        comments: comment.penPals,
      })),
      ...data.comments.flatMap((comment: any) =>
        comment.penPals.map((penPal: any) => getParentOrSelf(penPal, 'penPal')),
      ),
      ...data.expansion.flatMap((expansion: any) =>
        expansion.children.map((child: any) => ({
          id: child.id,
          root: expansion.parent,
          label: child.data,
          group: 'expansionChild',
          image: child.image,
          title: child.title,
          author: child.author,
          comments: child.comments,
          similarity: child.similarity,
        })),
      ),
    ];

    const reorderedNodes = rawNodes.reduce((acc: any[], rnode: any) => {
      if (rnode.root) {
        const rootIndex = acc.findIndex((n: any) => n.id === rnode.root);
        if (rootIndex !== -1) {
          acc.splice(rootIndex + 1, 0, rnode); // Insert rnode right after rootNode
          return acc;
        }
      }
      acc.push(rnode); // If no root, or root not found, just add to the end
      return acc;
    }, []);

    // deduplicate
    const uniqueNodes = Array.from(
      new Map(reorderedNodes.map((node) => [node.id, node])).values(),
    );

    // build links
    const rawLinks = [
      ...data.neighbors.map((n: any) => ({
        source: data.entry.id,
        target: n.parent ? n.parent.id : n.id,
        similarity: n.similarity,
      })),
      ...data.internalLinks.map((_: any, idx: number) => ({
        source: data.entry.id,
        target: `internalLink-${idx}`,
        similarity: 0.5,
      })),
      ...data.comments.map((comment: any) => ({
        source: data.entry.id,
        target: comment.id,
        similarity: 0.5,
      })),
      ...data.expansion.flatMap((expansion: any) =>
        expansion.children.map((child: any) => ({
          source: expansion.parent,
          target: child.id,
          similarity: child.similarity,
        })),
      ),
      ...data.internalLinks.flatMap((link: any, idx: number) =>
        link.penPals.map((penPal: any) => ({
          source: `internalLink-${idx}`,
          target: penPal.parent ? penPal.parent.id : penPal.id,
          similarity: penPal.similarity,
        })),
      ),
      ...data.comments.flatMap((comment: any) =>
        comment.penPals.map((penPal: any) => ({
          source: comment.id,
          target: penPal.parent ? penPal.parent.id : penPal.id,
          similarity: penPal.similarity,
        })),
      ),
    ];

    const linkSet = new Set<string>();
    const uniqueLinks: any[] = [];
    for (const l of rawLinks) {
      const linkKey = `${l.source}--${l.target}`;
      if (!linkSet.has(linkKey)) {
        linkSet.add(linkKey);
        uniqueLinks.push(l);
      }
    }

    // force sim
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

    const g = svg.append('g');

    // links
    const link = g
      .append('g')
      .selectAll('line')
      .data(uniqueLinks)
      .join('line')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#aaa')
      .attr('marker-end', 'url(#arrowhead)');

    // dragging
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

    // nodes
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

    // labels
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

    // minimap init
    function updateMiniMap(nodes: any[], links: any[]) {
      if (!miniMapRef.current) return;
      const mmWidth = 150;
      const mmHeight = 150;

      const miniSvg = d3.select(miniMapRef.current);
      miniSvg.selectAll('*').remove();

      const xValues = nodes.map((n) => n.x);
      const yValues = nodes.map((n) => n.y);
      const minX = d3.min(xValues) || 0;
      const maxX = d3.max(xValues) || 1;
      const minY = d3.min(yValues) || 0;
      const maxY = d3.max(yValues) || 1;

      const scaleX = d3.scaleLinear().domain([minX, maxX]).range([0, mmWidth]);
      const scaleY = d3.scaleLinear().domain([minY, maxY]).range([0, mmHeight]);

      const mmG = miniSvg.append('g');

      // draw links
      mmG
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('x1', (d) => scaleX(d.source.x))
        .attr('y1', (d) => scaleY(d.source.y))
        .attr('x2', (d) => scaleX(d.target.x))
        .attr('y2', (d) => scaleY(d.target.y))
        .attr('stroke', '#aaa')
        .attr('stroke-width', 1);

      // draw nodes
      mmG
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('cx', (d) => scaleX(d.x))
        .attr('cy', (d) => scaleY(d.y))
        .attr('r', 3)
        .attr('fill', (d) => getNodeColor(d));

      // highlight current node
      if (currentIndex !== null) {
        const highlightedNode = nodes[currentIndex];
        if (highlightedNode) {
          mmG
            .append('circle')
            .attr('cx', scaleX(highlightedNode.x))
            .attr('cy', scaleY(highlightedNode.y))
            .attr('r', 6)
            .attr('stroke', 'purple')
            .attr('stroke-width', 2)
            .attr('fill', 'none');
        }
      }
    }

    // tick updates
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      labels.attr('x', (d) => d.x).attr('y', (d) => d.y);

      // also update minimap
      updateMiniMap(uniqueNodes, uniqueLinks);
    });

    // zoom/pan
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        }),
    );

    setGraphNodes(uniqueNodes);
  }, [data, currentIndex]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', margin: '0 auto', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg ref={svgRef} />

      {/* minimap container */}
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          left: 10,
          width: '150px',
          height: '150px',
          border: '1px solid #ccc',
          backgroundColor: '#fff',
          zIndex: 999,
        }}
      >
        <svg
          ref={miniMapRef}
          width="100%"
          height="100%"
          onClick={() => {
            if (
              currentIndex !== null &&
              currentIndex >= 0 &&
              currentIndex < graphNodes.length
            ) {
              const selectedNode = graphNodes[currentIndex];

              if (!selectedNode) return;

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
            } else {
              // open modal with the first node
              const firstNode = graphNodes[0];
              openModal(
                firstNode.label,
                firstNode.id,
                firstNode.image,
                firstNode.title,
                firstNode.author,
                firstNode.group,
                firstNode.comments,
                firstNode.matchedCommentId,
              );
            }
          }}
        />
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        contentLabel="Node Content"
        ariaHideApp={false}
      >
        <div style={{ position: 'relative' }}>
          {currentIndex !== null &&
            currentIndex >= 0 &&
            currentIndex < graphNodes.length && (
              <>
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
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '4px',
                    color: getNodeColor(graphNodes[currentIndex]),
                    zIndex: 9999,
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}
                >
                  {graphNodes[currentIndex].similarity
                    ? `similarity: ${Math.round(graphNodes[currentIndex].similarity * 100)}%`
                    : ''}
                </div>
              </>
            )}

          <div className="flex flex-col">
            {modalContent.image && (
              <img
                src={modalContent.image}
                alt="thumbnail"
                style={{ width: '80%' }}
              />
            )}

            {/* youtube */}
            {modalContent.author &&
              modalContent.author.includes('youtube.com') && (
                <LiteYouTubeEmbed
                  id={getYTId(modalContent.author)}
                  title="YouTube video"
                />
              )}

            {/* twitter */}
            {modalContent.author &&
              (modalContent.author.includes('twitter.com') ||
                /^https:\/\/(www\.)?x\.com/.test(modalContent.author)) && (
                <Tweet id={getTwitterId(modalContent.author)} />
              )}

            {/* instagram */}
            {modalContent.author &&
              modalContent.author.includes('instagram.com') && (
                <InstagramEmbed url={modalContent.author} />
              )}

            {/* spotify */}
            {modalContent.author &&
              modalContent.author.includes('open.spotify.com') && (
                <Spotify link={modalContent.author} wide />
              )}

            {/* main content */}
            <ReactMarkdown>{modalContent.content}</ReactMarkdown>
            <p className="text-sm text-gray-500">{modalContent.title}</p>
            <p className="text-sm text-gray-500">{modalContent.author}</p>
            <p className="text-sm text-gray-500">{modalContent.date}</p>

            <br />

            {/* show comments if not a "comment" node */}
            {modalContent.group !== 'comment' && modalContent.group !== 'main' &&
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
                      created: {new Date(comment.createdAt).toLocaleString()}
                      {comment.createdAt !== comment.updatedAt && (
                        <>
                          {' '}
                          | last updated:{' '}
                          {new Date(comment.updatedAt).toLocaleString()}{' '}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {/* add comment if not "comment" node */}
            {modalContent.group !== 'comment' && modalContent.group !== 'main' && (
              <div>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="add a comment..."
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
                  add comment
                </button>
              </div>
            )}

            <br />

            {modalContent.group !== 'comment' && modalContent.group !== 'main' && <Link href={`/dashboard/entry/${modalContent.id}`} className="mt-4">
              view entry
            </Link>}
            <br />

            {/* <button
              onClick={() => {
                onExpand(modalContent.id);
                // closeModal();
              }}
              type="button"
            >
              expand
            </button> */}

            {isGraphLoading && <p>Loading...</p>}

            <button onClick={closeModal} type="button">
              close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForceDirectedGraph;
