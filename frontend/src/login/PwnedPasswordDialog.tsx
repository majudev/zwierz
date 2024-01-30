import React, {useState, useEffect, useId} from 'react';
import { Link, useNavigate } from "react-router-dom";

interface Props {
  visible: boolean;
}

function PwnedPasswordDialog({visible}: Props): JSX.Element {
  const id = useId();

  const [buttonlock, setButtonLock] = useState(false);

  useEffect(() => {
    if(visible){
      document.getElementById(id + '_open')?.click();
      setButtonLock(true);
      setTimeout(() => {
        setButtonLock(false);
      }, 3000);
    }else{
      document.getElementById(id + '_close')?.click();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (<>
    <button type="button" className="btn" id={id + '_open'} data-bs-toggle="modal" data-bs-target={'#' + id.replaceAll(':', '\\:')} style={{display: 'none'}}></button>
    <button type="button" className="btn" id={id + '_close'} data-bs-dismiss="modal" data-bs-target={'#' + id.replaceAll(':', '\\:')} style={{display: 'none'}}></button>
    <div className="modal fade" id={id} data-bs-backdrop="static" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Zhackowane hasło</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" disabled={buttonlock}></button>
          </div>
          <div className="modal-body">
            <p><b className='text-danger'>Twoje hasło jest na liście zhackowanych haseł!</b></p>
            <p>Portal <a className="alert-link" href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer">Have I Been Pwned</a> gromadzi hasła które wyciekły z różnych portali. Zwierz automatycznie sprawdza, czy Twoje hasło nie znajduje się na tej liście wykradzionych haseł. Niestety, Twoje hasło <span className="text-danger">znajduje się na liście wykradzionych haseł</span>.</p>
            <p>Nie pozwolimy Ci założyć konta używając tego hasła. Wybierz jakieś inne.</p>
            <p>Jeżeli używasz tego hasła w innym miejscu, zmień je.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-dark" data-bs-dismiss="modal" disabled={buttonlock}>Zamknij</button>
          </div>
        </div>
      </div>
    </div>
  </>);
}

export default PwnedPasswordDialog;
