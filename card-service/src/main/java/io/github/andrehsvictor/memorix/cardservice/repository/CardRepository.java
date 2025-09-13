package io.github.andrehsvictor.memorix.cardservice.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import io.github.andrehsvictor.memorix.cardservice.model.Card;

public interface CardRepository extends MongoRepository<Card, UUID> {

    Page<Card> findAllByDeckId(UUID deckId, Pageable pageable);

    long deleteAllByDeckId(UUID deckId);

}
