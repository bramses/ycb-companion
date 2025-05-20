/* eslint-disable react/no-array-index-key */

'use client';

// import { useUser } from '@clerk/nextjs';

import { useRouter } from 'next/navigation';

import ImageUpload from '../ImageUpload';

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
  console.log('[img] textDefault:', textDefault);
  console.log('[img] titleDefault:', titleDefault);
  console.log('[img] authorDefault:', authorDefault);

  const router = useRouter();

  const handleUploadComplete = (result: any) => {
    console.log('Upload complete:', result);
    router.push(`/dashboard/entry/${result.id}`);
  };

  return (
    <div className="[&_p]:my-6">
      <button onClick={closeModal} type="button">
        (close)
      </button>
      <ImageUpload metadata={{}} onUploadComplete={handleUploadComplete} />
    </div>
  );
};

export default Uploader;
