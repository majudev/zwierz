import React, {useState, useEffect} from 'react';
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  mode: SystemMode;
}

function PublicAppointments({mode}: Props): JSX.Element {
  const [appointments, setAppointments] = useState<Array<{id: number, date: Date, description: string, slotsHO: number, slotsHR: number, registrationsHO: number, registrationsHR: number, locked: boolean}>>([]);

  useEffect(() => {
    refreshAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAppointments = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/public", {
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
                      </tr>
                    </thead>
                    <tbody id="appointment_table">
                      {
                        appointments.map((appointment) => {
                          const freeHO = appointment.slotsHO - appointment.registrationsHO;
                          const freeHR = appointment.slotsHR - appointment.registrationsHR;
                          return <tr>
                            <td className="nowrap" scope="row">{appointment.date.getDate() + '.' + ((appointment.date.getMonth() + 1) >= 10 ? (appointment.date.getMonth() + 1) : '0' + (appointment.date.getMonth() + 1)) + '.' + appointment.date.getFullYear()}</td>
                            <td>
                              <p>{appointment.description}</p>
                            </td>
                            {(mode === SystemMode.HO_HR || mode === SystemMode.HO) && <td className="text-center nowrap">{freeHO} z {appointment.slotsHO}</td>}
                            {(mode === SystemMode.HO_HR || mode === SystemMode.HR) && <td className="text-center nowrap">{freeHR} z {appointment.slotsHR}</td>}
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
  </>);
}

export default PublicAppointments;
