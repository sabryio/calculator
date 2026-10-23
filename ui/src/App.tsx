// Calculator app shell — frameless custom title bar + Windows-calc-standard layout.
// No local arithmetic: everything is an engine command (see src/engine/).
import { Display } from "./components/Display";
import { Header } from "./components/Header";
import { Keypad } from "./components/Keypad";
import { TitleBar } from "./components/TitleBar";
import { useEngine } from "./hooks/useEngine";
import "./App.css";

export default function App() {
  const { state, send } = useEngine();
  return (
    <main className="calc" aria-label="Calculator">
      <TitleBar />
      <div className="calc__body">
        <Header />
        <Display state={state} />
        <Keypad state={state} onCommand={send} />
      </div>
    </main>
  );
}
