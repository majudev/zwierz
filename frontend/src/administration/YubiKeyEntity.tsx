import React, { useState, useEffect } from 'react';

interface Props {
  token: string;
  n: number;
}

const YubiKeyEntity = ({token, n} : Props) => {
    const [authSupported, setAuthSupported] = useState<boolean>(false);
    const [credential, setCredential] = useState<boolean>(false);
    
    useEffect(() => {
      checkWebAuthnSupport();
      const callBackendAPI = async () => {
        const response = await fetch(
          process.env.REACT_APP_API_URL + '/settings/auth/yubi/' + n + '/ping',
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

      callBackendAPI()
      .then(res => {
        if(res.status === 'ok') setCredential(true);
      }).catch(err => console.log(err));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Check if WebAuthn is supported in the browser
    const checkWebAuthnSupport = async () => {
      try {
        const isSupported = typeof(PublicKeyCredential) !== "undefined";
        setAuthSupported(isSupported);
      } catch (error) {
        console.error('WebAuthn not supported in this browser.', error);
      }
    };

    // Register a new credential for the user
    const registerWebAuthn = async () => {
      try {
        const requestOptionsGet : RequestInit = {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        };
        const responseGet = await fetch(process.env.REACT_APP_API_URL + '/settings/auth/yubi/' + n + '/register', requestOptionsGet);
        const registrationOptions = await responseGet.json();
    
        if (responseGet.status !== 200) {
          throw Error(registrationOptions.message);
        }

        console.log(registrationOptions);
        console.log(registrationOptions.challenge);

        const binaryString = atob(registrationOptions.challenge);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        const challengeArray: ArrayBuffer = uint8Array.buffer;


        const registrationOptionsDecoded = {
          publicKey: {
            ...registrationOptions,
            challenge: challengeArray,
            user: {
              ...registrationOptions.user,
              id: new TextEncoder().encode(registrationOptions.user.id),
            },
          }
        };

        const cred = (await navigator.credentials.create(registrationOptionsDecoded) as PublicKeyCredential);
        const yubi_response = (cred.response as AuthenticatorAttestationResponse);

        const base64response = {
          ...cred,
          response: {
            ...yubi_response,
            clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(yubi_response.clientDataJSON))),
            attestationObject: btoa(String.fromCharCode(...new Uint8Array(yubi_response.attestationObject))),
          },
          id: cred.id,
          type: cred.type,
          rawId: btoa(String.fromCharCode(...new Uint8Array(cred.rawId)))
        };

        const requestOptions : RequestInit = {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify(base64response),
        };
        const response = await fetch(process.env.REACT_APP_API_URL + '/settings/auth/yubi/' + n + '/register', requestOptions);
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message);
        }

        setCredential(true);
      } catch (error) {
        console.error('WebAuthn registration failed.', error);
      }
    };

    // Authenticate the user with an existing credential
    const authenticateWebAuthn = async () => {
      try {
        const requestOptionsGet : RequestInit = {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        };
        const responseGet = await fetch(process.env.REACT_APP_API_URL + '/settings/auth/yubi/' + n + '/login', requestOptionsGet);
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

        const cred = (await navigator.credentials.get(loginOptionsDecoded) as PublicKeyCredential);
        const yubi_response = (cred.response as AuthenticatorAssertionResponse);
        const base64response = {
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

        const requestOptions : RequestInit = {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify(base64response),
        };
        const response = await fetch(process.env.REACT_APP_API_URL + '/settings/auth/yubi/' + n + '/login', requestOptions);
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message);
        }
      } catch (error) {
        console.error('WebAuthn authentication failed.', error);
      }
    };

    // Register a new credential for the user
    const deleteWebAuthn = async () => {
      try {
        const requestOptionsGet : RequestInit = {
          method: 'DELETE',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        };
        const responseGet = await fetch(process.env.REACT_APP_API_URL + '/settings/auth/yubi/' + n, requestOptionsGet);
        const registrationOptions = await responseGet.json();
    
        if (responseGet.status !== 200) {
          throw Error(registrationOptions.message);
        }

        setCredential(false);
      } catch (error) {
        console.error('WebAuthn registration failed.', error);
      }
    };

    return (
      <div>
        {authSupported ? <>
        {!credential ? 
        <button className="btn btn-dark btn-sm" onClick={registerWebAuthn}>Dodaj YubiKeya</button>
        :
        <>
        <button className="btn btn-dark btn-sm" onClick={authenticateWebAuthn}>Sprawdź czy YubiKey działa</button>
        <button className="btn btn-danger btn-sm" onClick={deleteWebAuthn}>Usuń YubiKeya</button>
        </>
        }
        </> : <>
        <p>Twoja przeglądarka nie wspiera WebAuthn, więc nie masz jak zarządzać YubiKeyami.</p>
        </>}
      </div>
    );
  };

export default YubiKeyEntity;