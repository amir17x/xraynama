import React from 'react';
import ContentListPage from './content-list-page';

const AllContentPage: React.FC = () => {
  return (
    <ContentListPage
      title="تمام محتواها"
      showAll={true}
    />
  );
};

export default AllContentPage;