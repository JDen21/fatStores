import { ControllerError } from "./controllers/externals.ts";
import { assertSnapshot } from "@std/testing/snapshot";
import { assertEquals } from "@std/assert";

const runSnapTest = Deno.args.includes("--snap") === false;

Deno.test({
  name: "ControllerError snap",
  ignore: runSnapTest,
  fn: async function (t) {
    const code = 400;
    const message = "Invalid arguments.";
    const err = new ControllerError(code, message);

    assertEquals(err.message, message);
    await assertSnapshot(t, JSON.stringify(err));
  },
});
