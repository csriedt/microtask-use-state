type MicrotaskUseStateResult<T> = [() => T, (newValue: T) => void];

const microtaskUseState = <T,>(initialValue: T): MicrotaskUseStateResult<T> => {
  let internalValue = initialValue;
  let microtaskValue = initialValue;
  let microtaskUpdated = false;

  const setter = (newValue: T) => {
    microtaskValue = newValue;

    if (!microtaskUpdated) {
      microtaskUpdated = true;

      queueMicrotask(() => {
        internalValue = microtaskValue;
        microtaskUpdated = false;
      });
    }
  };

  return [() => internalValue, setter];
};

const [count, setCount] = microtaskUseState(0);

setCount(1);
setCount(2);

console.log(count()); // before the tick, returns 0 - not 2

setTimeout(() => console.log(count()), 0); // after the tick, returns 2 - the final staged value
