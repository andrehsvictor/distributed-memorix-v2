package io.github.andrehsvictor.memorix.deckservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import io.github.andrehsvictor.memorix.deckservice.dto.PostDeckDto;
import io.github.andrehsvictor.memorix.deckservice.dto.PutDeckDto;
import io.github.andrehsvictor.memorix.deckservice.model.Deck;

@Mapper(componentModel = "spring")
public interface DeckMapper {

    Deck postDeckDtoToDeck(PostDeckDto postDeckDto);

    Deck updateDeckFromPutDeckDto(@MappingTarget Deck deck, PutDeckDto putDeckDto);

}
