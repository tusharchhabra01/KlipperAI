import en from "./en";

const translations = en;

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce<any>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return acc[key];
    }
    return undefined;
  }, obj);
}

export function t<T = string>(key: string): T {
  const value = getNestedValue(translations, key);
  return (value as T) ?? ((key as unknown) as T);
}

export default t;

