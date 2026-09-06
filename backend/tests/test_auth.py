from app.models import User
from app.auth.jwt import get_password_hash


def test_login_success(client, db_session):
    user = User(
        email="test_user@peblo.tv",
        hashed_password=get_password_hash("mypassword123"),
        role="editor"
    )
    db_session.add(user)
    db_session.commit()

    resp = client.post("/auth/login", json={"email": "test_user@peblo.tv", "password": "mypassword123"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "editor"
    assert data["email"] == "test_user@peblo.tv"


def test_login_invalid_password(client, db_session):
    user = User(
        email="test_user2@peblo.tv",
        hashed_password=get_password_hash("correctpass"),
        role="admin"
    )
    db_session.add(user)
    db_session.commit()

    resp = client.post("/auth/login", json={"email": "test_user2@peblo.tv", "password": "wrongpassword"})
    assert resp.status_code == 401
