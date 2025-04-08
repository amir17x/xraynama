import React from 'react';
import ContentListPage from './content-list-page';

const MoviesPage: React.FC = () => {
  return (
    <ContentListPage
      title="فیلم‌ها"
      contentType="movie"
    />
  );
};

export default MoviesPage;