'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';

export default function SettingsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function uploadProfilePicture(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const res = await fetch('/api/setProfilePicture', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      setResult(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Settings</h1>
      <h2>Upload profile picture</h2>
      <form
        onSubmit={uploadProfilePicture}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {preview && (
          <img src={preview} alt="preview" style={{ maxWidth: '200px' }} />
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'uploading...' : 'upload image'}
        </button>
        {result && (
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </form>
      <h2>Tiers</h2>
      <p>Current Tier: </p>
    </>
  );
}
