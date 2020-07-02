const core = require('@actions/core');

function compareCoverage(filename){
  
}

/**
 * Coverage.xml files contain the test coverage of each file.
 * We need to compare coverage for the files to ensure test coverage 
 * did not lower substantially.
 * 
 * makeRegEx returns a regular expression that matches the provided filename
 * for use with finding and comparing test coverage. The input filename 
 * determines which file to put in the regular expression.
 * 
 * @since 2020.07.02
 * @access public
 * 
 * @param {string} filename 
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
