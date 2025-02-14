'use client';

import { useEffect, useRef, useState } from 'react';

export default function VideoScroll() {
  const [videoRefs, setVideoRefs] = useState<
    React.RefObject<HTMLIFrameElement>[]
  >([]);
  const videoUrls = [
    'https://www.youtube.com/embed/5zlXAS1npYc',
    'https://www.youtube.com/embed/5zlXAS1npYc',
    // ... more URLs ...
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = entry!.target;
        // Autoplay when the video is in viewport, pause when it's not
        if (entry!.isIntersecting) {
          (video as HTMLVideoElement).play();
        } else {
          (video as HTMLVideoElement).pause();
        }
      },
      {
        // When 50% of the video is visible
        threshold: 0.5,
      },
    );

    videoRefs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    // Cleanup observer on unmount
    return () => {
      videoRefs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [videoRefs]);
  const newRef = useRef(null);

  // Add a new ref to the array of refs
  const addVideoRef = () => {
    setVideoRefs((refs) => [...refs, newRef]);
    return newRef;
  };

  return videoUrls.map((url: any, _: number) => (
    <iframe
      key={Math.random()} // Add a unique key for each video
      ref={addVideoRef()}
      style={{
        width: '420px', // for desktop
        maxWidth: '80%', // for mobile
      }}
      height="315"
      title="YouTube video player"
      src={url}
    />
  ));
}
