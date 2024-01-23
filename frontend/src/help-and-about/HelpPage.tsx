function HelpPage(): JSX.Element {


  return (<>
    <main className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-sm-12">
          <div className="p-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Z kim do czego?</h4>
              </li>
              <li className="list-group-item">
                <b>Sekretarzowie kapituły:</b>
                <ul>
                  {

                  }
                  <li>Imię nazwisko (email)</li>
                </ul>
                <br/>
                Do nich możesz pisać w kwestiach związanych z kapitułą - jak działają rejestracje w systemie, czy kapituła zapoznała się już z twoim zgłoszeniem itp.
              </li>
              <li className="list-group-item">
                <b>Administratorzy systemu:</b>
                <ul>
                  {

                  }
                  <li>Imię nazwisko (email)</li>
                </ul>
                <br/>
                Do nich możesz pisać w sprawie swojego konta, np. utraty hasła lub gdy zapomniałeś czy masz już konto w systemie.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </>);
}

export default HelpPage;
