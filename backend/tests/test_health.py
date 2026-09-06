def test_health_check_endpoint(client):
    """Test that the /health endpoint reports healthy status, database connected, and storage ready."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "peblo-tv-mini-api"
    assert data["database"] == "connected"
    assert data["storage"] == "ready"
