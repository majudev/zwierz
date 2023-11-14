import React, { useState } from 'react';
import {Entry, Sell} from './SellsList';

interface AddSellDialogProps {
  onSellAdded: () => void;
  token: string;
}

function SellModal({onSellAdded, token} : AddSellDialogProps){
  const [showModal, setShowModal] = useState(false);
  const [lockModal, setLockModal] = useState(false);
  const [sell, setSell] = useState<Sell>({
    id: 0,
    data: `${(new Date()).getFullYear()}-${String((new Date()).getMonth() + 1).padStart(2, '0')}-${String((new Date()).getDate()).padStart(2, '0')}`,
    pozycje: [],
    faktura: null
  });

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleAddEntry = () => {
    const entry: Entry = {
      id: sell.pozycje.length + 1,
      nazwa: '',
      nazwaJednostki: '',
      iloscJednostek: 0,
      cenaJednostkowa: 0,
    };
    setSell((prevSell) => ({
      ...prevSell,
      pozycje: [...prevSell.pozycje, entry],
    }));
  };

  const handleEntryChange = (index: number, field: string, value: any) => {
    setSell((prevSell) => {
      const updatedPozycje = prevSell.pozycje.map((entry, i) => {
        if (i === index) {
          return {
            ...entry,
            [field]: value,
          };
        }
        return entry;
      });
      return {
        ...prevSell,
        pozycje: updatedPozycje,
      };
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSell((prevSell) => ({
      ...prevSell,
      data: e.target.value,
    }));
  };

  const handleSellSubmit = async () => {
    // Handle the submit logic here
    setLockModal(true);

    console.log(sell);
    const requestOptions : RequestInit = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify(sell)
    };
    const response = await fetch(process.env.REACT_APP_API_URL + '/sells', requestOptions);
    const body = await response.json();

    if (response.status !== 201) {
      setLockModal(false);
      throw Error(body.message);
    }

    onSellAdded();
    setShowModal(false);
    setLockModal(false);
    setSell({
      id: 0,
      data: `${(new Date()).getFullYear()}-${String((new Date()).getMonth() + 1).padStart(2, '0')}-${String((new Date()).getDate()).padStart(2, '0')}`,
      pozycje: [],
      faktura: null
    });

    return body;
  };

  return (
    <>
      <button className="btn btn-dark" onClick={handleShowModal}>
        Dodaj nową transakcję
      </button>

      {showModal && (
        <div className="modal show" tabIndex={-1} role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nowa transakcja</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="container">
                    <div className="row">
                      <div className="col-6">
                        <center><b>Nazwa</b></center>
                      </div>
                      <div className="col-2">
                        <center><b>Jednostka (np. szt.)</b></center>
                      </div>
                      <div className="col-2">
                        <center><b>Ilość (np. 2,0 kg)</b></center>
                      </div>
                      <div className="col-2">
                        <center><b>Cena jednostkowa</b></center>
                      </div>
                    </div>
                  </div>
                  {/* Render the input fields for each entry */}
                  {sell.pozycje.map((entry, index) => (
                    <div key={entry.id} className="container mt-3 mb-3">
                      <div className="row">
                        <div className="col-6">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nazwa"
                            value={entry.nazwa}
                            onChange={(e) =>
                              handleEntryChange(index, 'nazwa', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nazwa Jednostki"
                            value={entry.nazwaJednostki}
                            onChange={(e) =>
                              handleEntryChange(index, 'nazwaJednostki', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Ilość Jednostek"
                            value={entry.iloscJednostek}
                            onChange={(e) =>
                              handleEntryChange(
                                index,
                                'iloscJednostek',
                                parseFloat(e.target.value).toFixed(2)
                              )
                            }
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <div className="col-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Cena Jednostkowa"
                            value={entry.cenaJednostkowa}
                            onChange={(e) =>
                              handleEntryChange(
                                index,
                                'cenaJednostkowa',
                                parseFloat(e.target.value).toFixed(2)
                              )
                            }
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-dark" onClick={handleAddEntry}>
                    Dodaj pozycję
                  </button>
                  <div className='col-2'>
                    Data sprzedaży: 
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Data"
                      value={sell.data}
                      onChange={handleDateChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={handleCloseModal}>
                  Zamknij
                </button>
                <button type="button" className="btn btn-dark" onClick={handleSellSubmit} disabled={lockModal}>
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellModal;
