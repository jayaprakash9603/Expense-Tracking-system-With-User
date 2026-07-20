package com.jaya.common.cache.user;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "common-library.user-profile-cache")
public class UserProfileCacheProperties {

    /** Enable client-side caching of user profiles fetched via Feign. */
    private boolean enabled = true;

    /** Time-to-live for cached entries in minutes. */
    private long ttlMinutes = 10;

    /** Maximum number of cached user profiles per cache (by id / by email). */
    private long maxSize = 10_000;
}
