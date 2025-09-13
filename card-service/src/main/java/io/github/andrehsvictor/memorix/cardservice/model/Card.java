package io.github.andrehsvictor.memorix.cardservice.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Document(collection = "cards")
public class Card implements Serializable {

    private static final long serialVersionUID = 5223837872883376581L;

    @Id
    private UUID id = UUID.randomUUID();

    private String question;
    private String answer;

    @Indexed
    private UUID deckId;

    private String deckName;
    private String deckCoverImageUrl;
    private Integer deckCardsCount;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

}
