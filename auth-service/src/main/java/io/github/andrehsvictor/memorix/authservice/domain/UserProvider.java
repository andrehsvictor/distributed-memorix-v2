package io.github.andrehsvictor.memorix.authservice.domain;

import java.io.Serializable;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@IdClass(UserProviderId.class)
@EqualsAndHashCode(of = { "user", "provider" })
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "user", "provider" })
@Table(name = "user_provider")
public class UserProvider implements Serializable {

    private static final long serialVersionUID = -5604372063819112722L;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "provider_id")
    private Provider provider;

    private String providerUserId;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

}

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = { "user", "provider" })
class UserProviderId implements Serializable {

    private static final long serialVersionUID = 123456789L;

    private User user;
    private Provider provider;

}
