const core = require("@actions/core");
const { promises: fs } = require("fs");
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
 * @return {Array} Change in coverage and current coverage of file.
 */
async function compareCoverage(filename) {
  var coverageRegEx = makeRegEx(filename);
  const originalCoverageReport = await fs.readFile("./coverage1.xml", "utf8");
  const currentCoverageReport = await fs.readFile("./coverage.xml", "utf8");
  var originalCoverage = coverageRegEx.exec(originalCoverageReport);
  var currentCoverage = coverageRegEx.exec(currentCoverageReport);
  var coverageChange = originalCoverage[1] - currentCoverage[1];
  return [coverageChange, currentCoverage[1]];
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

// most @actions toolkit packages have async methods
async function run() {
  try {
    const minCoverage = core.getInput("minNewCoverage");
    const maxCoverageChange = core.getInput("maxCoverageChange");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
