interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export default function Button({
  children, disabled, onClick
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn btn-primary bg-secondary text-white py-3 px-4 rounded-md shadow-sm align-middle focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:white transition-all text-sm font-light disabled:bg-gray-300">
      {children}
    </button>
  );
}
