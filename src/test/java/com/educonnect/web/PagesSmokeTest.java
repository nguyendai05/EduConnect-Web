package com.educonnect.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("ui-preview")
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PagesSmokeTest {
    record Page(String url, String view, String layout) {}
    record Assets(List<String> css, List<String> js, List<String> headJs, List<String> bodyJs) {}
    record Tag(String name, Map<String, String> attributes) {}

    private static final Pattern TAG = Pattern.compile("<([A-Za-z][\\w:-]*)\\b([^>]*?)>", Pattern.DOTALL);
    private static final Pattern ATTRIBUTE = Pattern.compile("\\s([\\w:-]+)\\s*=\\s*([\"'])(.*?)\\2", Pattern.DOTALL);
    private final Set<String> checkedUrls = new HashSet<>();
    private final Map<String, Assets> assets = readAssets();

    @Autowired MockMvc mvc;
    @Autowired ApplicationContext context;

    static Stream<Page> pages() {
        try (var input = PagesSmokeTest.class.getResourceAsStream("/pages.csv")) {
            assertNotNull(input);
            return new String(input.readAllBytes(), StandardCharsets.UTF_8).lines().skip(1)
                    .filter(line -> !line.isBlank()).map(line -> {
                        var fields = line.split(",", -1);
                        return new Page(fields[0], fields[1], fields[2]);
                    }).toList().stream();
        } catch (Exception exception) { throw new IllegalStateException("Cannot read pages.csv", exception); }
    }

    private static Map<String, Assets> readAssets() {
        try (var input = PagesSmokeTest.class.getResourceAsStream("/page-assets.json")) {
            return new ObjectMapper().readValue(input, new TypeReference<>() {});
        } catch (Exception exception) { throw new IllegalStateException("Cannot read asset contract", exception); }
    }

    static List<Tag> tags(String html) {
        var result = new ArrayList<Tag>();
        var matcher = TAG.matcher(html);
        while (matcher.find()) {
            var attributes = new LinkedHashMap<String, String>();
            var attr = ATTRIBUTE.matcher(matcher.group(2));
            while (attr.find()) attributes.put(attr.group(1), decode(attr.group(3)));
            result.add(new Tag(matcher.group(1).toLowerCase(Locale.ROOT), attributes));
        }
        return result;
    }

    private static String decode(String value) {
        return value.replace("&amp;", "&").replace("&quot;", "\"")
                .replace("&#39;", "'").replace("&#x27;", "'");
    }

    static String previewPath(String source) {
        if (source.equals("/js/data/fixtures.js") || source.equals("/js/data/store.js"))
            return "/js/preview/" + source.substring(source.lastIndexOf('/') + 1);
        if (source.startsWith("/js/pages/admin/") && source.endsWith("-data.js"))
            return "/js/preview/" + source.substring(source.lastIndexOf('/') + 1);
        return source;
    }

    static List<String> scriptUrls(String html) {
        return tags(html).stream().filter(t -> t.name().equals("script") && t.attributes().containsKey("src"))
                .map(t -> t.attributes().get("src")).toList();
    }

    static boolean requiresDatabase(String url) {
        return url.split("\\?", 2)[0].equals("/tutor/manage");
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("pages")
    void pageAndInternalResourcesRender(Page page) throws Exception {
        // Trang quản lý của Đạt chỉ đăng ký controller trong db-dev.
        if (requiresDatabase(page.url())) {
            mvc.perform(get(page.url())).andExpect(status().isNotFound());
            return;
        }

        var result = mvc.perform(get(page.url())).andExpect(status().isOk())
                .andExpect(content().contentType("text/html;charset=UTF-8"))
                .andExpect(view().name(page.view())).andReturn();
        var html = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertFalse(Pattern.compile("\\bth:[a-z][\\w-]*\\s*=", Pattern.CASE_INSENSITIVE).matcher(html).find());
        assertFalse(html.contains("${"));
        assertFalse(html.contains("[["));
        // BEM classes contain __; reject unresolved preprocessing expressions instead.
        assertFalse(Pattern.compile("__\\s*[\\$#@]\\{").matcher(html).find());
        var expected = assets.get(page.url());
        assertNotNull(expected, "Missing asset contract");
        var actualCss = tags(html).stream().filter(t -> t.name().equals("link") && "stylesheet".equals(t.attributes().get("rel")))
                .map(t -> t.attributes().get("href")).toList();
        assertEquals(expected.css(), actualCss, "CSS order");
        var actualJs = scriptUrls(html);
        assertEquals(expected.js().stream().map(PagesSmokeTest::previewPath).toList(), actualJs, "Full preview JS order");
        assertEquals(expected.js().stream().map(PagesSmokeTest::previewPath).filter(p -> !p.startsWith("/js/preview/")).toList(),
                actualJs.stream().filter(p -> !p.startsWith("/js/preview/")).toList(), "Non-preview JS order");
        var head = html.substring(html.indexOf("<head>"), html.indexOf("</head>"));
        assertEquals(expected.headJs().stream().map(PagesSmokeTest::previewPath).toList(), scriptUrls(head), "Head script position");
        assertEquals(expected.bodyJs().stream().map(PagesSmokeTest::previewPath).toList(),
                scriptUrls(html.substring(html.indexOf("<body"))), "Body script position");
        for (var tag : tags(html)) for (var key : List.of("href", "src", "action")) {
            var url = tag.attributes().get(key);
            if (url == null) continue;
            assertFalse(url.contains(".html"), "Legacy URL attribute");
            if (!url.startsWith("/") || url.startsWith("//")) continue;
            var target = url.split("#", 2)[0];
            if (checkedUrls.add(target)) {
                if (requiresDatabase(target)) {
                    mvc.perform(get(target)).andExpect(status().isNotFound());
                } else {
                    mvc.perform(get(target)).andExpect(status().isOk());
                }
            }
        }
    }

    @Test void homeAliasesAndUnknownRoute() throws Exception {
        mvc.perform(get("/")).andExpect(status().isOk()).andExpect(view().name("pages/home"));
        mvc.perform(get("/home")).andExpect(status().isOk()).andExpect(view().name("pages/home"));
        mvc.perform(get("/missing-page")).andExpect(status().isNotFound());
    }

    @Test void previewHasNoDatasource() {
        assertTrue(context.getBeansOfType(DataSource.class).isEmpty());
        assertTrue(context.getBeansOfType(org.flywaydb.core.Flyway.class).isEmpty());
    }

    @Test void contextPathIsIncludedInRenderedUrls() throws Exception {
        var result = mvc.perform(get("/edu/auth/login").contextPath("/edu")).andExpect(status().isOk()).andReturn();
        var html = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertTrue(tags(html).stream().anyMatch(t -> "app-base".equals(t.attributes().get("name")) && "/edu/".equals(t.attributes().get("content"))));
        assertTrue(scriptUrls(html).stream().allMatch(url -> url.startsWith("/edu/js/")));
        mvc.perform(get("/edu/js/core/route.js").contextPath("/edu")).andExpect(status().isOk());
    }
}
