'use client';

import { useEffect, useState } from 'react';

import { AppConfig } from '@/utils/AppConfig';

const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [profilePicture, setProfilePicture] = useState<string>('');

  // call /api/getProfilePicture to get the profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      const response = await fetch('/api/getProfilePicture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('data:', data);
      setProfilePicture(data.data.profilePicture.text);
    };

    fetchProfilePicture();
  }, []);

  return (
    <div className="w-full px-1 text-gray-700 antialiased">
      <div className="mx-auto max-w-screen-md">
        <header className="border-b border-gray-300">
          <div className="pb-8 pt-16">
            <h1 className="text-3xl font-bold text-gray-900">
              {profilePicture !== '' ? (
                <img
                  src={profilePicture}
                  alt="profile"
                  className="size-16 rounded-full"
                />
              ) : (
                <img
                  src="/favicon.ico"
                  className="mr-2 inline-block"
                  width={28}
                  height={28}
                  alt="favicon"
                />
              )}
              {AppConfig.name}
            </h1>
            {/* <h2 className="text-xl">{t('description')}</h2> */}
          </div>

          <div className="flex justify-between">
            <nav>
              <ul className="flex flex-wrap gap-x-5 text-xl">
                {props.leftNav}
              </ul>
            </nav>

            <nav>
              <ul className="flex flex-wrap gap-x-5 text-xl">
                {props.rightNav}
              </ul>
            </nav>
          </div>
        </header>

        <main>{props.children}</main>

        <footer className="border-t border-gray-300 py-8 text-center text-sm">
          <a
            className="text-blue-700 hover:border-b-2 hover:border-blue-700"
            href="https://www.icloud.com/shortcuts/e5b66464cff943f286244b06ab79625b"
          >
            Get the iOS shortcut.
          </a>
          <a
            className="text-blue-700 hover:border-b-2 hover:border-blue-700"
            href="https://github.com/bramses/simple-chrome-ycb"
          >
            {' '}
            Get the Chrome Extension.
          </a>
          <a
            className="text-blue-700 hover:border-b-2 hover:border-blue-700"
            href="https://forms.gle/e4MPYNiRDCBixi9j8"
          >
            {' '}
            Feedback.
          </a>
          © Copyright {new Date().getFullYear()} {AppConfig.name}. Boilerplate
          created by{' '}
          <a
            href="https://creativedesignsguru.com"
            className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          >
            CreativeDesignsGuru
          </a>
          .
          {/*
           * PLEASE READ THIS SECTION
           * I'm an indie maker with limited resources and funds, I'll really appreciate if you could have a link to my website.
           * The link doesn't need to appear on every pages, one link on one page is enough.
           * For example, in the `About` page. Thank you for your support, it'll mean a lot to me.
           */}
        </footer>
      </div>
    </div>
  );
};

export { BaseTemplate };
