# Contributing to ShoeSwiper

Thank you for your interest in contributing to ShoeSwiper! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Security Considerations](#security-considerations)

## Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project maintainer at dadsellsgadgets@gmail.com. All complaints will be reviewed and investigated promptly and fairly.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0 (use `.nvmrc` with `nvm use`)
- npm >= 9.0.0
- Git
- A code editor with TypeScript support (VS Code recommended)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/shoeswipermainproject2.git
   cd shoeswipermainproject2
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ianmerrill10/shoeswipermainproject2.git
   ```

4. **Install dependencies**:
   ```bash
   cd shoeswiper-complete
   npm install
   ```

5. **Set up environment**:
   ```bash
   cp ../.env.example .env
   # Edit .env with your configuration
   ```

6. **Verify setup**:
   ```bash
   npm run lint
   npm test -- --run
   npm run dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

| Prefix | Purpose |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code refactoring |
| `test/` | Test additions or fixes |
| `chore/` | Maintenance tasks |

Examples:
- `feature/price-alert-notifications`
- `fix/favorites-sync-issue`
- `docs/api-documentation`

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Switch to main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

### Creating a Feature Branch

```bash
# Always branch from main
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

## Coding Standards

### TypeScript

- **Use TypeScript strict mode** - No exceptions
- **No `any` types** - Always use proper type definitions
- **Define interfaces in `src/lib/types.ts`** for shared types
- **Use proper generics** when applicable

```typescript
// ❌ Bad
const handleData = (data: any) => { ... }

// ✅ Good
interface UserData {
  id: string;
  name: string;
}
const handleData = (data: UserData) => { ... }
```

### React Components

- **Use functional components** with hooks
- **Use `useCallback` and `useMemo`** for performance optimization
- **Use React Query** (`@tanstack/react-query`) for data fetching
- **Use Zustand** for global state management

```typescript
// ✅ Good component structure
import { useCallback, useMemo } from 'react';

interface MyComponentProps {
  title: string;
  onAction: (id: string) => void;
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  const handleClick = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return (
    <div>
      <h1>{title}</h1>
      {/* ... */}
    </div>
  );
};
```

### Styling

- **Use Tailwind CSS** for all styling
- **Dark theme with `zinc-950` base**
- **Use Framer Motion** for animations

```typescript
// ✅ Good Tailwind usage
<div className="bg-zinc-950 text-white p-4 rounded-lg">
  <h1 className="text-xl font-bold">Title</h1>
</div>
```

### Console Logging

- **Always guard console.log statements** for production:

```typescript
// ✅ Good
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// ❌ Bad
console.log('Debug info:', data);
```

### JSDoc Comments

Add JSDoc comments to all public functions:

```typescript
/**
 * Tracks an affiliate click for revenue attribution
 * @param shoeId - The unique identifier of the shoe
 * @param source - Where the click originated (feed, search, alert)
 * @returns Promise<void>
 * @example
 * await trackAffiliateClick('shoe-123', 'price_alert');
 */
export const trackAffiliateClick = async (
  shoeId: string,
  source: ClickSource
): Promise<void> => {
  // Implementation
};
```

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no code change) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Examples

```bash
# Feature
git commit -m "feat(hooks): add price alert notification system"

# Bug fix
git commit -m "fix(favorites): resolve sync issue with Supabase"

# Documentation
git commit -m "docs(api): add JSDoc comments to useAdmin hook"

# Breaking change
git commit -m "feat(auth)!: change authentication flow to OAuth2

BREAKING CHANGE: Old token-based auth is no longer supported"
```

### Rules

1. Use imperative mood: "add" not "added" or "adds"
2. Don't capitalize the first letter of subject
3. No period at the end of subject
4. Keep subject under 72 characters
5. Use body for detailed explanations

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**:
   ```bash
   npm run lint
   npm test -- --run
   ```

2. **Update documentation** if needed

3. **Add tests** for new features

4. **Rebase on main** to ensure clean history:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### PR Checklist

Use this checklist in your PR description:

```markdown
## Checklist

- [ ] Code follows the project coding standards
- [ ] No `any` types are used
- [ ] Console.log statements are guarded with `import.meta.env.DEV`
- [ ] Tests are passing (`npm test -- --run`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated (if applicable)
- [ ] Affiliate tags are preserved (if touching Amazon URLs)
- [ ] No secrets or API keys are exposed
```

### PR Title Format

Use the same format as commit messages:

```
feat(scope): brief description
```

### Review Process

1. At least one maintainer review is required
2. All CI checks must pass
3. Address all review comments
4. Squash commits if requested

## Testing Requirements

### What to Test

- All new hooks must have corresponding tests
- All utility functions must be tested
- Component tests for complex interactions
- Integration tests for critical user flows

### Test Location

- `src/__tests__/` - General component tests
- `src/hooks/__tests__/` - Hook-specific tests

### Running Tests

```bash
# Run tests once
npm test -- --run

# Run tests in watch mode
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- useAdmin.test.ts
```

### Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../useFavorites';

describe('useFavorites', () => {
  it('should add a shoe to favorites', async () => {
    const { result } = renderHook(() => useFavorites());
    
    await act(async () => {
      await result.current.addFavorite('shoe-123');
    });
    
    expect(result.current.isFavorite('shoe-123')).toBe(true);
  });
});
```

## Security Considerations

### Critical Rules

1. **Never expose API keys** in client-side code
2. **Never commit `.env` files** with real credentials
3. **Use `VITE_` prefix** only for safe public variables
4. **Validate all user inputs**
5. **Use RLS policies** on Supabase tables

### Amazon Affiliate Tag

**All Amazon links MUST include `?tag=shoeswiper-20`**

```typescript
// ✅ Correct
const formatAmazonUrl = (url: string) => {
  if (!url.includes('amazon.com')) return url;
  const urlObj = new URL(url);
  urlObj.searchParams.set('tag', 'shoeswiper-20');
  return urlObj.toString();
};
```

### Reporting Security Issues

See [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

## Questions?

If you have questions, please:

1. Check existing issues and discussions
2. Open a new issue with the `question` label
3. Contact the maintainer at dadsellsgadgets@gmail.com

---

Thank you for contributing to ShoeSwiper! 🎉
