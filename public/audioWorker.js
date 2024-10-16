/* eslint-disable no-restricted-globals */

self.onmessage = async (event) => {
  const { file } = event.data;
  console.log('file:', file);

  try {
    const formData = new FormData();
    formData.append('audio', new Blob([file], { type: 'audio/m4a' }));
    console.log('formData:', formData);

    // fetch from /api/transcribe
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData, // This mimics your curl -F "audio=@test.m4a"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const { transcription, cfURL } = data;

    self.postMessage({ success: true, data: { transcription, cfURL } });
  } catch (error) {
    self.postMessage({ success: false, error });
  }
};
