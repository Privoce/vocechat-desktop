export const isDarkMode = () => {
  const isDarkMode = localStorage.theme === "dark";
  const isLightMode = localStorage.theme === "light";
  return isDarkMode || (!isLightMode && window.matchMedia("(prefers-color-scheme: dark)").matches);
};
