import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export default function Button({ text, ...props }: ButtonProps) {
  return (
    <button
      className="w-max px-10 py-1 rounded bg-slate-500 text-white uppercase"
      {...props}
    >
      {text}
    </button>
  );
}
