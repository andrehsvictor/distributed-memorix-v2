package io.github.andrehsvictor.memorix.deckservice.service;

import java.util.UUID;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import io.github.andrehsvictor.memorix.deckservice.event.CardCreatedEvent;
import io.github.andrehsvictor.memorix.deckservice.event.CardDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeckEventConsumer {

    private final DeckService deckService;

    @RabbitListener(queues = { "${messaging.consumer.card-created}" })
    public void handleCardCreatedEvent(CardCreatedEvent event) {
        deckService.incrementCardsCount(UUID.fromString(event.getDeckId()));
        log.info("Handled CardCreatedEvent for deck with ID: {}", event.getDeckId());
    }

    @RabbitListener(queues = { "${messaging.consumer.card-deleted}" })
    public void handleCardDeletedEvent(CardDeletedEvent event) {
        deckService.decrementCardsCount(UUID.fromString(event.getDeckId()));
        log.info("Handled CardDeletedEvent for deck with ID: {}", event.getDeckId());
    }

}
