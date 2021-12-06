export const checkIfObjContainsNull = <T>(obj: T): boolean => {
  for (const key in obj) {
    if (obj[key] == null) return true;
  }
  return false;
};
