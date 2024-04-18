type StorageType = 'session' | 'local';
type UseStorageReturnValue = {
  getItem: (key: string, type?: StorageType) => string;
  isItemSet: (key: string, type?: StorageType) => boolean;
  setItem: (key: string, value: string, type?: StorageType) => boolean;
  removeItem: (key: string, type?: StorageType) => void;
  isBrowser: boolean;
};

const useStorage = (): UseStorageReturnValue => {
  const storageType = (type?: StorageType): 'localStorage' | 'sessionStorage' => `${type ?? 'session'}Storage`;

  const isBrowser: boolean = ((): boolean => typeof window !== 'undefined')();

  const getItem = (key: string, type?: StorageType): string => {
    return isBrowser ? window[storageType(type)][key] : '';
  };

  const isItemSet = (key: string, type?: StorageType): boolean => {
    return isBrowser ? window[storageType(type)][key] !== undefined : false;
  };

  const setItem = (key: string, value: string, type?: StorageType): boolean => {
    if (isBrowser) {
      console.log(key, value)
      window[storageType(type)].setItem(key, value);
      return true;
    }

    return false;
  };

  const removeItem = (key: string, type?: StorageType): void => {
    window[storageType(type)].removeItem(key);
  };

  return {
    getItem,
    setItem,
    removeItem,
    isItemSet,
    isBrowser
  };
};

export default useStorage;