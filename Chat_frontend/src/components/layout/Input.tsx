import { ChangeEvent, KeyboardEvent, } from "react";

interface FormInputProps {
  value: string;
  label?: string;
  type?: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export default function Input({
  label,
  value,
  type,
  placeholder,
  onChange: handleOnChange,
  onKeyDown: onKeyDown,
}: FormInputProps) {
  return (
    <div className="flex flex-col w-full">
      {label && <label className="font-medium pb-2">{label}</label>}
      <input
        type={type || "text"}
        value={value}
        onChange={handleOnChange}
        onKeyDown={onKeyDown}
        className="rounded h-8 px-4"
        placeholder={placeholder || ""}
        
      />
    </div>
  );
}
