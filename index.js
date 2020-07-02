const core = require('@actions/core');

/**
 * Compare coverage reports test coverage for given file.
 * 
 * Takes file name, compares test coverage of the file from previous and current 
 * coverage XML reports. Uses regular expression to find test coverage results
 * from each report for the file and the coverage value is in the first group of the match.
 * 
 * @since 2020.07.02
 * @access public
 * 
 * @param {String} filename name of file to compare coverage
 * @param {Number} minCoverage minimum coverage to pass check
 * @param {Number} maxCoverageChange max coverage change to pass check
 * 
 * @return {Number} Change in coverage
 */
function compareCoverage(filename, minCoverage, maxCoverageChange){
  
}

/**
 * Create a regular expression to find the filename and test coverage of the file.
 * 
 * makeRegEx returns a regular expression that matches the provided filename
 * for use with finding and comparing test coverage. The input filename 
 * determines which file to put in the regular expression.
 * 
 * @since 2020.07.02
 * @access public
 * 
 * @param {String} filename Name of file to match
 * 
 * @return {RegExp} Regular Expression that matches filename and provides coverage value as a group
 */
function makeRegEx(filename){
  return new RegExp(`<class name="\w*.py" filename="${filename}" complexity="\d*" line-rate="(\d*\.?\d*)" branch-rate=...>`)
}

// most @actions toolkit packages have async methods
async function run() {
  try { 
    const minCoverage = core.getInput('minNewCoverage');
    const maxCoverageChange = core.getInput('maxCoverageChange');
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
