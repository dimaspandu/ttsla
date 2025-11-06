import { getRandomCrossword } from "./procedures/getRandomCrossword";
// import { getWordDescription } from "./procedures/getWordDescription";

// ------------------------------------------------------------
// Entry point: an immediately invoked async function expression
// Used to run tests or demo logic without any framework.
// ------------------------------------------------------------
(async function main() {
  // ------------------------------------------------------------
  // Example test: getRandomCrossword()
  // ------------------------------------------------------------
  const crossword = getRandomCrossword();
  console.log("CHECK THE DATA:", crossword);

  // Basic validation checks
  console.assert(
    crossword !== null && crossword !== undefined,
    "getRandomCrossword() should not return null or undefined"
  );
  console.assert(
    typeof crossword === "object" || typeof crossword === "string",
    "getRandomCrossword() should return an object or string"
  );

  // ------------------------------------------------------------
  // The following tests are temporarily commented out
  // ------------------------------------------------------------

  // // Example test: getWordDescription("bijak")
  // const word = "bijak";
  // const desc = await getWordDescription(word);
  // console.log("getWordDescription:", desc);
  // console.assert(
  //   desc !== null && desc !== undefined,
  //   "getWordDescription() should not return null or undefined"
  // );
  // console.assert(
  //   typeof desc === "object" || typeof desc === "string",
  //   "getWordDescription() should return an object or string"
  // );

  // // Edge case test for empty string input
  // try {
  //   const bad = await getWordDescription("");
  //   console.assert(
  //     bad === null || bad === undefined || bad === "Not found",
  //     "getWordDescription('') should handle invalid input safely"
  //   );
  // } catch (err) {
  //   console.log("Handled expected error for empty string input:", err);
  // }

  console.log("All manual tests completed.");
})();
