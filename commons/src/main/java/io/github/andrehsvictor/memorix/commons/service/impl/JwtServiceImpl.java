package io.github.andrehsvictor.memorix.commons.service.impl;

import java.util.Set;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import io.github.andrehsvictor.memorix.commons.service.JwtService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
class JwtServiceImpl implements JwtService {

    private final SecurityContextHolderStrategy securityContextHolderStrategy;

    @Override
    public UUID getCurrentUserUuid() {
        Authentication authentication = securityContextHolderStrategy.getContext().getAuthentication();
        if (authentication != null && authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            Jwt jwt = jwtAuthenticationToken.getToken();
            return UUID.fromString(jwt.getSubject());
        }
        return null;
    }

    @Override
    public Set<String> getCurrentUserAuthorities() {
        Authentication authentication = securityContextHolderStrategy.getContext().getAuthentication();
        if (authentication != null && authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            Jwt jwt = jwtAuthenticationToken.getToken();
            Set<String> authorities = jwt.getClaimAsString("scope") != null
                    ? Set.of(jwt.getClaimAsString("scope").split(" "))
                    : Set.of();
            return authorities;
        }
        return Set.of();
    }

}
