package io.github.andrehsvictor.memorix.commons.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.GONE)
public class GoneException extends RuntimeException {

    private static final long serialVersionUID = 333319949873482725L;

    public GoneException(String message) {
        super(message);
    }

}
