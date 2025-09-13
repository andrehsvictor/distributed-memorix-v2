package io.github.andrehsvictor.memorix.deckservice.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import io.github.andrehsvictor.memorix.deckservice.event.DeckDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeckEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    private static final String DECK_DELETED_QUEUE = "deck.deleted";

    @Async
    @Retryable(maxAttempts = 3, retryFor = Exception.class, backoff = @Backoff(delay = 1000))
    public void publishDeckDeletedEvent(String deckId) {
        DeckDeletedEvent event = DeckDeletedEvent.builder()
                .deckId(deckId)
                .timestamp(System.currentTimeMillis())
                .build();
        try {
            rabbitTemplate.convertAndSend(DECK_DELETED_QUEUE, event);
            log.info("Published DeckDeletedEvent for deck with ID: {}", deckId);
        } catch (Exception e) {
            throw e;
        }
    }

}
