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
    `w-full bg-inherit p-2 text-sm text-gray-800 outline-none 
    placeholder:text-gray-400
  disabled:bg-gray-100 disabled:text-gray-500 
  dark:text-gray-200 
  dark:disabled:border-gray-600
  dark:disabled:bg-gray-800/50 
  dark:disabled:text-gray-500`,
    // noInner && 'rounded border border-solid border-gray-200 shadow',
    isLarge && "py-3",
    isNone && "!border-none bg-transparent shadow-none",
    isPwd && "pr-[30px]",
    isError && "!border-red-500 !shadow-red-100 dark:!shadow-red-900"
  );
  return (
    <input
      type={type}
      className={`${inputClass} rounded border border-solid border-gray-200 shadow-sm focus:shadow-primary-100 dark:border-gray-400 dark:focus:shadow-primary-900 ${className}`}
      {...rest}
    />
  );
};

export default Input;
