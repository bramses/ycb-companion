/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-param-reassign */

"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import QRCode from "react-qr-code";

const replaceImagesWithBase64 = async (entry: any, comments: any[] = []) => {
  const modifiedJsonWithImages: { entry: any; comments: any[] }  = {
    entry,
    comments,
  };

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

  if (entry.image) {
    entry.image = await convertImageDataToBase64(entry.image);
  }

  // Process comments
  if (Array.isArray(comments)) {
    comments = await Promise.all(
      comments.map(convertImageDataToBase64)
    );
    modifiedJsonWithImages.comments = comments;
  }

  console.log("modifiedJsonWithImages:", modifiedJsonWithImages);
  return modifiedJsonWithImages;
};

export default function Share({
  isOpen,
  closeModalFn,
  entry,
  comments,
  entryId,
}: any) {
  const [includeComments, setIncludeComments] = useState(false);

  const [modalOpen, setModalOpen] = useState(true);
  const [showShareButton, setShowShareButton] = useState(false);

  useEffect(() => {
    console.log(modalOpen);
  }, [modalOpen]);


  // a btn that checks url https://share-ycbs.onrender.com/p/{entryid} and if not a 404 does not show the button
  useEffect(() => {
    if (entryId) {
      fetch(`http://localhost:3002/api/ping?entryid=${entryId}`)
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
          console.error("Error fetching entry:", error);
          setShowShareButton(false);
        });
    }
  }, [entryId]);

  const handleDownload = async () => {
    // replace any images in json with b64 strings
    const modifiedJsonWithImages = await replaceImagesWithBase64(entry, comments);

    /*

    {
  "entry": {
    "data": "He’s like how do we stop this demon and willem Defoe hit him with the I don’t know",
    "image: "base64 image",
    "metadata": {
      "title": "thought",
      "author": "https://ycb-companion.onrender.com/dashboard"
    }
  },
  "comments": [
    {
      "data": "from Nosferatu, 2024",
      "metadata": {
        "title": "thought",
        "author": "https://ycb-companion.onrender.com/dashboard"
      }
    },
    {
      "data": "call it nosfera2",
      "metadata": {
        "title": "thought",
        "author": "https://ycb-companion.onrender.com/dashboard"
      }
    }
  ],
  "username": "bram"
}
    */

    const body: { entry: any; username: string; comments: any[] } = {
      entry: modifiedJsonWithImages.entry,
      username: "bram",
      comments: [],
    };

    if (includeComments) {
      body.comments = modifiedJsonWithImages.comments;
    }

    console.log("body:", body);



    fetch("http://localhost:3002/api/add", { // todo https://share-ycbs.onrender.com
      method: "POST",
      body: JSON.stringify({
        entryid: entryId,
        json: body,
        username: "bram", // todo: change to username on rollover from clerk to self hosted auth
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(() => {
        setShowShareButton(true)
  })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModalFn}
        contentLabel="Share Modal"
        ariaHideApp={false}
      >
        
        {!showShareButton && (
          <><input
          type="checkbox"
          checked={includeComments}
          onChange={(e) => setIncludeComments(e.target.checked)}
        />
        <label htmlFor="includeComments">include comments?</label>
        <br />
        <br />
          <button type="button" onClick={handleDownload}>
            share
          </button></>
        )}
        {showShareButton && (
          <><QRCode
            value={`http://localhost:3002/p/${entryId}`}
            size={256}
            bgColor="#ffffff"
            fgColor="#000000"
          />
          <Link
            target="_blank"
            href={`http://localhost:3002/p/${entryId}`}
          >
            open on shareycb
          </Link></>
        )}
        <button
          type="button"
          onClick={() => setModalOpen(false)}
          style={{ marginLeft: "8px" }}
        >
          close
        </button>
      </Modal>
    </div>
  );
}
