import React from 'react';
import "./WorkerUser.css";
import user from "../../assets/patterens/user.jpg";

const WorkerUser = () => {
  return (
    <div className="w-user">
        <img src={user} alt="User" />
        <div className="w-user-info">
            <h1>M. Yılmaz</h1>
            <div>
                VARDİYA #4000 • AKTİF
            </div>
        </div>
    </div>
  )
}

export default WorkerUser