package io.github.andrehsvictor.memorix.cardservice.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeckDto {
    private UUID id;
    private String name;
    private String description;
    private String hexColor;
    private String coverImageUrl;
    private Integer cardsCount;
    private Instant createdAt;
    private Instant updatedAt;
}
