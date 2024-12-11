// components/ForceDirectedGraph.js
/* eslint-disable no-param-reassign */

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import * as d3 from 'd3';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import Modal from 'react-modal';
import { InstagramEmbed } from 'react-social-media-embed';
import { Spotify } from 'react-spotify-embed';
import { Tweet } from 'react-tweet';

const ForceDirectedGraph = ({ data, onExpand, onAddComment }: any) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showModal, setShowModal] = useState(false);

  const [modalContent, setModalContent] = useState<any>({
    content: '',
    id: '',
    image: '',
    title: '',
    author: '',
    group: '',
    comments: [],
  });

  // Update the openModal function to accept 'group'
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

  const closeModal = () => setShowModal(false);

  const handleAddComment = async (comment: string, parent: any) => {
    // send data to parent
    onAddComment(comment, parent);
  };

  const getYTId = (url: string): string => {
    if (!url) return '';
    if (url.includes('t=')) {
      return url.split('t=')[1]?.split('s')[0]!;
    }
    return url.split('v=')[1]?.split('&')[0]!;
  };

  const getTwitterId = (url: string): string => {
    if (!url) return '';
    if (url.includes('twitter.com') || /^https:\/\/(www\.)?x\.com/.test(url)) {
      return url.split('/').pop()!;
    }
    return '';
  };

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
      {
        id: data.entry,
        label: data.entry,
        group: 'main',
        image: data.image,
        comments: data.comments,
      },
      // Add neighbors
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
      // Add internal links as nodes with 'internalLink' group
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
      // Add comments
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
      // add expansion nodes i need a nested array of expansions
      /* expansion: [
        ...prevData.expansion,
        { parent: entry.id, children: newNeighbors },
      ] */
      ...data.expansion.flatMap((expansion: any) => [
        // // Add the parent node
        // {
        //   id: expansion.parent.id,
        //   label: expansion.parent.data,
        //   group: 'expansionParent',
        //   image: expansion.parent.image,
        //   title: expansion.parent.title,
        // },
        // Add the children nodes
        ...expansion.children.map((child: any) => ({
          id: child.id,
          label: child.data,
          group: 'expansionChild',
          image: child.image,
          title: child.title,
          author: child.author,
        })),
      ]),

      // Add parents of neighbors and penpals
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
      ...data.expansion.flatMap((expansion: any) =>
        expansion.children.flatMap((child: any) => ({
          source: expansion.parent,
          target: child.id,
          similarity: child.similarity,
        })),
      ),
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
          .distance((d: any) => 150 - (d.similarity || 0) * 80),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('collision', d3.forceCollide().radius(20))
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
      >
        <div className="flex flex-col">
          {modalContent.image && (
            <img
              src={modalContent.image}
              alt="thumbnail"
              style={{ width: '80%' }}
            />
          )}
          {modalContent.author &&
            modalContent.author.includes('youtube.com') && (
              <LiteYouTubeEmbed
                id={getYTId(modalContent.author)}
                // params={`start=${youtubeStart}`}
                title="YouTube video"
              />
            )}
          {modalContent.author &&
            (modalContent.author.includes('twitter.com') ||
              /^https:\/\/(www\.)?x\.com/.test(modalContent.author)) && (
              <Tweet id={getTwitterId(modalContent.author)} />
            )}
          {modalContent.author &&
            modalContent.author.includes('instagram.com') && (
              <InstagramEmbed url={modalContent.author} />
            )}
          {modalContent.author &&
            modalContent.author.includes('open.spotify.com') && (
              <Spotify link={modalContent.author} wide />
            )}

          <p>{modalContent.content}</p>

          <br />
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
                  // Cast to HTMLInputElement to access value property
                  const alias = (aliasInput as HTMLInputElement).value;
                  handleAddComment(alias, modalContent);
                  // clear input field
                  (aliasInput as HTMLInputElement).value = '';
                  // add a temporary comment to modal to show users
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
          <Link href={`/dashboard/entry/${modalContent.id}`} className="mt-4">
            View Entry
          </Link>
          <br />
          {/* a search btn that uses the modal content as the query and expands the force directed graph with the new search results */}
          <button
            onClick={() => {
              onExpand(modalContent.id);
              closeModal();
            }}
            type="button"
          >
            Expand
          </button>
          <button onClick={closeModal} type="button">
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ForceDirectedGraph;
