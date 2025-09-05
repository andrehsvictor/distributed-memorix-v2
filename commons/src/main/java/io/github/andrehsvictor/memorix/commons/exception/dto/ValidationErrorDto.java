package io.github.andrehsvictor.memorix.commons.exception.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ValidationErrorDto {

    private String field;
    private String message;
    private Object rejectedValue;

}
