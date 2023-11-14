import React, { useState, useEffect } from 'react';
import YubiKeyEntity from './YubiKeyEntity';

interface AuthSettingsInterface {
  email: string;
  password: string;
}

interface Props {
  token: string;
}

const AuthSettings = ({token} : Props) => {
    const [email, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
      callBackendAPI()
      .then(res => {
        setUsername(res.email !== '' ? res.email : "ustaw nazwę użytkownika!");
      }).catch(err => console.log(err));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    const callBackendAPI = async () => {
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/settings/auth',
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

      if(email.trim() === ''){
        throw new Error('Email cannot be empty');
      }
      if(password.trim() === ''){
        throw new Error('Password cannot be empty');
      }
      if(password !== repeatPassword){
        throw new Error('Passwords must match');
      }

      const settings: AuthSettingsInterface = {
        email: email,
        password: password
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
      const response = await fetch(process.env.REACT_APP_API_URL + '/settings/auth', requestOptions);
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
            <h4 className="mb-1 mt-1">Ustawienia logowania</h4>
          </li>
          <li className="list-group-item">
            <label className="me-1" htmlFor="email">Email:</label>
            {editMode ?
              <input type="email" className="form-control" id="email" value={email} onChange={(e) => setUsername(e.target.value)} required />
            :
              <span id="email">{email}</span>
            }
          </li>
          <li className="list-group-item">
            {editMode ?
            <div>
              <label className="me-1" htmlFor="password">Hasło:</label>
              <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <br/>
              <label className="me-1" htmlFor="repeatpassword">Powtórz hasło:</label>
              <input type="password" className="form-control" id="repeatpassword" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
            </div>
            :
            <div>
              <label className="me-1" htmlFor="password">Hasło:</label>
              <span id="password">*****</span>
            </div>
            }
          </li>
          <li className="list-group-item">
            {!editMode ? 
              <button className="btn btn-dark" onClick={(e) => setEditMode(true)}>Edytuj</button>
            :
              <button className="btn btn-dark" onClick={(e) => handleSubmit()}>Zapisz</button>
            }
          </li>
          <li className="list-group-item">
            YubiKey 1:
            <YubiKeyEntity token={token} n={0}/>
          </li>
          <li className="list-group-item">
            YubiKey 2:
            <YubiKeyEntity token={token} n={1}/>
          </li>
          <li className="list-group-item">
            YubiKey 3:
            <YubiKeyEntity token={token} n={2}/>
          </li>
        </ul>
      </div>
    );
  };

export default AuthSettings;