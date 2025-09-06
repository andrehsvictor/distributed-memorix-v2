INSERT INTO authority (name, description) VALUES
    ('ROLE_ROOT', 'Root role with all permissions'),
    ('ROLE_ADMIN', 'Administrator role with elevated permissions'),
    ('ROLE_USER', 'Standard user role with limited permissions');

INSERT INTO authority (name, description) VALUES
    ('profile', 'Access to user profile information'),
    ('email', 'Access to user email address'),
    ('openid', 'OpenID Connect authentication'),
    ('offline_access', 'Access to refresh tokens'),
    ('deck.read', 'Read access to decks'),
    ('deck.write', 'Write access to decks'),
    ('deck.delete', 'Delete access to decks'),
    ('card.read', 'Read access to cards'),
    ('card.write', 'Write access to cards'),
    ('card.delete', 'Delete access to cards'),
    ('review.read', 'Read access to reviews'),
    ('review.write', 'Permission to review cards');