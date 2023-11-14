import React from 'react';

interface Props {
  token: string;
}

function Statistics({token}: Props): JSX.Element {
  return (
    <div>
      <h2>Statistics</h2>
      {/* Add your summary of last month's income and cool-looking charts here */}
    </div>
  );
}

export default Statistics;
