'use client';

import { useState } from 'react';

import { addEntry, updateEntry } from '@/helpers/functions';

// long form text editor that has two inputs one for a heading and the editor for the content
// use localStorage to store the heading and content as a draft until the user clicks save

const LongForm = () => {
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('Long Form');
  const [url, setUrl] = useState(
    'https://ycb-companion.onrender.com/dashboard',
  );
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const handleSave = async () => {
    console.log('heading:', heading);
    console.log('content:', content);
    // // split the content into paragraphs
    const paragraphs = content.split('\n\n');
    console.log('paragraphs:', paragraphs);

    // add the heading as entry and get the id
    const metadata = {
      author: url,
      title,
    };
    setLoading(true);
    const parentEntry = await addEntry(heading, metadata);
    console.log('entry:', parentEntry);
    const parentId = parentEntry.respData.id;

    // add the paragraphs as entries and get the ids
    const paragraphsIds = await Promise.all(
      paragraphs.map(async (paragraph) => {
        const entry = await addEntry(paragraph, {
          author: url,
          title,
          parent_id: parentId,
        });
        console.log('alias entry:', entry);
        return entry.respData.id;
      }),
    );
    console.log('paragraphsIds:', paragraphsIds);

    // update the parent entry with the paragraphs ids
    await updateEntry(parentId, heading, {
      ...metadata,
      alias_ids: paragraphsIds,
    });

    // clear localStorage heading and content
    localStorage.removeItem('heading');
    localStorage.removeItem('content');
    setLoading(false);
  };

  const handleContentChange = (event: any) => {
    setContent(event.target.value);
    localStorage.setItem('heading', heading);
    localStorage.setItem('content', event.target.value);
  };

  const handleAudioRecord = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        const audioFile = new File([audioBlob], 'recording.wav', {
          type: 'audio/wav',
        });

        formData.append('audio', audioFile); // matches "audio" in your curl command
        setLoading(true);

        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData, // This mimics your curl -F "audio=@grids.m4a"
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Transcribe response:', data);

          if (data && data.data && data.data.transcription) {
            setTranscription(data.data.transcription);
            setContent(data.data.transcription);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <span className="block text-sm font-medium text-gray-700">Entry</span>
        <input
          type="text"
          id="heading"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4" id="metadata-fields">
        <div className="flex space-x-2">
          <div className="flex items-center">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-white">
              <span className="font-normal">Title</span>
            </div>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-white">
              <span className="font-normal">URL</span>
            </div>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <span className="block text-sm font-medium text-gray-700">Content</span>
        <textarea
          id="content"
          rows={20}
          value={content}
          onChange={handleContentChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <p>Transcription: {transcription}</p>
      <div className="mb-4">
        <button
          type="button"
          onClick={handleAudioRecord}
          className={`mt-2 w-full rounded-lg px-5 py-2.5 text-sm font-medium text-white ${isRecording ? 'bg-red-700 hover:bg-red-800 focus:ring-red-300' : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300'}`}
        >
          {isRecording ? 'Stop Recording' : 'Record Audio'}
        </button>
      </div>
      {!loading ? (
        <button
          type="button"
          className="mt-2 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={handleSave}
        >
          Save
        </button>
      ) : (
        <button
          type="button"
          className="mt-2 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          disabled
        >
          Saving...
        </button>
      )}
    </div>
  );
};

export default LongForm;
