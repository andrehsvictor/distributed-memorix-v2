package io.github.andrehsvictor.memorix.deckservice.event;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CardDeletedEvent {

    private String cardId;
    private String deckId;
    private Long timestamp;

}
