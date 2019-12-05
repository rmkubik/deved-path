import { useState, useRef } from "react";

const useRefState = initialValue => {
  const [state, setInternalState] = useState(initialValue);
  const stateRef = useRef(state);

  const setState = newState => {
    console.log(state, newState);
    stateRef.current = newState;
    setInternalState(newState);
  };

  return [stateRef, setState];
};

export default useRefState;
