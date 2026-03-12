package com.jaya.automation.flows.auth.util;

import org.apache.commons.codec.binary.Base32;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.time.Instant;

public final class TotpGenerator {
    private static final long STEP_SECONDS = 30;
    private static final int OTP_DIGITS = 6;

    private TotpGenerator() {
    }

    public static String generateCode(String base32Secret) {
        return generateCode(base32Secret, Instant.now());
    }

    public static String generateCode(String base32Secret, Instant timestamp) {
        byte[] key = decodeSecret(base32Secret);
        byte[] data = timeWindowData(timestamp);
        byte[] hash = hmacSha1(key, data);
        int otp = truncate(hash) % 1_000_000;
        return String.format("%0" + OTP_DIGITS + "d", otp);
    }

    private static byte[] decodeSecret(String base32Secret) {
        Base32 base32 = new Base32();
        return base32.decode(base32Secret);
    }

    private static byte[] timeWindowData(Instant timestamp) {
        long window = timestamp.getEpochSecond() / STEP_SECONDS;
        return ByteBuffer.allocate(8).putLong(window).array();
    }

    private static byte[] hmacSha1(byte[] key, byte[] data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            return mac.doFinal(data);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to generate TOTP", ex);
        }
    }

    private static int truncate(byte[] hash) {
        int offset = hash[hash.length - 1] & 0x0F;
        int part1 = (hash[offset] & 0x7F) << 24;
        int part2 = (hash[offset + 1] & 0xFF) << 16;
        int part3 = (hash[offset + 2] & 0xFF) << 8;
        int part4 = hash[offset + 3] & 0xFF;
        return part1 | part2 | part3 | part4;
    }
}
