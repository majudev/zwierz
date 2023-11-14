import React, { useState } from 'react';
import InvoiceList from './InvoiceList';
import PeriodSelector from './PeriodSelector';

interface Props{
  token: string;
}

function Invoices({token} : Props): JSX.Element {
  const [reloadInvoicesList, setReloadInvoicesList] = useState(false);
  const [period, setPeriod] = useState(`${(new Date()).getFullYear()}-${String((new Date()).getMonth() + 1).padStart(2, '0')}`);

  const handleInvoicesListReloaded = () => {
    setReloadInvoicesList(false);
  };

  const handlePeriodSelected = (period: string) => {
    setPeriod(period);
  };

  return (
    <div className='container-fluid'>
      <h2>Lista faktur</h2>
      <InvoiceList token={token} reload={reloadInvoicesList} onReloaded={handleInvoicesListReloaded} billingPeriod={period}/>
      <PeriodSelector token={token} onPeriodSelected={handlePeriodSelected} />
    </div>
  );
}

export default Invoices;
