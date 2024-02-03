import React from 'react';

const FullscreenSpinner = () => {
  return (
    <div style={{height: "80vh"}} className="d-flex align-items-center justify-content-center">
      <div style={{width: "6rem", height: "6rem"}} role="status" className="spinner-border">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default FullscreenSpinner;
