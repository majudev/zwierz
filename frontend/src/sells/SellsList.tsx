import React, { useState, useEffect } from 'react';
import AddInvoiceDialog from '../invoices/AddInvoiceDialog';

export interface Entry {
  id: number;
  nazwa: string;
  nazwaJednostki: string;
  iloscJednostek: number;
  cenaJednostkowa: number;
}

export interface Sell {
  id: number;
  data: string;
  pozycje: Entry[];
  faktura: string | null;
}

interface SellsListProps {
  reload: boolean;
  onReloaded: () => void;
  billingPeriod: string;
  token: string;
}

function SellsList(props: SellsListProps): JSX.Element {
  const [sells, setSells] = useState<Sell[]>([]);

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    callBackendAPI()
    .then(res => {
      setSells(res);
    }).catch(err => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callBackendAPI = async () => {
    const year = props.billingPeriod.split('-')[0];
    const month = props.billingPeriod.split('-')[1];
    const response = await fetch(
      process.env.REACT_APP_API_URL + '/sells/by-period/' + year + '/' + month,
      {
        mode: 'cors',
        headers: {
          'x-access-token': props.token
        },
      }
    );
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  useEffect(() => {
    if (props.reload) {
      handleReload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.reload]);

  const handleReload = () => {
    callBackendAPI()
    .then(res => {
      setSells(res);
    }).catch(err => console.log(err));
    props.onReloaded();
  };

  useEffect(() => {
    if (props.billingPeriod) {
      handleReload();
      console.log('Billing period changed to ' + props.billingPeriod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.billingPeriod]);

  const handleSort = (): void => {
    const sortedSells = [...sells].sort((a, b) => {
      if (sortDirection === 'asc') {
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      } else {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      }
    });

    setSells(sortedSells);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="container m-0 p-0">
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">
              Data transakcji{' '}
              <button className="btn btn-link" onClick={handleSort}>
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </th>
            <th scope="col">Pozycje</th>
            <th scope="col">Kwota (suma: {sells.reduce(function(prev, current) { return prev + current.pozycje.reduce(function(prev, current) { return prev + + (current.cenaJednostkowa * current.iloscJednostek)}, 0)}, 0).toFixed(2)} zł)</th>
            <th scope="col">Numer faktury</th>
          </tr>
        </thead>
        <tbody>
          {sells.map((sell, index) => (
            <tr key={index}>
              <td>{sell.id}</td>
              <td>{`${String((new Date(sell.data)).getDate()).padStart(2, '0')}.${String((new Date(sell.data)).getMonth() + 1).padStart(2, '0')}.${(new Date(sell.data)).getFullYear()}`}</td>
              <td>
                <ul className='mb-0'>
                {sell.pozycje.map((entry, index) => (
                  <li>{entry.nazwa}&nbsp;-&nbsp;{(entry.cenaJednostkowa * entry.iloscJednostek).toFixed(2)}&nbsp;zł</li>
                ))}
                </ul>
              </td>
              <td>{sell.pozycje.reduce(function(prev, current) { return prev + + (current.cenaJednostkowa * current.iloscJednostek)}, 0).toFixed(2)}&nbsp;zł</td>
              <td>{sell.faktura === null ? <AddInvoiceDialog token={props.token} txId={sell.id}/> : sell.faktura}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SellsList;