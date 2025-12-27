import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  breadcrumb?: { label: string; path?: string }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumb }) => {
  return (
    <div className="page-header">
      {breadcrumb && (
        <div className="breadcrumb">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              <span className={item.path ? 'breadcrumb-link' : 'breadcrumb-current'}>
                {item.label}
              </span>
              {index < breadcrumb.length - 1 && <span className="breadcrumb-separator"> › </span>}
            </React.Fragment>
          ))}
        </div>
      )}
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
    </div>
  );
};

export default PageHeader;
