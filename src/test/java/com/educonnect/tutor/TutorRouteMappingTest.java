package com.educonnect.tutor;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.context.annotation.ClassPathBeanDefinitionScanner;
import org.springframework.context.support.StaticApplicationContext;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import static org.junit.jupiter.api.Assertions.*;

/** Scan all tutor controllers together so overlapping handlers cannot hide behind MVC slices. */
class TutorRouteMappingTest {
    @ParameterizedTest
    @ValueSource(strings = {"db-dev", "ui-preview"})
    void publicRoutesHaveExactlyOneHandlerForEachProfile(String profile) {
        try (var context = new StaticApplicationContext()) {
            context.getEnvironment().setActiveProfiles(profile);
            var scanner = new ClassPathBeanDefinitionScanner(context, false);
            scanner.addIncludeFilter(new AnnotationTypeFilter(Controller.class));
            scanner.scan("com.educonnect.tutor.web");
            var mapping = new RequestMappingHandlerMapping();
            mapping.setApplicationContext(context);
            assertDoesNotThrow(mapping::afterPropertiesSet);
            for (String path : new String[]{"/tutor/search", "/tutor/profile"}) {
                var handlers = mapping.getHandlerMethods().entrySet().stream()
                        .filter(entry -> entry.getKey().getPatternValues().contains(path)
                                && entry.getKey().getMethodsCondition().getMethods().contains(RequestMethod.GET))
                        .toList();
                assertEquals(1, handlers.size(), profile + ": " + path);
                assertEquals(profile.equals("db-dev") ? "tutorDiscoveryPageController" : "tutorPreviewPageController",
                        handlers.get(0).getValue().getBean());
            }
        }
    }
}
