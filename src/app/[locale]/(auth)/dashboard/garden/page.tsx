'use client';

import 'react-calendar/dist/Calendar.css';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Calendar from 'react-calendar';

import Entry from '@/components/Entry';
import { getCache, invalidateCache, setCache } from '@/helpers/cache';

const GardenDaily = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [dateSelected, setDateSelected] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const cache = getCache();

  const fetchByID = useCallback(
    async (id: string) => {
      const cachedAlias = cache.aliases[id];
      if (cachedAlias) {
        // console.log('Returning cached alias:', cachedAlias);
        return { data: cachedAlias };
      }

      // TODO: this breaks w aliases updating and idk how to fix atm
      // const cachedParent = cache.parents[id];
      // if (cachedParent) {
      //   // console.log('Returning cached parent:', cachedParent);
      //   return { data: cachedParent };
      // }

      try {
        const response = await fetch('/api/fetch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
          }),
        });
        const data = await response.json();
        const entry = data.data;
        // parse metadata
        const metadata = JSON.parse(entry.metadata);

        // cache the entry
        if (metadata.parent_id) {
          cache.aliases[id] = entry;
        } else {
          cache.parents[id] = entry;
        }

        setCache(cache);

        return data;
      } catch (error) {
        console.error('Error fetching entry by ID:', error);
        return {};
      }
    },
    [cache],
  );

  const fetchRecords = useCallback(
    async (date: Date) => {
      // convert date to form 2024-01-01
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      let monthString = month.toString();
      // put a 0 in front of month if it is less than 10
      if (month < 10) {
        monthString = `0${month}`;
      }
      const day = date.getDate();
      let dayString = day.toString();
      if (day < 10) {
        dayString = `0${day}`;
      }
      const dateString = `${year}-${monthString}-${dayString}`;
      setSelectedDay(dateString);
      setLoading(true);
      // run a post request to fetch records for that date at /api/daily
      const response = await fetch('/api/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: dateString }),
      });
      const responseData = await response.json();
      console.log('Fetched records:', responseData);
      // map over the response data and turn metadata into an object
      // set entries to the mapped data
      const mappedData = responseData.data.map((entry: any) => {
        return {
          ...entry,
          metadata: JSON.parse(entry.metadata),
        };
      });

      // get existing aliases for each entry
      const aliasData = await Promise.all(
        mappedData.map(async (entry: any) => {
          if (entry.metadata.alias_ids) {
            try {
              const aliasDataMap = await Promise.all(
                entry.metadata.alias_ids.map(async (aliasId: string) => {
                  try {
                    const aliasEntryRes = await fetchByID(aliasId);
                    const aliasEntry = aliasEntryRes.data;
                    return aliasEntry.data;
                  } catch (aliasFetchError) {
                    console.error(
                      `Error fetching alias entry with ID ${aliasId}:`,
                      aliasFetchError,
                    );
                    throw aliasFetchError;
                  }
                }),
              );

              return {
                ...entry,
                aliasData: aliasDataMap,
              };
            } catch (aliasError) {
              console.error('Error fetching aliases:', aliasError);
              return { ...entry };
            }
          }
          return entry;
        }),
      );

      setLoading(false);
      setEntries(aliasData);
    },
    [fetchByID, setSelectedDay, setLoading, setEntries],
  );

  // on load page, fetch all entries for the current day
  useEffect(() => {
    const today = new Date();
    let dateParam = today;
    if (searchParams && searchParams.has('date')) {
      let searchParamsDate = searchParams.get('date') as string;
      // if date comes in form 07-31-2024 convert it to 2024-07-31
      const dateParts = (searchParams.get('date') as string).split('-');
      if (dateParts.length === 3) {
        searchParamsDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
      }
      // convert 2024-08-26 to Date Sun Aug 26 2024 in UTC
      // const dateString = searchParams.get('date') as string;
      // add a day to the date to get the correct date this is so stupid
      const datePlusOne = new Date(`${searchParamsDate}T00:00:00Z`);
      dateParam = new Date(datePlusOne.setDate(datePlusOne.getDate() + 1));
    }
    const formattedDateParam = `${dateParam.getUTCFullYear()}-${(
      dateParam.getUTCMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${dateParam.getUTCDate().toString().padStart(2, '0')}`;

    setSelectedDay(formattedDateParam);
    setDateSelected(dateParam);
    fetchRecords(dateParam);
  }, [searchParams]);

  const addEntry = async (data: string, metadata: string) => {
    try {
      const response = await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          metadata,
        }),
      });
      const responseData = await response.json();

      console.log('Added entry:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error adding entry:', error);
      return {};
    }
  };

  const updateEntry = async (id: string, data: string, metadata: string) => {
    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          data,
          metadata,
        }),
      });
      const responseData = await response.json();

      console.log('Updated entry:', responseData);
      cache.parents[id] = responseData.data;
      return responseData;
    } catch (error) {
      console.error('Error updating entry:', error);
      return {};
    }
  };

  // TODO: extract these into helper logic for better reusability bw here and SearchBox component
  const handleAliasAdd = async (data: any) => {
    // get id of the selected alias
    // fetch the entry by id
    invalidateCache(data.id, false);
    const parentEntry = await fetchByID(data.id);
    let parentAliases = [];
    try {
      parentAliases = JSON.parse(parentEntry.data.metadata).alias_ids;
      // add a new entry with the alias as data and the original entry's metadata
      // add parent_id to the metadata
      const parentId = data.id;
      const newMetadata = {
        ...data.metadata,
        parent_id: parentId,
      };
      const aliasRes = await addEntry(data.alias, newMetadata);
      const aliasId = aliasRes.respData.id;
      // update the original entry's metadata with the new alias id in the alias_ids array
      const updatedMetadata = {
        ...data.metadata,
        alias_ids: parentAliases ? [parentAliases, aliasId].flat() : [aliasId],
      };
      await updateEntry(parentId, data.data, updatedMetadata);
      invalidateCache(data.id, false);
      return aliasRes;
    } catch (err) {
      console.error('Error parsing parent metadata:', err);
      return { error: 'Error parsing parent metadata' };
    }
  };

  const onDelve = async (data: string) => {
    console.log('Delving into:', data);
    const search = new URLSearchParams();
    search.set('q', data);
    router.push(`/dashboard?${search.toString()}`);
  };

  return (
    <div>
      {/* center the calendar */}
      <div className="my-4 flex justify-center">
        <Calendar
          onClickDay={(val) => fetchRecords(val)}
          value={dateSelected}
        />
      </div>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
        {selectedDay}
        <small className="ms-2 font-semibold text-gray-500">
          {entries.length > 0 ? `:: ${entries.length} entries` : ''}{' '}
        </small>
      </h1>
      {loading && <p>Loading...</p>}
      {entries.length === 0 ? (
        <p>No entries for this day</p>
      ) : (
        entries.map((entry: any) => (
          <Entry
            key={'aliasData' in entry ? Math.random() * 1000 : entry.id} // Replace 'Math.random() * 1000' with a more specific key if possible
            data={entry.data}
            id={entry.id}
            aliases={'aliasData' in entry ? entry.aliasData : []}
            selectedIndex={'selectedIndex' in entry ? entry.selectedIndex : -1}
            title={entry.metadata.title}
            author={entry.metadata.author}
            createdAt={entry.createdAt}
            similarity={entry.similarity}
            hasYouTubeEmbed={entry.metadata.author.includes('youtube.com')}
            youtubeId={
              entry.metadata.author.includes('youtube')
                ? entry.metadata.author.split('v=')[1]?.split('&')[0]
                : ''
            }
            displayDelve={false}
            displayMetadata={false}
            youtubeStart={
              entry.metadata.author.includes('youtube') &&
              entry.metadata.author.includes('t=')
                ? entry.metadata.author.split('t=')[1].split('s')[0]
                : ''
            }
            hasImage={entry.metadata.author.includes('imagedelivery.net')}
            imageUrl={
              entry.metadata.author.includes('imagedelivery.net')
                ? entry.metadata.author
                : ''
            }
            hasTwitterEmbed={
              entry.metadata.author.includes('twitter.com') ||
              /^https:\/\/(www\.)?x\.com/.test(entry.metadata.author)
            }
            tweetId={
              entry.metadata.author.includes('twitter.com') ||
              /^https:\/\/(www\.)?x\.com/.test(entry.metadata.author)
                ? entry.metadata.author.split('/').pop()
                : ''
            }
            hasInstagramEmbed={entry.metadata.author.includes('instagram.com')}
            hasTikTokEmbed={entry.metadata.author.includes('tiktok.com')}
            onAddAlias={handleAliasAdd}
            hasAliases={'aliasData' in entry}
            onDelve={onDelve}
          />
        ))
      )}
    </div>
  );
};

export default GardenDaily;
