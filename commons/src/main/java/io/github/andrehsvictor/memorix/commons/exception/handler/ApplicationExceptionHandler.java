package io.github.andrehsvictor.memorix.commons.exception.handler;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import io.github.andrehsvictor.memorix.commons.dto.exception.ErrorDto;
import io.github.andrehsvictor.memorix.commons.exception.BadRequestException;
import io.github.andrehsvictor.memorix.commons.exception.ErrorCode;
import io.github.andrehsvictor.memorix.commons.exception.ForbiddenOperationException;
import io.github.andrehsvictor.memorix.commons.exception.GoneException;
import io.github.andrehsvictor.memorix.commons.exception.ResourceConflictException;
import io.github.andrehsvictor.memorix.commons.exception.ResourceNotFoundException;
import io.github.andrehsvictor.memorix.commons.exception.UnauthorizedException;
import io.micrometer.tracing.Tracer;
import lombok.RequiredArgsConstructor;

@RestControllerAdvice
@RequiredArgsConstructor
public class ApplicationExceptionHandler {

    private final Tracer tracer;

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorDto> handleBadRequestException(BadRequestException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED,
                ex.getMessage(),
                request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorDto> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.NOT_FOUND,
                ErrorCode.RESOURCE_NOT_FOUND,
                ex.getMessage(),
                request);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorDto> handleUnauthorizedException(UnauthorizedException ex, WebRequest request) {
        String message = buildUnauthorizedMessage(ex);
        return createErrorResponse(
                HttpStatus.UNAUTHORIZED,
                ErrorCode.UNAUTHORIZED_ACCESS,
                message,
                request);
    }

    @ExceptionHandler(ForbiddenOperationException.class)
    public ResponseEntity<ErrorDto> handleForbiddenOperationException(ForbiddenOperationException ex,
            WebRequest request) {
        return createErrorResponse(
                HttpStatus.FORBIDDEN,
                ErrorCode.FORBIDDEN_OPERATION,
                ex.getMessage(),
                request);
    }

    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<ErrorDto> handleResourceConflictException(ResourceConflictException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.CONFLICT,
                ErrorCode.RESOURCE_ALREADY_EXISTS,
                ex.getMessage(),
                request);
    }

    @ExceptionHandler(GoneException.class)
    public ResponseEntity<ErrorDto> handleGoneException(GoneException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.GONE,
                ErrorCode.RESOURCE_NOT_FOUND,
                ex.getMessage(),
                request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDto> handleGenericException(Exception ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                request);
    }

    private String buildUnauthorizedMessage(UnauthorizedException ex) {
        String message = ex.getMessage();
        return (message == null || message.isEmpty() || message.isBlank())
                ? "Unauthorized access"
                : message;
    }

    private ResponseEntity<ErrorDto> createErrorResponse(HttpStatus status, ErrorCode errorCode, String message,
            WebRequest request) {
        ErrorDto errorDto = buildErrorDto(status, errorCode, message, request);
        return new ResponseEntity<>(errorDto, status);
    }

    private ErrorDto buildErrorDto(HttpStatus status, ErrorCode errorCode, String message, WebRequest request) {
        return ErrorDto.builder()
                .status(status.value())
                .timestamp(Instant.now().toString())
                .code(errorCode.name())
                .message(message)
                .path(extractPath(request))
                .traceId(extractTraceId())
                .build();
    }

    private String extractPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }

    private String extractTraceId() {
        return tracer.currentSpan() != null ? tracer.currentSpan().context().traceId() : null;
    }

}
