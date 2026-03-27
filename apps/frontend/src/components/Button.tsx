"use client";

export const Button = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      className="px-8 py-4 text-xl bg-green-500 hover:bg-green-600 hover:border-green-800 text-white font-bold rounded-xl border-b-4 border-green-700 transition-colors ease-in-out"
    >
      <span className="drop-shadow-md">{children}</span>
    </button>
  );
};
