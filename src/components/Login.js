import React, { useCallback, useState } from 'react';
import { withRouter } from 'react-router-dom';

function Login(props) {
  const [userData, setUserData] = useState({
    email: '',
    password: ''
  });

  const cbSubmit = useCallback((e) => {
    e.preventDefault();
    try {
      props.onLogin(userData.email, userData.password);
    }
    catch {}
  }, [props.onLogin, userData]);

  const cbChange = useCallback((e) => {
    const {name, value} = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  }, [userData]);

    return (
        <div className="auth">
            <div className="auth__container">
              <h2 className="auth__title">Вход</h2>
              <form className="auth__form" name="login-form" onSubmit={cbSubmit}>
                  <input className="auth__input" name="email" value={userData.email} required type="email" placeholder="Email" onChange={cbChange} />
                  <input className="auth__input" name="password" value={userData.password} required type="password" placeholder="Пароль" onChange={cbChange} />
                <button className="auth__submit-button" type="submit" aria-label="Войти">Войти</button>
              </form>
            </div>
        </div>
    )
}

export default withRouter(Login);