package io.github.andrehsvictor.memorix.authservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import io.github.andrehsvictor.memorix.authservice.domain.Provider;
import io.github.andrehsvictor.memorix.authservice.domain.ProviderName;
import io.github.andrehsvictor.memorix.authservice.domain.User;
import io.github.andrehsvictor.memorix.authservice.domain.UserProvider;

public interface UserProviderRepository extends JpaRepository<UserProvider, Object> {

    Optional<UserProvider> findByUserAndProvider(User user, Provider provider);

    @Query("SELECT up FROM UserProvider up WHERE up.user.id = :userId AND up.provider.name = :providerName")
    Optional<UserProvider> findByUserIdAndProviderName(@Param("userId") UUID userId, @Param("providerName") ProviderName providerName);

    @Query("SELECT up FROM UserProvider up WHERE up.providerUserId = :providerUserId AND up.provider.name = :providerName")
    Optional<UserProvider> findByProviderUserIdAndProviderName(@Param("providerUserId") String providerUserId, @Param("providerName") ProviderName providerName);

    List<UserProvider> findByUser(User user);

    @Query("SELECT up FROM UserProvider up WHERE up.user.id = :userId")
    List<UserProvider> findByUserId(@Param("userId") UUID userId);

    List<UserProvider> findByProvider(Provider provider);

    @Query("SELECT up FROM UserProvider up WHERE up.provider.name = :providerName")
    List<UserProvider> findByProviderName(@Param("providerName") ProviderName providerName);

    @Query("SELECT COUNT(up) > 0 FROM UserProvider up WHERE up.user.id = :userId AND up.provider.name = :providerName")
    boolean existsByUserIdAndProviderName(@Param("userId") UUID userId, @Param("providerName") ProviderName providerName);

    @Query("SELECT COUNT(up) > 0 FROM UserProvider up WHERE up.providerUserId = :providerUserId AND up.provider.name = :providerName")
    boolean existsByProviderUserIdAndProviderName(@Param("providerUserId") String providerUserId, @Param("providerName") ProviderName providerName);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserProvider up WHERE up.user.id = :userId AND up.provider.name = :providerName")
    void deleteByUserIdAndProviderName(@Param("userId") UUID userId, @Param("providerName") ProviderName providerName);

    @Query("SELECT COUNT(up) FROM UserProvider up WHERE up.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(up) FROM UserProvider up WHERE up.provider.name = :providerName")
    long countByProviderName(@Param("providerName") ProviderName providerName);
}
