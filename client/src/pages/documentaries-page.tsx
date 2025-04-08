import React from 'react';
import ContentListPage from './content-list-page';

const DocumentariesPage: React.FC = () => {
  return (
    <ContentListPage
      title="مستندها"
      contentType="documentary"
    />
  );
};

export default DocumentariesPage;