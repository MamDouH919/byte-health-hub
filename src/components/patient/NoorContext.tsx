import { createContext, useContext, useState } from "react";

export interface Msg { role: "user" | "noor"; text: string; pending?: boolean; }

const seedMessages: Msg[] = [
  { role: "noor", text: "Hello Dr. Sajeda Ayesh, ask me anything. Would you like to know potential issues regarding Yassin's **CBC profile or hormone panel?**" },
  { role: "user", text: "Give me a summary of Yassin's Blood Tests and in particular CBC" },
  { role: "noor", text: "Yassin's blood tests show mostly normal results, but there are a few concerns:\n\n- **Elevated white blood cells** suggest possible **infection** or **inflammation**.\n- **Low free testosterone**, despite normal total testosterone, may indicate **hormonal imbalance**.\n- Slightly **low hemoglobin**, possibly **mild anemia**.\n\nOverall, results are stable but warrant follow-up for immune and hormone-related issues" },
];

const NoorContext = createContext<{
  msgs: Msg[];
  setMsgs: React.Dispatch<React.SetStateAction<Msg[]>>;
}>({ msgs: seedMessages, setMsgs: () => {} });

export const NoorProvider = ({ children }: { children: React.ReactNode }) => {
  const [msgs, setMsgs] = useState<Msg[]>(seedMessages);
  return <NoorContext.Provider value={{ msgs, setMsgs }}>{children}</NoorContext.Provider>;
};

export const useNoor = () => useContext(NoorContext);
