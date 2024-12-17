'use client';

import { useState } from 'react';

import CallAndResponse from '@/components/CallAndResponse';

const Flow = () => {
  const [instancesCount, setInstancesCount] = useState(1);
  const [allEntries, setAllEntries] = useState([]);

  const addInstance = () => {
    setInstancesCount(instancesCount + 1);
  };

  const updateAllEntries = (newEntry: any) => {
    setAllEntries((prevEntries: any) => {
      console.log(prevEntries);
      const isDuplicate = prevEntries.some(
        (entry: any) => entry.id === newEntry.id,
      );
      if (isDuplicate) {
        return prevEntries; // no update needed
      }
      return [...prevEntries, newEntry];
    });
  };

  const instances = Array.from({ length: instancesCount }, (_, index) => (
    <CallAndResponse
      key={index}
      allEntries={allEntries}
      updateAllEntries={updateAllEntries}
      autoAddInstance={addInstance}
    />
  ));

  return <div>{instances}</div>;
};

export default Flow;
