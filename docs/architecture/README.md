# Architecture

EduConnect is planned as a modular monolith. Backend code is grouped by business feature rather than by technical layer at the application root. A feature may introduce its own controller, service, repository, DTO, or entity packages later, only when its implementation needs them.

## Prototype-to-JSP Mapping

The prototype mirrors the future JSP organization so migration remains mechanical:

```text
ui-prototype/components/layout/user-header.html
  -> src/main/webapp/WEB-INF/views/fragments/layout/user-header.jspf

ui-prototype/pages/tutor/search.html
  -> src/main/webapp/WEB-INF/views/tutor/search.jsp

ui-prototype/css/ and ui-prototype/js/
  -> src/main/resources/static/css/ and src/main/resources/static/js/
```

Reusable layout, navigation, form, feedback, and common UI should become JSP fragments. Page-specific markup should become a JSP page within the matching feature folder. Shared CSS and JavaScript behavior remain independent of the page so they can be moved to `static/` without redesigning the UI.

This scaffold defines boundaries only. It does not introduce controllers, services, repositories, entities, authentication, or database behavior.
