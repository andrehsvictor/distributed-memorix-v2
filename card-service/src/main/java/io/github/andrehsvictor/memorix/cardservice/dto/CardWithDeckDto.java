package io.github.andrehsvictor.memorix.cardservice.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CardWithDeckDto {

    private UUID id;
    private String question;
    private String answer;
    private Instant createdAt;
    private Instant updatedAt;
    
}
