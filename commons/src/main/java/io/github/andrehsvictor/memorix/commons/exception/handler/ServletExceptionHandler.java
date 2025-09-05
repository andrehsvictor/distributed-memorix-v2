package io.github.andrehsvictor.memorix.commons.exception.handler;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import io.github.andrehsvictor.memorix.commons.exception.ErrorCode;
import io.github.andrehsvictor.memorix.commons.exception.dto.ErrorDto;
import io.github.andrehsvictor.memorix.commons.exception.dto.ValidationErrorDto;
import io.micrometer.tracing.Tracer;
import lombok.RequiredArgsConstructor;

@RestControllerAdvice
@RequiredArgsConstructor
public class ServletExceptionHandler extends ResponseEntityExceptionHandler {

    private final Tracer tracer;

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<ValidationErrorDto> validationErrors = buildValidationErrors(ex);
        return createErrorResponseWithValidationErrors(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED,
                "Validation failed",
                request,
                validationErrors);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return createObjectErrorResponse(
                HttpStatus.BAD_REQUEST,
                ErrorCode.MALFORMED_REQUEST,
                "Malformed JSON request",
                request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String message = buildMethodNotSupportedMessage(ex);
        return createObjectErrorResponse(
                HttpStatus.METHOD_NOT_ALLOWED,
                ErrorCode.METHOD_NOT_ALLOWED,
                message,
                request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String message = buildMediaTypeNotSupportedMessage(ex);
        return createObjectErrorResponse(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                ErrorCode.UNSUPPORTED_MEDIA_TYPE,
                message,
                request);
    }

    @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter(MissingServletRequestParameterException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String message = buildMissingParameterMessage(ex);
        return createObjectErrorResponse(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED,
                message,
                request);
    }

    @Override
    protected ResponseEntity<Object> handleNoHandlerFoundException(NoHandlerFoundException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String message = buildNoHandlerFoundMessage(ex);
        return createObjectErrorResponse(
                HttpStatus.NOT_FOUND,
                ErrorCode.RESOURCE_NOT_FOUND,
                message,
                request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorDto> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex,
            WebRequest request) {
        String message = buildArgumentTypeMismatchMessage(ex);
        return createErrorResponse(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED,
                message,
                request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorDto> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex,
            WebRequest request) {
        return createErrorResponse(
                HttpStatus.PAYLOAD_TOO_LARGE,
                ErrorCode.VALIDATION_FAILED,
                "File upload size exceeded the maximum allowed",
                request);
    }

    private List<ValidationErrorDto> buildValidationErrors(MethodArgumentNotValidException ex) {
        return ex.getBindingResult().getFieldErrors().stream()
                .map(this::mapFieldError)
                .collect(Collectors.toList());
    }

    private String buildMethodNotSupportedMessage(HttpRequestMethodNotSupportedException ex) {
        String supportedMethods = String.join(", ", ex.getSupportedMethods());
        return String.format("Request method '%s' not supported. Supported methods are: %s",
                ex.getMethod(), supportedMethods);
    }

    private String buildMediaTypeNotSupportedMessage(HttpMediaTypeNotSupportedException ex) {
        String supportedTypes = ex.getSupportedMediaTypes().stream()
                .map(Object::toString)
                .collect(Collectors.joining(", "));
        return String.format("Content type '%s' not supported. Supported types are: %s",
                ex.getContentType(), supportedTypes);
    }

    private String buildMissingParameterMessage(MissingServletRequestParameterException ex) {
        return String.format("Required request parameter '%s' for method parameter type %s is not present",
                ex.getParameterName(), ex.getParameterType());
    }

    private String buildNoHandlerFoundMessage(NoHandlerFoundException ex) {
        return String.format("No handler found for %s %s", ex.getHttpMethod(), ex.getRequestURL());
    }

    private String buildArgumentTypeMismatchMessage(MethodArgumentTypeMismatchException ex) {
        return String.format("The parameter '%s' of value '%s' could not be converted to type '%s'",
                ex.getName(), ex.getValue(), ex.getRequiredType().getSimpleName());
    }

    private ValidationErrorDto mapFieldError(FieldError fieldError) {
        return ValidationErrorDto.builder()
                .field(fieldError.getField())
                .message(fieldError.getDefaultMessage())
                .rejectedValue(fieldError.getRejectedValue())
                .build();
    }

    private ResponseEntity<Object> createErrorResponseWithValidationErrors(HttpStatus status, ErrorCode errorCode,
            String message, WebRequest request, List<ValidationErrorDto> validationErrors) {
        ErrorDto errorDto = buildErrorDto(status, errorCode, message, request, validationErrors);
        return new ResponseEntity<>(errorDto, status);
    }

    private ResponseEntity<ErrorDto> createErrorResponse(HttpStatus status, ErrorCode errorCode, String message,
            WebRequest request) {
        ErrorDto errorDto = buildErrorDto(status, errorCode, message, request, null);
        return new ResponseEntity<>(errorDto, status);
    }

    private ResponseEntity<Object> createObjectErrorResponse(HttpStatus status, ErrorCode errorCode, String message,
            WebRequest request) {
        ErrorDto errorDto = buildErrorDto(status, errorCode, message, request, null);
        return new ResponseEntity<>(errorDto, status);
    }

    private ErrorDto buildErrorDto(HttpStatus status, ErrorCode errorCode, String message, WebRequest request,
            List<ValidationErrorDto> validationErrors) {
        return ErrorDto.builder()
                .status(status.value())
                .timestamp(Instant.now().toString())
                .code(errorCode.name())
                .message(message)
                .path(extractPath(request))
                .traceId(extractTraceId())
                .errors(validationErrors)
                .build();
    }

    private String extractPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }

    private String extractTraceId() {
        return tracer.currentSpan() != null ? tracer.currentSpan().context().traceId() : null;
    }
}
