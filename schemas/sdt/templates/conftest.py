"""
pytest 配置文件

此文件提供测试所需的共享 fixtures 和配置
"""
import pytest
import os
import json
import logging
from typing import Dict, Any, List, Generator, Callable, Optional
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@pytest.fixture(scope="session")
def base_url() -> str:
    """
    获取测试环境基础 URL

    Returns:
        str: API 基础 URL
    """
    return os.getenv("TEST_BASE_URL", "http://localhost:8000")


@pytest.fixture(scope="session")
def api_timeout() -> int:
    """
    API 请求超时时间（秒）

    Returns:
        int: 超时时间
    """
    return int(os.getenv("API_TIMEOUT", "30"))


@pytest.fixture(scope="session")
def test_data_path() -> Path:
    """
    获取测试数据文件路径

    Returns:
        Path: manual-cases.json 文件路径
    """
    return Path(__file__).parent / "manual-cases.json"


@pytest.fixture(scope="session")
def test_cases(test_data_path: Path) -> Dict[str, Any]:
    """
    从 manual-cases.json 加载测试案例数据

    Args:
        test_data_path: 测试数据文件路径

    Returns:
        Dict: 测试案例数据
    """
    if not test_data_path.exists():
        pytest.fail(f"测试数据文件不存在: {test_data_path}")

    with open(test_data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    logger.info(f"加载测试案例: {data.get('test_suite', 'Unknown')}, 共 {len(data.get('test_cases', []))} 个案例")
    return data


@pytest.fixture
def test_case_by_id(test_cases: Dict[str, Any]) -> Callable[[str], Dict[str, Any]]:
    """
    根据 case_id 获取测试案例的工厂函数

    Args:
        test_cases: 测试案例数据

    Returns:
        Callable: 根据 ID 查找测试案例的函数
    """
    def _get_case(case_id: str) -> Dict[str, Any]:
        """根据 case_id 获取测试案例"""
        cases = test_cases.get("test_cases", [])
        for case in cases:
            if case.get("case_id") == case_id:
                return case
        pytest.fail(f"未找到测试案例: {case_id}")
    return _get_case


@pytest.fixture
def test_case_by_tag(test_cases: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    """
    按标签分组获取测试案例

    Args:
        test_cases: 测试案例数据

    Returns:
        Dict: {tag: [cases]}
    """
    tagged_cases: Dict[str, List[Dict[str, Any]]] = {}
    for case in test_cases.get("test_cases", []):
        for tag in case.get("tags", []):
            if tag not in tagged_cases:
                tagged_cases[tag] = []
            tagged_cases[tag].append(case)
    return tagged_cases


@pytest.fixture(scope="session")
def session_config() -> Dict[str, Any]:
    """
    Session 配置信息

    Returns:
        Dict: 配置信息
    """
    return {
        "env": os.getenv("TEST_ENV", "test"),
        "debug": os.getenv("DEBUG", "false").lower() == "true",
        "headless": os.getenv("HEADLESS", "true").lower() == "true",
    }


@pytest.fixture
def api_client(base_url: str, api_timeout: int):
    """
    API 客户端 fixture

    Args:
        base_url: API 基础 URL
        api_timeout: 请求超时

    Returns:
        APIClient: API 客户端实例
    """
    return APIClient(base_url=base_url, timeout=api_timeout)


import requests


class APIClient:
    """API 客户端封装"""

    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })

    def get(self, endpoint: str, **kwargs) -> requests.Response:
        """发送 GET 请求"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.get(url, timeout=self.timeout, **kwargs)
        logger.info(f"GET {url} -> {response.status_code}")
        return response

    def post(self, endpoint: str, json: Optional[Dict[str, Any]] = None, **kwargs) -> requests.Response:
        """发送 POST 请求"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.post(url, json=json, timeout=self.timeout, **kwargs)
        logger.info(f"POST {url} -> {response.status_code}")
        return response

    def put(self, endpoint: str, json: Optional[Dict[str, Any]] = None, **kwargs) -> requests.Response:
        """发送 PUT 请求"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.put(url, json=json, timeout=self.timeout, **kwargs)
        logger.info(f"PUT {url} -> {response.status_code}")
        return response

    def delete(self, endpoint: str, **kwargs) -> requests.Response:
        """发送 DELETE 请求"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.delete(url, timeout=self.timeout, **kwargs)
        logger.info(f"DELETE {url} -> {response.status_code}")
        return response


def pytest_configure(config):
    """pytest 配置钩子"""
    config.addinivalue_line(
        "markers", "smoke: 标记为冒烟测试用例"
    )
    config.addinivalue_line(
        "markers", "regression: 标记为回归测试用例"
    )
    config.addinivalue_line(
        "markers", "P0: P0 级别测试用例"
    )
    config.addinivalue_line(
        "markers", "P1: P1 级别测试用例"
    )
    config.addinivalue_line(
        "markers", "P2: P2 级别测试用例"
    )


def pytest_collection_modifyitems(items):
    """修改收集到的测试项"""
    for item in items:
        if "P0" in item.nodeid:
            item.add_marker(pytest.mark.P0)
        elif "P1" in item.nodeid:
            item.add_marker(pytest.mark.P1)
        elif "P2" in item.nodeid:
            item.add_marker(pytest.mark.P2)
