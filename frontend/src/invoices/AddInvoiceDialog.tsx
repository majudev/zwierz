import React, { useState, useEffect } from 'react';
import { Invoice } from './InvoiceList';

interface AddInvoiceDialogProps {
  txId: number;
  token: string;
}

function AddInvoiceDialog({ txId, token }: AddInvoiceDialogProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [lockModal, setLockModal] = useState(false);
  const [invoice, setInvoice] = useState<Invoice>({
    numer: '',
    dataUslugi: '',
    dataWystawienia: `${(new Date()).getFullYear()}-${String((new Date()).getMonth() + 1).padStart(2, '0')}-${String((new Date()).getDate()).padStart(2, '0')}`,
    nazwaOdbiorcy: '',
    PESELlubNIP: null,
    adresOdbiorcy: '',
    nazwaWystawcy: '',
    adresWystawcy: null,
    PESELlubNIPwystawcy: null,
    pozycje: [],
    adnotacja: null,
    idTransakcji: txId,
  });

  useEffect(() => {
    callBackendAPI()
    .then(res => {
      setInvoice({
        numer: invoice.numer,
        dataUslugi: res.data,
        dataWystawienia: invoice.dataWystawienia,
        nazwaOdbiorcy: invoice.nazwaOdbiorcy,
        PESELlubNIP: invoice.PESELlubNIP,
        adresOdbiorcy: invoice.adresOdbiorcy,
        nazwaWystawcy: invoice.nazwaWystawcy,
        adresWystawcy: invoice.adresWystawcy,
        PESELlubNIPwystawcy: invoice.PESELlubNIPwystawcy,
        pozycje: res.pozycje,
        adnotacja: null,
        idTransakcji: invoice.idTransakcji,
      });
    }).catch(err => {
      console.log(err);
      setShowModal(false);
      throw err;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callBackendAPI = async () => {
    const response = await fetch(
      process.env.REACT_APP_API_URL + '/sells/by-id/' + txId,
      {
        mode: 'cors',
        headers: {
          'x-access-token': token
        },
      }
    );
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleEntryChange = (field: string, value: any) => {
    setInvoice((prevInvoice) => {
      return {
        ...prevInvoice,
        [field]: value,
      };
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      data: e.target.value,
    }));
  };

  const handleInvoiceSubmit = async () => {
    // Handle the submit logic here
    setLockModal(true);

    console.log(invoice);
    const requestOptions : RequestInit = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify(invoice)
    };
    const response = await fetch(process.env.REACT_APP_API_URL + '/invoices', requestOptions);
    const body = await response.json();

    if (response.status !== 201) {
      setLockModal(false);
      throw Error(body.message);
    }

    setShowModal(false);

    //return body;
  };

  return (
    <>
      <button className="btn btn-dark btn-sm" onClick={handleShowModal}>
        Wystaw
      </button>

      {showModal && (
        <div className="modal show" tabIndex={-1} role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nowa faktura</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className='row'>
                    <div className='col-6'>
                      <div>Automatycznie uzupełnij dane wystawcy:
                        [x]
                      </div>
                      
                    </div>
                    <div className='col-6'>
                      Numer faktury:
                      <input
                        type="text"
                        className="form-control"
                        value="nadawany automatycznie"
                        disabled
                      />
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-6'>
                      Nazwa wystawcy:
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nazwa wystawcy"
                        value={invoice.nazwaWystawcy}
                        onChange={(e) =>
                          handleEntryChange('nazwaWystawcy', e.target.value)
                        }
                      />
                    </div>
                    <div className='col-6'>
                      Nazwa odbiorcy:
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nazwa odbiorcy"
                        value={invoice.nazwaOdbiorcy}
                        onChange={(e) =>
                          handleEntryChange('nazwaOdbiorcy', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-6'>
                      Adres wystawcy:
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Adres wystawcy"
                        value={invoice.adresWystawcy !== null ? invoice.adresWystawcy : ''}
                        onChange={(e) =>
                          handleEntryChange(
                            'adresWystawcy',
                            e.target.value !== '' ? e.target.value : null
                          )
                        }
                      />
                    </div>
                    <div className='col-6'>
                      Adres odbiorcy:
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Adres odbiorcy"
                        value={invoice.adresOdbiorcy}
                        onChange={(e) =>
                          handleEntryChange(
                            'adresOdbiorcy',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-6'>
                      PESEL/NIP wystawcy:
                      <input
                        type="text"
                        className="form-control"
                        placeholder="PESEL/NIP wystawcy"
                        value={invoice.PESELlubNIPwystawcy !== null ? invoice.PESELlubNIPwystawcy : ''}
                        onChange={(e) =>
                          handleEntryChange(
                            'PESELlubNIPwystawcy',
                            e.target.value !== '' ? e.target.value : null
                          )
                        }
                      />
                    </div>
                    <div className='col-6'>
                      PESEL/NIP odbiorcy:
                      <input
                        type="text"
                        className="form-control"
                        placeholder="PESEL/NIP odbiorcy"
                        value={invoice.PESELlubNIP !== null ? invoice.PESELlubNIP : ''}
                        onChange={(e) =>
                          handleEntryChange(
                            'PESELlubNIP',
                            e.target.value !== '' ? e.target.value : null
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-6'>
                      Data transakcji:
                      <input
                        type="date"
                        className="form-control"
                        value={invoice.dataUslugi.split('T')[0]}
                        disabled
                      />
                    </div>
                    <div className='col-6'>
                      Data wystawienia faktury:
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Data"
                        value={invoice.dataWystawienia}
                        onChange={handleDateChange}
                      />
                    </div>
                  </div>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th scope="col">Opis</th>
                        <th scope="col">Nazwa jednostki</th>
                        <th scope="col">Cena jednostkowa</th>
                        <th scope="col">Ilość jednostek</th>
                        <th scope="col">Kwota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.pozycje.map((pozycja, index) => (
                        <tr key={index}>
                          <td>{pozycja.nazwa}</td>
                          <td>{pozycja.nazwaJednostki}</td>
                          <td>{pozycja.cenaJednostkowa.toFixed(2)} zł</td>
                          <td>{pozycja.iloscJednostek.toFixed(2)}</td>
                          <td>{(pozycja.cenaJednostkowa * pozycja.iloscJednostek).toFixed(2)} zł</td>
                        </tr>
                      ))}
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><b>W SUMIE:</b></td>
                        <td><b>{invoice.pozycje.reduce(function(prev, current) { return prev + + (current.cenaJednostkowa * current.iloscJednostek)}, 0).toFixed(2)} zł</b></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className='col-12'>
                    Adnotacja na fakturze:
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Adnotacja"
                      value={invoice.adnotacja !== null ? invoice.adnotacja : ''}
                      onChange={(e) =>
                        handleEntryChange(
                          'adnotacja',
                          e.target.value !== '' ? e.target.value : null
                        )
                      }
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={handleCloseModal}>
                  Zamknij
                </button>
                <button type="button" className="btn btn-dark" onClick={handleInvoiceSubmit} disabled={lockModal}>
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddInvoiceDialog;
