---
name: conventional-commit
description: >-
  Prompt and workflow for generating conventional commit messages using a
  structured XML format. Guides users to create standardized, descriptive
  commit messages in line with the Conventional Commits specification,
  including instructions, examples, and validation.
---
### Instructions
```xml
  <description>This file contains a prompt template for generating conventional
  commit messages. It provides instructions, examples, and formatting guidelines
  to help users write standardized, descriptive commit messages in accordance
  with the Conventional Commits specification.</description>
```
### Workflow
**Follow these steps:**
1. Run `git status` to review changed files.
2. Run `git diff` or `git diff --cached` to inspect changes.
3. Construct your commit message using the following XML structure.
4. After generating your commit message, run the commit command below.
5. If the request includes pushing to GitHub, run `git push` after committing.

> ⚠️ **Do not run `git add` — staging is the user's responsibility.**

```bash
git commit -m "type(scope): description"
# If push is requested:
git push
```

### Commit Message Structure
```xml
<commit-message>
  <type>feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert</type>
  <scope>()</scope>
  <description>A short, imperative summary of the change</description>
  <body>(optional: more detailed explanation)</body>
  <footer>(optional: BREAKING CHANGE: details, or issue references)</footer>
</commit-message>
```
### Examples
```xml
<examples>
  <example>feat(parser): add ability to parse arrays</example>
  <example>fix(ui): correct button alignment</example>
  <example>docs: update README with usage instructions</example>
  <example>refactor: improve performance of data processing</example>
  <example>chore: update dependencies</example>
  <example>feat!: send email on registration
    (BREAKING CHANGE: email service required)</example>
</examples>
```
### Validation
```xml
<validation>
  <type>
    Must be one of the allowed types.
    See https://www.conventionalcommits.org/en/v1.0.0/#specification
  </type>
  <scope>Optional, but recommended for clarity.</scope>
  <description>
    Required. Use the imperative mood (e.g., "add", not "added").
  </description>
  <body>Optional. Use for additional context.</body>
  <footer>Use for breaking changes or issue references.</footer>
</validation>
```
### Final Step
```xml
<final-step>
  <cmd>git commit -m "type(scope): description"</cmd>
  <push>git push (only if push to GitHub is explicitly requested)</push>
  <warning>Never run git add — staging is the user's responsibility.</warning>
  <note>Replace with your constructed message. Include body/footer if needed.</note>
</final-step>
```