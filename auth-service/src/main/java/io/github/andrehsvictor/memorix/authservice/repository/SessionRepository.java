package io.github.andrehsvictor.memorix.authservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import io.github.andrehsvictor.memorix.authservice.domain.Session;

public interface SessionRepository extends CrudRepository<Session, UUID> {

    Optional<Session> findByIdAndUserId(UUID id, UUID userId);

    List<Session> findAllByUserId(UUID userId);
    
}
