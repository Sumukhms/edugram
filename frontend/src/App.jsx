import React, { createContext, useState } from 'react';
import './App.css';
import Home from './screens/Home';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Profile from './screens/Profile';
import { ToastContainer } from 'react-toastify';
import Createpost from './screens/Createpost';
import { LoginContext } from './context/LoginContext';
import Modal from './components/Modal';
import UserProfile from './components/UserProfile';
import MyFollowingPost from './screens/MyfollowingPost';

// We create a separate component for routes to use the `useLocation` hook
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // This determines the wrapper class based on the route
  const isHomePage = location.pathname === '/';
  const layoutClass = isHomePage ? 'home-layout' : 'main-content';

  return (
    <div className={layoutClass}>
      <TransitionGroup>
        <CSSTransition key={location.key} classNames="fade" timeout={300}>
          <Routes location={location}>
            <Route path='/' element={<Home />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/signin' element={<Signin />} />
            <Route exact path='/profile' element={<Profile />} />
            <Route path='/createPost' element={<Createpost />} />
            <Route path='/profile/:userid' element={<UserProfile />} />
            <Route path="/followingpost" element={<MyFollowingPost />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
};

function App() {
  const [userLogin, setUserLogin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <BrowserRouter>
      <div className="App">
        <LoginContext.Provider value={{ setUserLogin, setModalOpen }}>
          <Navbar login={userLogin} />
          <AnimatedRoutes /> {/* Use the new animated routes component */}
          <ToastContainer theme='dark' />
          {modalOpen && <Modal setModalOpen={setModalOpen}></Modal>}
        </LoginContext.Provider>
      </div>
    </BrowserRouter>
  );
}

export default App;