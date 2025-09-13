package io.github.andrehsvictor.memorix.deckservice.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import io.github.andrehsvictor.memorix.deckservice.dto.PostDeckDto;
import io.github.andrehsvictor.memorix.deckservice.dto.PutDeckDto;
import io.github.andrehsvictor.memorix.deckservice.mapper.DeckMapper;
import io.github.andrehsvictor.memorix.deckservice.model.Deck;
import io.github.andrehsvictor.memorix.deckservice.repository.DeckRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeckService {

    private final DeckMapper deckMapper;
    private final DeckRepository deckRepository;
    private final DeckEventPublisher deckEventPublisher;

    public Page<Deck> getAll(Pageable pageable) {
        return deckRepository.findAll(pageable);
    }

    public Deck getById(UUID id) {
        return deckRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deck not found with ID: " + id));
    }

    public boolean existsById(UUID id) {
        return deckRepository.existsById(id);
    }

    @Transactional
    public Deck create(PostDeckDto postDeckDto) {
        Deck deck = deckMapper.postDeckDtoToDeck(postDeckDto);
        return deckRepository.save(deck);
    }

    @Transactional
    public Deck update(UUID id, PutDeckDto putDeckDto) {
        Deck deck = getById(id);
        deckMapper.updateDeckFromPutDeckDto(deck, putDeckDto);
        return deckRepository.save(deck);
    }

    @Transactional
    public void delete(UUID id) {
        Deck deck = getById(id);
        deckRepository.delete(deck);
        deckEventPublisher.publishDeckDeletedEvent(id.toString());
    }

    @Transactional
    public void deleteAllByIdIn(Iterable<UUID> ids) {
        Iterable<UUID> existingIds = deckRepository.findAllById(ids)
                .stream()
                .map(Deck::getId)
                .toList();
        if (existingIds.iterator().hasNext() == false) {
            return;
        }
        deckRepository.deleteAllByIdInBatch(existingIds);
        existingIds
                .forEach(id -> deckEventPublisher.publishDeckDeletedEvent(id.toString()));
    }

}
