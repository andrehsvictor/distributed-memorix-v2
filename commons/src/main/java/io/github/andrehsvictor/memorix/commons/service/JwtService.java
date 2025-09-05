package io.github.andrehsvictor.memorix.commons.service;

import java.util.Set;
import java.util.UUID;

/**
 * Service for extracting information from JWT tokens.
 */
public interface JwtService {

    /**
     * Gets the UUID of the currently authenticated user from the JWT.
     * Returns null if no user is authenticated.
     * @return UUID of the current user or null if not authenticated.
     */
    UUID getCurrentUserUuid();

    /**
     * Gets the authorities (scopes) of the currently authenticated user from the JWT.
     * Returns an empty set if no user is authenticated.
     * @return Set of authorities (scopes) of the current user or an empty set if not authenticated.
     */
    Set<String> getCurrentUserAuthorities();

}
