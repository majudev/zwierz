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

function AdminPanel({mode}: Props): JSX.Element {
  const [userlistlock, setUserlistlock] = useState(false);
  const [users, setUsers] = useState<Array<{id: number, name: string|null, email: string, activated: boolean, rank: Rank, roleHO: CommiteeRole, roleHR: CommiteeRole, uberadmin: boolean, phone: string|null, team: {id: number, name: string, archived: boolean}|null, enableEmailNotifications: boolean, enableSMSNotifications: boolean, sso: SSOManager, disabled: boolean, shadow: boolean, trials: Array<{type: TrialType, openDate: Date, closeDate: Date, predictedClosingDate: Date}>}>>([]);

  const [pwdresetUserID, setPwdresetUserID] = useState(0);
  const [pwdresetName, setPwdresetName] = useState<string|null>(null);
  const [pwdresetEmail, setPwdresetEmail] = useState('');

  const [activateUserID, setActivateUserID] = useState(0);
  const [activateName, setActivateName] = useState<string|null>(null);
  const [activateEmail, setActivateEmail] = useState('');

  const [changeVisibilityUserID, setChangeVisibilityUserID] = useState(0);
  const [changeVisibilityCurrentState, setChangeVisibilityCurrentState] = useState(false);
  const [changeVisibilityName, setChangeVisibilityName] = useState<string|null>(null);
  const [changeVisibilityEmail, setChangeVisibilityEmail] = useState('');

  const [disableUserID, setDisableUserID] = useState(0);
  const [disableCurrentState, setDisableCurrentState] = useState(false);
  const [disableName, setDisableName] = useState<string|null>(null);
  const [disableEmail, setDisableEmail] = useState('');

  const [editPermissionsUserID, setEditPermissionsUserID] = useState(0);
  const [editPermissionsRoleHO, setEditPermissionsRoleHO] = useState<CommiteeRole>(CommiteeRole.NONE);
  const [editPermissionsRoleHR, setEditPermissionsRoleHR] = useState<CommiteeRole>(CommiteeRole.NONE);
  const [editPermissionsUberadmin, setEditPermissionsUberadmin] = useState(false);
  const [editPermissionsName, setEditPermissionsName] = useState<string|null>(null);
  const [editPermissionsEmail, setEditPermissionsEmail] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    refreshUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUsers = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/all", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch users list');
      return;
    }
    const body = await response.json() as {status:string; data: Array<{id: number, name: string|null, email: string, activated: boolean, rank: Rank, role_HO: CommiteeRole, role_HR: CommiteeRole, uberadmin: boolean, phone: string|null, team: {id: number, name: string, archived: boolean}|null, enableEmailNotifications: boolean, enableSMSNotifications: boolean, sso: SSOManager, disabled: boolean, shadow: boolean, trials: Array<{type: TrialType, open_date: string, close_date: string, predicted_closing_date: string}>}>};
    setUsers(body.data.map((e) => {return {...e, roleHO: e.role_HO, roleHR: e.role_HR, trials: e.trials.map((trial) => { return {...trial, openDate: new Date(trial.open_date), closeDate: new Date(trial.close_date), predictedClosingDate: new Date(trial.predicted_closing_date)}})}}));
    setUserlistlock(false);
  }

  const onChangeVisibilityAttempt = async function() {
    setUserlistlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/" + changeVisibilityUserID + "/shadow/" + (!changeVisibilityCurrentState ? 'yes' : 'no'), {
      method: "PATCH",
      mode: 'same-origin',
    });
    if(!response.ok){
      setUserlistlock(false);
      alert('Cannot change user visibility');
      return;
    }
    refreshUsers();
    document.getElementById('close_visibility_modal')?.click();
  }

  const onDisableAttempt = async function() {
    setUserlistlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/" + disableUserID + "/disabled/" + (!disableCurrentState ? 'yes' : 'no'), {
      method: "PATCH",
      mode: 'same-origin',
    });
    if(!response.ok){
      setUserlistlock(false);
      alert('Cannot change user disabled/enabled');
      return;
    }
    refreshUsers();
    document.getElementById('close_disable_modal')?.click();
  }

  const onActivateAttempt = async function() {
    setUserlistlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/" + activateUserID + "/active/yes", {
      method: "PATCH",
      mode: 'same-origin',
    });
    if(!response.ok){
      setUserlistlock(false);
      alert('Cannot activate user');
      return;
    }
    refreshUsers();
    document.getElementById('close_activate_modal')?.click();
  }

  const onUpdatePermissionsAttempt = async function() {
    setUserlistlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/" + editPermissionsUserID, {
      method: "PATCH",
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role_HO: (mode === SystemMode.HO || mode === SystemMode.HO_HR) ? editPermissionsRoleHO : undefined,
        role_HR: (mode === SystemMode.HR || mode === SystemMode.HO_HR) ? editPermissionsRoleHR : undefined,
        uberadmin: editPermissionsUberadmin,
      })
    });
    if(!response.ok){
      setUserlistlock(false);
      alert('Cannot change permissions');
      return;
    }
    refreshUsers();
    document.getElementById('close_permissions_modal')?.click();
  }

  const nameConverter = function(rank: Rank, name: string|null) {
    if(name === null) return null;
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

  const roleConverter = function(role: CommiteeRole){
    if(role === CommiteeRole.NONE) return 'Kandydat';
    else if(role === CommiteeRole.MEMBER) return 'Członek kapituły';
    else if(role === CommiteeRole.SCRIBE) return 'Sekretarz kapituły';
    else return 'Błąd';
  }

  return (<>
    <main className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-12 col-sm-12">
          <div className="p-3 pt-5 pb-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Lista użytkowników</h4>
              </li>
              <li className="list-group-item">
                <div className="table-responsive-sm">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col" className="text-center align-text-top nowrap">ID</th>
                        <th scope="col" className="text-center align-text-top nowrap">Imię i nazwisko</th>
                        <th scope="col" className="text-center align-text-top longrecord">Email</th>
                        <th scope="col" className="text-center align-text-top nowrap">Telefon</th>
                        <th scope="col" className="text-center align-text-top nowrap">Drużyna</th>
                        <th scope="col" className="text-center align-text-top nowrap">Próby</th>
                        <th scope="col" className="text-center align-text-top nowrap">Zweryfikowany</th>
                        <th scope="col" className="text-center align-text-top nowrap">Hasło</th>
                        <th scope="col" className="text-center align-text-top nowrap">Uprawnienia</th>
                        <th scope="col" className="text-center align-text-top nowrap">Widoczność</th>
                      </tr>
                    </thead>
                    <tbody id="users_table">
                      {
                        users.map((user) => {
                          return <tr>
                            <td className="text-center">{user.id}</td>
                            <td className="text-center nowrap">{user.name !== null ? nameConverter(user.rank, user.name) : <i>nie ustawiono</i>}</td>
                            <td className="text-center">
                              {user.email}<br/>
                              <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id={"emailNotifications" + user.id} disabled checked={user.enableEmailNotifications}></input>
                                <label className="form-check-label" htmlFor={"emailNotifications" + user.id}>
                                  Powiadomienia
                                </label>
                              </div>
                            </td>
                            <td className="text-center nowrap">
                              {user.phone !== null ? <>
                                {user.phone}<br/>
                                <div className="form-check form-check-inline">
                                  <input className="form-check-input" type="checkbox" id={"smsNotifications" + user.id} disabled checked={user.enableSMSNotifications}></input>
                                  <label className="form-check-label" htmlFor={"smsNotifications" + user.id}>
                                    Powiadomienia
                                  </label>
                                </div>
                              </> : <i>nie ustawiono</i>}
                            </td>
                            <td className="text-center">{user.team !== null ? user.team.name : <i>nie ustawiono</i>}</td>
                            <td className="text-center nowrap">
                              {(mode === SystemMode.HO || mode === SystemMode.HO_HR) && <><div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id={"HOexists" + user.id} checked={user.trials.filter((v) => {return v.type === TrialType.HO}).length > 0} disabled/>
                                <label className="form-check-label" htmlFor={"HOexists" + user.id}>
                                  HO w systemie
                                </label>
                              </div>
                              <br/></>}
                              {(mode === SystemMode.HR || mode === SystemMode.HO_HR) && <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id={"HRexists" + user.id} checked={user.trials.filter((v) => {return v.type === TrialType.HR}).length > 0} disabled/>
                                <label className="form-check-label" htmlFor={"HRexists" + user.id}>
                                  HR w systemie
                                </label>
                              </div>}
                            </td>
                            <td className="text-center">
                              {user.activated ? 'Tak' : <>
                              <button className="btn btn-dark" onClick={(e) => {setActivateEmail(user.email); setActivateName(nameConverter(user.rank, user.name)); setActivateUserID(user.id); document.getElementById('open_activate_modal')?.click();}} disabled={userlistlock}>Aktywuj</button>
                              </>}
                            </td>
                            <td className="nowrap"><button className="btn btn-danger" onClick={(e) => {setPwdresetUserID(user.id); setPwdresetName(nameConverter(user.rank, user.name)); setPwdresetEmail(user.email); document.getElementById('open_pwdreset_modal')?.click();}} disabled>Resetuj</button></td>
                            <td className="text-center">
                              {(mode === SystemMode.HO || mode === SystemMode.HO_HR) && <>{"HO: " + roleConverter(user.roleHO)}<br/></>}
                              {(mode === SystemMode.HR || mode === SystemMode.HO_HR) && "HR: " + roleConverter(user.roleHR)}
                              {user.uberadmin ? <><br/>Administrator</> : ''}
                              <button className="btn btn-sm btn-dark" onClick={(e) => {setEditPermissionsUserID(user.id); setEditPermissionsName(nameConverter(user.rank, user.name)); setEditPermissionsEmail(user.email); setEditPermissionsRoleHO(user.roleHO); setEditPermissionsRoleHR(user.roleHR); setEditPermissionsUberadmin(user.uberadmin); document.getElementById('open_permissions_modal')?.click();}} disabled={userlistlock}>Edytuj</button> 
                            </td>
                            <td className="text-center">
                              <div className="form-check form-check-inline form-switch">
                                <input className="form-check-input" type="checkbox" id={"shadow" + user.id} checked={!user.shadow} onClick={(e) => {setChangeVisibilityUserID(user.id); setChangeVisibilityName(nameConverter(user.rank, user.name)); setChangeVisibilityEmail(user.email); setChangeVisibilityCurrentState(user.shadow); document.getElementById('open_visibility_modal')?.click(); }} disabled={userlistlock}/>
                                <label className="form-check-label" htmlFor={"shadow" + user.id}>
                                  {user.shadow ? 'Ukryty' : 'Widoczny'}
                                </label>
                              </div>
                              <br/>
                              <div className="form-check form-check-inline form-switch">
                                <input className="form-check-input" type="checkbox" id={"disabled" + user.id} checked={!user.disabled} onClick={(e) => {setDisableUserID(user.id); setDisableName(nameConverter(user.rank, user.name)); setDisableEmail(user.email); setDisableCurrentState(user.disabled); document.getElementById('open_disable_modal')?.click(); }} disabled={userlistlock}/>
                                <label className="form-check-label" htmlFor={"disabled" + user.id}>
                                  {user.disabled ? 'Wyłączony' : 'Włączony'}
                                </label>
                              </div>
                            </td>
                          </tr>;
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
    <button type="button" className="btn" id="open_pwdreset_modal" data-bs-toggle="modal" data-bs-target="#confirm_password_reset" style={{display: 'none'}}></button>
    <button type="button" className="btn" id="close_pwdreset_modal" data-bs-dismiss="modal" data-bs-target="#confirm_password_reset" style={{display: 'none'}}></button>
    {/*<div className="modal fade" id="confirm_password_reset" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Czy na pewno?</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            Potwiedź, że chcesz zresetować hasło użytkownika <b>{pwdresetName} ({pwdresetEmail})</b>.
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-danger" onClick={(e) => onPasswordResetAttempt}>Resetuj hasło</button>
          </div>
        </div>
      </div>
    </div>*/}
    <button type="button" className="btn" id="open_activate_modal" data-bs-toggle="modal" data-bs-target="#activate_modal" style={{display: 'none'}}></button>
    <button type="button" className="btn" id="close_activate_modal" data-bs-dismiss="modal" data-bs-target="#activate_modal" style={{display: 'none'}}></button>
    <div className="modal fade" id="activate_modal" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Aktywacja użytkownika</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Potwiedź, że chcesz aktywować użytkownika <b>{activateName !== null ? <>{activateName} ({activateEmail})</> : activateEmail}</b>.</p>
            <p>Jeżeli użytkownik nie otrzymał maila z linkiem do aktywacji konta lub link nie zadziałał, użyj tej funkcji. Upewnij się, że e-mail którego użył kandydat jest w jego posiadaniu i nie ma literówek.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-dark" onClick={(e) => {onActivateAttempt();}} disabled={userlistlock}>Aktywuj</button>
          </div>
        </div>
      </div>
    </div>
    <button type="button" className="btn" id="open_visibility_modal" data-bs-toggle="modal" data-bs-target="#visibility_modal" style={{display: 'none'}}></button>
    <button type="button" className="btn" id="close_visibility_modal" data-bs-dismiss="modal" data-bs-target="#visibility_modal" style={{display: 'none'}}></button>
    <div className="modal fade" id="visibility_modal" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Ukrywanie użytkownika</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {!changeVisibilityCurrentState ? <>
              <p>Czy na pewno chcesz ukryć użytkownika <b>{changeVisibilityName !== null ? <>{changeVisibilityName} ({changeVisibilityEmail})</> : changeVisibilityEmail}</b>?</p>
              <p>Po ukryciu {mode === SystemMode.HO_HR ? 'próby użytkownika nie będą się wyświetlać' : 'próba użytkownika nie będzie się wyświetlać'} w systemie. To ustawienie nie ma wpływu na możliwość zalogowania się do systemu przez użytkownika.</p>
            </> : <>
              <p>Czy na pewno chcesz przywrócić widoczność użytkownika <b>{changeVisibilityName !== null ? <>{changeVisibilityName} ({changeVisibilityEmail})</> : changeVisibilityEmail}</b>?</p>
              <p>Po przywróceniu widoczności {mode === SystemMode.HO_HR ? 'próby użytkownika będą wyświetlać się' : 'próba użytkownika będzie wyświetlać się'} w systemie. To ustawienie nie ma wpływu na możliwość zalogowania się do systemu przez użytkownika.</p>
            </>}
            <p>Ukrycie widoczności użytkownika bez wyłączenia jego konta <span className="text-danger">jest niebezpieczne</span>. Kandydat będzie mógł się zalogować do systemu i wprowadzać zmiany, myśląc że kapituła je widzi, podczas gdy kapituła nie będzie widzieć jego próby.</p>
            <p>Jeśli chcesz ukryć użytkownika, zalecamy najpierw go <b>wyłączyć</b>.</p>
            <p>Typowe zastosowanie dla tej funkcji to ukrywanie użytkowników testowych, ukrywanie duplikatów czyichś kont itp. Jeżeli po prostu nie chcesz widzieć skończonej próby w systemie, lepiej ją <b>zarchiwizuj</b>. Wtedy będzie dalej widoczna w sekcji "Próby archiwalne" i będzie można szybciej się do niej dostać w razie potrzeby.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-danger" onClick={(e) => onChangeVisibilityAttempt()} disabled={userlistlock}>{!changeVisibilityCurrentState ? 'Ukryj użytkownika' : 'Przywróć widoczność'}</button>
          </div>
        </div>
      </div>
    </div>
    <button type="button" className="btn" id="open_disable_modal" data-bs-toggle="modal" data-bs-target="#disable_modal" style={{display: 'none'}}></button>
    <button type="button" className="btn" id="close_disable_modal" data-bs-dismiss="modal" data-bs-target="#disable_modal" style={{display: 'none'}}></button>
    <div className="modal fade" id="disable_modal" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Wyłączanie użytkownika</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {!disableCurrentState ? <>
              <p>Czy na pewno chcesz wyłączyć użytkownika <b>{disableName !== null ? <>{disableName} ({disableEmail})</> : disableEmail}</b>?</p>
              <p>Po wyłączeniu użytkownik zostanie nie będzie mógł się zalogować do systemu. To ustawienie nie ma wpływu na widoczność prób w systemie.</p>
            </> : <>
              <p>Czy na pewno chcesz włączyć użytkownika <b>{disableName !== null ? <>{disableName} ({disableEmail})</> : disableEmail}</b>?</p>
              <p>Po włączeniu użytkownik będzie mógł się zalogować do systemu. To ustawienie nie ma wpływu na widoczność prób w systemie.</p>
            </>}
            <p>Typowe zastosowanie tej funkcji to wyłączanie dostępu duplikatom kont (żeby ktoś nie miał dwóch kont w systemie) lub wyłączanie dostępu do kont testowych. Jeżeli nie chcesz, aby ktoś mógł edytować swoją próbę, lepiej po prostu ją <b>zarchiwizuj</b>. Pamiętaj że ktoś może w przyszłości być opiekunem i wtedy przyda mu się dostęp do konta, aby widzieć próbę podopiecznego.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-danger" onClick={(e) => onDisableAttempt()} disabled={userlistlock}>{!disableCurrentState ? 'Wyłącz' : 'Włącz'}</button>
          </div>
        </div>
      </div>
    </div>
    <button type="button" className="btn" id="open_permissions_modal" data-bs-toggle="modal" data-bs-target="#permissions_modal" style={{display: 'none'}}></button>
    <button type="button" className="btn" id="close_permissions_modal" data-bs-dismiss="modal" data-bs-target="#permissions_modal" style={{display: 'none'}}></button>
    <div className="modal fade" id="permissions_modal" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Zmiana uprawnień</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Edytujesz uprawnienia użytkownika <b>{editPermissionsName !== null ? <>{editPermissionsName} ({editPermissionsEmail})</> : editPermissionsEmail}</b>.</p>
            {(mode === SystemMode.HO || mode === SystemMode.HO_HR) && <p>
              Uprawnienia w kapitule HO: <select className="form-control" value={editPermissionsRoleHO} onChange={(e) => setEditPermissionsRoleHO(e.target.value as CommiteeRole)}>
                <option value={CommiteeRole.NONE}>Kandydat</option>
                <option value={CommiteeRole.MEMBER}>Członek kapituły</option>
                <option value={CommiteeRole.SCRIBE}>Sekretarz kapituły</option>
              </select>
            </p>}
            {(mode === SystemMode.HR || mode === SystemMode.HO_HR) && <p>
              Uprawnienia w kapitule HR: <select className="form-control" value={editPermissionsRoleHR} onChange={(e) => setEditPermissionsRoleHR(e.target.value as CommiteeRole)}>
                <option value={CommiteeRole.NONE}>Kandydat</option>
                <option value={CommiteeRole.MEMBER}>Członek kapituły</option>
                <option value={CommiteeRole.SCRIBE}>Sekretarz kapituły</option>
              </select>
            </p>}
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="editPermissionsUberadmin" checked={editPermissionsUberadmin} onChange={(e) => {setEditPermissionsUberadmin(e.target.checked)}}/>
              <label className="form-check-label" htmlFor="editPermissionsUberadmin">Administrator systemu</label>
            </div>
            <p>Administrator systemu może ukrywać i wyłączać użytkowników, edytować ustawienia systemowe (np. klucze API), aktywować użytkowników którym nie dotarł email aktywacyjny, a nawet zmienić tryb kapituły z HO na HO+HR.<br/>Administrator systemu nie musi być sekretarzem żadnej z kapituł.<br/>Nadawaj to uprawnienie z rozwagą, bo łatwo coś namieszać mając dostęp do tego panelu.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-danger" onClick={(e) => onUpdatePermissionsAttempt()} disabled={userlistlock}>Zaktualizuj uprawnienia</button>
          </div>
        </div>
      </div>
    </div>
  </>);
}

export default AdminPanel;
