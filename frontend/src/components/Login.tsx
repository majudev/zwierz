import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";

interface Props {
  loggedIn: string;
  logOut: () => void;
  logIn: (token: string) => void;
}

function Login(props: Props): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
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

  const handleSubmit = async () => {
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

    const settings = {
      email: email,
      password: password,
      webauthn: base64response,
    };

    const requestOptions : RequestInit = {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    };
    const response = await fetch(process.env.REACT_APP_API_URL + '/user/login', requestOptions);
    const token = (await response.headers.get('x-access-token') as string);
    const body = await response.json();

    if (response.status !== 200) {
      setError('Nie udało się zalogować - błędne dane logowania.');
      return;
    }

    props.logIn(token);
    navigate('/sprzedaz');

    return body;
  };

  return (
    <div className='d-flex flex-column mb-3 justify-content-center align-items-center'>
      <div>
        <h1 className="h3 mb-3 fw-normal text-center">Zaloguj się</h1>
        
        {error !== '' && <p>{error}</p>}

        <div className="form-floating">
          <input type="email" className="form-control" id="floatingInput" placeholder="" value={email} onChange={(e) => setEmail(e.target.value)}/>
          <label htmlFor="floatingInput">Email</label>
        </div>
        <div className="form-floating">
          <input type="password" className="form-control" id="floatingPassword" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)}/>
          <label htmlFor="floatingPassword">Hasło</label>
        </div>

        <button className="w-100 btn btn-lg btn-primary" onClick={handleSubmit} disabled={!authSupported}>Zaloguj się</button>
        {!authSupported && <p>Twoja przeglądarka nie wspiera WebAuthn, więc nie możesz się zalogować.</p>}
      </div>
    </div>
  );
}

export default Login;
