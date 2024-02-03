import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager } from '../types';
import { verifyPhone } from '../utils';
import FullscreenSpinner from '../components/FullscreenSpinner';

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  trigger: boolean;
  pullTrigger: (x: boolean) => void;
}

function Profile(props: Props): JSX.Element {
  const [ready, setReady] = useState(false);

  const [id, setID] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rank, setRank] = useState<Rank>(Rank.NONE);
  const [roleHO, setRoleHO] = useState<CommiteeRole>(CommiteeRole.NONE);
  const [roleHR, setRoleHR] = useState<CommiteeRole>(CommiteeRole.NONE);
  const [uberadmin, setUberadmin] = useState<boolean>(false);
  const [phone, setPhone] = useState('');
  const [teamID, setTeamID] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [interests, setInterests] = useState<Array<string>>([]);
  const [fn, setFn] = useState('');
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(false);
  const [enableSMSNotifications, setEnableSMSNotifications] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sso, setSSO] = useState<SSOManager>(SSOManager.LOCAL);
  const [disabled, setDisabled] = useState(false);
  const [shadow, setShadow] = useState(false);
  const [trialsCount, setTrialsCount] = useState(0);
  const [trialHO, setTrialHO] = useState<{open_date: Date|null, close_date: Date|null, predicted_closing_date: Date}|null>(null);
  const [trialHR, setTrialHR] = useState<{open_date: Date|null, close_date: Date|null, predicted_closing_date: Date}|null>(null);

  const [teams, setTeams] = useState<Array<{id: number, name: string, archived: boolean}>>([]);

  const [editmode, setEditmode] = useState(false);
  const [buttonlock, setButtonLock] = useState(false);

  const [phoneChanged, setPhoneChanged] = useState(false);
  const [phoneVerifyLock, setPhoneVerifyLock] = useState(false);
  const [phoneVerifyCode, setPhoneVerifyCode] = useState('');
  const [phoneVerifyError, setPhoneVerifyError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
    refreshTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/me", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch user details');
      return;
    }
    if(!ready) setReady(true);

    const body = await response.json();
    setID(body.data.id);
    if(body.data.name !== null) setName(body.data.name);
    setEmail(body.data.email);
    setRank(body.data.rank);
    setRoleHO(body.data.role_HO);
    setRoleHR(body.data.role_HR);
    setUberadmin(body.data.uberadmin);
    if(body.data.phone !== null) setPhone(body.data.phone);
    if(body.data.team.id !== null) setTeamID(body.data.team.id);
    if(body.data.team.name !== null) setTeamName(body.data.team.name);
    setInterests((body.data.interests as Array<{text: string}>).map(e => e.text));
    setFn(body.data.function);
    setEnableEmailNotifications(body.data.enableEmailNotifications);
    setEnableSMSNotifications(body.data.enableSMSNotifications);
    setPhoneVerified(body.data.phoneVerified);
    setSSO(body.data.sso);
    setDisabled(body.data.disabled);
    setShadow(body.data.shadow);
    setTrialsCount(body.data.trials.length);
    const ho = (body.data.trials as Array<{type: TrialType, open_date: Date|null, close_date: Date|null, predicted_closing_date: Date}>).filter((value) => {return value.type === TrialType.HO});
    const hr = (body.data.trials as Array<{type: TrialType, open_date: Date|null, close_date: Date|null, predicted_closing_date: Date}>).filter((value) => {return value.type === TrialType.HR});
    if(ho.length === 1) setTrialHO({
      close_date: ho[0].close_date !== null ? new Date(ho[0].close_date) : null,
      open_date: ho[0].open_date !== null ? new Date(ho[0].open_date) : null,
      predicted_closing_date: new Date(ho[0].predicted_closing_date),
    });
    if(hr.length === 1) setTrialHR({
      close_date: hr[0].close_date !== null ? new Date(hr[0].close_date) : null,
      open_date: hr[0].open_date !== null ? new Date(hr[0].open_date) : null,
      predicted_closing_date: new Date(hr[0].predicted_closing_date),
    });

    setPhoneChanged(false);
  }

  const refreshTeams = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/team/all", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch teams list');
      return;
    }
    const body = await response.json();
    setTeams(body.data);
    if(teamID === 0){
      setTeamID(body.data[0].id);
    }
  }

  const onUpdateAttempt = async function(){
    setButtonLock(true);

    const response = await fetch(process.env.REACT_APP_API_URL + "/user/" + id, {
      method: "PATCH",
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        rank: rank,
        phone: phoneChanged ? phone : undefined,
        interests: interests.map((value) => {return {text: value}}),
        teamId: teamID,
        function: fn,
        
        enableEmailNotifications: enableEmailNotifications,
        enableSMSNotifications: enableSMSNotifications,
      })
    });
    setButtonLock(false);
    refreshData();
    if(!response.ok){
      alert('Cannot update details');
      return;
    }
    props.pullTrigger(!props.trigger);
    setEditmode(false);
  };

  const sendPhoneVerifyCode = async function() {
    setPhoneVerifyLock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/auth/phoneverify", {
      method: "POST",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot send phone verify code');
      setPhoneVerifyLock(false);
      return;
    }
    setTimeout(() => {
      setPhoneVerifyLock(false);
    }, 10000);
  }

  const onVerifyPhoneAttempt = async function() {
    setButtonLock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/auth/phoneverify/" + phoneVerifyCode, {
      method: "POST",
      mode: 'same-origin',
    });
    if(!response.ok){
      if(response.status === 403){
        setPhoneVerifyError('Niepoprawny kod');
        setButtonLock(false);
        return;
      }
      alert('Cannot send phone verify code');
      setButtonLock(false);
      return;
    }
    await refreshData();
    setButtonLock(false);
    document.getElementById('close_phoneverify_modal')?.click();
  }

  const nameConverter = function() {
    if(rank === Rank.NONE) return 'dh ' + name;
    else if(rank === Rank.MLODZIK) return 'mł. ' + name;
    else if(rank === Rank.WYWIADOWCA) return 'wyw. ' + name;
    else if(rank === Rank.CWIK) return 'ćw. ' + name;
    else if(rank === Rank.HO) return 'HO ' + name;
    else if(rank === Rank.PWD_HO) return 'pwd. ' + name + ' HO';
    else if(rank === Rank.HR) return 'HR ' + name;
    else if(rank === Rank.PWD_HR) return 'pwd. ' + name + ' HR';
    else if(rank === Rank.PHM_HR) return 'phm. ' + name + ' HR';
    else if(rank === Rank.HM_HR) return 'hm. ' + name + ' HR';
    else return name;
  }

  const runTutorial = function() {
    return name === '' ||
    phone === '' ||
    interests.length === 0 ||
    fn === '' ||
    teamName === '';
  }

  return (<>
    <main className="container-fluid">
      {!ready ? <FullscreenSpinner />
      :
      <div className="row">
        <div className="col-lg-6 col-sm-12">
          <div className="p-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Informacje o Tobie</h4>
              </li>
              {runTutorial() && <li className="list-group-item bg-danger text-center">
                <b>Aby kontynuować, kliknij "edytuj" i uzupełnij poniższe dane.</b>
              </li>}
              <li className="list-group-item">
                {!editmode && <><b>Imię i nazwisko:</b> {nameConverter()}</>}
                {editmode && <>
                  <b>Imię i nazwisko:</b>
                  <div className="input-group">
                    <select className="form-select" value={rank} onChange={(e) => setRank(e.target.value as Rank)} style={{maxWidth: "9rem"}}>
                      <option value={Rank.NONE}>druh</option>
                      <option value={Rank.MLODZIK}>młodzik</option>
                      <option value={Rank.WYWIADOWCA}>wywiadowca</option>
                      <option value={Rank.CWIK}>ćwik</option>
                      <option value={Rank.HO}>HO</option>
                      <option value={Rank.PWD_HO}>pwd. HO</option>
                      <option value={Rank.HR}>HR</option>
                      <option value={Rank.PWD_HR}>pwd. HR</option>
                      <option value={Rank.PHM_HR}>phm. HR</option>
                      <option value={Rank.HM_HR}>hm. HR</option>
                    </select>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </>}
              </li>
              <li className="list-group-item">
                <b>E-mail:</b> {email}
              </li>
              <li className="list-group-item">
                {!editmode && <><b>Telefon:</b> {phone}{(phone !== '') && !phoneVerified && <><span className="text-danger"> (niezweryfikowany)</span><button className="btn btn-sm btn-dark" data-bs-toggle="modal" data-bs-target="#phoneverify_modal">Zweryfikuj</button></>}</>}
                {editmode && <>
                  <b>Telefon:</b>
                  <input type="text" className={verifyPhone(phone) ? "form-control" : "form-control invalid"} value={phone} onChange={(e) => {setPhone(e.target.value); setPhoneChanged(true);}}/>
                  {!verifyPhone(phone) && <i>Zacznij od +48</i>}
                </>}
              </li>
              <li className="list-group-item">
                {!editmode && <><b>Drużyna:</b> {teamName}</>}
                {editmode && <>
                  <b>Drużyna:</b>
                  <select className="form-select" value={teamID} onChange={(e) => setTeamID(Number.parseInt(e.target.value))}>
                    {
                      teams.map((value) => {
                        return <option value={value.id} disabled={value.archived}>{value.name}</option>
                      })
                    }
                  </select>
                </>}
              </li>
              <li className="list-group-item">
                {!editmode && <><b>Funkcja:</b> {fn}</>}
                {editmode && <>
                  <b>Funkcja:</b>
                  <input type="text" className="form-control" value={fn} onChange={(e) => setFn(e.target.value)}/>
                </>}
              </li>
              <li className="list-group-item">
                <b>Zainteresowania:</b>
                <ul>
                  {
                    interests.map((interest, index, array) => {
                      if(!editmode)
                        return <li>{interest}</li>;
                      else
                        return <li><input type="text" className="form-control" value={interest} onChange={(e) => {var newArray = [...interests]; newArray[index] = e.target.value; setInterests(newArray)}}/></li>
                    })
                  }
                  {editmode && <li><button className="btn btn-sm btn-dark" onClick={(e) => {setInterests([...interests, ''])}}>Dodaj kolejne</button></li>}
                </ul>
              </li>
              <li className="list-group-item">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="emailNofiticationsEnabled" checked={enableEmailNotifications} onChange={(e) => {setEnableEmailNotifications(e.target.checked)}} disabled={!editmode}></input>
                  <label className="form-check-label" htmlFor="emailNofiticationsEnabled">
                    Włącz powiadomienia e-mail
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="smsNofiticationsEnabled" checked={enableSMSNotifications} onChange={(e) => {setEnableSMSNotifications(e.target.checked)}} disabled={!editmode || !phoneVerified}></input>
                  <label className="form-check-label" htmlFor="smsNofiticationsEnabled">
                    Włącz powiadomienia SMS
                  </label>
                </div>
                {editmode && <>
                  <p>Powiadomienia e-mail otrzymasz na temat:</p>
                  <ul>
                    <li>Zapisania się na spotkanie</li>
                    <li>Usunięcia się ze spotkania</li>
                    <li className="text-danger">Usunięcia cię przez kapitułę ze spotkania</li>
                    <li style={{textDecoration: "line-through"}}>Zamknięcia i otwarcia stopnia rozkazem</li>
                    <li>Jeśli jesteś opiekunem: gdy twój podopieczny zapisze się lub zostanie usunięty ze spotkania</li>
                  </ul>
                  <p>Powiadomienia SMS otrzymasz na temat:</p>
                  <ul>
                    <li>Nadchodzącego spotkania na które się zapisałeś</li>
                    <li className="text-danger">Usunięcia cię przez kapitułę ze spotkania</li>
                    <li>Jeśli jesteś opiekunem: gdy twój podopieczny zapisze się lub zostanie usunięty ze spotkania</li>
                  </ul>
                </>}
              </li>
              <li className="list-group-item d-flex justify-content-end flex-row">
                {!editmode && <button type="button" className="btn btn-dark" onClick={(e) => setEditmode(true)} disabled={buttonlock}>Edytuj</button>}
                {editmode && <>
                  <button type="button" className="btn btn-dark" onClick={onUpdateAttempt} disabled={buttonlock || !verifyPhone(phone)}>Zapisz</button>
                  <button type="button" className="btn btn-light" onClick={(e) => {setEditmode(false); refreshData();}} disabled={buttonlock}>Anuluj</button>
                </>}
              </li>
            </ul>
          </div>
        </div>
        {(!runTutorial() && (roleHO === CommiteeRole.NONE || roleHR === CommiteeRole.NONE)) &&
        <div className="col-lg-6 col-sm-12">
          <div className="p-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Twój progress</h4>
              </li>
              {(trialsCount === 0) && <li className="list-group-item">
                <b>Halo! Musisz najpierw otworzyć próbę!</b> Przejdź do zakładki "Moja próba" aby to zrobić.
              </li>}
              {(trialsCount !== 0) && <li className="list-group-item text-center">
                <b>Wprowadziłeś próbę do systemu!</b> Dobra robota. Teraz przejdź do zakładki <i>"Moje spotkania z kapitułą"</i> aby zapisać się na spotkanie i otworzyć swoją próbę!
              </li>}
              {/*<li className="list-group-item">
                <b>Progress próby:</b> <div style={{display:"inline"}}>trwa już 3 miesiące (z 11)</div>
                <div className="progress" id="trial_progress_progressbar_wrapper">
                  <div id="trial_progress_progressbar" className="progress-bar bg-dark" role="progressbar" style={{width: "35%"}}></div>
                </div>
              </li>
              <li className="list-group-item" id="trial_progress_timeleft_entry">
                <b>Czas do końca próby:</b> 7 miesięcy
              </li>*/}
              {(trialHO !== null) && <li className="list-group-item" id="trial_opening_entry">
                {trialHO.open_date === null && <p><b>Kapituła jeszcze nie otworzyła próby na HO</b></p>}
                {trialHO.open_date !== null && <p><b>Otwarto próbę na HO:</b> {(trialHO.open_date.getDate()+1) + "." + (trialHO.open_date.getMonth()+1) + "." + trialHO.open_date.getFullYear()}</p>}
                {trialHO.close_date !== null && <p><b>Zamknięto próbę na HO:</b> {(trialHO.close_date.getDate()+1) + "." + (trialHO.close_date.getMonth()+1) + "." + trialHO.close_date.getFullYear()}</p>}
                {trialHO.close_date === null && <p><b>Spodziewane zamknięcie próby:</b> {trialHO.predicted_closing_date.getDate() + "." + (trialHO.predicted_closing_date.getMonth()+1) + "." + trialHO.predicted_closing_date.getFullYear()}</p>}
                {(trialHO.close_date === null && trialHO.open_date !== null) && 
                  <div className="progress">
                    <div className="progress-bar bg-dark" role="progressbar" style={{width: (((new Date()).getTime()-trialHO.open_date.getTime())/(trialHO.predicted_closing_date.getTime()-trialHO.open_date.getTime()) % 1)*100 + "%"}}></div>
                  </div>
                }
              </li>}
              {(trialHR !== null) && <li className="list-group-item" id="trial_opening_entry">
                {trialHR.open_date === null && <p><b>Kapituła jeszcze nie otworzyła próby na HR</b></p>}
                {trialHR.open_date !== null && <p><b>Otwarto próbę na HR:</b> {(trialHR.open_date.getDate()+1) + "." + (trialHR.open_date.getMonth()+1) + "." + trialHR.open_date.getFullYear()}</p>}
                {trialHR.close_date !== null && <p><b>Zamknięto próbę na HR:</b> {(trialHR.close_date.getDate()+1) + "." + (trialHR.close_date.getMonth()+1) + "." + trialHR.close_date.getFullYear()}</p>}
                {trialHR.close_date === null && <p><b>Spodziewane zamknięcie próby:</b> {trialHR.predicted_closing_date.getDate() + "." + (trialHR.predicted_closing_date.getMonth()+1) + "." + trialHR.predicted_closing_date.getFullYear()}</p>}
                {(trialHR.close_date === null && trialHR.open_date !== null) && 
                  <div className="progress">
                    <div className="progress-bar bg-dark" role="progressbar" style={{width: (((new Date()).getTime()-trialHR.open_date.getTime())/(trialHR.predicted_closing_date.getTime()-trialHR.open_date.getTime()) % 1)*100 + "%"}}></div>
                  </div>
                }
              </li>}
            </ul>
          </div>
        </div>}
      </div>}
    </main>
    <button type="button" className="btn" id="close_phoneverify_modal" data-bs-dismiss="modal" data-bs-target="#phoneverify_modal" style={{display: 'none'}}></button>
    <div className="modal fade" id="phoneverify_modal" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Potwierdź telefon</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Po zweryfikowaniu numeru telefonu będziesz mógł:</p>
            <ul>
              <li>Przypomnieć swój login (e-mail) po wpisaniu numeru telefonu</li>
              <li>Włączyć przypomnienia SMS przed każdą kapitułą na którą się zapisałeś</li>
              <li><span style={{textDecoration: "line-through"}}>Zresetować swoje hasło używając kodu SMS</span> SMS-y są jednak za drogie</li>
            </ul>
            <button className="btn btn-dark" onClick={(e) => {sendPhoneVerifyCode()}} disabled={phoneVerifyLock || buttonlock}>Wyślij kod SMS-em na numer {phone}</button>
            <p>Kod:</p>
            <input type="text" className="form-control" value={phoneVerifyCode} onChange={(e) => setPhoneVerifyCode(e.target.value)}/>
            {(phoneVerifyError !== '') && <p className="text-danger">{phoneVerifyError}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-dark" onClick={(e) => onVerifyPhoneAttempt()} disabled={phoneVerifyCode === '' || buttonlock}>Aktywuj</button>
          </div>
        </div>
      </div>
    </div>
  </>);
}

export default Profile;
