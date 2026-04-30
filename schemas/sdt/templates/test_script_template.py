"""
测试套件模板

此模板展示如何将手工测试案例转换为 pytest 自动化测试脚本

关联手工案例：TC-XXX
功能模块：{{module_name}}
"""
import pytest
from typing import Dict, Any, List


class Test{{ModuleName}}:
    """
    {{module_name}} 功能测试套件

    此类包含所有与 {{module_name}} 相关的自动化测试案例，
    每个测试方法对应一个或多个手工测试案例。

    手工案例来源：manual-cases.json
    测试要点来源：test-points.md
    """

    @pytest.mark.P0
    @pytest.mark.parametrize("test_data", [
        {
            "case_id": "TC-001",
            "description": "正常场景 - 用户使用正确凭据登录",
            "input": {
                "username": "testuser",
                "password": "Test123456"
            },
            "expected": {
                "status_code": 200,
                "response_code": 0,
                "data": {
                    "username": "testuser",
                    "login_status": "success"
                }
            }
        }
    ])
    def test_user_login_success(self, api_client, test_data: Dict[str, Any]):
        """
        测试用户成功登录

        关联手工案例：TC-001
        功能描述：验证用户能够使用正确的用户名和密码成功登录系统
        优先级：P0
        """
        response = api_client.post(
            "/api/login",
            json=test_data["input"]
        )

        assert response.status_code == test_data["expected"]["status_code"], \
            f"预期状态码 {test_data['expected']['status_code']}, 实际 {response.status_code}"

        response_data = response.json()
        assert response_data["code"] == test_data["expected"]["response_code"], \
            f"响应 code 不匹配: {response_data}"
        assert response_data["data"]["username"] == test_data["expected"]["data"]["username"]
        assert response_data["data"]["login_status"] == test_data["expected"]["data"]["login_status"]

    @pytest.mark.P0
    @pytest.mark.parametrize("test_data", [
        {
            "case_id": "TC-003",
            "description": "异常场景 - 使用错误密码登录",
            "input": {
                "username": "testuser",
                "password": "WrongPassword123"
            },
            "expected": {
                "status_code": 200,
                "response_code": 1001,
                "message": "用户名或密码错误"
            }
        }
    ])
    def test_user_login_wrong_password(self, api_client, test_data: Dict[str, Any]):
        """
        测试用户使用错误密码登录

        关联手工案例：TC-003
        功能描述：验证使用错误密码登录时系统返回正确的错误提示
        优先级：P0
        """
        response = api_client.post(
            "/api/login",
            json=test_data["input"]
        )

        assert response.status_code == test_data["expected"]["status_code"]

        response_data = response.json()
        assert response_data["code"] == test_data["expected"]["response_code"], \
            f"预期错误码 {test_data['expected']['response_code']}, 实际 {response_data.get('code')}"
        assert test_data["expected"]["message"] in response_data.get("message", "")

    @pytest.mark.P1
    @pytest.mark.parametrize("test_data", [
        {
            "case_id": "TC-002",
            "description": "边界值 - 用户名超过最大长度",
            "input": {
                "username": "a" * 33,
                "password": "Test123456"
            },
            "expected": {
                "status_code": 400,
                "message": "用户名长度不能超过32个字符"
            }
        },
        {
            "case_id": "TC-002b",
            "description": "边界值 - 用户名为最大长度32字符",
            "input": {
                "username": "a" * 32,
                "password": "Test123456"
            },
            "expected": {
                "status_code": 200,
                "response_code": 0
            }
        }
    ])
    def test_username_length_boundary(self, api_client, test_data: Dict[str, Any]):
        """
        测试用户名长度边界

        关联手工案例：TC-002
        功能描述：验证用户名边界值输入时的系统行为（最大长度验证）
        优先级：P1
        """
        response = api_client.post(
            "/api/login",
            json=test_data["input"]
        )

        assert response.status_code == test_data["expected"]["status_code"], \
            f"状态码不匹配: {response.status_code}"

        if test_data["expected"]["status_code"] == 400:
            response_data = response.json()
            assert test_data["expected"]["message"] in response_data.get("message", "")

    @pytest.mark.P0
    def test_user_logout_success(self, api_client):
        """
        测试用户登出功能

        关联手工案例：TC-004
        功能描述：验证用户能够成功登出系统
        优先级：P0
        """
        login_response = api_client.post(
            "/api/login",
            json={"username": "testuser", "password": "Test123456"}
        )
        assert login_response.status_code == 200

        token = login_response.json().get("data", {}).get("token")

        logout_response = api_client.post(
            "/api/logout",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert logout_response.status_code == 200
        assert logout_response.json()["code"] == 0

    @pytest.mark.P1
    @pytest.mark.parametrize("test_data", [
        {
            "case_id": "TC-005",
            "description": "异常场景 - 用户不存在",
            "input": {
                "username": "nonexistent_user",
                "password": "Test123456"
            },
            "expected": {
                "status_code": 200,
                "response_code": 1002,
                "message": "用户不存在"
            }
        },
        {
            "case_id": "TC-006",
            "description": "异常场景 - 用户名为空",
            "input": {
                "username": "",
                "password": "Test123456"
            },
            "expected": {
                "status_code": 400,
                "message": "用户名不能为空"
            }
        },
        {
            "case_id": "TC-007",
            "description": "异常场景 - 密码为空",
            "input": {
                "username": "testuser",
                "password": ""
            },
            "expected": {
                "status_code": 400,
                "message": "密码不能为空"
            }
        }
    ])
    def test_login_error_scenarios(self, api_client, test_data: Dict[str, Any]):
        """
        测试登录异常场景

        关联手工案例：TC-005, TC-006, TC-007
        功能描述：验证各种异常输入时系统的错误处理
        优先级：P1
        """
        response = api_client.post(
            "/api/login",
            json=test_data["input"]
        )

        assert response.status_code == test_data["expected"]["status_code"]

        response_data = response.json()
        if "response_code" in test_data["expected"]:
            assert response_data["code"] == test_data["expected"]["response_code"]
        if "message" in test_data["expected"]:
            assert test_data["expected"]["message"] in response_data.get("message", "")


class Test{{ModuleName}}DataValidation:
    """
    {{module_name}} 数据验证测试套件

    包含数据格式、类型、范围等验证测试
    """

    @pytest.mark.P2
    @pytest.mark.parametrize("test_data", [
        {
            "description": "用户名包含特殊字符",
            "input": {"username": "user@#$%", "password": "Test123456"},
            "expected": {"status_code": 400}
        },
        {
            "description": "密码包含中文",
            "input": {"username": "testuser", "password": "测试密码123"},
            "expected": {"status_code": 400}
        },
        {
            "description": "超长用户名（100字符）",
            "input": {"username": "a" * 100, "password": "Test123456"},
            "expected": {"status_code": 400}
        },
        {
            "description": "超长密码（200字符）",
            "input": {"username": "testuser", "password": "a" * 200},
            "expected": {"status_code": 400}
        }
    ])
    def test_invalid_input_format(self, api_client, test_data: Dict[str, Any]):
        """
        测试无效输入格式

        关联手工案例：TC-xxx
        功能描述：验证系统正确拒绝无效格式的输入
        优先级：P2
        """
        response = api_client.post("/api/login", json=test_data["input"])
        assert response.status_code == test_data["expected"]["status_code"]


class Test{{ModuleName}}Performance:
    """
    {{module_name}} 性能测试套件

    包含响应时间、并发等性能相关测试
    """

    @pytest.mark.P1
    def test_login_response_time(self, api_client):
        """
        测试登录接口响应时间

        关联手工案例：TC-P-001
        功能描述：验证登录接口响应时间满足性能要求（P95 < 200ms）
        优先级：P1
        """
        import time

        start_time = time.time()
        response = api_client.post(
            "/api/login",
            json={"username": "testuser", "password": "Test123456"}
        )
        elapsed_ms = (time.time() - start_time) * 1000

        assert response.status_code == 200
        assert elapsed_ms < 200, f"响应时间 {elapsed_ms:.2f}ms 超过 200ms 阈值"

    @pytest.mark.P2
    @pytest.mark.parametrize("concurrent_users", [10, 50, 100])
    def test_login_concurrent_users(self, api_client, concurrent_users: int):
        """
        测试登录接口并发性能

        关联手工案例：TC-PC-001
        功能描述：验证系统在并发登录场景下的稳定性
        优先级：P2
        """
        import concurrent.futures

        def make_request():
            return api_client.post(
                "/api/login",
                json={"username": "testuser", "password": "Test123456"}
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = [executor.submit(make_request) for _ in range(concurrent_users)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        success_count = sum(1 for r in results if r.status_code == 200)
        assert success_count == concurrent_users, \
            f"期望 {concurrent_users} 个成功请求，实际 {success_count} 个"
