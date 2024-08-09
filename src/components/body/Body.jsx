import React from 'react';
import Card from './card/Card';

const Body = ({ filter }) => {
  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <Card filter={filter} />
    </div>
  );
};

export default Body;
