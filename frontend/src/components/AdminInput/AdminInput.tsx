import React from 'react';
import './AdminInput.css';

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  icon: React.ElementType;
  isTextarea?: boolean;
  rows?: number;
  register?: any;
  name?: string;
  error?: string;
  validation?: any;
}

const AdminInput: React.FC<AdminInputProps> = ({ 
  label, 
  icon: Icon, 
  isTextarea = false,
  rows = 3,
  register,
  name,
  error,
  validation,
  ...props 
}) => {
  const registerProps = register && name ? register(name, validation) : {};
  
  return (
    <div className="admin-input-group">
      <label className="admin-input-label">{label}</label>
      <div className="admin-input-wrapper">
        <Icon className="admin-input-icon" size={20} />
        {isTextarea ? (
          <textarea 
            className={`admin-input-field admin-textarea-field ${error ? 'admin-input-error' : ''}`}
            rows={rows}
            {...registerProps}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input 
            className={`admin-input-field ${error ? 'admin-input-error' : ''}`}
            {...registerProps}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      {error && <span className="admin-input-error-message">{error}</span>}
    </div>
  );
};

export default AdminInput;
