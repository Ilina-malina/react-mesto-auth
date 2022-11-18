import React, { useState, useEffect, useCallback } from 'react';
import { Redirect, Route, Switch, withRouter, useHistory } from 'react-router-dom';
import'../index.css';
import { CurrentUserContext } from '../contexts/CurrentUserContext.js';
import { CardsContext } from '../contexts/CardsContext.js';
import ProtectedRoute from './ProtectedRoute.js';
import Header from './Header.js';
import Login from './Login.js';
import Register from './Register.js';
import Main from './Main.js';
import Footer from './Footer.js';
import PopupWithForm from './PopupWithForm.js';
import ImagePopup from './ImagePopup.js';
import EditProfilePopup from './EditProfilePopup.js';
import EditAvatarPopup from './EditAvatarPopup.js';
import AddPlacePopup from './AddPlacePopup.js';
import InfoTooltip from './InfoTooltip.js';
import { api } from '../utils/Api.js';
import * as auth from '../utils/Auth.js';
import success from '../images/success.svg';
import fail from '../images/fail.svg';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('jwt') == true);
  const [userData, setUserData] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({name: '', about: ''});
  const [tooltipState, setTooltipState] = useState({isOpen: false, title: '', image: ''});
  const [cards, setCards] = useState([]);
  const history = useHistory();

  useEffect(() => {
    api.getUserInfo().then(data => {
        setCurrentUser(data);
    })
    .catch((err) => {
      console.log(err);
    })
}, [])

  useEffect(() => {
    api.getInitialCards().then(cardList => {
        setCards(cardList);
    })
    .catch((err) => {
      console.log(err);
    })
  }, [])

  const handleLike = (card) => {
    if (card.likes.some(item => item._id === currentUser._id)) {
      api.deleteLike(card._id).then((newCard) => {
        setCards((cards) => cards.map((item) => card._id === item._id ? newCard : item));
      })
      .catch((err) => {
        console.log(err);
      })
    } else {
      api.putLike(card._id).then((newCard) => {
        setCards((cards) => cards.map((item) => card._id === item._id ? newCard : item));
      })
     .catch((err) => {
        console.log(err);
      })
    }
  };

  const handleCardDelete = (card) => {
      api.deleteCard(card._id).then(() => {
        setCards((cards) => cards.filter(item => item._id !== card._id))
      })
      .catch((err) => {
        console.log(err);
      })
  };

  const cbTokenCheck = useCallback( async () => {
    try {
      const token = localStorage.getItem('jwt');
        if (!token) {
          console.log('No token in storage');
        }
      const user = await auth.checkToken(token);
      if (!user) {
        console.log('Invalid user');
      }
      setIsLoggedIn(true);
    } catch {}
  }, [])

  useEffect(() => {
    cbTokenCheck();
    const email = localStorage.getItem('email');
    setUserEmail(email);
  }, [])

  const cbLogin = useCallback( async (email, password) => {
    try {
      setUserEmail(email);
      const data = await auth.login(email, password);
      if (!data) {
        console.log('Что-то пошло не так');
      }
      if (data) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('email', email);
        cbTokenCheck();
        setUserData(data.user);
        history.push('/');
      }
    } catch {}
  }, [userData, userEmail])

  const cbSignout = useCallback(() => {
    localStorage.removeItem('jwt');
    history.push('/');
  })

  const cbRegister = useCallback( async (email, password) => {
    try {
      const data = await auth.register(email, password);
      if (!data) {
        setTooltipState({isOpen: true, title: "Что-то пошло не так! Попробуйте ещё раз.", image: fail});
      }
      if (data) {
        setIsLoggedIn(true);
        setUserData(data.email, data.password);
        setTooltipState({isOpen: true, title: "Вы успешно зарегистрировались!", image: success});
        history.push('/signin');
      }
    } catch {}
  }, [])

  function handleUpdateUser(name, about) {
    api.editUserInfo(name, about).then(data => {
      setCurrentUser(data);
      closeAllPopups();
    })
    .catch((err) => {
      console.log(err);
    })
  }

  function handleUpdateAvatar(avatar) {
    api.editUserAvatar(avatar).then(data => {
      setCurrentUser(data);
      closeAllPopups();
    })
    .catch((err) => {
      console.log(err);
    })
  }

  function handleAddPlaceSubmit(name, link) {
    api.addCard({
      name: name,
      link: link
    }).then(newCard => {
      setCards([newCard, ...cards]);
      closeAllPopups();
    })
    .catch((err) => {
      console.log(err);
    })
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setTooltipState({isOpen: false});
    setSelectedCard(null);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <CardsContext.Provider value={cards}>
      <div className="App">
        <Header email={userEmail} onSignout={cbSignout} />
        <Switch>
          <ProtectedRoute 
            exact 
            path="/"
            component={Main}
            onAddPlace={handleAddPlaceClick} 
            onEditAvatar={handleEditAvatarClick} 
            onEditProfile={handleEditProfileClick} 
            onCardClick={setSelectedCard}
            onCardLike={handleLike}
            onCardDelete={handleCardDelete}
            isLoggedIn={isLoggedIn}
          />
          <Route path="/signup">
            <Register onRegister={cbRegister} isLoggedIn={isLoggedIn} />
          </Route>
          <Route path="/signin">
            <Login onLogin={cbLogin} isLoggedIn={isLoggedIn} />
          </Route>
          <Route>
            {isLoggedIn ? <Redirect to="/" /> : <Redirect to="/signin" />}
          </Route>
        </Switch>
      
        <Footer />
        <InfoTooltip tooltipState={tooltipState} onClose={closeAllPopups} />
        <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
        <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} />
        <PopupWithForm name="delete-confirmation" title="Вы уверены?" onClose={closeAllPopups}>
          <button className="popup__submit-button" type="submit" aria-label="Да">Подтвердить</button>
        </PopupWithForm>
        <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      </div>
      </CardsContext.Provider>
    </CurrentUserContext.Provider>
  );
}

export default withRouter(App);