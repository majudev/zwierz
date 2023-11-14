import React, { useState, useEffect } from 'react';

interface FinancialSettingsInterface {
  monthlyIncomeLimit: number | null;
}

interface Props {
  token: string;
}

const FinancialSettings = ({token}: Props) => {
    const [incomeLimit, setIncomeLimit] = useState(0);
  
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
      callBackendAPI()
      .then(res => {
        setIncomeLimit(res.monthlyIncomeLimit !== null ? res.monthlyIncomeLimit : "");
      }).catch(err => console.log(err));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    const callBackendAPI = async () => {
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/settings/financial',
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

    const handleSubmit = async () => {
      setEditMode(false);

      const settings: FinancialSettingsInterface = {
        monthlyIncomeLimit: incomeLimit !== 0 ? incomeLimit : null
      };

      console.log(settings);
      const requestOptions : RequestInit = {
        method: 'PATCH',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(settings)
      };
      const response = await fetch(process.env.REACT_APP_API_URL + '/settings/financial', requestOptions);
      const body = await response.json();
  
      if (response.status !== 200) {
        throw Error(body.message);
      }
  
      return body;
    };

    return (
      <div className="col-lg-4 col-12">
        <ul className="list-group">
          <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 className="mb-1 mt-1">Ustawienia finansów</h4>
          </li>
          <li className="list-group-item">
            <label className="me-1" htmlFor="incomeLimit">Miesięczny limit przychodu:</label>
            {editMode ?
              <input type="number" className="form-control" id="incomeLimit" value={incomeLimit} onChange={(e) => setIncomeLimit(parseFloat(e.target.value))} required />
            :
              <span id="incomeLimit">{incomeLimit !== 0 ? incomeLimit : <i>(nieustawiony)</i>}</span>
            }
          </li>
          <li className="list-group-item">
            {!editMode ? 
              <button className="btn btn-dark" onClick={(e) => setEditMode(true)}>Edytuj</button>
            :
              <button className="btn btn-dark" onClick={(e) => handleSubmit()}>Zapisz</button>
            }
          </li>
        </ul>
      </div>
    );
};

export default FinancialSettings;