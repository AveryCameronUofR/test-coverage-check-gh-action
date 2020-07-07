## Test Coverage Check
Checks test coverage of added and modified files and adds report as a comment to a pull request.

### Requirements
Uses JSON files for modified and added files in format:
- files_modified.json
- files_added.json
This can be done with [lots0logs/gh-action-get-changed-files@2.1.4](https://github.com/lots0logs/gh-action-get-changed-files) or similar actions.
    
Coverage XML files:
- New coverage: ``` coverage.xml ```
- old coverage:  ``` <branch>-coverage.xml ```

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

### Action Inputs

| Name | Description | Default |
| --- | --- | --- |
| `token` | `GITHUB_TOKEN` or a `repo` scoped [PAT](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line). | `GITHUB_TOKEN` |
| `branch` | The full name of the branch to compare coverage against. For coverage.xml comparison. | none |
| `minNewCoverage` | The minimum coverage required for a file to pass. | 0.8 |
| `maxCoverageChange` | The maximum decrease in coverage from initial to new coverage allowed. | 0.1 |

### Action Outputs
None

### Action Result
Fails workflow when coverage for files (modified or newly added) do not meet the minimum coverage or the maximum coverage change.

Pull Request Comments:
Adds comments to the pull request for Added and modified files in the following format:
  | Added Files | Coverage |
  |---|---|
  |githubActions.py | 0.875 &#9989; |

  | Modified Files | Coverage | Change in Coverage |
  |---|---|---|
  | githubActions.py | 0.875 &#9989; |  0 &#9989; |  
  
### Modification
To use and modify the action for yourself:
Make sure that node is installed on your computer. Then run ``` npm install ``` to update node_modules.

Make configuration modifications to the ``` actions.yml ``` file as needed.

Updated the dist/index.js file using [zeit/ncc](https://www.npmjs.com/package/@zeit/ncc)

Install ncc with: ``` npm i -g @zeit/ncc ```

Run ncc with: ``` ncc build index.js ```

Create a new release tag and publish.
