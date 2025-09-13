package io.github.andrehsvictor.memorix.cardservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import io.github.andrehsvictor.memorix.cardservice.dto.PostCardDto;
import io.github.andrehsvictor.memorix.cardservice.dto.PutCardDto;
import io.github.andrehsvictor.memorix.cardservice.model.Card;

@Mapper(componentModel = "spring")
public interface CardMapper {

    Card postCardDtoToCard(PostCardDto postCardDto);

    Card updateCardFromPutCardDto(PutCardDto putCardDto, @MappingTarget Card card);

}
