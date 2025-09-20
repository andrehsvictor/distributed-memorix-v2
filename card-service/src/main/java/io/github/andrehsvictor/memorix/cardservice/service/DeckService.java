package io.github.andrehsvictor.memorix.cardservice.service;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import io.github.andrehsvictor.memorix.cardservice.dto.DeckDto;

@FeignClient(name = "deck-service")
public interface DeckService {

    @GetMapping("/api/v2/decks/{id}")
    DeckDto getById(@PathVariable UUID id);

    @RequestMapping(value = "/api/v2/decks/{id}", method = RequestMethod.HEAD)
    ResponseEntity<Void> checkIfExists(@PathVariable UUID id);

    default boolean existsById(UUID id) {
        try {
            return checkIfExists(id).getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
}
