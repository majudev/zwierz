import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Login(props: Props): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [activationError, setActivationError] = useState('');
  const [buttonLock, setButtonLock] = useState(false);
  const navigate = useNavigate();

  const query = useQuery();

  useEffect(() => {
    if(query.get("activate") === 'success'){
      setActivationError('success');
    }else if(query.get("activate") === 'error'){
      setActivationError(query.get("message") as string);
    }

    // Submit form using Enter key
    const listener = (event: KeyboardEvent) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        document.getElementById('submit')?.click();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLoginAttempt = async function(){
    setButtonLock(true);

    const response = await fetch(process.env.REACT_APP_API_URL + "/auth/login", {
      method: "POST",
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        //rememberMe: rememberMe,
      })
    });
    setButtonLock(false);
    if(!response.ok){
      if(response.status === 401){
        setError('Błędny login lub hasło');
      }else try {
        const json = await response.json();
        setError(json.message);
      }catch (e){
        setError('unknown error');
      }
    }else{
      navigate('/profile');
    }
  };

  return (
    <main>
      <div className="d-flex flex-column mb-3 justify-content-center align-items-center">
        <div>
          <img className="mb-4 login-img" src={process.env.REACT_APP_API_URL + "/static/login-image"} />
          <h1 className="h3 mb-3 fw-normal text-center">Zaloguj się</h1>
          {(error !== '') && <p className="text-danger text-center">Błąd: {error}</p>}
          {(activationError !== '' && activationError !== 'success') && <p className="text-danger text-center">Błąd aktywacji twojego konta: {activationError}</p>}
          {(activationError === 'success') && <p className="text-success text-center">Udało się aktywować twoje konto! Możesz się teraz zalogować</p>}

          <div className="form-floating">
            <input type="email" className="form-control" id="floatingInput" placeholder="" value={email} onChange={(e) => {setEmail(e.target.value)}} />
            <label htmlFor="floatingInput">Email</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control" id="floatingPassword" placeholder="" value={password} onChange={(e) => {setPassword(e.target.value)}} />
            <label htmlFor="floatingPassword">Hasło</label>
          </div>

          {/*<div className="checkbox mb-3">
            <input type="checkbox" name="remember-me" id="rememberMeCheckbox" checked={rememberMe} onChange={(e) => {setRememberMe(e.target.checked)}} />
            <label htmlFor="rememberMeCheckbox">Nie wylogowywuj mnie </label>
          </div>*/}
          <button className="w-100 btn btn-lg btn-primary" disabled={buttonLock} onClick={onLoginAttempt} id="submit">Zaloguj się</button>
          <p className="mt-3 text-center">Nie masz konta? <Link to="/register">Zarejestruj się</Link>.</p>
          <p className="mt-3 text-center">Zapomniałeś hasła? <Link to="/passwordreset">Zresetuj je</Link>.</p>
        </div>
      </div>
    </main>
  );
}

export default Login;
