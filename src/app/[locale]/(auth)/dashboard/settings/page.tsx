'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [plan, setPlan] = useState<string>('');
  const [monthlyTextEntries, setMonthlyTextEntries] = useState<number>(0);

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

  const getPlan = async () => {
    const res = await fetch('/api/getPlan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    console.log('data:', data);
    return data.data;
  };

  const getMonthlyTextEntries = async () => {
    const res = await fetch('/api/getMonthlyTextEntries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    console.log('data:', data);
    return data.data;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPlan = await getPlan();
        const resMonthlyTextEntries = await getMonthlyTextEntries();

        console.log('plan:', resPlan.plan);
        console.log(
          'monthlyTextEntries:',
          resMonthlyTextEntries.monthlyStoreEntries.text,
        );
        setPlan(resPlan.plan);
        setMonthlyTextEntries(resMonthlyTextEntries.monthlyStoreEntries.text);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

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
      <h2 className="mb-4 text-2xl font-bold">Tiers</h2>
      <p className="mb-2 text-lg">Current Tier: {plan}</p>
      <p className="mb-6 text-lg">
        Usage: {monthlyTextEntries} text entries / 3000 total
      </p>
      <h3 className="mb-2 text-xl font-semibold">Store Tier:</h3>
      <ul className="mb-4 list-inside list-disc">
        <li>Free</li>
        <li>3000 text (or url) entries a month</li>
        <li>300 image entries a month</li>
        <li>Integrations</li>
        <ul className="ml-6 list-inside list-disc">
          <li>iOS Shortcuts</li>
          <li>Chrome Extension</li>
        </ul>
        <li>Companion</li>
      </ul>
      <h3 className="mb-2 text-xl font-semibold">Search Tier:</h3>
      <ul className="mb-4 list-inside list-disc">
        <li>$10/month</li>
        <li>+9000 text (or url) entries a month</li>
        <li>+900 image entries a month</li>
        <li>Search as you type</li>
        <li>Image OCR</li>
      </ul>
      <h3 className="mb-2 text-xl font-semibold">Synthesis Tier:</h3>
      <ul className="mb-4 list-inside list-disc">
        <li>Coming Soon</li>
      </ul>
    </>
  );
}
