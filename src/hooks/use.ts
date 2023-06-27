import { useEffect, useState } from "react";
import { Tab, TabGroup } from "electron-tabs";

const useTab = () => {
  const [tabGroup, setTabGroup] = useState(document.querySelector("tab-group") as TabGroup);
  const [tabs, setTabs] = useState<Tab[]>([]);
  useEffect(() => {
    if (tabGroup) {
      setTabs(tabGroup.getTabs());
    }
  }, [tabGroup]);

  return {
    tabs
  };
};
