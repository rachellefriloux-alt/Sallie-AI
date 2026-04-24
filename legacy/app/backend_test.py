#!/usr/bin/env python3
"""
Sallie v5.4.2 Backend API Test Suite
Tests all backend endpoints as specified in the review request
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Backend URL from frontend environment
BACKEND_URL = "https://trusting-satoshi-9.preview.emergentagent.com/api"

class SallieAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str, response_time: float = 0):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details} ({response_time:.2f}s)")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None) -> tuple:
        """Make HTTP request and measure response time"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        start_time = time.time()
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            response_time = time.time() - start_time
            return response, response_time
        except Exception as e:
            response_time = time.time() - start_time
            return None, response_time, str(e)
    
    def test_health_check(self):
        """Test 1: Health Check - GET /api/"""
        print("\n=== Testing Health Check ===")
        response, response_time = self.make_request("GET", "/")
        
        if response is None:
            self.log_test("Health Check", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                expected_fields = ["name", "version", "status", "systems"]
                if all(field in data for field in expected_fields):
                    self.log_test("Health Check", True, f"System operational - {data.get('name')} v{data.get('version')}", response_time)
                    return True
                else:
                    self.log_test("Health Check", False, f"Missing expected fields in response: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("Health Check", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_user_registration(self):
        """Test 2: User Registration - POST /api/auth/register"""
        print("\n=== Testing User Registration ===")
        
        # Use realistic test data
        test_user = {
            "email": "sarah.johnson@sallie.ai",
            "password": "SecurePass123!",
            "name": "Sarah Johnson"
        }
        
        response, response_time = self.make_request("POST", "/auth/register", test_user)
        
        if response is None:
            self.log_test("User Registration", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "token" in data and "user" in data:
                    self.auth_token = data["token"]
                    self.user_id = data["user"]["id"]
                    self.log_test("User Registration", True, f"User registered successfully - ID: {self.user_id}", response_time)
                    return True
                else:
                    self.log_test("User Registration", False, f"Missing token or user in response: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("User Registration", False, "Invalid JSON response", response_time)
        else:
            # Check if user already exists
            if response.status_code == 400 and "already registered" in response.text:
                self.log_test("User Registration", True, "User already exists (expected for repeated tests)", response_time)
                return True
            else:
                self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_user_login(self):
        """Test 3: User Login - POST /api/auth/login"""
        print("\n=== Testing User Login ===")
        
        credentials = {
            "email": "sarah.johnson@sallie.ai",
            "password": "SecurePass123!"
        }
        
        response, response_time = self.make_request("POST", "/auth/login", credentials)
        
        if response is None:
            self.log_test("User Login", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "token" in data and "user" in data:
                    self.auth_token = data["token"]
                    self.user_id = data["user"]["id"]
                    self.log_test("User Login", True, f"Login successful - Token received", response_time)
                    return True
                else:
                    self.log_test("User Login", False, f"Missing token or user in response: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("User Login", False, "Invalid JSON response", response_time)
        else:
            self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_get_user_info(self):
        """Test 4: Get User Info - GET /api/auth/me"""
        print("\n=== Testing Get User Info ===")
        
        if not self.auth_token:
            self.log_test("Get User Info", False, "No auth token available", 0)
            return False
            
        response, response_time = self.make_request("GET", "/auth/me")
        
        if response is None:
            self.log_test("Get User Info", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                expected_fields = ["id", "email", "name", "created_at"]
                if all(field in data for field in expected_fields):
                    self.log_test("Get User Info", True, f"User info retrieved - {data.get('name')} ({data.get('email')})", response_time)
                    return True
                else:
                    self.log_test("Get User Info", False, f"Missing expected fields: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("Get User Info", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Get User Info", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_limbic_state(self):
        """Test 5: Limbic State - GET /api/limbic"""
        print("\n=== Testing Limbic State ===")
        
        if not self.auth_token:
            self.log_test("Limbic State", False, "No auth token available", 0)
            return False
            
        response, response_time = self.make_request("GET", "/limbic")
        
        if response is None:
            self.log_test("Limbic State", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                expected_fields = ["trust", "warmth", "arousal", "valence", "posture"]
                if all(field in data for field in expected_fields):
                    posture = data.get('posture', 'Unknown')
                    trust = data.get('trust', 0)
                    warmth = data.get('warmth', 0)
                    self.log_test("Limbic State", True, f"Limbic state retrieved - Posture: {posture}, Trust: {trust}%, Warmth: {warmth}%", response_time)
                    return True
                else:
                    self.log_test("Limbic State", False, f"Missing expected fields: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("Limbic State", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Limbic State", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_stats(self):
        """Test 6: Stats - GET /api/stats"""
        print("\n=== Testing User Stats ===")
        
        if not self.auth_token:
            self.log_test("User Stats", False, "No auth token available", 0)
            return False
            
        response, response_time = self.make_request("GET", "/stats")
        
        if response is None:
            self.log_test("User Stats", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                expected_fields = ["messages", "memories", "projects", "integrations"]
                if all(field in data for field in expected_fields):
                    stats_summary = f"Messages: {data.get('messages', 0)}, Memories: {data.get('memories', 0)}, Projects: {data.get('projects', 0)}, Integrations: {data.get('integrations', 0)}"
                    self.log_test("User Stats", True, f"Stats retrieved - {stats_summary}", response_time)
                    return True
                else:
                    self.log_test("User Stats", False, f"Missing expected fields: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("User Stats", False, "Invalid JSON response", response_time)
        else:
            self.log_test("User Stats", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_chat_functionality(self):
        """Test 7: Chat Functionality - POST /api/chat"""
        print("\n=== Testing Chat Functionality ===")
        
        if not self.auth_token:
            self.log_test("Chat Send Message", False, "No auth token available", 0)
            return False
            
        chat_message = {
            "content": "Hello Sallie, tell me about yourself and your capabilities as a cognitive partner"
        }
        
        response, response_time = self.make_request("POST", "/chat", chat_message)
        
        if response is None:
            self.log_test("Chat Send Message", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                expected_fields = ["message", "internal_monologue", "limbic_state"]
                if all(field in data for field in expected_fields):
                    message_content = data.get("message", {}).get("content", "")[:100] + "..."
                    self.log_test("Chat Send Message", True, f"Chat response received - {message_content}", response_time)
                    return True
                else:
                    self.log_test("Chat Send Message", False, f"Missing expected fields: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("Chat Send Message", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Chat Send Message", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_chat_history(self):
        """Test 8: Chat History - GET /api/chat/history"""
        print("\n=== Testing Chat History ===")
        
        if not self.auth_token:
            self.log_test("Chat History", False, "No auth token available", 0)
            return False
            
        response, response_time = self.make_request("GET", "/chat/history")
        
        if response is None:
            self.log_test("Chat History", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    message_count = len(data)
                    self.log_test("Chat History", True, f"Chat history retrieved - {message_count} messages", response_time)
                    return True
                else:
                    self.log_test("Chat History", False, f"Expected list, got: {type(data)}", response_time)
            except json.JSONDecodeError:
                self.log_test("Chat History", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Chat History", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_tools_list(self):
        """Test 9: Tools List - GET /api/tools"""
        print("\n=== Testing Tools List ===")
        
        response, response_time = self.make_request("GET", "/tools", headers={})
        
        if response is None:
            self.log_test("Tools List", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    tool_count = len(data)
                    categories = set(tool.get('category', 'Unknown') for tool in data)
                    self.log_test("Tools List", True, f"Tools retrieved - {tool_count} tools in {len(categories)} categories", response_time)
                    return True
                else:
                    self.log_test("Tools List", False, f"Expected non-empty list, got: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("Tools List", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Tools List", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_tools_filtered(self):
        """Test 10: Tools Filtered - GET /api/tools?category=Create"""
        print("\n=== Testing Tools Filtered ===")
        
        response, response_time = self.make_request("GET", "/tools?category=Create", headers={})
        
        if response is None:
            self.log_test("Tools Filtered", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    create_tools = [tool for tool in data if tool.get('category') == 'Create']
                    if len(create_tools) == len(data):
                        self.log_test("Tools Filtered", True, f"Filtered tools retrieved - {len(create_tools)} Create tools", response_time)
                        return True
                    else:
                        self.log_test("Tools Filtered", False, f"Filter not working properly - {len(create_tools)}/{len(data)} are Create tools", response_time)
                else:
                    self.log_test("Tools Filtered", False, f"Expected list, got: {type(data)}", response_time)
            except json.JSONDecodeError:
                self.log_test("Tools Filtered", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Tools Filtered", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_create_integration(self):
        """Test 11: Create Integration - POST /api/integrations"""
        print("\n=== Testing Create Integration ===")
        
        if not self.auth_token:
            self.log_test("Create Integration", False, "No auth token available", 0)
            return False
            
        integration_data = {
            "integration_type": "email",
            "credentials": {
                "email": "sarah.johnson@gmail.com",
                "password": "app_specific_password_123"
            }
        }
        
        response, response_time = self.make_request("POST", "/integrations", integration_data)
        
        if response is None:
            self.log_test("Create Integration", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                expected_fields = ["id", "user_id", "integration_type", "is_active"]
                if all(field in data for field in expected_fields):
                    integration_type = data.get('integration_type', 'Unknown')
                    self.log_test("Create Integration", True, f"Integration created - Type: {integration_type}, ID: {data.get('id')}", response_time)
                    return True
                else:
                    self.log_test("Create Integration", False, f"Missing expected fields: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("Create Integration", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Create Integration", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_get_integrations(self):
        """Test 12: Get Integrations - GET /api/integrations"""
        print("\n=== Testing Get Integrations ===")
        
        if not self.auth_token:
            self.log_test("Get Integrations", False, "No auth token available", 0)
            return False
            
        response, response_time = self.make_request("GET", "/integrations")
        
        if response is None:
            self.log_test("Get Integrations", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    integration_count = len(data)
                    types = [integration.get('integration_type', 'Unknown') for integration in data]
                    self.log_test("Get Integrations", True, f"Integrations retrieved - {integration_count} integrations: {', '.join(types)}", response_time)
                    return True
                else:
                    self.log_test("Get Integrations", False, f"Expected list, got: {type(data)}", response_time)
            except json.JSONDecodeError:
                self.log_test("Get Integrations", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Get Integrations", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def test_convergence(self):
        """Test 13: Convergence - POST /api/convergence"""
        print("\n=== Testing Convergence ===")
        
        if not self.auth_token:
            self.log_test("Convergence", False, "No auth token available", 0)
            return False
            
        convergence_data = {
            "answers": [
                {"question": "What drives your passion in life?", "answer": "Creating meaningful connections and helping others grow"},
                {"question": "How do you handle challenges?", "answer": "I approach them with curiosity and persistence, viewing them as opportunities to learn"}
            ]
        }
        
        response, response_time = self.make_request("POST", "/convergence", convergence_data)
        
        if response is None:
            self.log_test("Convergence", False, "Request failed - connection error", response_time)
            return False
            
        if response.status_code == 200:
            try:
                data = response.json()
                if "message" in data and "completed" in data.get("message", "").lower():
                    self.log_test("Convergence", True, f"Convergence completed successfully", response_time)
                    return True
                else:
                    self.log_test("Convergence", False, f"Unexpected response: {data}", response_time)
            except json.JSONDecodeError:
                self.log_test("Convergence", False, "Invalid JSON response", response_time)
        else:
            self.log_test("Convergence", False, f"HTTP {response.status_code}: {response.text}", response_time)
        return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Sallie v5.4.2 Backend API Test Suite")
        print(f"🔗 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_user_registration,
            self.test_user_login,
            self.test_get_user_info,
            self.test_limbic_state,
            self.test_stats,
            self.test_chat_functionality,
            self.test_chat_history,
            self.test_tools_list,
            self.test_tools_filtered,
            self.test_create_integration,
            self.test_get_integrations,
            self.test_convergence
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Exception occurred - {str(e)}")
                failed += 1
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        # Detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['details']} ({result['response_time']:.2f}s)")
        
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = SallieAPITester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)