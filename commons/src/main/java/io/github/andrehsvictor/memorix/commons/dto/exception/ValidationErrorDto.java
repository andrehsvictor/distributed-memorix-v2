package io.github.andrehsvictor.memorix.commons.dto.exception;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ValidationErrorDto {

    private String field;
    private String message;
    private Object rejectedValue;

}
