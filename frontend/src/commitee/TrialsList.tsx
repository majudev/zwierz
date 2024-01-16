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
  const [appointments, setAppointments] = useState<Array<{id: number, date: Date, description: string, slotsHO: number, slotsHR: number, registrationsHO: number, registrationsHR: number, locked: boolean, registrations: Array<{id: number, intent: string, customIntent: string|null, message: string|null, type: TrialType}>}>>([]);

  const navigate = useNavigate();

  useEffect(() => {
    refreshAppointments();
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

  return (<>
    <main className="container-fluid">
      <div className="row">
        <div className="col-lg-8 col-sm-12 firstrun-shadow">
          <div className="p-3">
            <ul className="list-group" id="trials_active">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Aktualne próby</h4>
              </li>
              <li className="list-group-item trial-entry">
                <table>
                  <tbody>
                    <tr>
                      <td className="longrecord">
                        <p className="text-vert-center">ćw. Marian (otwarta)</p>
                      </td>
                      <td>
                        <button className="btn btn-dark nowrap">Wyświetl</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </li>
              <li className="list-group-item trial-entry">
                <table>
                  <tbody>
                    <tr>
                      <td className="longrecord">
                        <p className="text-vert-center">wyw. Grzegorz (otwarta)</p>
                      </td>
                      <td>
                        <button className="btn btn-dark nowrap">Wyświetl</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </li>
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
              <li className="list-group-item d-flex flex-row-reverse trial-entry">
                <button className="btn btn-dark">Wyświetl archiwalne próby</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </>);
}

export default TrialsList;
