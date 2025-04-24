import type { possibleErrorTypes } from "./types.d.ts";

export async function safeAsync<T>(promise: () => Promise<T>) {
  const arr: [possibleErrorTypes, T | null] = [null, null];
  try {
    const data = await promise();
    arr[1] = data;
  } catch (error) {
    if (error instanceof Error) {
      arr[0] = error;
    }

    switch (typeof error) {
      case "number":
      case "string": {
        arr[0] = error;
        break;
      }
      case "object": {
        arr[0] = JSON.stringify(error);
        break;
      }
      default: {
        arr[0] = error?.toString() || "Unknown error.";
      }
    }
  }
  return arr;
}
