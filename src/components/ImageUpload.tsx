'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';

import { fetchByID, updateEntry as apiUpdateEntry } from '@/helpers/functions';

interface UploaderProps {
  metadata: any;
  onUploadComplete?: (result: any) => void;
}

export default function ImageUploader({
  metadata,
  onUploadComplete,
}: UploaderProps) {
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

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('metadata', JSON.stringify(metadata));

    try {
      const res = await fetch('/api/addImage', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      console.log('metadata:', metadata);
      if (metadata.parent_id) {
        const parent = await fetchByID(metadata.parent_id);
        let parentResMetadata = parent.metadata;
        try {
          parentResMetadata = parent.metadata;
        } catch (err) {
          console.error('Error parsing parent metadata:', err);
          return;
        }

        if (parentResMetadata.alias_ids) {
          parentResMetadata.alias_ids = [
            ...parentResMetadata.alias_ids,
            json.id,
          ];
        } else {
          parentResMetadata.alias_ids = [json.id];
        }

        await apiUpdateEntry(parent.id, parent.data, {
          ...parentResMetadata,
        });
      }

      setResult(json);

      if (onUploadComplete) {
        onUploadComplete(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleUpload}
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
  );
}
