/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */

'use client';

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import { memo, useState } from 'react';
import { CiCirclePlus, CiEdit, CiSearch } from 'react-icons/ci';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import ReactMarkdown from 'react-markdown';
import { InstagramEmbed, TikTokEmbed } from 'react-social-media-embed';
import { Tweet } from 'react-tweet';

const Entry = ({
  hasAliases: initialHasAliases = false,
  // hasCollections: initialHasCollections = false,
  hasYouTubeEmbed: initialHasYouTubeEmbed = false,
  hasTwitterEmbed: initialHasTwitterEmbed = false,
  hasInstagramEmbed: initialHasInstagramEmbed = false,
  hasTikTokEmbed: initialHasTikTokEmbed = false,
  tweetId = '',
  youtubeId = '',
  youtubeStart = '',
  data = '',
  title = '',
  author = '',
  createdAt = '',
  similarity = 0,
  imageUrl = '',
  id = '',
  displayDelve = true,
  displayCollections = false,
  displayMetadata = true,
  hasImage = false,
  onDelve = (_: string) => {},
  onAddAlias = async (_: any) => {},
  onAddToCollection = (_: any, __: any) => {},
  onEdit = async (_: any, __: any, ___: any, ____: any) => {},
  aliases = [],
  selectedIndex = -1,
}) => {
  const [hasAliases] = useState(initialHasAliases);
  // const [hasCollections] = useState(initialHasCollections);
  const [hasYouTubeEmbed] = useState(initialHasYouTubeEmbed);
  const [hasTwitterEmbed] = useState(initialHasTwitterEmbed);
  const [hasInstagramEmbed] = useState(initialHasInstagramEmbed);
  const [hasTikTokEmbed] = useState(initialHasTikTokEmbed);
  const [isAddedToCollection, setIsAddedToCollection] = useState(false);
  const [isAddingAlias, setIsAddingAlias] = useState(false);
  const [shownAliases] = useState<any[]>(aliases);
  const MemoizedInstagramEmbed = memo(InstagramEmbed);
  const MemoizedTikTokEmbed = memo(TikTokEmbed);
  const [processingAliases, setProcessingAliases] = useState<any[]>([]);

  return (
    <div className="my-4 [&_p]:my-6">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        {hasYouTubeEmbed && (
          <LiteYouTubeEmbed
            id={youtubeId}
            params={`start=${youtubeStart}`}
            title="YouTube video"
          />
        )}

        {hasImage && (
          <img className="h-auto w-full" src={imageUrl} alt="Image" />
        )}

        {hasTwitterEmbed && <Tweet id={tweetId} />}

        {hasInstagramEmbed && <MemoizedInstagramEmbed url={author} />}

        {hasTikTokEmbed && <MemoizedTikTokEmbed url={author} />}

        <div
          className="flex items-center justify-between overflow-x-auto font-normal text-gray-500 dark:text-gray-400"
          id={`data-${id}`}
        >
          <ReactMarkdown className="font-normal text-gray-500 dark:text-gray-400">
            {data}
          </ReactMarkdown>
        </div>
        <div className="mb-4 grid w-full grid-cols-3">
          <div /> {/* Empty div to take up the first 33% */}
          <button
            type="button"
            className="ml-2"
            onClick={() => {
              onDelve(data);
            }}
            aria-label="Search data"
          >
            <CiSearch />
          </button>
          <button
            type="button"
            onClick={() => {
              // set data to contenteditable and focus and add a save button
              const dataElement = document.getElementById(`data-${id}`);
              if (!dataElement) return;
              const dataText = dataElement.textContent;
              // create form element
              const form = document.createElement('form');
              form.className =
                'w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600';

              // create div for textarea
              const divTextarea = document.createElement('div');
              divTextarea.className =
                'px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800';

              // create textarea
              const textarea = document.createElement('textarea');
              textarea.id = `data-${id}`;
              textarea.rows = 4;
              textarea.className =
                'w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400';
              textarea.placeholder = 'Edit data...';
              textarea.required = true;
              textarea.value = dataText ?? ''; // Ensure dataText is not null

              // append textarea to div
              divTextarea.appendChild(textarea);

              // create div for buttons
              const divButtons = document.createElement('div');
              divButtons.className =
                'flex items-center justify-between px-3 py-2 border-t dark:border-gray-600';

              // create submit button
              const submitButton = document.createElement('button');
              submitButton.type = 'submit';
              submitButton.className =
                'inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800';
              submitButton.textContent = 'Edit data';

              submitButton.addEventListener('click', async (e) => {
                e.preventDefault();
                const newData = textarea.value;
                if (newData === dataText) {
                  // clear dataElement and append form
                  dataElement.innerHTML = '';
                  dataElement.textContent = dataText;
                  return;
                }

                setIsAddingAlias(true);
                // set textcontent of button to loading
                submitButton.textContent = 'Loading...';
                // disable button
                submitButton.disabled = true;
                console.log('id', id);
                console.log('newData', newData);
                const pmetadata: {
                  title: string;
                  author: string;
                  alias_ids?: string[];
                } = { title, author };
                // if alias_ids exist and is not empty, add to metadata
                if (aliases.length > 0) {
                  pmetadata.alias_ids = aliases.map((alias: any) => alias.id);
                }

                await onEdit(id, newData, pmetadata, true);

                // enable button
                submitButton.disabled = false;
                // set textcontent of button to loading
                submitButton.textContent = 'Edit Data';

                setIsAddingAlias(false);

                // clear dataElement and append form
                dataElement.innerHTML = '';
                dataElement.textContent = newData;
              });

              // append buttons to div
              divButtons.appendChild(submitButton);

              // cancel button
              const cancelButton = document.createElement('button');
              cancelButton.type = 'button';
              cancelButton.className =
                'inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-gray-400';
              cancelButton.textContent = 'Cancel';
              cancelButton.addEventListener('click', () => {
                // clear dataElement and append form
                dataElement.innerHTML = '';
                dataElement.textContent = dataText;
              });

              // append buttons to div
              divButtons.appendChild(cancelButton);

              // append divs to form
              form.appendChild(divTextarea);
              form.appendChild(divButtons);

              // clear dataElement and append form
              dataElement.innerHTML = '';
              dataElement.appendChild(form);
            }}
            aria-label="Edit data"
            className="text-center"
          >
            <CiEdit />
          </button>
        </div>

        {/* {displayDelve && (
          <button
            className="mb-2 me-2 mt-4 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
            onClick={() => {
              // search using data
              onDelve(data);
            }}
          >
            Delve
          </button>
        )} */}

        {displayDelve ? '' : null}

        {hasAliases && (
          <div>
            <hr className="mx-auto my-4 h-1 w-48 rounded border-0 bg-gray-100 md:my-10 dark:bg-gray-700" />

            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Aliases:
            </h2>
            <ul className="list-inside list-none space-y-1 overflow-x-auto text-gray-500 dark:text-gray-400">
              {shownAliases.map((alias, index) => (
                <li key={alias.id} className="mb-3">
                  {' '}
                  {/*  flex items-center justify-between */}
                  {index === selectedIndex ? (
                    <>
                      <label
                        htmlFor={`alias-${index}`}
                        className="font-normal text-gray-500 dark:text-gray-400"
                        id={`alias-${id}-${index}`}
                      >
                        <strong className="font-semibold text-gray-900 dark:text-white">
                          {alias.data}
                        </strong>
                      </label>
                      <div className="mt-2 grid w-full grid-cols-3">
                        <div /> {/* Empty div to take up the first 33% */}
                        <button
                          type="button"
                          onClick={() => {
                            onDelve(alias.data);
                          }}
                          aria-label={`Search alias ${alias.data}`}
                          className="text-center"
                        >
                          <CiSearch />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // set alias to contenteditable and focus and add a save button
                            const aliasElement = document.getElementById(
                              `alias-${id}-${index}`,
                            );
                            if (!aliasElement) return;
                            const aliasText = aliasElement.textContent;
                            // create form element
                            const form = document.createElement('form');
                            form.className =
                              'w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600';

                            // create div for textarea
                            const divTextarea = document.createElement('div');
                            divTextarea.className =
                              'px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800';

                            // create textarea
                            const textarea = document.createElement('textarea');
                            textarea.id = `alias-${id}-${index}`;
                            textarea.rows = 4;
                            textarea.className =
                              'w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400';
                            textarea.placeholder = 'Edit alias...';
                            textarea.required = true;
                            textarea.value = aliasText ?? ''; // Ensure aliasText is not null

                            // append textarea to div
                            divTextarea.appendChild(textarea);

                            // create div for buttons
                            const divButtons = document.createElement('div');
                            divButtons.className =
                              'flex items-center justify-between px-3 py-2 border-t dark:border-gray-600';

                            // create submit button
                            const submitButton =
                              document.createElement('button');
                            submitButton.type = 'submit';
                            submitButton.className =
                              'inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800';
                            submitButton.textContent = 'Edit alias';

                            submitButton.addEventListener(
                              'click',
                              async (e) => {
                                e.preventDefault();
                                const newAlias = textarea.value;
                                if (newAlias === aliasText) {
                                  // clear aliasElement and append form
                                  aliasElement.innerHTML = '';
                                  aliasElement.textContent = aliasText;
                                  return;
                                }

                                setIsAddingAlias(true);
                                // set textcontent of button to loading
                                submitButton.textContent = 'Loading...';
                                // disable button
                                submitButton.disabled = true;
                                await onEdit(
                                  alias.id,
                                  newAlias,
                                  {
                                    title,
                                    author,
                                    parent_id: id,
                                  },
                                  true,
                                );

                                // enable button
                                submitButton.disabled = false;
                                // set textcontent of button to loading
                                submitButton.textContent = 'Edit Alias';

                                setIsAddingAlias(false);
                                // clear aliasElement and append form
                                aliasElement.innerHTML = '';
                                aliasElement.textContent = newAlias;

                                // setIsAddingAlias(true);
                                // await onAddAlias({
                                //   id,
                                //   alias: newAlias,
                                //   data,
                                //   metadata: { title, author },
                                // });
                                // setIsAddingAlias(false);
                                // // clear aliasElement and append form
                                // aliasElement.innerHTML = '';
                                // aliasElement.textContent = newAlias;
                              },
                            );

                            // append buttons to div
                            divButtons.appendChild(submitButton);

                            // cancel button
                            const cancelButton =
                              document.createElement('button');
                            cancelButton.type = 'button';
                            cancelButton.className =
                              'inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-gray-400';
                            cancelButton.textContent = 'Cancel';
                            cancelButton.addEventListener('click', () => {
                              // clear aliasElement and append form
                              aliasElement.innerHTML = '';
                              aliasElement.textContent = aliasText;
                            });

                            // append buttons to div
                            divButtons.appendChild(cancelButton);

                            // append divs to form
                            form.appendChild(divTextarea);
                            form.appendChild(divButtons);

                            // clear aliasElement and append form
                            aliasElement.innerHTML = '';
                            aliasElement.appendChild(form);
                          }}
                          aria-label={`Edit alias ${alias}`}
                          className="text-center"
                        >
                          <CiEdit />
                        </button>
                      </div>
                      <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
                    </>
                  ) : (
                    <>
                      <label
                        htmlFor={`alias-${index}`}
                        className="font-normal text-gray-500 dark:text-gray-400"
                        id={`alias-${id}-${index}`}
                      >
                        {alias.data}
                      </label>
                      <div className="mt-2 grid w-full grid-cols-3">
                        <div /> {/* Empty div to take up the first 33% */}
                        <button
                          type="button"
                          onClick={() => {
                            onDelve(alias.data);
                          }}
                          aria-label={`Search alias ${alias.data}`}
                          className="text-center"
                        >
                          <CiSearch />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // set alias to contenteditable and focus and add a save button
                            const aliasElement = document.getElementById(
                              `alias-${id}-${index}`,
                            );
                            if (!aliasElement) return;
                            const aliasText = aliasElement.textContent;
                            // create form element
                            const form = document.createElement('form');
                            form.className =
                              'w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600';

                            // create div for textarea
                            const divTextarea = document.createElement('div');
                            divTextarea.className =
                              'px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800';

                            // create textarea
                            const textarea = document.createElement('textarea');
                            textarea.id = `alias-${id}-${index}`;
                            textarea.rows = 4;
                            textarea.className =
                              'w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400';
                            textarea.placeholder = 'Edit alias...';
                            textarea.required = true;
                            textarea.value = aliasText ?? ''; // Ensure aliasText is not null

                            // append textarea to div
                            divTextarea.appendChild(textarea);

                            // create div for buttons
                            const divButtons = document.createElement('div');
                            divButtons.className =
                              'flex items-center justify-between px-3 py-2 border-t dark:border-gray-600';

                            // create submit button
                            const submitButton =
                              document.createElement('button');
                            submitButton.type = 'submit';
                            submitButton.className =
                              'inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800';
                            submitButton.textContent = 'Edit alias';

                            submitButton.addEventListener(
                              'click',
                              async (e) => {
                                e.preventDefault();
                                const newAlias = textarea.value;
                                if (newAlias === aliasText) {
                                  // clear aliasElement and append form
                                  aliasElement.innerHTML = '';
                                  aliasElement.textContent = aliasText;
                                  return;
                                }

                                setIsAddingAlias(true);
                                // set textcontent of button to loading
                                submitButton.textContent = 'Loading...';
                                // disable button
                                submitButton.disabled = true;
                                await onEdit(
                                  alias.id,
                                  newAlias,
                                  {
                                    title,
                                    author,
                                    parent_id: id,
                                  },
                                  true,
                                );

                                // enable button
                                submitButton.disabled = false;
                                // set textcontent of button to loading
                                submitButton.textContent = 'Edit Alias';

                                setIsAddingAlias(false);
                                // clear aliasElement and append form
                                aliasElement.innerHTML = '';
                                aliasElement.textContent = newAlias;

                                // setIsAddingAlias(true);
                                // await onAddAlias({
                                //   id,
                                //   alias: newAlias,
                                //   data,
                                //   metadata: { title, author },
                                // });
                                // setIsAddingAlias(false);
                                // // clear aliasElement and append form
                                // aliasElement.innerHTML = '';
                                // aliasElement.textContent = newAlias;
                              },
                            );

                            // append buttons to div
                            divButtons.appendChild(submitButton);

                            // cancel button
                            const cancelButton =
                              document.createElement('button');
                            cancelButton.type = 'button';
                            cancelButton.className =
                              'inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-gray-400';
                            cancelButton.textContent = 'Cancel';
                            cancelButton.addEventListener('click', () => {
                              // clear aliasElement and append form
                              aliasElement.innerHTML = '';
                              aliasElement.textContent = aliasText;
                            });

                            // append buttons to div
                            divButtons.appendChild(cancelButton);

                            // append divs to form
                            form.appendChild(divTextarea);
                            form.appendChild(divButtons);

                            // clear aliasElement and append form
                            aliasElement.innerHTML = '';
                            aliasElement.appendChild(form);
                          }}
                          aria-label={`Edit alias ${alias}`}
                          className="text-center"
                        >
                          <CiEdit />
                        </button>
                      </div>
                      <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
                    </>
                  )}
                </li>
              ))}
            </ul>

            <hr className="mx-auto my-4 h-1 w-48 rounded border-0 bg-gray-100 md:my-10 dark:bg-gray-700" />
          </div>
        )}
        {/* add alias input field and button */}
        <ul
          className="list-inside list-disc space-y-1 overflow-x-auto text-gray-500 dark:text-gray-400"
          id={`processingAliases-${id}`}
        >
          {processingAliases.map((p_alias) => (
            <li key={`${p_alias}`}>{p_alias}</li>
          ))}
        </ul>

        <div className="flex items-center justify-between">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Add an alias..."
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                const aliasInput = document.getElementById(`alias-input-${id}`);
                if (!aliasInput) return;
                // Cast to HTMLInputElement to access value property
                const alias = (aliasInput as HTMLInputElement).value;
                setIsAddingAlias(true);
                await onAddAlias({
                  id,
                  alias,
                  data,
                  metadata: { title, author },
                });
                setIsAddingAlias(false);
                // clear input field
                (aliasInput as HTMLInputElement).value = '';
                setProcessingAliases((prev) => {
                  return [...prev, alias];
                });
                // log processingAliases
                console.log(processingAliases);
              }
            }}
            id={`alias-input-${id}`}
          />
          {!isAddingAlias ? (
            <button
              type="button"
              onClick={async () => {
                const aliasInput = document.getElementById(`alias-input-${id}`);
                if (!aliasInput) return;
                // Cast to HTMLInputElement to access value property
                const alias = (aliasInput as HTMLInputElement).value;
                setIsAddingAlias(true);
                await onAddAlias({
                  id,
                  alias,
                  data,
                  metadata: { title, author },
                });
                setIsAddingAlias(false);
                // clear input field
                (aliasInput as HTMLInputElement).value = '';
                // add alias to span list to show users new aliases
                setProcessingAliases((prev) => {
                  return [...prev, alias];
                });
                // log processingAliases
                console.log(processingAliases);
              }}
              className="ml-2 font-normal text-gray-500 dark:text-gray-400"
              aria-label="Add alias"
            >
              <CiCirclePlus />
            </button>
          ) : (
            <button disabled type="button" className="ml-2" aria-label="adding">
              <svg
                aria-hidden="true"
                role="status"
                className="me-3 inline size-4 animate-spin text-white"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>

        {displayCollections && (
          <hr className="mx-auto my-4 h-1 w-48 rounded border-0 bg-gray-100 md:my-10 dark:bg-gray-700" />
        )}

        {displayCollections && (
          <button
            key={id}
            id={`add-to-collection-${id}`}
            className={`mb-2 me-2 mt-4 w-full rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 ${isAddedToCollection ? 'cursor-not-allowed bg-gray-300 text-gray-500' : 'bg-green-700 hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'}`}
            type="button"
            onClick={() => {
              // TODO: this doesnt work for alias records
              // add to collection
              onAddToCollection(
                { data, title, author },
                aliases[selectedIndex] ? aliases[selectedIndex] : '',
              );
              setIsAddedToCollection((_) => {
                return true;
              });
            }}
            disabled={isAddedToCollection}
          >
            {isAddedToCollection ? 'Added to collection' : 'Add to collection'}
          </button>
        )}

        {displayCollections && isAddedToCollection && hasAliases && (
          <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">
            Added to collection
          </p>
        )}

        <hr className="mx-auto my-4 h-1 w-48 rounded border-0 bg-gray-100 md:my-10 dark:bg-gray-700" />

        {displayMetadata && (
          <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">
            Added on{' '}
            <strong className="font-semibold text-gray-900 dark:text-white">
              {/* link to /dashboard/garden?date=yyyy-mm-dd. if day or month is one number prepend a zero */}
              <a
                href={`/dashboard/garden?date=${new Date(createdAt)
                  .toLocaleDateString()
                  .split('/')
                  .map((d) => (d.length === 1 ? `0${d}` : d))
                  .join('-')}
                `}
                className="text-blue-600 hover:underline"
              >
                {new Date(createdAt).toLocaleDateString()}
              </a>
            </strong>{' '}
            with a similarity of{' '}
            <strong className="font-semibold text-gray-900 dark:text-white">
              {Math.round(similarity * 100)}%
            </strong>
          </p>
        )}

        <a
          href={author}
          className="inline-flex items-center font-medium text-blue-600 hover:underline"
          target="_blank"
        >
          {title}
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
  );
};

export default Entry;
