package io.github.andrehsvictor.memorix.deckservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@EnableRabbit
@Configuration
public class RabbitConfig {

    @Bean
    Queue cardCreatedQueue() {
        return QueueBuilder.durable("card.created")
                .withArgument("x-dead-letter-exchange", "card.dlx")
                .withArgument("x-dead-letter-routing-key", "card.created.dlq")
                .withArgument("x-message-ttl", 300000)
                .build();
    }

    @Bean
    Queue cardDeletedQueue() {
        return QueueBuilder.durable("card.deleted")
                .withArgument("x-dead-letter-exchange", "card.dlx")
                .withArgument("x-dead-letter-routing-key", "card.deleted.dlq")
                .withArgument("x-message-ttl", 300000)
                .build();
    }

    @Bean
    Exchange cardDlxExchange() {
        return ExchangeBuilder.directExchange("card.dlx").durable(true).build();
    }

    @Bean
    Queue cardCreatedDlq() {
        return QueueBuilder.durable("card.created.dlq").build();
    }

    @Bean
    Queue cardDeletedDlq() {
        return QueueBuilder.durable("card.deleted.dlq").build();
    }

    @Bean
    Exchange cardExchange() {
        return ExchangeBuilder.directExchange("card.exchange").durable(true).build();
    }

    @Bean
    Binding bindingCardCreated(Queue cardCreatedQueue, Exchange cardExchange) {
        return BindingBuilder.bind(cardCreatedQueue).to(cardExchange).with("card.created").noargs();
    }

    @Bean
    Binding bindingCardDeleted(Queue cardDeletedQueue, Exchange cardExchange) {
        return BindingBuilder.bind(cardDeletedQueue).to(cardExchange).with("card.deleted").noargs();
    }

    @Bean
    Binding bindingCardCreatedDlq(Queue cardCreatedDlq, Exchange cardDlxExchange) {
        return BindingBuilder.bind(cardCreatedDlq).to(cardDlxExchange).with("card.created.dlq").noargs();
    }

    @Bean
    Binding bindingCardDeletedDlq(Queue cardDeletedDlq, Exchange cardDlxExchange) {
        return BindingBuilder.bind(cardDeletedDlq).to(cardDlxExchange).with("card.deleted.dlq").noargs();
    }

}
