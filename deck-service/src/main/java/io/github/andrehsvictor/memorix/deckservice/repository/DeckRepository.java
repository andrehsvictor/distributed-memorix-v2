package io.github.andrehsvictor.memorix.deckservice.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import io.github.andrehsvictor.memorix.deckservice.model.Deck;

public interface DeckRepository extends JpaRepository<Deck, UUID> {

    @Modifying
    @Query("UPDATE Deck d SET d.cardsCount = d.cardsCount + 1 WHERE d.id = :id")
    void incrementCardsCount(UUID id);

    @Modifying
    @Query("UPDATE Deck d SET d.cardsCount = d.cardsCount - 1 WHERE d.id = :id AND d.cardsCount > 0")
    void decrementCardsCount(UUID id);

}
