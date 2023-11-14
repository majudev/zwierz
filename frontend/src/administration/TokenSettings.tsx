import React, { useState, useEffect } from 'react';

interface AddSellDialogProps {
  token: string;
}

interface CapEntry {
  capability: string;
  state: boolean;
  editable: boolean;
}

const defaultCaps = [
  {capability: 'sells.add', state: false, editable: false},
  {capability: 'sells.browse', state: false, editable: false},
  {capability: 'invoices.add', state: false, editable: false},
  {capability: 'invoices.browse', state: false, editable: false},
  {capability: 'settings.change', state: false, editable: false},
  {capability: 'settings.browse', state: false, editable: false}
];

function TokenSettings({token} : AddSellDialogProps){
  const [showModal, setShowModal] = useState(false);
  const [lockModal, setLockModal] = useState(false);
  const [capabilities, setCapabilities] = useState<CapEntry[]>(defaultCaps);
  const [newToken, setNewToken] = useState<string>('');
  const [authSupported, setAuthSupported] = useState<boolean>(false);
  const [challenge, setChallenge] = useState<any>(null);

  useEffect(() => {
    const checkWebAuthnSupport = async () => {
      try {
        const isSupported = typeof(PublicKeyCredential) !== "undefined";
        setAuthSupported(isSupported);
      } catch (error) {
        console.error('WebAuthn not supported in this browser.', error);
      }
    };
    checkWebAuthnSupport();
    
    const obtainWebToken = async () => {
      const requestOptionsGet : RequestInit = {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const responseGet = await fetch(process.env.REACT_APP_API_URL + '/user/challenge', requestOptionsGet);
      const loginOptions = await responseGet.json();
  
      if (responseGet.status !== 200) {
        throw Error(loginOptions.message);
      }

      console.log(loginOptions);
      console.log(loginOptions.challenge);

      const binaryString = atob(loginOptions.challenge);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      const challengeArray: ArrayBuffer = uint8Array.buffer;

      const newCredIds = loginOptions.allowCredentials.map((element: any) => {
        const binaryString2 = atob(element.id);
        const uint8Array2 = new Uint8Array(binaryString2.length);
        for (let i = 0; i < binaryString2.length; i++) {
          uint8Array2[i] = binaryString2.charCodeAt(i);
        }
        const credId2: ArrayBuffer = uint8Array2.buffer;
        return { type: element.type, id: credId2 };
      });

      const loginOptionsDecoded = {
        publicKey: {
          ...loginOptions,
          challenge: challengeArray,
          allowCredentials: newCredIds,
        }
      };

      console.log(loginOptionsDecoded);
      setChallenge(loginOptionsDecoded);
    };
    obtainWebToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewToken('');
  };

  const handleAddEntry = () => {
    setCapabilities((prevEntry) => ([
      ...prevEntry,
      {capability: 'cap.id', state: false, editable: true},
    ]));
    console.log(capabilities)
  };

  const handleEntryChange = (index: number, field: string, value: any) => {
    setCapabilities((prevEntry) => {
      return prevEntry.map((entry, i) => {
        if (i === index) {
          return {
            ...entry,
            [field]: value,
          };
        }
        return entry;
      });
    });
  };

  const handleTokenSubmit = async () => {
    setLockModal(true);

    let base64response: any = undefined;
    try{
      const cred = (await navigator.credentials.get(challenge) as PublicKeyCredential);
      const yubi_response = (cred.response as AuthenticatorAssertionResponse);
      base64response = {
        ...cred,
        response: {
          ...yubi_response,
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(yubi_response.authenticatorData))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(yubi_response.clientDataJSON))),
          signature: btoa(String.fromCharCode(...new Uint8Array(yubi_response.signature))),
          userHandle: yubi_response === null ? null : btoa(String.fromCharCode(...new Uint8Array(yubi_response.userHandle as ArrayBuffer))),
        },
        rawId: btoa(String.fromCharCode(...new Uint8Array(cred.rawId)))
      };
      
      console.log(base64response);
    }catch(error){
      console.log(error);
    }

    const caps = capabilities.filter((entry) => {
      return entry.state;
    }).map((entry) => (entry.capability));

    console.log(caps);

    const requestOptions : RequestInit = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify({capabilities: caps, webauthn: base64response})
    };
    const response = await fetch(process.env.REACT_APP_API_URL + '/settings/token', requestOptions);
    const body = await response.json();

    if (response.status !== 200) {
      setLockModal(false);
      throw Error(body.message);
    }
    setNewToken(body.token);
    setLockModal(false);
    setCapabilities(defaultCaps);

    return body;
  };

  const revokeAll = async () => {
    const requestOptions : RequestInit = {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      }
    };
    const response = await fetch(process.env.REACT_APP_API_URL + '/settings/token', requestOptions);
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
  };

  return (
    <>
    <div className="col-lg-4 col-12">
      <ul className="list-group">
        <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
          <h4 className="mb-1 mt-1">Tokeny dostępu</h4>
        </li>
        <li className="list-group-item">
            <button className="btn btn-dark" onClick={handleShowModal}>Dodaj nowy token</button>
        </li>
        <li className="list-group-item">
            <button className="btn btn-danger" onClick={(e) => revokeAll()}>Odwołaj autoryzację wszystkich tokenów (konieczne zalogowanie się ponownie)</button>
        </li>
      </ul>
    </div>
    {showModal && (
      <div className="modal show" tabIndex={-1} role="dialog" style={{ display: 'block' }}>
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nowy token</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Stan</th>
                  </tr>
                </thead>
                <tbody>
                  {capabilities.map((entry, index) => (
                    <tr>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="ID"
                          value={entry.capability}
                          onChange={(e) =>
                            handleEntryChange(index, 'capability', e.target.value)
                          }
                          disabled={!entry.editable}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          placeholder="Stan"
                          checked={entry.state}
                          onChange={(e) =>
                            handleEntryChange(index, 'state', !entry.state)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="btn btn-dark" onClick={handleAddEntry}>
                Dodaj pozycję
              </button>
              {newToken !== '' && <p>Wygenerowany token: {newToken}<br/>Zapisz go, ponieważ nie będzie można go wyświetlić ponownie po zamknięciu tego okna</p>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={handleCloseModal}>
                Zamknij
              </button>
              <button type="button" className="btn btn-dark" onClick={handleTokenSubmit} disabled={lockModal}>
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

export default TokenSettings;
