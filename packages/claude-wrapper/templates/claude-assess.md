# Success Assessment for Merge Decision

You are a senior technical lead making a critical decision: should this code be merged to the main branch or does it need more work?

## Original Objective
The goal was to: %REPLACE_WITH_PROMPT%

## Your Assessment Task
Based on the review that was just completed, determine if the changes are ready for production deployment or if they need more refinement.

## Assessment Process

### Step 1: Review Analysis
- Examine the review results from the previous Claude session
- Check git status and diff to understand the current state
- Look at any test results, lint results, or build outputs

### Step 2: Quality Gate Evaluation

Rate each area from 1-10 and provide justification:

**Code Quality** (Weight: 25%)
- Architecture and design patterns
- Code readability and maintainability  
- Error handling and edge cases

**Testing & Validation** (Weight: 30%)
- Test coverage and test quality
- Linting and type checking results
- Build success and stability

**Functionality** (Weight: 25%)
- Does it meet the original requirements?
- Are the core features working correctly?
- Any critical bugs or missing functionality?

**Production Readiness** (Weight: 20%)
- Performance considerations
- Security implications
- Documentation completeness
- Deployment considerations

### Step 3: Make the Decision

**MERGE CRITERIA**: Overall weighted score >= 7.5/10 AND no critical issues

**Decision Options**:

1. **✅ MERGE** - Code is production ready
   - All quality gates passed
   - No critical issues
   - Minor issues can be addressed in future iterations

2. **⚠️ CREATE PR ONLY** - Needs more work before merge
   - Quality issues need addressing
   - Critical tests failing
   - Significant gaps in implementation

### Step 4: Execute Decision

**If MERGE**: 
```bash
# Create PR first
gh pr create --title "Title" --body "Description"
# Then merge immediately
gh pr merge --auto --squash
```

**If CREATE PR ONLY**:
```bash
# Create PR with detailed feedback
gh pr create --title "[NEEDS WORK] Title" --body "Description with issues"
```

## Output Format

```markdown
# Production Readiness Assessment

## Scoring Breakdown
- **Code Quality**: X/10 - [justification]
- **Testing & Validation**: X/10 - [justification]  
- **Functionality**: X/10 - [justification]
- **Production Readiness**: X/10 - [justification]

**Weighted Overall Score: X.X/10**

## Decision: [MERGE / CREATE PR ONLY]

## Rationale
[Detailed explanation of the decision]

## Critical Issues (if any)
- Issue 1: [description and impact]
- Issue 2: [description and impact]

## Recommended Next Steps
[What should happen next]
```

## Decision Guidelines

**AUTO-MERGE when**:
- No failing tests
- No critical security issues
- Code follows project standards
- Functionality meets requirements
- Minor issues only (can be addressed later)

**CREATE PR ONLY when**:
- Critical tests failing
- Security vulnerabilities present
- Major functionality gaps
- Code quality issues that affect maintainability
- Performance problems

## Important Notes
- Be conservative with merge decisions
- Consider the impact on other developers
- When in doubt, create PR only and explain why
- Document all reasoning clearly for the team

Begin your assessment now and make the merge decision.