import assert from "node:assert/strict";
import test from "node:test";
import { chooseCatchSound } from "../src/lib/catch-sound.js";

test("each catch independently selects yummy or ugh", () => {
  const draws = [0.1, 0.2, 0.3, 0.8, 0.9, 0.1];
  const random = () => draws.shift();
  assert.deepEqual(
    Array.from({ length: 6 }, () => chooseCatchSound(random)),
    ["yummy", "yummy", "yummy", "ugh", "ugh", "yummy"],
  );
});

test("the selection boundary gives each recording half the random range", () => {
  assert.equal(chooseCatchSound(() => 0.499999), "yummy");
  assert.equal(chooseCatchSound(() => 0.5), "ugh");
});
