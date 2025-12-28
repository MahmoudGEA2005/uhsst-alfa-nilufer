import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  inline?: boolean;
}

const LoadingSpinner = ({ inline = false }: LoadingSpinnerProps) => {
  if (inline) {
    return (
      <div className="loading-spinner-inline">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner" />
    </div>
  );
};

export default LoadingSpinner;