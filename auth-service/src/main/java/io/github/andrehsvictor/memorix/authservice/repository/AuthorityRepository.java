package io.github.andrehsvictor.memorix.authservice.repository;

import io.github.andrehsvictor.memorix.authservice.domain.Authority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface AuthorityRepository extends JpaRepository<Authority, UUID> {

    Optional<Authority> findByName(String name);

    List<Authority> findByNameIn(Set<String> names);

    boolean existsByName(String name);

    List<Authority> findByNameContainingIgnoreCase(String namePattern);

    List<Authority> findByDescriptionContainingIgnoreCase(String descriptionPattern);

    @Query("SELECT a FROM Authority a WHERE a.name LIKE 'ROLE_%'")
    List<Authority> findRoleAuthorities();

    @Query("SELECT a FROM Authority a WHERE a.name NOT LIKE 'ROLE_%'")
    List<Authority> findScopeAuthorities();

    @Query("SELECT a FROM User u JOIN u.authorities a WHERE u.id = :userId")
    List<Authority> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(a) FROM Authority a WHERE a.name LIKE :pattern")
    long countByNamePattern(@Param("pattern") String pattern);
}
