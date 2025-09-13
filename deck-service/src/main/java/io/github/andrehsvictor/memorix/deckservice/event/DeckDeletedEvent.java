package io.github.andrehsvictor.memorix.deckservice.event;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeckDeletedEvent {
    private String deckId;
    private Long timestamp;
}
