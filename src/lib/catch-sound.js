export function chooseCatchSound(random = Math.random) {
  return random() < 0.5 ? "yummy" : "ugh";
}
