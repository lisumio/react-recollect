import { IS_OLD_STORE } from './constants';
import {
  ArrWithSymbols,
  MapWithSymbols,
  ObjWithSymbols,
  PropPath,
  SetWithSymbols,
  Target,
} from './types';

export const isPlainObject = (item: any): item is ObjWithSymbols =>
  !!item && typeof item === 'object' && item.constructor === Object;

export const isArray = (item: any): item is ArrWithSymbols =>
  Array.isArray(item);

export const isMap = (item: any): item is MapWithSymbols => item instanceof Map;

export const isSet = (item: any): item is SetWithSymbols => item instanceof Set;

export const isMapOrSet = (item: any) => isMap(item) || isSet(item);

export const isSymbol = (item: any): item is symbol => typeof item === 'symbol';

export const isFunction = (item: any) => typeof item === 'function';

export const cloneMap = (originalMap: Map<any, any>) => new Map(originalMap);

export const cloneSet = (originalSet: Set<any>) => new Set(originalSet);

type GetValue = {
  (item: ObjWithSymbols, prop: PropertyKey): any;
  (item: ArrWithSymbols, prop: number): any;
  (item: MapWithSymbols, prop: any): any;
  (item: SetWithSymbols, prop: any): any;
};

export const getValue: GetValue = (target: Target, prop: any) => {
  if (isMap(target)) return target.get(prop);
  if (isSet(target)) return prop;
  if (isArray(target)) return target[prop];

  return target[prop];
};

type SetValue = {
  // TODO (davidg): why not PropertyKey prop?
  (item: ObjWithSymbols, prop: string | symbol, value: any | null): any;
  (item: ArrWithSymbols, prop: number, value?: any): any;
  (item: MapWithSymbols, prop: any, value?: any): any;
  (item: SetWithSymbols, prop: any, value?: any): any;
};

export const setValue: SetValue = (
  mutableTarget: Target,
  prop: any,
  value: any
) => {
  if (isMap(mutableTarget)) {
    mutableTarget.set(prop, value);
  } else if (isSet(mutableTarget)) {
    mutableTarget.add(prop);
  } else if (isArray(mutableTarget)) {
    mutableTarget[prop] = value;
  } else if (isPlainObject(mutableTarget)) {
    // @ts-ignore - is fine, prop can be a symbol
    mutableTarget[prop] = value;
  } else {
    throw Error('Unexpected type');
  }
};

// TODO (davidg): how does this fair with optional?.chaining?
export const deepUpdate = <T extends Target>({
  object,
  path,
  onClone,
  updater,
}: {
  object: T;
  path: PropPath;
  onClone?: <U extends object>(original: U, clone: U) => U;
  updater: (object: any) => void;
}) => {
  const cloneItem = (original: T): T => {
    let clone = original;

    if (isArray(original)) clone = original.slice() as T;
    if (isMap(original)) clone = cloneMap(original) as T;
    if (isSet(original)) clone = cloneSet(original) as T;
    if (isPlainObject(original)) clone = { ...original };

    // Let the caller do interesting things when cloning
    return onClone ? onClone(original, clone) : clone;
  };

  const result = cloneItem(object);

  // This will be the case if we're updating the top-level store
  if (!path.length) {
    updater(result);
  } else {
    path.reduce((item, prop, i) => {
      const nextValue = cloneItem(getValue(item, prop));
      setValue(item, prop, nextValue);

      if (i === path.length - 1) {
        updater(nextValue);
        return null; // doesn't matter
      }

      return nextValue;
    }, result);
  }

  return result;
};

/**
 * Replaces the contents of one object with the contents of another. The top
 * level object will remain the same, but all changed content will be replaced
 * with the new content.
 */
export const replaceObject = (
  mutableTarget: ObjWithSymbols,
  nextObject?: ObjWithSymbols
) => {
  if (nextObject) {
    // From the new data, add to the old data anything that's new
    // (from the top level props only)
    Object.entries(nextObject).forEach(([prop, value]) => {
      if (mutableTarget[prop] !== value) {
        mutableTarget[prop] = value;
      }
    });

    // Clear out any keys that aren't in the new data
    Object.keys(mutableTarget).forEach((prop) => {
      if (!(prop in nextObject)) {
        delete mutableTarget[prop];
      }
    });
  } else {
    // Just empty the old object
    Object.keys(mutableTarget).forEach((prop) => {
      delete mutableTarget[prop];
    });
  }

  // If the user is reading this object while a component is rendering,
  // they're doing it wrong.
  mutableTarget[IS_OLD_STORE] = true;
};