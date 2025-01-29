/* eslint-disable react/no-array-index-key */

'use client';

// import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Uploader = ({ closeModal }: { closeModal: () => void }) => {
  // const { user, isLoaded } = useUser();
  const router = useRouter();
  const [textAreaValue, setTextAreaValue] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(
    'https://ycb-companion.onrender.com/dashboard',
  );
  // const [firstLastName, setFirstLastName] = useState({
  //   firstName: '',
  //   lastName: '',
  // });

  const apiKey = process.env.NEXT_PUBLIC_API_KEY_CF_IMG;
  const [loading, setLoading] = useState(false);
  const [shareYCBLoadingPct, setShareYCBLoadingPct] = useState(0);
  const [shareYCBInput, setShareYCBInput] = useState('');
  const [showShareYCBTextarea, setShowShareYCBTextarea] = useState(false);

  // useEffect(() => {
  //   if (!isLoaded) return;
  //   // set first name as title
  //   if (user?.firstName && user?.lastName) {
  //     setTitle(`${user.firstName} ${user.lastName}`);
  //     setFirstLastName({
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //     });
  //   }
  // }, [isLoaded, user]);

  const add = async (
    data: string,
    argMetadata: Record<string, string> = {
      author: '',
      title: '',
    },
  ) => {
    // get value from input fields and add to metadata
    // set to loading
    setLoading(true);
    // const metadata = {
    //   author,
    //   title,
    // };

    const metadata: Record<string, string> = {};
    console.log('argMetadata:', argMetadata);
    for (const field of Object.keys(argMetadata)) {
      if (argMetadata[field] !== undefined) {
        metadata[field] = argMetadata[field]!;
      }
    }

    const response = await fetch('/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        metadata,
      }),
    });
    const responseData = await response.json();

    return responseData;

    // console.log('Response:', responseData);

    // // clear input fields
    // setTextAreaValue('');

    // if (firstLastName.firstName && firstLastName.lastName) {
    //   setTitle(`${firstLastName.firstName} ${firstLastName.lastName}`);
    // } else {
    //   setTitle('');
    // }
    // setAuthor('https://ycb-companion.onrender.com/dashboard');
    // setLoading(false);
    // // refocus on text area
    // const modalMessage = document.getElementById('modal-message');
    // if (modalMessage) {
    //   modalMessage.focus();
    // }
  };

  //   const uploadFromShareYCB = async (id: string) => {
  //     setShareYCBLoadingPct(1);

  //     // decode the base64 string
  //     const decoded = atob(id); // { ids: string[], from: string }
  //     // turn to json
  //     const json = JSON.parse(decoded);
  //     const { ids } = json;

  //     for (let i = 0; i < ids.length; i++) {
  //       const id = ids[i];
  //       const response = await fetch(
  //         `https://share-ycbs.onrender.com/api/get-upload?id=${id}`,
  //       );
  //       const respData = await response.json();
  //       if (respData.error) {
  //         throw new Error(respData.error);
  //       }
  //       const { data } = respData;
  //       console.log(`data for id: ${id}`, data);
  //       // // add data using /api/add
  //       /* {
  //     "id": 7,
  //     "created_at": "2025-01-23T05:26:19.989819+00:00",
  //     "updated_at": "2025-01-23T05:26:19.989819+00:00",
  //     "json": {
  //         "entry": {
  //             "data": "He’s like how do we stop this demon and willem Defoe hit him with the I don’t know",
  //             "metadata": {
  //                 "title": "thought",
  //                 "author": "https://ycb-companion.onrender.com/dashboard"
  //             }
  //         },
  //         "comments": [
  //             {
  //                 "data": "from Nosferatu, 2024",
  //                 "metadata": {
  //                     "title": "thought",
  //                     "author": "https://ycb-companion.onrender.com/dashboard"
  //                 }
  //             },
  //             {
  //                 "data": "call it nosfera2",
  //                 "metadata": {
  //                     "title": "thought",
  //                     "author": "https://ycb-companion.onrender.com/dashboard"
  //                 }
  //             }
  //         ],
  //         "username": "bram"
  //     },
  //     "creator": "bram"
  // }
  //     */
  //    // add entry first and then add comments youll need to add the entry id to the comments and then after all comments are added, update the parent entry with the new comments ids

  //    // append (from ycb/[creator]) to the metadata.title

  //    const numEntries = data.json.comments.length + 2;

  //     const yresponse = await fetch('/api/add', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         data: data.json.entry.data,
  //         metadata: {
  //           ...data.json.entry.metadata,
  //           title: `${data.json.entry.metadata.title} (from ycb/${data.creator})`, // Append creator to title
  //         }
  //       }),
  //     });
  //     const addrData = await yresponse.json();

  //     // one entry done
  //     setShareYCBLoadingPct(shareYCBLoadingPct + Math.round((1 / numEntries) * 100));

  //     const parentId = addrData.respData.id;
  //     console.log('addrData:', addrData);
  //     // add comments
  //     const aliasIDs = [];
  //     for (let i = 0; i < data.json.comments.length; i++) {
  //       const comment = data.json.comments[i];
  //       const response = await fetch('/api/add', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           data: comment.data,
  //           metadata: {
  //             ...comment.metadata,
  //             title: `${comment.metadata.title} (from ycb/${data.creator})`, // Append creator to title
  //             parent_id: parentId,
  //           },
  //         }),
  //       });
  //       const addrData = await response.json();
  //       aliasIDs.push(addrData.respData.id);
  //       setShareYCBLoadingPct(shareYCBLoadingPct + Math.round((1 / numEntries) * 100));
  //     }
  //     // update parent entry with new comments ids
  //     const zresponse = await fetch('/api/update', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         id: addrData.respData.id,
  //         data: data.json.entry.data,
  //         metadata: {
  //           ...data.json.entry.metadata,
  //           title: `${data.json.entry.metadata.title} (from ycb/${data.creator})`, // Append creator to title
  //           alias_ids: aliasIDs,
  //         },
  //       }),
  //     });
  //     const zaddrData = await zresponse.json();
  //     console.log('zaddrData:', zaddrData);
  //     setShareYCBLoadingPct(100);
  //     return addrData;
  //   }
  //   };

  // const uploadAudio = async () => {
  //   const fileInput = document.getElementById('file-input-audio');
  //   if (!fileInput) return;
  //   (fileInput as HTMLInputElement).click();

  //   fileInput.addEventListener('change', async (event) => {
  //     const file = (event.target as HTMLInputElement).files?.[0];
  //     if (!file) return;
  //     setLoading(true);
  //     const formData = new FormData();
  //     formData.append('audio', file);

  //     const response = await fetch('/api/transcribe', {
  //       method: 'POST',
  //       body: formData, // This mimics your curl -F "audio=@test.m4a"
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     const { transcription, cfURL } = data;
  //     console.log('Transcribe response:', data);

  //     console.log('Audio description:', `${transcription} - ${cfURL}`);

  //     add(data.data.transcription, {
  //       author: data.data.cfURL,
  //       title: 'Audio',
  //     });
  //     setLoading(false);

  //     // const reader = new FileReader();
  //     // reader.onload = () => {
  //     //   const arrayBuffer = reader.result;
  //     //   setLoading(true);

  //     //   const worker = new Worker('/audioWorker.js');
  //     //   worker.postMessage({ file: arrayBuffer, apiKey });

  //     //   worker.onmessage = (e) => {
  //     //     const { success, data, error } = e.data;
  //     //     if (success) {
  //     //       console.log('Audio description:', data);
  //     //       // add(data.transcription, {
  //     //       //   author: data.cfURL,
  //     //       //   title: 'Audio',
  //     //       // });
  //     //     } else {
  //     //       console.error('Error:', error);
  //     //     }
  //     //     setLoading(false);
  //     //   };
  //     // };
  //     // reader.readAsArrayBuffer(file);
  //   });
  // };

  const uploadFromShareYCB = async (id: string) => {
    setShareYCBLoadingPct(1);

    // Decode the base64 string
    const decoded = atob(id); // { ids: string[], from: string }
    const json = JSON.parse(decoded);
    const { ids } = json;

    const processId = async (pid: string) => {
      const response = await fetch(
        `http://localhost:3002/api/get-upload?id=${pid}`,
      );
      const respData = await response.json();
      if (respData.error) {
        throw new Error(respData.error);
      }
      const { data } = respData;

      const entryBody: { data: any; metadata: any; createdAt?: string } = {
        data: data.json.entry.data,
        metadata: {
          ...data.json.entry.metadata,
          title: `${data.json.entry.metadata.title} (from ycb/${data.creator})`,
        },
      };

      if (data.force_created_at) {
        entryBody.createdAt = data.created_at;
      }

      const yresponse = await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryBody),
      });
      const addrData = await yresponse.json();
      const parentId = addrData.respData.id;
      console.log('addrData:', addrData);

      const aliasIDs = [];
      for await (const comment of data.json.comments) {
        const commentBody: { data: any; metadata: any; createdAt?: string } = {
          data: comment.data,
          metadata: {
            ...comment.metadata,
            title: `${comment.metadata.title} (from ycb/${data.creator})`,
            parent_id: parentId,
          },
        };

        if (data.force_created_at) {
          commentBody.createdAt = data.force_created_at;
        }
        const cresponse = await fetch('/api/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentBody),
        });
        const caddrData = await cresponse.json();
        aliasIDs.push(caddrData.respData.id);
      }

      if (aliasIDs.length > 0) {
        const zresponse = await fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: addrData.respData.id,
            data: data.json.entry.data,
            metadata: {
              ...data.json.entry.metadata,
              title: `${data.json.entry.metadata.title} (from ycb/${data.creator})`,
              alias_ids: aliasIDs,
            },
          }),
        });
        const zaddrData = await zresponse.json();
        console.log('zaddrData:', zaddrData);
      }
    };

    let count = 0;
    for await (const pid of ids) {
      await processId(pid);
      setShareYCBLoadingPct(Math.round(((count + 1) / ids.length) * 100));
      count += 1;
    }

    setShareYCBLoadingPct(100);
  };

  const uploadImage = async () => {
    const fileInput = document.getElementById('file-input-modal');
    if (!fileInput) return;
    (fileInput as HTMLInputElement).click();

    fileInput.addEventListener('change', async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        setLoading(true);

        const worker = new Worker('/imageWorker.js');
        worker.postMessage({ file: arrayBuffer, apiKey });

        worker.onmessage = async (e) => {
          const { success, data, error } = e.data;
          if (success) {
            console.log('Image description:', data);
            const responseEntry = await add(data.data, {
              author: data.metadata.imageUrl,
              title: 'Image',
            });
            console.log('responseEntry:', responseEntry);
            if (responseEntry.respData) {
              router.push(`/dashboard/entry/${responseEntry.respData.id}`);
              closeModal();
            }
          } else {
            console.error('Error:', error);
          }
          setLoading(false);
        };
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="[&_p]:my-6">
      {/* an input field for your name and then a textarea and a button to submit to /api/add */}

      <textarea
        id="modal-message"
        rows={4}
        style={{ fontSize: '17px' }}
        className="mt-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder="Your message..."
        value={textAreaValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            add(textAreaValue, {
              author,
              title,
            });
          }
        }}
        onChange={(e) => setTextAreaValue(e.target.value)}
      />
      <input
        type="text"
        style={{ fontSize: '17px' }}
        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            add(textAreaValue, { author, title });
          }
        }}
        value={title}
      />
      <input
        type="text"
        style={{ fontSize: '17px' }}
        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder={author}
        onChange={(e) => setAuthor(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter' && e.metaKey) {
            const responseEntry = await add(textAreaValue, { author, title });
            console.log('responseEntry:', responseEntry);
            if (responseEntry.respData) {
              router.push(`/dashboard/entry/${responseEntry.respData.id}`);
              closeModal();
            }
          }
        }}
        value={author}
      />
      <button
        type="button"
        className="mt-2 block w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={async () => {
          const responseEntry = await add(textAreaValue, { author, title });
          if (responseEntry.respData) {
            router.push(`/dashboard/entry/${responseEntry.respData.id}`);
            closeModal();
          }
        }}
      >
        Add Entry (or press cmd/ctrl + enter)
      </button>
      <div className="inline-flex w-full items-center justify-center">
        <hr className="my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-700" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
          or
        </span>
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="file-input-modal"
      />
      <button
        type="button"
        onClick={uploadImage}
        className="mt-2 block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Upload Image
      </button>
      <div className="inline-flex w-full items-center justify-center">
        <hr className="my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-700" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
          or
        </span>
      </div>
      {/* <input type="file" className="hidden" id="file-input-audio" />
      <button
        type="button"
        onClick={uploadAudio}
        className="mt-2 block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Upload Audio -- not a worker like image, leave modal open while
        loading!!
      </button>
      <div className="inline-flex w-full items-center justify-center">
        <hr className="my-8 h-px w-64 border-0 bg-gray-200 dark:bg-gray-700" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
          or
        </span>
      </div> */}
      <button
        type="button"
        className="mt-2 block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
        onClick={() => setShowShareYCBTextarea(true)}
      >
        Upload from Share yCb
      </button>

      {showShareYCBTextarea && (
        <div className="mt-2">
          <textarea
            rows={4}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="eyJpZHMiOlsxNiwxNSwxNCwxMywxMiwxMCw5LDhdLCJmcm9tIjoiYnJhbSJ9"
            value={shareYCBInput}
            onChange={(e) => setShareYCBInput(e.target.value)}
          />
          <button
            type="button"
            className="mt-2 block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={async () => {
              if (shareYCBInput) {
                setLoading(true);
                await uploadFromShareYCB(shareYCBInput);
                setLoading(false);
                setShareYCBLoadingPct(0);
                router.push(`/dashboard`);
                setShowShareYCBTextarea(false);
              }
            }}
          >
            Submit
          </button>
        </div>
      )}
      {/* <button
        type="button"
        className="mt-2 block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
        onClick={async () => {
          const url = prompt('Enter the URL of the entry you want to upload');
          if (url) {
            setLoading(true);
            await uploadFromShareYCB(url);
            // console.log('responseEntry:', responseEntry);
            // if (responseEntry.respData) {
            //   router.push(`/dashboard/entry/${responseEntry.respData.id}`);
            //   closeModal();
            // }
            setLoading(false);
            setShareYCBLoadingPct(0);
            // redirect to dashboard
            router.push(`/dashboard`);
          }
        }}
      >
        Upload from Share yCb
      </button> */}
      {loading && <p>Loading...</p>}
      {shareYCBLoadingPct !== 0 && (
        <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2.5 rounded-full bg-blue-600"
            style={{ width: `${shareYCBLoadingPct}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Uploader;
