/*
upload file with json structure {
  "saved_saved_media": [
    {
      "title": "houseofgaming",
      "string_map_data": {
        "Saved on": {
          "href": "https://www.instagram.com/reel/DFORoI7Azzs/",
          "timestamp": 1739667172
        }
      }
    },
    {
      "title": "thelifeofaaronwalker",
      "string_map_data": {
        "Saved on": {
          "href": "https://www.instagram.com/reel/DGCEYBhyKEJ/",
          "timestamp": 1739656861
        }
      }
    },
    {
      "title": "itsjustebra",
      "string_map_data": {
        "Saved on": {
          "href": "https://www.instagram.com/reel/DGBvL77PMdU/",
          "timestamp": 1739602464
        }
      }
    },
    {
      "title": "mahboiralph",
      "string_map_data": {
        "Saved on": {
          "href": "https://www.instagram.com/reel/DDHOhCGTc5m/",
          "timestamp": 1739518635
        }
      }
    },
    {
      "title": "chillguy_niggesh",
      "string_map_data": {
        "Saved on": {
          "href": "https://www.instagram.com/reel/DEGz5xUOf1Z/",
          "timestamp": 1739435489
        }
      }
    },
    {
      "title": "_paramasivam_pov",
      "string_map_data": {
        "Saved on": {
          "href": "https://www.instagram.com/reel/DF5VVRcP2yS/",
          "timestamp": 1739435272
        }
      }
    },
    {
      "title": "negusflex",
      "string_map_data": {
        "Saved on": {
          "href": "https://www.instagram.com/p/DF6QFq5yEbO/",
          "timestamp": 1739435021
        }
      }
    },
    {
      "title": "petslove.tv",
      "string_map_data": {
        "Saved on": {
          "href": "https://www.instagram.com/reel/DFnEMeqyB2Q/",
          "timestamp": 1739434365
        }
      }
    },
    {
      "title": "livielively",
      "string_map_data": {
        "Saved on": {
          "href": "https://www.instagram.com/reel/DF1ubL3uTin/",
          "timestamp": 1739433296
        }
      }
    }
  ]
}

 use /api/getTitleFromXPath POST url=https://www.instagram.com/reel/DF1ubL3uTin/

 take the title and use /api/add POST data={"data":"title","metadata":{"title":"title"}, "createdAt": "2023-03-30T16:00:00.000Z"}
*/

'use client';

import { useState } from 'react';

const InstagramSaved = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // New state for loading

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]!);
    }
  };

  const handleClick = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    // check if the file is a JSON file
    if (file.type !== 'application/json') {
      alert('Please select a JSON file.');
      return;
    }

    // read the file contents as json
    const fileContents = await file.text();
    console.log('File contents:', fileContents);

    try {
      // parse the JSON file contents
      const jsonData = JSON.parse(fileContents);

      // check against schema
      if (!jsonData.saved_saved_media) {
        throw new Error('Invalid JSON file: missing saved_saved_media');
      }

      setIsLoading(true);

      const fetchPromises = jsonData.saved_saved_media.map(
        async (item: any) => {
          console.log('item:', item);
          const { title } = item;
          const { href } = item.string_map_data['Saved on'];
          const { timestamp } = item.string_map_data['Saved on'];

          // send a POST request to /api/getTitleFromXPath with the href as the URL
          const response = await fetch('/api/getTitleFromXPath', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: href,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch title from href');
          }

          const data = await response.json();
          const isoDate = new Date(timestamp * 1000).toISOString();
          const duplicateCheck = {
            fields: {
              metadata: {
                author: href,
              },
            },
          };
          let addData = data.data.result;
          if (
            addData === '' ||
            addData === null ||
            addData === undefined ||
            typeof addData === 'object'
          ) {
            addData = title;
          }
          const addMetadata = {
            title: `(from ${title})`,
            author: href,
          };

          console.log('Adding data:', addData);
          console.log('Adding metadata:', addMetadata);

          const xresponse = await fetch('/api/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: addData,
              metadata: addMetadata,
              createdAt: isoDate,
              duplicateCheck,
            }),
          });
          console.log('Response:', xresponse);
        },
      );

      // wait for all promises to resolve
      await Promise.all(fetchPromises);
      setIsLoading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleClick} type="button">
        Import Instagram Saved
      </button>
      {isLoading && <div>Loading...</div>} {/* Loading icon */}
    </div>
  );
};

export default InstagramSaved;
