import { useCallback, useMemo, useState } from "react";

import { MockEngineApi } from "../engine/mock";
import { type CommandId, type EngineState } from "../engine/types";

const engineApi = new MockEngineApi();

/**
 * Single source of engine state for the UI. Synchronous and pure today; when the Rust
 * engine lands behind Tauri, this hook swaps its internals for `invoke` + subscription
 * while the whole UI keeps the same `send` interface.
 */
export function useEngine(): {
  state: EngineState;
  send: (command: CommandId) => void;
} {
  const [state, setState] = useState<EngineState>(() => engineApi.initial());

  const send = useCallback((command: CommandId) => {
    setState((prev) => engineApi.step(prev, command));
  }, []);

  return useMemo(() => ({ state, send }), [state, send]);
}
