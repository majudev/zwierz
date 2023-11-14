import React, { useState, useEffect } from 'react';

interface PersonalSettings {
  name: string | null;
  surname: string | null;
  PESEL: string | null;
  address: string | null;
  companyName: string | null;
}

interface Props {
  token: string;
}

const UserDataSettings = ({token}: Props) => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [pesel, setPESEL] = useState('');
    const [address, setAddress] = useState('');
    const [company, setCompany] = useState('');
    
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
      callBackendAPI()
      .then(res => {
        setName(res.name !== null ? res.name : "ustaw imię!");
        setSurname(res.surname !== null ? res.surname : "ustaw nazwisko!");
        setPESEL(res.PESEL !== null ? res.PESEL : "");
        setAddress(res.address !== null ? res.address : "");
        setCompany(res.companyName !== null ? res.companyName : "");
      }).catch(err => console.log(err));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    const callBackendAPI = async () => {
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/settings/personal',
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

      const settings: PersonalSettings = {
        name: name.trim() !== "" ? name : null,
        surname: surname.trim() !== "" ? surname : null,
        PESEL: pesel.trim() !== "" ? pesel : null,
        address: address.trim() !== "" ? address : null,
        companyName: company.trim() !== "" ? company : null
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
      const response = await fetch(process.env.REACT_APP_API_URL + '/settings/personal', requestOptions);
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
            <h4 className="mb-1 mt-1">Moje dane</h4>
          </li>
          <li className="list-group-item">
            <label className="me-1" htmlFor="name">Imię:</label>
            {editMode ? 
              <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            :
              <span id="name">{name.trim() !== "" ? name : <i>(nieustawione)</i>}</span>
            }
          </li>
          <li className="list-group-item">
            <label className="me-1" htmlFor="surname">Nazwisko:</label>
            {editMode ?
              <input type="text" className="form-control" id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
            :
              <span id="surname">{surname.trim() !== "" ? surname : <i>(nieustawione)</i>}</span>
            }
          </li>
          <li className="list-group-item">
            <label className="me-1" htmlFor="pesel">PESEL:</label>
            {editMode ?
              <input type="text" className="form-control" id="pesel" value={pesel} onChange={(e) => setPESEL(e.target.value)} />
            :
            <span id="pesel">{pesel.trim() !== "" ? pesel : <i>(nieustawiony)</i>}</span>
            }
          </li>
          <li className="list-group-item">
            <label className="me-1" htmlFor="address">Adres:</label>
            {editMode ?
              <input type="text" className="form-control" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            :
              <span id="address">{address.trim() !== "" ? address : <i>(nieustawiony)</i>}</span>
            }
          </li>
          <li className="list-group-item">
            <label className="me-1" htmlFor="company">Nazwa firmy:</label>
            {editMode ?
              <input type="text" className="form-control" id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            :
              <span id="company">{company.trim() !== "" ? company : <i>(nieustawiona)</i>}</span>
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

export default UserDataSettings;
