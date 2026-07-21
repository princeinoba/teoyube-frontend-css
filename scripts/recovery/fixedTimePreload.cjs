"use strict";

const fixedTime = process.env.TEOYUBE_TEST_FIXED_TIME;

if (fixedTime) {
  const NativeDate = globalThis.Date;
  const fixedEpoch = NativeDate.parse(fixedTime);

  if (!Number.isFinite(fixedEpoch)) {
    throw new Error(`Invalid TEOYUBE_TEST_FIXED_TIME: ${fixedTime}`);
  }

  function FixedDate(...args) {
    if (!new.target) {
      return new NativeDate(fixedEpoch).toString();
    }
    return args.length > 0 ? new NativeDate(...args) : new NativeDate(fixedEpoch);
  }

  Object.setPrototypeOf(FixedDate, NativeDate);
  FixedDate.prototype = NativeDate.prototype;
  FixedDate.now = () => fixedEpoch;
  FixedDate.parse = NativeDate.parse;
  FixedDate.UTC = NativeDate.UTC;
  globalThis.Date = FixedDate;
}
