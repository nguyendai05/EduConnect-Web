package com.educonnect.config;

import java.io.IOException;
import java.io.PrintStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Kết nối JDBC để kiểm tra thủ công. Không là Spring bean, không migrate hoặc seed.
 * Chạy main() trong IDE; cấu hình từ EDUCONNECT_DB_* hoặc .env.local ở root repo.
 * Caller của getConnection() phải đóng Connection bằng try-with-resources.
 */
public final class DBConnect {
    private static final String URL_KEY = "EDUCONNECT_DB_URL";
    private static final String USER_KEY = "EDUCONNECT_DB_USERNAME";
    private static final String PASSWORD_KEY = "EDUCONNECT_DB_PASSWORD";
    private static final String DEFAULT_URL =
            "jdbc:mysql://127.0.0.1:3306/educonnect_dev"
                    + "?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true";
    private static final String PASSWORD_PLACEHOLDER = "__ENTER_PASSWORD_LOCALLY__";

    private DBConnect() {
    }

    /** Mỗi lần gọi tạo một Connection mới; không dùng connection static chia sẻ. */
    public static Connection getConnection() throws SQLException, IOException {
        Settings settings = loadSettings(System.getenv(), findLocalEnv());
        Properties properties = new Properties();
        properties.setProperty("user", settings.username);
        properties.setProperty("password", settings.password);
        properties.setProperty("connectTimeout", "5000");
        properties.setProperty("socketTimeout", "5000");
        try {
            return DriverManager.getConnection(settings.url, properties);
        } finally {
            properties.clear();
        }
    }

    private static Path findLocalEnv() {
        Path directory = Path.of("").toAbsolutePath();
        while (directory != null) {
            if (Files.isRegularFile(directory.resolve("pom.xml"))) {
                return directory.resolve(".env.local");
            }
            directory = directory.getParent();
        }
        return Path.of(".env.local").toAbsolutePath();
    }

    static Settings loadSettings(Map<String, String> environment, Path localEnv) throws IOException {
        Map<String, String> fileValues = new HashMap<>();
        if (Files.isRegularFile(localEnv)) {
            for (String line : Files.readAllLines(localEnv, StandardCharsets.UTF_8)) {
                if (line.isBlank() || line.stripLeading().startsWith("#")) {
                    continue;
                }
                int separator = line.indexOf('=');
                if (separator < 1) {
                    throw new IllegalArgumentException("Cấu hình local phải có dạng KEY=VALUE.");
                }
                String key = line.substring(0, separator).trim();
                if (!key.equals(URL_KEY) && !key.equals(USER_KEY) && !key.equals(PASSWORD_KEY)) {
                    continue;
                }
                String value = line.substring(separator + 1).trim();
                if (value.length() >= 2 && ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }
                if (fileValues.putIfAbsent(key, value) != null) {
                    throw new IllegalArgumentException("Biến kết nối trong file local bị trùng.");
                }
            }
        }
        String url = value(environment, fileValues, URL_KEY, DEFAULT_URL);
        String username = value(environment, fileValues, USER_KEY, "root");
        String password = value(environment, fileValues, PASSWORD_KEY, null);
        validateUrl(url);
        if (username.isBlank()) {
            throw new IllegalArgumentException("Username MySQL chưa được điền.");
        }
        if (password == null || PASSWORD_PLACEHOLDER.equals(password)) {
            throw new IllegalArgumentException(
                    "Điền mật khẩu MySQL trong .env.local hoặc EDUCONNECT_DB_PASSWORD; không dùng mật khẩu DEMO.");
        }
        return new Settings(url, username, password);
    }

    private static String value(Map<String, String> environment, Map<String, String> local,
                                String key, String fallback) {
        return environment.containsKey(key) ? environment.get(key) : local.getOrDefault(key, fallback);
    }

    private static void validateUrl(String url) {
        if (url == null || !url.startsWith("jdbc:mysql://")) {
            throw new IllegalArgumentException("JDBC URL phải dùng jdbc:mysql://.");
        }
        URI uri;
        try {
            uri = URI.create(url.substring("jdbc:".length()));
        } catch (IllegalArgumentException error) {
            throw new IllegalArgumentException("JDBC URL không đúng định dạng.");
        }
        if (uri.getHost() == null || uri.getUserInfo() != null) {
            throw new IllegalArgumentException("JDBC URL cần host và không được chứa credential.");
        }
        if (uri.getRawQuery() != null) {
            for (String part : uri.getRawQuery().split("&")) {
                String key = URLDecoder.decode(part.split("=", 2)[0], StandardCharsets.UTF_8)
                        .toLowerCase(java.util.Locale.ROOT);
                if (key.equals("user") || key.equals("username") || key.contains("password")
                        || key.equals("passwd") || key.contains("secret") || key.contains("token")) {
                    throw new IllegalArgumentException(
                            "Không đặt credential trong JDBC URL; dùng biến username/password riêng.");
                }
            }
        }
    }

    static String failureMessage(SQLException error) {
        if (error.getErrorCode() == 1045) {
            return "MySQL từ chối đăng nhập. Kiểm tra user/mật khẩu MySQL và quyền của user tại host này.";
        }
        if (error.getErrorCode() == 1049) {
            return "Chưa có database được chọn. Tạo educonnect_dev bằng file 00 trong Workbench/Navicat.";
        }
        if (error.getMessage() != null && error.getMessage().startsWith("No suitable driver")) {
            return "Thiếu MySQL Connector/J trong classpath. Reload Maven project hoặc chạy Maven package.";
        }
        return "Không kết nối được MySQL. Kiểm tra service, host, port và quyền truy cập.";
    }

    public static void main(String[] args) {
        System.setOut(new PrintStream(System.out, true, StandardCharsets.UTF_8));
        if (args.length > 1 || (args.length == 1 && !"--config-only".equals(args[0]))) {
            System.err.println("Cách chạy: DBConnect [--config-only]");
            System.exit(1);
        }
        try {
            if (args.length == 1) {
                loadSettings(System.getenv(), findLocalEnv());
                System.out.println("Cấu hình JDBC hợp lệ; chưa kết nối database. Mật khẩu không được hiển thị.");
                return;
            }
            try (Connection connection = getConnection();
                 Statement statement = connection.createStatement();
                 ResultSet result = statement.executeQuery(
                         "SELECT 1 AS connection_test, VERSION() AS server_version,"
                                 + " DATABASE() AS database_name, @@session.time_zone AS time_zone")) {
                result.next();
                System.out.println("Kết nối MySQL thành công.");
                System.out.println("Server: " + result.getString("server_version"));
                System.out.println("Database: " + result.getString("database_name"));
                System.out.println("Timezone: " + result.getString("time_zone"));
                System.out.println("SELECT 1 = " + result.getInt("connection_test"));
            }
        } catch (SQLException error) {
            System.err.println(failureMessage(error));
            System.err.println("SQLState=" + error.getSQLState() + "; MySQL error=" + error.getErrorCode());
            System.exit(1);
        } catch (IOException | IllegalArgumentException error) {
            System.err.println("Không đọc được cấu hình hợp lệ. Kiểm tra ba biến EDUCONNECT_DB_* và .env.local.");
            System.exit(1);
        }
    }

    // Không dùng record/toString tự sinh để tránh vô tình log password.
    static final class Settings {
        final String url;
        final String username;
        final String password;

        Settings(String url, String username, String password) {
            this.url = url;
            this.username = username;
            this.password = password;
        }
    }
}

