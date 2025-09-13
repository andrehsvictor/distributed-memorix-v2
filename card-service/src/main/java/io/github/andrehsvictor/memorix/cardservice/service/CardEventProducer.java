package io.github.andrehsvictor.memorix.cardservice.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import io.github.andrehsvictor.memorix.cardservice.event.CardCreatedEvent;
import io.github.andrehsvictor.memorix.cardservice.event.CardDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CardEventProducer {

    private final RabbitTemplate rabbitTemplate;

    @Async
    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void publishCardDeletedEvent(String cardId, String deckId) {
        CardDeletedEvent event = CardDeletedEvent.builder()
                .cardId(cardId)
                .deckId(deckId)
                .timestamp(System.currentTimeMillis())
                .build();
        try {
            rabbitTemplate.convertAndSend("card.deleted", event);
            log.info("Published CardDeletedEvent for card with ID {}", cardId);
        } catch (Exception e) {
            throw e;
        }
    }

    @Async
    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void publishCardCreatedEvent(String cardId, String deckId) {
        CardCreatedEvent event = CardCreatedEvent.builder()
                .cardId(cardId)
                .deckId(deckId)
                .timestamp(System.currentTimeMillis())
                .build();
        try {
            rabbitTemplate.convertAndSend("card.created", event);
            log.info("Published CardCreatedEvent for card with ID {}", cardId);
        } catch (Exception e) {
            throw e;
        }
    }

}
