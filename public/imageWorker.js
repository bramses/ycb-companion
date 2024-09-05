/* eslint-disable no-restricted-globals */

self.onmessage = async (event) => {
  const { file, apiKey } = event.data;

  try {
    const formData = new FormData();
    formData.append('file', new Blob([file]));

    const response = await fetch(
      'https://commonbase-supabase-alpha.onrender.com/cf-images/upload',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      },
    );
    const data = await response.json();
    const pngUrl = `${data.url}?format=png`;

    const response2 = await fetch(
      'https://commonbase-supabase-alpha.onrender.com/cf-images/describe',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: pngUrl }),
      },
    );
    const data2 = await response2.json();

    self.postMessage({ success: true, data: data2 });
  } catch (error) {
    self.postMessage({ success: false, error });
  }
};
