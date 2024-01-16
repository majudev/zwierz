import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import 'bootstrap/js/src/modal';

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  mode: SystemMode;
  type: TrialType;
}

function TrialsList({mode, type}: Props): JSX.Element {
  const [trials, setTrials] = useState<Array<{id: number; userId: number; type: TrialType; open_date: Date|null; close_date: Date|null; predicted_closing_date: Date; user: {id: number; name: string; rank: Rank}; archived: boolean}>>([]);
  const [archivalTrials, setArchivalTrials] = useState<Array<{id: number; userId: number; type: TrialType; open_date: Date|null; close_date: Date|null; predicted_closing_date: Date; user: {id: number; name: string; rank: Rank}; archived: boolean}>>([]);

  const [archivalVisible, setArchivalVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setTrials([]);
    setArchivalTrials([]);
    setArchivalVisible(false);
    refreshTrials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const refreshTrials = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/all/" + type.toLowerCase(), {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch trials list');
      return;
    }
    const body = await response.json() as {status:string; data: Array<{id: number; userId: number; type: TrialType; open_date: string|null; close_date: string|null; predicted_closing_date: string; user: {id: number; name: string; rank: Rank}; archived: boolean}>};
    setTrials(body.data.map((e) => {return {...e, open_date: (e.open_date === null) ? null : new Date(e.open_date), close_date: (e.close_date === null) ? null : new Date(e.close_date), predicted_closing_date: new Date(e.predicted_closing_date)}}));
  }

  const refreshArchival = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/all/" + type.toLowerCase() + "/archived", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch trials list');
      return;
    }
    const body = await response.json() as {status:string; data: Array<{id: number; userId: number; type: TrialType; open_date: string|null; close_date: string|null; predicted_closing_date: string; user: {id: number; name: string; rank: Rank}; archived: boolean}>};
    setArchivalTrials(body.data.map((e) => {return {...e, open_date: (e.open_date === null) ? null : new Date(e.open_date), close_date: (e.close_date === null) ? null : new Date(e.close_date), predicted_closing_date: new Date(e.predicted_closing_date)}}));
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

  const stateConverter = function(trial: {open_date: Date|null; close_date: Date|null}){
    if(trial.close_date !== null){
      return 'zamknięta';
    }else if(trial.open_date !== null){
      return 'otwarta';
    }else{
      return 'oczekuje na otwarcie';
    }
  }

  return (<>
    <main className="container-fluid">
      <div className="row">
        <div className="col-lg-8 col-sm-12 firstrun-shadow">
          <div className="p-3">
            <ul className="list-group" id="trials_active">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Aktualne próby</h4>
              </li>
              {trials.length === 0 ? 
                <li className="list-group-item trial-entry">
                  <p className="m-1">Brak aktualnych prób.</p>
                </li>
              :
                trials.map((trial) => {
                  return <li className="list-group-item trial-entry">
                    <table>
                      <tbody>
                        <tr>
                          <td className="longrecord">
                            <p className="text-vert-center">{nameConverter(trial.user.rank, trial.user.name)} ({stateConverter(trial)})</p>
                          </td>
                          <td>
                            {/*<button className="btn btn-dark nowrap" onClick={(e) => alert()}>Wyświetl</button>*/}
                            <Link className="btn btn-dark nowrap" to={"/commitee/trial/" + trial.userId + "/" + trial.type.toLowerCase()}>Wyświetl</Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </li>;
                })
              }
            </ul>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="p-3">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Statystyki</h4>
              </li>
              <li className="list-group-item">
                <b>Nazwa:</b> wartość
              </li>
              <li className="list-group-item d-flex justify-content-end flex-row">
                <button type="button" className="btn btn-dark" id="profile_edit">Edytuj</button>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-lg-8 col-sm-12 firstrun-shadow">
          <div className="p-3">
            <ul className="list-group" id="trials_archived">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Archiwalne próby</h4>
              </li>
              {!archivalVisible && 
              <li className="list-group-item d-flex flex-row-reverse trial-entry">
                <button className="btn btn-dark" onClick={(e) => {setArchivalVisible(true); refreshArchival();}}>Wyświetl archiwalne próby</button>
              </li>}
              {archivalVisible &&
                (archivalTrials.length === 0 ? 
                  <li className="list-group-item trial-entry">
                    <p className="m-1">Brak aktualnych prób.</p>
                  </li>
                :
                  archivalTrials.map((trial) => {
                    return <li className="list-group-item trial-entry">
                      <table>
                        <tbody>
                          <tr>
                            <td className="longrecord">
                              <p className="text-vert-center">{nameConverter(trial.user.rank, trial.user.name)} ({stateConverter(trial)})</p>
                            </td>
                            <td>
                              {/*<button className="btn btn-dark nowrap" onClick={(e) => alert()}>Wyświetl</button>*/}
                              <Link className="btn btn-dark nowrap" to={"/commitee/trial/" + trial.id}>Wyświetl</Link>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </li>;
                  })
                )
              }
            </ul>
          </div>
        </div>
      </div>
    </main>
  </>);
}

export default TrialsList;
