import logo from '../images/logo.svg';
import { Route, Link } from 'react-router-dom';

function Header(props) {
  function handleSignout() {
    props.onSignout();
  }

    return (
        <header className="header">
          <img className="header__logo" src={logo} alt="Логотип" />
          <Route exact path="/">
              <div className="header__container">
                <p className="header__user">{props.email}</p>
                <button className="header__logout" type="button" aria-label="Выйти" onClick={handleSignout}>Выйти</button>
              </div>
          </Route>
          <Route path="/signup">
            <Link className='header__link' to="/signin">Войти</Link>
          </Route>
          <Route path="/signin">
            <Link className='header__link' to="/signup">Регистрация</Link>
          </Route>
          
    </header>
    )
}

export default Header;