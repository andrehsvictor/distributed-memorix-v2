package io.github.andrehsvictor.memorix.cardservice.controller;

import java.net.URI;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import io.github.andrehsvictor.memorix.cardservice.dto.CardWithDeckDto;
import io.github.andrehsvictor.memorix.cardservice.dto.PostCardDto;
import io.github.andrehsvictor.memorix.cardservice.dto.PutCardDto;
import io.github.andrehsvictor.memorix.cardservice.model.Card;
import io.github.andrehsvictor.memorix.cardservice.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Card API", description = "Operations related to card management")
public class CardController {

    private final CardService cardService;

    @Operation(summary = "Get all cards", description = "Retrieve a paginated list of all cards with deck information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cards retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    })
    @GetMapping("/api/v2/cards")
    public Page<CardWithDeckDto> getAll(
            @Parameter(description = "Pagination information") Pageable pageable) {
        return cardService.getAll(pageable);
    }

    @Operation(summary = "Get card by ID", description = "Retrieve a specific card by its unique identifier")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Card found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CardWithDeckDto.class))),
            @ApiResponse(responseCode = "404", description = "Card not found", content = @Content(mediaType = "application/json"))
    })
    @GetMapping("/api/v2/cards/{id}")
    public CardWithDeckDto getById(
            @Parameter(description = "Card unique identifier", required = true, example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id) {
        return cardService.getById(id);
    }

    @Operation(summary = "Get cards by deck ID", description = "Retrieve a paginated list of cards belonging to a specific deck")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cards retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "404", description = "Deck not found", content = @Content(mediaType = "application/json"))
    })
    @GetMapping("/api/v2/decks/{deckId}/cards")
    public Page<Card> getAllByDeckId(
            @Parameter(description = "Deck unique identifier", required = true, example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID deckId,
            @Parameter(description = "Pagination information") Pageable pageable) {
        return cardService.getAllByDeckId(deckId, pageable);
    }

    @Operation(summary = "Create new card", description = "Create a new card in a specific deck")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Card created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CardWithDeckDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "404", description = "Deck not found", content = @Content(mediaType = "application/json"))
    })
    @PostMapping("/api/v2/decks/{deckId}/cards")
    public ResponseEntity<CardWithDeckDto> create(
            @Parameter(description = "Deck unique identifier", required = true, example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID deckId,
            @Parameter(description = "Card creation data", required = true) @Valid @RequestBody PostCardDto postCardDto) {
        CardWithDeckDto createdCard = cardService.create(deckId, postCardDto);
        return ResponseEntity.created(URI.create("/api/v2/cards/" + createdCard.getId())).body(createdCard);
    }

    @Operation(summary = "Update card", description = "Update an existing card with new information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Card updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CardWithDeckDto.class))),
            @ApiResponse(responseCode = "404", description = "Card not found", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content(mediaType = "application/json"))
    })
    @PutMapping("/api/v2/cards/{id}")
    public CardWithDeckDto update(
            @Parameter(description = "Card unique identifier", required = true, example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id,
            @Parameter(description = "Card update data", required = true) @Valid @RequestBody PutCardDto putCardDto) {
        return cardService.update(id, putCardDto);
    }

    @Operation(summary = "Delete card", description = "Delete a specific card by its unique identifier")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Card deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Card not found", content = @Content(mediaType = "application/json"))
    })
    @DeleteMapping("/api/v2/cards/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Card unique identifier", required = true, example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id) {
        cardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
