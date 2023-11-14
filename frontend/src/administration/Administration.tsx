import React from 'react';
import AuthSettings from './AuthSettings.tsx';
import FinancialSettings from './FinancialSettings.tsx';
import UserDataSettings from './UserDataSettings.tsx';
import TokenSettings from './TokenSettings.tsx';

interface Props {
  token: string;
}

function Administration({token}: Props): JSX.Element {
  return (
    <div className="container-fluid">
      <div className="row">
        <UserDataSettings token={token}/>
        <AuthSettings token={token}/>
        <FinancialSettings token={token}/>
        <TokenSettings token={token} />
        <div className="col-lg-4 col-12">
          <ul className="list-group">
            <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
              <h4 className="mb-1 mt-1">Informacje licencyjne</h4>
            </li>
            <li className="list-group-item">
              <a href="https://www.flaticon.com/free-icons/invoice" title="invoice icons">Invoice icons created by Those Icons - Flaticon</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Administration;
