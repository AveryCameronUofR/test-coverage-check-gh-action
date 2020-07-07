const core = require("@actions/core");
const github = require("@actions/github")
const fs = require("fs");

/**
 * Parse string to JSON object.
 *
 * Takes the JSON string object from the JSON files that hold modified
 * and added file information and returns a JSON object.
 *
 * @since 1.0.0
 *
 * @param {String} jsonString JSON in string form.
 *
 * @return {JSON} Parsed JSON object.
 */
function parseJsonString(jsonString) {
  return JSON.parse(jsonString);
}

/**
 * Gets the coverage of added files.
 *
 * Takes the JSON file with Added file information and gets the
 * test coverage of the added files and returns an array of coverage.
 *
 * @since 1.0.0
 *
 * @return {Array} Array of objects with file name and coverage.
 */
function checkAddedFileCoverage() {
  const files_added = fs.readFileSync(`${process.env.HOME}/files_added.json`, "utf8");
  var files_added_json = parseJsonString(files_added);
  var addedFileCoverage = [];
  files_added_json.forEach((file) => {
    addedFileCoverage.push({
      filename: file,
      coverage: checkNewCoverage(file),
    });
  });
  return addedFileCoverage;
}

/**
 * Get coverage for given file.
 *
 * Takes file name, and getstest coverage of the file from the current
 * coverage XML reports. Uses regular expression to find test coverage results
 * from each report for the file and the coverage value is in the first group of the match.
 *
 * @since 1.0.0
 *
 * @param {String} filename name of file to compare coverage.
 *
 * @return {Number} Current coverage of file.
 */
function checkNewCoverage(filename) {
  var coverageRegEx = makeRegEx(filename);
  const currentCoverageReport = fs.readFileSync("${process.env.HOME}/coverage.xml", "utf8");
  var currentCoverage = coverageRegEx.exec(currentCoverageReport);
  return currentCoverage[1];
}

/**
 * Gets the coverage of modified files.
 *
 * Takes the JSON file with modified file information and gets the
 * test coverage of the modified files and returns an array of file name,
 * coverage and change in coverage.
 *
 * @since 1.0.0
 *
 * @return {Array} Array of objects with file name and coverage and change in coverage.
 */
function checkModifiedFileCoverage() {
  const files_modified = fs.readFileSync(`${process.env.HOME}/files_modified.json`, "utf8");
  var files_modified_json = parseJsonString(files_modified);
  var modifiedFileCoverage = [];
  files_modified_json.forEach((file) => {
    coverage = compareCoverage(file);
    if (coverage !== null)
      modifiedFileCoverage.push({
        filename: file,
        coverage: coverage[0],
        coverageChange: coverage[1],
      });
  });
  return modifiedFileCoverage;
}

/**
 * Compare coverage reports test coverage for given file.
 *
 * Takes file name, compares test coverage of the file from previous and current
 * coverage XML reports. Uses regular expression to find test coverage results
 * from each report for the file and the coverage value is in the first group of the match.
 *
 * @since 1.0.0
 *
 * @param {String} filename name of file to compare coverage.
 *
 * @return {Array} Current coverage of file and change in coverage .
 */
function compareCoverage(filename) {
  var coverageRegEx = makeRegEx(filename);
  const originalCoverageReport = fs.readFileSync("${process.env.HOME}/coverage1.xml", "utf8");
  const currentCoverageReport = fs.readFileSync("${process.env.HOME}/coverage.xml", "utf8");
  var currentCoverage = coverageRegEx.exec(currentCoverageReport);
  var originalCoverage = coverageRegEx.exec(originalCoverageReport);
  if (originalCoverage === null) originalCoverage = currentCoverage;
  if (currentCoverage === null) return null;
  var coverageChange = currentCoverage[1] - originalCoverage[1];
  return [currentCoverage[1], coverageChange];
}

/**
 * Create a regular expression to find the filename and test coverage of the file.
 *
 * makeRegEx returns a regular expression that matches the provided filename
 * for use with finding and comparing test coverage. The input filename
 * determines which file to put in the regular expression.
 *
 * @since 1.0.0
 *
 * @param {String} filename Name of file to match.
 *
 * @return {RegExp} Regular Expression that matches filename and provides coverage value as a group.
 */
function makeRegEx(filename) {
  return new RegExp(
    `filename="${filename}" complexity="\\d*" line-rate="(\\d*\\.?\\d*)"`
  );
}

/**
 * Create a markdown table for added file coverage.
 *
 * Creates a table using github markdown syntax for added files and their coverage
 * Uses unicode checkmarks and x's to indicate pass fail easily, formats one file
 * per column.
 *
 * @since 1.0.0
 *
 * @param {Array} addedFileCoverage array of objects with filename and coverage.
 * @param {Array} minCoverage minimum coverage to pass.
 *
 * @return {String} markdown table for added files.
 */
function formatAddedCoverageReport(addedFileCoverage, minCoverage) {
  var report = `
  | Added Files | Coverage |
  |---|---|
  `;
  addedFileCoverage.forEach((file) => {
    var unicode = "&#9989;";
    if (file.coverage < minCoverage) unicode = "&#10060;";
    report += `| ${file.filename} | ${file.coverage} ${unicode} |  \n`;
  });
  return report;
}

/**
 * Create a markdown table for added file coverage.
 *
 * Creates a table using github markdown syntax for added files and their coverage
 * Uses unicode checkmarks and x's to indicate pass fail easily, formats one file
 * per column.
 *
 * @since 1.0.0
 *
 * @param {Array} modifiedFileCoverage array of objects with filename and coverage.
 * @param {Array} minCoverage minimum coverage to pass.
 * @param {Array} minCoverage maximum coverage to allow.
 *
 * @return {String} markdown table for modified files and coverage.
 */
function formatModifiedCoverageReport(
  modifiedFileCoverage,
  minCoverage,
  maxCoverageChange
) {
  var report = `
  | Modified Files | Coverage | Change in Coverage |
  |---|---|---|
  `;
  modifiedFileCoverage.forEach((file) => {
    var unicodeCoverage = "&#9989;";
    if (file.coverage < minCoverage) unicodeCoverage = "&#10060;";
    var unicodeCoverageChange = "&#9989;";
    if (file.coverageChange < maxCoverageChange)
      unicodeCoverageChange = "&#10060;";
    report += `| ${file.filename} | ${file.coverage} ${unicodeCoverage} |  ${file.coverageChange} ${unicodeCoverageChange} |  \n`;
  });
  return report;
}

// most @actions toolkit packages have async methods
async function run() {
  try {
    const minCoverage = core.getInput("minNewCoverage");
    const maxCoverageChange = -1 * core.getInput("maxCoverageChange");
    var modifiedFileCoverage = checkModifiedFileCoverage();
    var addedFileCoverage = checkAddedFileCoverage();

    var addedReport = formatAddedCoverageReport(addedFileCoverage, minCoverage);
    var modifiedReport = formatModifiedCoverageReport(
      modifiedFileCoverage,
      minCoverage,
      maxCoverageChange
    );

    const github_token = process.env['GITHUB_TOKEN'] || core.getInput('token');
    const context = github.context;
    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.');
      return;
    }
    const pull_request_number = context.payload.pull_request.number;
    const octokit = new github.GitHub(github_token);
    const added_comment = octokit.issues.createComment({
      ...context.repo,
      issue_number: pull_request_number,
      body: addedReport
    });
    const modified_comment = octokit.issues.createComment({
      ...context.repo,
      issue_number: pull_request_number,
      body: modifiedReport
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
