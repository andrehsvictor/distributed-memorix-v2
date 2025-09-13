package io.github.andrehsvictor.memorix.deckservice.controller;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import io.github.andrehsvictor.memorix.deckservice.dto.PostDeckDto;
import io.github.andrehsvictor.memorix.deckservice.dto.PutDeckDto;
import io.github.andrehsvictor.memorix.deckservice.model.Deck;
import io.github.andrehsvictor.memorix.deckservice.service.DeckService;
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
@Tag(name = "Deck API", description = "Operations related to deck management")
public class DeckController {

    private final DeckService deckService;

    @Operation(summary = "Get deck by ID", description = "Retrieve a specific deck by its unique identifier")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Deck found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Deck.class))),
            @ApiResponse(responseCode = "404", description = "Deck not found", content = @Content(mediaType = "application/json"))
    })
    @GetMapping("/api/v2/decks/{id}")
    public Deck getById(
            @Parameter(description = "Deck unique identifier", required = true, example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id) {
        return deckService.getById(id);
    }

    @Operation(summary = "Get all decks", description = "Retrieve a paginated list of all decks")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Decks retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    })
    @GetMapping("/api/v2/decks")
    public Page<Deck> getAll(
            @Parameter(description = "Pagination information") Pageable pageable) {
        return deckService.getAll(pageable);
    }

    @Operation(summary = "Create new deck", description = "Create a new deck with the provided information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Deck created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Deck.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content(mediaType = "application/json"))
    })
    @PostMapping("/api/v2/decks")
    public ResponseEntity<Deck> create(
            @Parameter(description = "Deck creation data", required = true) @Valid @RequestBody PostDeckDto postDeckDto) {
        Deck createdDeck = deckService.create(postDeckDto);
        URI location = URI.create(String.format("/api/v2/decks/%s", createdDeck.getId()));
        return ResponseEntity.created(location).body(createdDeck);
    }

    @Operation(summary = "Update deck", description = "Update an existing deck with new information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Deck updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Deck.class))),
            @ApiResponse(responseCode = "404", description = "Deck not found", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content(mediaType = "application/json"))
    })
    @PutMapping("/api/v2/decks/{id}")
    public Deck update(
            @Parameter(description = "Deck unique identifier", required = true, example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id,
            @Parameter(description = "Deck update data", required = true) @Valid @RequestBody PutDeckDto putDeckDto) {
        return deckService.update(id, putDeckDto);
    }

    @Operation(summary = "Delete deck", description = "Delete a specific deck by its unique identifier")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Deck deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Deck not found", content = @Content(mediaType = "application/json"))
    })
    @DeleteMapping("/api/v2/decks/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Deck unique identifier", required = true, example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id) {
        deckService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete multiple decks", description = "Delete multiple decks by their unique identifiers")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Decks deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content(mediaType = "application/json"))
    })
    @DeleteMapping("/api/v2/decks")
    public ResponseEntity<Void> deleteAllByIdIn(
            @Parameter(description = "List of deck unique identifiers to delete", required = true) @RequestBody Iterable<UUID> ids) {
        deckService.deleteAllByIdIn(ids);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Check if deck exists", description = "Check if a deck exists by its unique identifier using HEAD method")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Deck exists"),
            @ApiResponse(responseCode = "404", description = "Deck not found")
    })
    @RequestMapping(value = "/api/v2/decks/{id}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> existsById(
            @Parameter(description = "Deck unique identifier", required = true, example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable UUID id) {
        if (deckService.existsById(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
