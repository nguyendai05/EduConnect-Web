# EduConnect Web

EduConnect is a modular monolith that connects learners and parents with tutors. This repository currently contains the Sprint 0 project foundation only.

## Technology Stack

- UI foundation: HTML5, CSS3, and Vanilla JavaScript
- Backend direction: Java 17, Spring Boot 3.x, Spring MVC, JSP/JSTL
- Persistence direction: Spring Data JPA, MySQL 8, and Flyway
- Build tool: Maven

## Project Architecture

The backend follows a modular monolith and package-by-feature structure. Shared UI primitives are developed separately from page-specific assets so prototype HTML can later move to JSP with minimal restructuring.

## Repository Structure

- `docs/`: architecture, UI planning, database notes, and team conventions
- `ui-prototype/`: framework-free design tokens, shared components, and page prototypes
- `src/main/java/`: Spring Boot entry point and feature packages
- `src/main/resources/static/`: future production CSS, JavaScript, and images
- `src/main/webapp/WEB-INF/views/`: future JSP pages and fragments
- `scripts/`: project helper scripts added only when needed

## Development Stages

1. HTML/CSS/JS and a shared component system
2. JSP integration
3. Spring MVC and persistence
4. Business feature integration

## Getting Started

Requirements: JDK 17+ and Maven 3.6.3+.

```bash
mvn clean compile
mvn clean test
mvn clean package
```

The application is only a scaffold at this stage; database and security configuration are intentionally not implemented.

## Git Workflow

See [docs/conventions/git-workflow.md](docs/conventions/git-workflow.md).
