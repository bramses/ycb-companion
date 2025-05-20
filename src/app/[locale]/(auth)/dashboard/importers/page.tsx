/**
 * This page is where users can select a data source to upload into YCB. The data support supported right now will first be Letterboxd and Instagram. There should be a link next to each that shows them a tutorial of how to get their data and then to select the right file to upload, and if it doesn't have the right file validation type, it cancels the upload and tells the user.
 */

import InstagramSaved from '@/components/importers/instagram-saved';

const Importers = () => {
  return (
    <div>
      <InstagramSaved />
    </div>
  );
};

export default Importers;
