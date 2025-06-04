package com.chunaudis.image_toolkit.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange-name}")
    private String imageProcessingExchangeName;

    @Value("${app.rabbitmq.queues.bg-removal.name}")
    private String bgRemovalQueueName;

    @Value("${app.rabbitmq.queues.bg-removal.routing-key}")
    private String bgRemovalRoutingKey;

    @Value("${app.rabbitmq.queues.upscaling.name}")
    private String upscalingQueueName;

    @Value("${app.rabbitmq.queues.upscaling.routing-key}")
    private String upscalingRoutingKey;

    @Value("${app.rabbitmq.queues.enlarge.name}")
    private String enlargeQueueName;

    @Value("${app.rabbitmq.queues.enlarge.routing-key}")
    private String enlargeRoutingKey;

    // --- Queue, Exchange, Binding ---

    @Bean
    TopicExchange imageProcessingExchange() {
        return new TopicExchange(imageProcessingExchangeName);
    }

    @Bean
    Queue backgroundRemovalQueue() {
        return QueueBuilder.durable(bgRemovalQueueName).build();
    }

    @Bean
    Queue upscalingQueue() {
        return QueueBuilder.durable(upscalingQueueName).build();
    }

    @Bean
    Binding backgroundRemovalBinding(Queue backgroundRemovalQueue, TopicExchange imageProcessingExchange) {
        return BindingBuilder.bind(backgroundRemovalQueue)
                .to(imageProcessingExchange)
                .with(bgRemovalRoutingKey);
    }

    @Bean
    Binding upscalingBinding(Queue upscalingQueue, TopicExchange imageProcessingExchange) {
        return BindingBuilder.bind(upscalingQueue)
                .to(imageProcessingExchange)
                .with(upscalingRoutingKey);
    }

    @Bean
    Queue enlargeQueue() {
        return QueueBuilder.durable(enlargeQueueName).build();
    }

    @Bean
    Binding enlargeBinding(Queue enlargeQueue, TopicExchange imageProcessingExchange) {
        return BindingBuilder.bind(enlargeQueue)
                .to(imageProcessingExchange)
                .with(enlargeRoutingKey);
    }

    // --- Message converter (JSON) ---

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}