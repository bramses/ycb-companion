'use client';

import 'react-calendar/dist/Calendar.css';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Calendar from 'react-calendar';

import { splitIntoWords } from '@/helpers/functions';

const GardenDaily = () => {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [dateSelected, setDateSelected] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [timezone, setTimezone] = useState('');

  const toHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (err) {
      return url;
    }
  };

  const fetchRecords = useCallback(async (date: Date) => {
    // format date as yyyy-mm-dd
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthString = month < 10 ? `0${month}` : month.toString();
    const dayString = day < 10 ? `0${day}` : day.toString();
    const dateString = `${year}-${monthString}-${dayString}`;

    setSelectedDay(dateString);
    setLoading(true);

    const response = await fetch('/api/daily', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ date: dateString }),
    });
    const responseData = await response.json();
    setEntries(responseData.data);
    setDateSelected(date);
    setLoading(false);
  }, []);

  // get the user's timezone
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
  }, []);

  useEffect(() => {
    const today = new Date();
    let dateParam = today;
    if (searchParams && searchParams.has('date')) {
      let searchParamsDate = searchParams.get('date') as string;
      const dateParts = searchParamsDate.split('-');
      if (dateParts.length === 3) {
        searchParamsDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
      }
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
  }, [searchParams, fetchRecords]);

  const renderContent = (result: any) => {
    if (
      result.metadata &&
      result.metadata.author &&
      result.metadata.author.includes('imagedelivery.net')
    ) {
      return <img src={result.metadata.author} alt="ycb-companion-image" />;
    }
    if (result.data.split(' ').length > 12) {
      return (
        <>
          {splitIntoWords(result.data, 12, 0)}...
          <span className="mt-1 block text-sm text-gray-500">
            ...{splitIntoWords(result.data, 20, 12)}...
          </span>
        </>
      );
    }
    return result.data;
  };

  return (
    <div>
      <div className="my-4 flex justify-center">
        <Calendar
          onClickDay={(val) => fetchRecords(val)}
          value={dateSelected}
        />
      </div>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
        {selectedDay}
        <small className="ms-2 font-semibold text-gray-500">
          {entries.length > 0 ? `:: ${entries.length} entries` : ''}
        </small>
      </h1>

      {loading && <p>loading...</p>}
      {entries.length === 0 && !loading && <p>no entries for this day</p>}

      {entries.map((result) => (
        <div key={result.id} className="mb-4 flex items-center justify-between">
          <div className="grow">
            <Link
              href={{ pathname: `/dashboard/entry/${result.id}` }}
              className="block"
            >
              <div className="flex items-center text-blue-600 hover:underline">
                <Image
                  src={result.favicon || '/favicon.ico'}
                  alt="favicon"
                  width={16}
                  height={16}
                  className="mr-2"
                />
                <span className="font-medium">{renderContent(result)}</span>
              </div>
              <div className="text-sm text-gray-500">
                {result.parentData && (
                  <span className="mt-1 block">{result.parentData.data}</span>
                )}
              </div>
            </Link>
            <div className="text-sm text-gray-500">
              created:{' '}
              {new Date(result.createdAt).toLocaleString('en-us', {
                timeZone: timezone || undefined,
              })}
              {result.createdAt !== result.updatedAt && (
                <>
                  {' '}
                  | last updated:{' '}
                  {new Date(result.updatedAt).toLocaleString('en-us', {
                    timeZone: timezone || undefined,
                  })}
                </>
              )}
            </div>
            <a
              target="_blank"
              href={result.metadata.author}
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-blue-600 hover:underline"
            >
              {toHostname(result.metadata.author)}
              <svg
                className="ms-2.5 size-3 rtl:rotate-[270deg]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 18"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
                />
              </svg>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GardenDaily;
