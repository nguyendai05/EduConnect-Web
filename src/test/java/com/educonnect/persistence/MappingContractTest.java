package com.educonnect.persistence;

import jakarta.persistence.*;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.boot.spi.MetadataImplementor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.lang.reflect.Field;
import java.util.*;
import java.util.regex.Pattern;
import static org.junit.jupiter.api.Assertions.*;

/** Đối chiếu độc lập toàn bộ bảng/cột/PK với SQL; không kết nối DB. */
class MappingContractTest {
    static List<Class<?>> entities() throws Exception {
        var scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(Entity.class));
        List<Class<?>> result = new ArrayList<>();
        for (var candidate : scanner.findCandidateComponents("com.educonnect"))
            result.add(Class.forName(candidate.getBeanClassName()));
        return result;
    }
    static String sql(String file) throws Exception {
        try (var stream = MappingContractTest.class.getResourceAsStream("/db/migration/" + file)) {
            assertNotNull(stream); return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
    @Test void everyBusinessTableColumnAndKeyHasOneCanonicalMapping() throws Exception {
        Map<String, String> tables = new HashMap<>();
        var matcher = Pattern.compile("CREATE TABLE (\\w+) \\((.*?)\\n\\) ENGINE", Pattern.DOTALL)
                .matcher(sql("V1__educonnect_schema.sql") + sql("V4__pending_email_otp.sql"));
        while (matcher.find()) if (!matcher.group(1).equals("dev_seed_runs")) tables.put(matcher.group(1), matcher.group(2));
        assertEquals(51, tables.size());
        Set<String> mapped = new HashSet<>(); int keys = 0;
        for (Class<?> type : entities()) {
            String table = type.getAnnotation(Table.class).name();
            assertTrue(mapped.add(table), "Duplicate Entity: " + table);
            assertTrue(tables.containsKey(table), table);
            Set<String> expected = new HashSet<>();
            var columns = Pattern.compile("(?m)^    (\\w+) (?:BIGINT|INT|SMALLINT|TINYINT|BOOLEAN|VARCHAR|CHAR|DECIMAL|DATETIME|DATE|TIME|TEXT|BINARY|JSON)\\b").matcher(tables.get(table));
            while(columns.find()) expected.add(columns.group(1));
            Set<String> actual = new HashSet<>(); Set<String> ids = new HashSet<>();
            for(Field field : type.getDeclaredFields()) {
                if (field.isAnnotationPresent(Column.class)) {
                    Column column = field.getAnnotation(Column.class);
                    assertTrue(actual.add(column.name()), table + "." + column.name());
                    if(field.isAnnotationPresent(Id.class)) ids.add(column.name());
                    if(field.getType().isEnum()) {
                        assertEquals(EnumType.STRING, field.getAnnotation(Enumerated.class).value());
                        assertEquals(SqlTypes.VARCHAR, field.getAnnotation(JdbcTypeCode.class).value());
                        var sets = Pattern.compile("\\b" + column.name() + " IN \\(([^)]+)\\)").matcher(tables.get(table));
                        Set<String> largest = Set.of();
                        while (sets.find()) {
                            Set<String> values = new HashSet<>();
                            var literals = Pattern.compile("'([^']+)'").matcher(sets.group(1));
                            while (literals.find()) values.add(literals.group(1));
                            if (values.size() > largest.size()) largest = values;
                        }
                        if (!largest.isEmpty() && !table.equals("money_journals") && !table.equals("registration_sources")) {
                            Set<String> actualValues = new HashSet<>();
                            for (Object value : field.getType().getEnumConstants()) actualValues.add(((Enum<?>) value).name());
                            assertEquals(largest, actualValues, table + "." + column.name());
                        }
                    }
                }
                if(field.isAnnotationPresent(EmbeddedId.class)) {
                    keys++; Class<?> key = field.getType();
                    assertTrue(key.isAnnotationPresent(Embeddable.class));
                    assertTrue(Serializable.class.isAssignableFrom(key));
                    key.getDeclaredMethod("equals",Object.class); key.getDeclaredMethod("hashCode");
                    for(Field part:key.getDeclaredFields()) if(part.isAnnotationPresent(Column.class)) {
                        String name=part.getAnnotation(Column.class).name(); assertTrue(actual.add(name)); ids.add(name);
                    }
                }
            }
            assertEquals(expected, actual, table);
            var pk = Pattern.compile("PRIMARY KEY \\(([^)]+)\\)").matcher(tables.get(table)); assertTrue(pk.find());
            assertEquals(new HashSet<>(Arrays.asList(pk.group(1).split(",\\s*"))), ids, table);
            String feature=type.getPackageName().replace(".domain", ".repository");
            Class<?> repository = Class.forName(feature + "." + type.getSimpleName() + "JpaRepository");
            assertTrue(org.springframework.data.jpa.repository.JpaRepository.class.isAssignableFrom(repository));
        }
        assertEquals(tables.keySet(), mapped); assertEquals(9, keys);
    }
    @Test void allNineKeysHaveValueEqualityAndSerializableIdentity() throws Exception {
        int count=0;
        for(Class<?> entity:entities()) for(Field field:entity.getDeclaredFields()) if(field.isAnnotationPresent(EmbeddedId.class)) {
            count++; var constructor=field.getType().getConstructors()[0];
            Object[] values=Arrays.stream(constructor.getParameterTypes()).map(type->type==Long.class?(Object)17L:"TEST").toArray();
            Object a=constructor.newInstance(values),b=constructor.newInstance(values);
            assertEquals(a,b);assertEquals(b,a);assertEquals(a.hashCode(),b.hashCode());assertNotEquals(a,null);
            Object[] changed=values.clone();changed[0]=changed[0] instanceof Long?18L:"OTHER";
            assertNotEquals(a,constructor.newInstance(changed));
            var bytes=new java.io.ByteArrayOutputStream();
            try(var out=new java.io.ObjectOutputStream(bytes)){out.writeObject(a);}
            try(var in=new java.io.ObjectInputStream(new java.io.ByteArrayInputStream(bytes.toByteArray()))){assertEquals(a,in.readObject());}
        }
        assertEquals(9,count);
        try(var stream=MappingContractTest.class.getResourceAsStream("/shared-entities.json")) {
            var inventory=new com.fasterxml.jackson.databind.ObjectMapper().readTree(stream);
            assertEquals(51,inventory.size());
            for(var entry:inventory) {
                var type=Class.forName("com.educonnect."+entry.get("feature").asText()+".domain."+entry.get("entity").asText());
                assertEquals(entry.get("table").asText(),type.getAnnotation(Table.class).name());
            }
        }
    }
    @Test void hibernateBootstrapsEveryMappingWithoutDuplicateWritableColumns() throws Exception {
        var registry = new StandardServiceRegistryBuilder()
                .applySetting("hibernate.dialect", "org.hibernate.dialect.MySQLDialect")
                .applySetting("hibernate.boot.allow_jdbc_metadata_access", "false")
                .applySetting("hibernate.type.preferred_instant_jdbc_type", "TIMESTAMP")
                .build();
        try {
            var sources = new MetadataSources(registry);
            for(Class<?> entity:entities()) sources.addAnnotatedClass(entity);
            var metadata = (MetadataImplementor) sources.buildMetadata();
            metadata.validate(); assertEquals(51, metadata.getEntityBindings().size());
        } finally { StandardServiceRegistryBuilder.destroy(registry); }
    }
}
