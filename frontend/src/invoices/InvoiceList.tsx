import React, { useState, useEffect } from 'react';
import { Entry } from '../sells/SellsList.tsx'
import GetPDFButton from './GetPDFButton.tsx';

export interface Invoice {
  numer: string;
  dataUslugi: string;
  dataWystawienia: string;
  nazwaOdbiorcy: string;
  PESELlubNIP: string | null;
  adresOdbiorcy: string;
  nazwaWystawcy: string;
  adresWystawcy: string | null;
  PESELlubNIPwystawcy: string | null;
  adnotacja: string | null;
  pozycje: Entry[];
  idTransakcji: number;
}

interface InvoicesListProps {
  reload: boolean;
  onReloaded: () => void;
  billingPeriod: string;
  token: string;
}

function InvoiceList(props: InvoicesListProps): JSX.Element {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    callBackendAPI()
    .then(res => {
      setInvoices(res);
    }).catch(err => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callBackendAPI = async () => {
    const year = props.billingPeriod.split('-')[0];
    const month = props.billingPeriod.split('-')[1];
    const response = await fetch(
      process.env.REACT_APP_API_URL + '/invoices/by-period/' + year + '/' + month,
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
      setInvoices(res);
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
    const sortedInvoices = [...invoices].sort((a, b) => {
      if (sortDirection === 'asc') {
        return new Date(a.dataWystawienia).getTime() - new Date(b.dataWystawienia).getTime();
      } else {
        return new Date(b.dataWystawienia).getTime() - new Date(a.dataWystawienia).getTime();
      }
    });

    setInvoices(sortedInvoices);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="container m-0 p-0">
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Numer</th>
            <th scope="col">
              Data wystawienia{' '}
              <button className="btn btn-link" onClick={handleSort}>
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </th>
            <th>Odbiorca</th>
            <th>Wystawca</th>
            <th>Pozycje</th>
            <th scope="col">Kwota</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={index}>
              <td>{invoice.numer}</td>
              <td>{`${String((new Date(invoice.dataWystawienia)).getDate()).padStart(2, '0')}.${String((new Date(invoice.dataWystawienia)).getMonth() + 1).padStart(2, '0')}.${(new Date(invoice.dataWystawienia)).getFullYear()}`}</td>
              <td>{invoice.nazwaOdbiorcy}<br/>{invoice.adresOdbiorcy.replaceAll("\n", ", ")}<br/>{invoice.PESELlubNIP !== null ? invoice.PESELlubNIP : <i>(nie podano NIP-u)</i>}</td>
              <td>{invoice.nazwaWystawcy}<br/>{invoice.adresWystawcy !== null ? invoice.adresWystawcy.replaceAll("\n", ", ") : <i>(nie podano adresu)</i>}<br/>{invoice.PESELlubNIPwystawcy !== null ? invoice.PESELlubNIPwystawcy : <i>(nie podano NIP-u)</i>}</td>
              <td>
                <ul className='mb-0'>
                {invoice.pozycje.map((entry, index) => (
                  <li>{entry.nazwa}&nbsp;-&nbsp;{(entry.cenaJednostkowa * entry.iloscJednostek).toFixed(2)}&nbsp;zł</li>
                ))}
                </ul>
                {invoice.adnotacja !== null && 
                <p><br/>Adnotacja na fakturze:<br/>{invoice.adnotacja}</p> }
              </td>
              <td>{invoice.pozycje.reduce(function(prev, current) { return prev + + (current.cenaJednostkowa * current.iloscJednostek)}, 0).toFixed(2)}&nbsp;zł</td>
              <td><GetPDFButton token={props.token} numer={invoice.numer} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceList;
