export const isDarkMode = () => {
  const isDarkMode = localStorage.theme === "dark";
  const isLightMode = localStorage.theme === "light";
  return isDarkMode || (!isLightMode && window.matchMedia("(prefers-color-scheme: dark)").matches);
};

export const getServerUrl = (input: string) => {
  const _input = input.startsWith("http") ? input : `https://${input}`;
  try {
    const url = new URL(_input);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
};
