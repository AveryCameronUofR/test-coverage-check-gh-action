const core = require("@actions/core");
const github = require("@actions/github");
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
  const files_added_json = parseJsonString(files_added);
  let addedFileCoverage = [];
  files_added_json.forEach((file) => {
    let coverage = checkNewCoverage(file);
    if (coverage) {
      addedFileCoverage.push({
        filename: file,
        coverage: coverage,
      });
    }
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
  const coverageRegEx = makeRegEx(filename);
  const currentCoverageReport = fs.readFileSync(`${process.env.GITHUB_WORKSPACE}/coverage.xml`, "utf8");
  let currentCoverage = coverageRegEx.exec(currentCoverageReport);
  return currentCoverage != null ? currentCoverage[1] : null;
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
 * @param {String} branch name of branch to compare coverage
 *
 * @return {Array} Array of objects with file name and coverage and change in coverage.
 */
function checkModifiedFileCoverage(branch) {
  const files_modified = fs.readFileSync(`${process.env.HOME}/files_modified.json`, "utf8");
  const files_modified_json = parseJsonString(files_modified);
  let modifiedFileCoverage = [];
  files_modified_json.forEach((file) => {
    let coverage = compareCoverage(file, branch);
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
 * @param {String} branch branch to compare coverage.
 *
 * @return {Array} Current coverage of file and change in coverage .
 */
function compareCoverage(filename, branch) {
  const coverageRegEx = makeRegEx(filename);
  const currentCoverageReport = fs.readFileSync(`${process.env.GITHUB_WORKSPACE}/coverage.xml`, "utf8");
  let originalCoverageReport = currentCoverageReport;
  //Check for the original coverage report (it may not exist on first run so use current coverage report)
  try {
    originalCoverageReport = fs.readFileSync(`${process.env.GITHUB_WORKSPACE}/${branch}-coverage.xml`, "utf8");
  } catch {
    console.log(
      `${process.env.GITHUB_WORKSPACE}/${branch}-coverage.xml not found, comparing against original coverage`
    );
  }

  let currentCoverage = coverageRegEx.exec(currentCoverageReport);
  let originalCoverage = coverageRegEx.exec(originalCoverageReport);
  if (currentCoverage === null) return null;
  if (originalCoverage === null) originalCoverage = currentCoverage;
  let coverageChange = currentCoverage[1] - originalCoverage[1];
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
  return new RegExp(`filename="${filename}" complexity="\\d*" line-rate="(\\d*\\.?\\d*)"`);
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
  let report = `
  | Added Files | Coverage |
  |---|---|
  `;
  addedFileCoverage.forEach((file) => {
    let unicode = "&#9989;";
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
 * @param {Array} maxCoverageChange maximum change in coverage to allow.
 *
 * @return {String} markdown table for modified files and coverage.
 */
function formatModifiedCoverageReport(modifiedFileCoverage, minCoverage, maxCoverageChange) {
  let report = `
  | Modified Files | Coverage | Change in Coverage |
  |---|---|---|
  `;
  modifiedFileCoverage.forEach((file) => {
    let unicodeCoverage = "&#9989;";
    if (file.coverage < minCoverage) unicodeCoverage = "&#10060;";
    let unicodeCoverageChange = "&#9989;";
    if (file.coverageChange < maxCoverageChange) unicodeCoverageChange = "&#10060;";
    report += `| ${file.filename} | ${file.coverage} ${unicodeCoverage} |  ${file.coverageChange} ${unicodeCoverageChange} |  \n`;
  });
  return report;
}

/**
 * Comments Coverage Reports on Pull Request.
 *
 * Adds pull request comment for added and modified file coverage to the
 * pull request that was opened.
 *
 * @since 1.0.13
 * @param {String} addedReport Markdown table report for added file coverage.
 * @param {String} modifiedReport Markdown table report for modified file coverage.
 *
 */
function commentCoverage(addedReport, modifiedReport) {
  const token = process.env["GITHUB_TOKEN"] || core.getInput("token");
  const octokit = new github.getOctokit(token);
  const context = github.context;

  if (context.payload.pull_request == null) {
    core.setFailed("No pull request found.");
    return;
  }

  const pull_request_number = context.payload.pull_request.number;
  const added_comment = octokit.issues.createComment({
    ...context.repo,
    issue_number: pull_request_number,
    body: addedReport,
  });
  const modified_comment = octokit.issues.createComment({
    ...context.repo,
    issue_number: pull_request_number,
    body: modifiedReport,
  });
}

/**
 * Checks file coverage for failing coverage parameters.
 *
 * Checks modified and added file coverage against minCoverage
 * and maxCoverageChange and returns a pass fail.
 *
 * @since 1.0.10
 * @param {Array} addedFileCoverage array of objects with filename and coverage.
 * @param {Array} modifiedFileCoverage array of objects with filename and coverage.
 * @param {Array} minCoverage minimum coverage to pass.
 * @param {Array} maxCoverageChange maximum change in coverage to allow.
 *
 * @return {Boolean} Pass/Fail of change in coverage.
 */
function checkCoveragePassFail(addedFileCoverage, modifiedFileCoverage, minCoverage, maxCoverageChange) {
  let coveragePass = true;
  addedFileCoverage.forEach((file) => {
    if (file.coverage < minCoverage) coveragePass = false;
  });
  modifiedFileCoverage.forEach((file) => {
    if (file.coverage < minCoverage || file.coverageChange < maxCoverageChange) coveragePass = false;
  });

  return coveragePass;
}

/**
 * Runs test coverage comparison.
 *
 * Gets inputs from GitHub. Checks added and modified file coverage. 
 * Generates added and modified file coverage reports in markdown format.
 * Adds reports to pull request via comment. Returns a pass/fail for coverage criteria.
 *
 * @since 1.0.0
 */
function run() {
  try {
    const minCoverage = core.getInput("minNewCoverage");
    const maxCoverageChange = -1 * core.getInput("maxCoverageChange");
    const branch = core.getInput("branch");

    const addedFileCoverage = checkAddedFileCoverage();
    const modifiedFileCoverage = checkModifiedFileCoverage(branch);

    const addedReport = formatAddedCoverageReport(addedFileCoverage, minCoverage);
    const modifiedReport = formatModifiedCoverageReport(modifiedFileCoverage, minCoverage, maxCoverageChange);
    commentCoverage(addedReport, modifiedReport);

    const coverageOutcome = checkCoveragePassFail(
      addedFileCoverage,
      modifiedFileCoverage,
      minCoverage,
      maxCoverageChange
    );

    if (!coverageOutcome) {
      const coverage_comment = octokit.issues.createComment({
        ...context.repo,
        issue_number: pull_request_number,
        body: "Coverage Failed: Please view full coverage report.",
      });
      core.setFailed("Coverage Change parameters Failed");
      return;
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
