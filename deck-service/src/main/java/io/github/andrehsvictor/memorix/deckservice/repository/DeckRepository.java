package io.github.andrehsvictor.memorix.deckservice.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.andrehsvictor.memorix.deckservice.model.Deck;

public interface DeckRepository extends JpaRepository<Deck, UUID> {

}
