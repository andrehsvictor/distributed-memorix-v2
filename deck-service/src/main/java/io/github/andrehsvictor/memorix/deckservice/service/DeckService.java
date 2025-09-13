package io.github.andrehsvictor.memorix.deckservice.service;

import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.andrehsvictor.memorix.deckservice.dto.PostDeckDto;
import io.github.andrehsvictor.memorix.deckservice.dto.PutDeckDto;
import io.github.andrehsvictor.memorix.deckservice.mapper.DeckMapper;
import io.github.andrehsvictor.memorix.deckservice.model.Deck;
import io.github.andrehsvictor.memorix.deckservice.repository.DeckRepository;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeckService {

    private final DeckMapper deckMapper;
    private final DeckRepository deckRepository;
    private final RabbitTemplate rabbitTemplate;

    private static final String DECK_EXCHANGE = "ex.deck";
    private static final String DECK_DELETED_ROUTING_KEY = "deck.deleted";

    public Page<Deck> findAll(Pageable pageable) {
        return deckRepository.findAll(pageable);
    }

    public Deck findById(UUID id) {
        return deckRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Deck not found"));
    }

    @Transactional
    public Deck create(PostDeckDto postDeckDto) {
        Deck deck = deckMapper.postDeckDtoToDeck(postDeckDto);
        return deckRepository.save(deck);
    }

    @Transactional
    public Deck update(UUID id, PutDeckDto putDeckDto) {
        Deck deck = findById(id);
        deckMapper.updateDeckFromPutDeckDto(deck, putDeckDto);
        return deckRepository.save(deck);
    }

    @Transactional
    public void delete(UUID id) {
        Deck deck = findById(id);
        deckRepository.delete(deck);
        rabbitTemplate.convertAndSend(DECK_EXCHANGE, DECK_DELETED_ROUTING_KEY, id.toString());
    }
    
}
