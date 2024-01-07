import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
}

function PasswordResetStep2(props: Props): JSX.Element {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [captchaSolution, setCaptchaSolution] = useState<number|undefined>(undefined);
  const [captchaQuest, setCaptchaQuest] = useState('');
  const [captchaID, setCaptchaID] = useState(-1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [buttonLock, setButtonLock] = useState(false);

  const { pwdresetkey } = useParams();

  const onChangePasswordAttempt = async function(){
    setButtonLock(true);

    if(password !== password2){
      setError("Hasła nie pasują do siebie");
      setButtonLock(false);
      return;
    }

    const response = await fetch(process.env.REACT_APP_API_URL + "/auth/passwordreset/" + pwdresetkey, {
      method: "POST",
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password,
        captchaId: captchaID,
        captchaAnswer: (captchaSolution === undefined ? 0 : captchaSolution),
      })
    });
    setButtonLock(false);
    if(!response.ok){
      updateCaptchaQuest();
      if(response.status === 409){
        const json = await response.json();
        if(json.message === 'wrong or expired captcha'){
          setError('Nie umiesz liczyć?');
        }else{
          setError(json.message);
        }
      }else if(response.status === 400){
        const json = await response.json();
        if(json.message === "password has to contain: one uppercase letter, one lowercase letter, one special char !@#$%^&*()_+{}[]:;<>,.?~\\- and be at least 8 characters long"){
          setError("Hasło musi zawierać: jedną wielką literę, jedną małą literę, jeden znak specjalny !@#$%^&*()_+{}[]:;<>,.?~\\- i musi mieć przynajmniej 8 znaków");
        }else{
          setError(json.message);
        }
      }else try {
        const json = await response.json();
        if(response.status === 500){
          setError('Błąd wewnętrzny: ' + json.message);
        }else{
          setError(json.message);
        }
      }catch (e){
        setError('unknown error');
      }
    }else{
      setSuccess(true);
    }
  };

  const updateCaptchaQuest = async function() {
    const response = await fetch(process.env.REACT_APP_API_URL + "/auth/captcha", {
      method: "GET",
      mode: 'same-origin'
    });
    if(!response.ok){
      setError('Nie można pobrać captchy z serwera - odśwież stronę lub spróbuj ponownie później.');
      setButtonLock(true);
    }else{
      const captcha = await response.json();
      setCaptchaID(captcha.data.id);
      setCaptchaQuest(captcha.data.challenge);
      // Refresh captcha if it expires soon
      setTimeout(updateCaptchaQuest, (captcha.data.expires - 15) * 1000);
    }
  };

  useEffect(() => {
    updateCaptchaQuest();

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

  return (
    <main>
      <div className="d-flex flex-column mb-3 justify-content-center align-items-center">
        {success && <>
          <h1 className="h3 mb-3 fw-normal text-center">Udało się!</h1>
          <p>Twoje hasło zostało zresetowane. Teraz możesz się zalogować.</p>
        </>}
        {!success && <div>
          <h1 className="h3 mb-3 fw-normal text-center">Zresetuj swoje hasło</h1>
          {(error !== '') && <p className="text-danger text-center">Błąd: {error}</p>}

          <div className="form-floating">
            <input type="password" className="form-control" id="floatingPassword" placeholder="" value={password} onChange={(e) => {setPassword(e.target.value)}} />
            <label htmlFor="floatingPassword">Hasło</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control" id="floatingPassword2" placeholder="" value={password2} onChange={(e) => {setPassword2(e.target.value)}} />
            <label htmlFor="floatingPassword2">Powtórz hasło</label>
          </div>
          <div className="form-floating">
            <input type="number" className="form-control" id="captcha" placeholder="" value={captchaSolution} onChange={(e) => {setCaptchaSolution(Number.parseInt(e.target.value))}} />
            <label htmlFor="captcha">{captchaQuest}</label>
          </div>

          <button className="w-100 btn btn-lg btn-primary" disabled={buttonLock} onClick={onChangePasswordAttempt} id="submit">Zresetuj hasło</button>
        </div>}
      </div>
    </main>
  );
}

export default PasswordResetStep2;
