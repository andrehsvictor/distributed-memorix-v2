package io.github.andrehsvictor.memorix.cardservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostCardDto {

    @NotBlank(message = "Question cannot be blank")
    private String question;

    @NotBlank(message = "Answer cannot be blank")
    private String answer;

}
