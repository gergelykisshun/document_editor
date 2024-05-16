import { FC, ReactNode } from "react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  children?: ReactNode;
};

const TwButton: FC<Props> = ({ onClick, disabled, children }) => {
  return (
    <button
      onClick={onClick}
      className="border px-2 py-1 bg-indigo-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default TwButton;
