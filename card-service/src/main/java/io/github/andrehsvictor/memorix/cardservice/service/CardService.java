package io.github.andrehsvictor.memorix.cardservice.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import io.github.andrehsvictor.memorix.cardservice.dto.CardWithDeckDto;
import io.github.andrehsvictor.memorix.cardservice.dto.PostCardDto;
import io.github.andrehsvictor.memorix.cardservice.dto.PutCardDto;
import io.github.andrehsvictor.memorix.cardservice.mapper.CardMapper;
import io.github.andrehsvictor.memorix.cardservice.model.Card;
import io.github.andrehsvictor.memorix.cardservice.repository.CardRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CardService {

    private final DeckService deckService;
    private final CardMapper cardMapper;
    private final CardRepository cardRepository;
    private final CardEventProducer cardEventPublisher;

    public CardWithDeckDto getById(UUID id) {
        return cardRepository.findById(id)
                .map(cardMapper::cardToCardWithDeckDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found with ID: " + id));
    }

    public Page<CardWithDeckDto> getAll(Pageable pageable) {
        return cardRepository.findAll(pageable)
                .map(cardMapper::cardToCardWithDeckDto);
    }

    public Page<Card> getAllByDeckId(UUID deckId, Pageable pageable) {
        deckExistsById(deckId);
        return cardRepository.findAllByDeckId(deckId, pageable);
    }

    @Transactional
    public CardWithDeckDto create(UUID deckId, PostCardDto postCardDto) {
        deckExistsById(deckId);
        Card card = cardMapper.postCardDtoToCard(postCardDto);
        Card savedCard = cardRepository.save(card);
        cardEventPublisher.publishCardCreatedEvent(savedCard.getId().toString(), deckId.toString());
        return cardMapper.cardToCardWithDeckDto(savedCard);
    }

    @Transactional
    public CardWithDeckDto update(UUID id, PutCardDto putCardDto) {
        Card existingCard = getEntityById(id);
        Card updatedCard = cardMapper.updateCardFromPutCardDto(putCardDto, existingCard);
        Card savedCard = cardRepository.save(updatedCard);
        return cardMapper.cardToCardWithDeckDto(savedCard);
    }

    @Transactional
    public void delete(UUID id) {
        Card existingCard = getEntityById(id);
        cardRepository.delete(existingCard);
        cardEventPublisher.publishCardDeletedEvent(existingCard.getId().toString(),
                existingCard.getDeckId().toString());
    }

    private Card getEntityById(UUID id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found with ID: " + id));
    }

    private void deckExistsById(UUID deckId) {
        if (!deckService.existsById(deckId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Deck not found with ID: " + deckId);
        }
    }

}
