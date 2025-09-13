package io.github.andrehsvictor.memorix.cardservice.service;

import java.util.UUID;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import io.github.andrehsvictor.memorix.cardservice.event.DeckDeletedEvent;
import io.github.andrehsvictor.memorix.cardservice.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CardEventConsumer {

    private final CardRepository cardRepository;

    @RabbitListener(queues = { "${spring.rabbitmq.queues[0].name}" })
    public void handleDeckDeletedEvent(DeckDeletedEvent event) {
        long count = cardRepository.deleteAllByDeckId(UUID.fromString(event.getDeckId()));
        log.info("Deleted {} cards associated with deck ID {}", count, event.getDeckId());
    }

}
