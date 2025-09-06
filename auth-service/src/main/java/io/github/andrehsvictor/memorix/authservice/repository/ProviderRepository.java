package io.github.andrehsvictor.memorix.authservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.andrehsvictor.memorix.authservice.domain.Provider;
import io.github.andrehsvictor.memorix.authservice.domain.ProviderName;

public interface ProviderRepository extends JpaRepository<Provider, UUID> {

    Optional<Provider> findByName(ProviderName name);

    List<Provider> findByNameIn(List<ProviderName> names);

    boolean existsByName(ProviderName name);

    List<Provider> findByDescriptionContainingIgnoreCase(String descriptionPattern);

    List<Provider> findAllByOrderByName();

    long count();
}
