import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.io.PrintStream;
import java.sql.*;
import java.util.*;
import org.flywaydb.core.Flyway;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Công cụ DB độc lập: dùng thư viện đã resolve của project, không là controller/service.
 * Kết nối lấy từ EC_DB_URL, EC_DB_USER, EC_DB_PASSWORD; không in credential.
 * Chỉ chấp nhận schema educonnect_dev hoặc educonnect_test[_...].
 */
public class DatabaseTool {
    private static final String DEMO_PASSWORD = "EduconnectDemo!2026";
    private static String env(String name) {
        String value = System.getenv(name);
        if (value == null) throw new IllegalArgumentException("Thiếu biến " + name);
        return value;
    }
    private static String dbUrl(String name) {
        String url=env(name);
        if (!url.startsWith("jdbc:mysql://") || url.matches("(?is).*[?&](?:user|password|passwd)=.*"))
            throw new IllegalArgumentException("JDBC URL phải là MySQL và không chứa credential; dùng biến user/password riêng.");
        return url;
    }
    private static Connection connect() throws SQLException {
        Connection connection = DriverManager.getConnection(dbUrl("EC_DB_URL"), env("EC_DB_USER"), env("EC_DB_PASSWORD"));
        try (Statement statement = connection.createStatement()) {
            try (ResultSet rs = statement.executeQuery("SELECT DATABASE()")) {
                rs.next();
                String schema = rs.getString(1);
                if (schema == null || !(schema.equals("educonnect_dev") || schema.matches("educonnect_test(?:_[a-z0-9_]+)?"))) {
                    throw new IllegalArgumentException("Chỉ cho phép schema development/test Educonnect đã chỉ định.");
                }
            }
            statement.execute("SET time_zone = '+00:00'");
            statement.execute("SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci");
        } catch (Exception error) {
            connection.close();
            throw error;
        }
        return connection;
    }
    private static Flyway flyway() {
        return Flyway.configure().dataSource(dbUrl("EC_DB_URL"), env("EC_DB_USER"), env("EC_DB_PASSWORD"))
                .locations("filesystem:src/main/resources/db/migration")
                .baselineOnMigrate(false).cleanDisabled(true).load();
    }
    private static List<String> schemaShape(Connection connection) throws Exception {
        String schema;
        try (Statement s = connection.createStatement(); ResultSet rs = s.executeQuery("SELECT DATABASE()")) {
            rs.next(); schema = rs.getString(1);
        }
        List<String> shape = new ArrayList<>();
        String[] queries = {
            "SELECT table_name,table_type,engine,table_collation FROM information_schema.tables WHERE table_schema=? AND table_name<>'flyway_schema_history' ORDER BY table_name",
            "SELECT table_name,column_name,ordinal_position,column_type,is_nullable,column_default,extra,generation_expression,collation_name,column_comment FROM information_schema.columns WHERE table_schema=? AND table_name<>'flyway_schema_history' ORDER BY table_name,ordinal_position",
            "SELECT table_name,constraint_name,constraint_type,enforced FROM information_schema.table_constraints WHERE constraint_schema=? AND table_name<>'flyway_schema_history' ORDER BY table_name,constraint_name",
            "SELECT table_name,constraint_name,column_name,ordinal_position,referenced_table_name,referenced_column_name FROM information_schema.key_column_usage WHERE constraint_schema=? AND table_name<>'flyway_schema_history' ORDER BY table_name,constraint_name,ordinal_position",
            "SELECT constraint_name,check_clause FROM information_schema.check_constraints WHERE constraint_schema=? ORDER BY constraint_name",
            "SELECT table_name,constraint_name,referenced_table_name,update_rule,delete_rule FROM information_schema.referential_constraints WHERE constraint_schema=? AND table_name<>'flyway_schema_history' ORDER BY table_name,constraint_name",
            "SELECT table_name,index_name,non_unique,seq_in_index,column_name,sub_part,index_type FROM information_schema.statistics WHERE table_schema=? AND table_name<>'flyway_schema_history' ORDER BY table_name,index_name,seq_in_index",
            "SELECT table_name,view_definition,check_option,is_updatable,security_type FROM information_schema.views WHERE table_schema=? ORDER BY table_name"
        };
        for (int q=0; q<queries.length; q++) {
            try (PreparedStatement s = connection.prepareStatement(queries[q])) {
                s.setString(1,schema);
                try (ResultSet rs=s.executeQuery()) {
                    while (rs.next()) {
                        StringJoiner row=new StringJoiner("|"); row.add(Integer.toString(q));
                        for (int i=1;i<=rs.getMetaData().getColumnCount();i++) {
                            String value=rs.getString(i);
                            row.add(value==null?"<NULL>":value.replace("`"+schema+"`", "`<SCHEMA>`"));
                        }
                        shape.add(row.toString());
                    }
                }
            }
        }
        return shape;
    }
    private static List<String> referenceShape(Connection connection) throws Exception {
        List<String> rows=new ArrayList<>();
        String[] queries={"SELECT * FROM roles ORDER BY code", "SELECT * FROM subjects ORDER BY id", "SELECT * FROM grade_levels ORDER BY id", "SELECT * FROM areas ORDER BY id", "SELECT * FROM delivery_modes ORDER BY id", "SELECT * FROM order_status_transitions ORDER BY from_status,to_status,actor_role_code"};
        for(int q=0;q<queries.length;q++) try(Statement s=connection.createStatement();ResultSet rs=s.executeQuery(queries[q])) {
            while(rs.next()) { StringJoiner row=new StringJoiner("|");row.add(Integer.toString(q));
                for(int i=1;i<=rs.getMetaData().getColumnCount();i++)row.add(String.valueOf(rs.getString(i)));
                rows.add(row.toString()); }
        }
        return rows;
    }
    private static void compare(Connection connection) throws Exception {
        try(Connection other=DriverManager.getConnection(dbUrl("EC_DB_COMPARE_URL"),env("EC_DB_USER"),env("EC_DB_PASSWORD"))) {
            if(!schemaShape(connection).equals(schemaShape(other))) throw new IllegalStateException("Cấu trúc hai schema khác nhau; không baseline.");
            if(!referenceShape(connection).equals(referenceShape(other))) throw new IllegalStateException("Reference data V2 khác nhau; không baseline.");
            System.out.println("Schema compare: tables/columns/PK/FK rules/UNIQUE/enforced CHECK/index/views and V2 reference data identical");
        }
    }
    private static void sql(Connection connection, Path path) throws Exception {
        String delimiter = ";";
        StringBuilder buffer = new StringBuilder();
        int statements = 0;
        for (String line : Files.readAllLines(path)) {
            String trimmed = line.trim();
            if (trimmed.toUpperCase(Locale.ROOT).startsWith("DELIMITER ")) {
                delimiter = trimmed.substring(10).trim();
                continue;
            }
            buffer.append(line).append('\n');
            if (!trimmed.endsWith(delimiter)) continue;
            String statementText = buffer.toString().trim();
            statementText = statementText.substring(0, statementText.length() - delimiter.length());
            boolean expectedZero = statementText.contains("-- EXPECT_ZERO:");
            try (Statement statement = connection.createStatement()) {
                boolean result = statement.execute(statementText);
                do {
                    if (result) {
                        try (ResultSet rs = statement.getResultSet()) {
                            int rows = 0;
                            ResultSetMetaData md = rs.getMetaData();
                            while (rs.next()) {
                                rows++;
                                if (!expectedZero && rows <= 30) {
                                    StringJoiner fields = new StringJoiner(" | ");
                                    for (int i = 1; i <= md.getColumnCount(); i++)
                                        fields.add(md.getColumnLabel(i) + "=" + rs.getString(i));
                                    System.out.println(fields);
                                }
                            }
                            if (expectedZero && rows != 0) throw new IllegalStateException("Truy vấn phát hiện lỗi có " + rows + " dòng.");
                        }
                    } else if (statement.getUpdateCount() == -1) break;
                    result = statement.getMoreResults();
                } while (true);
            }
            statements++;
            buffer.setLength(0);
        }
        if (!buffer.toString().replaceAll("(?m)--.*$", "").isBlank())
            throw new IllegalArgumentException("Còn SQL chưa kết thúc delimiter.");
        System.out.println(path.getFileName() + ": " + statements + " statements OK");
    }
    public static void main(String[] args) throws Exception {
        System.setOut(new PrintStream(System.out, true, StandardCharsets.UTF_8));
        if (args.length == 0) throw new IllegalArgumentException("hash | migrate | validate | baseline-reviewed | sql <file> | passwords");
        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        if (args[0].equals("hash")) {
            String encoded = encoder.encode(DEMO_PASSWORD);
            if (!encoder.matches(DEMO_PASSWORD, encoded)) throw new IllegalStateException("Hash không match.");
            System.out.println(encoded);
            return;
        }
        try (Connection connection = connect()) {
            switch (args[0]) {
                case "connection" -> {
                    try (Statement statement=connection.createStatement();
                         ResultSet rs=statement.executeQuery("SELECT VERSION() AS server_version,DATABASE() AS database_name,@@session.time_zone AS time_zone,@@character_set_connection AS charset")) {
                        rs.next();
                        System.out.println("Connection OK; MySQL="+rs.getString("server_version")+"; database="+rs.getString("database_name")+"; timezone="+rs.getString("time_zone")+"; charset="+rs.getString("charset"));
                    }
                    // Chỉ metadata của database được chọn, không migrate/seed/đọc record nghiệp vụ.
                    try (Statement statement=connection.createStatement();
                         ResultSet rs=statement.executeQuery("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE' AND table_name<>'flyway_schema_history'")) {
                        rs.next(); System.out.println("Application tables="+rs.getInt(1));
                    }
                }
                case "migrate" -> {
                    flyway().migrate();
                    flyway().validate();
                    System.out.println("Flyway migrate/validate OK");
                }
                case "validate" -> {
                    flyway().validate();
                    System.out.println("Flyway validate OK");
                }
                case "compare-schema" -> {
                    compare(connection);
                }
                case "lock-check" -> {
                    connection.setAutoCommit(false);
                    try (Connection other=connect()) {
                        other.setAutoCommit(false);
                        try (Statement a=connection.createStatement(); Statement b=other.createStatement()) {
                            a.executeQuery("SELECT id FROM ledger_accounts WHERE id=16005 FOR UPDATE").close();
                            b.execute("SET SESSION innodb_lock_wait_timeout=1");
                            try { b.executeQuery("SELECT id FROM ledger_accounts WHERE id=16005 FOR UPDATE").close();
                                  throw new IllegalStateException("Khoá account không serialize hai transaction.");
                            } catch(SQLException expected) {
                                if(expected.getErrorCode()!=1205) throw expected;
                                System.out.println("Lock check: second transaction waits, error 1205 as expected");
                            } finally { other.rollback(); connection.rollback(); }
                        }
                    }
                }
                case "baseline-reviewed" -> {
                    if (!"V3-reviewed".equals(System.getenv("EC_DB_CONFIRM_BASELINE")))
                        throw new IllegalArgumentException("Chỉ baseline sau đối chiếu đầy đủ V1/V2/V3; đặt EC_DB_CONFIRM_BASELINE=V3-reviewed.");
                    compare(connection);
                    Flyway.configure().dataSource(dbUrl("EC_DB_URL"), env("EC_DB_USER"), env("EC_DB_PASSWORD"))
                            .locations("filesystem:src/main/resources/db/migration").baselineVersion("3")
                            .baselineOnMigrate(false).cleanDisabled(true).load().baseline();
                    flyway().validate();
                    System.out.println("Baseline V3 và validate OK sau schema/reference compare.");
                }
                case "sql" -> sql(connection, Path.of(args[1]));
                case "passwords" -> {
                    int count = 0;
                    try (Statement statement = connection.createStatement();
                         ResultSet rs = statement.executeQuery("SELECT password_hash FROM user_accounts WHERE public_code LIKE 'DEMO-%' AND email LIKE '%@example.test'")) {
                        while (rs.next()) {
                            if (!encoder.matches(DEMO_PASSWORD, rs.getString(1))) throw new IllegalStateException("Password DEMO không match.");
                            count++;
                        }
                    }
                    if (count != 17) throw new IllegalStateException("Cần đúng 17 tài khoản fixture, có " + count);
                    System.out.println("PasswordEncoder: 17/17 DEMO hashes match");
                }
                default -> throw new IllegalArgumentException("Lệnh không hỗ trợ.");
            }
        }
    }
}

