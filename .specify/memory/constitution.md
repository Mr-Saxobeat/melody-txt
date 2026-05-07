<!--
Sync Impact Report:
- Version: 1.0.0 → 2.0.0 (Relaxed test coverage threshold from 80% to 60%)
- Modified Principles: "Test Coverage Mandate" — threshold lowered from 80% to 60%
- Added Sections: None
- Removed Sections: None
- Templates Requiring Updates:
  ✅ plan-template.md - updated constitution check from 80% to 60%
  ✅ constitution.md - updated
  ✅ spec-template.md - no change needed
  ✅ tasks-template.md - no change needed
- Follow-up TODOs: None
-->

# melody-txt Constitution

## Core Principles

### I. Test Coverage Mandate (NON-NEGOTIABLE)

The project MUST maintain a minimum of 60% test coverage across all codebases. This
principle is non-negotiable and applies to both unit and integration tests.

**Rules:**
- No pull request may be merged if it drops coverage below 60%
- New features MUST include tests that maintain or improve coverage
- Both unit tests (isolated component testing) and integration tests (component
  interaction testing) are required
- Coverage reports MUST be generated and reviewed before each merge

**Rationale:** Test coverage ensures code reliability and catches regressions early.
The 60% threshold balances testing discipline with development velocity, ensuring
critical paths are covered without requiring exhaustive testing of all UI glue code.

### II. Test-First Development

Tests MUST be written before implementation code (Test-Driven Development approach).

**Rules:**
- Write test cases that define expected behavior
- Verify tests fail (Red phase)
- Implement minimum code to pass tests (Green phase)
- Refactor while keeping tests passing (Refactor phase)
- Tests serve as living documentation of system behavior

**Rationale:** Test-first development forces clear thinking about requirements and
interfaces before implementation, resulting in better design and more maintainable code.

### III. Clean Code Principles

Code MUST prioritize readability, simplicity, and maintainability over cleverness.

**Rules:**
- Use descriptive, intention-revealing names for variables, functions, and classes
- Functions should do one thing and do it well (Single Responsibility)
- Keep functions short (ideally under 20 lines, maximum 50 lines)
- Avoid deep nesting (maximum 3 levels)
- Prefer explicit over implicit; clarity over brevity
- Comments explain WHY, not WHAT (code should be self-documenting)
- Dead code MUST be removed, not commented out

**Rationale:** Code is read far more often than it is written. Clean, readable code
reduces cognitive load, accelerates onboarding, and minimizes bugs introduced during
maintenance.

### IV. Object-Oriented Design Principles

Code MUST follow fundamental OOP principles to ensure proper encapsulation,
extensibility, and maintainability.

**Rules:**
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Clients should not depend on interfaces they don't use
- **Dependency Inversion**: Depend on abstractions, not concretions
- Favor composition over inheritance
- Encapsulate what varies
- Program to interfaces, not implementations

**Rationale:** SOLID principles and OOP best practices create flexible, testable
architectures that accommodate change without requiring extensive rewrites.

### V. Human-Readable Code

Code MUST be written to be understood by humans first, machines second.

**Rules:**
- Variable and function names should read like natural language
- Avoid abbreviations unless universally understood (e.g., HTTP, URL)
- Use consistent naming conventions throughout the codebase
- Structure code to tell a story from top to bottom
- Complex algorithms MUST include explanatory comments describing approach
- Magic numbers and strings MUST be replaced with named constants

**Rationale:** Code that reads like prose reduces the mental effort required to
understand it, making the codebase more accessible to current and future developers.

## Testing Standards

### Unit Testing Requirements

- Each public method/function MUST have at least one unit test
- Tests MUST be isolated (no external dependencies like databases, APIs, filesystem)
- Use mocking/stubbing for dependencies
- Test names MUST clearly describe what is being tested and expected outcome
- Follow Arrange-Act-Assert (AAA) pattern
- Each test should verify one behavior

### Integration Testing Requirements

- Test component interactions in realistic scenarios
- Test database operations with test databases (not mocks)
- Test API endpoints end-to-end
- Test critical user workflows across multiple components
- Use test fixtures and setup/teardown appropriately
- Integration tests can be slower but must remain deterministic

### Test Quality Gates

- All tests MUST pass before merging
- No flaky tests allowed (tests must be deterministic)
- Test execution time MUST be monitored; slow tests require justification
- Coverage reports MUST be generated in CI/CD pipeline
- PRs that decrease coverage below 60% MUST be rejected automatically

## Development Workflow

### Code Review Requirements

- All code changes MUST go through pull request review
- At least one approval required before merge
- Reviewer MUST verify:
  - Tests exist and cover new/changed code
  - Code follows clean code principles
  - OOP principles are properly applied
  - Code is human-readable and well-named
  - Coverage remains above 60%

### Quality Checklist

Before committing code, developers MUST verify:
- [ ] All tests pass locally
- [ ] New tests written for new functionality
- [ ] Code coverage at or above 60%
- [ ] Code follows naming conventions
- [ ] Functions are small and focused
- [ ] OOP principles are applied correctly
- [ ] No code duplication (DRY principle)
- [ ] Documentation updated if needed

## Governance

This constitution supersedes all other development practices and guidelines. All team
members MUST adhere to these principles without exception.

### Amendment Process

- Constitutional changes require explicit documentation and team consensus
- Version number MUST be incremented following semantic versioning:
  - MAJOR: Backward-incompatible changes (removing/redefining principles)
  - MINOR: Adding new principles or expanding guidance
  - PATCH: Clarifications, wording improvements, non-semantic changes
- All amendments MUST include rationale and impact analysis
- Dependent templates and documentation MUST be updated with amendments

### Compliance Enforcement

- Pull requests MUST demonstrate constitutional compliance
- Automated tools (linters, coverage tools) MUST enforce technical requirements
- Code reviews MUST explicitly verify constitutional adherence
- Violations MUST be addressed before merge; no exceptions for "moving fast"
- Complexity and deviations MUST be justified and documented

### Continuous Improvement

- Constitution should evolve based on team retrospectives and lessons learned
- Propose amendments when principles prove inadequate or overly restrictive
- Balance principle adherence with pragmatic delivery
- Document learnings that should inform future constitutional updates

**Version**: 2.0.0 | **Ratified**: 2026-05-07 | **Last Amended**: 2026-05-08
