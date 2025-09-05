package io.github.andrehsvictor.memorix.commons.exception.handler;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import io.github.andrehsvictor.memorix.commons.dto.exception.ErrorDto;
import io.github.andrehsvictor.memorix.commons.exception.ErrorCode;
import io.micrometer.tracing.Tracer;
import lombok.RequiredArgsConstructor;

@RestControllerAdvice
@RequiredArgsConstructor
public class SecurityExceptionHandler {

    private final Tracer tracer;

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorDto> handleBadCredentialsException(BadCredentialsException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.UNAUTHORIZED,
                ErrorCode.INVALID_CREDENTIALS,
                "Invalid credentials",
                request);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorDto> handleDisabledException(DisabledException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.FORBIDDEN,
                ErrorCode.EMAIL_NOT_VERIFIED,
                "Email not verified",
                request);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ErrorDto> handleLockedException(LockedException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.LOCKED,
                ErrorCode.ACCOUNT_SUSPENDED,
                "Account is suspended",
                request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDto> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.FORBIDDEN,
                ErrorCode.NO_PERMISSION,
                "You do not have permission to access this resource",
                request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorDto> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        return createErrorResponse(
                HttpStatus.UNAUTHORIZED,
                ErrorCode.INVALID_CREDENTIALS,
                "Authentication failed",
                request);
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
