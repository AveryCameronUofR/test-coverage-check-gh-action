## Test Coverage Check
Checks test coverage of added and modified files and adds report as a comment to a pull request.

### Requirements
Uses JSON files for modified and added files in format:
- files_modified.json
- files_added.json
This can be done with [lots0logs/gh-action-get-changed-files@2.1.4](https://github.com/lots0logs/gh-action-get-changed-files) or similar actions.
    
Coverage XML files:
- New coverage: coverage.xml
- old coverage:  <branch>-coverage.xml
