package io.github.andrehsvictor.memorix.cardservice.mapper;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

import io.github.andrehsvictor.memorix.cardservice.dto.DeckDto;
import io.github.andrehsvictor.memorix.cardservice.dto.CardWithDeckDto;
import io.github.andrehsvictor.memorix.cardservice.dto.PostCardDto;
import io.github.andrehsvictor.memorix.cardservice.dto.PutCardDto;
import io.github.andrehsvictor.memorix.cardservice.model.Card;
import io.github.andrehsvictor.memorix.cardservice.service.DeckService;

@Mapper(componentModel = "spring")
public abstract class CardMapper {

    @Autowired
    protected DeckService deckService;

    public abstract Card postCardDtoToCard(PostCardDto postCardDto);

    public abstract Card updateCardFromPutCardDto(PutCardDto putCardDto, @MappingTarget Card card);

    public abstract CardWithDeckDto cardToCardWithDeckDto(Card card);

    @AfterMapping
    protected void afterMapping(Card card, @MappingTarget CardWithDeckDto dto) {
        DeckDto deckDto = deckService.getById(card.getDeckId());
        dto.setDeck(deckDto);
    }

}
