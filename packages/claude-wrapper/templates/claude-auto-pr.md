# Auto Create Pull Request

You are responsible for creating a pull request based on the changes made in this worktree. Your task is to analyze the changes and create a well-structured PR using the GitHub CLI.

## Original Objective
The goal was to: %REPLACE_WITH_PROMPT%

## Your Task
1. **Analyze the changes** - Understand what was implemented
2. **Run quality checks** - Ensure the code meets basic standards
3. **Create a comprehensive PR** - Generate title, description, and submit via `gh` CLI
4. **Assess production readiness** - Provide your professional judgment on the code quality

## Process

### Step 1: Analyze Changes
- Use `git status` and `git diff` to understand what changed
- Read modified files to understand the implementation
- Identify the scope and impact of changes

### Step 2: Quality Validation
Run available quality checks in this order of priority:
- Linting: `npm run lint`, `yarn lint`, `cargo clippy`, etc.
- Type checking: `npm run type-check`, `yarn type-check`, `tsc`, etc.
- Tests: `npm test`, `yarn test`, `cargo test`, `pytest`, etc.
- Build: `npm run build`, `yarn build`, `cargo build`, etc.

### Step 3: Generate PR Content

Create a PR with this structure:

**Title Format**: Brief, descriptive title (50 chars max)

**Description Template**:
```markdown
## Summary
Brief description of what was implemented

## Changes Made
- List of specific changes
- Files modified and why

## Original Objective
[Original prompt/goal]

## Testing
- [ ] Linting passed
- [ ] Type checking passed  
- [ ] Tests passed
- [ ] Build succeeded

## Production Readiness Assessment
**Score: X/10**

**Rationale**: 
Brief explanation of why this score was given

**Remaining Issues** (if any):
- List of issues that need to be addressed

## Reviewer Notes
Any specific areas that need attention during review
```

### Step 4: Create the PR
Use the GitHub CLI to create the PR:
```bash
gh pr create --title "Your Title" --body "$(cat <<'EOF'
Your description here
EOF
)"
```

### Step 5: Production Readiness Scoring
Rate the changes on a scale of 1-10:
- **1-3**: Major issues, not ready for production
- **4-6**: Good progress, but needs refinement  
- **7-8**: Solid implementation, minor issues
- **9-10**: Production ready, excellent quality

Consider:
- Code quality and maintainability
- Test coverage and passing status
- Documentation completeness
- Error handling
- Performance implications
- Security considerations

## Important Guidelines
- If critical tests fail, mention this prominently in the PR description
- Include both positive aspects and areas for improvement
- Be specific about any remaining work needed
- Use professional, constructive language
- Ensure the PR description helps reviewers understand the context

Begin the process now.