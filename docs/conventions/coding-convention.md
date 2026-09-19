# Coding Convention

## Frontend

- Use kebab-case for CSS classes and component CSS filenames.
- Use camelCase for JavaScript variables and functions.
- Avoid inline styles except for a documented exceptional case.
- Do not place inline scripts in pages.
- Use design tokens instead of hardcoding brand colors.
- Page CSS must not redefine shared components.
- Component CSS manages only its own component.

## Java

- Use lowercase package names.
- Use PascalCase for classes and camelCase for methods and variables.
- Keep business logic out of controllers.
- Use named constants or enums instead of magic strings for statuses.
- Keep feature code inside its feature package; do not create root-level technical-layer packages.
