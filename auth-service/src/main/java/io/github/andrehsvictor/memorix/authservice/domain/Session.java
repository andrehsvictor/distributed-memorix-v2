package io.github.andrehsvictor.memorix.authservice.domain;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("session")
@EqualsAndHashCode(of = "id")
public class Session implements Serializable {

    private static final long serialVersionUID = -4585456992893696019L;

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed
    private UUID userId;

    @Builder.Default
    private Long createdAt = System.currentTimeMillis();

    @TimeToLive(unit = TimeUnit.MILLISECONDS)
    private Long expiresAt;

    private String ipAddress;
    private String userAgent;

    @Builder.Default
    private Set<String> scopes = new HashSet<>();

    public String getScope() {
        return String.join(" ", scopes);
    }

}
