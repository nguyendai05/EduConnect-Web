package com.educonnect.auth;

/** Safe, user-facing verification error; never contains an OTP or a credential. */
public class OtpException extends RuntimeException {
    public OtpException(String message) { super(message); }
}
