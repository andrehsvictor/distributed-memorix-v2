package io.github.andrehsvictor.memorix.cardservice.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Deck implements Serializable {

    private static final long serialVersionUID = 1308180122536932652L;

    private UUID id;
    private String name;
    private String description;
    private String coverImageUrl;
    private Integer cardsCount;
    private Instant createdAt;
    private Instant updatedAt;

}
