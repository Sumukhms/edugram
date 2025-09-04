import React, { useContext } from 'react';
import { RiCloseLine } from "react-icons/ri";
import "../css/Modal.css";
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../context/LoginContext';

export default function Modal({ setModalOpen }) {
    const navigate = useNavigate();
    const { setUserLogin } = useContext(LoginContext) || {};

    return (
        <div className="darkBg" onClick={() => setModalOpen(false)}>
            <div className="modal centered" onClick={(e) => e.stopPropagation()}>
                <button className='closeBtn' onClick={() => setModalOpen(false)}>
                    <RiCloseLine />
                </button>
                <h5 className="heading">Confirm</h5>
                <div className="modalContent">
                    Do you really want to log out?
                </div>
                <div className="actionsContainer">
                    <button className="logOutBtn" onClick={() => {
                        setModalOpen(false);
                        localStorage.clear();
                        setUserLogin(false);
                        navigate("/signin");
                    }}>
                        Log Out
                    </button>
                    <button className="cancelBtn" onClick={() => setModalOpen(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}