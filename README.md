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

### Usage
```
    - name: Changed Files
      uses: lots0logs/gh-action-get-changed-files@2.1.4
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
    - name: Check test coverage
      uses: AveryCameronUofR/test-coverage-check-gh-action@1.0.10
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        branch: ${{ github.base_ref }}
        minNewCoverage: 0.8 (Optional, 0.8 default)
        maxCoverageChange: 0.1 (Optional, 0.1 default)
```
