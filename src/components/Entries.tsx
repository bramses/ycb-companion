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
  onAddAlias: (data: any) => Promise<void>;
  onEdit: (id: string, data: string, metadata: string) => Promise<void>;
  onAddToCollection: (entry: any, alias: any) => void;
}

const Entries = ({
  searchResults,
  onDelve,
  onAddAlias,
  onAddToCollection,
  onEdit,
}: EntriesProps) => {
  return (
    <div>
      {searchResults.map((entry: any, idx: number) => (
        <Entry
          key={
            'aliasData' in entry ? Math.random() * 1000 : `${entry.id}-${idx}`
          } // Replace 'Math.random() * 1000' with a more specific key if possible
          data={entry.data}
          id={`${entry.id}`}
          aliases={'aliasData' in entry ? entry.aliasData : []}
          selectedIndex={'selectedIndex' in entry ? entry.selectedIndex : -1}
          title={entry.metadata.title}
          author={entry.metadata.author}
          createdAt={entry.createdAt}
          similarity={entry.similarity}
          hasYouTubeEmbed={
            entry.metadata.author &&
            entry.metadata.author.includes('youtube.com')
          }
          youtubeId={
            entry.metadata.author &&
            entry.metadata.author.includes('youtube.com')
              ? entry.metadata.author.split('v=')[1]?.split('&')[0]
              : ''
          }
          youtubeStart={
            entry.metadata.author &&
            entry.metadata.author.includes('youtube') &&
            entry.metadata.author.includes('t=')
              ? entry.metadata.author.split('t=')[1].split('s')[0]
              : ''
          }
          hasImage={
            entry.metadata.author &&
            entry.metadata.author.includes('imagedelivery.net')
          }
          imageUrl={
            entry.metadata.author &&
            entry.metadata.author.includes('imagedelivery.net')
              ? entry.metadata.author
              : ''
          }
          hasTwitterEmbed={
            (entry.metadata.author &&
              entry.metadata.author.includes('twitter.com')) ||
            /^https:\/\/(www\.)?x\.com/.test(entry.metadata.author)
          }
          tweetId={
            (entry.metadata.author &&
              entry.metadata.author.includes('twitter.com')) ||
            /^https:\/\/(www\.)?x\.com/.test(entry.metadata.author)
              ? entry.metadata.author.split('/').pop()
              : ''
          }
          hasInstagramEmbed={
            entry.metadata.author &&
            entry.metadata.author.includes('instagram.com')
          }
          hasTikTokEmbed={
            entry.metadata.author &&
            entry.metadata.author.includes('tiktok.com')
          }
          onDelve={onDelve}
          onAddAlias={onAddAlias}
          onEdit={onEdit}
          onAddToCollection={onAddToCollection}
          hasAliases={'aliasData' in entry}
        />
      ))}
    </div>
  );
};

export default Entries;
