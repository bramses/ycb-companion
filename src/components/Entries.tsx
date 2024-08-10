/* eslint-disable no-underscore-dangle */

'use client';

import Entry from './Entry';

interface EntryType {
  id: string;
  data: any; // Replace 'any' with a more specific type if possible
  metadata: {
    title: string;
    author: string;
    _display?: string;
  };
}

interface EntriesProps {
  searchResults: EntryType[];
  onDelve: (data: string) => void;
}

const Entries = ({ searchResults, onDelve }: EntriesProps) => {
  return (
    <div>
      {searchResults.map((entry: any) => (
        <Entry
          key={entry.id}
          data={
            '_display' in entry.metadata ? entry.metadata._display : entry.data
          }
          title={entry.metadata.title}
          author={entry.metadata.author}
          createdAt={entry.createdAt}
          updatedAt={entry.updatedAt}
          similarity={entry.similarity}
          hasYouTubeEmbed={entry.metadata.author.includes('youtube.com')}
          youtubeId={
            entry.metadata.author.includes('youtube')
              ? entry.metadata.author.split('v=')[1]?.split('&')[0]
              : ''
          }
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
          onDelve={onDelve}
          hasAliases={'_display' in entry.metadata}
        />
      ))}
    </div>
  );
};

export default Entries;
