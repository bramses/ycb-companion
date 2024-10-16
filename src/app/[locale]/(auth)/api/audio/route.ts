import { IncomingForm } from 'formidable';
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

import { GET } from '../getCBPath/route';

// import env variables

export const POST = async (request: Request) => {
  const { CLOUD_URL } = process.env;

  const form = new IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(request, async (err: any, fields: any, files: any) => {
      if (err) {
        logger.error(err, 'Error parsing the form');
        return resolve(NextResponse.json({}, { status: 500 }));
      }

      const dbRes = await GET(request);
      if (!dbRes) {
        return resolve(NextResponse.json({}, { status: 500 }));
      }
      const { DATABASE_URL, API_KEY } = await dbRes.json();

      const audioFile = files.audio; // Assuming the field name is 'audio'

      const resp = await fetch(`${CLOUD_URL}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dbPath: DATABASE_URL,
          apiKey: API_KEY,
          audioFilePath: audioFile.filepath, // Use the file path from the uploaded file
        }),
      });
      logger.info('resp:', resp);
      const data = await resp.json();

      try {
        logger.info(
          `A new transcribe has been created ${JSON.stringify(data)}`,
        );

        return resolve(
          NextResponse.json({
            data,
          }),
        );
      } catch (error) {
        logger.error(error, 'An error occurred while creating a search');

        return resolve(NextResponse.json({}, { status: 500 }));
      }
    });
    form.on('error', (err: any) => {
      logger.error(err, 'Error parsing the form');
      return reject(NextResponse.json({}, { status: 500 }));
    });
  });
};
