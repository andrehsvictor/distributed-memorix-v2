package io.github.andrehsvictor.memorix.commons.dto.exception;

import java.util.ArrayList;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorDto {

    private Integer status;
    private String code;
    private String message;
    private String timestamp;
    private String traceId;
    private String path;
    
    @Builder.Default
    private List<ValidationErrorDto> errors = new ArrayList<>();

}
