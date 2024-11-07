import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

import { GET } from '../getCBPath/route';

// import env variables

export const POST = async (request: Request) => {
  const { query, matchCount } = await request.json();
  const { CLOUD_URL } = process.env;

  let submittedQuery = query;

  let matchCt = matchCount;

  if (matchCt === undefined) {
    matchCt = 5;
  }

  if (matchCt > 10) {
    matchCt = 10;
  }
  if (matchCt < 1) {
    matchCt = 1;
  }

  /*
  if query contains "metadata:example" take the ... and add a filterModel to the query and remove the metadata:example from the query

  create this object only replace example with the user input
  "metadata": {
        "filterType": "text",
        "type": "contains",
        "filter": "example"
    }
}
  */

  let filterModel = null;
  if (query.includes('metadata:')) {
    const value = query.split('metadata:')[1].trim().replace(/"/g, ''); // TODO does not work for quote chars in metadata
    filterModel = {
      metadata: {
        filterType: 'text',
        type: 'contains',
        filter: value,
      },
    };
    submittedQuery = query.replace(`"metadata:${value}"`, '');
    logger.info('filterModel:', filterModel);
  }

  const dbRes = await GET(request);
  if (!dbRes) {
    return NextResponse.json({}, { status: 500 });
  }
  const { DATABASE_URL, API_KEY } = await dbRes.json();

  const resp = await fetch(`${CLOUD_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: submittedQuery,
      match_count: matchCt,
      dbPath: DATABASE_URL,
      apiKey: API_KEY,
      filterModel,
    }),
  });

  const data = await resp.json();

  try {
    logger.info(`A new search has been created ${JSON.stringify(data)}`);

    return NextResponse.json({
      data,
    });
  } catch (error) {
    logger.error(error, 'An error occurred while creating a search');

    return NextResponse.json({}, { status: 500 });
  }
};
