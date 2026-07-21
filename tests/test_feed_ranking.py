from main import auto_flag_content, rank_posts_for_feed


def test_rank_posts_prefers_engagement_and_recent_content():
    posts = [
        {
            "id": "old",
            "content": "Old post",
            "likes": 1,
            "comments": 0,
            "shares": 0,
            "created_at": "2024-01-01T00:00:00Z",
            "flagged": False,
        },
        {
            "id": "hot",
            "content": "Popular post",
            "likes": 42,
            "comments": 15,
            "shares": 8,
            "created_at": "2024-02-20T10:00:00Z",
            "flagged": False,
        },
        {
            "id": "spam",
            "content": "Spam and phishing attempt",
            "likes": 3,
            "comments": 1,
            "shares": 0,
            "created_at": "2024-02-21T12:00:00Z",
            "flagged": False,
        },
    ]

    ranked = rank_posts_for_feed(posts)

    assert [post["id"] for post in ranked[:2]] == ["hot", "old"]
    assert all(post["id"] != "spam" for post in ranked)


def test_auto_flag_detects_keywords_and_actions():
    flagged = auto_flag_content("This is a scam and phishing attempt", action="spam")

    assert flagged["flagged"] is True
    assert "keyword" in flagged["reasons"]
    assert flagged["severity"] == "high"
