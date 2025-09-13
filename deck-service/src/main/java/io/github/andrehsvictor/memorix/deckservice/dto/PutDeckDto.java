package io.github.andrehsvictor.memorix.deckservice.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PutDeckDto {

    @Size(max = 100, message = "Name cannot be longer than 100 characters")
    @NotEmpty(message = "Name cannot be empty")
    private String name;

    @Size(max = 255, message = "Description cannot be longer than 255 characters")
    private String description;

    @Pattern(message = "coverImageUrl must be a valid URL", regexp = "^(https?|ftp)://[^\\s/$.?#].[^\\s]*$")
    private String coverImageUrl;

    @NotEmpty(message = "hexColor cannot be empty")
    @Size(min = 7, max = 7, message = "hexColor must be 7 characters long")
    private String hexColor;

}
