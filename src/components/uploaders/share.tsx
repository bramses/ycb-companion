/* eslint-disable react/no-array-index-key */

'use client';

// import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UploaderProps {
  closeModal: () => void;
  textDefault: string;
  titleDefault: string;
  authorDefault: string;
}

const Uploader = ({
  closeModal,
  textDefault,
  titleDefault,
  authorDefault,
}: UploaderProps) => {
  // const { user, isLoaded } = useUser();
  const router = useRouter();
  console.log(textDefault);
  console.log(titleDefault);
  console.log(authorDefault);
  // const [firstLastName, setFirstLastName] = useState({
  //   firstName: '',
  //   lastName: '',
  // });

  const [loading, setLoading] = useState(false);
  const [shareYCBLoadingPct, setShareYCBLoadingPct] = useState(0);
  const [shareYCBInput, setShareYCBInput] = useState(textDefault || '');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // check if url params ?share exist
  const searchParams = useSearchParams();
  const shareParam = searchParams!.get('share') || '';

  useEffect(() => {
    if (shareParam) {
      setShareYCBInput(shareParam);
    }
  }, [shareParam]);

  const uploadFromShareYCB = async (id: string) => {
    setShareYCBLoadingPct(1);

    // Decode the base64 string
    const decoded = atob(id); // { ids: string[], from: string }
    const json = JSON.parse(decoded);
    const { ids } = json;
    let lastEntryId = '';

    const processId = async (pid: string) => {
      const response = await fetch(
        `https://share-ycbs.onrender.com/api/get-upload?id=${pid}`,
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
      lastEntryId = addrData.respData.id;

      console.log('lastEntryId', lastEntryId);

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
    return lastEntryId;
  };

  return (
    <div className="[&_p]:my-6">
      <div className="mt-2">
        <textarea
          rows={4}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          style={{ fontSize: '17px' }}
          placeholder="eyJpZHMiOlsxNiwxNSwxNCwxMywxMiwxMCw5LDhdLCJmcm9tIjoiYnJhbSJ9"
          value={shareYCBInput}
          onChange={(e) => setShareYCBInput(e.target.value)}
        />
        <button
          type="button"
          className="mt-2 block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={async () => {
            if (shareYCBInput) {
              try {
                setLoading(true);
                const lastID = await uploadFromShareYCB(shareYCBInput);
                console.log('lastID', lastID);
                setLoading(false);
                setShareYCBLoadingPct(0);
                router.push(`/dashboard/entry/${lastID}`);
                closeModal();
              } catch (err) {
                setShowError(true);
                setErrorMessage('Unable to add entry. Please try again.');
              }
            }
          }}
        >
          Submit
        </button>
        {showError && (
          <div className="text-red-500">
            {errorMessage}
            <br />
            Please try again.
          </div>
        )}
      </div>
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
