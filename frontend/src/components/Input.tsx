import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ElementType;
  register?: any;
}

const Input: React.FC<InputProps> = ({ label, icon: Icon, register, ...props }) => {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div className="input-wrapper">
        <Icon className="input-icon" size={20} />
        <input className="input-field" {...register} {...props} />
      </div>
    </div>
  );
};

export default Input;
