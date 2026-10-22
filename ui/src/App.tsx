// Calculator instrument shell: header, display, keypad. No local arithmetic — everything
// is an engine command (see src/engine/).
import { Display } from "./components/Display";
import { Keypad } from "./components/Keypad";
import { useEngine } from "./hooks/useEngine";
import "./App.css";

export default function App() {
  const { state, send } = useEngine();
  return (
    <main className="calc" aria-label="Calculator">
      <header className="calc__header">
        <h1 className="calc__title">Calculator</h1>
        <span className="calc__mode">Standard</span>
      </header>
      <Display state={state} />
      <Keypad onCommand={send} />
    </main>
  );
}
