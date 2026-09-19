# UI Prototype

The prototype is a framework-free workspace for establishing reusable UI before JSP integration.

```text
Design reference
  -> Design Token
  -> Shared UI Component
  -> Domain Component
  -> Page
  -> JSP Fragment / JSP Page
```

HTML files in Google Drive are not production source. They may be consulted for layout, typography, components, spacing, content, and UI states, but must not be copied into this repository as complete files.

Build shared primitives first, then domain components, and finally page compositions. Shared CSS belongs in `css/components/`, shared behavior belongs in `js/core/`, and page-specific assets belong in the corresponding `css/pages/` or `js/pages/` feature folder.
