import unittest

from fastapi.testclient import TestClient

import main


class AdminApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(main.app)

    def test_admin_metrics_include_analytics_fields(self) -> None:
        response = self.client.get('/api/admin/metrics')
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn('metrics', payload)
        metrics = payload['metrics']
        self.assertIn('online_users', metrics)
        self.assertIn('ad_revenue', metrics)
        self.assertIn('region_distribution', metrics)
        self.assertIn('flagged_reports', metrics)

    def test_moderation_actions_require_admin_headers(self) -> None:
        response = self.client.post('/api/admin/posts/seed-post-2/approve')
        self.assertEqual(response.status_code, 403)


if __name__ == '__main__':
    unittest.main()
