import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import 'bootstrap/js/src/modal';
import { toHaveFormValues } from '@testing-library/jest-dom/matchers';

function SystemModeConfig(): JSX.Element {
  const [mode, setMode] = useState<SystemMode>(SystemMode.HO);
  const [newMode, setNewMode] = useState<SystemMode>(SystemMode.HO);

  const [buttonlock, setButtonlock] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    refreshMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshMode = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/administrative/mode", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch mode');
      return;
    }
    const body = await response.json();
    setMode(body.data);
  }

  const onModeChangeAttempt = async function(){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/administrative/mode", {
      method: "PATCH",
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: newMode
      }),
    });
    if(!response.ok){
      alert('Cannot change mode');
      setButtonlock(false);
      return;
    }
    window.location.reload();
  }

  return (<>
    <div className="col-lg-4 col-sm-12">
      <div className="p-3">
        <ul className="list-group">
          <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 className="mb-1 mt-1">Tryb systemu</h4>
          </li>
          <li className="list-group-item">
            <b>Tryb kapituły:</b> {
              (mode === SystemMode.HO) ? 
              <>Kapituła HO</>
              :
              (mode === SystemMode.HR) ?
              <>Kapituła HR</>
              :
              (mode === SystemMode.HO_HR) ?
              <>Kapituła HO i HR</>
              :
              <>nieznany tryb</>
            }
          </li>
          <li className="list-group-item d-flex justify-content-end flex-row">
            <button type="button" className="btn btn-danger" id="open_mode_change_modal" data-bs-toggle="modal" data-bs-target="#mode_change_modal" disabled={buttonlock}>Zmień tryb</button>
          </li>
        </ul>
      </div>
    </div>
    <button type="button" className="btn" id="close_mode_change_modal" data-bs-dismiss="modal" data-bs-target="#mode_change_modal" style={{display: 'none'}}></button>
    <div className="modal modal-lg fade" id="mode_change_modal" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Zmiana trybu systemu</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>
              Zmieniasz tryb systemu. Możliwe zmiany:
              <ul>
                <li>{'HO -> HO+HR'}</li>
                <li>{'HR -> HO+HR'}</li>
                <li>{'HO -> HR (próby na HO będą zachowane w systemie, ale nie będą już widoczne)'}</li>
                <li>{'HR -> HO (próby na HR będą zachowane w systemie, ale nie będą już widoczne)'}</li>
                <li>{'HO+HR -> HR (próby na HO będą zachowane w systemie, ale nie będą już widoczne)'}</li>
                <li>{'HO+HR -> HO (próby na HR będą zachowane w systemie, ale nie będą już widoczne)'}</li>
              </ul>
            </p>
            <select className="form-control" value={newMode} onChange={(e) => setNewMode(e.target.value as SystemMode)}>
              <option value={SystemMode.HO}>HO</option>
              <option value={SystemMode.HR}>HR</option>
              <option value={SystemMode.HO_HR}>HO+HR</option>
            </select>
            { ((mode === SystemMode.HO && newMode === SystemMode.HR) || (mode === SystemMode.HO_HR && newMode === SystemMode.HR)) &&
              <p className="text-danger">Próby na stopień Harcerza Orlego nie zostaną skasowane z systemu, ale nie będą już widoczne ani dla kandydatów, ani dla kapituły. Jeżeli w przyszłości zostanie wybrany tryb HO+HR lub HO, próby znów będą widoczne zarówno dla kandydatów, jak i dla kapituły.</p>
            }
            { ((mode === SystemMode.HR && newMode === SystemMode.HO) || (mode === SystemMode.HO_HR && newMode === SystemMode.HO)) &&
              <p className="text-danger">Próby na stopień Harcerza Rzeczypospolitej nie zostaną skasowane z systemu, ale nie będą już widoczne ani dla kandydatów, ani dla kapituły. Jeżeli w przyszłości zostanie wybrany tryb HO+HR lub HR, próby znów będą widoczne zarówno dla kandydatów, jak i dla kapituły.</p>
            }
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-danger" onClick={(e) => onModeChangeAttempt()} disabled={buttonlock || mode === newMode}>Zmień tryb</button>
          </div>
        </div>
      </div>
    </div>
  </>);
}

export default SystemModeConfig;
