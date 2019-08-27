const readline = require("readline-sync");
const state = require("./state");

function robot() {
  const content = {
    maximumSentences: 7
  };
  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = ansAndReturnPrefix();

  state.save(content);

  function askAndReturnSearchTerm() {
    return readline.question("Type a Wikipedia search term: ");
  }

  function ansAndReturnPrefix() {
    const prefixes = ["Who is", "What is", "The history of"];
    const selectedPrefixIndex = readline.keyInSelect(
      prefixes,
      "Choose one option: "
    );
    const selectedPrefixText = prefixes[selectedPrefixIndex];

    return selectedPrefixText;
  }
}

module.exports = robot;
