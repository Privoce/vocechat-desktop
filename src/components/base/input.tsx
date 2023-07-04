import { DetailedHTMLProps, FC, InputHTMLAttributes } from "react";
import clsx from "clsx";

interface Props
  extends DetailedHTMLProps<
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      | "placeholder"
      | "className"
      | "type"
      | "autoFocus"
      | "id"
      | "value"
      | "name"
      | "required"
      | "readOnly"
      | "onChange"
      | "onFocus"
      | "onBlur"
      | "pattern"
      | "disabled"
      | "minLength"
      | "spellCheck"
    >,
    HTMLInputElement
  > {
  ref?: any;
}

const Input: FC<Props> = ({ type = "text", className = "", ...rest }) => {
  const isError = className.includes("error");
  const isLarge = className.includes("large");
  const isNone = className.includes("none");
  // const noInner=!className.includes("inner");
  const isPwd = type == "password";
  const inputClass = clsx(
    `w-full text-sm text-gray-800 dark:text-gray-200 p-2 outline-none 
    bg-inherit
  disabled:text-gray-500 disabled:bg-gray-100 
  dark:disabled:text-gray-500 
  dark:disabled:bg-gray-800/50
  dark:disabled:border-gray-600 
  placeholder:text-gray-400`,
    // noInner && 'rounded border border-solid border-gray-200 shadow',
    isLarge && "py-3",
    isNone && "!border-none bg-transparent shadow-none",
    isPwd && "pr-[30px]",
    isError && "!border-red-500 !shadow-red-100 dark:!shadow-red-900"
  );
  return (
    <input
      type={type}
      className={`${inputClass} shadow-sm focus:shadow-primary-100 dark:focus:shadow-primary-900 rounded border border-solid border-gray-200 dark:border-gray-400 ${className}`}
      {...rest}
    />
  );
};

export default Input;
