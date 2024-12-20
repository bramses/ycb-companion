'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';

function RecursiveNode({ node, checkedNodes, setCheckedNodes }: any) {
  if (!node || typeof node !== 'object') return null;

  const label = node.data || node.comment || node.title || node.entry || '';
  const isChecked = node.id ? checkedNodes[node.id] : true;

  const toggleRecursive = (_: any, newVal: any, nodeObj: any) => {
    const updates = {};
    function toggleAll(n: any) {
      if (n && typeof n === 'object') {
        if (n.id) {
          updates[n.id] = newVal;
        }
        if (Array.isArray(n.neighbors)) n.neighbors.forEach(toggleAll);
        if (Array.isArray(n.comments)) n.comments.forEach(toggleAll);
        if (Array.isArray(n.penPals)) n.penPals.forEach(toggleAll);
        if (Array.isArray(n.internalLinks)) n.internalLinks.forEach(toggleAll);
        if (Array.isArray(n.expansion)) {
          n.expansion.forEach((expansionNode: any) => {
            if (Array.isArray(expansionNode.children)) {
              expansionNode.children.forEach(toggleAll);
            }
          });
        }
        if (n.parent && typeof n.parent === 'object') toggleAll(n.parent);
      }
    }
    toggleAll(nodeObj);
    setCheckedNodes((prev: any) => ({ ...prev, ...updates }));
  };

  const handleCheckboxChange = () => {
    if (!node.id) return;
    toggleRecursive(node.id, !isChecked, node);
  };

  return (
    <div
      style={{
        borderLeft: '1px solid #ccc',
        paddingLeft: '8px',
        marginBottom: '8px',
      }}
    >
      {node.id && (
        <div style={{ marginBottom: '4px' }}>
          <label>
            {node.metadata && node.metadata.title === 'Image' && (
              <img src={node.metadata.author} alt="loaded" />
            )}

            <input
              id={`checkbox-${node.id}`} // Add an id to the input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            <ReactMarkdown>{label || '(no label)'}</ReactMarkdown>
          </label>
        </div>
      )}

      {/* neighbors */}
      {Array.isArray(node.neighbors) && node.neighbors.length > 0 && (
        <div style={{ marginLeft: '16px' }}>
          <strong>neighbors:</strong>
          {node.neighbors.map((n: any, i: any) => (
            <RecursiveNode
              key={n.id || i}
              node={n}
              checkedNodes={checkedNodes}
              setCheckedNodes={setCheckedNodes}
            />
          ))}
        </div>
      )}

      {/* comments */}
      {Array.isArray(node.comments) && node.comments.length > 0 && (
        <div style={{ marginLeft: '16px' }}>
          <strong>comments:</strong>
          {node.comments.map((c, i) => (
            <RecursiveNode
              key={c.id || i}
              node={c}
              checkedNodes={checkedNodes}
              setCheckedNodes={setCheckedNodes}
            />
          ))}
        </div>
      )}

      {/* penPals */}
      {Array.isArray(node.penPals) && node.penPals.length > 0 && (
        <div style={{ marginLeft: '16px' }}>
          <strong>penPals:</strong>
          {node.penPals.map((p, i) => (
            <RecursiveNode
              key={p.id || i}
              node={p}
              checkedNodes={checkedNodes}
              setCheckedNodes={setCheckedNodes}
            />
          ))}
        </div>
      )}

      {/* internalLinks */}
      {Array.isArray(node.internalLinks) && node.internalLinks.length > 0 && (
        <div style={{ marginLeft: '16px' }}>
          <strong>internalLinks:</strong>
          {node.internalLinks.map((il, i) => (
            <RecursiveNode
              key={il.id || i}
              node={il}
              checkedNodes={checkedNodes}
              setCheckedNodes={setCheckedNodes}
            />
          ))}
        </div>
      )}

      {/* expansion */}
      {Array.isArray(node.expansion) && node.expansion.length > 0 && (
        <div style={{ marginLeft: '16px' }}>
          <strong>expansion:</strong>
          {node.expansion.map((expansionNode: any, i: any) => (
            <div key={expansionNode.id || i}>
              {/* Render the parent node */}
              <div>
                <strong>Parent:</strong> {expansionNode.parent}
              </div>
              {/* Render the children nodes */}
              {Array.isArray(expansionNode.children) &&
                expansionNode.children.length > 0 && (
                  <div style={{ marginLeft: '16px' }}>
                    <strong>Children:</strong>
                    {expansionNode.children.map((child: any, j: any) => (
                      <RecursiveNode
                        key={child.id || j}
                        node={child}
                        checkedNodes={checkedNodes}
                        setCheckedNodes={setCheckedNodes}
                      />
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* parent */}
      {node.parent && typeof node.parent === 'object' && (
        <div style={{ marginLeft: '16px' }}>
          <strong>parent:</strong>
          <RecursiveNode
            node={node.parent}
            checkedNodes={checkedNodes}
            setCheckedNodes={setCheckedNodes}
          />
        </div>
      )}
    </div>
  );
}

const replaceImagesWithBase64 = async (json: any) => {
  const modifiedJsonWithImages = JSON.parse(JSON.stringify(json));

  const convertImageDataToBase64 = async (data: any) => {
    if (data.image) {
      const imageUrl = data.image;
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      // Convert Blob to Base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve({ ...data, image: reader.result });
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });
      // return { ...data, image: imageBlob }; // Keep the image as a Blob
    }
    return data;
  };

  // Process comments
  if (Array.isArray(modifiedJsonWithImages.comments)) {
    modifiedJsonWithImages.comments = await Promise.all(
      modifiedJsonWithImages.comments.map(convertImageDataToBase64),
    );
  }

  // Process neighbors
  if (Array.isArray(modifiedJsonWithImages.neighbors)) {
    modifiedJsonWithImages.neighbors = await Promise.all(
      modifiedJsonWithImages.neighbors.map(convertImageDataToBase64),
    );
  }

  // Process internalLinks
  if (Array.isArray(modifiedJsonWithImages.internalLinks)) {
    modifiedJsonWithImages.internalLinks = await Promise.all(
      modifiedJsonWithImages.internalLinks.map(convertImageDataToBase64),
    );
  }

  // Process expansion
  if (Array.isArray(modifiedJsonWithImages.expansion)) {
    modifiedJsonWithImages.expansion = await Promise.all(
      modifiedJsonWithImages.expansion.map(async (expansionNode: any) => {
        if (Array.isArray(expansionNode.children)) {
          expansionNode.children = await Promise.all(
            expansionNode.children.map(convertImageDataToBase64),
          );
        }
        return expansionNode;
      }),
    );
  }

  console.log('modifiedJsonWithImages:', modifiedJsonWithImages);
  return modifiedJsonWithImages;
};

export default function Share({
  isOpen,
  closeModalFn,
  originalData,
  entryId,
}: any) {
  const [checkedNodes, setCheckedNodes] = useState({});
  const [modalOpen, setModalOpen] = useState(true);
  const [showShareButton, setShowShareButton] = useState(true);

  const { user, isLoaded } = useUser();
  const [firstLastName, setFirstLastName] = useState({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (!isLoaded) return;
    // set first name as title
    if (user?.firstName && user?.lastName) {
      setFirstLastName({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [isLoaded, user]);

  // a btn that checks url http://localhost:3001/p/{entryid} and if not a 404 does not show the button
  useEffect(() => {
    if (entryId) {
      fetch(`http://localhost:3001/p/${entryId}`)
        .then((response) => {
          if (!response.ok) {
            // If the response is not OK (e.g., 404, 500), hide the button
            setShowShareButton(false);
          } else {
            // If the response is OK (e.g., 200), show the button
            setShowShareButton(true);
          }
        })
        .catch((error) => {
          console.error('Error fetching entry:', error);
          setShowShareButton(false);
        });
    }
  }, [entryId]);

  // generate unique ids for nodes that don't have one
  let tempIdCounter = 0;
  function assignIds(node: any) {
    if (node && typeof node === 'object') {
      if (!node.id) {
        node.id = `generated-${tempIdCounter++}`;
      }
      if (Array.isArray(node.neighbors)) node.neighbors.forEach(assignIds);
      if (Array.isArray(node.comments)) node.comments.forEach(assignIds);
      if (Array.isArray(node.penPals)) node.penPals.forEach(assignIds);
      if (Array.isArray(node.internalLinks))
        node.internalLinks.forEach(assignIds);
      if (Array.isArray(node.expansion)) {
        node.expansion.forEach((expansionNode: any) => {
          if (Array.isArray(expansionNode.children)) {
            expansionNode.children.forEach(assignIds);
          }
        });
      }
      if (node.parent && typeof node.parent === 'object')
        assignIds(node.parent);
    }
  }
  assignIds(originalData);

  useEffect(() => {
    console.log('originalData:', originalData);
    const initChecked = {};
    function markAllChecked(node: any) {
      if (node && typeof node === 'object') {
        if (node.id) {
          initChecked[node.id] = true;
        }
        if (Array.isArray(node.neighbors))
          node.neighbors.forEach(markAllChecked);
        if (Array.isArray(node.comments)) node.comments.forEach(markAllChecked);
        if (Array.isArray(node.penPals)) node.penPals.forEach(markAllChecked);
        if (Array.isArray(node.internalLinks))
          node.internalLinks.forEach(markAllChecked);
        if (Array.isArray(node.expansion)) {
          node.expansion.forEach((expansionNode: any) => {
            if (Array.isArray(expansionNode.children)) {
              expansionNode.children.forEach(markAllChecked);
            }
          });
        }
        if (node.parent && typeof node.parent === 'object')
          markAllChecked(node.parent);
      }
    }
    markAllChecked(originalData);
    setCheckedNodes(initChecked);
  }, []);

  const getFilteredJson = () => {
    function filterNode(node: any) {
      if (node && typeof node === 'object') {
        // if node has an id and is not checked, remove
        if (node.id && !checkedNodes[node.id]) {
          return null;
        }
        const copy = { ...node };
        if (Array.isArray(copy.neighbors)) {
          copy.neighbors = copy.neighbors.map(filterNode).filter(Boolean);
        }
        if (Array.isArray(copy.comments)) {
          copy.comments = copy.comments.map(filterNode).filter(Boolean);
        }
        if (Array.isArray(copy.penPals)) {
          copy.penPals = copy.penPals.map(filterNode).filter(Boolean);
        }
        if (copy.parent && typeof copy.parent === 'object') {
          const filteredParent = filterNode(copy.parent);
          if (filteredParent === null) {
            delete copy.parent;
          } else {
            copy.parent = filteredParent;
          }
        }
        return copy;
      }
      return node;
    }
    return filterNode(originalData);
  };

  const handleDownload = async () => {
    // const modifiedJson = getFilteredJson();
    // const blob = new Blob([JSON.stringify(modifiedJson, null, 2)], {
    //   type: 'application/json',
    // });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'modified.json';
    // a.click();

    // post to https://share-ycbs.onrender.com/api/add with body { userid, entryid, json, username }
    // where userid is the user's id, entryid is the entry's id, json is the modified json, and username is the user's username from clerk
    const modifiedJson = getFilteredJson();

    // replace any images in json with b64 strings
    const modifiedJsonWithImages = await replaceImagesWithBase64(modifiedJson);

    const body = {
      json: modifiedJsonWithImages,
      username: firstLastName.firstName.toLowerCase(), // todo: change to username on rollover from clerk to self hosted auth
      entryid: entryId,
    };

    fetch('http://localhost:3001/api/add', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error('Error:', error));
  };

  const uncheckAll = () => {
    // set all to false
    setCheckedNodes((prev) => {
      const newChecked = { ...prev };
      Object.keys(newChecked).forEach((k) => {
        newChecked[k] = false;
      });
      return newChecked;
    });
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModalFn}
        contentLabel="Share Modal"
        ariaHideApp={false}
      >
        <h2>modify json</h2>
        <button type="button" onClick={uncheckAll}>
          uncheck all
        </button>
        <RecursiveNode
          node={originalData}
          checkedNodes={checkedNodes}
          setCheckedNodes={setCheckedNodes}
        />
        <button type="button" onClick={handleDownload}>
          download modified json
        </button>
        {showShareButton && (
          <Link target="_blank" href={`http://localhost:3001/p/${entryId}`}>
            share
          </Link>
        )}

        <button
          type="button"
          onClick={() => setModalOpen(false)}
          style={{ marginLeft: '8px' }}
        >
          close
        </button>
      </Modal>
    </div>
  );
}
