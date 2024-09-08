'use client';

import 'react-calendar/dist/Calendar.css';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Calendar from 'react-calendar';

// import ScrollToTop from 'react-scroll-to-top';
import { addToCollection, splitIntoWords } from '@/helpers/functions';

const GardenDaily = () => {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [dateSelected, setDateSelected] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [checkedButtons, setCheckedButtons] = useState<{
    [key: string]: boolean;
  }>({});
  const [buildingCollection, setBuildingCollection] = useState(false);
  // const cache = getCache();

  const toHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (err) {
      return url;
    }
  };

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
      // set entries to the mapped data
      setEntries(responseData.data);
      setDateSelected(date);
      setLoading(false);
    },
    [setSelectedDay, setLoading, setEntries],
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
      {entries.length === 0 ? <p>No entries for this day</p> : null}

      {entries.map((result) => (
        <div key={result.id} className="mb-4 flex items-center justify-between">
          <div className="grow">
            <Link
              href={{
                pathname: `/dashboard/entry/${result.id}`,
              }}
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
                <span className="font-medium">
                  {result.data.split(' ').length > 12 ? (
                    <>
                      {splitIntoWords(result.data, 12, 0)}...
                      <span className="mt-1 block text-sm text-gray-500">
                        ...{splitIntoWords(result.data, 20, 12)}...
                      </span>
                    </>
                  ) : (
                    result.data
                  )}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {result.parentData && (
                  <span className="mt-1 block">{result.parentData.data}</span>
                )}
              </div>
            </Link>
            {/* when was the entry created and updated */}
            <div className="text-sm text-gray-500">
              Created: {new Date(result.createdAt).toLocaleString()}
              {result.createdAt !== result.updatedAt && (
                <>
                  {' '}
                  | Last Updated: {new Date(
                    result.updatedAt,
                  ).toLocaleString()}{' '}
                </>
              )}
            </div>
            <a
              target="_blank"
              href={JSON.parse(result.metadata).author}
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-blue-600 hover:underline"
            >
              {toHostname(JSON.parse(result.metadata).author)}
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
          <button
            type="button"
            className={`ml-4 rounded-full p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              checkedButtons[result.id] ? 'bg-green-500' : 'bg-blue-500'
            }`}
            onClick={() =>
              addToCollection(
                result.id,
                result.data,
                buildingCollection,
                setBuildingCollection,
                setCheckedButtons,
              )
            }
          >
            {checkedButtons[result.id] ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </button>
        </div>
      ))}
      {/* <ScrollToTop smooth /> */}
    </div>
  );
};

export default GardenDaily;
