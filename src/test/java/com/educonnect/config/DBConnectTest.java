package com.educonnect.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.SQLException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DBConnectTest {
    @TempDir
    Path directory;

    private Path config(String text) throws Exception {
        Path path = directory.resolve(".env.local");
        Files.writeString(path, text, StandardCharsets.UTF_8);
        return path;
    }

    @Test
    void passwordPunctuationIsLiteralAndEnvironmentOverridesFile() throws Exception {
        String literal = "space # = $() \"quote\"";
        Path path = config("EDUCONNECT_DB_PASSWORD='" + literal + "'\n");
        assertEquals(literal, DBConnect.loadSettings(Map.of(), path).password);
        assertEquals("from-environment",
                DBConnect.loadSettings(Map.of("EDUCONNECT_DB_PASSWORD", "from-environment"), path).password);
    }

    @Test
    void missingAndPlaceholderPasswordAreRejected() throws Exception {
        assertThrows(IllegalArgumentException.class,
                () -> DBConnect.loadSettings(Map.of(), directory.resolve("missing.env")));
        Path path = config("EDUCONNECT_DB_PASSWORD=__ENTER_PASSWORD_LOCALLY__\n");
        assertThrows(IllegalArgumentException.class, () -> DBConnect.loadSettings(Map.of(), path));
    }

    @Test
    void credentialsInUrlAreRejectedWithoutExposingTheirValue() throws Exception {
        Path path = config("EDUCONNECT_DB_PASSWORD=test-only\n");
        for (String url : new String[]{
                "jdbc:mysql://root:test-secret@127.0.0.1/educonnect_dev",
                "jdbc:mysql://127.0.0.1/educonnect_dev?%70assword=test-secret",
                "jdbc:mysql://127.0.0.1/educonnect_dev?trustCertificateKeyStorePassword=test-secret"}) {
            Exception error = assertThrows(IllegalArgumentException.class,
                    () -> DBConnect.loadSettings(Map.of("EDUCONNECT_DB_URL", url), path));
            assertFalse(error.getMessage().contains("test-secret"));
        }
    }

    @Test
    void sqlFailureMessageDoesNotExposeVendorSecrets() {
        String message = DBConnect.failureMessage(new SQLException("test-secret", "28000", 1045));
        assertFalse(message.contains("test-secret"));
        assertTrue(message.contains("MySQL"));
    }
}

