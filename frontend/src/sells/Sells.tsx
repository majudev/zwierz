import React, { useState } from 'react';
import SellsList from './SellsList.tsx';
import AddSellDialog from './AddSellDialog.tsx';
import PeriodSelector from './PeriodSelector.tsx';

interface Props {
  token: string;
}

function Sells({token} : Props): JSX.Element {
  const [reloadSellsList, setReloadSellsList] = useState(false);
  const [period, setPeriod] = useState(`${(new Date()).getFullYear()}-${String((new Date()).getMonth() + 1).padStart(2, '0')}`);

  const handleSellAdded = () => {
    setReloadSellsList(true);
  };

  const handleSellsListReloaded = () => {
    setReloadSellsList(false);
  };

  const handlePeriodSelected = (period: string) => {
    setPeriod(period);
  };

  return (
    <div className="container-fluid">
      <h2>Lista transakcji sprzedaży</h2>
      <SellsList token={token} reload={reloadSellsList} onReloaded={handleSellsListReloaded} billingPeriod={period}/>
      <AddSellDialog token={token} onSellAdded={handleSellAdded}/>
      <PeriodSelector token={token} onPeriodSelected={handlePeriodSelected} />
    </div>
  );
}

export default Sells;
