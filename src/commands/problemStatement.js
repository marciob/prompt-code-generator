const appState = require("../core/state");

function addProblemStatement(rl) {
  console.clear();
  console.log("Enter your problem statement:");
  console.log(
    '(Type on multiple lines. Type "DONE" on a new line when finished)'
  );
  console.log("---------------------------------------------");

  let statement = "";

  return new Promise((resolve) => {
    const promptLine = () => {
      rl.question("> ", (line) => {
        if (line.trim() === "DONE") {
          appState.setProblemStatement(statement.trim());
          console.log("\nProblem statement saved.");
          setTimeout(() => resolve(["main"]), 1000);
        } else {
          statement += line + "\n";
          promptLine();
        }
      });
    };

    promptLine();
  });
}

module.exports = {
  addProblemStatement,
};
