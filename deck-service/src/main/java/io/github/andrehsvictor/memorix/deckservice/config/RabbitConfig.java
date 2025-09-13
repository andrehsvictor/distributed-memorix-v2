package io.github.andrehsvictor.memorix.deckservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String DECK_EXCHANGE = "deck.ex";
    public static final String DECK_DELETED_QUEUE = "deck.deleted";
    public static final String DECK_DELETED_ROUTING_KEY = "deck.deleted";
    public static final String DECK_DLX_EXCHANGE = "deck.dlx";
    public static final String DECK_DLX_QUEUE = "deck.dlx.queue";

    @Bean
    TopicExchange deckExchange() {
        return ExchangeBuilder
                .topicExchange(DECK_EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    DirectExchange deckDlxExchange() {
        return ExchangeBuilder
                .directExchange(DECK_DLX_EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    Queue deckDeletedQueue() {
        return QueueBuilder
                .durable(DECK_DELETED_QUEUE)
                .withArgument("x-dead-letter-exchange", DECK_DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "failed")
                .build();
    }

    @Bean
    Queue deckDlxQueue() {
        return QueueBuilder
                .durable(DECK_DLX_QUEUE)
                .build();
    }

    @Bean
    Binding deckDeletedBinding() {
        return BindingBuilder
                .bind(deckDeletedQueue())
                .to(deckExchange())
                .with(DECK_DELETED_ROUTING_KEY);
    }

    @Bean
    Binding deckDlxBinding() {
        return BindingBuilder
                .bind(deckDlxQueue())
                .to(deckDlxExchange())
                .with("failed");
    }
    
}