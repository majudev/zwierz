import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import 'bootstrap/js/src/modal';

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  mode: SystemMode;
}

function Appointments({mode}: Props): JSX.Element {

  const [trialHOInitialized, setTrialHOInitialized] = useState(false);
  const [trialHRInitialized, setTrialHRInitialized] = useState(false);

  const [registerAppointmentID, setRegisterAppointmentID] = useState(0);
  const [registerAppointmentDate, setRegisterAppointmentDate] = useState(new Date());
  const [registerAppointmentIntent, setRegisterAppointmentIntent] = useState<'OPEN_TRIAL'|'CLOSE_TRIAL'|'EDIT_TRIAL'|'CUSTOM'|'select'>('select');
  const [registerAppointmentCustomIntent, setRegisterAppointmentCustomIntent] = useState('');
  const [registerAppointmentMessage, setRegisterAppointmentMessage] = useState('');
  const [registerAppointmentType, setRegisterAppointmentType] = useState<'select'|'ho'|'hr'>('select');
  const [registerAppointmentLockHO, setRegisterAppointmentLockHO] = useState(true);
  const [registerAppointmentLockHR, setRegisterAppointmentLockHR] = useState(true);
  const [registerAppointmentButtonlock, setRegisterAppointmentButtonlock] = useState(false);

  const [appointments, setAppointments] = useState<Array<{id: number, date: Date, description: string, slotsHO: number, slotsHR: number, registrationsHO: number, registrationsHR: number, locked: boolean, registrations: Array<{id: number, intent: string, customIntent: string|null, message: string|null, type: TrialType}>}>>([]);

  const navigate = useNavigate();

  useEffect(() => {
    refreshAppointments();
    refreshTrialsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAppointments = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/me", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch appointments list');
      return;
    }
    const body = await response.json() as {status:string; data: Array<{id: number, date: string, description: string, slots_HO: number, slots_HR: number, registrationsHO: number, registrationsHR: number, locked: boolean, registrations: Array<{id: number, intent: string, customIntent: string|null, message: string|null, type: TrialType}>}>};
    setAppointments(body.data.map((e) => {return {...e, date: new Date(e.date), slotsHO: e.slots_HO, slotsHR: e.slots_HR}}));
  }

  const refreshTrialsData = async function(){
    fetch(process.env.REACT_APP_API_URL + "/trial/me/ho", {
      method: "GET",
      mode: 'same-origin',
    }).then((response) => {
      setTrialHOInitialized(response.ok);
    }).catch((reason) => {
      setTrialHOInitialized(false);
    });

    fetch(process.env.REACT_APP_API_URL + "/trial/me/hr", {
      method: "GET",
      mode: 'same-origin',
    }).then((response) => {
      setTrialHRInitialized(response.ok);
    }).catch((reason) => {
      setTrialHRInitialized(false);
    });
  }

  const onRegistrationAttempt = async function(){
    setRegisterAppointmentButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/register/" + registerAppointmentType, {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId: registerAppointmentID,
        intent: registerAppointmentIntent,
        customIntent: registerAppointmentCustomIntent !== '' ? registerAppointmentCustomIntent : null,
        message: registerAppointmentMessage !== '' ? registerAppointmentMessage : null,
      })
    });
    setRegisterAppointmentButtonlock(false);
    document.getElementById('close_register_modal')?.click();
    if(!response.ok){
      alert('Cannot register to the appointment');
      return;
    }
    refreshAppointments();
  };

  const onUnregistrationAttempt = async function(trialType: TrialType, appointmentId: number){
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/unregister/" + trialType.toLowerCase() + "/" + appointmentId, {
      method: 'DELETE',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      }
    });
    if(!response.ok){
      alert('Cannot unregister from the appointment');
      return;
    }
    refreshAppointments();
  };

  const intentTranslator = function(registration: {intent: string; customIntent: string | null;}){
    if(registration.intent === 'OPEN_TRIAL'){
      return 'otwarcia próby';
    }else if(registration.intent === 'EDIT_TRIAL'){
      return 'zmiany zadań w próbie';
    }else if(registration.intent === 'CLOSE_TRIAL'){
      return 'zamknięcia próby';
    }else if(registration.intent === 'CUSTOM'){
      return registration.customIntent;
    }
  }

  return (<>
    <main className="container-fluid">
      <div className="row justify-content-center">
        <div className={mode !== SystemMode.HO_HR ? "col-lg-8 col-sm-12" : "col-lg-9 col-sm-12"}>
          <div className="p-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Lista spotkań</h4>
              </li>
              <li className="list-group-item">
                <div className="table-responsive-sm">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col" className="nowrap">Data</th>
                        <th scope="col" className="text-center longrecord">Czas trwania</th>
                        {mode !== SystemMode.HO_HR && <th scope="col" className="nowrap text-center">Wolne miejsca</th>}
                        {mode === SystemMode.HO_HR && <>
                        <th scope="col" className="nowrap text-center">Wolne miejsca HO</th>
                        <th scope="col" className="nowrap text-center">Wolne miejsca HR</th>
                        </>}
                        <th></th>
                      </tr>
                    </thead>
                    <tbody id="appointment_table">
                      {
                        appointments.map((appointment) => {
                          const freeHO = appointment.slotsHO - appointment.registrationsHO;
                          const freeHR = appointment.slotsHR - appointment.registrationsHR;
                          const regsHO = appointment.registrations.filter((reg) => {return reg.type === TrialType.HO});
                          const regsHR = appointment.registrations.filter((reg) => {return reg.type === TrialType.HR});
                          return <tr>
                            <td className="nowrap" scope="row">{appointment.date.getDate() + '.' + ((appointment.date.getMonth() + 1) >= 10 ? (appointment.date.getMonth() + 1) : '0' + (appointment.date.getMonth() + 1)) + '.' + appointment.date.getFullYear()}</td>
                            <td>
                              <p>{appointment.description}</p>
                              {regsHO.length > 0 && <p>
                                Jesteś zapisany na to spotkanie ze swoją próbą na stopień Harcerza Orlego w celu {intentTranslator(regsHO[0])}.<br/>
                                {regsHO[0].message !== null && <>Wiadomość dla kapituły: {regsHO[0].message}<br/></>}
                                <button className="btn btn-sm btn-danger" onClick={(e) => onUnregistrationAttempt(TrialType.HO, appointment.id)}>Usuń rejestrację</button>
                              </p>}
                              {regsHR.length > 0 && <p>
                                Jesteś zapisany na to spotkanie ze swoją próbą na stopień Harcerza Rzeczypospolitej w celu {intentTranslator(regsHR[0])}.<br/>
                                {regsHR[0].message !== null && <>Wiadomość dla kapituły: {regsHR[0].message}<br/></>}
                                <button className="btn btn-sm btn-danger" onClick={(e) => onUnregistrationAttempt(TrialType.HR, appointment.id)}>Usuń rejestrację</button>
                              </p>}
                              {appointment.locked && <p>To spotkanie jest zablokowane i nie można się na nie zapisać.</p>}
                            </td>
                            {(mode === SystemMode.HO_HR || mode === SystemMode.HO) && <td className="text-center nowrap">{freeHO} z {appointment.slotsHO}</td>}
                            {(mode === SystemMode.HO_HR || mode === SystemMode.HR) && <td className="text-center nowrap">{freeHR} z {appointment.slotsHR}</td>}
                            <td className="nowrap">
                              <button type="button" className="btn btn-dark" onClick={(e) => {setRegisterAppointmentID(appointment.id); setRegisterAppointmentDate(appointment.date); setRegisterAppointmentIntent('select'); setRegisterAppointmentCustomIntent(''); setRegisterAppointmentMessage(''); setRegisterAppointmentLockHO(mode === SystemMode.HR || freeHO === 0); setRegisterAppointmentLockHR(mode === SystemMode.HO || freeHR === 0); setRegisterAppointmentType('select'); document.getElementById('open_register_modal')?.click();}} disabled={(freeHO === 0 && freeHR === 0) || appointment.locked}>Zapisz się</button>
                            </td>
                          </tr>
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
    <button type="button" className="btn" id="open_register_modal" data-bs-toggle="modal" data-bs-target="#register_modal" style={{display: 'none'}}></button>
    <button type="button" className="btn" id="close_register_modal" data-bs-dismiss="modal" data-bs-target="#register_modal" style={{display: 'none'}}></button>
    <div className="modal fade" id="register_modal" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Wybierz cel spotkania</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Spotkanie {registerAppointmentDate.getDate() + '.' + ((registerAppointmentDate.getMonth() + 1) >= 10 ? (registerAppointmentDate.getMonth() + 1) : '0' + (registerAppointmentDate.getMonth() + 1)) + '.' + registerAppointmentDate.getFullYear()}</p>
            <p>
              Stopień którego dotyczy spotkanie: <select className="form-control" value={registerAppointmentType} onChange={(e) => setRegisterAppointmentType(e.target.value as "select" | "ho" | "hr")}>
                <option value='select' disabled>Wybierz stopień</option>
                <option value='ho' disabled={registerAppointmentLockHO || !trialHOInitialized}>Harcerz Orli</option>
                <option value='hr' disabled={registerAppointmentLockHR || !trialHRInitialized}>Harcerz Rzeczypospolitej</option>
              </select>
              {(mode === SystemMode.HO || mode === SystemMode.HO_HR) && !trialHOInitialized && <span className="text-danger">Twoja próba na HO nie jest wprowadzona do systemu, więc nie możesz zarejestrować się z nią na spotkanie.</span>}
              {(mode === SystemMode.HR || mode === SystemMode.HO_HR) && !trialHRInitialized && <span className="text-danger">Twoja próba na HR nie jest wprowadzona do systemu, więc nie możesz zarejestrować się z nią na spotkanie.</span>}
            </p>
            <p>
              Cel spotkania: <select className="form-control" value={registerAppointmentIntent} onChange={(e) => setRegisterAppointmentIntent(e.target.value as 'OPEN_TRIAL'|'CLOSE_TRIAL'|'EDIT_TRIAL'|'CUSTOM'|'select')}>
                <option value='select' disabled>Wybierz powód</option>
                <option value='OPEN_TRIAL'>Otwarcie stopnia</option>
                <option value='CLOSE_TRIAL'>Zamknięcie stopnia</option>
                <option value='EDIT_TRIAL'>Zmiana zadań (najpierw napisz maila - może nie będziesz musiał przychodzić)</option>
                <option value='CUSTOM'>Inne</option>
              </select>
            </p>
            {registerAppointmentIntent === 'CUSTOM' && <p>
              Wyjaśnij, po co chcesz się zapisać:
              <input type="text" className="form-control" value={registerAppointmentCustomIntent} onChange={(e) => {setRegisterAppointmentCustomIntent(e.target.value)}}/>
            </p>}
            <p>
              Dodatkowa wiadomość dla kapituły:
              <textarea className="form-control" value={registerAppointmentMessage} onChange={(e) => setRegisterAppointmentMessage(e.target.value)} placeholder='To pole może być puste. Jeśli chcesz, wpisz tu np. że preferujesz być pierwszy lub ostatni na danej kapitule.'></textarea>
            </p>
            {((registerAppointmentLockHO || !trialHOInitialized) && registerAppointmentType === 'ho') &&
              <p><span className="text-danger">Jesteś już zapisany na tą kapitułę w sprawie stopnia Harcerza Orlego.</span> Możesz zapisać się ze stopniem Harcerza Rzeczypospolitej.</p>
            }
            {((registerAppointmentLockHR || !trialHRInitialized) && registerAppointmentType === 'hr') &&
              <p><span className="text-danger">Jesteś już zapisany na tą kapitułę w sprawie stopnia Harcerza Orlego.</span></p>
            }
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-dark" onClick={(e) => onRegistrationAttempt()} disabled={registerAppointmentIntent === 'select' || registerAppointmentType === 'select' || registerAppointmentButtonlock || ((registerAppointmentLockHO || !trialHOInitialized) && registerAppointmentType === 'ho') || ((registerAppointmentLockHR || !trialHRInitialized) && registerAppointmentType === 'hr')}>Zapisz się</button>
          </div>
        </div>
      </div>
    </div>
  </>);
}

export default Appointments;
