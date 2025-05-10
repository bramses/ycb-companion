import React, { useEffect, useState } from 'react';

// simple react component to fetch and display a link preview card
export default function LinkPreviewCard({ url }: { url: string }) {
  const [meta, setMeta] = useState({
    title: '',
    description: '',
    image: '',
    domain: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;
    setLoading(true);

    console.log('lp url:', url);

    if (url.includes('yourcommonbase.com')) {
      setMeta({
        title: 'Your Commonbase',
        description: 'Your Commonbase is a self-organizing scrapbook.',
        image: '/favicon.ico',
        domain: 'yourcommonbase.com',
      });
      setLoading(false);
      return;
    }

    // hit your backend endpoint that scrapes og/twitter meta
    fetch(`/api/linkPreview?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        setMeta({
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          domain: data.domain || new URL(url).hostname.replace('www.', ''),
        });
      })
      .catch((err) => {
        console.warn('link-preview error', err);
      })
      .finally(() => setLoading(false));
  }, [url]);

  if (loading)
    return (
      <div style={{ padding: '8px', fontStyle: 'italic' }}>
        loading preview...
      </div>
    );
  if (!meta.title)
    return <div style={{ padding: '8px' }}>no preview available</div>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        maxWidth: '400px',
      }}
    >
      {meta.image && (
        <div style={{ flex: '0 0 120px', height: '80px', overflow: 'hidden' }}>
          <img
            src={meta.image}
            alt={meta.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
      <div style={{ padding: '8px', flex: '1' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            lineHeight: '1.2',
            marginBottom: '4px',
          }}
        >
          {meta.title}
        </div>
        <div style={{ fontSize: '12px', color: '#555' }}>{meta.domain}</div>
      </div>
    </a>
  );
}
