# Contributing

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (whitespace, formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools/libraries

### Examples

```
feat(skill-tracker): add search functionality for skills
fix(sync): resolve merge conflict handling issue
docs(readme): update installation instructions
refactor(track-skill): simplify skill validation logic
test(sync): add integration tests for sync functionality
chore: update shellcheck version in ci
```

### Guidelines

- Use lowercase for type and scope
- Keep description under 72 characters
- Use imperative mood ("add" not "added")
- Reference issues in footer: `Refs: #123`
- Include breaking changes in footer with `BREAKING CHANGE:`
