import React from 'react';
import { Search, Download } from 'lucide-react';
import './SearchFilterBar.css';

interface Filter {
  label: string;
  options: string[];
}

interface SearchFilterBarProps {
  searchPlaceholder: string;
  filters?: Filter[];
  onAddNew?: () => void;
  addButtonText?: string;
  onDownload?: () => void;
  onSearch?: (value: string) => void;
  onFilterChange?: (filterIndex: number, value: string) => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchPlaceholder,
  filters = [],
  onAddNew,
  addButtonText,
  onDownload,
  onSearch,
  onFilterChange,
}) => {
  return (
    <div className="search-filter-bar">
      <div className="search-filter-left">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="search-input"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        
        {filters.map((filter, index) => (
          <select
            key={index}
            className="filter-select"
            onChange={(e) => onFilterChange?.(index, e.target.value)}
          >
            {filter.options.map((option, optIndex) => (
              <option key={optIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        ))}
        
        {onDownload && (
          <button className="download-button" onClick={onDownload}>
            <Download size={20} />
          </button>
        )}
      </div>

      {onAddNew && addButtonText && (
        <button className="add-new-button" onClick={onAddNew}>
          <span className="add-icon">+</span>
          {addButtonText}
        </button>
      )}
    </div>
  );
};

export default SearchFilterBar;
