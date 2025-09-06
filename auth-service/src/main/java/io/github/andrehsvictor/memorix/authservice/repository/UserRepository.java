package io.github.andrehsvictor.memorix.authservice.repository;

import io.github.andrehsvictor.memorix.authservice.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByEmailVerified(Boolean emailVerified);

    @Query("SELECT u FROM User u WHERE u.suspendedUntil IS NOT NULL AND u.suspendedUntil > :now")
    List<User> findSuspendedUsers(@Param("now") Instant now);

    @Query("SELECT u FROM User u JOIN u.authorities a WHERE a.name = :authorityName")
    List<User> findByAuthorityName(@Param("authorityName") String authorityName);

    List<User> findByCreatedAtAfter(Instant createdAt);

    long countByEmailVerified(Boolean emailVerified);

    List<User> findByLocale(String locale);
}
