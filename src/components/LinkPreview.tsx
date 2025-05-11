import React from 'react';

// simple react component to fetch and display a link preview card
export default function LinkPreviewCard({
  url,
  title,
  description,
  image,
}: {
  url: string;
  title: string;
  description: string;
  image: string;
}) {
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
      {image && (
        <div style={{ flex: '0 0 120px', height: '80px', overflow: 'hidden' }}>
          <img
            src={image}
            alt={title}
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
          {title}
        </div>
        <div style={{ fontSize: '12px', color: '#555' }}>{description}</div>
      </div>
    </a>
  );
}
