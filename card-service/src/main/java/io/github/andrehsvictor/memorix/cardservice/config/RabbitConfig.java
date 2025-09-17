package io.github.andrehsvictor.memorix.cardservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@EnableRabbit
@Configuration
public class RabbitConfig {

    @Bean
    Queue deckDeletedQueue() {
        return QueueBuilder
                .durable("deck.deleted")
                .withArgument("x-dead-letter-exchange", "deck.dlx")
                .withArgument("x-dead-letter-routing-key", "deck.deleted.dlq")
                .withArgument("x-message-ttl", 300000)
                .build();
    }

    @Bean
    Queue deckDeletedDlq() {
        return QueueBuilder.durable("deck.deleted.dlq").build();
    }

    @Bean
    Exchange deckDlxExchange() {
        return ExchangeBuilder.directExchange("deck.dlx").durable(true).build();
    }

    @Bean
    Exchange deckExchange() {
        return ExchangeBuilder.directExchange("deck.exchange").durable(true).build();
    }

    @Bean
    Binding bindingDeckDeleted(Queue deckDeletedQueue, Exchange deckExchange) {
        return BindingBuilder.bind(deckDeletedQueue).to(deckExchange).with("deck.deleted").noargs();
    }

    @Bean
    Binding bindingDeckDeletedDlq(Queue deckDeletedDlq, Exchange deckDlxExchange) {
        return BindingBuilder.bind(deckDeletedDlq).to(deckDlxExchange).with("deck.deleted.dlq").noargs();
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
